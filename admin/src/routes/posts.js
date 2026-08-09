const express = require('express');
const sanitizeHtml = require('sanitize-html');
const db = require('../db');
const { requireAuth } = require('../lib/auth');
const { setFlash } = require('../lib/flash');
const { renderAll } = require('../lib/render');
const { slugify, uniqueSlug } = require('../lib/slug');

const router = express.Router();

const SANITIZE_OPTIONS = {
    allowedTags: ['p', 'br', 'strong', 'em', 'b', 'i', 'u', 'h2', 'h3', 'ul', 'ol', 'li', 'a', 'img', 'blockquote'],
    allowedAttributes: {
        a: ['href', 'target', 'rel'],
        img: ['src', 'alt'],
    },
    allowedSchemes: ['http', 'https', 'mailto'],
    transformTags: {
        a: sanitizeHtml.simpleTransform('a', { rel: 'noopener noreferrer', target: '_blank' }),
    },
};

function readForm(body) {
    return {
        title: (body.title || '').trim(),
        author: (body.author || '').trim(),
        date: (body.date || '').trim(),
        coverImage: body.coverImage ? body.coverImage.trim() : '',
        coverImageAlt: (body.coverImageAlt || '').trim(),
        excerpt: (body.excerpt || '').trim(),
        bodyHtml: sanitizeHtml(body.bodyHtml || '', SANITIZE_OPTIONS),
    };
}

router.get('/', requireAuth, (req, res) => {
    res.render('posts-list', { posts: db.listPosts() });
});

router.get('/novo', requireAuth, (req, res) => {
    res.render('post-editor', {
        post: {
            title: '',
            author: '',
            date: new Date().toISOString().slice(0, 10),
            coverImage: '',
            coverImageAlt: '',
            excerpt: '',
            bodyHtml: '',
        },
        slug: '',
        id: null,
        isPublished: false,
    });
});

router.post('/', requireAuth, (req, res) => {
    const fields = readForm(req.body);
    const slug = uniqueSlug(fields.title, (candidate) => db.slugExists(candidate));
    const id = db.createPost(slug, fields);
    setFlash(req, 'success', 'Post criado como rascunho.');
    res.redirect(`/admin/posts/${id}`);
});

router.get('/:id', requireAuth, (req, res) => {
    const row = db.getPost(req.params.id);
    if (!row) return res.status(404).send('Post não encontrado.');
    res.render('post-editor', { post: row.draft, slug: row.slug, id: row.id, isPublished: row.status === 'published' });
});

router.post('/:id', requireAuth, (req, res) => {
    const row = db.getPost(req.params.id);
    if (!row) return res.status(404).send('Post não encontrado.');
    const fields = readForm(req.body);
    let slug = slugify(req.body.slug) || row.slug;
    if (slug !== row.slug && db.slugExists(slug, row.id)) {
        slug = uniqueSlug(slug, (candidate) => db.slugExists(candidate, row.id));
    }
    db.updatePostDraft(row.id, slug, fields);
    setFlash(req, 'success', 'Rascunho salvo.');
    res.redirect(`/admin/posts/${row.id}`);
});

router.post('/:id/publicar', requireAuth, (req, res) => {
    const row = db.getPost(req.params.id);
    if (!row) return res.status(404).send('Post não encontrado.');
    const fields = readForm(req.body);
    let slug = slugify(req.body.slug) || row.slug;
    if (slug !== row.slug && db.slugExists(slug, row.id)) {
        slug = uniqueSlug(slug, (candidate) => db.slugExists(candidate, row.id));
    }
    db.updatePostDraft(row.id, slug, fields);
    db.publishPost(row.id);
    renderAll();
    setFlash(req, 'success', 'Post publicado! O site já está atualizado.');
    res.redirect(`/admin/posts/${row.id}`);
});

router.post('/:id/despublicar', requireAuth, (req, res) => {
    db.unpublishPost(req.params.id);
    renderAll();
    setFlash(req, 'success', 'Post despublicado. Ele não aparece mais no site.');
    res.redirect('/admin/posts');
});

router.post('/:id/excluir', requireAuth, (req, res) => {
    db.deletePost(req.params.id);
    renderAll();
    setFlash(req, 'success', 'Post excluído.');
    res.redirect('/admin/posts');
});

module.exports = router;
