const workspaceApiBase = "/api/workspace";
const primaryFile = "main.styio";
const fallbackSources = {
  "main.styio": `pipeline mainFlow
let staged := source |> normalize
let routeOut = staged -> render
let routeIn = source <- bridge
let promote = state => running
let fallback = state <= idle
fn main(input) {
  state idle
  when input.ready -> state running
  emit staged
}`,
};

const workspaceShell = document.getElementById("workspaceShell");
const currentFileTitle = document.getElementById("currentFileTitle");
const toggleSidebar = document.getElementById("toggleSidebar");
const closeSidebar = document.getElementById("closeSidebar");
const drawerTabs = Array.from(document.querySelectorAll("[data-drawer-tab]"));
const fileTree = document.getElementById("fileTree");
const workspaceState = document.getElementById("workspaceState");
const saveState = document.getElementById("saveState");
const glyphState = document.getElementById("glyphState");
const indentState = document.getElementById("indentState");
const unitState = document.getElementById("unitState");
const cursorState = document.getElementById("cursorState");
const issueState = document.getElementById("issueState");
const renderState = document.getElementById("renderState");
const fileState = document.getElementById("fileState");
const toggleGlyphs = document.getElementById("toggleGlyphs");
const indentControl = document.getElementById("indentControl");
const saveFile = document.getElementById("saveFile");
const highlightPaletteButton = document.getElementById("highlightPaletteButton");
const highlightPaletteOptions = document.getElementById("highlightPaletteOptions");
const blockSurfaceButton = document.getElementById("blockSurfaceButton");
const blockSurfaceOptions = document.getElementById("blockSurfaceOptions");
const lineHighlightButton = document.getElementById("lineHighlightButton");
const lineHighlightOptions = document.getElementById("lineHighlightOptions");
const glyphColorList = document.getElementById("glyphColorList");
const lineGutter = document.getElementById("lineGutter");
const codeStage = document.getElementById("codeStage");
const blockLayer = document.getElementById("blockLayer");
const renderLayer = document.getElementById("renderLayer");
const caretLayer = document.getElementById("caretLayer");
const caretIndicator = document.getElementById("caretIndicator");
const editorInput = document.getElementById("editorInput");

const fileSources = { ...fallbackSources };
const fileDirty = {};
let fileOrder = [primaryFile];
let currentFile = primaryFile;
let glyphsOn = true;
let workspaceApiAvailable = false;
let saveInFlight = false;
let latestAnalysis = null;
let sidebarOpen = false;
let activeDrawerTab = "files";
let indentSize = 2;
let openGlyphColorMenu = null;
let paletteMenuOpen = false;
let blockSurfaceMenuOpen = false;
let lineHighlightMenuOpen = false;
let activePaletteKey = "styio";
let activeBlockSurfaceKey = "graphite";
let activeLineHighlightKey = "graphite";
let pointerSelectionAnchor = null;
let pointerSelectionCleanup = null;
let pendingNativeRenderFrame = 0;
const glyphHighlightStorageKey = "styio-view:glyph-highlights";

