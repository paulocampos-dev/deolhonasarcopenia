const express = require('express');
const rateLimit = require('express-rate-limit');
const sanitizeHtml = require('sanitize-html');
const db = require('../db');
const { containsProfanity } = require('../lib/profanity');

const router = express.Router();

const commentLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 8,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Muitos comentários enviados. Tente novamente mais tarde.' },
});

function plainText(value, maxLength) {
    const stripped = sanitizeHtml(value || '', { allowedTags: [], allowedAttributes: {} }).trim();
    return stripped.slice(0, maxLength);
}

function formatComment(row) {
    return {
        id: row.id,
        parentId: row.parent_id || null,
        authorName: row.author_name || 'Anônimo',
        body: row.body,
        createdAt: row.created_at,
        isAdmin: Boolean(row.is_admin),
    };
}

router.get('/:slug', (req, res) => {
    const post = db.getPostBySlug(req.params.slug);
    if (!post || post.status !== 'published') return res.status(404).json({ error: 'Post não encontrado.' });
    const comments = db.listApprovedCommentsForPost(post.id).map(formatComment);
    res.json({ comments });
});

router.post('/:slug', commentLimiter, (req, res) => {
    const post = db.getPostBySlug(req.params.slug);
    if (!post || post.status !== 'published') return res.status(404).json({ error: 'Post não encontrado.' });

    // Honeypot: real visitors never fill this hidden field.
    if (req.body.website) {
        return res.json({ ok: true, status: 'approved' });
    }

    const body = plainText(req.body.body, 2000);
    if (!body) {
        return res.status(400).json({ error: 'Escreva um comentário antes de enviar.' });
    }

    const authorName = plainText(req.body.authorName, 100) || null;
    const authorContact = plainText(req.body.authorContact, 200) || null;
    const status = containsProfanity(body) || containsProfanity(authorName) ? 'pending' : 'approved';

    // Only one level of nesting: replying to a reply attaches to that
    // reply's own top-level parent instead of stacking further.
    let parentId = null;
    if (req.body.parentId) {
        const parent = db.getComment(req.body.parentId);
        if (parent && parent.post_id === post.id) {
            parentId = parent.parent_id || parent.id;
        }
    }

    const id = db.createComment(post.id, { authorName, authorContact, body, status, parentId, isAdmin: false });

    if (status === 'approved') {
        const row = db.listApprovedCommentsForPost(post.id).find((c) => c.id === id);
        return res.json({ ok: true, status: 'approved', comment: formatComment(row) });
    }

    res.json({ ok: true, status: 'pending' });
});

module.exports = router;
