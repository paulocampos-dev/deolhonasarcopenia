const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const { requireAuth } = require('../lib/auth');
const { PUBLIC_DIR } = require('../lib/render');

const router = express.Router();

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 8 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        cb(null, /^image\//.test(file.mimetype));
    },
});

const UPLOAD_DIR = path.join(PUBLIC_DIR, 'assets', 'img', 'uploads');

router.post('/', requireAuth, upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'Envie um arquivo de imagem (JPG, PNG ou WEBP).' });
    }

    let image;
    try {
        image = sharp(req.file.buffer, { failOn: 'error' });
        var metadata = await image.metadata();
    } catch (err) {
        return res.status(400).json({ error: 'Arquivo inválido. Envie uma imagem real (JPG, PNG ou WEBP).' });
    }

    const hasAlpha = Boolean(metadata.hasAlpha);
    const ext = hasAlpha ? 'png' : 'jpg';
    const maxDimension = 1800;

    let pipeline = image.rotate().resize({
        width: maxDimension,
        height: maxDimension,
        fit: 'inside',
        withoutEnlargement: true,
    });
    pipeline = hasAlpha ? pipeline.png({ compressionLevel: 8 }) : pipeline.jpeg({ quality: 82 });

    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    const filename = `${Date.now()}-${crypto.randomBytes(4).toString('hex')}.${ext}`;
    try {
        await pipeline.toFile(path.join(UPLOAD_DIR, filename));
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Não foi possível processar a imagem.' });
    }

    res.json({ url: `/assets/img/uploads/${filename}` });
});

module.exports = router;
