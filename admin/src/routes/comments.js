const express = require('express');
const sanitizeHtml = require('sanitize-html');
const db = require('../db');
const { requireAuth } = require('../lib/auth');
const { setFlash } = require('../lib/flash');
const { getPublishedSettings } = require('../lib/render');

const router = express.Router();

function plainText(value, maxLength) {
    return sanitizeHtml(value || '', { allowedTags: [], allowedAttributes: {} }).trim().slice(0, maxLength);
}

router.get('/', requireAuth, (req, res) => {
    const all = db.listComments();
    const topLevel = all.filter((c) => !c.parent_id);
    const repliesByParent = {};
    all.filter((c) => c.parent_id).forEach((c) => {
        if (!repliesByParent[c.parent_id]) repliesByParent[c.parent_id] = [];
        repliesByParent[c.parent_id].push(c);
    });
    Object.values(repliesByParent).forEach((list) => list.sort((a, b) => (a.created_at < b.created_at ? -1 : 1)));

    res.render('comments-list', { topLevel, repliesByParent });
});

router.post('/:id/aprovar', requireAuth, (req, res) => {
    db.approveComment(req.params.id);
    setFlash(req, 'success', 'Comentário aprovado.');
    res.redirect('/admin/comentarios');
});

router.post('/:id/excluir', requireAuth, (req, res) => {
    db.deleteComment(req.params.id);
    setFlash(req, 'success', 'Comentário excluído.');
    res.redirect('/admin/comentarios');
});

router.post('/:id/responder', requireAuth, (req, res) => {
    const parent = db.getComment(req.params.id);
    if (!parent) return res.status(404).send('Comentário não encontrado.');

    const body = plainText(req.body.body, 2000);
    if (!body) {
        setFlash(req, 'error', 'Escreva uma resposta antes de enviar.');
        return res.redirect('/admin/comentarios');
    }

    const settings = getPublishedSettings();
    const parentId = parent.parent_id || parent.id; // keep replies to one level

    db.createComment(parent.post_id, {
        authorName: `Equipe ${settings.brandText}`,
        authorContact: null,
        body,
        status: 'approved',
        parentId,
        isAdmin: true,
    });
    setFlash(req, 'success', 'Resposta publicada.');
    res.redirect('/admin/comentarios');
});

module.exports = router;
