const bcrypt = require('bcryptjs');
const rateLimit = require('express-rate-limit');
const db = require('../db');

function requireAuth(req, res, next) {
    if (req.session && req.session.userId) return next();
    return res.redirect('/admin/login');
}

function checkCredentials(username, password) {
    const user = db.getAdminUserByUsername(username);
    if (!user) return null;
    const ok = bcrypt.compareSync(password, user.password_hash);
    return ok ? user : null;
}

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Muitas tentativas de login. Tente novamente em alguns minutos.',
});

module.exports = { requireAuth, checkCredentials, loginLimiter };
