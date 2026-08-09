// Shared design tokens for all pages, based on the "Heritage & Harvest"
// design system (see stitch_reference_information_system/heritage_harvest/DESIGN.md).
// Keep this file as the single source of truth for colors/type/spacing so the
// four pages stay visually consistent.
tailwind.config = {
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                "surface": "#f9f9f9",
                "surface-dim": "#dadada",
                "surface-bright": "#f9f9f9",
                "surface-container-lowest": "#ffffff",
                "surface-container-low": "#f3f3f4",
                "surface-container": "#eeeeee",
                "surface-container-high": "#e8e8e8",
                "surface-container-highest": "#e2e2e2",
                "on-surface": "#1a1c1c",
                "on-surface-variant": "#434840",
                "inverse-surface": "#2f3131",
                "inverse-on-surface": "#f0f1f1",
                "outline": "#73796f",
                "outline-variant": "#c3c8bd",
                "surface-tint": "#496643",
                "primary": "#243f20",
                "on-primary": "#ffffff",
                "primary-container": "#3a5635",
                "on-primary-container": "#aacaa0",
                "inverse-primary": "#afcfa5",
                "secondary": "#835500",
                "on-secondary": "#ffffff",
                "secondary-container": "#ffb957",
                "on-secondary-container": "#734a00",
                "tertiary": "#75070c",
                "on-tertiary": "#ffffff",
                "tertiary-container": "#962320",
                "on-tertiary-container": "#ffaca3",
                "error": "#ba1a1a",
                "on-error": "#ffffff",
                "error-container": "#ffdad6",
                "on-error-container": "#93000a",
                "primary-fixed": "#caecc0",
                "primary-fixed-dim": "#afcfa5",
                "on-primary-fixed": "#062106",
                "on-primary-fixed-variant": "#324d2d",
                "secondary-fixed": "#ffddb5",
                "secondary-fixed-dim": "#ffb957",
                "on-secondary-fixed": "#2a1800",
                "on-secondary-fixed-variant": "#633f00",
                "tertiary-fixed": "#ffdad6",
                "tertiary-fixed-dim": "#ffb4ac",
                "on-tertiary-fixed": "#410002",
                "on-tertiary-fixed-variant": "#8a1a19",
                "background": "#f9f9f9",
                "on-background": "#1a1c1c",
                "surface-variant": "#e2e2e2",
                "warm-sand": "#FEECAB",
                "on-surface-charcoal": "#221B00",
                "golden-orange": "#DF9E3E"
            },
            borderRadius: {
                "DEFAULT": "0.25rem",
                "lg": "0.5rem",
                "xl": "0.75rem",
                "full": "9999px"
            },
            spacing: {
                "stack-gap": "32px",
                "container-padding-desktop": "64px",
                "container-padding-mobile": "24px",
                "touch-target-min": "48px",
                "gutter": "24px",
                "unit": "8px",
                "stack-sm": "12px",
                "stack-md": "24px",
                "stack-lg": "48px",
                "container-max": "1200px",
                "margin-mobile": "16px",
                "base": "8px"
            },
            fontFamily: {
                "headline-lg-mobile": ["Plus Jakarta Sans"],
                "headline-lg": ["Plus Jakarta Sans"],
                "headline-md": ["Plus Jakarta Sans"],
                "display-lg": ["Plus Jakarta Sans"],
                "body-md": ["Plus Jakarta Sans"],
                "label-lg": ["Plus Jakarta Sans"],
                "label-md": ["Plus Jakarta Sans"],
                "label-sm": ["Plus Jakarta Sans"],
                "body-lg": ["Plus Jakarta Sans"]
            },
            fontSize: {
                "headline-lg-mobile": ["28px", { "lineHeight": "1.3", "fontWeight": "700" }],
                "headline-lg": ["32px", { "lineHeight": "1.3", "fontWeight": "700" }],
                "headline-md": ["24px", { "lineHeight": "1.4", "fontWeight": "600" }],
                "display-lg": ["48px", { "lineHeight": "1.2", "letterSpacing": "-0.02em", "fontWeight": "700" }],
                "body-md": ["18px", { "lineHeight": "1.6", "fontWeight": "400" }],
                "label-lg": ["16px", { "lineHeight": "1.2", "letterSpacing": "0.01em", "fontWeight": "600" }],
                "label-md": ["14px", { "lineHeight": "1.2", "fontWeight": "600" }],
                "label-sm": ["16px", { "lineHeight": "1.2", "fontWeight": "500" }],
                "body-lg": ["20px", { "lineHeight": "1.6", "fontWeight": "400" }]
            }
        }
    }
};
