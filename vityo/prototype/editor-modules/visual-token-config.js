const VISUAL_TOKEN_TARGETS = Object.freeze({
  ROOT: "root",
  SETTINGS: "settings",
});

const VISUAL_TOKEN_TYPES = Object.freeze({
  CSS_TEXT: "cssText",
  LENGTH: "length",
});

export const visualTokenDefinitions = Object.freeze([
  { key: "title.color", target: VISUAL_TOKEN_TARGETS.ROOT, cssVar: "--brand-color", type: VISUAL_TOKEN_TYPES.CSS_TEXT },
  { key: "title.glow", target: VISUAL_TOKEN_TARGETS.ROOT, cssVar: "--brand-glow", type: VISUAL_TOKEN_TYPES.CSS_TEXT },
  { key: "title.fontFamily", target: VISUAL_TOKEN_TARGETS.ROOT, cssVar: "--title-font-family", type: VISUAL_TOKEN_TYPES.CSS_TEXT },
  { key: "title.fontSize", target: VISUAL_TOKEN_TARGETS.ROOT, cssVar: "--title-font-size", type: VISUAL_TOKEN_TYPES.LENGTH },
  { key: "title.fontWeight", target: VISUAL_TOKEN_TARGETS.ROOT, cssVar: "--title-font-weight", type: VISUAL_TOKEN_TYPES.CSS_TEXT },
  { key: "title.letterSpacing", target: VISUAL_TOKEN_TARGETS.ROOT, cssVar: "--title-letter-spacing", type: VISUAL_TOKEN_TYPES.CSS_TEXT },
  { key: "title.glowSize", target: VISUAL_TOKEN_TARGETS.ROOT, cssVar: "--title-glow-size", type: VISUAL_TOKEN_TYPES.LENGTH },

  { key: "accent.primary", target: VISUAL_TOKEN_TARGETS.ROOT, cssVar: "--accent", type: VISUAL_TOKEN_TYPES.CSS_TEXT },
  { key: "accent.secondary", target: VISUAL_TOKEN_TARGETS.ROOT, cssVar: "--accent-2", type: VISUAL_TOKEN_TYPES.CSS_TEXT },
  { key: "accent.tertiary", target: VISUAL_TOKEN_TARGETS.ROOT, cssVar: "--accent-3", type: VISUAL_TOKEN_TYPES.CSS_TEXT },

  { key: "text.primary", target: VISUAL_TOKEN_TARGETS.ROOT, cssVar: "--text", type: VISUAL_TOKEN_TYPES.CSS_TEXT },
  { key: "text.muted", target: VISUAL_TOKEN_TARGETS.ROOT, cssVar: "--muted", type: VISUAL_TOKEN_TYPES.CSS_TEXT },

  { key: "radius.ui", target: VISUAL_TOKEN_TARGETS.ROOT, cssVar: "--radius-ui", type: VISUAL_TOKEN_TYPES.LENGTH },
  { key: "radius.control", target: VISUAL_TOKEN_TARGETS.ROOT, cssVar: "--setting-control-radius", type: VISUAL_TOKEN_TYPES.LENGTH },
  { key: "radius.pill", target: VISUAL_TOKEN_TARGETS.ROOT, cssVar: "--setting-pill-radius", type: VISUAL_TOKEN_TYPES.LENGTH },
  { key: "radius.action", target: VISUAL_TOKEN_TARGETS.ROOT, cssVar: "--style-action-radius", type: VISUAL_TOKEN_TYPES.LENGTH },
  { key: "radius.toggle", target: VISUAL_TOKEN_TARGETS.ROOT, cssVar: "--style-toggle-radius", type: VISUAL_TOKEN_TYPES.LENGTH },
  { key: "radius.toggleThumb", target: VISUAL_TOKEN_TARGETS.ROOT, cssVar: "--style-toggle-thumb-radius", type: VISUAL_TOKEN_TYPES.LENGTH },
  { key: "radius.tabGroup", target: VISUAL_TOKEN_TARGETS.ROOT, cssVar: "--style-tab-group-radius", type: VISUAL_TOKEN_TYPES.LENGTH },
  { key: "radius.tabItem", target: VISUAL_TOKEN_TARGETS.ROOT, cssVar: "--style-tab-item-radius", type: VISUAL_TOKEN_TYPES.LENGTH },
  { key: "radius.scroll", target: VISUAL_TOKEN_TARGETS.ROOT, cssVar: "--style-scroll-radius", type: VISUAL_TOKEN_TYPES.LENGTH },
  { key: "radius.indicator", target: VISUAL_TOKEN_TARGETS.ROOT, cssVar: "--style-indicator-radius", type: VISUAL_TOKEN_TYPES.LENGTH },
  { key: "radius.badge", target: VISUAL_TOKEN_TARGETS.ROOT, cssVar: "--style-badge-radius", type: VISUAL_TOKEN_TYPES.LENGTH },

  { key: "border.width", target: VISUAL_TOKEN_TARGETS.ROOT, cssVar: "--ui-border-width", type: VISUAL_TOKEN_TYPES.LENGTH },
  { key: "border.strongWidth", target: VISUAL_TOKEN_TARGETS.ROOT, cssVar: "--ui-border-width-strong", type: VISUAL_TOKEN_TYPES.LENGTH },
  { key: "border.dividerWidth", target: VISUAL_TOKEN_TARGETS.ROOT, cssVar: "--ui-divider-width", type: VISUAL_TOKEN_TYPES.LENGTH },
  { key: "border.color", target: VISUAL_TOKEN_TARGETS.ROOT, cssVar: "--line", type: VISUAL_TOKEN_TYPES.CSS_TEXT },
  { key: "border.strongColor", target: VISUAL_TOKEN_TARGETS.ROOT, cssVar: "--line-strong", type: VISUAL_TOKEN_TYPES.CSS_TEXT },

  { key: "shadow.card", target: VISUAL_TOKEN_TARGETS.ROOT, cssVar: "--style-shadow", type: VISUAL_TOKEN_TYPES.CSS_TEXT },

  { key: "surface.panel", target: VISUAL_TOKEN_TARGETS.ROOT, cssVar: "--panel", type: VISUAL_TOKEN_TYPES.CSS_TEXT },
  { key: "surface.panelSecondary", target: VISUAL_TOKEN_TARGETS.ROOT, cssVar: "--panel-2", type: VISUAL_TOKEN_TYPES.CSS_TEXT },
  { key: "surface.shell", target: VISUAL_TOKEN_TARGETS.ROOT, cssVar: "--shell-bg", type: VISUAL_TOKEN_TYPES.CSS_TEXT },
  { key: "surface.bodyGlow.left", target: VISUAL_TOKEN_TARGETS.ROOT, cssVar: "--style-body-glow-left", type: VISUAL_TOKEN_TYPES.CSS_TEXT },
  { key: "surface.bodyGlow.right", target: VISUAL_TOKEN_TARGETS.ROOT, cssVar: "--style-body-glow-right", type: VISUAL_TOKEN_TYPES.CSS_TEXT },
  { key: "surface.shellOverlay.top", target: VISUAL_TOKEN_TARGETS.ROOT, cssVar: "--style-shell-overlay-top", type: VISUAL_TOKEN_TYPES.CSS_TEXT },
  { key: "surface.shellOverlay.bottom", target: VISUAL_TOKEN_TARGETS.ROOT, cssVar: "--style-shell-overlay-bottom", type: VISUAL_TOKEN_TYPES.CSS_TEXT },
  { key: "surface.shellBlur", target: VISUAL_TOKEN_TARGETS.ROOT, cssVar: "--style-shell-blur", type: VISUAL_TOKEN_TYPES.LENGTH },
  { key: "surface.floatBlur", target: VISUAL_TOKEN_TARGETS.ROOT, cssVar: "--style-float-blur", type: VISUAL_TOKEN_TYPES.LENGTH },

  { key: "font.ui.family", target: VISUAL_TOKEN_TARGETS.ROOT, cssVar: "--ui-font-family", type: VISUAL_TOKEN_TYPES.CSS_TEXT },
  { key: "font.ui.size", target: VISUAL_TOKEN_TARGETS.ROOT, cssVar: "--ui-font-size", type: VISUAL_TOKEN_TYPES.LENGTH },
  { key: "font.sidebarTitle.size", target: VISUAL_TOKEN_TARGETS.ROOT, cssVar: "--sidebar-title-size", type: VISUAL_TOKEN_TYPES.LENGTH },
  { key: "font.editor.family", target: VISUAL_TOKEN_TARGETS.ROOT, cssVar: "--editor-font-family", type: VISUAL_TOKEN_TYPES.CSS_TEXT },
  { key: "font.editor.size", target: VISUAL_TOKEN_TARGETS.ROOT, cssVar: "--editor-font-size", type: VISUAL_TOKEN_TYPES.LENGTH },
  { key: "font.editor.lineHeight", target: VISUAL_TOKEN_TARGETS.ROOT, cssVar: "--editor-line-height", type: VISUAL_TOKEN_TYPES.LENGTH },

  { key: "editor.background", target: VISUAL_TOKEN_TARGETS.ROOT, cssVar: "--editor", type: VISUAL_TOKEN_TYPES.CSS_TEXT },
  { key: "editor.text", target: VISUAL_TOKEN_TARGETS.ROOT, cssVar: "--editor-text", type: VISUAL_TOKEN_TYPES.CSS_TEXT },
  { key: "editor.textHighlight", target: VISUAL_TOKEN_TARGETS.ROOT, cssVar: "--editor-text-highlight", type: VISUAL_TOKEN_TYPES.CSS_TEXT },
  { key: "editor.caret", target: VISUAL_TOKEN_TARGETS.ROOT, cssVar: "--editor-caret", type: VISUAL_TOKEN_TYPES.CSS_TEXT },
  { key: "editor.caretShadow", target: VISUAL_TOKEN_TARGETS.ROOT, cssVar: "--editor-caret-shadow", type: VISUAL_TOKEN_TYPES.CSS_TEXT },
  { key: "editor.line", target: VISUAL_TOKEN_TARGETS.ROOT, cssVar: "--editor-line-selected", type: VISUAL_TOKEN_TYPES.CSS_TEXT },
  { key: "editor.selection", target: VISUAL_TOKEN_TARGETS.ROOT, cssVar: "--editor-selection", type: VISUAL_TOKEN_TYPES.CSS_TEXT },
  { key: "editor.block", target: VISUAL_TOKEN_TARGETS.ROOT, cssVar: "--editor-block-bg", type: VISUAL_TOKEN_TYPES.CSS_TEXT },
  { key: "editor.blockBorder", target: VISUAL_TOKEN_TARGETS.ROOT, cssVar: "--editor-block-border", type: VISUAL_TOKEN_TYPES.CSS_TEXT },

  { key: "settings.groupGap", target: VISUAL_TOKEN_TARGETS.SETTINGS, cssVar: "--settings-group-gap", type: VISUAL_TOKEN_TYPES.LENGTH },
  { key: "settings.cardPaddingX", target: VISUAL_TOKEN_TARGETS.SETTINGS, cssVar: "--settings-card-pad-x", type: VISUAL_TOKEN_TYPES.LENGTH },
  { key: "settings.cardPaddingY", target: VISUAL_TOKEN_TARGETS.SETTINGS, cssVar: "--settings-card-pad-y", type: VISUAL_TOKEN_TYPES.LENGTH },
  { key: "settings.sectionPaddingX", target: VISUAL_TOKEN_TARGETS.SETTINGS, cssVar: "--settings-section-pad-x", type: VISUAL_TOKEN_TYPES.LENGTH },
  { key: "settings.sectionPaddingY", target: VISUAL_TOKEN_TARGETS.SETTINGS, cssVar: "--settings-section-pad-y", type: VISUAL_TOKEN_TYPES.LENGTH },
  { key: "settings.sectionGap", target: VISUAL_TOKEN_TARGETS.SETTINGS, cssVar: "--settings-section-gap", type: VISUAL_TOKEN_TYPES.LENGTH },
  { key: "settings.rowGap", target: VISUAL_TOKEN_TARGETS.SETTINGS, cssVar: "--settings-row-gap", type: VISUAL_TOKEN_TYPES.LENGTH },
  { key: "settings.rowMinHeight", target: VISUAL_TOKEN_TARGETS.SETTINGS, cssVar: "--settings-row-min-height", type: VISUAL_TOKEN_TYPES.LENGTH },
  { key: "settings.titleSize", target: VISUAL_TOKEN_TARGETS.SETTINGS, cssVar: "--settings-title-size", type: VISUAL_TOKEN_TYPES.LENGTH },
  { key: "settings.labelSize", target: VISUAL_TOKEN_TARGETS.SETTINGS, cssVar: "--settings-label-size", type: VISUAL_TOKEN_TYPES.LENGTH },
  { key: "settings.iconSize", target: VISUAL_TOKEN_TARGETS.SETTINGS, cssVar: "--settings-icon-size", type: VISUAL_TOKEN_TYPES.LENGTH },
  { key: "settings.controlWidth", target: VISUAL_TOKEN_TARGETS.SETTINGS, cssVar: "--settings-control-width", type: VISUAL_TOKEN_TYPES.LENGTH },
  { key: "settings.controlCompactWidth", target: VISUAL_TOKEN_TARGETS.SETTINGS, cssVar: "--settings-control-width-compact", type: VISUAL_TOKEN_TYPES.LENGTH },
  { key: "settings.pillRadius", target: VISUAL_TOKEN_TARGETS.SETTINGS, cssVar: "--settings-pill-radius", type: VISUAL_TOKEN_TYPES.LENGTH },
  { key: "settings.dropdownRadius", target: VISUAL_TOKEN_TARGETS.SETTINGS, cssVar: "--settings-dropdown-radius", type: VISUAL_TOKEN_TYPES.LENGTH },
  { key: "settings.dividerThickness", target: VISUAL_TOKEN_TARGETS.SETTINGS, cssVar: "--settings-divider-thickness", type: VISUAL_TOKEN_TYPES.LENGTH },
]);

