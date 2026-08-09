const COMBINING_MARKS_RE = new RegExp('[' + String.fromCharCode(0x0300) + '-' + String.fromCharCode(0x036f) + ']', 'g');

function slugify(text) {
    return String(text || '')
        .normalize('NFD')
        .replace(COMBINING_MARKS_RE, '') // strip accents (after NFD decomposition)
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 80);
}

function uniqueSlug(baseText, exists) {
    const base = slugify(baseText) || 'post';
    let candidate = base;
    let n = 2;
    while (exists(candidate)) {
        candidate = `${base}-${n}`;
        n += 1;
    }
    return candidate;
}

module.exports = { slugify, uniqueSlug };
