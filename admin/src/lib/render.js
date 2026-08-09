const fs = require('fs');
const path = require('path');
const ejs = require('ejs');
const db = require('../db');
const { buildTailwindConfigJs } = require('./tailwind-tokens');

const TEMPLATES_DIR = path.join(__dirname, '..', '..', 'templates');
const SITE_ROOT = process.env.SITE_ROOT || path.join(__dirname, '..', '..', '..');
const PUBLIC_DIR = path.join(SITE_ROOT, 'public');

function renderTemplate(name, data) {
    const file = path.join(TEMPLATES_DIR, `${name}.ejs`);
    const source = fs.readFileSync(file, 'utf8');
    return ejs.render(source, data, { filename: file });
}

function writeFile(relPath, html) {
    const full = path.join(PUBLIC_DIR, relPath);
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, html);
}

function fallback(obj, defaults) {
    return { ...defaults, ...(obj || {}) };
}

const DEFAULT_SETTINGS = {
    brandText: 'De Olho Na Sarcopenia',
    footerOrgLine: 'USP Iniciativa de Saúde',
    contactEmail: 'contato@deolhonasarcopenia.com.br',
    instagramUrl: 'https://instagram.com/deolhonasarcopenia',
    instagramLabel: 'Instagram',
    logoImage: null,
    textScale: 'normal',
    primaryColor: '#243f20',
    secondaryColor: '#835500',
    tertiaryColor: '#75070c',
};

function getPublishedSettings() {
    const row = db.getSettings();
    return fallback(row ? row.published || row.draft : null, DEFAULT_SETTINGS);
}

function getDraftSettings() {
    const row = db.getSettings();
    return fallback(row ? row.draft : null, DEFAULT_SETTINGS);
}

function getPublishedPage(key, defaults) {
    const row = db.getPage(key);
    return fallback(row ? row.published || row.draft : null, defaults);
}

function getDraftPage(key, defaults) {
    const row = db.getPage(key);
    return fallback(row ? row.draft : null, defaults);
}

function publishedExercises() {
    return db
        .listExercises({ onlyPublished: true })
        .map((row) => ({ id: row.id, ...row.published }));
}

function publishedPosts() {
    return db
        .listPosts({ onlyPublished: true })
        .map((row) => ({ id: row.id, slug: row.slug, publishedAt: row.published_at, ...row.published }))
        .sort((a, b) => (a.date < b.date ? 1 : -1));
}

// ---- full site build (writes public/) ----

function renderAll() {
    const settings = getPublishedSettings();

    writeFile('assets/js/tailwind-config.js', buildTailwindConfigJs(settings));

    const homePage = getPublishedPage('home', {});
    writeFile('index.html', renderTemplate('home', { settings, page: homePage }));

    const exPage = getPublishedPage('exercicios', {});
    const exercises = publishedExercises();
    writeFile('exercicios/index.html', renderTemplate('exercicios', { settings, page: exPage, exercises }));

    const blogPage = getPublishedPage('blog', {});
    const posts = publishedPosts();
    writeFile('blog/index.html', renderTemplate('blog-index', { settings, page: blogPage, posts }));

    const contatoPage = getPublishedPage('contato', {});
    writeFile('contato/index.html', renderTemplate('contato', { settings, page: contatoPage }));
    writeFile('contato/obrigado/index.html', renderTemplate('contato-obrigado', { settings }));

    // Regenerate each published post's detail page, and remove any post
    // directory under public/blog/ that's no longer published (deleted or
    // unpublished), so stale pages don't linger.
    const blogDir = path.join(PUBLIC_DIR, 'blog');
    const currentSlugs = new Set(posts.map((p) => p.slug));
    if (fs.existsSync(blogDir)) {
        for (const entry of fs.readdirSync(blogDir, { withFileTypes: true })) {
            if (entry.isDirectory() && !currentSlugs.has(entry.name)) {
                fs.rmSync(path.join(blogDir, entry.name), { recursive: true, force: true });
            }
        }
    }
    for (const post of posts) {
        writeFile(`blog/${post.slug}/index.html`, renderTemplate('blog-post', { settings, post }));
    }

    writeSitemap([...['/', '/exercicios/', '/blog/', '/contato/'], ...posts.map((p) => `/blog/${p.slug}/`)]);
}

function writeSitemap(routes) {
    const base = 'https://deolhonasarcopenia.com.br';
    const body = routes.map((r) => `  <url><loc>${base}${r}</loc></url>`).join('\n');
    writeFile('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`);
}

// ---- previews (rendered on the fly, not written to disk) ----

function previewHome() {
    const settings = getDraftSettings();
    const page = getDraftPage('home', {});
    return renderTemplate('home', { settings, page });
}

function previewExercicios() {
    const settings = getDraftSettings();
    const page = getDraftPage('exercicios', {});
    const exercises = db.listExercises().map((row) => ({ id: row.id, ...(row.draft || row.published) }));
    return renderTemplate('exercicios', { settings, page, exercises });
}

function previewContato() {
    const settings = getDraftSettings();
    const page = getDraftPage('contato', {});
    return renderTemplate('contato', { settings, page });
}

function previewPost(id) {
    const settings = getDraftSettings();
    const row = db.getPost(id);
    if (!row) return null;
    const post = { id: row.id, slug: row.slug, ...row.draft };
    return renderTemplate('blog-post', { settings, post });
}

module.exports = {
    PUBLIC_DIR,
    renderAll,
    previewHome,
    previewExercicios,
    previewContato,
    previewPost,
    getPublishedSettings,
    getDraftSettings,
};

if (require.main === module) {
    renderAll();
    console.log(`Rendered site into ${PUBLIC_DIR}`);
}