const visualTokenDefinitionMap = new Map(visualTokenDefinitions.map((definition) => [definition.key, definition]));

function normalizeCssText(value) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }

  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim();
  return normalized ? normalized : null;
}

function normalizeCssLength(value) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return `${value}px`;
  }

  return normalizeCssText(value);
}

function normalizeVisualTokenValue(value, type) {
  if (type === VISUAL_TOKEN_TYPES.LENGTH) {
    return normalizeCssLength(value);
  }

  return normalizeCssText(value);
}

function collectVisualTokenLeaves(rawTokens, prefix = [], acc = []) {
  if (!rawTokens || typeof rawTokens !== "object" || Array.isArray(rawTokens)) {
    return acc;
  }

  Object.entries(rawTokens).forEach(([key, value]) => {
    const nextPath = [...prefix, key];
    if (value && typeof value === "object" && !Array.isArray(value)) {
      collectVisualTokenLeaves(value, nextPath, acc);
      return;
    }

    acc.push([nextPath.join("."), value]);
  });

  return acc;
}

function setNestedPath(target, path, value) {
  let cursor = target;
  path.forEach((segment, index) => {
    if (index === path.length - 1) {
      cursor[segment] = value;
      return;
    }

    if (!cursor[segment] || typeof cursor[segment] !== "object" || Array.isArray(cursor[segment])) {
      cursor[segment] = {};
    }
    cursor = cursor[segment];
  });
}

