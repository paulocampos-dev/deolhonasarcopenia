const express = require('express');
const db = require('../db');
const { requireAuth } = require('../lib/auth');
const { setFlash } = require('../lib/flash');
const { renderAll } = require('../lib/render');

const router = express.Router();

const PAGE_TITLES = {
    home: 'Página Inicial',
    exercicios: 'Página de Exercícios',
    contato: 'Página de Contato',
};

const FIELDS_BY_KEY = {
    home: [
        'eyebrow',
        'h1Prefix',
        'h1Highlight',
        'heroParagraph',
        'heroImage',
        'heroImageAlt',
        'ctaPrimaryLabel',
        'ctaSecondaryLabel',
        'badgeTitle',
        'badgeSubtitle',
        'aboutHeading',
        'aboutParagraph1',
        'aboutParagraph2',
        'aboutImage',
        'aboutImageAlt',
        'helpHeading',
        'helpSubheading',
        'card1Title',
        'card1Description',
        'card1Cta',
        'card2Title',
        'card2Description',
        'card2Cta',
        'card3Title',
        'card3Description',
        'card3Cta',
    ],
    exercicios: ['heading', 'warningText'],
    contato: ['heading', 'introParagraph', 'decorativeImage', 'decorativeImageAlt'],
};

function readForm(key, body) {
    const fields = {};
    for (const name of FIELDS_BY_KEY[key]) {
        fields[name] = (body[name] || '').trim();
    }
    return fields;
}

router.get('/:key', requireAuth, (req, res) => {
    const key = req.params.key;
    if (!FIELDS_BY_KEY[key]) return res.status(404).send('Página não encontrada.');
    const row = db.getPage(key);
    res.render('page-editor', {
        key,
        title: PAGE_TITLES[key],
        page: row.draft,
        isPublished: Boolean(row.published),
    });
});

router.post('/:key', requireAuth, (req, res) => {
    const key = req.params.key;
    if (!FIELDS_BY_KEY[key]) return res.status(404).send('Página não encontrada.');
    db.savePageDraft(key, readForm(key, req.body));
    setFlash(req, 'success', 'Rascunho salvo.');
    res.redirect(`/admin/paginas/${key}`);
});

router.post('/:key/publicar', requireAuth, (req, res) => {
    const key = req.params.key;
    if (!FIELDS_BY_KEY[key]) return res.status(404).send('Página não encontrada.');
    db.savePageDraft(key, readForm(key, req.body));
    db.publishPage(key);
    renderAll();
    setFlash(req, 'success', 'Página publicada! O site já está atualizado.');
    res.redirect(`/admin/paginas/${key}`);
});

module.exports = router;
