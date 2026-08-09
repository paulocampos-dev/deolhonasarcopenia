const express = require('express');
const db = require('../db');
const { requireAuth } = require('../lib/auth');
const { setFlash } = require('../lib/flash');
const { renderAll } = require('../lib/render');

const router = express.Router();

function readForm(body) {
    const steps = Array.isArray(body.steps) ? body.steps : body.steps ? [body.steps] : [];
    return {
        title: (body.title || '').trim(),
        image: body.image ? body.image.trim() : '',
        imageAlt: (body.imageAlt || '').trim(),
        itemsLabel: (body.itemsLabel || 'Itens Recomendados:').trim(),
        itemsIcon: (body.itemsIcon || 'fitness_center').trim(),
        steps: steps.map((s) => s.trim()).filter(Boolean),
    };
}

router.get('/', requireAuth, (req, res) => {
    const exercises = db.listExercises();
    res.render('exercises-list', { exercises });
});

router.get('/novo', requireAuth, (req, res) => {
    res.render('exercise-editor', {
        exercise: { title: '', image: '', imageAlt: '', itemsLabel: 'Itens Recomendados:', itemsIcon: 'fitness_center', steps: [''] },
        id: null,
        isPublished: false,
    });
});

router.post('/', requireAuth, (req, res) => {
    const id = db.createExercise(readForm(req.body));
    setFlash(req, 'success', 'Exercício criado como rascunho.');
    res.redirect(`/admin/exercicios/${id}`);
});

router.post('/reordenar', requireAuth, (req, res) => {
    const order = (req.body.order || '')
        .split(',')
        .map((s) => parseInt(s, 10))
        .filter((n) => !Number.isNaN(n));
    if (order.length > 0) {
        db.reorderExercises(order);
        renderAll();
    }
    res.redirect('/admin/exercicios');
});

router.get('/:id', requireAuth, (req, res) => {
    const row = db.getExercise(req.params.id);
    if (!row) return res.status(404).send('Exercício não encontrado.');
    const exercise = row.draft;
    if (!exercise.steps || exercise.steps.length === 0) exercise.steps = [''];
    res.render('exercise-editor', { exercise, id: row.id, isPublished: row.status === 'published' });
});

router.post('/:id', requireAuth, (req, res) => {
    const row = db.getExercise(req.params.id);
    if (!row) return res.status(404).send('Exercício não encontrado.');
    db.updateExerciseDraft(row.id, readForm(req.body));
    setFlash(req, 'success', 'Rascunho salvo.');
    res.redirect(`/admin/exercicios/${row.id}`);
});

router.post('/:id/publicar', requireAuth, (req, res) => {
    const row = db.getExercise(req.params.id);
    if (!row) return res.status(404).send('Exercício não encontrado.');
    db.updateExerciseDraft(row.id, readForm(req.body));
    db.publishExercise(row.id);
    renderAll();
    setFlash(req, 'success', 'Exercício publicado! O site já está atualizado.');
    res.redirect(`/admin/exercicios/${row.id}`);
});

router.post('/:id/despublicar', requireAuth, (req, res) => {
    db.unpublishExercise(req.params.id);
    renderAll();
    setFlash(req, 'success', 'Exercício despublicado. Ele não aparece mais no site.');
    res.redirect('/admin/exercicios');
});

router.post('/:id/excluir', requireAuth, (req, res) => {
    db.deleteExercise(req.params.id);
    renderAll();
    setFlash(req, 'success', 'Exercício excluído.');
    res.redirect('/admin/exercicios');
});

module.exports = router;