function parseLengthNumber(value) {
  if (typeof value !== "string") {
    return null;
  }

  const match = value.trim().match(/^(-?\d+(?:\.\d+)?)px$/i);
  if (!match) {
    return null;
  }

  return Number.parseFloat(match[1]);
}

export function normalizeVisualTokenOverrides(rawTokens) {
  const overrides = {};
  collectVisualTokenLeaves(rawTokens).forEach(([key, rawValue]) => {
    const definition = visualTokenDefinitionMap.get(key);
    if (!definition) {
      return;
    }

    const normalized = normalizeVisualTokenValue(rawValue, definition.type);
    if (normalized === null) {
      return;
    }
    overrides[key] = normalized;
  });
  return overrides;
}

export function buildVisualTokenConfigObject(overrides = {}) {
  const config = {};
  Object.entries(overrides).forEach(([key, value]) => {
    if (!visualTokenDefinitionMap.has(key)) {
      return;
    }
    setNestedPath(config, key.split("."), value);
  });
  return config;
}

export function applyVisualTokenOverrides(overrides = {}, { root, settingsRoot } = {}) {
  const rootTarget = root ?? document.documentElement;
  const settingsTarget = settingsRoot ?? null;

  Object.entries(overrides).forEach(([key, value]) => {
    const definition = visualTokenDefinitionMap.get(key);
    if (!definition || value == null) {
      return;
    }

    const target = definition.target === VISUAL_TOKEN_TARGETS.SETTINGS ? settingsTarget : rootTarget;
    if (!target?.style) {
      return;
    }
    target.style.setProperty(definition.cssVar, value);
  });

  if (rootTarget?.style) {
    const editorFontSizeOverride = overrides["font.editor.size"];
    const explicitEditorLineHeight = overrides["font.editor.lineHeight"];
    if (editorFontSizeOverride && !explicitEditorLineHeight) {
      const size = parseLengthNumber(editorFontSizeOverride);
      if (size !== null) {
        rootTarget.style.setProperty("--editor-line-height", `${size + 11}px`);
      }
    }
  }
}

export function hasVisualTokenOverrides(overrides = {}) {
  return Object.keys(overrides).length > 0;
}
