const express = require('express');
const db = require('../db');
const { requireAuth } = require('../lib/auth');
const { setFlash } = require('../lib/flash');

const router = express.Router();

router.get('/', requireAuth, (req, res) => {
    res.render('comments-list', { comments: db.listComments() });
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

module.exports = router;
