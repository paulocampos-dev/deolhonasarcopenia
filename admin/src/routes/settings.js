const express = require('express');
const db = require('../db');
const { requireAuth } = require('../lib/auth');
const { setFlash } = require('../lib/flash');
const { renderAll } = require('../lib/render');
const { DEFAULT_PRIMARY, DEFAULT_SECONDARY, DEFAULT_TERTIARY } = require('../lib/palette');

const router = express.Router();

const TEXT_SCALES = [
    { value: 'normal', label: 'Normal' },
    { value: 'grande', label: 'Grande' },
    { value: 'extra_grande', label: 'Extra Grande' },
];

const HEX_RE = /^#[0-9a-fA-F]{6}$/;

function readHexColor(value, fallback) {
    return HEX_RE.test(value || '') ? value : fallback;
}

function readSettingsForm(body) {
    return {
        brandText: (body.brandText || '').trim(),
        footerOrgLine: (body.footerOrgLine || '').trim(),
        contactEmail: (body.contactEmail || '').trim(),
        instagramUrl: (body.instagramUrl || '').trim(),
        instagramLabel: (body.instagramLabel || '').trim(),
        logoImage: body.logoImage ? body.logoImage.trim() : null,
        textScale: ['normal', 'grande', 'extra_grande'].includes(body.textScale) ? body.textScale : 'normal',
        primaryColor: readHexColor(body.primaryColor, DEFAULT_PRIMARY),
        secondaryColor: readHexColor(body.secondaryColor, DEFAULT_SECONDARY),
        tertiaryColor: readHexColor(body.tertiaryColor, DEFAULT_TERTIARY),
    };
}

router.get('/', requireAuth, (req, res) => {
    const row = db.getSettings();
    // Merge in defaults for any keys missing from rows saved before a field
    // was added (e.g. existing sites upgrading to this version).
    const settings = {
        primaryColor: DEFAULT_PRIMARY,
        secondaryColor: DEFAULT_SECONDARY,
        tertiaryColor: DEFAULT_TERTIARY,
        ...row.draft,
    };
    res.render('settings', { settings, textScales: TEXT_SCALES, isPublished: Boolean(row.published) });
});

router.post('/', requireAuth, (req, res) => {
    db.saveSettingsDraft(readSettingsForm(req.body));
    setFlash(req, 'success', 'Rascunho salvo.');
    res.redirect('/admin/configuracoes');
});

router.post('/publicar', requireAuth, (req, res) => {
    db.saveSettingsDraft(readSettingsForm(req.body));
    db.publishSettings();
    renderAll();
    setFlash(req, 'success', 'Configurações publicadas! O site já está atualizado.');
    res.redirect('/admin/configuracoes');
});

module.exports = router;