const operatorGlyphs = {
  "#": { tokenClass: "token-hash", visual: "#" },
  "@": { tokenClass: "token-at", visual: "@" },
  ">_": {
    tokenClass: "token-prompt",
    markup: `
      <svg class="terminal-glyph" viewBox="6 8 12.5 8" aria-hidden="true">
        <path d="M7 8.75l4.25 3.25L7 15.25"></path>
        <path d="M13.25 15.25h4.5"></path>
      </svg>
    `,
  },
  "|>": { tokenClass: "token-pipe", visual: "▸" },
  "<|": { tokenClass: "token-pipe-left", visual: "◂" },
  "->": { tokenClass: "token-arrow-right", visual: "→" },
  "<-": { tokenClass: "token-arrow-left", visual: "←" },
  "=>": { tokenClass: "token-double-arrow", visual: "⇒" },
  "<=": { tokenClass: "token-double-arrow-left", visual: "⇐" },
  ":=": { tokenClass: "token-define", visual: "≔" },
};
const glyphOperators = Object.keys(operatorGlyphs).sort((left, right) => right.length - left.length);
const glyphOperatorPattern = new RegExp(
  `(${glyphOperators.map((token) => token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`,
  "g",
);
const glyphColorSpecs = [
  { key: "hash", token: "#", label: "Heading / Macro", cssVar: "--glyph-color-hash" },
  { key: "at", token: "@", label: "Attribute / Import", cssVar: "--glyph-color-at" },
  { key: "prompt", token: ">_", label: "Terminal Prompt", cssVar: "--glyph-color-prompt" },
  { key: "pipe", token: "|>", label: "Pipeline", cssVar: "--glyph-color-pipe" },
  { key: "pipeLeft", token: "<|", label: "Pipeline Left", cssVar: "--glyph-color-pipe-left" },
  { key: "arrowRight", token: "->", label: "Right Arrow", cssVar: "--glyph-color-arrow-right" },
  { key: "arrowLeft", token: "<-", label: "Left Arrow", cssVar: "--glyph-color-arrow-left" },
  { key: "doubleArrow", token: "=>", label: "Double Arrow", cssVar: "--glyph-color-double-arrow" },
  {
    key: "doubleArrowLeft",
    token: "<=",
    label: "Double Arrow Left",
    cssVar: "--glyph-color-double-arrow-left",
  },
  { key: "define", token: ":=", label: "Definition", cssVar: "--glyph-color-define" },
];
const glyphColorOptions = [
  "#569CD6",
  "#4EC9B0",
  "#9CDCFE",
  "#C586C0",
  "#D7BA7D",
  "#D19A66",
  "#E5C07B",
  "#D2A8FF",
  "#7EE787",
  "#58A6FF",
  "#FFA657",
  "#FF6188",
];
const glyphPaletteOptions = [
  {
    key: "styio",
    label: "Styio",
    color: "#FF8A57",
    editorTheme: {
      "--editor": "#15171C",
      "--editor-text": "#E8ECF1",
      "--editor-muted": "#7F8893",
      "--editor-frame-border": "rgba(232, 236, 241, 0.08)",
      "--editor-surface-overlay-top": "rgba(255, 255, 255, 0.03)",
      "--editor-surface-overlay-bottom": "rgba(255, 255, 255, 0.012)",
      "--editor-gutter-bg": "#1C1F26",
      "--editor-issue-dot": "#FF7A6A",
      "--editor-block-bg": "rgba(255, 255, 255, 0.028)",
      "--editor-block-border": "rgba(255, 255, 255, 0.06)",
      "--editor-block-hash-bg": "rgba(255, 255, 255, 0.034)",
      "--editor-block-hash-border": "rgba(255, 255, 255, 0.068)",
      "--editor-block-at-bg": "rgba(244, 246, 248, 0.03)",
      "--editor-block-at-border": "rgba(255, 255, 255, 0.064)",
      "--editor-caret": "#FF8A57",
      "--editor-caret-shadow": "rgba(255, 138, 87, 0.18)",
      "--editor-line-selected": "rgba(255, 255, 255, 0.045)",
      "--editor-line-issue": "#FF7A6A",
      "--editor-selection": "rgba(255, 138, 87, 0.22)",
    },
  },
  {
    key: "darkPlus",
    label: "Dark+",
    color: "#569CD6",
    editorTheme: {
      "--editor": "#1E1E1E",
      "--editor-text": "#D4D4D4",
      "--editor-muted": "#858585",
      "--editor-frame-border": "rgba(255, 255, 255, 0.08)",
      "--editor-surface-overlay-top": "rgba(255, 255, 255, 0.04)",
      "--editor-surface-overlay-bottom": "rgba(255, 255, 255, 0.02)",
      "--editor-gutter-bg": "#252526",
      "--editor-issue-dot": "#F14C4C",
      "--editor-block-bg": "rgba(255, 255, 255, 0.04)",
      "--editor-block-border": "rgba(255, 255, 255, 0.08)",
      "--editor-caret": "#AEAFAD",
      "--editor-caret-shadow": "rgba(174, 175, 173, 0.18)",
      "--editor-line-selected": "rgba(255, 255, 255, 0.05)",
      "--editor-line-issue": "#F14C4C",
      "--editor-selection": "rgba(38, 79, 120, 0.55)",
    },
  },
  {
    key: "oneDark",
    label: "One Dark",
    color: "#61AFEF",
    editorTheme: {
      "--editor": "#282C34",
      "--editor-text": "#ABB2BF",
      "--editor-muted": "#5C6370",
      "--editor-frame-border": "rgba(255, 255, 255, 0.07)",
      "--editor-surface-overlay-top": "rgba(255, 255, 255, 0.03)",
      "--editor-surface-overlay-bottom": "rgba(255, 255, 255, 0.015)",
      "--editor-gutter-bg": "#21252B",
      "--editor-issue-dot": "#E06C75",
      "--editor-block-bg": "rgba(255, 255, 255, 0.035)",
      "--editor-block-border": "rgba(255, 255, 255, 0.07)",
      "--editor-caret": "#528BFF",
      "--editor-caret-shadow": "rgba(82, 139, 255, 0.2)",
      "--editor-line-selected": "rgba(255, 255, 255, 0.05)",
      "--editor-line-issue": "#E06C75",
      "--editor-selection": "rgba(82, 139, 255, 0.3)",
    },
  },
  {
    key: "monokai",
    label: "Monokai",
    color: "#78DCE8",
    editorTheme: {
      "--editor": "#272822",
      "--editor-text": "#F8F8F2",
      "--editor-muted": "#75715E",
      "--editor-frame-border": "rgba(255, 255, 255, 0.07)",
      "--editor-surface-overlay-top": "rgba(255, 255, 255, 0.025)",
      "--editor-surface-overlay-bottom": "rgba(255, 255, 255, 0.01)",
      "--editor-gutter-bg": "#221F22",
      "--editor-issue-dot": "#FF6188",
      "--editor-block-bg": "rgba(255, 255, 255, 0.035)",
      "--editor-block-border": "rgba(255, 255, 255, 0.07)",
      "--editor-caret": "#F8F8F0",
      "--editor-caret-shadow": "rgba(248, 248, 240, 0.18)",
      "--editor-line-selected": "rgba(255, 255, 255, 0.045)",
      "--editor-line-issue": "#FF6188",
      "--editor-selection": "rgba(73, 72, 62, 0.8)",
    },
  },
  {
    key: "githubDark",
    label: "GitHub Dark",
    color: "#79C0FF",
    editorTheme: {
      "--editor": "#0D1117",
      "--editor-text": "#C9D1D9",
      "--editor-muted": "#8B949E",
      "--editor-frame-border": "rgba(240, 246, 252, 0.1)",
      "--editor-surface-overlay-top": "rgba(255, 255, 255, 0.02)",
      "--editor-surface-overlay-bottom": "rgba(255, 255, 255, 0.01)",
      "--editor-gutter-bg": "#161B22",
      "--editor-issue-dot": "#FF7B72",
      "--editor-block-bg": "rgba(110, 118, 129, 0.12)",
      "--editor-block-border": "rgba(240, 246, 252, 0.08)",
      "--editor-caret": "#79C0FF",
      "--editor-caret-shadow": "rgba(121, 192, 255, 0.18)",
      "--editor-line-selected": "rgba(56, 139, 253, 0.14)",
      "--editor-line-issue": "#FF7B72",
      "--editor-selection": "rgba(56, 139, 253, 0.28)",
    },
  },
  {
    key: "dracula",
    label: "Dracula",
    color: "#BD93F9",
    editorTheme: {
      "--editor": "#282A36",
      "--editor-text": "#F8F8F2",
      "--editor-muted": "#6272A4",
      "--editor-frame-border": "rgba(255, 255, 255, 0.08)",
      "--editor-surface-overlay-top": "rgba(255, 255, 255, 0.02)",
      "--editor-surface-overlay-bottom": "rgba(255, 255, 255, 0.01)",
      "--editor-gutter-bg": "#232530",
      "--editor-issue-dot": "#FF5555",
      "--editor-block-bg": "rgba(255, 255, 255, 0.035)",
      "--editor-block-border": "rgba(255, 255, 255, 0.08)",
      "--editor-caret": "#F8F8F2",
      "--editor-caret-shadow": "rgba(248, 248, 242, 0.16)",
      "--editor-line-selected": "rgba(255, 255, 255, 0.05)",
      "--editor-line-issue": "#FF5555",
      "--editor-selection": "rgba(189, 147, 249, 0.22)",
    },
  },
  {
    key: "nord",
    label: "Nord",
    color: "#81A1C1",
    editorTheme: {
      "--editor": "#2E3440",
      "--editor-text": "#D8DEE9",
      "--editor-muted": "#81A1C1",
      "--editor-frame-border": "rgba(216, 222, 233, 0.08)",
      "--editor-surface-overlay-top": "rgba(255, 255, 255, 0.02)",
      "--editor-surface-overlay-bottom": "rgba(255, 255, 255, 0.01)",
      "--editor-gutter-bg": "#3B4252",
      "--editor-issue-dot": "#BF616A",
      "--editor-block-bg": "rgba(255, 255, 255, 0.03)",
      "--editor-block-border": "rgba(216, 222, 233, 0.08)",
      "--editor-caret": "#88C0D0",
      "--editor-caret-shadow": "rgba(136, 192, 208, 0.16)",
      "--editor-line-selected": "rgba(129, 161, 193, 0.15)",
      "--editor-line-issue": "#BF616A",
      "--editor-selection": "rgba(94, 129, 172, 0.3)",
    },
  },
  {
    key: "catppuccinMocha",
    label: "Catppuccin Mocha",
    color: "#89B4FA",
    editorTheme: {
      "--editor": "#1E1E2E",
      "--editor-text": "#CDD6F4",
      "--editor-muted": "#6C7086",
      "--editor-frame-border": "rgba(205, 214, 244, 0.08)",
      "--editor-surface-overlay-top": "rgba(255, 255, 255, 0.018)",
      "--editor-surface-overlay-bottom": "rgba(255, 255, 255, 0.008)",
      "--editor-gutter-bg": "#181825",
      "--editor-issue-dot": "#F38BA8",
      "--editor-block-bg": "rgba(255, 255, 255, 0.03)",
      "--editor-block-border": "rgba(205, 214, 244, 0.08)",
      "--editor-caret": "#F5E0DC",
      "--editor-caret-shadow": "rgba(245, 224, 220, 0.14)",
      "--editor-line-selected": "rgba(137, 180, 250, 0.14)",
      "--editor-line-issue": "#F38BA8",
      "--editor-selection": "rgba(137, 180, 250, 0.22)",
    },
  },
  {
    key: "solarized",
    label: "Solarized",
    color: "#268BD2",
    editorTheme: {
      "--editor": "#002B36",
      "--editor-text": "#93A1A1",
      "--editor-muted": "#586E75",
      "--editor-frame-border": "rgba(147, 161, 161, 0.08)",
      "--editor-surface-overlay-top": "rgba(255, 255, 255, 0.015)",
      "--editor-surface-overlay-bottom": "rgba(255, 255, 255, 0.006)",
      "--editor-gutter-bg": "#073642",
      "--editor-issue-dot": "#DC322F",
      "--editor-block-bg": "rgba(255, 255, 255, 0.025)",
      "--editor-block-border": "rgba(147, 161, 161, 0.08)",
      "--editor-caret": "#839496",
      "--editor-caret-shadow": "rgba(131, 148, 150, 0.14)",
      "--editor-line-selected": "rgba(38, 139, 210, 0.14)",
      "--editor-line-issue": "#DC322F",
      "--editor-selection": "rgba(7, 54, 66, 0.95)",
    },
  },
];
const blockSurfacePresets = [
  {
    key: "frost",
    label: "Frost",
    vars: {
      "--editor-block-bg": "rgba(255, 255, 255, 0.045)",
      "--editor-block-border": "rgba(255, 255, 255, 0.085)",
      "--editor-block-hash-bg": "rgba(255, 255, 255, 0.058)",
      "--editor-block-hash-border": "rgba(255, 255, 255, 0.1)",
      "--editor-block-at-bg": "rgba(248, 249, 252, 0.052)",
      "--editor-block-at-border": "rgba(255, 255, 255, 0.095)",
    },
  },
  {
    key: "softMist",
    label: "Soft Mist",
    vars: {
      "--editor-block-bg": "rgba(255, 255, 255, 0.036)",
      "--editor-block-border": "rgba(255, 255, 255, 0.072)",
      "--editor-block-hash-bg": "rgba(255, 255, 255, 0.044)",
      "--editor-block-hash-border": "rgba(255, 255, 255, 0.082)",
      "--editor-block-at-bg": "rgba(245, 246, 248, 0.04)",
      "--editor-block-at-border": "rgba(255, 255, 255, 0.076)",
    },
  },
  {
    key: "paperGlass",
    label: "Paper Glass",
    vars: {
      "--editor-block-bg": "rgba(255, 255, 255, 0.062)",
      "--editor-block-border": "rgba(255, 255, 255, 0.12)",
      "--editor-block-hash-bg": "rgba(255, 255, 255, 0.074)",
      "--editor-block-hash-border": "rgba(255, 255, 255, 0.132)",
      "--editor-block-at-bg": "rgba(250, 250, 252, 0.068)",
      "--editor-block-at-border": "rgba(255, 255, 255, 0.124)",
    },
  },
  {
    key: "graphite",
    label: "Graphite",
    vars: {
      "--editor-block-bg": "rgba(255, 255, 255, 0.028)",
      "--editor-block-border": "rgba(255, 255, 255, 0.06)",
      "--editor-block-hash-bg": "rgba(255, 255, 255, 0.034)",
      "--editor-block-hash-border": "rgba(255, 255, 255, 0.068)",
      "--editor-block-at-bg": "rgba(244, 246, 248, 0.03)",
      "--editor-block-at-border": "rgba(255, 255, 255, 0.064)",
    },
  },
];
const lineHighlightPresets = [
  { key: "graphite", label: "Graphite", value: "rgba(255, 255, 255, 0.045)" },
  { key: "glassWhite", label: "Glass White", value: "rgba(255, 255, 255, 0.065)" },
  { key: "violetMist", label: "Violet Mist", value: "rgba(139, 92, 246, 0.12)" },
  { key: "blueTint", label: "Blue Tint", value: "rgba(96, 165, 250, 0.12)" },
  { key: "amberSoft", label: "Amber Soft", value: "rgba(255, 138, 87, 0.11)" },
];
const defaultGlyphColor = glyphPaletteOptions[0].color;
let glyphColors = Object.fromEntries(glyphColorSpecs.map((spec) => [spec.key, defaultGlyphColor]));

