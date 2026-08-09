function flashMiddleware(req, res, next) {
    res.locals.flash = (req.session && req.session.flash) || null;
    if (req.session) delete req.session.flash;
    next();
}

function setFlash(req, type, message) {
    req.session.flash = { type, message };
}

module.exports = { flashMiddleware, setFlash };
