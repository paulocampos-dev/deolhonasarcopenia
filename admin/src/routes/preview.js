const express = require('express');
const { requireAuth } = require('../lib/auth');
const { previewHome, previewExercicios, previewContato, previewDescubra, previewPost } = require('../lib/render');

const router = express.Router();

router.get('/paginas/home', requireAuth, (req, res) => {
    res.send(previewHome());
});

router.get('/paginas/exercicios', requireAuth, (req, res) => {
    res.send(previewExercicios());
});

router.get('/paginas/contato', requireAuth, (req, res) => {
    res.send(previewContato());
});

router.get('/paginas/descubra', requireAuth, (req, res) => {
    res.send(previewDescubra());
});

router.get('/posts/:id', requireAuth, (req, res) => {
    const html = previewPost(req.params.id);
    if (!html) return res.status(404).send('Post não encontrado.');
    res.send(html);
});

module.exports = router;