const measureLine = document.createElement("div");
measureLine.className = "measure-line";
document.body.appendChild(measureLine);

function getCssNumber(name) {
  return parseFloat(getComputedStyle(document.documentElement).getPropertyValue(name));
}

function getCaretLineIndex() {
  const beforeCaret = editorInput.value.slice(0, editorInput.selectionStart);
  return beforeCaret.split("\n").length - 1;
}

function normalizedSelectionRange() {
  return {
    start: Math.min(editorInput.selectionStart, editorInput.selectionEnd),
    end: Math.max(editorInput.selectionStart, editorInput.selectionEnd),
  };
}

function hasSelection() {
  const { start, end } = normalizedSelectionRange();
  return start !== end;
}

function escapeHtml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function normalizeHexColor(value, fallback) {
  const match = value.trim().match(/^#?([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (!match) {
    return fallback;
  }

  let hex = match[1].toUpperCase();
  if (hex.length === 3) {
    hex = hex
      .split("")
      .map((char) => `${char}${char}`)
      .join("");
  }

  return `#${hex}`;
}

function persistGlyphHighlights() {
  try {
    window.localStorage.setItem(
      glyphHighlightStorageKey,
      JSON.stringify({
        paletteKey: activePaletteKey,
        blockSurfaceKey: activeBlockSurfaceKey,
        lineHighlightKey: activeLineHighlightKey,
        colors: glyphColors,
      }),
    );
  } catch (error) {
    console.warn("failed to persist glyph highlights", error);
  }
}

function applyGlyphColors() {
  glyphColorSpecs.forEach((spec) => {
    document.documentElement.style.setProperty(spec.cssVar, glyphColors[spec.key]);
  });
}

function currentPalette() {
  return glyphPaletteOptions.find((palette) => palette.key === activePaletteKey) ?? glyphPaletteOptions[0];
}

function currentBlockSurface() {
  return (
    blockSurfacePresets.find((preset) => preset.key === activeBlockSurfaceKey) ?? blockSurfacePresets[0]
  );
}

function currentLineHighlight() {
  return (
    lineHighlightPresets.find((preset) => preset.key === activeLineHighlightKey) ??
    lineHighlightPresets[0]
  );
}

function applyEditorTheme() {
  Object.entries(currentPalette().editorTheme).forEach(([cssVar, value]) => {
    document.documentElement.style.setProperty(cssVar, value);
  });
}

function applyBlockSurfaceTheme() {
  Object.entries(currentBlockSurface().vars).forEach(([cssVar, value]) => {
    document.documentElement.style.setProperty(cssVar, value);
  });
}

function applyLineHighlightTheme() {
  document.documentElement.style.setProperty("--editor-line-selected", currentLineHighlight().value);
}

function syncGlyphHighlightUi() {
  highlightPaletteButton.textContent = `PALETTE: ${currentPalette().label}`;
  highlightPaletteButton.setAttribute("aria-expanded", String(paletteMenuOpen));
  highlightPaletteOptions.classList.toggle("is-open", paletteMenuOpen);

  highlightPaletteOptions.querySelectorAll("[data-palette-key]").forEach((button) => {
    const active = activePaletteKey === button.dataset.paletteKey;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  });

  blockSurfaceButton.textContent = `BLOCK: ${currentBlockSurface().label}`;
  blockSurfaceButton.setAttribute("aria-expanded", String(blockSurfaceMenuOpen));
  blockSurfaceOptions.classList.toggle("is-open", blockSurfaceMenuOpen);

  blockSurfaceOptions.querySelectorAll("[data-block-surface-key]").forEach((button) => {
    const active = activeBlockSurfaceKey === button.dataset.blockSurfaceKey;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  });

  lineHighlightButton.textContent = `LINE: ${currentLineHighlight().label}`;
  lineHighlightButton.setAttribute("aria-expanded", String(lineHighlightMenuOpen));
  lineHighlightOptions.classList.toggle("is-open", lineHighlightMenuOpen);

  lineHighlightOptions.querySelectorAll("[data-line-highlight-key]").forEach((button) => {
    const active = activeLineHighlightKey === button.dataset.lineHighlightKey;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  });

  glyphColorSpecs.forEach((spec) => {
    const color = glyphColors[spec.key].toUpperCase();
    const swatch = glyphColorList.querySelector(`[data-glyph-swatch="${spec.key}"]`);
    const text = glyphColorList.querySelector(`[data-glyph-value="${spec.key}"]`);
    if (swatch) {
      swatch.style.setProperty("--glyph-swatch-color", color);
    }
    if (text) {
      text.value = color;
    }

    const options = glyphColorList.querySelectorAll(`[data-glyph-option-key="${spec.key}"]`);
    options.forEach((button) => {
      const active = button.dataset.glyphOption === color;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });

    const toggle = glyphColorList.querySelector(`[data-glyph-toggle="${spec.key}"]`);
    const open = openGlyphColorMenu === spec.key;
    toggle?.classList.toggle("is-open", open);
    toggle?.setAttribute("aria-expanded", String(open));
    glyphColorList
      .querySelector(`[data-glyph-options="${spec.key}"]`)
      ?.classList.toggle("is-open", open);
  });
}

