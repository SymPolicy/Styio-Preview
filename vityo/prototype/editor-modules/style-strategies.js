import { settingsFactoryTokens } from "./settings-tokens.js";

export const UI_STYLE_KEYS = Object.freeze({
  GRID: "grid",
  EDITORIAL: "editorial",
});

export const uiStyleOptionsList = Object.freeze([
  { key: UI_STYLE_KEYS.GRID, label: "Grid" },
  { key: UI_STYLE_KEYS.EDITORIAL, label: "Editorial" },
]);

const baseStyleCssVars = Object.freeze({
  "--style-body-glow-left": "rgba(255, 138, 87, 0.09)",
  "--style-body-glow-right": "rgba(120, 212, 200, 0.07)",
  "--style-body-pattern-primary": "linear-gradient(transparent, transparent)",
  "--style-body-pattern-secondary": "linear-gradient(transparent, transparent)",
  "--style-shell-overlay-top": "rgba(255, 255, 255, 0.022)",
  "--style-shell-overlay-bottom": "rgba(255, 255, 255, 0.008)",
  "--style-shell-blur": "16px",
  "--style-float-blur": "14px",
  "--style-shadow": "0 24px 64px rgba(0, 0, 0, 0.26)",
  "--style-transition-fast": "140ms",
  "--style-transition-medium": "180ms",
  "--style-transition-layout": "220ms",
  "--style-shell-border-color": "var(--line)",
  "--style-shell-border-style": "solid",
  "--style-shell-outline": "rgba(255, 255, 255, 0.05)",
  "--style-card-border-style": "solid",
  "--style-card-surface": "rgba(255, 255, 255, 0.025)",
  "--style-card-surface-soft": "rgba(255, 255, 255, 0.018)",
  "--style-card-surface-strong": "rgba(255, 255, 255, 0.035)",
  "--style-card-border": "var(--line)",
  "--style-card-border-strong": "var(--line-strong)",
  "--style-control-surface": "rgba(255, 255, 255, 0.025)",
  "--style-control-surface-strong": "rgba(255, 255, 255, 0.03)",
  "--style-control-hover": "rgba(255, 255, 255, 0.04)",
  "--style-control-hover-strong": "rgba(255, 255, 255, 0.06)",
  "--style-tab-surface": "transparent",
  "--style-tab-hover-surface": "rgba(255, 255, 255, 0.018)",
  "--style-tab-active-surface": "rgba(255, 255, 255, 0.04)",
  "--style-tab-active-outline": "var(--line)",
  "--style-active-fill": "linear-gradient(135deg, var(--accent), var(--accent-3))",
  "--style-active-fill-hover": "linear-gradient(135deg, var(--accent-2), var(--accent))",
  "--style-active-ink": "#201713",
  "--style-active-shadow": "0 10px 24px rgba(0, 0, 0, 0.16)",
  "--style-action-fill": "linear-gradient(180deg, var(--accent), var(--accent-2))",
  "--style-action-fill-hover": "linear-gradient(180deg, var(--accent-2), var(--accent))",
  "--style-float-surface": "rgba(17, 20, 26, 0.96)",
  "--style-tree-hover": "rgba(255, 255, 255, 0.05)",
  "--style-tree-active": "rgba(255, 255, 255, 0.082)",
  "--style-editor-frame-shadow": "none",
  "--style-title-align": "center",
  "--style-title-transform": "none",
  "--style-head-justify": "center",
  "--style-tab-label-transform": "none",
  "--style-tab-label-spacing": "-0.01em",
  "--style-action-letter-spacing": "0",
  "--radius-ui": "12px",
  "--setting-control-radius": "10px",
  "--setting-pill-radius": "999px",
  "--style-action-radius": "999px",
  "--style-toggle-radius": "999px",
  "--style-toggle-thumb-radius": "999px",
  "--style-tab-group-radius": "999px",
  "--style-tab-item-radius": "999px",
  "--style-scroll-radius": "999px",
  "--style-indicator-radius": "999px",
  "--style-badge-radius": "999px",
  "--setting-pill-surface": "rgba(255, 255, 255, 0.05)",
  "--setting-pill-surface-hover": "rgba(255, 255, 255, 0.08)",
  "--setting-pill-border": "var(--line)",
  "--tree-action-surface": "var(--style-control-surface)",
  "--tree-action-surface-hover": "var(--style-control-hover)",
  "--tree-action-accent": "var(--style-active-fill)",
  "--tree-action-accent-hover": "var(--style-active-fill-hover)",
  "--tree-action-confirm": "linear-gradient(180deg, #ef6b6b, #d94a4a)",
  "--title-font-family": "var(--ui-font-family)",
  "--title-font-size": "24px",
  "--title-font-weight": "700",
  "--title-letter-spacing": "0.12em",
  "--title-glow-size": "18px",
  "--brand-color": "rgba(244, 199, 106, 0.96)",
  "--brand-glow": "rgba(244, 199, 106, 0.08)",
});

