const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '..', '..', 'data', 'content.db');

fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
db.exec(schema);

// Lightweight migration for columns added after a table already existed in
// deployed databases (CREATE TABLE IF NOT EXISTS above only helps on a
// fresh DB - it's a no-op against an existing "comments" table).
function ensureColumn(table, column, definition) {
    const cols = db.prepare(`PRAGMA table_info(${table})`).all();
    if (!cols.some((c) => c.name === column)) {
        db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
    }
}
ensureColumn('comments', 'parent_id', 'INTEGER REFERENCES comments(id) ON DELETE CASCADE');
ensureColumn('comments', 'is_admin', 'INTEGER NOT NULL DEFAULT 0');

function now() {
    return new Date().toISOString();
}

function parseRow(row) {
    if (!row) return null;
    return {
        ...row,
        draft: JSON.parse(row.draft_json),
        published: row.published_json ? JSON.parse(row.published_json) : null,
    };
}

// ---- settings (singleton) ----

function getSettings() {
    const row = db.prepare('SELECT * FROM settings WHERE id = 1').get();
    return parseRow(row);
}

function saveSettingsDraft(fields) {
    const existing = getSettings();
    const draftJson = JSON.stringify(fields);
    if (existing) {
        db.prepare('UPDATE settings SET draft_json = ?, updated_at = ? WHERE id = 1')
            .run(draftJson, now());
    } else {
        db.prepare(
            'INSERT INTO settings (id, draft_json, published_json, updated_at) VALUES (1, ?, ?, ?)'
        ).run(draftJson, draftJson, now());
    }
}

function publishSettings() {
    const existing = getSettings();
    if (!existing) return;
    db.prepare('UPDATE settings SET published_json = draft_json, published_at = ? WHERE id = 1').run(now());
}

// ---- pages (fixed keys: home, exercicios, contato) ----

function getPage(key) {
    const row = db.prepare('SELECT * FROM pages WHERE key = ?').get(key);
    return parseRow(row);
}

function savePageDraft(key, fields) {
    const existing = getPage(key);
    const draftJson = JSON.stringify(fields);
    if (existing) {
        db.prepare('UPDATE pages SET draft_json = ?, updated_at = ? WHERE key = ?').run(draftJson, now(), key);
    } else {
        db.prepare('INSERT INTO pages (key, draft_json, published_json, updated_at) VALUES (?, ?, ?, ?)').run(
            key,
            draftJson,
            draftJson,
            now()
        );
    }
}

function publishPage(key) {
    db.prepare('UPDATE pages SET published_json = draft_json, published_at = ? WHERE key = ?').run(now(), key);
}

// ---- exercises (collection) ----

function listExercises({ onlyPublished = false } = {}) {
    const rows = onlyPublished
        ? db.prepare("SELECT * FROM exercises WHERE status = 'published' ORDER BY sort_order ASC").all()
        : db.prepare('SELECT * FROM exercises ORDER BY sort_order ASC').all();
    return rows.map(parseRow);
}

function getExercise(id) {
    return parseRow(db.prepare('SELECT * FROM exercises WHERE id = ?').get(id));
}

function createExercise(fields) {
    const maxOrder = db.prepare('SELECT COALESCE(MAX(sort_order), -1) AS m FROM exercises').get().m;
    const draftJson = JSON.stringify(fields);
    const info = db
        .prepare('INSERT INTO exercises (sort_order, status, draft_json, created_at, updated_at) VALUES (?, ?, ?, ?, ?)')
        .run(maxOrder + 1, 'draft', draftJson, now(), now());
    return info.lastInsertRowid;
}

function updateExerciseDraft(id, fields) {
    db.prepare('UPDATE exercises SET draft_json = ?, updated_at = ? WHERE id = ?').run(
        JSON.stringify(fields),
        now(),
        id
    );
}

function publishExercise(id) {
    db.prepare(
        "UPDATE exercises SET published_json = draft_json, status = 'published', published_at = ? WHERE id = ?"
    ).run(now(), id);
}

function unpublishExercise(id) {
    db.prepare("UPDATE exercises SET status = 'draft' WHERE id = ?").run(id);
}

function deleteExercise(id) {
    db.prepare('DELETE FROM exercises WHERE id = ?').run(id);
}

function reorderExercises(orderedIds) {
    const stmt = db.prepare('UPDATE exercises SET sort_order = ? WHERE id = ?');
    const txn = db.transaction((ids) => {
        ids.forEach((id, index) => stmt.run(index, id));
    });
    txn(orderedIds);
}

// ---- posts (collection) ----

