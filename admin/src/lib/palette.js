const { TonalPalette, argbFromHex, hexFromArgb, Hct } = require('@material/material-color-utilities');

const HEX_RE = /^#[0-9a-fA-F]{6}$/;

function safeHex(hex, fallback) {
    return HEX_RE.test(hex || '') ? hex : fallback;
}

// Simple readable-text heuristic: light text on darker/more saturated
// colors, dark text on light ones.
function onColorFor(hex) {
    const tone = Hct.fromInt(argbFromHex(hex)).tone;
    return tone < 60 ? '#ffffff' : '#000000';
}

// Derives the full set of MD3 "fixed"/"container" tokens for one brand
// color from a single seed hex, using the same tone mapping the original
// heritage_harvest palette itself was built from (verified against the
// site's original hand-picked values - tones 90/80/10/30 reproduce them
// exactly given the same seed).
function paletteTokens(prefix, seedHex, { includeSurfaceTint = false } = {}) {
    const palette = TonalPalette.fromInt(argbFromHex(seedHex));
    const tone = (t) => hexFromArgb(palette.tone(t));
    const tokens = {
        [prefix]: seedHex,
        [`on-${prefix}`]: onColorFor(seedHex),
        // Unlike the standard MD3 "light container" role, this design uses
        // -container as a darker hover/border shade close to the base color
        // (verified against how bg-primary-container/border-primary-container
        // are actually used in the templates - a hover-darken, not a pale fill).
        [`${prefix}-container`]: tone(30),
        [`on-${prefix}-container`]: tone(95),
        [`${prefix}-fixed`]: tone(90),
        [`${prefix}-fixed-dim`]: tone(80),
        [`on-${prefix}-fixed`]: tone(10),
        [`on-${prefix}-fixed-variant`]: tone(30),
    };
    if (includeSurfaceTint) {
        tokens['surface-tint'] = tone(40);
        tokens['inverse-primary'] = tone(80);
    }
    return { tokens, palette };
}

const DEFAULT_PRIMARY = '#243f20';
const DEFAULT_SECONDARY = '#835500';
const DEFAULT_TERTIARY = '#75070c';

function buildDynamicColors({ primaryColor, secondaryColor, tertiaryColor } = {}) {
    const primary = safeHex(primaryColor, DEFAULT_PRIMARY);
    const secondary = safeHex(secondaryColor, DEFAULT_SECONDARY);
    const tertiary = safeHex(tertiaryColor, DEFAULT_TERTIARY);

    const primaryResult = paletteTokens('primary', primary, { includeSurfaceTint: true });
    const secondaryResult = paletteTokens('secondary', secondary);
    const tertiaryResult = paletteTokens('tertiary', tertiary);

    return {
        ...primaryResult.tokens,
        ...secondaryResult.tokens,
        ...tertiaryResult.tokens,
        // golden-orange shares the secondary hue at a brighter tone - used
        // for solid accent fills (badges, icon chips) across the site.
        'golden-orange': hexFromArgb(secondaryResult.palette.tone(70)),
    };
}

module.exports = { buildDynamicColors, DEFAULT_PRIMARY, DEFAULT_SECONDARY, DEFAULT_TERTIARY };