function renderGlyphHighlightControls() {
  highlightPaletteOptions.innerHTML = glyphPaletteOptions
    .map(
      (palette) => `
        <button class="palette-option" type="button" data-palette-key="${palette.key}">
          ${palette.label}
        </button>
      `,
    )
    .join("");

  blockSurfaceOptions.innerHTML = blockSurfacePresets
    .map(
      (preset) => `
        <button class="palette-option" type="button" data-block-surface-key="${preset.key}">
          ${preset.label}
        </button>
      `,
    )
    .join("");

  lineHighlightOptions.innerHTML = lineHighlightPresets
    .map(
      (preset) => `
        <button class="palette-option" type="button" data-line-highlight-key="${preset.key}">
          ${preset.label}
        </button>
      `,
    )
    .join("");

  glyphColorList.innerHTML = glyphColorSpecs
    .map(
      (spec) => `
        <div class="glyph-color-row" data-glyph-key="${spec.key}">
          <div class="glyph-preview" aria-hidden="true">${renderToken(spec.token)}</div>
          <div class="glyph-color-stack">
            <div class="glyph-color-control">
              <label class="glyph-color-field">
                <span class="glyph-color-swatch" data-glyph-swatch="${spec.key}" style="--glyph-swatch-color:${glyphColors[spec.key]}"></span>
                <input
                  class="glyph-color-value"
                  type="text"
                  value="${glyphColors[spec.key]}"
                  inputmode="text"
                  spellcheck="false"
                  data-glyph-value="${spec.key}"
                  aria-label="${spec.label} hex value"
                />
              </label>
              <button
                class="glyph-dropdown-toggle"
                type="button"
                data-glyph-toggle="${spec.key}"
                aria-label="Open ${spec.label} color options"
                aria-expanded="false"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M7 10l5 5 5-5"></path>
                </svg>
              </button>
            </div>
            <div class="glyph-option-list" data-glyph-options="${spec.key}">
              ${glyphColorOptions
                .map(
                  (value) => `
                    <button
                      class="glyph-option"
                      type="button"
                      data-glyph-option-key="${spec.key}"
                      data-glyph-option="${value}"
                    >
                      <span class="glyph-option-swatch" style="--glyph-option-color:${value}"></span>
                      <span class="glyph-option-value">${value}</span>
                    </button>
                  `,
                )
                .join("")}
            </div>
          </div>
        </div>
      `,
    )
    .join("");

  syncGlyphHighlightUi();
}

function applySharedGlyphColor(color) {
  glyphColorSpecs.forEach((spec) => {
    glyphColors[spec.key] = color;
  });
}

function loadGlyphHighlightState() {
  try {
    const raw = window.localStorage.getItem(glyphHighlightStorageKey);
    if (!raw) {
      activePaletteKey = glyphPaletteOptions[0].key;
      applyEditorTheme();
      applyGlyphColors();
      return;
    }

    const parsed = JSON.parse(raw);
    activePaletteKey = glyphPaletteOptions.some((palette) => palette.key === parsed?.paletteKey)
      ? parsed.paletteKey
      : glyphPaletteOptions[0].key;
    activeBlockSurfaceKey = blockSurfacePresets.some((preset) => preset.key === parsed?.blockSurfaceKey)
      ? parsed.blockSurfaceKey
      : blockSurfacePresets[0].key;
    activeLineHighlightKey = lineHighlightPresets.some(
      (preset) => preset.key === parsed?.lineHighlightKey,
    )
      ? parsed.lineHighlightKey
      : lineHighlightPresets[0].key;
    const candidateColors = Object.fromEntries(
      glyphColorSpecs.map((spec) => [spec.key, defaultGlyphColor]),
    );
    glyphColorSpecs.forEach((spec) => {
      candidateColors[spec.key] = normalizeHexColor(
        parsed?.colors?.[spec.key] ?? candidateColors[spec.key],
        candidateColors[spec.key],
      );
    });

    glyphColors = candidateColors;
  } catch (error) {
    console.warn("failed to restore glyph highlights", error);
  }

  applyEditorTheme();
  applyBlockSurfaceTheme();
  applyLineHighlightTheme();
  applyGlyphColors();
}

function countMatches(value, regex) {
  return (value.match(regex) || []).length;
}

function countChar(value, char) {
  return countMatches(value, new RegExp(`\\${char}`, "g"));
}

function indentUnit() {
  return " ".repeat(indentSize);
}

function padLine(index) {
  return String(index + 1).padStart(2, "0");
}

function splitLines(source) {
  return source.replace(/\r\n/g, "\n").split("\n");
}

function matchBlockHeader(line) {
  const fnMatch = line.match(/^\s*fn\s+([A-Za-z_]\w*)/);
  if (fnMatch) {
    return { type: "fn", title: fnMatch[1], visualStart: "body" };
  }

  const hashMatch = line.match(/^\s*#\s*([A-Za-z_]\w*)?/);
  if (hashMatch) {
    return { type: "hash", title: hashMatch[1] || "hash", visualStart: "header" };
  }

  const atMatch = line.match(/^\s*@\s*([A-Za-z_]\w*)?/);
  if (atMatch) {
    return { type: "at", title: atMatch[1] || "at", visualStart: "header" };
  }

  return null;
}

function findDeferredBlockOpenLine(lines, headerIndex) {
  for (let cursor = headerIndex + 1; cursor < lines.length; cursor += 1) {
    const candidate = lines[cursor];
    if (candidate.trim() === "") {
      continue;
    }

    return candidate.includes("{") ? cursor : null;
  }

  return null;
}

function blockVisualStart(header, headerLine, openLine, closingLine) {
  if (header.visualStart !== "body") {
    return headerLine;
  }

  return Math.min(closingLine, openLine + 1);
}

function findBlocks(lines) {
  const blocks = [];

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const header = matchBlockHeader(line);
    if (!header) {
      continue;
    }

    let openLine = index;
    let depth = 0;

    if (line.includes("{")) {
      depth = countChar(line, "{") - countChar(line, "}");
    } else {
      const deferredOpenLine = findDeferredBlockOpenLine(lines, index);
      if (deferredOpenLine === null) {
        blocks.push({
          type: header.type,
          title: header.title,
          header: index,
          visualStart: index,
          closing: index,
        });
        continue;
      }

      openLine = deferredOpenLine;
      depth = countChar(lines[openLine], "{") - countChar(lines[openLine], "}");
    }

    if (depth <= 0) {
      blocks.push({
        type: header.type,
        title: header.title,
        header: index,
        visualStart: blockVisualStart(header, index, openLine, openLine),
        closing: openLine,
      });
      continue;
    }

    let cursor = openLine + 1;
    while (cursor < lines.length && depth > 0) {
      depth += countChar(lines[cursor], "{") - countChar(lines[cursor], "}");
      if (depth === 0) {
        break;
      }
      cursor += 1;
    }

    if (cursor < lines.length && depth === 0) {
      blocks.push({
        type: header.type,
        title: header.title,
        header: index,
        visualStart: blockVisualStart(header, index, openLine, cursor),
        closing: cursor,
      });
      index = cursor;
    }
  }

  return blocks;
}

