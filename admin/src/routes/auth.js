const express = require('express');
const { checkCredentials, loginLimiter } = require('../lib/auth');

const router = express.Router();

router.get('/login', (req, res) => {
    if (req.session.userId) return res.redirect('/admin');
    res.render('login', { error: null });
});

router.post('/login', loginLimiter, (req, res) => {
    const { username, password } = req.body;
    const user = checkCredentials(username || '', password || '');
    if (!user) {
        return res.status(401).render('login', { error: 'Usuário ou senha incorretos.' });
    }
    req.session.regenerate((err) => {
        if (err) {
            return res.status(500).render('login', { error: 'Erro ao entrar. Tente novamente.' });
        }
        req.session.userId = user.id;
        req.session.username = user.username;
        res.redirect('/admin');
    });
});

router.post('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/admin/login');
    });
});

module.exports = router;
