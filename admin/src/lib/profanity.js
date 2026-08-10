// Small, simple word list - not exhaustive. Comments matching any of these
// go to 'pending' instead of 'approved' so an admin can take a look before
// they show up publicly (see routes/public-comments.js).
const BLOCKED_WORDS = [
    'porra',
    'caralho',
    'merda',
    'buceta',
    'puta',
    'putinha',
    'foda-se',
    'fdp',
    'desgraça',
    'arrombado',
    'arrombada',
    'viado',
    'corno',
    'cornu',
    'imbecil',
    'idiota',
    'retardado',
    'vagabundo',
    'vagabunda',
    'fuck',
    'shit',
    'bitch',
    'asshole',
    'bastard',
    'cunt',
];

const BLOCKED_RE = new RegExp('\\b(' + BLOCKED_WORDS.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|') + ')\\b', 'i');

function containsProfanity(text) {
    return BLOCKED_RE.test(text || '');
}

module.exports = { containsProfanity };