function analyzeSource(source) {
  const lines = splitLines(source);
  const glyphCount = countMatches(source, glyphOperatorPattern);
  const blocks = findBlocks(lines);
  const braceBalance = countMatches(source, /{/g) - countMatches(source, /}/g);
  const pipelineName = source.match(/^\s*pipeline\s+([A-Za-z_]\w*)/m)?.[1] || null;
  const functionName = source.match(/^\s*fn\s+([A-Za-z_]\w*)/m)?.[1] || null;
  const warnings = [];
  const errors = [];

  const betaIndex = lines.findIndex((line) => line.includes("spawn worker.beta"));
  if (betaIndex !== -1 && !source.includes("joined(")) {
    warnings.push({
      lineIndex: betaIndex,
      title: `line ${padLine(betaIndex)} / join strategy`,
      body: "worker.beta exists but no explicit join strategy is declared.",
    });
  }

  if (braceBalance !== 0) {
    errors.push({
      lineIndex: Math.max(0, lines.findIndex((line) => /^\s*fn\s+/.test(line))),
      title: "semantic block incomplete",
      body: "the current function body is not closed, so the minimal unit is not ready.",
    });
  }

  const selectedLineIndex =
    errors[0]?.lineIndex ??
    warnings[0]?.lineIndex ??
    Math.max(0, lines.findIndex((line) => /^\s*fn\s+/.test(line)) + 1);

  const lineStarts = [];
  let cursor = 0;
  lines.forEach((line, index) => {
    lineStarts[index] = cursor;
    cursor += line.length;
    if (index < lines.length - 1) {
      cursor += 1;
    }
  });

  return {
    lines,
    lineStarts,
    glyphCount,
    blocks,
    warnings,
    errors,
    selectedLineIndex,
    pipelineName,
    functionName,
    ready: Boolean(functionName) && braceBalance === 0,
  };
}

function renderToken(token) {
  const glyph = operatorGlyphs[token];
  if (!glyph) {
    return escapeHtml(token);
  }

  const visualMarkup = glyph.markup ?? escapeHtml(glyph.visual);
  return `<span class="token ${glyph.tokenClass}"><span class="token-visual">${visualMarkup}</span><span class="token-raw">${escapeHtml(token)}</span></span>`;
}

function findGlyphTokenAt(line, index) {
  return glyphOperators.find((token) => line.startsWith(token, index)) ?? null;
}

function renderInlineWithCaret(line, lineStart, caretOffset) {
  let html = "";
  let index = 0;

  while (index < line.length) {
    const token = findGlyphTokenAt(line, index);
    const tokenStart = lineStart + index;
    const insideToken =
      token !== null && caretOffset > tokenStart && caretOffset < tokenStart + token.length;

    if (token && !insideToken) {
      html += renderToken(token);
      index += token.length;
      continue;
    }

    html += escapeHtml(line[index]);
    index += 1;
  }

  return html;
}

function renderLineWithSelection(line, lineStart, caretOffset, selectionStart, selectionEnd) {
  if (selectionStart === selectionEnd) {
    return renderInlineWithCaret(line, lineStart, caretOffset);
  }

  const lineEnd = lineStart + line.length;
  const overlapStart = Math.max(lineStart, selectionStart);
  const overlapEnd = Math.min(lineEnd, selectionEnd);

  if (overlapStart >= overlapEnd) {
    if (line.length === 0 && selectionStart <= lineStart && selectionEnd > lineStart) {
      return `<span class="selection-fragment selection-fragment-empty">&nbsp;</span>`;
    }

    return renderInlineWithCaret(line, lineStart, caretOffset);
  }

  const before = line.slice(0, overlapStart - lineStart);
  const selected = line.slice(overlapStart - lineStart, overlapEnd - lineStart);
  const after = line.slice(overlapEnd - lineStart);

  return [
    renderInlineWithCaret(before, lineStart, caretOffset),
    `<span class="selection-fragment">${escapeHtml(selected)}</span>`,
    renderInlineWithCaret(after, overlapEnd, caretOffset),
  ].join("");
}

function measureHtmlWidth(html) {
  measureLine.innerHTML = `<span class="code-text">${html}</span>`;
  return measureLine.getBoundingClientRect().width;
}

function getCaretCoordinates(line, lineStart, rawOffset) {
  const relativeOffset = Math.max(0, Math.min(line.length, rawOffset - lineStart));
  const prefix = line.slice(0, relativeOffset);
  const prefixHtml = renderInlineWithCaret(prefix, lineStart, rawOffset);
  const lineBoxPadX = getCssNumber("--editor-line-box-pad-x");
  return {
    x: lineBoxPadX + measureHtmlWidth(prefixHtml),
    rawOffset: lineStart + relativeOffset,
  };
}

function findRawOffsetForX(line, lineStart, targetX) {
  let best = { distance: Number.POSITIVE_INFINITY, rawOffset: lineStart };

  for (let index = 0; index <= line.length; index += 1) {
    const { x, rawOffset } = getCaretCoordinates(line, lineStart, lineStart + index);
    const distance = Math.abs(x - targetX);
    if (distance < best.distance) {
      best = { distance, rawOffset };
    }
  }

  return best.rawOffset;
}

function lineIndexForOffset(analysis, rawOffset) {
  const normalizedOffset = Math.max(0, Math.min(editorInput.value.length, rawOffset));
  let lineIndex = analysis.lineStarts.findIndex((start, index) => {
    const end = start + analysis.lines[index].length;
    return normalizedOffset >= start && normalizedOffset <= end;
  });

  if (lineIndex === -1) {
    lineIndex = analysis.lines.length - 1;
  }

  return Math.max(0, lineIndex);
}

function rawOffsetForPointer(event, analysis) {
  const stageRect = codeStage.getBoundingClientRect();
  const padY = getCssNumber("--editor-pad-y");
  const padX = getCssNumber("--editor-pad-x");
  const lineHeight = getCssNumber("--editor-line-height");
  const localY = event.clientY - stageRect.top + editorInput.scrollTop - padY;
  const localX = event.clientX - stageRect.left + editorInput.scrollLeft - padX;
  const lineIndex = Math.max(
    0,
    Math.min(analysis.lines.length - 1, Math.floor(localY / lineHeight)),
  );
  const lineText = analysis.lines[lineIndex];
  const lineStart = analysis.lineStarts[lineIndex];
  return findRawOffsetForX(lineText, lineStart, Math.max(0, localX));
}

function setSelectionFromAnchor(anchor, focus) {
  if (focus < anchor) {
    editorInput.setSelectionRange(focus, anchor, "backward");
    return;
  }

  editorInput.setSelectionRange(anchor, focus, "forward");
}

function selectedSourceText() {
  const { start, end } = normalizedSelectionRange();
  return editorInput.value.slice(start, end);
}

function stopPointerSelection() {
  pointerSelectionAnchor = null;
  if (pointerSelectionCleanup) {
    pointerSelectionCleanup();
    pointerSelectionCleanup = null;
  }
}

function scheduleNativeRender() {
  if (pendingNativeRenderFrame) {
    return;
  }

  pendingNativeRenderFrame = window.requestAnimationFrame(() => {
    pendingNativeRenderFrame = 0;
    renderEditor();
  });
}

function syncSidebar() {
  document.body.classList.toggle("sidebar-open", sidebarOpen);
  workspaceShell.classList.toggle("sidebar-open", sidebarOpen);
  toggleSidebar.setAttribute("aria-expanded", String(sidebarOpen));

  drawerTabs.forEach((button) => {
    const active = button.dataset.drawerTab === activeDrawerTab;
    button.classList.toggle("is-active", active);
    const panel = document.getElementById(`drawerPanel${button.dataset.drawerTab.charAt(0).toUpperCase()}${button.dataset.drawerTab.slice(1)}`);
    panel.classList.toggle("is-active", active);
  });
}

