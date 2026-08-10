const { doubleCsrf } = require('csrf-csrf');

const isProd = process.env.NODE_ENV === 'production';

const { generateToken, doubleCsrfProtection, invalidCsrfTokenError } = doubleCsrf({
    getSecret: () => process.env.SESSION_SECRET,
    getSessionIdentifier: (req) => req.session.id,
    cookieName: isProd ? '__Host-dosa.csrf' : 'dosa.csrf',
    cookieOptions: {
        sameSite: 'strict',
        path: '/',
        secure: isProd,
        httpOnly: true,
    },
    size: 32,
    ignoredMethods: ['GET', 'HEAD', 'OPTIONS'],
    // Header first (works for multipart/form-data uploads, parsed later by
    // multer at the route level, after this middleware already ran), body
    // field as a fallback for plain HTML form posts.
    // NOTE: the option is named getTokenFromRequest in csrf-csrf@3.x - a
    // wrong key here is silently ignored (falls back to header-only), which
    // breaks every plain <form> POST since none of them send that header.
    getTokenFromRequest: (req) => req.headers['x-csrf-token'] || (req.body && req.body._csrf),
    // The public comment API has no session to protect (anonymous visitors,
    // no login) - it has its own defenses (rate limit + honeypot) instead.
    skipCsrfProtection: (req) => req.path.startsWith('/api/comentarios'),
});

module.exports = { generateCsrfToken: generateToken, doubleCsrfProtection, invalidCsrfTokenError };
