require('dotenv').config();
const path = require('path');
const fs = require('fs');
const express = require('express');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);

const db = require('./db');
const { doubleCsrfProtection, generateCsrfToken } = require('./lib/csrf');
const { flashMiddleware } = require('./lib/flash');

const app = express();
const isProd = process.env.NODE_ENV === 'production';
const PORT = process.env.PORT || 4100;

const dataDir = path.join(__dirname, '..', 'data');
fs.mkdirSync(dataDir, { recursive: true });

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '..', 'views'));
app.set('trust proxy', 1);

app.use(cookieParser());
app.use(
    session({
        store: new SQLiteStore({ dir: dataDir, db: 'sessions.db' }),
        name: isProd ? '__Host-dosa.sid' : 'dosa.sid',
        secret: process.env.SESSION_SECRET,
        resave: false,
        // CSRF tokens are tied to the session id (see lib/csrf.js), so the
        // session must already be persisted on the very first GET (e.g. the
        // login page) or the id changes between that request and the next
        // POST, and every first submission fails CSRF validation.
        saveUninitialized: true,
        cookie: {
            httpOnly: true,
            sameSite: 'lax',
            secure: isProd,
            maxAge: 12 * 60 * 60 * 1000, // 12h
        },
    })
);
app.use(express.urlencoded({ extended: false, limit: '2mb' }));
app.use(express.json({ limit: '2mb' }));
app.use(doubleCsrfProtection);
app.use((req, res, next) => {
    // The existing CSRF cookie (if any) is validated against the *current*
    // session id before being reused. That validation throws whenever the
    // session id just changed (session.regenerate() on login, destroy() on
    // logout, or the session simply expiring) - in all of those cases we
    // just want a fresh token for the new session, not a crashed request.
    try {
        res.locals.csrfToken = generateCsrfToken(req, res);
    } catch (err) {
        res.locals.csrfToken = generateCsrfToken(req, res, true);
    }
    next();
});
app.use(flashMiddleware);
app.use('/admin/static', express.static(path.join(__dirname, '..', 'public')));

// Ensure the initial admin account exists on boot (from env, only if the
// admin_users table is still empty - see db/index.js#ensureAdminUser).
db.ensureAdminUser(process.env.ADMIN_USERNAME, process.env.ADMIN_PASSWORD_HASH);

app.use('/admin', require('./routes/auth'));
app.use('/admin', require('./routes/dashboard'));
app.use('/admin/configuracoes', require('./routes/settings'));
app.use('/admin/paginas', require('./routes/pages'));
app.use('/admin/exercicios', require('./routes/exercises'));
app.use('/admin/posts', require('./routes/posts'));
app.use('/admin/upload', require('./routes/uploads'));
app.use('/admin/preview', require('./routes/preview'));

app.use((err, req, res, next) => {
    if (err && err.code === 'EBADCSRFTOKEN') {
        res.status(403);
        return res.send('Formulário expirado ou inválido. Volte e tente novamente.');
    }
    console.error(err);
    res.status(500).send('Erro interno. Tente novamente.');
});

app.listen(PORT, () => {
    console.log(`Admin app listening on :${PORT}`);
});