function renderFileTree() {
  fileTree.innerHTML = fileOrder
    .map((fileName) => {
      const analysis = analyzeSource(fileSources[fileName]);
      const dirty = Boolean(fileDirty[fileName]);
      const issueCount = analysis.warnings.length + analysis.errors.length;
      let badgeText = "saved";
      let badgeClass = "";

      if (dirty) {
        badgeText = "dirty";
        badgeClass = "is-dirty";
      } else if (issueCount > 0) {
        badgeText = String(issueCount);
        badgeClass = "has-issues";
      }

      const meta = analysis.pipelineName
        ? `${analysis.pipelineName} / ${analysis.glyphCount} glyphs / ${analysis.blocks.length} blocks`
        : `${analysis.lines.length} lines / ${analysis.glyphCount} glyphs`;

      return `
        <button class="tree-file ${fileName === currentFile ? "is-active" : ""}" data-tree-file="${fileName}">
          <div class="tree-copy">
            <span class="tree-name">${fileName}</span>
            <span class="tree-meta">${meta}</span>
          </div>
          <span class="tree-badge ${badgeClass}">${badgeText}</span>
        </button>
      `;
    })
    .join("");

  fileTree.querySelectorAll("[data-tree-file]").forEach((button) => {
    button.addEventListener("click", () => {
      focusFile(button.dataset.treeFile);
      activeDrawerTab = "files";
      syncSidebar();
    });
  });
}

function renderGutter(analysis) {
  const issueLines = new Set([
    ...analysis.warnings.map((entry) => entry.lineIndex),
    ...analysis.errors.map((entry) => entry.lineIndex),
  ]);
  const lineDigits = String(Math.max(analysis.lines.length, 1)).length;
  const gutterWidth = 52 + Math.max(0, lineDigits - 3) * 10;
  document.documentElement.style.setProperty("--editor-gutter-width", `${gutterWidth}px`);

  lineGutter.innerHTML = analysis.lines
    .map((_, index) => {
      const classes = ["gutter-line"];
      if (issueLines.has(index)) {
        classes.push("has-issue");
      }
      return `<span class="${classes.join(" ")}">${padLine(index)}</span>`;
    })
    .join("");
}

function renderLines(analysis) {
  const issueLines = new Set([
    ...analysis.warnings.map((entry) => entry.lineIndex),
    ...analysis.errors.map((entry) => entry.lineIndex),
  ]);
  const { start: selectionStart, end: selectionEnd } = normalizedSelectionRange();
  const caretLine = selectionStart === selectionEnd ? getCaretLineIndex() : -1;

  renderLayer.innerHTML = analysis.lines
    .map((line, index) => {
      const classes = ["editor-line"];
      if (index === caretLine) {
        classes.push("is-selected");
      }
      if (issueLines.has(index)) {
        classes.push("has-issue");
      }

      return `<div class="${classes.join(" ")}" data-line="${index}"><span class="code-text">${renderLineWithSelection(
        line,
        analysis.lineStarts[index],
        editorInput.selectionStart,
        selectionStart,
        selectionEnd,
      )}</span></div>`;
    })
    .join("");
}

function syncOverlayMetrics() {
  const width = Math.max(editorInput.scrollWidth, codeStage.clientWidth);
  const height = Math.max(editorInput.scrollHeight, codeStage.clientHeight);
  renderLayer.style.width = `${width}px`;
  renderLayer.style.height = `${height}px`;
  blockLayer.style.width = `${width}px`;
  blockLayer.style.height = `${height}px`;
}

function renderBlocks(analysis) {
  const highlights = [];

  analysis.blocks.forEach((block) => {
    const startNode = renderLayer.querySelector(`[data-line="${block.visualStart}"]`);
    const endNode = renderLayer.querySelector(`[data-line="${block.closing}"]`);
    if (!startNode || !endNode) {
      return;
    }

    const top = startNode.offsetTop - 4;
    const bottom = endNode.offsetTop + endNode.offsetHeight + 4;
    highlights.push(
      `<div class="block-highlight block-${block.type}" title="${escapeHtml(block.type)} ${escapeHtml(block.title)}" style="top:${top}px;height:${Math.max(32, bottom - top)}px;"></div>`,
    );
  });

  blockLayer.innerHTML = highlights.join("");
}

function syncScroll() {
  renderLayer.style.transform = `translate(${-editorInput.scrollLeft}px, ${-editorInput.scrollTop}px)`;
  blockLayer.style.transform = `translate(${-editorInput.scrollLeft}px, ${-editorInput.scrollTop}px)`;
  caretLayer.style.transform = `translate(${-editorInput.scrollLeft}px, ${-editorInput.scrollTop}px)`;
  lineGutter.style.transform = `translateY(${-editorInput.scrollTop}px)`;
}

function syncCaretIndicator(analysis) {
  if (hasSelection()) {
    caretIndicator.style.opacity = "0";
    return;
  }

  caretIndicator.style.opacity = "1";
  const rawOffset = editorInput.selectionStart;
  const lineIndex = lineIndexForOffset(analysis, rawOffset);

  const lineStart = analysis.lineStarts[lineIndex];
  const lineText = analysis.lines[lineIndex];
  const { x } = getCaretCoordinates(lineText, lineStart, rawOffset);
  const padY = getCssNumber("--editor-pad-y");
  const padX = getCssNumber("--editor-pad-x");
  const lineHeight = getCssNumber("--editor-line-height");

  caretIndicator.style.top = `${padY + lineIndex * lineHeight + 2}px`;
  caretIndicator.style.left = `${padX + x}px`;
}

function setSaveState(kind, text) {
  saveState.dataset.saveState = kind;
  saveState.textContent = text;
}

function updateIndentUi() {
  document.querySelectorAll("[data-indent-size]").forEach((button) => {
    const active = Number(button.dataset.indentSize) === indentSize;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  });
  indentState.textContent = `indent: ${indentSize} spaces`;
}

function updateStatusbar(analysis) {
  latestAnalysis = analysis;
  currentFileTitle.textContent = currentFile;
  workspaceState.textContent = workspaceApiAvailable
    ? `workspace: disk-backed / ${fileOrder.length} files`
    : "workspace: memory fallback";
  glyphState.textContent = `glyphs: ${glyphsOn ? "on" : "off"} / ${analysis.glyphCount}`;
  updateIndentUi();
  unitState.textContent = analysis.ready ? "unit: ready" : "unit: incomplete";
  issueState.textContent = `diagnostics: ${analysis.warnings.length} warning / ${analysis.errors.length} errors`;
  renderState.textContent = `projection: ${analysis.glyphCount} glyphs / ${analysis.blocks.length} blocks`;
  fileState.textContent = `file: ${currentFile}`;
  const { start, end } = normalizedSelectionRange();
  if (start === end) {
    cursorState.textContent = `selection: line ${padLine(lineIndexForOffset(analysis, start))}`;
    return;
  }

  const startLine = lineIndexForOffset(analysis, start);
  const endLine = lineIndexForOffset(analysis, Math.max(start, end - 1));
  cursorState.textContent = `selection: ${padLine(startLine)}-${padLine(endLine)} / ${end - start} chars`;
}

function updateSaveUi() {
  saveFile.disabled = saveInFlight;
  saveFile.textContent = saveInFlight ? "Saving..." : "Save";

  if (!workspaceApiAvailable) {
    setSaveState("volatile", "disk: api offline");
    return;
  }

  if (saveInFlight) {
    setSaveState("saving", "disk: saving");
    return;
  }

  if (fileDirty[currentFile]) {
    setSaveState("dirty", "disk: unsaved edits");
    return;
  }

  setSaveState("saved", `disk: saved / workspace/${currentFile}`);
}

function renderEditor() {
  const analysis = analyzeSource(fileSources[currentFile]);
  renderFileTree();
  renderGutter(analysis);
  renderLines(analysis);
  syncOverlayMetrics();
  renderBlocks(analysis);
  syncCaretIndicator(analysis);
  syncScroll();
  updateStatusbar(analysis);
  updateSaveUi();
}

function focusFile(fileName) {
  currentFile = fileName;
  editorInput.value = fileSources[currentFile];
  editorInput.scrollTop = 0;
  editorInput.scrollLeft = 0;
  renderEditor();
}

function replaceSelection(replacement, nextSelectionStart, nextSelectionEnd = nextSelectionStart) {
  const start = editorInput.selectionStart;
  const end = editorInput.selectionEnd;
  const nextValue = `${editorInput.value.slice(0, start)}${replacement}${editorInput.value.slice(end)}`;
  editorInput.value = nextValue;
  editorInput.setSelectionRange(nextSelectionStart, nextSelectionEnd);
  fileSources[currentFile] = nextValue;
  fileDirty[currentFile] = true;
  renderEditor();
}

