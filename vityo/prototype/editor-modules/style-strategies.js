import { settingsFactoryTokens } from "./settings-tokens.js";

export const UI_STYLE_KEYS = Object.freeze({
  FLAT: "flat",
  DYNAMIC: "dynamic",
  GRID: "grid",
});

export const uiStyleOptionsList = Object.freeze([
  { key: UI_STYLE_KEYS.FLAT, label: "Flat" },
  { key: UI_STYLE_KEYS.DYNAMIC, label: "Dynamic" },
  { key: UI_STYLE_KEYS.GRID, label: "Grid" },
]);

const uiStyleStrategies = Object.freeze({
  [UI_STYLE_KEYS.FLAT]: Object.freeze({
    key: UI_STYLE_KEYS.FLAT,
    cssVars: Object.freeze({
      "--style-body-glow-left": "rgba(244, 199, 106, 0.025)",
      "--style-body-glow-right": "rgba(96, 165, 250, 0.02)",
      "--style-shell-overlay-top": "rgba(255, 255, 255, 0.008)",
      "--style-shell-overlay-bottom": "rgba(255, 255, 255, 0.002)",
      "--style-shell-blur": "0px",
      "--style-float-blur": "0px",
      "--style-shadow": "0 10px 28px rgba(0, 0, 0, 0.16)",
      "--style-transition-fast": "120ms",
      "--style-transition-medium": "150ms",
      "--style-transition-layout": "180ms",
      "--radius-ui": "10px",
      "--setting-control-radius": "8px",
      "--setting-pill-surface": "rgba(255, 255, 255, 0.03)",
      "--setting-pill-surface-hover": "rgba(255, 255, 255, 0.05)",
      "--setting-pill-border": "var(--line-strong)",
    }),
    settingsTokens: Object.freeze({
      cardPaddingX: "14px",
      cardPaddingY: "12px",
      sectionPaddingX: "12px",
      sectionPaddingY: "10px",
      sectionGap: "12px",
      rowGap: "10px",
      controlWidth: "168px",
      controlCompactWidth: "124px",
      dropdownRadius: "12px",
    }),
  }),
  [UI_STYLE_KEYS.DYNAMIC]: Object.freeze({
    key: UI_STYLE_KEYS.DYNAMIC,
    cssVars: Object.freeze({
      "--style-body-glow-left": "rgba(255, 138, 87, 0.09)",
      "--style-body-glow-right": "rgba(120, 212, 200, 0.07)",
      "--style-shell-overlay-top": "rgba(255, 255, 255, 0.022)",
      "--style-shell-overlay-bottom": "rgba(255, 255, 255, 0.008)",
      "--style-shell-blur": "16px",
      "--style-float-blur": "14px",
      "--style-shadow": "0 24px 64px rgba(0, 0, 0, 0.26)",
      "--style-transition-fast": "140ms",
      "--style-transition-medium": "180ms",
      "--style-transition-layout": "220ms",
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
    }),
    settingsTokens: Object.freeze({
      cardPaddingX: settingsFactoryTokens.cardPaddingX,
      cardPaddingY: settingsFactoryTokens.cardPaddingY,
      sectionPaddingX: settingsFactoryTokens.sectionPaddingX,
      sectionPaddingY: settingsFactoryTokens.sectionPaddingY,
      sectionGap: settingsFactoryTokens.sectionGap,
      rowGap: settingsFactoryTokens.rowGap,
      controlWidth: settingsFactoryTokens.controlWidth,
      controlCompactWidth: settingsFactoryTokens.controlCompactWidth,
      dropdownRadius: settingsFactoryTokens.dropdownRadius,
    }),
  }),
  [UI_STYLE_KEYS.GRID]: Object.freeze({
    key: UI_STYLE_KEYS.GRID,
    cssVars: Object.freeze({
      "--style-body-glow-left": "rgba(255, 138, 87, 0.06)",
      "--style-body-glow-right": "rgba(120, 212, 200, 0.045)",
      "--style-shell-overlay-top": "rgba(255, 255, 255, 0.018)",
      "--style-shell-overlay-bottom": "rgba(255, 255, 255, 0.01)",
      "--style-shell-blur": "16px",
      "--style-float-blur": "14px",
      "--style-shadow": "0 22px 58px rgba(0, 0, 0, 0.24)",
      "--style-transition-fast": "140ms",
      "--style-transition-medium": "180ms",
      "--style-transition-layout": "220ms",
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
      "--setting-pill-border": "var(--line)",
    }),
    settingsTokens: Object.freeze({
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
    }),
  }),
});

export function getUiStyleStrategy(key) {
  return uiStyleStrategies[key] ?? uiStyleStrategies[UI_STYLE_KEYS.GRID];
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
