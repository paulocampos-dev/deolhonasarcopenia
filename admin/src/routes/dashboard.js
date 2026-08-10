const express = require('express');
const db = require('../db');
const { requireAuth } = require('../lib/auth');

const router = express.Router();

router.get('/', requireAuth, (req, res) => {
    res.render('dashboard', {
        exerciseCount: db.listExercises().length,
        postCount: db.listPosts().length,
        pendingCommentCount: db.countPendingComments(),
    });
});

module.exports = router;