function currentLineStart(value, offset) {
  return value.lastIndexOf("\n", Math.max(0, offset - 1)) + 1;
}

function currentLineEnd(value, offset) {
  const newlineIndex = value.indexOf("\n", offset);
  return newlineIndex === -1 ? value.length : newlineIndex;
}

function leadingSpaces(value, offset) {
  const lineStart = currentLineStart(value, offset);
  const lineEnd = currentLineEnd(value, offset);
  const line = value.slice(lineStart, lineEnd);
  return line.match(/^ */)?.[0] ?? "";
}

function handleIndent() {
  const start = editorInput.selectionStart;
  const end = editorInput.selectionEnd;
  const value = editorInput.value;
  const unit = indentUnit();

  if (start === end) {
    replaceSelection(unit, start + unit.length);
    return;
  }

  const lineStart = value.lastIndexOf("\n", start - 1) + 1;
  const selectionText = value.slice(lineStart, end);
  const indented = selectionText
    .split("\n")
    .map((line) => `${unit}${line}`)
    .join("\n");
  replaceSelection(
    indented,
    start + unit.length,
    end + unit.length * selectionText.split("\n").length,
  );
}

function handleOutdent() {
  const start = editorInput.selectionStart;
  const end = editorInput.selectionEnd;
  const value = editorInput.value;
  const unit = indentUnit();

  if (start === end) {
    const lineStart = currentLineStart(value, start);
    const lineEnd = currentLineEnd(value, start);
    const line = value.slice(lineStart, lineEnd);
    const removable = line.startsWith(unit)
      ? unit.length
      : line.startsWith(" ")
        ? Math.min(indentSize, line.match(/^ +/)?.[0]?.length ?? 0)
        : 0;
    if (removable === 0) {
      return;
    }
    editorInput.selectionStart = lineStart;
    editorInput.selectionEnd = lineStart + removable;
    const nextOffset = Math.max(lineStart, start - removable);
    replaceSelection("", nextOffset);
    return;
  }

  const lineStart = value.lastIndexOf("\n", start - 1) + 1;
  const selectionText = value.slice(lineStart, end);
  const lines = selectionText.split("\n");
  let removedBeforeStart = 0;
  let removedTotal = 0;

  const outdented = lines
    .map((line, index) => {
      const removable = line.startsWith(unit)
        ? unit.length
        : line.startsWith(" ")
          ? Math.min(indentSize, line.match(/^ +/)[0].length)
          : 0;
      if (index === 0) {
        removedBeforeStart = Math.min(removable, start - lineStart);
      }
      removedTotal += removable;
      return line.slice(removable);
    })
    .join("\n");

  const nextStart = Math.max(lineStart, start - removedBeforeStart);
  const nextEnd = Math.max(nextStart, end - removedTotal);
  editorInput.selectionStart = lineStart;
  editorInput.selectionEnd = end;
  replaceSelection(outdented, nextStart, nextEnd);
}

function handleNewlineIndent() {
  const start = editorInput.selectionStart;
  const value = editorInput.value;
  const inheritedIndent = leadingSpaces(value, start);
  replaceSelection(`\n${inheritedIndent}`, start + 1 + inheritedIndent.length);
}

function handleBackspaceIndent() {
  const start = editorInput.selectionStart;
  const end = editorInput.selectionEnd;
  if (start !== end || start === 0) {
    return false;
  }

  const value = editorInput.value;
  const lineStart = currentLineStart(value, start);
  const linePrefix = value.slice(lineStart, start);
  if (!/^ +$/.test(linePrefix)) {
    return false;
  }

  const removeCount = Math.min(indentSize, linePrefix.length);
  if (removeCount <= 0) {
    return false;
  }

  editorInput.selectionStart = start - removeCount;
  editorInput.selectionEnd = start;
  replaceSelection("", start - removeCount);
  return true;
}

async function loadWorkspace() {
  try {
    const response = await fetch(workspaceApiBase, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`workspace load failed with ${response.status}`);
    }

    const payload = await response.json();
    const files = payload.files || {};
    const loadedNames = [primaryFile].filter((fileName) => typeof files[fileName] === "string");

    if (loadedNames.length > 0) {
      fileOrder = loadedNames;
      loadedNames.forEach((fileName) => {
        fileSources[fileName] = files[fileName];
        fileDirty[fileName] = false;
      });
      currentFile = primaryFile;
    }

    workspaceApiAvailable = true;
  } catch (error) {
    console.error(error);
    workspaceApiAvailable = false;
    [primaryFile].forEach((fileName) => {
      if (!(fileName in fileDirty)) {
        fileDirty[fileName] = false;
      }
    });
  }
}