function listPosts({ onlyPublished = false } = {}) {
    const rows = onlyPublished
        ? db.prepare("SELECT * FROM posts WHERE status = 'published' ORDER BY published_at DESC").all()
        : db.prepare('SELECT * FROM posts ORDER BY created_at DESC').all();
    return rows.map(parseRow);
}

function getPost(id) {
    return parseRow(db.prepare('SELECT * FROM posts WHERE id = ?').get(id));
}

function getPostBySlug(slug) {
    return parseRow(db.prepare('SELECT * FROM posts WHERE slug = ?').get(slug));
}

function slugExists(slug, excludeId = null) {
    const row = excludeId
        ? db.prepare('SELECT id FROM posts WHERE slug = ? AND id != ?').get(slug, excludeId)
        : db.prepare('SELECT id FROM posts WHERE slug = ?').get(slug);
    return Boolean(row);
}

function createPost(slug, fields) {
    const draftJson = JSON.stringify(fields);
    const info = db
        .prepare('INSERT INTO posts (slug, status, draft_json, created_at, updated_at) VALUES (?, ?, ?, ?, ?)')
        .run(slug, 'draft', draftJson, now(), now());
    return info.lastInsertRowid;
}

function updatePostDraft(id, slug, fields) {
    db.prepare('UPDATE posts SET slug = ?, draft_json = ?, updated_at = ? WHERE id = ?').run(
        slug,
        JSON.stringify(fields),
        now(),
        id
    );
}

function publishPost(id) {
    db.prepare(
        "UPDATE posts SET published_json = draft_json, status = 'published', published_at = COALESCE(published_at, ?) WHERE id = ?"
    ).run(now(), id);
}

function unpublishPost(id) {
    db.prepare("UPDATE posts SET status = 'draft' WHERE id = ?").run(id);
}

function deletePost(id) {
    db.prepare('DELETE FROM posts WHERE id = ?').run(id);
}

// ---- comments ----

function createComment(postId, { authorName, authorContact, body, status, parentId, isAdmin }) {
    const info = db
        .prepare(
            'INSERT INTO comments (post_id, parent_id, author_name, author_contact, body, status, is_admin, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
        )
        .run(postId, parentId || null, authorName || null, authorContact || null, body, status, isAdmin ? 1 : 0, now());
    return info.lastInsertRowid;
}

function getComment(id) {
    return db.prepare('SELECT * FROM comments WHERE id = ?').get(id);
}

function listApprovedCommentsForPost(postId) {
    return db
        .prepare("SELECT * FROM comments WHERE post_id = ? AND status = 'approved' ORDER BY created_at ASC")
        .all(postId);
}

function listComments() {
    return db
        .prepare(
            `SELECT comments.*, posts.slug AS post_slug, posts.draft_json AS post_draft_json
             FROM comments JOIN posts ON posts.id = comments.post_id
             ORDER BY comments.created_at DESC`
        )
        .all()
        .map((row) => ({ ...row, post_title: JSON.parse(row.post_draft_json).title }));
}

function countPendingComments() {
    return db.prepare("SELECT COUNT(*) AS c FROM comments WHERE status = 'pending'").get().c;
}

function approveComment(id) {
    db.prepare("UPDATE comments SET status = 'approved' WHERE id = ?").run(id);
}

function deleteComment(id) {
    db.prepare('DELETE FROM comments WHERE id = ?').run(id);
}

// ---- admin users ----

function ensureAdminUser(username, passwordHash) {
    const count = db.prepare('SELECT COUNT(*) AS c FROM admin_users').get().c;
    if (count === 0 && username && passwordHash) {
        db.prepare('INSERT INTO admin_users (username, password_hash) VALUES (?, ?)').run(username, passwordHash);
    }
}

function getAdminUserByUsername(username) {
    return db.prepare('SELECT * FROM admin_users WHERE username = ?').get(username);
}

module.exports = {
    db,
    getSettings,
    saveSettingsDraft,
    publishSettings,
    getPage,
    savePageDraft,
    publishPage,
    listExercises,
    getExercise,
    createExercise,
    updateExerciseDraft,
    publishExercise,
    unpublishExercise,
    deleteExercise,
    reorderExercises,
    listPosts,
    getPost,
    getPostBySlug,
    slugExists,
    createPost,
    updatePostDraft,
    publishPost,
    unpublishPost,
    deletePost,
    createComment,
    getComment,
    listApprovedCommentsForPost,
    listComments,
    countPendingComments,
    approveComment,
    deleteComment,
    ensureAdminUser,
    getAdminUserByUsername,
};