function createStyleStrategy(key, { cssVars = {}, settingsTokens = {} } = {}) {
  return Object.freeze({
    key,
    cssVars: Object.freeze({
      ...baseStyleCssVars,
      ...cssVars,
    }),
    settingsTokens: Object.freeze(settingsTokens),
  });
}

const structuredSettingsTokens = Object.freeze({
  cardPaddingX: settingsFactoryTokens.cardPaddingX,
  cardPaddingY: settingsFactoryTokens.cardPaddingY,
  sectionPaddingX: settingsFactoryTokens.sectionPaddingX,
  sectionPaddingY: settingsFactoryTokens.sectionPaddingY,
  sectionGap: settingsFactoryTokens.sectionGap,
  rowGap: settingsFactoryTokens.rowGap,
  controlWidth: settingsFactoryTokens.controlWidth,
  controlCompactWidth: settingsFactoryTokens.controlCompactWidth,
  dropdownRadius: "14px",
  pillRadius: "10px",
});

const uiStyleStrategies = Object.freeze({
  [UI_STYLE_KEYS.GRID]: createStyleStrategy(UI_STYLE_KEYS.GRID, {
    cssVars: {
      "--style-body-glow-left": "rgba(255, 138, 87, 0.06)",
      "--style-body-glow-right": "rgba(120, 212, 200, 0.045)",
      "--style-body-pattern-primary":
        "repeating-linear-gradient(to right, rgba(255, 255, 255, 0.028) 0 1px, transparent 1px 44px)",
      "--style-body-pattern-secondary":
        "repeating-linear-gradient(to bottom, rgba(255, 255, 255, 0.022) 0 1px, transparent 1px 44px)",
      "--style-shell-overlay-top": "rgba(255, 255, 255, 0.018)",
      "--style-shell-overlay-bottom": "rgba(255, 255, 255, 0.01)",
      "--style-shell-outline": "rgba(255, 255, 255, 0.08)",
      "--style-shadow": "0 22px 58px rgba(0, 0, 0, 0.24)",
      "--style-card-surface": "rgba(255, 255, 255, 0.03)",
      "--style-card-surface-soft": "rgba(255, 255, 255, 0.022)",
      "--style-card-surface-strong": "rgba(255, 255, 255, 0.04)",
      "--style-tab-surface": "var(--panel-2)",
      "--style-tab-hover-surface": "rgba(255, 255, 255, 0.032)",
      "--style-tab-active-surface": "rgba(255, 255, 255, 0.06)",
      "--style-active-shadow": "none",
      "--radius-ui": "12px",
      "--setting-control-radius": "10px",
      "--setting-pill-radius": "10px",
      "--style-action-radius": "10px",
      "--style-toggle-radius": "10px",
      "--style-toggle-thumb-radius": "8px",
      "--style-tab-group-radius": "12px",
      "--style-tab-item-radius": "10px",
      "--style-scroll-radius": "8px",
      "--style-indicator-radius": "5px",
      "--style-badge-radius": "8px",
      "--setting-pill-surface": "rgba(255, 255, 255, 0.045)",
      "--setting-pill-surface-hover": "rgba(255, 255, 255, 0.075)",
    },
    settingsTokens: structuredSettingsTokens,
  }),
  [UI_STYLE_KEYS.EDITORIAL]: createStyleStrategy(UI_STYLE_KEYS.EDITORIAL, {
    cssVars: {
      "--style-body-glow-left": "rgba(18, 14, 11, 0.16)",
      "--style-body-glow-right": "rgba(255, 240, 214, 0.01)",
      "--style-body-pattern-primary":
        "linear-gradient(180deg, transparent 0%, transparent 54%, rgba(6, 7, 9, 0.22) 74%, rgba(4, 5, 7, 0.54) 100%), radial-gradient(circle at 22% 116%, rgba(255, 244, 222, 0.045) 0%, transparent 28%), radial-gradient(circle at 78% 124%, rgba(255, 244, 222, 0.032) 0%, transparent 24%)",
      "--style-body-pattern-secondary":
        "linear-gradient(180deg, transparent 0%, transparent 50%, rgba(255, 248, 235, 0.01) 50%, rgba(255, 248, 235, 0.016) 100%), radial-gradient(circle, rgba(255, 255, 255, 0.022) 0.7px, transparent 1px) 0 0 / 12px 12px, repeating-linear-gradient(135deg, rgba(255, 248, 235, 0.01) 0 1px, transparent 1px 7px)",
      "--style-shell-overlay-top": "rgba(255, 248, 235, 0.02)",
      "--style-shell-overlay-bottom": "rgba(255, 248, 235, 0.008)",
      "--style-shell-blur": "10px",
      "--style-float-blur": "10px",
      "--style-shadow": "0 20px 52px rgba(0, 0, 0, 0.24)",
      "--style-shell-border-color": "rgba(223, 201, 171, 0.2)",
      "--style-shell-outline": "rgba(223, 201, 171, 0.12)",
      "--style-card-border": "rgba(223, 201, 171, 0.16)",
      "--style-card-border-strong": "rgba(239, 220, 193, 0.24)",
      "--style-card-surface": "rgba(255, 248, 235, 0.02)",
      "--style-card-surface-soft": "rgba(255, 248, 235, 0.015)",
      "--style-card-surface-strong": "rgba(255, 248, 235, 0.026)",
      "--style-control-surface": "rgba(255, 248, 235, 0.022)",
      "--style-control-surface-strong": "rgba(255, 248, 235, 0.028)",
      "--style-control-hover": "rgba(255, 248, 235, 0.045)",
      "--style-control-hover-strong": "rgba(255, 248, 235, 0.065)",
      "--style-tab-surface": "rgba(255, 248, 235, 0.014)",
      "--style-tab-hover-surface": "rgba(255, 248, 235, 0.026)",
      "--style-tab-active-surface": "rgba(228, 197, 146, 0.1)",
      "--style-active-fill":
        "linear-gradient(135deg, #ead4b0, #f7ebd8)",
      "--style-active-fill-hover":
        "linear-gradient(135deg, #f1dec1, #fbf1e3)",
      "--style-active-ink": "#241913",
      "--style-active-shadow": "none",
      "--style-action-fill":
        "linear-gradient(180deg, #ead4b0, #f7ebd8)",
      "--style-action-fill-hover":
        "linear-gradient(180deg, #f1dec1, #fbf1e3)",
      "--style-tree-hover": "rgba(255, 248, 235, 0.045)",
      "--style-tree-active": "rgba(228, 197, 146, 0.11)",
      "--radius-ui": "8px",
      "--setting-control-radius": "8px",
      "--setting-pill-radius": "8px",
      "--style-action-radius": "8px",
      "--style-toggle-radius": "8px",
      "--style-toggle-thumb-radius": "8px",
      "--style-tab-group-radius": "8px",
      "--style-tab-item-radius": "8px",
      "--style-scroll-radius": "6px",
      "--style-indicator-radius": "4px",
      "--style-badge-radius": "6px",
      "--setting-pill-surface": "rgba(228, 197, 146, 0.08)",
      "--setting-pill-surface-hover": "rgba(228, 197, 146, 0.12)",
      "--setting-pill-border": "rgba(228, 197, 146, 0.18)",
      "--editor-text-highlight": "#b1844d",
      "--glyph-color-hash": "#b1844d",
      "--glyph-color-at": "#b1844d",
      "--glyph-color-prompt": "#b1844d",
      "--glyph-color-pipe": "#b1844d",
      "--glyph-color-pipe-left": "#b1844d",
      "--glyph-color-arrow-right": "#b1844d",
      "--glyph-color-arrow-left": "#b1844d",
      "--glyph-color-double-arrow": "#b1844d",
      "--glyph-color-double-arrow-left": "#b1844d",
      "--glyph-color-define": "#b1844d",
      "--editor-block-bg": "rgba(54, 45, 37, 0.28)",
      "--editor-block-border": "rgba(239, 220, 193, 0.038)",
      "--editor-block-hash-bg": "rgba(50, 42, 35, 0.31)",
      "--editor-block-hash-border": "rgba(239, 220, 193, 0.044)",
      "--editor-block-at-bg": "rgba(52, 43, 36, 0.3)",
      "--editor-block-at-border": "rgba(239, 220, 193, 0.041)",
      "--editor-block-shadow":
        "inset 0 1px 0 rgba(255, 246, 230, 0.014), inset 0 7px 12px rgba(0, 0, 0, 0.1), inset 0 -12px 16px rgba(0, 0, 0, 0.22)",
      "--editor-block-overlay":
        "linear-gradient(180deg, rgba(255, 248, 235, 0.006) 0%, rgba(255, 248, 235, 0.002) 24%, rgba(0, 0, 0, 0.04) 100%)",
      "--editor-block-hash-overlay":
        "linear-gradient(180deg, rgba(255, 248, 235, 0.006) 0%, rgba(255, 248, 235, 0.002) 24%, rgba(0, 0, 0, 0.046) 100%)",
      "--editor-block-at-overlay":
        "linear-gradient(180deg, rgba(255, 248, 235, 0.006) 0%, rgba(255, 248, 235, 0.002) 24%, rgba(0, 0, 0, 0.045) 100%)",
      "--ui-font-family": "\"Avenir Next\", \"Source Sans 3\", \"IBM Plex Sans\", sans-serif",
      "--title-font-family": "\"Iowan Old Style\", \"Palatino Linotype\", \"Book Antiqua\", serif",
      "--title-font-size": "28px",
      "--title-font-weight": "620",
      "--title-letter-spacing": "0.05em",
      "--title-glow-size": "0px",
      "--brand-color": "#edd0a7",
      "--brand-glow": "transparent",
    },
    settingsTokens: {
      ...structuredSettingsTokens,
      dropdownRadius: "10px",
    },
  }),
});

const legacyUiStyleKeyMap = Object.freeze({
  carbon: UI_STYLE_KEYS.EDITORIAL,
});

export function getUiStyleStrategy(key) {
  const resolvedKey = legacyUiStyleKeyMap[key] ?? key;
  return uiStyleStrategies[resolvedKey] ?? uiStyleStrategies[UI_STYLE_KEYS.GRID];
}

export function createUiStyleFactory(key, baseTokens = settingsFactoryTokens) {
  const strategy = getUiStyleStrategy(key);
  return {
    key: strategy.key,
    cssVars: strategy.cssVars,
    settingsTokens: {
      ...baseTokens,
      ...strategy.settingsTokens,
    },
  };
}