async function saveCurrentFile() {
  if (saveInFlight) {
    return;
  }

  if (!workspaceApiAvailable) {
    setSaveState("volatile", "disk: api offline");
    return;
  }

  saveInFlight = true;
  updateSaveUi();

  try {
    const response = await fetch(`${workspaceApiBase}/${encodeURIComponent(currentFile)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: editorInput.value }),
    });

    if (!response.ok) {
      throw new Error(`save failed with ${response.status}`);
    }

    await response.json();
    fileSources[currentFile] = editorInput.value;
    fileDirty[currentFile] = false;
    renderEditor();
  } catch (error) {
    console.error(error);
    setSaveState("error", "disk: save failed");
  } finally {
    saveInFlight = false;
    updateSaveUi();
  }
}

toggleSidebar.addEventListener("click", () => {
  sidebarOpen = !sidebarOpen;
  syncSidebar();
});

closeSidebar.addEventListener("click", () => {
  sidebarOpen = false;
  syncSidebar();
});

drawerTabs.forEach((button) => {
  button.addEventListener("click", () => {
    activeDrawerTab = button.dataset.drawerTab;
    sidebarOpen = true;
    syncSidebar();
  });
});

toggleGlyphs.addEventListener("click", () => {
  glyphsOn = !glyphsOn;
  document.body.classList.toggle("glyphs-off", !glyphsOn);
  toggleGlyphs.setAttribute("aria-pressed", String(glyphsOn));
  toggleGlyphs.setAttribute("aria-label", glyphsOn ? "Disable glyph rendering" : "Enable glyph rendering");
  toggleGlyphs.setAttribute("title", glyphsOn ? "Disable glyph rendering" : "Enable glyph rendering");
  renderEditor();
});

indentControl.querySelectorAll("[data-indent-size]").forEach((button) => {
  button.addEventListener("click", () => {
    indentSize = Number(button.dataset.indentSize) || 2;
    updateIndentUi();
  });
});

highlightPaletteButton.addEventListener("click", () => {
  paletteMenuOpen = !paletteMenuOpen;
  blockSurfaceMenuOpen = false;
  lineHighlightMenuOpen = false;
  syncGlyphHighlightUi();
});

highlightPaletteOptions.addEventListener("click", (event) => {
  const option = event.target.closest("[data-palette-key]");
  if (!option) {
    return;
  }

  const palette = glyphPaletteOptions.find((entry) => entry.key === option.dataset.paletteKey);
  if (!palette) {
    return;
  }

  activePaletteKey = palette.key;
  applySharedGlyphColor(palette.color);
  paletteMenuOpen = false;
  applyEditorTheme();
  applyBlockSurfaceTheme();
  applyGlyphColors();
  syncGlyphHighlightUi();
  persistGlyphHighlights();
});

blockSurfaceButton.addEventListener("click", () => {
  blockSurfaceMenuOpen = !blockSurfaceMenuOpen;
  paletteMenuOpen = false;
  lineHighlightMenuOpen = false;
  syncGlyphHighlightUi();
});

blockSurfaceOptions.addEventListener("click", (event) => {
  const option = event.target.closest("[data-block-surface-key]");
  if (!option) {
    return;
  }

  const preset = blockSurfacePresets.find((entry) => entry.key === option.dataset.blockSurfaceKey);
  if (!preset) {
    return;
  }

  activeBlockSurfaceKey = preset.key;
  blockSurfaceMenuOpen = false;
  applyBlockSurfaceTheme();
  syncGlyphHighlightUi();
  persistGlyphHighlights();
});

lineHighlightButton.addEventListener("click", () => {
  lineHighlightMenuOpen = !lineHighlightMenuOpen;
  paletteMenuOpen = false;
  blockSurfaceMenuOpen = false;
  syncGlyphHighlightUi();
});

lineHighlightOptions.addEventListener("click", (event) => {
  const option = event.target.closest("[data-line-highlight-key]");
  if (!option) {
    return;
  }

  const preset = lineHighlightPresets.find((entry) => entry.key === option.dataset.lineHighlightKey);
  if (!preset) {
    return;
  }

  activeLineHighlightKey = preset.key;
  lineHighlightMenuOpen = false;
  applyLineHighlightTheme();
  syncGlyphHighlightUi();
  persistGlyphHighlights();
});

glyphColorList.addEventListener("click", (event) => {
  const toggle = event.target.closest("[data-glyph-toggle]");
  if (toggle) {
    const key = toggle.dataset.glyphToggle;
    openGlyphColorMenu = openGlyphColorMenu === key ? null : key;
    syncGlyphHighlightUi();
    return;
  }

  const option = event.target.closest("[data-glyph-option-key]");
  if (!option) {
    return;
  }

  const key = option.dataset.glyphOptionKey;
  glyphColors[key] = normalizeHexColor(option.dataset.glyphOption, glyphColors[key]);
  openGlyphColorMenu = null;
  applyGlyphColors();
  syncGlyphHighlightUi();
  persistGlyphHighlights();
});

glyphColorList.addEventListener("input", (event) => {
  const text = event.target.closest("[data-glyph-value]");
  if (!text) {
    return;
  }

  const key = text.dataset.glyphValue;
  const normalized = normalizeHexColor(text.value, null);
  if (!normalized) {
    return;
  }

  glyphColors[key] = normalized;
  applyGlyphColors();
  syncGlyphHighlightUi();
  persistGlyphHighlights();
});

glyphColorList.addEventListener("change", (event) => {
  const text = event.target.closest("[data-glyph-value]");
  if (!text) {
    return;
  }

  const key = text.dataset.glyphValue;
  text.value = glyphColors[key].toUpperCase();
});

document.addEventListener("click", (event) => {
  if (!event.target.closest("#highlightPaletteButton") && !event.target.closest("#highlightPaletteOptions")) {
    if (paletteMenuOpen) {
      paletteMenuOpen = false;
      syncGlyphHighlightUi();
    }
  }

  if (!event.target.closest("#blockSurfaceButton") && !event.target.closest("#blockSurfaceOptions")) {
    if (blockSurfaceMenuOpen) {
      blockSurfaceMenuOpen = false;
      syncGlyphHighlightUi();
    }
  }

  if (!event.target.closest("#lineHighlightButton") && !event.target.closest("#lineHighlightOptions")) {
    if (lineHighlightMenuOpen) {
      lineHighlightMenuOpen = false;
      syncGlyphHighlightUi();
    }
  }

  if (!event.target.closest("#glyphColorList") && openGlyphColorMenu !== null) {
    openGlyphColorMenu = null;
    syncGlyphHighlightUi();
  }
});

saveFile.addEventListener("click", () => {
  saveCurrentFile();
});

editorInput.addEventListener("input", () => {
  fileSources[currentFile] = editorInput.value;
  fileDirty[currentFile] = true;
  renderEditor();
});

editorInput.addEventListener("select", () => {
  renderEditor();
});

editorInput.addEventListener("scroll", () => {
  syncScroll();
});

editorInput.addEventListener("click", () => {
  renderEditor();
});

editorInput.addEventListener("keyup", () => {
  renderEditor();
});

editorInput.addEventListener("copy", (event) => {
  const selection = selectedSourceText();
  if (!selection) {
    return;
  }

  event.preventDefault();
  event.clipboardData?.setData("text/plain", selection);
});

editorInput.addEventListener("cut", (event) => {
  const { start, end } = normalizedSelectionRange();
  if (start === end) {
    return;
  }

  event.preventDefault();
  event.clipboardData?.setData("text/plain", selectedSourceText());
  editorInput.setSelectionRange(start, end);
  replaceSelection("", start);
});

editorInput.addEventListener("paste", (event) => {
  const pasted = event.clipboardData?.getData("text/plain");
  if (typeof pasted !== "string") {
    return;
  }

  event.preventDefault();
  const normalized = pasted.replace(/\r\n?/g, "\n");
  const { start } = normalizedSelectionRange();
  replaceSelection(normalized, start + normalized.length);
});

codeStage.addEventListener("mousedown", (event) => {
  if (event.button !== 0) {
    return;
  }

  event.preventDefault();

  if (!latestAnalysis) {
    return;
  }

  stopPointerSelection();
  const anchor = rawOffsetForPointer(event, latestAnalysis);
  pointerSelectionAnchor = anchor;

  editorInput.focus();
  setSelectionFromAnchor(anchor, anchor);
  renderEditor();

  const handlePointerMove = (moveEvent) => {
    if (!latestAnalysis || pointerSelectionAnchor === null) {
      return;
    }

    const focus = rawOffsetForPointer(moveEvent, latestAnalysis);
    setSelectionFromAnchor(pointerSelectionAnchor, focus);
    renderEditor();
  };

  const handlePointerUp = (upEvent) => {
    if (!latestAnalysis || pointerSelectionAnchor === null) {
      stopPointerSelection();
      return;
    }

    const focus = rawOffsetForPointer(upEvent, latestAnalysis);
    setSelectionFromAnchor(pointerSelectionAnchor, focus);
    renderEditor();
    stopPointerSelection();
  };

  window.addEventListener("mousemove", handlePointerMove);
  window.addEventListener("mouseup", handlePointerUp, { once: true });
  pointerSelectionCleanup = () => {
    window.removeEventListener("mousemove", handlePointerMove);
    window.removeEventListener("mouseup", handlePointerUp);
  };
});

document.addEventListener("keydown", (event) => {
  if (document.activeElement !== editorInput) {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
      event.preventDefault();
      saveCurrentFile();
    }
    return;
  }

  if (event.key === "Tab") {
    event.preventDefault();
    if (event.shiftKey) {
      handleOutdent();
    } else {
      handleIndent();
    }
    return;
  }

  if (event.key === "Enter") {
    event.preventDefault();
    handleNewlineIndent();
    return;
  }

  if (event.key === "Backspace" && handleBackspaceIndent()) {
    event.preventDefault();
    return;
  }

  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
    event.preventDefault();
    saveCurrentFile();
    return;
  }

  if (
    !event.altKey &&
    [
      "ArrowLeft",
      "ArrowRight",
      "ArrowUp",
      "ArrowDown",
      "Home",
      "End",
      "PageUp",
      "PageDown",
    ].includes(event.key)
  ) {
    scheduleNativeRender();
  }
});

window.addEventListener("beforeunload", (event) => {
  if (!Object.values(fileDirty).some(Boolean)) {
    return;
  }

  event.preventDefault();
  event.returnValue = "";
});

async function bootstrap() {
  [primaryFile].forEach((fileName) => {
    fileDirty[fileName] = false;
  });

  loadGlyphHighlightState();
  renderGlyphHighlightControls();
  toggleGlyphs.setAttribute("aria-pressed", String(glyphsOn));
  toggleGlyphs.setAttribute("aria-label", "Disable glyph rendering");
  toggleGlyphs.setAttribute("title", "Disable glyph rendering");
  updateIndentUi();
  syncSidebar();
  await loadWorkspace();
  focusFile(currentFile);
}

bootstrap();
