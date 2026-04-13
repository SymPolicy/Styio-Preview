const workspaceApiBase = "/api/workspace";
const primaryFile = "main.styio";
const defaultCreateLeafNames = {
  file: "new_file.styio",
  folder: "new_folder",
};
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
const fileTabs = document.getElementById("fileTabs");
const fileTree = document.getElementById("fileTree");
const saveState = document.getElementById("saveState");
const autoSaveState = document.getElementById("autoSaveState");
const glyphState = document.getElementById("glyphState");
const indentState = document.getElementById("indentState");
const unitState = document.getElementById("unitState");
const cursorState = document.getElementById("cursorState");
const issueState = document.getElementById("issueState");
const renderState = document.getElementById("renderState");
const workspacePathHint = document.getElementById("workspacePathHint");
const workspaceTitle = document.getElementById("workspaceTitle");
const workspacePathDisplay = document.getElementById("workspacePathDisplay");
const workspacePathViewport = document.getElementById("workspacePathViewport");
const workspacePathTrack = document.getElementById("workspacePathTrack");
const workspacePathScrollVisual = document.getElementById("workspacePathScrollVisual");
const workspacePathScrollThumb = document.getElementById("workspacePathScrollThumb");
const workspacePathText = document.getElementById("workspacePathText");
const workspacePathApply = document.getElementById("workspacePathApply");
const createFolderButton = document.getElementById("createFolderButton");
const quickCreateFileButton = document.getElementById("quickCreateFileButton");
const refreshWorkspaceButton = document.getElementById("refreshWorkspaceButton");
const bulkDeleteButton = document.getElementById("bulkDeleteButton");
const workspaceMoreButton = document.getElementById("workspaceMoreButton");
const workspaceCallout = document.getElementById("workspaceCallout");
const workspaceCalloutTitle = document.getElementById("workspaceCalloutTitle");
const workspaceCalloutBody = document.getElementById("workspaceCalloutBody");
const workspaceCalloutOpen = document.getElementById("workspaceCalloutOpen");
const workspacePickerOverlay = document.getElementById("workspacePickerOverlay");
const workspacePickerClose = document.getElementById("workspacePickerClose");
const workspacePickerTitle = document.getElementById("workspacePickerTitle");
const workspacePickerCaption = document.getElementById("workspacePickerCaption");
const workspacePickerUp = document.getElementById("workspacePickerUp");
const workspacePickerCurrent = document.getElementById("workspacePickerCurrent");
const workspacePickerBreadcrumbs = document.getElementById("workspacePickerBreadcrumbs");
const workspacePickerList = document.getElementById("workspacePickerList");
const workspacePickerConfirm = document.getElementById("workspacePickerConfirm");
const appToast = document.getElementById("appToast");
const appToastText = document.getElementById("appToastText");
const appDialogOverlay = document.getElementById("appDialogOverlay");
const appDialogClose = document.getElementById("appDialogClose");
const appDialogTitle = document.getElementById("appDialogTitle");
const appDialogMessage = document.getElementById("appDialogMessage");
const appDialogInputField = document.getElementById("appDialogInputField");
const appDialogInput = document.getElementById("appDialogInput");
const appDialogTextareaField = document.getElementById("appDialogTextareaField");
const appDialogTextarea = document.getElementById("appDialogTextarea");
const appDialogList = document.getElementById("appDialogList");
const appDialogCancel = document.getElementById("appDialogCancel");
const appDialogConfirm = document.getElementById("appDialogConfirm");
const toggleGlyphs = document.getElementById("toggleGlyphs");
const languageTitle = document.getElementById("languageTitle");
const indentControl = document.getElementById("indentControl");
const saveFile = document.getElementById("saveFile");
const autoSaveTitle = document.getElementById("autoSaveTitle");
const themeTitle = document.getElementById("themeTitle");
const themeColorCardTitle = document.getElementById("themeColorCardTitle");
const themeFontCardTitle = document.getElementById("themeFontCardTitle");
const themeConfigTitle = document.getElementById("themeConfigTitle");
const themePaletteTitle = document.getElementById("themePaletteTitle");
const themeTextTitle = document.getElementById("themeTextTitle");
const themeColorTitle = document.getElementById("themeColorTitle");
const themeBackgroundTitle = document.getElementById("themeBackgroundTitle");
const themeLineTitle = document.getElementById("themeLineTitle");
const interfaceFontTitle = document.getElementById("interfaceFontTitle");
const interfaceSizeTitle = document.getElementById("interfaceSizeTitle");
const editorTitle = document.getElementById("editorTitle");
const editorFontCardTitle = document.getElementById("editorFontCardTitle");
const editorColorCardTitle = document.getElementById("editorColorCardTitle");
const tabSizeTitle = document.getElementById("tabSizeTitle");
const editorFontTitle = document.getElementById("editorFontTitle");
const editorFontSizeTitle = document.getElementById("editorFontSizeTitle");
const editorPaletteTitle = document.getElementById("editorPaletteTitle");
const editorBackgroundTitle = document.getElementById("editorBackgroundTitle");
const textColorTitle = document.getElementById("textColorTitle");
const textHighlightTitle = document.getElementById("textHighlightTitle");
const blockTitle = document.getElementById("blockTitle");
const lineTitle = document.getElementById("lineTitle");
const selectionTitle = document.getElementById("selectionTitle");
const importThemeConfigButton = document.getElementById("importThemeConfigButton");
const editThemeConfigButton = document.getElementById("editThemeConfigButton");
const languageModeButton = document.getElementById("languageModeButton");
const languageModeOptions = document.getElementById("languageModeOptions");
const autoSaveModeButton = document.getElementById("autoSaveModeButton");
const autoSaveModeOptions = document.getElementById("autoSaveModeOptions");
const autoSaveDelayField = document.getElementById("autoSaveDelayField");
const autoSaveDelayInput = document.getElementById("autoSaveDelayInput");
const autoSaveDelayLabel = document.getElementById("autoSaveDelayLabel");
const themeModeToggle = document.getElementById("themeModeToggle");
const themeModeDark = document.getElementById("themeModeDark");
const themeModeLight = document.getElementById("themeModeLight");
const themePaletteButton = document.getElementById("themePaletteButton");
const themePaletteOptionsMenu = document.getElementById("themePaletteOptions");
const themeTextButton = document.getElementById("themeTextButton");
const themeTextOptions = document.getElementById("themeTextOptions");
const themeColorButton = document.getElementById("themeColorButton");
const themeColorOptions = document.getElementById("themeColorOptions");
const themeBackgroundButton = document.getElementById("themeBackgroundButton");
const themeBackgroundOptions = document.getElementById("themeBackgroundOptions");
const themeLineButton = document.getElementById("themeLineButton");
const themeLineOptions = document.getElementById("themeLineOptions");
const interfaceFontButton = document.getElementById("interfaceFontButton");
const interfaceFontOptions = document.getElementById("interfaceFontOptions");
const interfaceSizeControl = document.getElementById("interfaceSizeControl");
const interfaceSizeDecrease = document.getElementById("interfaceSizeDecrease");
const interfaceSizeIncrease = document.getElementById("interfaceSizeIncrease");
const interfaceSizeValue = document.getElementById("interfaceSizeValue");
const glyphCompositionTitle = document.getElementById("glyphCompositionTitle");
const editorFontButton = document.getElementById("editorFontButton");
const editorFontOptions = document.getElementById("editorFontOptions");
const editorFontSizeControl = document.getElementById("editorFontSizeControl");
const editorFontSizeDecrease = document.getElementById("editorFontSizeDecrease");
const editorFontSizeIncrease = document.getElementById("editorFontSizeIncrease");
const editorFontSizeValue = document.getElementById("editorFontSizeValue");
const editorModeToggle = document.getElementById("editorModeToggle");
const editorModeDark = document.getElementById("editorModeDark");
const editorModeLight = document.getElementById("editorModeLight");
const highlightPaletteButton = document.getElementById("highlightPaletteButton");
const highlightPaletteOptions = document.getElementById("highlightPaletteOptions");
const editorBackgroundButton = document.getElementById("editorBackgroundButton");
const editorBackgroundOptions = document.getElementById("editorBackgroundOptions");
const textColorButton = document.getElementById("textColorButton");
const textColorOptions = document.getElementById("textColorOptions");
const textHighlightButton = document.getElementById("textHighlightButton");
const textHighlightOptions = document.getElementById("textHighlightOptions");
const blockSurfaceButton = document.getElementById("blockSurfaceButton");
const blockSurfaceOptions = document.getElementById("blockSurfaceOptions");
const lineHighlightButton = document.getElementById("lineHighlightButton");
const lineHighlightOptions = document.getElementById("lineHighlightOptions");
const selectionHighlightButton = document.getElementById("selectionHighlightButton");
const selectionHighlightOptions = document.getElementById("selectionHighlightOptions");
const symbolColorsTitle = document.getElementById("symbolColorsTitle");
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
let workspaceRootPath = "";
let workspaceName = "workspace";
let workspaceEntries = [];
let workspaceFiles = [primaryFile];
let workspaceLoadedFiles = new Set();
let saveInFlight = false;
let latestAnalysis = null;
let sidebarOpen = false;
let activeDrawerTab = "files";
let indentSize = 2;
let activeLanguageKey = "zhCn";
let languageMenuOpen = false;
let autoSaveMode = "afterDelay";
let autoSaveDelay = 1000;
let autoSaveMenuOpen = false;
let autoSaveTimer = null;
let themeMode = "dark";
let themePaletteMenuOpen = false;
let themeColorMenuOpen = false;
let themeBackgroundMenuOpen = false;
let interfaceFontMenuOpen = false;
let themeTextMenuOpen = false;
let themeLineMenuOpen = false;
let editorFontMenuOpen = false;
let openGlyphColorMenu = null;
let paletteMenuOpen = false;
let editorBackgroundMenuOpen = false;
let textColorMenuOpen = false;
let textHighlightMenuOpen = false;
let blockSurfaceMenuOpen = false;
let lineHighlightMenuOpen = false;
let selectionHighlightMenuOpen = false;
let editorMode = "dark";
let activeThemePaletteKey = "graphiteGold";
let activeThemeColorKey = "defaultGold";
let activeThemeBackgroundKey = "graphite";
let activeThemeTextKey = "mist";
let activeInterfaceFontKey = "defaultSans";
let activeInterfaceSizeKey = "15";
let activeEditorFontKey = "jetbrainsMono";
let activeEditorFontSizeKey = "15";
let activePaletteKey = "default";
let activeEditorBackgroundKey = "graphite";
let activeEditorTextColorKey = "mist";
let activeEditorTextHighlightKey = "defaultGold";
let activeThemeLineKey = "soft";
let activeBlockSurfaceKey = "graphite";
let activeLineHighlightKey = "graphite";
let activeSelectionHighlightKey = "graphite";
let pointerSelectionAnchor = null;
let pointerSelectionCleanup = null;
let pendingNativeRenderFrame = 0;
let workspacePickerPath = "";
let workspacePickerParentPath = null;
let workspacePickerMode = "directory";
let workspacePickerIncludeFiles = false;
let workspacePickerSelectedFilePath = "";
let workspacePickerConfirmAction = null;
let workspacePickerTitleText = "";
let workspacePickerDefaultCaptionText = "";
let workspacePickerConfirmText = "";
let openFileActionMenu = null;
let pendingDeleteFile = null;
let bulkDeleteMode = false;
let selectedTreePaths = new Set();
let activeTreePath = "";
let expandedTreePaths = new Set();
let workspacePathDrag = null;
let activeDialogResolver = null;
let appToastTimer = null;
const glyphHighlightStorageKey = "styio-view:glyph-highlights";
const autoSaveStorageKey = "styio-view:auto-save";
const languageStorageKey = "styio-view:language";
const themeSettingsStorageKey = "styio-view:theme-settings";
const editorSettingsStorageKey = "styio-view:editor-settings";
const customPaletteConfigStorageKey = "styio-view:custom-palette-config";
const customPaletteConfigSchema = "https://styio.dev/schemas/theme-customizations.json";
const refreshWorkspaceSvg = `
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path>
    <path d="M21 3v5h-5"></path>
    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path>
    <path d="M8 16H3v5"></path>
  </svg>
`;
const cancelSelectionSvg = `
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M18 6 6 18"></path>
    <path d="m6 6 12 12"></path>
  </svg>
`;
function sidebarToggleSvg(isOpen) {
  return `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="2"></rect>
      <path d="M15 3v18"></path>
      ${
        isOpen
          ? '<path d="m8 9 3 3-3 3"></path>'
          : '<path d="m10 15-3-3 3-3"></path>'
      }
    </svg>
  `;
}
const autoSaveModeOptionsList = [
  { key: "off", label: "Off" },
  { key: "afterDelay", label: "After Delay" },
  { key: "onFocusChange", label: "On Focus Change" },
  { key: "onWindowChange", label: "On Window Change" },
];
const languageOptionsList = [
  { key: "zhCn", label: "中文" },
  { key: "en", label: "English" },
];
const themeColorPresets = [
  {
    key: "defaultGold",
    label: "Gold",
    vars: {
      "--accent": "#f4c76a",
      "--accent-2": "#ffb15c",
      "--accent-3": "#f4c76a",
      "--brand-color": "rgba(244, 199, 106, 0.96)",
      "--brand-glow": "rgba(244, 199, 106, 0.08)",
    },
  },
  {
    key: "violet",
    label: "Violet",
    vars: {
      "--accent": "#8b5cf6",
      "--accent-2": "#a78bfa",
      "--accent-3": "#c4b5fd",
      "--brand-color": "rgba(196, 181, 253, 0.96)",
      "--brand-glow": "rgba(196, 181, 253, 0.08)",
    },
  },
  {
    key: "ice",
    label: "Ice Blue",
    vars: {
      "--accent": "#60a5fa",
      "--accent-2": "#7dd3fc",
      "--accent-3": "#93c5fd",
      "--brand-color": "rgba(147, 197, 253, 0.96)",
      "--brand-glow": "rgba(147, 197, 253, 0.08)",
    },
  },
  {
    key: "emerald",
    label: "Emerald",
    vars: {
      "--accent": "#34D399",
      "--accent-2": "#6EE7B7",
      "--accent-3": "#A7F3D0",
      "--brand-color": "rgba(110, 231, 183, 0.96)",
      "--brand-glow": "rgba(110, 231, 183, 0.08)",
    },
  },
  {
    key: "quartz",
    label: "Quartz",
    vars: {
      "--accent": "#E5E7EB",
      "--accent-2": "#F3F4F6",
      "--accent-3": "#D1D5DB",
      "--brand-color": "rgba(243, 244, 246, 0.96)",
      "--brand-glow": "rgba(243, 244, 246, 0.08)",
    },
  },
  {
    key: "rose",
    label: "Rose",
    vars: {
      "--accent": "#F472B6",
      "--accent-2": "#F9A8D4",
      "--accent-3": "#FBCFE8",
      "--brand-color": "rgba(249, 168, 212, 0.96)",
      "--brand-glow": "rgba(249, 168, 212, 0.08)",
    },
  },
];
const themeBackgroundPresets = [
  {
    key: "graphite",
    label: "Graphite",
    mode: "dark",
    vars: {
      "--bg": "#0f1115",
      "--bg-2": "#171a21",
      "--panel": "rgba(19, 21, 26, 0.84)",
      "--panel-2": "rgba(255, 255, 255, 0.025)",
      "--shell-bg": "rgba(10, 12, 16, 0.46)",
      "--line": "rgba(255, 255, 255, 0.07)",
      "--line-strong": "rgba(255, 255, 255, 0.12)",
      "--text": "#edf1f4",
      "--muted": "#98a0aa",
    },
  },
  {
    key: "midnight",
    label: "Midnight",
    mode: "dark",
    vars: {
      "--bg": "#0b0f16",
      "--bg-2": "#121822",
      "--panel": "rgba(13, 17, 24, 0.88)",
      "--panel-2": "rgba(255, 255, 255, 0.02)",
      "--shell-bg": "rgba(8, 11, 18, 0.52)",
      "--line": "rgba(255, 255, 255, 0.065)",
      "--line-strong": "rgba(255, 255, 255, 0.11)",
      "--text": "#edf1f4",
      "--muted": "#92a0b3",
    },
  },
  {
    key: "carbon",
    label: "Carbon",
    mode: "dark",
    vars: {
      "--bg": "#131313",
      "--bg-2": "#1a1a1a",
      "--panel": "rgba(22, 22, 22, 0.86)",
      "--panel-2": "rgba(255, 255, 255, 0.022)",
      "--shell-bg": "rgba(14, 14, 14, 0.52)",
      "--line": "rgba(255, 255, 255, 0.065)",
      "--line-strong": "rgba(255, 255, 255, 0.105)",
      "--text": "#f2f2f2",
      "--muted": "#a0a0a0",
    },
  },
  {
    key: "fog",
    label: "Fog",
    mode: "dark",
    vars: {
      "--bg": "#101317",
      "--bg-2": "#181d23",
      "--panel": "rgba(21, 25, 31, 0.82)",
      "--panel-2": "rgba(255, 255, 255, 0.03)",
      "--shell-bg": "rgba(13, 16, 21, 0.48)",
      "--line": "rgba(255, 255, 255, 0.075)",
      "--line-strong": "rgba(255, 255, 255, 0.125)",
      "--text": "#edf1f4",
      "--muted": "#9aa5b1",
    },
  },
  {
    key: "obsidian",
    label: "Obsidian",
    mode: "dark",
    vars: {
      "--bg": "#090B0F",
      "--bg-2": "#11151B",
      "--panel": "rgba(13, 16, 21, 0.9)",
      "--panel-2": "rgba(255, 255, 255, 0.018)",
      "--shell-bg": "rgba(7, 9, 13, 0.6)",
      "--line": "rgba(255, 255, 255, 0.055)",
      "--line-strong": "rgba(255, 255, 255, 0.095)",
      "--text": "#F3F4F6",
      "--muted": "#9CA3AF",
    },
  },
  {
    key: "blueprint",
    label: "Blueprint",
    mode: "dark",
    vars: {
      "--bg": "#0D1320",
      "--bg-2": "#151D2C",
      "--panel": "rgba(16, 22, 34, 0.88)",
      "--panel-2": "rgba(147, 197, 253, 0.025)",
      "--shell-bg": "rgba(10, 16, 28, 0.56)",
      "--line": "rgba(148, 163, 184, 0.08)",
      "--line-strong": "rgba(148, 163, 184, 0.13)",
      "--text": "#E5EDF8",
      "--muted": "#8FA2BC",
    },
  },
  {
    key: "paper",
    label: "Paper",
    mode: "light",
    vars: {
      "--bg": "#F5F6F8",
      "--bg-2": "#ECEEF2",
      "--panel": "rgba(255, 255, 255, 0.9)",
      "--panel-2": "rgba(17, 17, 17, 0.022)",
      "--shell-bg": "rgba(255, 255, 255, 0.82)",
      "--line": "rgba(17, 17, 17, 0.12)",
      "--line-strong": "rgba(17, 17, 17, 0.2)",
      "--text": "#111111",
      "--muted": "#4F5560",
    },
  },
  {
    key: "porcelain",
    label: "Porcelain",
    mode: "light",
    vars: {
      "--bg": "#F4F7FB",
      "--bg-2": "#EAF0F7",
      "--panel": "rgba(255, 255, 255, 0.88)",
      "--panel-2": "rgba(17, 17, 17, 0.02)",
      "--shell-bg": "rgba(255, 255, 255, 0.78)",
      "--line": "rgba(17, 17, 17, 0.12)",
      "--line-strong": "rgba(17, 17, 17, 0.19)",
      "--text": "#111111",
      "--muted": "#556274",
    },
  },
  {
    key: "linen",
    label: "Linen",
    mode: "light",
    vars: {
      "--bg": "#FAF7F2",
      "--bg-2": "#F2EDE4",
      "--panel": "rgba(255, 255, 255, 0.84)",
      "--panel-2": "rgba(17, 17, 17, 0.02)",
      "--shell-bg": "rgba(255, 255, 255, 0.74)",
      "--line": "rgba(17, 17, 17, 0.12)",
      "--line-strong": "rgba(17, 17, 17, 0.19)",
      "--text": "#111111",
      "--muted": "#61584C",
    },
  },
];
const themeTextPresets = [
  { key: "mist", label: "Mist", mode: "dark", vars: { "--text": "#EDF1F4" } },
  { key: "bright", label: "Bright", mode: "dark", vars: { "--text": "#F8FAFC" } },
  { key: "cool", label: "Cool", mode: "dark", vars: { "--text": "#E2E8F0" } },
  { key: "ink", label: "Ink", mode: "light", vars: { "--text": "#111111" } },
  { key: "graphiteText", label: "Graphite", mode: "light", vars: { "--text": "#1A1A1A" } },
];
const themeLinePresets = [
  {
    key: "soft",
    label: "Soft",
    mode: "dark",
    vars: {
      "--line": "rgba(255, 255, 255, 0.07)",
      "--line-strong": "rgba(255, 255, 255, 0.12)",
    },
  },
  {
    key: "crisp",
    label: "Crisp",
    mode: "dark",
    vars: {
      "--line": "rgba(255, 255, 255, 0.1)",
      "--line-strong": "rgba(255, 255, 255, 0.16)",
    },
  },
  {
    key: "coolLines",
    label: "Cool",
    mode: "dark",
    vars: {
      "--line": "rgba(148, 163, 184, 0.12)",
      "--line-strong": "rgba(148, 163, 184, 0.18)",
    },
  },
  {
    key: "paperLines",
    label: "Paper",
    mode: "light",
    vars: {
      "--line": "rgba(17, 17, 17, 0.12)",
      "--line-strong": "rgba(17, 17, 17, 0.2)",
    },
  },
];
const themePalettePresets = [
  {
    key: "graphiteGold",
    label: "Graphite Gold",
    mode: "dark",
    themeColorKey: "defaultGold",
    themeTextKey: "mist",
    themeBackgroundKey: "graphite",
    themeLineKey: "soft",
  },
  {
    key: "blueprintIce",
    label: "Blueprint Ice",
    mode: "dark",
    themeColorKey: "ice",
    themeTextKey: "cool",
    themeBackgroundKey: "blueprint",
    themeLineKey: "coolLines",
  },
  {
    key: "obsidianQuartz",
    label: "Obsidian Quartz",
    mode: "dark",
    themeColorKey: "quartz",
    themeTextKey: "bright",
    themeBackgroundKey: "obsidian",
    themeLineKey: "crisp",
  },
  {
    key: "violetSignal",
    label: "Violet Signal",
    mode: "dark",
    themeColorKey: "violet",
    themeTextKey: "mist",
    themeBackgroundKey: "fog",
    themeLineKey: "soft",
  },
  {
    key: "paperGold",
    label: "Paper Gold",
    mode: "light",
    themeColorKey: "defaultGold",
    themeTextKey: "ink",
    themeBackgroundKey: "paper",
    themeLineKey: "paperLines",
  },
  {
    key: "porcelainIce",
    label: "Porcelain Ice",
    mode: "light",
    themeColorKey: "ice",
    themeTextKey: "ink",
    themeBackgroundKey: "porcelain",
    themeLineKey: "paperLines",
  },
  {
    key: "linenRose",
    label: "Linen Rose",
    mode: "light",
    themeColorKey: "rose",
    themeTextKey: "ink",
    themeBackgroundKey: "linen",
    themeLineKey: "paperLines",
  },
];
const interfaceFontOptionsList = [
  { key: "defaultSans", label: "Default Sans", value: '"IBM Plex Sans", "Inter", "Noto Sans", sans-serif' },
  { key: "inter", label: "Inter", value: '"Inter", "IBM Plex Sans", "Noto Sans", sans-serif' },
  { key: "plexSans", label: "IBM Plex Sans", value: '"IBM Plex Sans", "Inter", "Noto Sans", sans-serif' },
  { key: "recursiveSans", label: "Recursive Sans", value: '"Recursive", "Inter", "IBM Plex Sans", sans-serif' },
  { key: "spaceGrotesk", label: "Space Grotesk", value: '"Space Grotesk", "Inter", "IBM Plex Sans", sans-serif' },
  { key: "plusJakartaSans", label: "Plus Jakarta Sans", value: '"Plus Jakarta Sans", "Inter", "IBM Plex Sans", sans-serif' },
  { key: "sora", label: "Sora", value: '"Sora", "Inter", "IBM Plex Sans", sans-serif' },
  { key: "sourceSans3", label: "Source Sans 3", value: '"Source Sans 3", "Inter", "IBM Plex Sans", sans-serif' },
  { key: "monaSans", label: "Mona Sans", value: '"Mona Sans", "Inter", "IBM Plex Sans", sans-serif' },
];
const interfaceSizeOptionsList = [
  {
    key: "13",
    size: 13,
    label: "13",
    vars: {
      "--ui-font-size": "13px",
      "--sidebar-title-size": "13px",
      "--setting-copy-size": "11px",
      "--pill-font-size": "10px",
      "--setting-subtitle-size": "12px",
      "--tab-label-size": "12px",
      "--tree-name-size": "12px",
      "--workspace-path-size": "12px",
      "--action-font-size": "12px",
    },
  },
  {
    key: "14",
    size: 14,
    label: "14",
    vars: {
      "--ui-font-size": "14px",
      "--sidebar-title-size": "14px",
      "--setting-copy-size": "12px",
      "--pill-font-size": "10px",
      "--setting-subtitle-size": "12px",
      "--tab-label-size": "12px",
      "--tree-name-size": "12px",
      "--workspace-path-size": "12px",
      "--action-font-size": "13px",
    },
  },
  {
    key: "15",
    size: 15,
    label: "15",
    vars: {
      "--ui-font-size": "15px",
      "--sidebar-title-size": "15px",
      "--setting-copy-size": "13px",
      "--pill-font-size": "11px",
      "--setting-subtitle-size": "13px",
      "--tab-label-size": "13px",
      "--tree-name-size": "13px",
      "--workspace-path-size": "13px",
      "--action-font-size": "14px",
    },
  },
  {
    key: "16",
    size: 16,
    label: "16",
    vars: {
      "--ui-font-size": "16px",
      "--sidebar-title-size": "16px",
      "--setting-copy-size": "14px",
      "--pill-font-size": "12px",
      "--setting-subtitle-size": "14px",
      "--tab-label-size": "14px",
      "--tree-name-size": "14px",
      "--workspace-path-size": "14px",
      "--action-font-size": "15px",
    },
  },
  {
    key: "17",
    size: 17,
    label: "17",
    vars: {
      "--ui-font-size": "17px",
      "--sidebar-title-size": "17px",
      "--setting-copy-size": "15px",
      "--pill-font-size": "13px",
      "--setting-subtitle-size": "15px",
      "--tab-label-size": "15px",
      "--tree-name-size": "15px",
      "--workspace-path-size": "15px",
      "--action-font-size": "16px",
    },
  },
];
const editorFontOptionsList = [
  { key: "jetbrainsMono", label: "JetBrains Mono", value: '"JetBrains Mono", "IBM Plex Mono", "Recursive", monospace' },
  { key: "ibmPlexMono", label: "IBM Plex Mono", value: '"IBM Plex Mono", "JetBrains Mono", "Recursive", monospace' },
  { key: "recursive", label: "Recursive", value: '"Recursive", "JetBrains Mono", "IBM Plex Mono", monospace' },
  { key: "monaspace", label: "Monaspace Neon", value: '"Monaspace Neon", "JetBrains Mono", "Source Code Pro", monospace' },
  { key: "sourceCodePro", label: "Source Code Pro", value: '"Source Code Pro", "JetBrains Mono", "IBM Plex Mono", monospace' },
];
const editorFontSizePresets = [
  { key: "13", size: 13, label: "13", vars: { "--editor-font-size": "13px", "--editor-line-height": "23px" } },
  { key: "14", size: 14, label: "14", vars: { "--editor-font-size": "14px", "--editor-line-height": "24px" } },
  { key: "15", size: 15, label: "15", vars: { "--editor-font-size": "15px", "--editor-line-height": "26px" } },
  { key: "16", size: 16, label: "16", vars: { "--editor-font-size": "16px", "--editor-line-height": "28px" } },
  { key: "17", size: 17, label: "17", vars: { "--editor-font-size": "17px", "--editor-line-height": "30px" } },
];
const legacyInterfaceSizeKeyMap = {
  "1": "13",
  compact: "14",
  default: "15",
  comfortable: "16",
  large: "17",
};
const legacyThemeColorKeyMap = {
  styioGold: "defaultGold",
  "Styio Gold": "Gold",
  "Default Gold": "Gold",
};
const legacyInterfaceFontKeyMap = {
  styioSans: "defaultSans",
  "Styio Sans": "Default Sans",
};
const legacyEditorFontSizeKeyMap = {
  "1": "13",
  compact: "14",
  default: "15",
  large: "16",
  "5": "17",
};
const legacyEditorTextHighlightKeyMap = {
  styioGold: "defaultGold",
  "Styio Gold": "Gold",
  "Default Gold": "Gold",
};
const legacyDefaultGlyphPaletteKeyMap = {
  styio: "default",
  Styio: "Default",
};
const editorBackgroundPresets = [
  {
    key: "graphite",
    label: "Graphite",
    mode: "dark",
    vars: {
      "--editor": "#15171C",
      "--editor-gutter-bg": "#1C1F26",
      "--editor-frame-border": "rgba(232, 236, 241, 0.08)",
      "--editor-surface-overlay-top": "rgba(255, 255, 255, 0.03)",
      "--editor-surface-overlay-bottom": "rgba(255, 255, 255, 0.012)",
    },
  },
  {
    key: "midnight",
    label: "Midnight",
    mode: "dark",
    vars: {
      "--editor": "#10141D",
      "--editor-gutter-bg": "#171C26",
      "--editor-frame-border": "rgba(232, 236, 241, 0.075)",
      "--editor-surface-overlay-top": "rgba(255, 255, 255, 0.02)",
      "--editor-surface-overlay-bottom": "rgba(255, 255, 255, 0.008)",
    },
  },
  {
    key: "carbon",
    label: "Carbon",
    mode: "dark",
    vars: {
      "--editor": "#171717",
      "--editor-gutter-bg": "#1F1F1F",
      "--editor-frame-border": "rgba(242, 242, 242, 0.08)",
      "--editor-surface-overlay-top": "rgba(255, 255, 255, 0.018)",
      "--editor-surface-overlay-bottom": "rgba(255, 255, 255, 0.006)",
    },
  },
  {
    key: "slate",
    label: "Slate",
    mode: "dark",
    vars: {
      "--editor": "#1A2029",
      "--editor-gutter-bg": "#202733",
      "--editor-frame-border": "rgba(237, 241, 244, 0.08)",
      "--editor-surface-overlay-top": "rgba(255, 255, 255, 0.026)",
      "--editor-surface-overlay-bottom": "rgba(255, 255, 255, 0.01)",
    },
  },
  {
    key: "paper",
    label: "Paper",
    mode: "light",
    vars: {
      "--editor": "#FBFBFC",
      "--editor-gutter-bg": "#F2F4F7",
      "--editor-frame-border": "rgba(17, 17, 17, 0.1)",
      "--editor-surface-overlay-top": "rgba(17, 17, 17, 0.01)",
      "--editor-surface-overlay-bottom": "rgba(17, 17, 17, 0.004)",
    },
  },
  {
    key: "sky",
    label: "Sky",
    mode: "light",
    vars: {
      "--editor": "#F7FAFE",
      "--editor-gutter-bg": "#EEF4FB",
      "--editor-frame-border": "rgba(17, 17, 17, 0.1)",
      "--editor-surface-overlay-top": "rgba(96, 165, 250, 0.01)",
      "--editor-surface-overlay-bottom": "rgba(96, 165, 250, 0.005)",
    },
  },
  {
    key: "mint",
    label: "Mint",
    mode: "light",
    vars: {
      "--editor": "#F6FBF8",
      "--editor-gutter-bg": "#ECF6F2",
      "--editor-frame-border": "rgba(17, 17, 17, 0.1)",
      "--editor-surface-overlay-top": "rgba(52, 211, 153, 0.01)",
      "--editor-surface-overlay-bottom": "rgba(52, 211, 153, 0.005)",
    },
  },
];
const editorTextColorPresets = [
  {
    key: "mist",
    label: "Mist",
    mode: "dark",
    vars: {
      "--editor-text": "#E8ECF1",
      "--editor-muted": "#7F8893",
    },
  },
  {
    key: "bright",
    label: "Bright",
    mode: "dark",
    vars: {
      "--editor-text": "#F6F8FB",
      "--editor-muted": "#9CA7B3",
    },
  },
  {
    key: "soft",
    label: "Soft",
    mode: "dark",
    vars: {
      "--editor-text": "#D7DEE6",
      "--editor-muted": "#7D8894",
    },
  },
  {
    key: "warm",
    label: "Warm",
    mode: "dark",
    vars: {
      "--editor-text": "#F1E9DC",
      "--editor-muted": "#A89883",
    },
  },
  {
    key: "ink",
    label: "Ink",
    mode: "light",
    vars: {
      "--editor-text": "#111111",
      "--editor-muted": "#5F6772",
    },
  },
  {
    key: "graphiteText",
    label: "Graphite",
    mode: "light",
    vars: {
      "--editor-text": "#1A1A1A",
      "--editor-muted": "#5F6772",
    },
  },
];
const editorTextHighlightPresets = [
  { key: "defaultGold", label: "Gold", color: "#F4C76A", caretShadow: "rgba(244, 199, 106, 0.18)" },
  { key: "violet", label: "Violet", color: "#8B5CF6", caretShadow: "rgba(139, 92, 246, 0.18)" },
  { key: "ice", label: "Ice Blue", color: "#60A5FA", caretShadow: "rgba(96, 165, 250, 0.18)" },
  { key: "emerald", label: "Emerald", color: "#34D399", caretShadow: "rgba(52, 211, 153, 0.18)" },
  { key: "quartz", label: "Quartz", color: "#E5E7EB", caretShadow: "rgba(229, 231, 235, 0.16)" },
];
const translations = {
  zhCn: {
    documentTitle: "Styio 编辑器",
    appTitle: "styio",
    openSidebar: "打开侧边栏",
    closeSidebar: "关闭侧边栏",
    fileTree: "文件树",
    settings: "设置",
    workspace: "工作区",
    workspacePath: "工作区路径",
    open: "打开",
    workspaceActions: "工作区操作",
    createFolder: "创建文件夹",
    createFile: "创建文件",
    selectFilesToDelete: "选择要删除的文件",
    refreshWorkspace: "刷新工作区",
    moreWorkspaceActions: "更多工作区操作",
    language: "语言",
    autoSave: "自动保存",
    delay: "延迟",
    theme: "主题",
    color: "颜色",
    font: "字体",
    mode: "模式",
    themeConfig: "Config",
    themePalette: "预设",
    themeText: "文字",
    themeColor: "图标",
    background: "背景",
    lines: "边框",
    interfaceFont: "界面字体",
    interfaceSize: "界面字号",
    editor: "编辑器",
    glyphComposition: "符号组合渲染",
    tabSize: "Tab Size",
    editorFont: "编辑器字体",
    editorFontSize: "编辑器字号",
    palette: "预选调色盘",
    editorBackground: "编辑器背景",
    textColor: "文字默认颜色",
    textHighlight: "文字高亮颜色",
    block: "代码块高亮风格",
    line: "行高亮风格",
    selection: "选区高亮风格",
    symbolColors: "符号颜色",
    usingBrowserStorage: "使用浏览器存储",
    usingBrowserStorageBody: "在你选择真实工作区文件夹之前，文件和编辑器设置会暂存在浏览器缓存中。",
    openWorkspace: "打开工作区",
    dialog: "对话框",
    closeDialog: "关闭对话框",
    closeWorkspacePicker: "关闭工作区选择器",
    openWorkspaceTitle: "打开工作区",
    chooseWorkspaceRoot: "选择一个本地文件夹作为当前工作区根目录。",
    goToParentFolder: "返回上级文件夹",
    useThisFolder: "使用此文件夹",
    importConfigFile: "导入配置文件",
    chooseConfigFile: "选择一个本地配置文件并导入当前配色设置。",
    importThisFile: "导入此文件",
    noFilesFound: "当前位置没有找到文件。",
    importConfig: "导入配置",
    editConfig: "编辑配置",
    configParseFailed: "配置解析失败",
    configImported: "配置已导入",
    configSaved: "配置已保存",
    themeConfigMessage: "编辑一份参考 VS Code 结构的 JSONC 配置。",
    noFilesInWorkspace: "当前工作区还没有文件。",
    previewFile: "预览文件",
    dirty: "未保存",
    deleteSinglePrompt: "删除这个工作区里的选中项？",
    deleteMultiplePrompt: "删除这个工作区里的 {count} 个选中项？",
    delete: "删除",
    cancel: "取消",
    confirm: "确认",
    renameFile: "重命名文件",
    rename: "重命名",
    renameFileMessage: "输入新的相对路径。",
    createFileTitle: "创建文件",
    createFileMessage: "输入当前工作区下的相对文件路径。",
    createFolderTitle: "创建文件夹",
    createFolderMessage: "输入当前工作区下的相对文件夹路径。",
    noDirectoriesFound: "当前位置没有找到目录。",
    loadingFolders: "正在加载文件夹…",
    deleteActiveEntry: "删除 {name}",
    deleteSelectedItems: "删除 {count} 个选中项",
    exitDeleteSelection: "退出多选删除",
    cancelMultiSelect: "取消多选",
    enableGlyphRendering: "启用符号渲染",
    disableGlyphRendering: "关闭符号渲染",
    lineSelection: "选区",
    diagnostics: "诊断",
    projection: "投影",
    diskLoading: "磁盘：加载中",
    autosaveLoading: "自动保存：加载中",
    glyphsLoading: "符号：加载中",
    indentLoading: "缩进：加载中",
    unitLoading: "单元：加载中",
  },
  en: {
    documentTitle: "Styio Editor",
    appTitle: "styio",
    openSidebar: "Open sidebar",
    closeSidebar: "Close sidebar",
    fileTree: "File tree",
    settings: "Settings",
    workspace: "Workspace",
    workspacePath: "Workspace path",
    open: "Open",
    workspaceActions: "Workspace actions",
    createFolder: "Create folder",
    createFile: "Create file",
    selectFilesToDelete: "Select files to delete",
    refreshWorkspace: "Refresh workspace",
    moreWorkspaceActions: "More workspace actions",
    language: "Language",
    autoSave: "Auto Save",
    delay: "Delay",
    theme: "Theme",
    color: "Color",
    font: "Font",
    mode: "Mode",
    themeConfig: "Config",
    themePalette: "Palette",
    themeText: "Text",
    themeColor: "Icon",
    background: "Background",
    lines: "Lines",
    interfaceFont: "Interface Font",
    interfaceSize: "Interface Size",
    editor: "Editor",
    glyphComposition: "Glyph Composition",
    tabSize: "Tab Size",
    editorFont: "Editor Font",
    editorFontSize: "Editor Font Size",
    palette: "Palette",
    editorBackground: "Editor Background",
    textColor: "Text Color",
    textHighlight: "Text Highlight",
    block: "Block",
    line: "Line",
    selection: "Selection",
    symbolColors: "Symbol Colors",
    usingBrowserStorage: "Using Browser Storage",
    usingBrowserStorageBody:
      "Files and editor settings are currently staying in browser cache until you choose a real workspace folder.",
    openWorkspace: "Open Workspace",
    dialog: "Dialog",
    closeDialog: "Close dialog",
    closeWorkspacePicker: "Close workspace picker",
    openWorkspaceTitle: "Open Workspace",
    chooseWorkspaceRoot: "Choose a local folder to use as the current workspace root.",
    goToParentFolder: "Go to parent folder",
    useThisFolder: "Use This Folder",
    importConfigFile: "Import Config File",
    chooseConfigFile: "Choose a local config file to import the current palette settings.",
    importThisFile: "Import This File",
    noFilesFound: "No files found here.",
    importConfig: "Import Config",
    editConfig: "Edit",
    configParseFailed: "Config parse failed",
    configImported: "Config imported",
    configSaved: "Config saved",
    themeConfigMessage: "Edit a JSONC config inspired by VS Code settings structure.",
    noFilesInWorkspace: "No files in this workspace yet.",
    previewFile: "Preview file",
    dirty: "dirty",
    deleteSinglePrompt: "Delete the selected item from this workspace?",
    deleteMultiplePrompt: "Delete {count} selected items from this workspace?",
    delete: "Delete",
    cancel: "Cancel",
    confirm: "Confirm",
    renameFile: "Rename File",
    rename: "Rename",
    renameFileMessage: "Enter the new relative path.",
    createFileTitle: "Create File",
    createFileMessage: "Enter a relative path under the current workspace.",
    createFolderTitle: "Create Folder",
    createFolderMessage: "Enter a relative folder path under the current workspace.",
    noDirectoriesFound: "No directories found in this location.",
    loadingFolders: "Loading folders…",
    deleteActiveEntry: "Delete {name}",
    deleteSelectedItems: "Delete {count} selected item{suffix}",
    exitDeleteSelection: "Exit delete selection",
    cancelMultiSelect: "Cancel multi-select",
    enableGlyphRendering: "Enable glyph rendering",
    disableGlyphRendering: "Disable glyph rendering",
    lineSelection: "selection",
    diagnostics: "diagnostics",
    projection: "projection",
    diskLoading: "disk: loading",
    autosaveLoading: "autosave: loading",
    glyphsLoading: "glyphs: loading",
    indentLoading: "indent: loading",
    unitLoading: "unit: loading",
  },
};

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
    key: "default",
    label: "Default",
    color: "#F4C76A",
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
      "--editor-caret": "#F4C76A",
      "--editor-caret-shadow": "rgba(244, 199, 106, 0.18)",
      "--editor-line-selected": "rgba(255, 255, 255, 0.045)",
      "--editor-line-issue": "#FF7A6A",
      "--editor-selection": "rgba(244, 199, 106, 0.22)",
    },
  },
  {
    key: "studioDark",
    label: "Studio Dark",
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
    key: "graphiteBlue",
    label: "Graphite Blue",
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
    key: "amberNight",
    label: "Amber Night",
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
    key: "forgeDark",
    label: "Forge Dark",
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
    key: "plumNight",
    label: "Plum Night",
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
    key: "arctic",
    label: "Arctic",
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
    key: "mocha",
    label: "Mocha",
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
    key: "solar",
    label: "Solar",
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
  {
    key: "monoChrome",
    label: "Mono Chrome",
    color: "#E5E7EB",
    editorTheme: {
      "--editor": "#0B0D10",
      "--editor-text": "#F3F4F6",
      "--editor-muted": "#9CA3AF",
      "--editor-frame-border": "rgba(229, 231, 235, 0.08)",
      "--editor-surface-overlay-top": "rgba(255, 255, 255, 0.02)",
      "--editor-surface-overlay-bottom": "rgba(255, 255, 255, 0.008)",
      "--editor-gutter-bg": "#111418",
      "--editor-issue-dot": "#F87171",
      "--editor-block-bg": "rgba(255, 255, 255, 0.024)",
      "--editor-block-border": "rgba(229, 231, 235, 0.07)",
      "--editor-caret": "#F3F4F6",
      "--editor-caret-shadow": "rgba(243, 244, 246, 0.16)",
      "--editor-line-selected": "rgba(255, 255, 255, 0.04)",
      "--editor-line-issue": "#F87171",
      "--editor-selection": "rgba(229, 231, 235, 0.16)",
    },
  },
  {
    key: "signalViolet",
    label: "Signal Violet",
    color: "#A78BFA",
    editorTheme: {
      "--editor": "#12111A",
      "--editor-text": "#ECEAF8",
      "--editor-muted": "#9C98B8",
      "--editor-frame-border": "rgba(196, 181, 253, 0.08)",
      "--editor-surface-overlay-top": "rgba(196, 181, 253, 0.03)",
      "--editor-surface-overlay-bottom": "rgba(196, 181, 253, 0.012)",
      "--editor-gutter-bg": "#181624",
      "--editor-issue-dot": "#FB7185",
      "--editor-block-bg": "rgba(167, 139, 250, 0.05)",
      "--editor-block-border": "rgba(196, 181, 253, 0.09)",
      "--editor-caret": "#C4B5FD",
      "--editor-caret-shadow": "rgba(196, 181, 253, 0.18)",
      "--editor-line-selected": "rgba(167, 139, 250, 0.1)",
      "--editor-line-issue": "#FB7185",
      "--editor-selection": "rgba(167, 139, 250, 0.22)",
    },
  },
  {
    key: "emeraldConsole",
    label: "Emerald Console",
    color: "#34D399",
    editorTheme: {
      "--editor": "#0B1212",
      "--editor-text": "#DDF7EE",
      "--editor-muted": "#83A69B",
      "--editor-frame-border": "rgba(52, 211, 153, 0.08)",
      "--editor-surface-overlay-top": "rgba(52, 211, 153, 0.025)",
      "--editor-surface-overlay-bottom": "rgba(52, 211, 153, 0.01)",
      "--editor-gutter-bg": "#10191A",
      "--editor-issue-dot": "#F97316",
      "--editor-block-bg": "rgba(52, 211, 153, 0.04)",
      "--editor-block-border": "rgba(110, 231, 183, 0.08)",
      "--editor-caret": "#6EE7B7",
      "--editor-caret-shadow": "rgba(110, 231, 183, 0.16)",
      "--editor-line-selected": "rgba(52, 211, 153, 0.08)",
      "--editor-line-issue": "#F97316",
      "--editor-selection": "rgba(52, 211, 153, 0.18)",
    },
  },
  {
    key: "auroraBloom",
    label: "Aurora Bloom",
    color: "#7DD3FC",
    editorTheme: {
      "--editor": "#12131E",
      "--editor-text": "#EEF2FF",
      "--editor-muted": "#9AA4C0",
      "--editor-frame-border": "rgba(125, 211, 252, 0.09)",
      "--editor-surface-overlay-top": "rgba(167, 139, 250, 0.03)",
      "--editor-surface-overlay-bottom": "rgba(125, 211, 252, 0.012)",
      "--editor-gutter-bg": "#181A28",
      "--editor-issue-dot": "#FB7185",
      "--editor-block-bg": "rgba(125, 211, 252, 0.04)",
      "--editor-block-border": "rgba(167, 139, 250, 0.08)",
      "--editor-caret": "#7DD3FC",
      "--editor-caret-shadow": "rgba(125, 211, 252, 0.16)",
      "--editor-line-selected": "rgba(167, 139, 250, 0.09)",
      "--editor-line-issue": "#FB7185",
      "--editor-selection": "rgba(125, 211, 252, 0.18)",
    },
  },
  {
    key: "terminalSlate",
    label: "Terminal Slate",
    color: "#94A3B8",
    editorTheme: {
      "--editor": "#0F1720",
      "--editor-text": "#E2E8F0",
      "--editor-muted": "#8694A8",
      "--editor-frame-border": "rgba(148, 163, 184, 0.08)",
      "--editor-surface-overlay-top": "rgba(148, 163, 184, 0.02)",
      "--editor-surface-overlay-bottom": "rgba(148, 163, 184, 0.01)",
      "--editor-gutter-bg": "#141E2A",
      "--editor-issue-dot": "#F87171",
      "--editor-block-bg": "rgba(148, 163, 184, 0.03)",
      "--editor-block-border": "rgba(148, 163, 184, 0.07)",
      "--editor-caret": "#CBD5E1",
      "--editor-caret-shadow": "rgba(203, 213, 225, 0.16)",
      "--editor-line-selected": "rgba(148, 163, 184, 0.08)",
      "--editor-line-issue": "#F87171",
      "--editor-selection": "rgba(148, 163, 184, 0.18)",
    },
  },
  {
    key: "paperCode",
    label: "Paper Code",
    color: "#D4A63F",
    editorTheme: {
      "--editor": "#FBFBFC",
      "--editor-text": "#1F2937",
      "--editor-muted": "#6B7280",
      "--editor-frame-border": "rgba(31, 41, 55, 0.08)",
      "--editor-surface-overlay-top": "rgba(15, 23, 42, 0.012)",
      "--editor-surface-overlay-bottom": "rgba(15, 23, 42, 0.006)",
      "--editor-gutter-bg": "#F2F4F7",
      "--editor-issue-dot": "#DC2626",
      "--editor-block-bg": "rgba(15, 23, 42, 0.035)",
      "--editor-block-border": "rgba(15, 23, 42, 0.08)",
      "--editor-caret": "#D4A63F",
      "--editor-caret-shadow": "rgba(212, 166, 63, 0.16)",
      "--editor-line-selected": "rgba(15, 23, 42, 0.05)",
      "--editor-line-issue": "#DC2626",
      "--editor-selection": "rgba(212, 166, 63, 0.18)",
    },
  },
  {
    key: "skyDraft",
    label: "Sky Draft",
    color: "#60A5FA",
    editorTheme: {
      "--editor": "#F7FAFE",
      "--editor-text": "#1E293B",
      "--editor-muted": "#64748B",
      "--editor-frame-border": "rgba(30, 41, 59, 0.08)",
      "--editor-surface-overlay-top": "rgba(96, 165, 250, 0.01)",
      "--editor-surface-overlay-bottom": "rgba(96, 165, 250, 0.005)",
      "--editor-gutter-bg": "#EEF4FB",
      "--editor-issue-dot": "#E11D48",
      "--editor-block-bg": "rgba(96, 165, 250, 0.05)",
      "--editor-block-border": "rgba(96, 165, 250, 0.11)",
      "--editor-caret": "#3B82F6",
      "--editor-caret-shadow": "rgba(59, 130, 246, 0.14)",
      "--editor-line-selected": "rgba(59, 130, 246, 0.08)",
      "--editor-line-issue": "#E11D48",
      "--editor-selection": "rgba(96, 165, 250, 0.16)",
    },
  },
  {
    key: "mintSheet",
    label: "Mint Sheet",
    color: "#34D399",
    editorTheme: {
      "--editor": "#F6FBF8",
      "--editor-text": "#1F2D2A",
      "--editor-muted": "#6A827D",
      "--editor-frame-border": "rgba(31, 45, 42, 0.08)",
      "--editor-surface-overlay-top": "rgba(52, 211, 153, 0.01)",
      "--editor-surface-overlay-bottom": "rgba(52, 211, 153, 0.005)",
      "--editor-gutter-bg": "#ECF6F2",
      "--editor-issue-dot": "#DC2626",
      "--editor-block-bg": "rgba(52, 211, 153, 0.045)",
      "--editor-block-border": "rgba(16, 185, 129, 0.09)",
      "--editor-caret": "#10B981",
      "--editor-caret-shadow": "rgba(16, 185, 129, 0.14)",
      "--editor-line-selected": "rgba(52, 211, 153, 0.07)",
      "--editor-line-issue": "#DC2626",
      "--editor-selection": "rgba(52, 211, 153, 0.16)",
    },
  },
];
const editorPaletteMeta = {
  default: {
    mode: "dark",
    backgroundKey: "graphite",
    textColorKey: "mist",
    textHighlightKey: "defaultGold",
    blockKey: "graphite",
    lineKey: "graphite",
    selectionKey: "graphite",
  },
  studioDark: { mode: "dark", backgroundKey: "graphite", textColorKey: "mist", textHighlightKey: "ice", blockKey: "graphite", lineKey: "graphite", selectionKey: "graphite" },
  graphiteBlue: { mode: "dark", backgroundKey: "midnight", textColorKey: "mist", textHighlightKey: "ice", blockKey: "graphite", lineKey: "graphite", selectionKey: "graphite" },
  amberNight: { mode: "dark", backgroundKey: "carbon", textColorKey: "warm", textHighlightKey: "defaultGold", blockKey: "graphite", lineKey: "graphite", selectionKey: "graphite" },
  forgeDark: { mode: "dark", backgroundKey: "midnight", textColorKey: "mist", textHighlightKey: "ice", blockKey: "graphite", lineKey: "graphite", selectionKey: "graphite" },
  plumNight: { mode: "dark", backgroundKey: "fog", textColorKey: "mist", textHighlightKey: "violet", blockKey: "graphite", lineKey: "graphite", selectionKey: "graphite" },
  arctic: { mode: "dark", backgroundKey: "blueprint", textColorKey: "bright", textHighlightKey: "ice", blockKey: "frost", lineKey: "graphite", selectionKey: "graphite" },
  mocha: { mode: "dark", backgroundKey: "graphite", textColorKey: "soft", textHighlightKey: "ice", blockKey: "graphite", lineKey: "graphite", selectionKey: "graphite" },
  solar: { mode: "dark", backgroundKey: "graphite", textColorKey: "soft", textHighlightKey: "ice", blockKey: "graphite", lineKey: "graphite", selectionKey: "graphite" },
  monoChrome: { mode: "dark", backgroundKey: "obsidian", textColorKey: "bright", textHighlightKey: "defaultGold", blockKey: "graphite", lineKey: "graphite", selectionKey: "graphite" },
  signalViolet: { mode: "dark", backgroundKey: "fog", textColorKey: "mist", textHighlightKey: "violet", blockKey: "graphite", lineKey: "graphite", selectionKey: "graphite" },
  emeraldConsole: { mode: "dark", backgroundKey: "graphite", textColorKey: "soft", textHighlightKey: "emerald", blockKey: "graphite", lineKey: "graphite", selectionKey: "graphite" },
  auroraBloom: { mode: "dark", backgroundKey: "blueprint", textColorKey: "bright", textHighlightKey: "ice", blockKey: "frost", lineKey: "graphite", selectionKey: "graphite" },
  terminalSlate: { mode: "dark", backgroundKey: "midnight", textColorKey: "soft", textHighlightKey: "quartz", blockKey: "graphite", lineKey: "graphite", selectionKey: "graphite" },
  paperCode: { mode: "light", backgroundKey: "paper", textColorKey: "ink", textHighlightKey: "defaultGold", blockKey: "frost", lineKey: "paperLine", selectionKey: "paperSelection" },
  skyDraft: { mode: "light", backgroundKey: "sky", textColorKey: "ink", textHighlightKey: "ice", blockKey: "frost", lineKey: "paperLine", selectionKey: "paperSelection" },
  mintSheet: { mode: "light", backgroundKey: "mint", textColorKey: "ink", textHighlightKey: "emerald", blockKey: "frost", lineKey: "paperLine", selectionKey: "paperSelection" },
};
const legacyGlyphPaletteKeyMap = {
  darkPlus: "studioDark",
  oneDark: "graphiteBlue",
  monokai: "amberNight",
  githubDark: "forgeDark",
  dracula: "plumNight",
  nord: "arctic",
  catppuccinMocha: "mocha",
  solarized: "solar",
};
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
  { key: "paperLine", label: "Paper", value: "rgba(17, 17, 17, 0.08)" },
];
const selectionHighlightPresets = [
  { key: "graphite", label: "Graphite", value: "rgba(255, 255, 255, 0.12)" },
  { key: "glassWhite", label: "Glass White", value: "rgba(255, 255, 255, 0.18)" },
  { key: "violetMist", label: "Violet Mist", value: "rgba(139, 92, 246, 0.22)" },
  { key: "blueTint", label: "Blue Tint", value: "rgba(96, 165, 250, 0.22)" },
  { key: "amberSoft", label: "Amber Soft", value: "rgba(255, 138, 87, 0.22)" },
  { key: "paperSelection", label: "Paper", value: "rgba(15, 23, 42, 0.14)" },
];
const defaultGlyphColor = glyphPaletteOptions[0].color;
let glyphColors = Object.fromEntries(glyphColorSpecs.map((spec) => [spec.key, defaultGlyphColor]));

const measureLine = document.createElement("div");
measureLine.className = "measure-line";
document.body.appendChild(measureLine);

function getCssNumber(name) {
  return parseFloat(getComputedStyle(document.documentElement).getPropertyValue(name));
}

function t(key, params = {}) {
  const table = translations[activeLanguageKey] ?? translations.en;
  let value = table[key] ?? translations.en[key] ?? key;
  Object.entries(params).forEach(([name, replacement]) => {
    value = value.replaceAll(`{${name}}`, String(replacement));
  });
  return value;
}

function persistLanguageState() {
  try {
    window.localStorage.setItem(languageStorageKey, activeLanguageKey);
  } catch (error) {
    console.warn("failed to persist language state", error);
  }
}

function loadLanguageState() {
  try {
    const raw = window.localStorage.getItem(languageStorageKey);
    if (languageOptionsList.some((option) => option.key === raw)) {
      activeLanguageKey = raw;
    }
  } catch (error) {
    console.warn("failed to restore language state", error);
  }
}

function applyLanguageUi() {
  document.documentElement.lang = activeLanguageKey === "zhCn" ? "zh-CN" : "en";
  document.title = t("documentTitle");
  currentFileTitle.textContent = t("appTitle");

  toggleSidebar.setAttribute("aria-label", t("openSidebar"));
  toggleSidebar.setAttribute("title", t("openSidebar"));
  closeSidebar.setAttribute("aria-label", t("closeSidebar"));
  closeSidebar.setAttribute("title", t("closeSidebar"));

  document.querySelector('[data-drawer-tab="files"]')?.setAttribute("aria-label", t("fileTree"));
  document.querySelector('[data-drawer-tab="files"]')?.setAttribute("title", t("fileTree"));
  document.querySelector('[data-drawer-tab="settings"]')?.setAttribute("aria-label", t("settings"));
  document.querySelector('[data-drawer-tab="settings"]')?.setAttribute("title", t("settings"));

  workspaceTitle.textContent = t("workspace");
  workspacePathDisplay?.setAttribute("aria-label", t("workspacePath"));
  workspacePathApply.setAttribute("aria-label", t("openWorkspace"));
  workspacePathApply.setAttribute("title", t("openWorkspace"));
  document.querySelector(".workspace-action-row")?.setAttribute("aria-label", t("workspaceActions"));
  createFolderButton.setAttribute("aria-label", t("createFolder"));
  createFolderButton.setAttribute("title", t("createFolder"));
  quickCreateFileButton.setAttribute("aria-label", t("createFile"));
  quickCreateFileButton.setAttribute("title", t("createFile"));
  workspaceMoreButton.setAttribute("aria-label", t("moreWorkspaceActions"));
  workspaceMoreButton.setAttribute("title", t("moreWorkspaceActions"));

  languageTitle.textContent = t("language");
  autoSaveTitle.textContent = t("autoSave");
  autoSaveDelayLabel.textContent = t("delay");
  themeTitle.textContent = t("theme");
  themeColorCardTitle.textContent = t("color");
  themeFontCardTitle.textContent = t("font");
  themeConfigTitle.textContent = t("themeConfig");
  themePaletteTitle.textContent = t("themePalette");
  themeTextTitle.textContent = t("themeText");
  themeColorTitle.textContent = t("themeColor");
  themeBackgroundTitle.textContent = t("background");
  themeLineTitle.textContent = t("lines");
  interfaceFontTitle.textContent = t("interfaceFont");
  interfaceSizeTitle.textContent = t("interfaceSize");
  editorTitle.textContent = t("editor");
  editorFontCardTitle.textContent = t("font");
  editorColorCardTitle.textContent = t("color");
  glyphCompositionTitle.textContent = t("glyphComposition");
  tabSizeTitle.textContent = t("tabSize");
  editorFontTitle.textContent = t("editorFont");
  editorFontSizeTitle.textContent = t("editorFontSize");
  editorPaletteTitle.textContent = t("palette");
  editorBackgroundTitle.textContent = t("editorBackground");
  textColorTitle.textContent = t("textColor");
  textHighlightTitle.textContent = t("textHighlight");
  blockTitle.textContent = t("block");
  lineTitle.textContent = t("line");
  selectionTitle.textContent = t("selection");
  symbolColorsTitle.textContent = t("symbolColors");
  themeModeToggle?.setAttribute("aria-label", `${t("theme")} ${t("mode")}`);
  editorModeToggle?.setAttribute("aria-label", `${t("editor")} ${t("mode")}`);
  indentControl?.setAttribute("aria-label", t("tabSize"));

  workspaceCalloutTitle.textContent = t("usingBrowserStorage");
  workspaceCalloutBody.textContent = t("usingBrowserStorageBody");
  workspaceCalloutOpen.textContent = t("openWorkspace");

  appDialogTitle.textContent = t("dialog");
  appDialogClose.setAttribute("aria-label", t("closeDialog"));
  appDialogClose.setAttribute("title", t("closeDialog"));

  workspacePickerTitle.textContent = t("openWorkspaceTitle");
  workspacePickerCaption.textContent = t("chooseWorkspaceRoot");
  workspacePickerClose.setAttribute("aria-label", t("closeWorkspacePicker"));
  workspacePickerClose.setAttribute("title", t("closeWorkspacePicker"));
  workspacePickerUp.setAttribute("aria-label", t("goToParentFolder"));
  workspacePickerUp.setAttribute("title", t("goToParentFolder"));
  workspacePickerCurrent.setAttribute("aria-label", t("workspacePath"));
  importThemeConfigButton.setAttribute("aria-label", t("importConfig"));
  importThemeConfigButton.setAttribute("title", t("importConfig"));
  editThemeConfigButton.setAttribute("aria-label", t("editConfig"));
  editThemeConfigButton.setAttribute("title", t("editConfig"));

  workspacePickerTitle.textContent = workspacePickerTitleText || t("openWorkspaceTitle");
  workspacePickerCaption.textContent = workspacePickerDefaultCaptionText || t("chooseWorkspaceRoot");
  workspacePickerConfirm.textContent = workspacePickerConfirmText || t("useThisFolder");

  appDialogCancel.textContent = t("cancel");
  toggleGlyphs.setAttribute("aria-label", glyphsOn ? t("disableGlyphRendering") : t("enableGlyphRendering"));
  toggleGlyphs.setAttribute("title", glyphsOn ? t("disableGlyphRendering") : t("enableGlyphRendering"));
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

function findPresetByKeyOrLabel(options, value) {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim();
  if (!normalized) {
    return null;
  }

  return (
    options.find((option) => option.key === normalized) ??
    options.find((option) => option.label.toLowerCase() === normalized.toLowerCase()) ??
    null
  );
}

function stripJsonComments(source) {
  let result = "";
  let inString = false;
  let stringQuote = "";
  let escaping = false;

  for (let index = 0; index < source.length; index += 1) {
    const current = source[index];
    const next = source[index + 1];

    if (inString) {
      result += current;
      if (escaping) {
        escaping = false;
      } else if (current === "\\") {
        escaping = true;
      } else if (current === stringQuote) {
        inString = false;
        stringQuote = "";
      }
      continue;
    }

    if (current === '"' || current === "'") {
      inString = true;
      stringQuote = current;
      result += current;
      continue;
    }

    if (current === "/" && next === "/") {
      while (index < source.length && source[index] !== "\n") {
        index += 1;
      }
      if (index < source.length) {
        result += source[index];
      }
      continue;
    }

    if (current === "/" && next === "*") {
      index += 2;
      while (index < source.length && !(source[index] === "*" && source[index + 1] === "/")) {
        index += 1;
      }
      index += 1;
      continue;
    }

    result += current;
  }

  return result;
}

function stripTrailingCommas(source) {
  let result = "";
  let inString = false;
  let stringQuote = "";
  let escaping = false;

  for (let index = 0; index < source.length; index += 1) {
    const current = source[index];

    if (inString) {
      result += current;
      if (escaping) {
        escaping = false;
      } else if (current === "\\") {
        escaping = true;
      } else if (current === stringQuote) {
        inString = false;
        stringQuote = "";
      }
      continue;
    }

    if (current === '"' || current === "'") {
      inString = true;
      stringQuote = current;
      result += current;
      continue;
    }

    if (current === ",") {
      let cursor = index + 1;
      while (cursor < source.length && /\s/.test(source[cursor])) {
        cursor += 1;
      }
      if (source[cursor] === "}" || source[cursor] === "]") {
        continue;
      }
    }

    result += current;
  }

  return result;
}

function parseJsonc(source) {
  const withoutComments = stripJsonComments(source);
  const withoutTrailingCommas = stripTrailingCommas(withoutComments);
  return JSON.parse(withoutTrailingCommas);
}

function glyphSpecFromConfigKey(key) {
  if (typeof key !== "string") {
    return null;
  }

  const normalized = key.trim();
  if (!normalized) {
    return null;
  }

  return (
    glyphColorSpecs.find((spec) => spec.key === normalized) ??
    glyphColorSpecs.find((spec) => spec.token === normalized) ??
    null
  );
}

function normalizeEditorFontSizeFromConfig(value) {
  if (typeof value === "number" && Number.isFinite(value)) {
    const rounded = Math.round(value);
    return editorFontSizePresets.find((preset) => preset.size === rounded)?.key ?? null;
  }

  if (typeof value === "string") {
    const normalized = value.trim();
    return (
      findPresetByKeyOrLabel(editorFontSizePresets, normalized)?.key ??
      legacyEditorFontSizeKeyMap[normalized] ??
      null
    );
  }

  return null;
}

function normalizeInterfaceSizeFromConfig(value) {
  if (typeof value === "number" && Number.isFinite(value)) {
    const rounded = Math.round(value);
    return interfaceSizeOptionsList.find((option) => option.size === rounded)?.key ?? null;
  }

  if (typeof value === "string") {
    const normalized = value.trim();
    return (
      findPresetByKeyOrLabel(interfaceSizeOptionsList, normalized)?.key ??
      legacyInterfaceSizeKeyMap[normalized] ??
      null
    );
  }

  return null;
}

function normalizeLegacyPresetValue(value, legacyMap) {
  if (typeof value !== "string") {
    return value;
  }

  const normalized = value.trim();
  return legacyMap[normalized] ?? normalized;
}

function parseCustomPaletteConfig(rawText) {
  let parsed;
  try {
    parsed = parseJsonc(rawText);
  } catch (error) {
    throw new Error(`${t("configParseFailed")}: ${error.message}`);
  }

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error(`${t("configParseFailed")}: root must be an object`);
  }

  const workbench = parsed["workbench.colorCustomizations"];
  const editorColors = parsed["editor.tokenColorCustomizations"];
  const editorConfig = parsed.editor;
  const styioView = parsed.styioView;

  const config = {
    name: typeof parsed.name === "string" ? parsed.name.trim() : "",
    themeMode: ["dark", "light"].includes(styioView?.themeMode) ? styioView.themeMode : null,
    editorMode: ["dark", "light"].includes(styioView?.editorMode) ? styioView.editorMode : null,
    themePaletteKey:
      findPresetByKeyOrLabel(themePalettePresets, workbench?.["styio.themePalette"])?.key ?? null,
    themeColorKey:
      findPresetByKeyOrLabel(
        themeColorPresets,
        normalizeLegacyPresetValue(workbench?.["styio.themeColor"], legacyThemeColorKeyMap),
      )?.key ?? null,
    themeTextKey:
      findPresetByKeyOrLabel(themeTextPresets, workbench?.["styio.themeText"])?.key ?? null,
    themeBackgroundKey:
      findPresetByKeyOrLabel(themeBackgroundPresets, workbench?.["styio.background"])?.key ?? null,
    themeLineKey:
      findPresetByKeyOrLabel(themeLinePresets, workbench?.["styio.themeLines"])?.key ?? null,
    interfaceFontKey:
      findPresetByKeyOrLabel(
        interfaceFontOptionsList,
        normalizeLegacyPresetValue(workbench?.["styio.interfaceFont"], legacyInterfaceFontKeyMap),
      )?.key ?? null,
    interfaceSizeKey: normalizeInterfaceSizeFromConfig(workbench?.["styio.interfaceSize"]),
    editorFontKey: findPresetByKeyOrLabel(editorFontOptionsList, editorConfig?.fontFamily)?.key ?? null,
    editorFontSizeKey: normalizeEditorFontSizeFromConfig(editorConfig?.fontSize),
    tabSize: [2, 4].includes(editorConfig?.tabSize) ? editorConfig.tabSize : null,
    glyphComposition:
      typeof styioView?.glyphComposition === "boolean" ? styioView.glyphComposition : null,
    editorPaletteKey:
      findPresetByKeyOrLabel(
        glyphPaletteOptions,
        normalizeLegacyPresetValue(editorColors?.["styio.palette"], legacyDefaultGlyphPaletteKeyMap),
      )?.key ?? null,
    editorBackgroundKey:
      findPresetByKeyOrLabel(editorBackgroundPresets, editorColors?.["styio.editorBackground"])?.key ??
      null,
    textColorKey:
      findPresetByKeyOrLabel(editorTextColorPresets, editorColors?.["styio.textColor"])?.key ?? null,
    textHighlightKey:
      findPresetByKeyOrLabel(
        editorTextHighlightPresets,
        normalizeLegacyPresetValue(editorColors?.["styio.textHighlight"], legacyEditorTextHighlightKeyMap),
      )?.key ?? null,
    blockSurfaceKey:
      findPresetByKeyOrLabel(blockSurfacePresets, editorColors?.["styio.block"])?.key ?? null,
    lineHighlightKey:
      findPresetByKeyOrLabel(lineHighlightPresets, editorColors?.["styio.line"])?.key ?? null,
    selectionHighlightKey:
      findPresetByKeyOrLabel(selectionHighlightPresets, editorColors?.["styio.selection"])?.key ?? null,
    symbolColors: {},
  };

  const symbolColors = editorColors?.["styio.symbolColors"];
  if (symbolColors && typeof symbolColors === "object" && !Array.isArray(symbolColors)) {
    Object.entries(symbolColors).forEach(([key, value]) => {
      const spec = glyphSpecFromConfigKey(key);
      if (!spec || typeof value !== "string") {
        return;
      }
      config.symbolColors[spec.key] = normalizeHexColor(value, glyphColors[spec.key] ?? defaultGlyphColor);
    });
  }

  return config;
}

function buildCustomPaletteConfigObject() {
  const symbolColors = {};
  glyphColorSpecs.forEach((spec) => {
    symbolColors[spec.key] = glyphColors[spec.key];
  });

  const currentInterfaceSize = currentInterfaceSizeOption();
  const currentEditorFontSize = currentEditorFontSizePreset();
  const editorFontSizeValue = Number.parseInt(
    currentEditorFontSize.vars["--editor-font-size"].replace("px", ""),
    10,
  );

  return {
    $schema: customPaletteConfigSchema,
    name: "Custom Palette",
    "workbench.colorCustomizations": {
      "styio.themePalette": activeThemePaletteKey,
      "styio.themeColor": activeThemeColorKey,
      "styio.themeText": activeThemeTextKey,
      "styio.background": activeThemeBackgroundKey,
      "styio.themeLines": activeThemeLineKey,
      "styio.interfaceFont": activeInterfaceFontKey,
      "styio.interfaceSize": currentInterfaceSize.size,
    },
    editor: {
      tabSize: indentSize,
      fontFamily: activeEditorFontKey,
      fontSize: Number.isFinite(editorFontSizeValue) ? editorFontSizeValue : currentEditorFontSize.size,
    },
    styioView: {
      glyphComposition: glyphsOn,
      themeMode,
      editorMode,
    },
    "editor.tokenColorCustomizations": {
      "styio.palette": activePaletteKey,
      "styio.editorBackground": activeEditorBackgroundKey,
      "styio.textColor": activeEditorTextColorKey,
      "styio.textHighlight": activeEditorTextHighlightKey,
      "styio.block": activeBlockSurfaceKey,
      "styio.line": activeLineHighlightKey,
      "styio.selection": activeSelectionHighlightKey,
      "styio.symbolColors": symbolColors,
    },
  };
}

function buildCustomPaletteConfigText() {
  return JSON.stringify(buildCustomPaletteConfigObject(), null, 2);
}

function persistThemeSettings() {
  try {
    window.localStorage.setItem(
      themeSettingsStorageKey,
      JSON.stringify({
        themeMode,
        themePaletteKey: activeThemePaletteKey,
        themeColorKey: activeThemeColorKey,
        themeTextKey: activeThemeTextKey,
        themeBackgroundKey: activeThemeBackgroundKey,
        themeLineKey: activeThemeLineKey,
        interfaceFontKey: activeInterfaceFontKey,
        interfaceSizeKey: activeInterfaceSizeKey,
      }),
    );
  } catch (error) {
    console.warn("failed to persist theme settings", error);
  }
  persistCustomPaletteConfigState();
}

function loadThemeSettings() {
  try {
    const raw = window.localStorage.getItem(themeSettingsStorageKey);
    if (!raw) {
      return;
    }

    const parsed = JSON.parse(raw);
    if (parsed?.themeMode === "dark" || parsed?.themeMode === "light") {
      themeMode = parsed.themeMode;
    }
    if (themePalettePresets.some((preset) => preset.key === parsed?.themePaletteKey)) {
      activeThemePaletteKey = parsed.themePaletteKey;
      themeMode = themePalettePresets.find((preset) => preset.key === parsed.themePaletteKey)?.mode ?? themeMode;
    } else {
      activeThemePaletteKey = defaultThemePaletteForMode(themeMode).key;
    }
    const migratedThemeColorKey = legacyThemeColorKeyMap[parsed?.themeColorKey] ?? parsed?.themeColorKey;
    if (themeColorPresets.some((preset) => preset.key === migratedThemeColorKey)) {
      activeThemeColorKey = migratedThemeColorKey;
    }
    if (themeTextPresets.some((preset) => preset.key === parsed?.themeTextKey)) {
      activeThemeTextKey = parsed.themeTextKey;
    }
    if (themeBackgroundPresets.some((preset) => preset.key === parsed?.themeBackgroundKey)) {
      activeThemeBackgroundKey = parsed.themeBackgroundKey;
    }
    if (themeLinePresets.some((preset) => preset.key === parsed?.themeLineKey)) {
      activeThemeLineKey = parsed.themeLineKey;
    }
    const migratedInterfaceFontKey =
      legacyInterfaceFontKeyMap[parsed?.interfaceFontKey] ?? parsed?.interfaceFontKey;
    if (interfaceFontOptionsList.some((option) => option.key === migratedInterfaceFontKey)) {
      activeInterfaceFontKey = migratedInterfaceFontKey;
    }
    const migratedInterfaceSizeKey = legacyInterfaceSizeKeyMap[parsed?.interfaceSizeKey] ?? parsed?.interfaceSizeKey;
    if (interfaceSizeOptionsList.some((option) => option.key === migratedInterfaceSizeKey)) {
      activeInterfaceSizeKey = migratedInterfaceSizeKey;
    }
    coerceThemeSelectionsForMode();
  } catch (error) {
    console.warn("failed to restore theme settings", error);
  }
}

function persistEditorPreferences() {
  try {
    window.localStorage.setItem(
      editorSettingsStorageKey,
      JSON.stringify({
        editorMode,
        glyphsOn,
        indentSize,
        editorFontKey: activeEditorFontKey,
        editorFontSizeKey: activeEditorFontSizeKey,
        paletteKey: activePaletteKey,
        editorBackgroundKey: activeEditorBackgroundKey,
        editorTextColorKey: activeEditorTextColorKey,
        editorTextHighlightKey: activeEditorTextHighlightKey,
        blockSurfaceKey: activeBlockSurfaceKey,
        lineHighlightKey: activeLineHighlightKey,
        selectionHighlightKey: activeSelectionHighlightKey,
      }),
    );
  } catch (error) {
    console.warn("failed to persist editor settings", error);
  }
  persistCustomPaletteConfigState();
}

function persistCustomPaletteConfigState() {
  try {
    window.localStorage.setItem(customPaletteConfigStorageKey, buildCustomPaletteConfigText());
  } catch (error) {
    console.warn("failed to persist custom palette config", error);
  }
}

function applyCustomPaletteConfig(config) {
  if (config.themeMode === "dark" || config.themeMode === "light") {
    themeMode = config.themeMode;
  }
  if (config.editorMode === "dark" || config.editorMode === "light") {
    editorMode = config.editorMode;
  }
  if (config.themePaletteKey) {
    applyThemePaletteSelection(config.themePaletteKey);
  }
  if (config.themeColorKey) {
    activeThemeColorKey = config.themeColorKey;
  }
  if (config.themeTextKey) {
    activeThemeTextKey = config.themeTextKey;
  }
  if (config.themeBackgroundKey) {
    activeThemeBackgroundKey = config.themeBackgroundKey;
  }
  if (config.themeLineKey) {
    activeThemeLineKey = config.themeLineKey;
  }
  if (config.interfaceFontKey) {
    activeInterfaceFontKey = config.interfaceFontKey;
  }
  if (config.interfaceSizeKey) {
    activeInterfaceSizeKey = config.interfaceSizeKey;
  }
  if (config.editorFontKey) {
    activeEditorFontKey = config.editorFontKey;
  }
  if (config.editorFontSizeKey) {
    activeEditorFontSizeKey = config.editorFontSizeKey;
  }
  if (config.tabSize) {
    indentSize = config.tabSize;
  }
  if (typeof config.glyphComposition === "boolean") {
    glyphsOn = config.glyphComposition;
  }
  if (config.editorPaletteKey) {
    applyEditorPaletteSelection(config.editorPaletteKey);
  }
  if (config.editorBackgroundKey) {
    activeEditorBackgroundKey = config.editorBackgroundKey;
  }
  if (config.textColorKey) {
    activeEditorTextColorKey = config.textColorKey;
  }
  if (config.textHighlightKey) {
    activeEditorTextHighlightKey = config.textHighlightKey;
  }
  if (config.blockSurfaceKey) {
    activeBlockSurfaceKey = config.blockSurfaceKey;
  }
  if (config.lineHighlightKey) {
    activeLineHighlightKey = config.lineHighlightKey;
  }
  if (config.selectionHighlightKey) {
    activeSelectionHighlightKey = config.selectionHighlightKey;
  }
  Object.entries(config.symbolColors).forEach(([key, value]) => {
    glyphColors[key] = value;
  });
  coerceThemeSelectionsForMode();
  coerceEditorSelectionsForMode();
  applyWorkbenchThemeState();
  applyEditorTheme();
  applyEditorBackgroundTheme();
  applyEditorTextColorTheme();
  applyEditorTextHighlightTheme();
  applyBlockSurfaceTheme();
  applyLineHighlightTheme();
  applySelectionHighlightTheme();
  applyGlyphColors();
}

function loadCustomPaletteConfigState() {
  try {
    const raw = window.localStorage.getItem(customPaletteConfigStorageKey);
    if (!raw) {
      return;
    }

    const parsed = parseCustomPaletteConfig(raw);
    applyCustomPaletteConfig(parsed);
  } catch (error) {
    console.warn("failed to restore custom palette config", error);
  }
}

function loadEditorPreferences() {
  try {
    const raw = window.localStorage.getItem(editorSettingsStorageKey);
    if (!raw) {
      return;
    }

    const parsed = JSON.parse(raw);
    if (parsed?.editorMode === "dark" || parsed?.editorMode === "light") {
      editorMode = parsed.editorMode;
    }
    if (typeof parsed?.glyphsOn === "boolean") {
      glyphsOn = parsed.glyphsOn;
    }
    if ([2, 4].includes(parsed?.indentSize)) {
      indentSize = parsed.indentSize;
    }
    if (editorFontOptionsList.some((option) => option.key === parsed?.editorFontKey)) {
      activeEditorFontKey = parsed.editorFontKey;
    }
    const migratedEditorFontSizeKey =
      legacyEditorFontSizeKeyMap[parsed?.editorFontSizeKey] ?? parsed?.editorFontSizeKey;
    if (editorFontSizePresets.some((preset) => preset.key === migratedEditorFontSizeKey)) {
      activeEditorFontSizeKey = migratedEditorFontSizeKey;
    }
    if (editorBackgroundPresets.some((preset) => preset.key === parsed?.editorBackgroundKey)) {
      activeEditorBackgroundKey = parsed.editorBackgroundKey;
    }
    if (editorTextColorPresets.some((preset) => preset.key === parsed?.editorTextColorKey)) {
      activeEditorTextColorKey = parsed.editorTextColorKey;
    }
    const migratedEditorTextHighlightKey =
      legacyEditorTextHighlightKeyMap[parsed?.editorTextHighlightKey] ?? parsed?.editorTextHighlightKey;
    if (editorTextHighlightPresets.some((preset) => preset.key === migratedEditorTextHighlightKey)) {
      activeEditorTextHighlightKey = migratedEditorTextHighlightKey;
    }
    const migratedPaletteKey = legacyGlyphPaletteKeyMap[parsed?.paletteKey] ?? parsed?.paletteKey;
    if (glyphPaletteOptions.some((palette) => palette.key === migratedPaletteKey)) {
      activePaletteKey = migratedPaletteKey;
      editorMode = editorPaletteMeta[migratedPaletteKey]?.mode ?? editorMode;
    } else {
      activePaletteKey = defaultEditorPaletteForMode(editorMode).key;
    }
    if (blockSurfacePresets.some((preset) => preset.key === parsed?.blockSurfaceKey)) {
      activeBlockSurfaceKey = parsed.blockSurfaceKey;
    }
    if (lineHighlightPresets.some((preset) => preset.key === parsed?.lineHighlightKey)) {
      activeLineHighlightKey = parsed.lineHighlightKey;
    }
    if (selectionHighlightPresets.some((preset) => preset.key === parsed?.selectionHighlightKey)) {
      activeSelectionHighlightKey = parsed.selectionHighlightKey;
    }
    coerceEditorSelectionsForMode();
  } catch (error) {
    console.warn("failed to restore editor settings", error);
  }
}

function currentThemeTextOptions() {
  return themeTextPresets.filter((preset) => preset.mode === themeMode);
}

function currentThemeBackgroundOptions() {
  return themeBackgroundPresets.filter((preset) => preset.mode === themeMode);
}

function currentThemeLineOptions() {
  return themeLinePresets.filter((preset) => preset.mode === themeMode);
}

function currentEditorBackgroundOptions() {
  return editorBackgroundPresets.filter((preset) => preset.mode === editorMode);
}

function currentEditorTextColorOptions() {
  return editorTextColorPresets.filter((preset) => preset.mode === editorMode);
}

function coerceThemeSelectionsForMode() {
  const fallbackPalette = currentThemePalette();
  if (!currentThemeTextOptions().some((preset) => preset.key === activeThemeTextKey)) {
    activeThemeTextKey = fallbackPalette.themeTextKey;
  }
  if (!currentThemeBackgroundOptions().some((preset) => preset.key === activeThemeBackgroundKey)) {
    activeThemeBackgroundKey = fallbackPalette.themeBackgroundKey;
  }
  if (!currentThemeLineOptions().some((preset) => preset.key === activeThemeLineKey)) {
    activeThemeLineKey = fallbackPalette.themeLineKey;
  }
}

function coerceEditorSelectionsForMode() {
  const fallbackPalette = currentPalette();
  const paletteMeta = editorPaletteMeta[fallbackPalette.key] ?? {};
  if (!currentEditorBackgroundOptions().some((preset) => preset.key === activeEditorBackgroundKey)) {
    activeEditorBackgroundKey = paletteMeta.backgroundKey ?? currentEditorBackgroundOptions()[0]?.key ?? editorBackgroundPresets[0].key;
  }
  if (!currentEditorTextColorOptions().some((preset) => preset.key === activeEditorTextColorKey)) {
    activeEditorTextColorKey = paletteMeta.textColorKey ?? currentEditorTextColorOptions()[0]?.key ?? editorTextColorPresets[0].key;
  }
}

function currentThemeColorPreset() {
  return themeColorPresets.find((preset) => preset.key === activeThemeColorKey) ?? themeColorPresets[0];
}

function currentThemeBackgroundPreset() {
  return (
    currentThemeBackgroundOptions().find((preset) => preset.key === activeThemeBackgroundKey) ??
    currentThemeBackgroundOptions()[0] ??
    themeBackgroundPresets[0]
  );
}

function currentInterfaceFontOption() {
  return (
    interfaceFontOptionsList.find((option) => option.key === activeInterfaceFontKey) ??
    interfaceFontOptionsList[0]
  );
}

function currentInterfaceSizeOption() {
  return (
    interfaceSizeOptionsList.find((option) => option.key === activeInterfaceSizeKey) ??
    interfaceSizeOptionsList[0]
  );
}

function currentEditorFontOption() {
  return (
    editorFontOptionsList.find((option) => option.key === activeEditorFontKey) ??
    editorFontOptionsList[0]
  );
}

function currentEditorFontSizePreset() {
  return (
    editorFontSizePresets.find((preset) => preset.key === activeEditorFontSizeKey) ??
    editorFontSizePresets[0]
  );
}

function stepInterfaceSize(direction) {
  const options = interfaceSizeOptionsList;
  const currentIndex = Math.max(
    0,
    options.findIndex((option) => option.key === activeInterfaceSizeKey),
  );
  const nextIndex = Math.min(options.length - 1, Math.max(0, currentIndex + direction));
  if (nextIndex === currentIndex) {
    return;
  }

  activeInterfaceSizeKey = options[nextIndex].key;
  applyWorkbenchThemeState();
  syncThemeUi();
  renderEditor();
  persistThemeSettings();
}

function stepEditorFontSize(direction) {
  const presets = editorFontSizePresets;
  const currentIndex = Math.max(
    0,
    presets.findIndex((preset) => preset.key === activeEditorFontSizeKey),
  );
  const nextIndex = Math.min(presets.length - 1, Math.max(0, currentIndex + direction));
  if (nextIndex === currentIndex) {
    return;
  }

  activeEditorFontSizeKey = presets[nextIndex].key;
  applyEditorFontSizeTheme();
  syncEditorPreferencesUi();
  persistEditorPreferences();
  renderEditor();
}

function currentEditorBackgroundPreset() {
  return (
    currentEditorBackgroundOptions().find((preset) => preset.key === activeEditorBackgroundKey) ??
    currentEditorBackgroundOptions()[0] ??
    editorBackgroundPresets[0]
  );
}

function currentEditorTextColorPreset() {
  return (
    currentEditorTextColorOptions().find((preset) => preset.key === activeEditorTextColorKey) ??
    currentEditorTextColorOptions()[0] ??
    editorTextColorPresets[0]
  );
}

function currentEditorTextHighlightPreset() {
  return (
    editorTextHighlightPresets.find((preset) => preset.key === activeEditorTextHighlightKey) ??
    editorTextHighlightPresets[0]
  );
}

function applyThemeColorTheme() {
  Object.entries(currentThemeColorPreset().vars).forEach(([cssVar, value]) => {
    document.documentElement.style.setProperty(cssVar, value);
  });
}

function applyThemeBackgroundTheme() {
  Object.entries(currentThemeBackgroundPreset().vars).forEach(([cssVar, value]) => {
    document.documentElement.style.setProperty(cssVar, value);
  });
}

function applyInterfaceFontTheme() {
  document.documentElement.style.setProperty("--ui-font-family", currentInterfaceFontOption().value);
}

function applyInterfaceSizeTheme() {
  Object.entries(currentInterfaceSizeOption().vars).forEach(([cssVar, value]) => {
    document.documentElement.style.setProperty(cssVar, value);
  });
}

function applyEditorFontTheme() {
  document.documentElement.style.setProperty("--editor-font-family", currentEditorFontOption().value);
}

function applyEditorFontSizeTheme() {
  Object.entries(currentEditorFontSizePreset().vars).forEach(([cssVar, value]) => {
    document.documentElement.style.setProperty(cssVar, value);
  });
}

function applyEditorBackgroundTheme() {
  Object.entries(currentEditorBackgroundPreset().vars).forEach(([cssVar, value]) => {
    document.documentElement.style.setProperty(cssVar, value);
  });
}

function applyEditorTextColorTheme() {
  Object.entries(currentEditorTextColorPreset().vars).forEach(([cssVar, value]) => {
    document.documentElement.style.setProperty(cssVar, value);
  });
}

function applyEditorTextHighlightTheme() {
  const preset = currentEditorTextHighlightPreset();
  document.documentElement.style.setProperty("--editor-text-highlight", preset.color);
  document.documentElement.style.setProperty("--editor-caret", preset.color);
  document.documentElement.style.setProperty("--editor-caret-shadow", preset.caretShadow);
}

function currentThemeTextPreset() {
  return currentThemeTextOptions().find((preset) => preset.key === activeThemeTextKey) ?? currentThemeTextOptions()[0] ?? themeTextPresets[0];
}

function currentThemeLinePreset() {
  return currentThemeLineOptions().find((preset) => preset.key === activeThemeLineKey) ?? currentThemeLineOptions()[0] ?? themeLinePresets[0];
}

function currentThemeModeOptions() {
  return themePalettePresets.filter((palette) => palette.mode === themeMode);
}

function defaultThemePaletteForMode(mode) {
  return themePalettePresets.find((palette) => palette.mode === mode) ?? themePalettePresets[0];
}

function currentThemePalette() {
  const byKey = themePalettePresets.find((palette) => palette.key === activeThemePaletteKey);
  if (byKey && byKey.mode === themeMode) {
    return byKey;
  }
  return currentThemeModeOptions()[0] ?? themePalettePresets[0];
}

function applyThemeTextTheme() {
  Object.entries(currentThemeTextPreset().vars).forEach(([cssVar, value]) => {
    document.documentElement.style.setProperty(cssVar, value);
  });
}

function applyThemeLineTheme() {
  Object.entries(currentThemeLinePreset().vars).forEach(([cssVar, value]) => {
    document.documentElement.style.setProperty(cssVar, value);
  });
}

function applyWorkbenchThemeState() {
  document.documentElement.style.colorScheme = themeMode;
  applyThemeBackgroundTheme();
  applyThemeTextTheme();
  applyThemeColorTheme();
  applyThemeLineTheme();
  applyInterfaceFontTheme();
  applyInterfaceSizeTheme();
}

function applyThemePaletteSelection(paletteKey) {
  const palette = themePalettePresets.find((entry) => entry.key === paletteKey);
  if (!palette) {
    return;
  }

  activeThemePaletteKey = palette.key;
  themeMode = palette.mode;
  activeThemeColorKey = palette.themeColorKey;
  activeThemeTextKey = palette.themeTextKey;
  activeThemeBackgroundKey = palette.themeBackgroundKey;
  activeThemeLineKey = palette.themeLineKey;
  applyWorkbenchThemeState();
}

function syncThemeUi() {
  coerceThemeSelectionsForMode();

  themeTextOptions.innerHTML = currentThemeTextOptions()
    .map(
      (preset) => `
        <button class="palette-option" type="button" data-theme-text-key="${preset.key}">
          ${preset.label}
        </button>
      `,
    )
    .join("");

  themeBackgroundOptions.innerHTML = currentThemeBackgroundOptions()
    .map(
      (preset) => `
        <button class="palette-option" type="button" data-theme-background-key="${preset.key}">
          ${preset.label}
        </button>
      `,
    )
    .join("");

  themeLineOptions.innerHTML = currentThemeLineOptions()
    .map(
      (preset) => `
        <button class="palette-option" type="button" data-theme-line-key="${preset.key}">
          ${preset.label}
        </button>
      `,
    )
    .join("");

  themePaletteButton.textContent = currentThemePalette().label;
  themePaletteButton.setAttribute("aria-expanded", String(themePaletteMenuOpen));
  themePaletteOptionsMenu.classList.toggle("is-open", themePaletteMenuOpen);
  themePaletteOptionsMenu.innerHTML = currentThemeModeOptions()
    .map(
      (palette) => `
        <button class="palette-option" type="button" data-theme-palette-key="${palette.key}">
          ${palette.label}
        </button>
      `,
    )
    .join("");
  themePaletteOptionsMenu.querySelectorAll("[data-theme-palette-key]").forEach((button) => {
    const active = button.dataset.themePaletteKey === activeThemePaletteKey;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  });

  themeTextButton.textContent = currentThemeTextPreset().label;
  themeTextButton.setAttribute("aria-expanded", String(themeTextMenuOpen));
  themeTextOptions.classList.toggle("is-open", themeTextMenuOpen);
  themeTextOptions.querySelectorAll("[data-theme-text-key]").forEach((button) => {
    const active = button.dataset.themeTextKey === activeThemeTextKey;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  });

  themeColorButton.textContent = currentThemeColorPreset().label;
  themeColorButton.setAttribute("aria-expanded", String(themeColorMenuOpen));
  themeColorOptions.classList.toggle("is-open", themeColorMenuOpen);
  themeColorOptions.querySelectorAll("[data-theme-color-key]").forEach((button) => {
    const active = button.dataset.themeColorKey === activeThemeColorKey;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  });

  themeBackgroundButton.textContent = currentThemeBackgroundPreset().label;
  themeBackgroundButton.setAttribute("aria-expanded", String(themeBackgroundMenuOpen));
  themeBackgroundOptions.classList.toggle("is-open", themeBackgroundMenuOpen);
  themeBackgroundOptions.querySelectorAll("[data-theme-background-key]").forEach((button) => {
    const active = button.dataset.themeBackgroundKey === activeThemeBackgroundKey;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  });

  themeLineButton.textContent = currentThemeLinePreset().label;
  themeLineButton.setAttribute("aria-expanded", String(themeLineMenuOpen));
  themeLineOptions.classList.toggle("is-open", themeLineMenuOpen);
  themeLineOptions.querySelectorAll("[data-theme-line-key]").forEach((button) => {
    const active = button.dataset.themeLineKey === activeThemeLineKey;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  });

  interfaceFontButton.textContent = currentInterfaceFontOption().label;
  interfaceFontButton.setAttribute("aria-expanded", String(interfaceFontMenuOpen));
  interfaceFontOptions.classList.toggle("is-open", interfaceFontMenuOpen);
  interfaceFontOptions.querySelectorAll("[data-interface-font-key]").forEach((button) => {
    const active = button.dataset.interfaceFontKey === activeInterfaceFontKey;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  });

  const currentInterfaceSize = currentInterfaceSizeOption();
  interfaceSizeValue.textContent = String(currentInterfaceSize.size);
  interfaceSizeDecrease.disabled = currentInterfaceSize.size <= interfaceSizeOptionsList[0].size;
  interfaceSizeIncrease.disabled =
    currentInterfaceSize.size >= interfaceSizeOptionsList[interfaceSizeOptionsList.length - 1].size;

  themeModeDark?.classList.toggle("is-active", themeMode === "dark");
  themeModeLight?.classList.toggle("is-active", themeMode === "light");
  themeModeDark?.setAttribute("aria-pressed", String(themeMode === "dark"));
  themeModeLight?.setAttribute("aria-pressed", String(themeMode === "light"));
  themeModeToggle?.setAttribute("data-mode", themeMode);
}

function renderThemeControls() {
  themeTextOptions.innerHTML = currentThemeTextOptions()
    .map(
      (preset) => `
        <button class="palette-option" type="button" data-theme-text-key="${preset.key}">
          ${preset.label}
        </button>
      `,
    )
    .join("");

  themeColorOptions.innerHTML = themeColorPresets
    .map(
      (preset) => `
        <button class="palette-option" type="button" data-theme-color-key="${preset.key}">
          ${preset.label}
        </button>
      `,
    )
    .join("");

  themeBackgroundOptions.innerHTML = currentThemeBackgroundOptions()
    .map(
      (preset) => `
        <button class="palette-option" type="button" data-theme-background-key="${preset.key}">
          ${preset.label}
        </button>
      `,
    )
    .join("");

  themeLineOptions.innerHTML = currentThemeLineOptions()
    .map(
      (preset) => `
        <button class="palette-option" type="button" data-theme-line-key="${preset.key}">
          ${preset.label}
        </button>
      `,
    )
    .join("");

  interfaceFontOptions.innerHTML = interfaceFontOptionsList
    .map(
      (option) => `
        <button class="palette-option" type="button" data-interface-font-key="${option.key}">
          ${option.label}
        </button>
      `,
    )
    .join("");

  syncThemeUi();
}

function syncEditorPreferencesUi() {
  coerceEditorSelectionsForMode();

  editorModeDark?.classList.toggle("is-active", editorMode === "dark");
  editorModeLight?.classList.toggle("is-active", editorMode === "light");
  editorModeDark?.setAttribute("aria-pressed", String(editorMode === "dark"));
  editorModeLight?.setAttribute("aria-pressed", String(editorMode === "light"));
  editorModeToggle?.setAttribute("data-mode", editorMode);

  editorFontButton.textContent = currentEditorFontOption().label;
  editorFontButton.setAttribute("aria-expanded", String(editorFontMenuOpen));
  editorFontOptions.classList.toggle("is-open", editorFontMenuOpen);
  editorFontOptions.querySelectorAll("[data-editor-font-key]").forEach((button) => {
    const active = button.dataset.editorFontKey === activeEditorFontKey;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  });

  const currentEditorFontSize = currentEditorFontSizePreset();
  editorFontSizeValue.textContent = String(currentEditorFontSize.size);
  editorFontSizeDecrease.disabled = currentEditorFontSize.size <= editorFontSizePresets[0].size;
  editorFontSizeIncrease.disabled =
    currentEditorFontSize.size >= editorFontSizePresets[editorFontSizePresets.length - 1].size;

  editorBackgroundButton.textContent = currentEditorBackgroundPreset().label;
  editorBackgroundButton.setAttribute("aria-expanded", String(editorBackgroundMenuOpen));
  editorBackgroundOptions.classList.toggle("is-open", editorBackgroundMenuOpen);
  editorBackgroundOptions.innerHTML = currentEditorBackgroundOptions()
    .map(
      (preset) => `
        <button class="palette-option" type="button" data-editor-background-key="${preset.key}">
          ${preset.label}
        </button>
      `,
    )
    .join("");
  editorBackgroundOptions.querySelectorAll("[data-editor-background-key]").forEach((button) => {
    const active = button.dataset.editorBackgroundKey === activeEditorBackgroundKey;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  });

  textColorButton.textContent = currentEditorTextColorPreset().label;
  textColorButton.setAttribute("aria-expanded", String(textColorMenuOpen));
  textColorOptions.classList.toggle("is-open", textColorMenuOpen);
  textColorOptions.innerHTML = currentEditorTextColorOptions()
    .map(
      (preset) => `
        <button class="palette-option" type="button" data-text-color-key="${preset.key}">
          ${preset.label}
        </button>
      `,
    )
    .join("");
  textColorOptions.querySelectorAll("[data-text-color-key]").forEach((button) => {
    const active = button.dataset.textColorKey === activeEditorTextColorKey;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  });

  textHighlightButton.textContent = currentEditorTextHighlightPreset().label;
  textHighlightButton.setAttribute("aria-expanded", String(textHighlightMenuOpen));
  textHighlightOptions.classList.toggle("is-open", textHighlightMenuOpen);
  textHighlightOptions.querySelectorAll("[data-text-highlight-key]").forEach((button) => {
    const active = button.dataset.textHighlightKey === activeEditorTextHighlightKey;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  });
}

function renderEditorPreferenceControls() {
  editorFontOptions.innerHTML = editorFontOptionsList
    .map(
      (option) => `
        <button class="palette-option" type="button" data-editor-font-key="${option.key}">
          ${option.label}
        </button>
      `,
    )
    .join("");

  editorBackgroundOptions.innerHTML = currentEditorBackgroundOptions()
    .map(
      (preset) => `
        <button class="palette-option" type="button" data-editor-background-key="${preset.key}">
          ${preset.label}
        </button>
      `,
    )
    .join("");

  textColorOptions.innerHTML = currentEditorTextColorOptions()
    .map(
      (preset) => `
        <button class="palette-option" type="button" data-text-color-key="${preset.key}">
          ${preset.label}
        </button>
      `,
    )
    .join("");

  textHighlightOptions.innerHTML = editorTextHighlightPresets
    .map(
      (preset) => `
        <button class="palette-option" type="button" data-text-highlight-key="${preset.key}">
          ${preset.label}
        </button>
      `,
    )
    .join("");

  syncEditorPreferencesUi();
}

function closeSettingsMenus(except = "") {
  languageMenuOpen = except === "language";
  autoSaveMenuOpen = except === "autoSave";
  themePaletteMenuOpen = except === "themePalette";
  themeTextMenuOpen = except === "themeText";
  themeColorMenuOpen = except === "themeColor";
  themeBackgroundMenuOpen = except === "themeBackground";
  themeLineMenuOpen = except === "themeLine";
  interfaceFontMenuOpen = except === "interfaceFont";
  editorFontMenuOpen = except === "editorFont";
  paletteMenuOpen = except === "palette";
  editorBackgroundMenuOpen = except === "editorBackground";
  textColorMenuOpen = except === "textColor";
  textHighlightMenuOpen = except === "textHighlight";
  blockSurfaceMenuOpen = except === "block";
  lineHighlightMenuOpen = except === "line";
  selectionHighlightMenuOpen = except === "selection";
  if (except !== "glyphColor") {
    openGlyphColorMenu = null;
  }
}

function syncSettingsUi() {
  syncLanguageUi();
  syncAutoSaveUi();
  syncThemeUi();
  syncEditorPreferencesUi();
  syncGlyphHighlightUi();
}

function persistGlyphHighlights() {
  try {
    window.localStorage.setItem(
      glyphHighlightStorageKey,
      JSON.stringify({
        editorMode,
        paletteKey: activePaletteKey,
        editorBackgroundKey: activeEditorBackgroundKey,
        editorTextColorKey: activeEditorTextColorKey,
        editorTextHighlightKey: activeEditorTextHighlightKey,
        blockSurfaceKey: activeBlockSurfaceKey,
        lineHighlightKey: activeLineHighlightKey,
        selectionHighlightKey: activeSelectionHighlightKey,
        colors: glyphColors,
      }),
    );
  } catch (error) {
    console.warn("failed to persist glyph highlights", error);
  }
  persistCustomPaletteConfigState();
}

function applyGlyphColors() {
  glyphColorSpecs.forEach((spec) => {
    document.documentElement.style.setProperty(spec.cssVar, glyphColors[spec.key]);
  });
}

function currentEditorModeOptions() {
  return glyphPaletteOptions.filter(
    (palette) => (editorPaletteMeta[palette.key]?.mode ?? "dark") === editorMode,
  );
}

function defaultEditorPaletteForMode(mode) {
  return (
    glyphPaletteOptions.find((palette) => (editorPaletteMeta[palette.key]?.mode ?? "dark") === mode) ??
    glyphPaletteOptions[0]
  );
}

function currentPalette() {
  const byKey = glyphPaletteOptions.find((palette) => palette.key === activePaletteKey);
  if (byKey && (editorPaletteMeta[byKey.key]?.mode ?? "dark") === editorMode) {
    return byKey;
  }
  return currentEditorModeOptions()[0] ?? glyphPaletteOptions[0];
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

function currentSelectionHighlight() {
  return (
    selectionHighlightPresets.find((preset) => preset.key === activeSelectionHighlightKey) ??
    selectionHighlightPresets[0]
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

function applySelectionHighlightTheme() {
  document.documentElement.style.setProperty("--editor-selection", currentSelectionHighlight().value);
}

function applyEditorPaletteSelection(paletteKey) {
  const palette = glyphPaletteOptions.find((entry) => entry.key === paletteKey);
  if (!palette) {
    return;
  }

  const meta = editorPaletteMeta[palette.key] ?? {};
  activePaletteKey = palette.key;
  editorMode = meta.mode ?? editorMode;
  activeEditorBackgroundKey = meta.backgroundKey ?? activeEditorBackgroundKey;
  activeEditorTextColorKey = meta.textColorKey ?? activeEditorTextColorKey;
  activeEditorTextHighlightKey = meta.textHighlightKey ?? activeEditorTextHighlightKey;
  activeBlockSurfaceKey = meta.blockKey ?? activeBlockSurfaceKey;
  activeLineHighlightKey = meta.lineKey ?? activeLineHighlightKey;
  activeSelectionHighlightKey = meta.selectionKey ?? activeSelectionHighlightKey;
  applySharedGlyphColor(palette.color);
  applyEditorTheme();
  applyEditorBackgroundTheme();
  applyEditorTextColorTheme();
  applyEditorTextHighlightTheme();
  applyBlockSurfaceTheme();
  applyLineHighlightTheme();
  applySelectionHighlightTheme();
  applyGlyphColors();
}

function syncGlyphHighlightUi() {
  highlightPaletteButton.textContent = currentPalette().label;
  highlightPaletteButton.setAttribute("aria-expanded", String(paletteMenuOpen));
  highlightPaletteOptions.classList.toggle("is-open", paletteMenuOpen);
  highlightPaletteOptions.innerHTML = currentEditorModeOptions()
    .map(
      (palette) => `
        <button class="palette-option" type="button" data-palette-key="${palette.key}">
          ${palette.label}
        </button>
      `,
    )
    .join("");
  highlightPaletteOptions.querySelectorAll("[data-palette-key]").forEach((button) => {
    const active = activePaletteKey === button.dataset.paletteKey;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  });

  blockSurfaceButton.textContent = currentBlockSurface().label;
  blockSurfaceButton.setAttribute("aria-expanded", String(blockSurfaceMenuOpen));
  blockSurfaceOptions.classList.toggle("is-open", blockSurfaceMenuOpen);

  blockSurfaceOptions.querySelectorAll("[data-block-surface-key]").forEach((button) => {
    const active = activeBlockSurfaceKey === button.dataset.blockSurfaceKey;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  });

  lineHighlightButton.textContent = currentLineHighlight().label;
  lineHighlightButton.setAttribute("aria-expanded", String(lineHighlightMenuOpen));
  lineHighlightOptions.classList.toggle("is-open", lineHighlightMenuOpen);

  lineHighlightOptions.querySelectorAll("[data-line-highlight-key]").forEach((button) => {
    const active = activeLineHighlightKey === button.dataset.lineHighlightKey;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  });

  selectionHighlightButton.textContent = currentSelectionHighlight().label;
  selectionHighlightButton.setAttribute("aria-expanded", String(selectionHighlightMenuOpen));
  selectionHighlightOptions.classList.toggle("is-open", selectionHighlightMenuOpen);

  selectionHighlightOptions.querySelectorAll("[data-selection-highlight-key]").forEach((button) => {
    const active = activeSelectionHighlightKey === button.dataset.selectionHighlightKey;
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

  selectionHighlightOptions.innerHTML = selectionHighlightPresets
    .map(
      (preset) => `
        <button class="palette-option" type="button" data-selection-highlight-key="${preset.key}">
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
      activeBlockSurfaceKey = blockSurfacePresets[0].key;
      activeLineHighlightKey = lineHighlightPresets[0].key;
      activeSelectionHighlightKey = selectionHighlightPresets[0].key;
      applyEditorTheme();
      applyBlockSurfaceTheme();
      applyLineHighlightTheme();
      applySelectionHighlightTheme();
      applyGlyphColors();
      return;
    }

    const parsed = JSON.parse(raw);
    if (parsed?.editorMode === "dark" || parsed?.editorMode === "light") {
      editorMode = parsed.editorMode;
    }
    const requestedPaletteKey = legacyGlyphPaletteKeyMap[parsed?.paletteKey] ?? parsed?.paletteKey;
    activePaletteKey = glyphPaletteOptions.some((palette) => palette.key === requestedPaletteKey)
      ? requestedPaletteKey
      : glyphPaletteOptions[0].key;
    editorMode = editorPaletteMeta[activePaletteKey]?.mode ?? editorMode;
    if (editorBackgroundPresets.some((preset) => preset.key === parsed?.editorBackgroundKey)) {
      activeEditorBackgroundKey = parsed.editorBackgroundKey;
    }
    if (editorTextColorPresets.some((preset) => preset.key === parsed?.editorTextColorKey)) {
      activeEditorTextColorKey = parsed.editorTextColorKey;
    }
    const migratedEditorTextHighlightKey =
      legacyEditorTextHighlightKeyMap[parsed?.editorTextHighlightKey] ?? parsed?.editorTextHighlightKey;
    if (editorTextHighlightPresets.some((preset) => preset.key === migratedEditorTextHighlightKey)) {
      activeEditorTextHighlightKey = migratedEditorTextHighlightKey;
    }
    activeBlockSurfaceKey = blockSurfacePresets.some((preset) => preset.key === parsed?.blockSurfaceKey)
      ? parsed.blockSurfaceKey
      : blockSurfacePresets[0].key;
    activeLineHighlightKey = lineHighlightPresets.some(
      (preset) => preset.key === parsed?.lineHighlightKey,
    )
      ? parsed.lineHighlightKey
      : lineHighlightPresets[0].key;
    activeSelectionHighlightKey = selectionHighlightPresets.some(
      (preset) => preset.key === parsed?.selectionHighlightKey,
    )
      ? parsed.selectionHighlightKey
      : selectionHighlightPresets[0].key;
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
  applyEditorBackgroundTheme();
  applyEditorTextColorTheme();
  applyEditorTextHighlightTheme();
  applyBlockSurfaceTheme();
  applyLineHighlightTheme();
  applySelectionHighlightTheme();
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

function characterOffsetForPointer(event, analysis) {
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

  if (!lineText.length) {
    return lineStart;
  }

  const targetX = Math.max(0, localX);
  for (let index = 0; index < lineText.length; index += 1) {
    const next = getCaretCoordinates(lineText, lineStart, lineStart + index + 1).x;
    if (targetX < next) {
      return lineStart + index;
    }
  }

  return lineStart + lineText.length - 1;
}

function classifySelectionChar(char) {
  if (!char) {
    return "none";
  }
  if (/\s/.test(char)) {
    return "whitespace";
  }
  if (/[\p{L}\p{N}_]/u.test(char)) {
    return "word";
  }
  return "symbol";
}

function wordSelectionRangeForOffset(value, rawOffset) {
  if (!value.length) {
    return { start: 0, end: 0 };
  }

  const clampedOffset = Math.max(0, Math.min(value.length, rawOffset));
  const rightChar = value[clampedOffset] ?? "";
  const leftChar = clampedOffset > 0 ? value[clampedOffset - 1] ?? "" : "";

  let anchorIndex = clampedOffset;
  let selectionKind = classifySelectionChar(rightChar);

  if (selectionKind === "none" || selectionKind === "whitespace") {
    const leftKind = classifySelectionChar(leftChar);
    if (leftKind !== "none" && leftKind !== "whitespace") {
      anchorIndex = clampedOffset - 1;
      selectionKind = leftKind;
    }
  }

  if (selectionKind === "none" || selectionKind === "whitespace") {
    return { start: clampedOffset, end: clampedOffset };
  }

  let start = anchorIndex;
  let end = anchorIndex + 1;

  while (start > 0 && classifySelectionChar(value[start - 1]) === selectionKind) {
    start -= 1;
  }

  while (end < value.length && classifySelectionChar(value[end]) === selectionKind) {
    end += 1;
  }

  return { start, end };
}

function lineSelectionRangeForOffset(value, rawOffset) {
  const clampedOffset = Math.max(0, Math.min(value.length, rawOffset));
  const lineStart = currentLineStart(value, clampedOffset);
  const lineEnd = currentLineEnd(value, clampedOffset);
  const terminalEnd = lineEnd < value.length ? lineEnd + 1 : lineEnd;
  return { start: lineStart, end: terminalEnd };
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
  toggleSidebar.setAttribute("aria-label", t("openSidebar"));
  toggleSidebar.setAttribute("title", t("openSidebar"));
  toggleSidebar.innerHTML = sidebarToggleSvg(false);
  closeSidebar.innerHTML = sidebarToggleSvg(false);
  closeSidebar.setAttribute("aria-label", t("closeSidebar"));
  closeSidebar.setAttribute("title", t("closeSidebar"));

  drawerTabs.forEach((button) => {
    const active = button.dataset.drawerTab === activeDrawerTab;
    button.classList.toggle("is-active", active);
    const panel = document.getElementById(`drawerPanel${button.dataset.drawerTab.charAt(0).toUpperCase()}${button.dataset.drawerTab.slice(1)}`);
    panel.classList.toggle("is-active", active);
  });
}

function chooseWorkspaceFile(preferredFile, files) {
  if (preferredFile && files.includes(preferredFile)) {
    return preferredFile;
  }
  if (files.includes(primaryFile)) {
    return primaryFile;
  }
  const styioFile = files.find((filePath) => filePath.endsWith(".styio"));
  if (styioFile) {
    return styioFile;
  }
  return files[0] ?? primaryFile;
}

function collectTreePaths(entries, bucket = new Set()) {
  entries.forEach((entry) => {
    if (!entry?.path) {
      return;
    }
    bucket.add(entry.path);
    if (entry.type === "directory" && Array.isArray(entry.children)) {
      collectTreePaths(entry.children, bucket);
    }
  });
  return bucket;
}

function collectDirectoryPaths(entries, bucket = new Set()) {
  entries.forEach((entry) => {
    if (!entry?.path || entry.type !== "directory") {
      return;
    }
    bucket.add(entry.path);
    if (Array.isArray(entry.children)) {
      collectDirectoryPaths(entry.children, bucket);
    }
  });
  return bucket;
}

function normalizeDeleteSelection(paths) {
  const normalized = Array.from(new Set((paths || []).map((path) => String(path || "").trim()).filter(Boolean))).sort();
  return normalized.filter((candidate, index) => {
    return !normalized.some((other, otherIndex) => {
      if (index === otherIndex) {
        return false;
      }
      return candidate.startsWith(`${other}/`);
    });
  });
}

function findTreeEntryByPath(entries, targetPath) {
  for (const entry of entries || []) {
    if (entry?.path === targetPath) {
      return entry;
    }
    if (entry?.type === "directory") {
      const nested = findTreeEntryByPath(entry.children || [], targetPath);
      if (nested) {
        return nested;
      }
    }
  }
  return null;
}

function activeTreeEntry() {
  if (!activeTreePath) {
    return null;
  }
  if (activeTreePath === currentFile && !workspaceEntries.length) {
    return { type: "file", path: currentFile, name: currentFile.split("/").pop() || currentFile };
  }
  return findTreeEntryByPath(workspaceEntries, activeTreePath);
}

function parentDirectoryOf(path) {
  const index = String(path || "").lastIndexOf("/");
  return index >= 0 ? path.slice(0, index) : "";
}

function joinRelativePath(basePath, leafName) {
  return basePath ? `${basePath}/${leafName}` : leafName;
}

function normalizeWorkspaceDraftPath(rawPath) {
  return String(rawPath || "")
    .trim()
    .replace(/^(?:(?:\.\/)|\/)+/, "");
}

function formatWorkspaceDraftPath(rawPath) {
  const normalizedPath = normalizeWorkspaceDraftPath(rawPath);
  return normalizedPath ? `./${normalizedPath}` : "./";
}

function resolveCreationBasePath() {
  const entry = activeTreeEntry();
  if (!entry) {
    return "";
  }
  if (entry.type === "directory") {
    return entry.path;
  }
  return parentDirectoryOf(entry.path);
}

function defaultCreateTarget(kind) {
  const leafName = defaultCreateLeafNames[kind];
  const basePath = resolveCreationBasePath();
  const targetPath = basePath ? joinRelativePath(basePath, leafName) : leafName;
  return formatWorkspaceDraftPath(targetPath);
}

function isTreePathSelected(path) {
  return selectedTreePaths.has(path);
}

function clearBulkDeleteSelection() {
  selectedTreePaths = new Set();
}

function exitBulkDeleteMode() {
  bulkDeleteMode = false;
  clearBulkDeleteSelection();
}

function syncBulkDeleteButton() {
  if (!bulkDeleteButton) {
    return;
  }

  const selectedCount = selectedTreePaths.size;
  bulkDeleteButton.classList.toggle("is-active", bulkDeleteMode);
  bulkDeleteButton.classList.toggle("has-selection", bulkDeleteMode && selectedCount > 0);
  bulkDeleteButton.setAttribute("aria-pressed", String(bulkDeleteMode));

  if (!bulkDeleteMode) {
    const activeEntry = activeTreeEntry();
    if (activeEntry) {
      const label = t("deleteActiveEntry", { name: activeEntry.name });
      bulkDeleteButton.setAttribute("aria-label", label);
      bulkDeleteButton.setAttribute("title", label);
      return;
    }
    bulkDeleteButton.setAttribute("aria-label", t("selectFilesToDelete"));
    bulkDeleteButton.setAttribute("title", t("selectFilesToDelete"));
    return;
  }

  if (selectedCount > 0) {
    const label = t("deleteSelectedItems", {
      count: selectedCount,
      suffix: selectedCount > 1 ? "s" : "",
    });
    bulkDeleteButton.setAttribute("aria-label", label);
    bulkDeleteButton.setAttribute("title", label);
    return;
  }

  bulkDeleteButton.setAttribute("aria-label", t("exitDeleteSelection"));
  bulkDeleteButton.setAttribute("title", t("exitDeleteSelection"));
}

function syncRefreshWorkspaceButton() {
  if (!refreshWorkspaceButton) {
    return;
  }

  refreshWorkspaceButton.classList.toggle("is-cancel-mode", bulkDeleteMode);
  refreshWorkspaceButton.innerHTML = bulkDeleteMode ? cancelSelectionSvg : refreshWorkspaceSvg;
  const label = bulkDeleteMode ? t("cancelMultiSelect") : t("refreshWorkspace");
  refreshWorkspaceButton.setAttribute("aria-label", label);
  refreshWorkspaceButton.setAttribute("title", label);
}

function currentLanguageOption() {
  return languageOptionsList.find((option) => option.key === activeLanguageKey) ?? languageOptionsList[0];
}

function syncLanguageUi() {
  if (languageModeButton) {
    languageModeButton.textContent = currentLanguageOption().label;
    languageModeButton.setAttribute("aria-expanded", String(languageMenuOpen));
  }

  if (!languageModeOptions) {
    return;
  }

  languageModeOptions.classList.toggle("is-open", languageMenuOpen);
  languageModeOptions.querySelectorAll("[data-language-key]").forEach((button) => {
    const active = button.dataset.languageKey === activeLanguageKey;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  });
}

function renderLanguageOptions() {
  if (!languageModeOptions) {
    return;
  }

  languageModeOptions.innerHTML = languageOptionsList
    .map(
      (option) => `
        <button class="palette-option" type="button" data-language-key="${option.key}">
          ${option.label}
        </button>
      `,
    )
    .join("");

  syncLanguageUi();
}

function currentAutoSaveOption() {
  return autoSaveModeOptionsList.find((option) => option.key === autoSaveMode) ?? autoSaveModeOptionsList[0];
}

function clearAutoSaveTimer() {
  if (autoSaveTimer !== null) {
    window.clearTimeout(autoSaveTimer);
    autoSaveTimer = null;
  }
}

function persistAutoSaveState() {
  try {
    window.localStorage.setItem(
      autoSaveStorageKey,
      JSON.stringify({
        mode: autoSaveMode,
        delay: autoSaveDelay,
      }),
    );
  } catch (error) {
    console.warn("failed to persist auto save state", error);
  }
}

function loadAutoSaveState() {
  try {
    const raw = window.localStorage.getItem(autoSaveStorageKey);
    if (!raw) {
      return;
    }

    const parsed = JSON.parse(raw);
    if (autoSaveModeOptionsList.some((option) => option.key === parsed?.mode)) {
      autoSaveMode = parsed.mode;
    }
    const nextDelay = Number(parsed?.delay);
    if (Number.isFinite(nextDelay) && nextDelay >= 250) {
      autoSaveDelay = Math.round(nextDelay / 250) * 250;
    }
  } catch (error) {
    console.warn("failed to restore auto save state", error);
  }
}

function syncAutoSaveUi() {
  if (autoSaveModeButton) {
    const labelMap = {
      off: activeLanguageKey === "zhCn" ? "关闭" : "Off",
      afterDelay: activeLanguageKey === "zhCn" ? "延迟后" : "After Delay",
      onFocusChange: activeLanguageKey === "zhCn" ? "焦点切换时" : "On Focus Change",
      onWindowChange: activeLanguageKey === "zhCn" ? "窗口切换时" : "On Window Change",
    };
    autoSaveModeButton.textContent = labelMap[autoSaveMode] ?? currentAutoSaveOption().label;
    autoSaveModeButton.setAttribute("aria-expanded", String(autoSaveMenuOpen));
  }

  if (autoSaveModeOptions) {
    autoSaveModeOptions.classList.toggle("is-open", autoSaveMenuOpen);
    autoSaveModeOptions.querySelectorAll("[data-auto-save-mode]").forEach((button) => {
      const active = button.dataset.autoSaveMode === autoSaveMode;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
  }

  if (autoSaveDelayField) {
    autoSaveDelayField.hidden = autoSaveMode !== "afterDelay";
  }

  if (autoSaveDelayInput) {
    autoSaveDelayInput.value = String(autoSaveDelay);
  }

  if (autoSaveState) {
    if (autoSaveMode === "off") {
      autoSaveState.textContent = activeLanguageKey === "zhCn" ? "自动保存：关闭" : "autosave: off";
    } else if (autoSaveMode === "afterDelay") {
      autoSaveState.textContent =
        activeLanguageKey === "zhCn" ? `自动保存：${autoSaveDelay}ms 后` : `autosave: after ${autoSaveDelay}ms`;
    } else if (autoSaveMode === "onFocusChange") {
      autoSaveState.textContent =
        activeLanguageKey === "zhCn" ? "自动保存：焦点切换时" : "autosave: on focus change";
    } else {
      autoSaveState.textContent =
        activeLanguageKey === "zhCn" ? "自动保存：窗口切换时" : "autosave: on window change";
    }
  }
}

function renderAutoSaveOptions() {
  if (!autoSaveModeOptions) {
    return;
  }

  autoSaveModeOptions.innerHTML = autoSaveModeOptionsList
    .map(
      (option) => `
        <button class="palette-option" type="button" data-auto-save-mode="${option.key}">
          ${
            activeLanguageKey === "zhCn"
              ? option.key === "off"
                ? "关闭"
                : option.key === "afterDelay"
                  ? "延迟后"
                  : option.key === "onFocusChange"
                    ? "焦点切换时"
                    : "窗口切换时"
              : option.label
          }
        </button>
      `,
    )
    .join("");

  syncAutoSaveUi();
}

function triggerAutoSave(reason = "") {
  if (autoSaveMode === "off" || !workspaceApiAvailable || saveInFlight || !fileDirty[currentFile]) {
    return;
  }

  clearAutoSaveTimer();
  void saveCurrentFile(reason);
}

function scheduleAutoSave() {
  clearAutoSaveTimer();
  if (autoSaveMode !== "afterDelay" || !workspaceApiAvailable || saveInFlight || !fileDirty[currentFile]) {
    return;
  }

  autoSaveTimer = window.setTimeout(() => {
    autoSaveTimer = null;
    triggerAutoSave("after-delay");
  }, autoSaveDelay);
}

function closeAppDialog(result = null) {
  if (appDialogOverlay.hidden) {
    return;
  }

  appDialogOverlay.hidden = true;
  const resolver = activeDialogResolver;
  activeDialogResolver = null;
  appDialogInput.value = "";
  appDialogTextarea.value = "";
  if (resolver) {
    resolver(result);
  }
}

function openAppDialog(options = {}) {
  const {
    title = t("dialog"),
    message = "",
    confirmLabel = t("confirm"),
    cancelLabel = t("cancel"),
    input = null,
    textarea = null,
    items = [],
    placeholder = "",
    destructive = false,
  } = options;

  if (activeDialogResolver) {
    activeDialogResolver(null);
    activeDialogResolver = null;
  }

  appDialogTitle.hidden = !title;
  appDialogTitle.textContent = title || t("dialog");
  appDialogMessage.textContent = message;
  appDialogMessage.classList.toggle("is-danger", destructive);
  appDialogConfirm.textContent = confirmLabel;
  appDialogCancel.textContent = cancelLabel;
  appDialogConfirm.classList.toggle("danger", destructive);

  const hasInput = input !== null;
  const hasTextarea = textarea !== null;
  appDialogInputField.hidden = !hasInput;
  appDialogInput.value = hasInput ? String(input) : "";
  appDialogInput.placeholder = placeholder;
  appDialogInput.setAttribute("aria-label", title);
  appDialogTextareaField.hidden = !hasTextarea;
  appDialogTextarea.value = hasTextarea ? String(textarea) : "";
  appDialogTextarea.placeholder = placeholder;
  appDialogTextarea.setAttribute("aria-label", title);

  const dialogItems = Array.isArray(items) ? items.filter(Boolean) : [];
  appDialogList.hidden = dialogItems.length === 0;
  appDialogList.innerHTML = dialogItems
    .map(
      (item) => `
        <div class="app-dialog-list-item">
          <span class="app-dialog-list-path">${escapeHtml(String(item))}</span>
        </div>
      `,
    )
    .join("");

  appDialogOverlay.hidden = false;

  requestAnimationFrame(() => {
    if (hasTextarea) {
      appDialogTextarea.focus();
      appDialogTextarea.setSelectionRange(appDialogTextarea.value.length, appDialogTextarea.value.length);
    } else if (hasInput) {
      appDialogInput.focus();
      appDialogInput.select();
    } else {
      appDialogConfirm.focus();
    }
  });

  return new Promise((resolve) => {
    activeDialogResolver = resolve;
  });
}

function openPromptDialog(options = {}) {
  return openAppDialog({
    ...options,
    input: options.input ?? "",
  });
}

function openTextareaDialog(options = {}) {
  return openAppDialog({
    ...options,
    textarea: options.textarea ?? "",
  });
}

function openConfirmDialog(options = {}) {
  return openAppDialog({
    ...options,
    input: null,
  });
}

function hideAppToast() {
  if (!appToast) {
    return;
  }
  appToast.hidden = true;
  appToast.classList.remove("is-success", "is-error");
  if (appToastTimer) {
    clearTimeout(appToastTimer);
    appToastTimer = null;
  }
}

function showAppToast(message, kind = "success") {
  if (!appToast || !appToastText || !message) {
    return;
  }

  if (appToastTimer) {
    clearTimeout(appToastTimer);
    appToastTimer = null;
  }

  appToastText.textContent = message;
  appToast.hidden = false;
  appToast.classList.toggle("is-success", kind === "success");
  appToast.classList.toggle("is-error", kind === "error");

  appToastTimer = window.setTimeout(() => {
    hideAppToast();
  }, 2200);
}

function setWorkspacePickerMessage(text) {
  workspacePickerCaption.textContent = text;
}

function setWorkspacePickerState({
  mode = "directory",
  includeFiles = false,
  title = t("openWorkspaceTitle"),
  caption = t("chooseWorkspaceRoot"),
  confirmLabel = t("useThisFolder"),
  onConfirm = null,
} = {}) {
  workspacePickerMode = mode;
  workspacePickerIncludeFiles = includeFiles;
  workspacePickerSelectedFilePath = "";
  workspacePickerConfirmAction = onConfirm;
  workspacePickerTitleText = title;
  workspacePickerDefaultCaptionText = caption;
  workspacePickerConfirmText = confirmLabel;
  workspacePickerTitle.textContent = title;
  workspacePickerCaption.textContent = caption;
  workspacePickerConfirm.textContent = confirmLabel;
}

function syncWorkspacePathVisual() {
  if (!workspacePathViewport || !workspacePathScrollVisual || !workspacePathScrollThumb || !workspacePathText) {
    return;
  }

  const viewportWidth = workspacePathViewport.clientWidth;
  const contentWidth = workspacePathText.scrollWidth;
  const trackWidth = workspacePathScrollVisual.clientWidth;
  const maxScroll = Math.max(0, contentWidth - viewportWidth);

  if (!trackWidth) {
    return;
  }

  if (maxScroll <= 0) {
    workspacePathScrollThumb.style.width = `${trackWidth}px`;
    workspacePathScrollThumb.style.transform = "translateX(0px)";
    workspacePathScrollVisual.classList.add("is-static");
    return;
  }

  workspacePathScrollVisual.classList.remove("is-static");
  const thumbWidth = Math.max(28, Math.round((viewportWidth / contentWidth) * trackWidth));
  const maxThumbTravel = Math.max(0, trackWidth - thumbWidth);
  const thumbX = maxThumbTravel > 0 ? (workspacePathViewport.scrollLeft / maxScroll) * maxThumbTravel : 0;
  workspacePathScrollThumb.style.width = `${thumbWidth}px`;
  workspacePathScrollThumb.style.transform = `translateX(${thumbX}px)`;
}

function syncWorkspacePathScrollerMetrics() {
  if (!workspacePathViewport || !workspacePathText) {
    return;
  }

  window.requestAnimationFrame(() => {
    const maxScroll = Math.max(0, workspacePathText.scrollWidth - workspacePathViewport.clientWidth);
    workspacePathViewport.scrollLeft = maxScroll;
    syncWorkspacePathVisual();
  });
}

function scrollWorkspacePathDisplayToEnd() {
  syncWorkspacePathScrollerMetrics();
}

function syncWorkspaceControls() {
  if (workspacePathText) {
    workspacePathText.textContent = workspaceRootPath;
  }

  if (workspacePathDisplay) {
    workspacePathDisplay.title = workspaceRootPath;
  }

  scrollWorkspacePathDisplayToEnd();

  if (workspacePathHint) {
    workspacePathHint.hidden = true;
    workspacePathHint.textContent = "";
  }

  if (workspaceCallout) {
    workspaceCallout.hidden = true;
  }
}

function renderFileTabs() {
  if (!fileTabs) {
    return;
  }

  fileTabs.innerHTML = fileOrder
    .map((fileName) => {
      const dirty = Boolean(fileDirty[fileName]);
      return `
        <div class="editor-tab ${fileName === currentFile ? "is-active" : ""} ${dirty ? "is-dirty" : ""}" data-tab-item="${escapeHtml(fileName)}">
          <button class="editor-tab-main" data-tab-file="${escapeHtml(fileName)}" type="button">
            <span class="editor-tab-label">${escapeHtml(fileName.split("/").pop() || fileName)}</span>
          </button>
          <button class="editor-tab-close" data-tab-close="${escapeHtml(fileName)}" type="button" aria-label="${escapeHtml(`${activeLanguageKey === "zhCn" ? "关闭 " : "Close "}${fileName}`)}" title="${escapeHtml(activeLanguageKey === "zhCn" ? "关闭标签页" : "Close tab")}">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M18 6 6 18"></path>
              <path d="m6 6 12 12"></path>
            </svg>
          </button>
        </div>
      `;
    })
    .join("");
}

function renderTreeEntries(entries, depth = 0) {
  return entries
    .map((entry) => {
      if (entry.type === "directory") {
        const directorySelected = isTreePathSelected(entry.path);
        const directoryActive = activeTreePath === entry.path;
        const directoryExpanded = expandedTreePaths.has(entry.path);
        const selectVerb = directorySelected
          ? activeLanguageKey === "zhCn"
            ? "取消选择"
            : "Deselect"
          : activeLanguageKey === "zhCn"
            ? "选择"
            : "Select";
        return `
          <details class="tree-folder ${bulkDeleteMode ? "is-bulk-delete-mode" : ""} ${directorySelected ? "is-bulk-selected" : ""} ${directoryActive ? "is-tree-active" : ""}" data-tree-folder-path="${escapeHtml(entry.path)}" ${directoryExpanded ? "open" : ""} style="--tree-depth:${depth}">
            <summary class="tree-folder-summary" data-tree-folder="${escapeHtml(entry.path)}">
              <div class="tree-folder-leading">
                ${
                  bulkDeleteMode
                    ? `
                      <button class="tree-select-toggle ${directorySelected ? "is-selected" : ""}" data-select-tree-path="${escapeHtml(entry.path)}" type="button" aria-label="${escapeHtml(`${selectVerb} ${entry.name}`)}" title="${escapeHtml(`${selectVerb} ${entry.name}`)}">
                        <span class="tree-select-dot" aria-hidden="true"></span>
                      </button>
                    `
                    : ""
                }
                <span class="tree-folder-name">${escapeHtml(entry.name)}</span>
              </div>
            </summary>
            <div class="tree-folder-children">${renderTreeEntries(entry.children || [], depth + 1)}</div>
          </details>
        `;
      }

      const fileName = entry.path;
      const source = typeof fileSources[fileName] === "string" ? fileSources[fileName] : "";
      const analysis = analyzeSource(source);
      const dirty = Boolean(fileDirty[fileName]);
      const issueCount = source ? analysis.warnings.length + analysis.errors.length : 0;
      let badgeText = "";
      let badgeClass = "";

      if (dirty) {
        badgeText = "dirty";
        badgeClass = "is-dirty";
      } else if (issueCount > 0) {
        badgeText = String(issueCount);
        badgeClass = "has-issues";
      }

      const fileSelected = isTreePathSelected(fileName);
      const fileActive = activeTreePath === fileName;
      const selectVerb = fileSelected
        ? activeLanguageKey === "zhCn"
          ? "取消选择"
          : "Deselect"
        : activeLanguageKey === "zhCn"
          ? "选择"
          : "Select";

      return `
        <div class="tree-file-card ${fileActive ? "is-tree-active" : ""} ${bulkDeleteMode ? "is-bulk-delete-mode" : ""} ${fileSelected ? "is-bulk-selected" : ""}" style="--tree-depth:${depth}">
          <div class="tree-file-head">
            ${
              bulkDeleteMode
                ? `
                  <button class="tree-select-toggle ${fileSelected ? "is-selected" : ""}" data-select-tree-path="${escapeHtml(fileName)}" type="button" aria-label="${escapeHtml(`${selectVerb} ${entry.name}`)}" title="${escapeHtml(`${selectVerb} ${entry.name}`)}">
                    <span class="tree-select-dot" aria-hidden="true"></span>
                  </button>
                `
                : ""
            }
            <button class="tree-file" data-tree-file="${escapeHtml(fileName)}" type="button">
              <div class="tree-copy">
                <span class="tree-name">${escapeHtml(entry.name)}</span>
              </div>
              ${badgeText ? `<span class="tree-badge ${badgeClass}">${badgeText}</span>` : ""}
            </button>
            ${
              bulkDeleteMode
                ? `
                  <button class="tree-preview-button" data-preview-file="${escapeHtml(fileName)}" type="button" aria-label="${escapeHtml(`${t("previewFile")} ${entry.name}`)}" title="${escapeHtml(t("previewFile"))}">
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  </button>
                `
                : ""
            }
          </div>
        </div>
      `;
    })
    .join("");
}

function renderFileTree() {
  if (!workspaceEntries.length && !fileOrder.length) {
    fileTree.innerHTML = `<div class="workspace-picker-empty">${escapeHtml(t("noFilesInWorkspace"))}</div>`;
    return;
  }

  const entries = workspaceEntries.length
    ? workspaceEntries
    : [
        {
          type: "file",
          name: currentFile,
          path: currentFile,
        },
      ];

  fileTree.innerHTML = renderTreeEntries(entries);
  scheduleTreeActionMenuPlacement();
}

let pendingTreeActionMenuPlacementFrame = 0;

function scheduleTreeActionMenuPlacement() {
  if (pendingTreeActionMenuPlacementFrame) {
    cancelAnimationFrame(pendingTreeActionMenuPlacementFrame);
  }

  pendingTreeActionMenuPlacementFrame = requestAnimationFrame(() => {
    pendingTreeActionMenuPlacementFrame = 0;
    positionOpenTreeActionMenu();
  });
}

function positionOpenTreeActionMenu() {
  if (!openFileActionMenu) {
    return;
  }

  const card = fileTree.querySelector(".tree-file-card.is-actions-open");
  const strip = card?.querySelector(".tree-action-strip");
  const panel = fileTree.closest(".drawer-panel");
  if (!card || !strip || !panel) {
    return;
  }

  card.classList.remove("is-actions-upward");

  const stripRect = strip.getBoundingClientRect();
  const panelRect = panel.getBoundingClientRect();
  const spaceBelow = panelRect.bottom - stripRect.top;

  if (spaceBelow < stripRect.height + 12) {
    card.classList.add("is-actions-upward");
  }
}

function closeFileTab(fileName) {
  if (!fileOrder.includes(fileName) || fileOrder.length <= 1) {
    renderEditor();
    return;
  }

  const index = fileOrder.indexOf(fileName);
  fileOrder = fileOrder.filter((entry) => entry !== fileName);

  if (currentFile === fileName) {
    const nextFile = fileOrder[Math.max(0, index - 1)] ?? fileOrder[0];
    focusFile(nextFile);
    return;
  }

  renderEditor();
}

async function deleteWorkspaceFile(fileName) {
  try {
    const response = await fetch(`${workspaceApiBase}/delete-file`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: fileName }),
    });
    const payload = await response.json();
    if (!response.ok) {
      throw new Error(payload.error || `delete file failed with ${response.status}`);
    }

    pendingDeleteFile = null;
    openFileActionMenu = null;
    workspaceLoadedFiles.delete(fileName);
    delete fileSources[fileName];
    delete fileDirty[fileName];

    const remainingFiles = workspaceFiles.filter((entry) => entry !== fileName);
    const preferredFile =
      currentFile === fileName
        ? chooseWorkspaceFile(undefined, remainingFiles)
        : currentFile;

    await loadWorkspace({ preferredFile, resetState: true });

    if (!workspaceFiles.length) {
      currentFile = primaryFile;
      fileOrder = [primaryFile];
      fileSources[primaryFile] = fileSources[primaryFile] ?? "";
      fileDirty[primaryFile] = false;
    }

    await focusFile(currentFile);
  } catch (error) {
    console.error(error);
    pendingDeleteFile = null;
    openFileActionMenu = null;
    renderEditor();
  }
}

async function deleteWorkspacePaths(paths) {
  const normalizedPaths = normalizeDeleteSelection(paths);
  if (!normalizedPaths.length) {
    return;
  }

  try {
    const response = await fetch(`${workspaceApiBase}/delete-paths`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paths: normalizedPaths }),
    });
    const payload = await response.json();
    if (!response.ok) {
      throw new Error(payload.error || `delete paths failed with ${response.status}`);
    }

    normalizedPaths.forEach((entry) => {
      workspaceLoadedFiles.delete(entry);
      delete fileSources[entry];
      delete fileDirty[entry];
    });

    const remainingFiles = workspaceFiles.filter((entry) => !normalizedPaths.includes(entry));
    const preferredFile = normalizedPaths.includes(currentFile)
      ? chooseWorkspaceFile(undefined, remainingFiles)
      : currentFile;
    if (normalizedPaths.some((entry) => activeTreePath === entry || activeTreePath.startsWith(`${entry}/`))) {
      activeTreePath = preferredFile;
    }

    pendingDeleteFile = null;
    openFileActionMenu = null;
    exitBulkDeleteMode();

    await loadWorkspace({ preferredFile, resetState: true });

    if (!workspaceFiles.length) {
      currentFile = primaryFile;
      fileOrder = [primaryFile];
      fileSources[primaryFile] = fileSources[primaryFile] ?? "";
      fileDirty[primaryFile] = false;
    }

    await focusFile(currentFile);
  } catch (error) {
    console.error(error);
    renderEditor();
  }
}

async function confirmDeletePaths(paths) {
  const deleteItems = normalizeDeleteSelection(paths);
  if (!deleteItems.length) {
    return;
  }

  const confirmed = await openConfirmDialog({
    title: "",
    message:
      deleteItems.length === 1
        ? t("deleteSinglePrompt")
        : t("deleteMultiplePrompt", { count: deleteItems.length }),
    confirmLabel: t("delete"),
    destructive: true,
    items: deleteItems,
  });
  if (confirmed === null) {
    return;
  }

  await deleteWorkspacePaths(deleteItems);
}

async function refreshWorkspace(preferredFile = currentFile) {
  openFileActionMenu = null;
  pendingDeleteFile = null;
  exitBulkDeleteMode();
  activeTreePath = "";
  await loadWorkspace({ preferredFile, resetState: true });
  editorInput.value = fileSources[currentFile] ?? "";
  renderEditor();
}

async function renameWorkspaceFile(fileName) {
  const displayedPath = formatWorkspaceDraftPath(fileName);
  const suggestedPath = await openPromptDialog({
    title: t("renameFile"),
    message: t("renameFileMessage"),
    confirmLabel: t("rename"),
    input: displayedPath,
    placeholder: displayedPath,
  });
  if (suggestedPath === null) {
    return;
  }

  const nextPath = normalizeWorkspaceDraftPath(suggestedPath);
  if (!nextPath || nextPath === fileName) {
    return;
  }

  try {
    const response = await fetch(`${workspaceApiBase}/rename-file`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: fileName, nextPath }),
    });
    const payload = await response.json();
    if (!response.ok) {
      throw new Error(payload.error || `rename file failed with ${response.status}`);
    }

    const nextFile = payload.nextFile ?? nextPath;
    const existingSource = fileSources[fileName];
    const existingDirty = fileDirty[fileName];
    if (typeof existingSource === "string") {
      fileSources[nextFile] = existingSource;
    }
    if (typeof existingDirty === "boolean") {
      fileDirty[nextFile] = existingDirty;
    }
    delete fileSources[fileName];
    delete fileDirty[fileName];
    workspaceLoadedFiles.delete(fileName);
    workspaceLoadedFiles.add(nextFile);

    fileOrder = fileOrder.map((entry) => (entry === fileName ? nextFile : entry));
    if (currentFile === fileName) {
      currentFile = nextFile;
    }
    if (activeTreePath === fileName) {
      activeTreePath = nextFile;
    }

    openFileActionMenu = null;
    pendingDeleteFile = null;
    await loadWorkspace({ preferredFile: currentFile });
    await focusFile(currentFile);
  } catch (error) {
    console.error(error);
  }
}

async function createWorkspaceEntry(kind) {
  const isFile = kind === "file";
  const defaultTarget = defaultCreateTarget(kind);
  const relativePath = await openPromptDialog({
    title: isFile ? t("createFileTitle") : t("createFolderTitle"),
    message: isFile ? t("createFileMessage") : t("createFolderMessage"),
    confirmLabel: activeLanguageKey === "zhCn" ? "创建" : "Create",
    input: defaultTarget,
    placeholder: defaultTarget,
  });
  if (relativePath === null) {
    return;
  }

  const nextPath = normalizeWorkspaceDraftPath(relativePath);
  if (!nextPath) {
    return;
  }

  try {
    const response = await fetch(`${workspaceApiBase}/${isFile ? "create-file" : "create-folder"}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(isFile ? { path: nextPath, content: "" } : { path: nextPath }),
    });
    const payload = await response.json();
    if (!response.ok) {
      throw new Error(payload.error || `create ${kind} failed with ${response.status}`);
    }

    if (isFile) {
      await loadWorkspace({ preferredFile: payload.file });
      await focusFile(payload.file);
      return;
    }

    await refreshWorkspace(currentFile);
  } catch (error) {
    console.error(error);
  }
}

async function createWorkspaceFile() {
  await createWorkspaceEntry("file");
}

async function createWorkspaceFolder() {
  await createWorkspaceEntry("folder");
}

async function loadWorkspaceFile(fileName) {
  if (!workspaceApiAvailable || !fileName) {
    return fileSources[fileName] ?? fallbackSources[fileName] ?? "";
  }

  if (workspaceLoadedFiles.has(fileName) && typeof fileSources[fileName] === "string") {
    return fileSources[fileName];
  }

  const response = await fetch(`${workspaceApiBase}/file/${encodeURIComponent(fileName)}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`file load failed with ${response.status}`);
  }

  const payload = await response.json();
  fileSources[fileName] = payload.content ?? "";
  fileDirty[fileName] = false;
  workspaceLoadedFiles.add(fileName);
  return fileSources[fileName];
}

function renderWorkspacePicker(snapshot) {
  workspacePickerPath = snapshot.currentPath || "";
  workspacePickerParentPath = snapshot.parentPath || null;
  workspacePickerSelectedFilePath = snapshot.selectedFilePath || "";
  workspacePickerCurrent.value =
    workspacePickerMode === "file" && workspacePickerSelectedFilePath
      ? workspacePickerSelectedFilePath
      : workspacePickerPath;
  workspacePickerUp.disabled = !workspacePickerParentPath;
  workspacePickerConfirm.disabled =
    workspacePickerMode === "file" ? !workspacePickerSelectedFilePath : false;

  workspacePickerBreadcrumbs.innerHTML = (snapshot.breadcrumbs || [])
    .map(
      (crumb) => `
        <button class="workspace-picker-breadcrumb" type="button" data-picker-path="${escapeHtml(crumb.path)}">
          ${escapeHtml(crumb.name)}
        </button>
      `,
    )
    .join("");

  const directoryMarkup = (snapshot.directories || [])
    .map(
      (directory) => `
        <button class="workspace-picker-entry" type="button" data-picker-path="${escapeHtml(directory.path)}" data-picker-kind="directory">
          <span class="workspace-picker-entry-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <path d="M3.75 7.75A1.75 1.75 0 0 1 5.5 6h4.05c.4 0 .79.16 1.07.44l1.24 1.24c.28.28.66.44 1.06.44h5.58a1.75 1.75 0 0 1 1.75 1.75v6.38A1.75 1.75 0 0 1 18.5 18H5.5a1.75 1.75 0 0 1-1.75-1.75z"></path>
              <path d="M3.75 10h16.5"></path>
            </svg>
          </span>
          <span class="workspace-picker-entry-copy">
            <span class="workspace-picker-entry-name">${escapeHtml(directory.name)}</span>
            <span class="workspace-picker-entry-path">${escapeHtml(directory.path)}</span>
          </span>
          <span class="workspace-picker-entry-chevron" aria-hidden="true"></span>
        </button>
      `,
    )
    .join("");

  const fileMarkup = workspacePickerIncludeFiles
    ? (snapshot.files || [])
        .map(
          (file) => `
            <button class="workspace-picker-entry workspace-picker-entry-file ${workspacePickerSelectedFilePath === file.path ? "is-selected" : ""}" type="button" data-picker-path="${escapeHtml(file.path)}" data-picker-kind="file">
              <span class="workspace-picker-entry-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24">
                  <path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"></path>
                  <path d="M14 2v5a1 1 0 0 0 1 1h5"></path>
                </svg>
              </span>
              <span class="workspace-picker-entry-copy">
                <span class="workspace-picker-entry-name">${escapeHtml(file.name)}</span>
                <span class="workspace-picker-entry-path">${escapeHtml(file.path)}</span>
              </span>
            </button>
          `,
        )
        .join("")
    : "";

  const markup = `${directoryMarkup}${fileMarkup}`;
  workspacePickerList.innerHTML = markup
    ? markup
    : `<div class="workspace-picker-empty">${escapeHtml(
        workspacePickerIncludeFiles ? t("noFilesFound") : t("noDirectoriesFound"),
      )}</div>`;
}

function syncWorkspacePickerSelection() {
  workspacePickerList
    .querySelectorAll('[data-picker-kind="file"]')
    .forEach((button) => {
      button.classList.toggle("is-selected", button.dataset.pickerPath === workspacePickerSelectedFilePath);
    });
}

async function browseWorkspaceEntries(path) {
  const targetPath = (path || workspaceRootPath || "").trim();
  if (!targetPath) {
    return false;
  }

  workspacePickerCurrent.value = targetPath;
  workspacePickerList.innerHTML = `<div class="workspace-picker-empty">${escapeHtml(t("loadingFolders"))}</div>`;
  setWorkspacePickerMessage(workspacePickerDefaultCaptionText || t("chooseWorkspaceRoot"));

  try {
    const response = await fetch(
      `/api/browser/entries?path=${encodeURIComponent(targetPath)}&includeFiles=${workspacePickerIncludeFiles ? "1" : "0"}`,
      {
        cache: "no-store",
      },
    );

    const payload = await response.json();
    if (!response.ok) {
      throw new Error(payload.error || `directory browse failed with ${response.status}`);
    }

    renderWorkspacePicker(payload);
    return true;
  } catch (error) {
    console.error(error);
    workspacePickerSelectedFilePath = "";
    workspacePickerConfirm.disabled = workspacePickerMode === "file";
    workspacePickerList.innerHTML = `<div class="workspace-picker-empty">${escapeHtml(error.message)}</div>`;
    setWorkspacePickerMessage(error.message);
    return false;
  }
}

function openWorkspacePicker(startPath = workspaceRootPath) {
  setWorkspacePickerState({
    mode: "directory",
    includeFiles: false,
    title: t("openWorkspaceTitle"),
    caption: t("chooseWorkspaceRoot"),
    confirmLabel: t("useThisFolder"),
    onConfirm: async (selectedPath) => {
      await applyWorkspaceRoot(selectedPath);
    },
  });
  workspacePickerOverlay.hidden = false;
  browseWorkspaceEntries(startPath);
}

function closeWorkspacePicker() {
  workspacePickerOverlay.hidden = true;
  workspacePickerSelectedFilePath = "";
  workspacePickerConfirmAction = null;
  setWorkspacePickerMessage(t("chooseWorkspaceRoot"));
}

async function applyWorkspaceRoot(path) {
  const nextPath = (path || "").trim();
  if (!nextPath) {
    setWorkspacePickerMessage(t("chooseWorkspaceRoot"));
    return;
  }

  workspacePickerConfirm.disabled = true;

  try {
    const response = await fetch(`${workspaceApiBase}/root`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: nextPath }),
    });
    const payload = await response.json();
    if (!response.ok) {
      throw new Error(payload.error || `workspace change failed with ${response.status}`);
    }

    workspaceRootPath = payload.rootPath ?? nextPath;
    closeWorkspacePicker();
    await loadWorkspace({ preferredFile: primaryFile, resetState: true });
    renderEditor();
  } catch (error) {
    console.error(error);
    setWorkspacePickerMessage(error.message);
  } finally {
    workspacePickerConfirm.disabled = false;
  }
}

async function readBrowserTextFile(path) {
  const response = await fetch(`/api/browser/file?path=${encodeURIComponent(path)}`, {
    cache: "no-store",
  });
  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.error || `file read failed with ${response.status}`);
  }
  return payload;
}

function applyImportedPaletteConfig(rawText) {
  const parsedConfig = parseCustomPaletteConfig(rawText);
  applyCustomPaletteConfig(parsedConfig);
  persistThemeSettings();
  persistEditorPreferences();
  persistGlyphHighlights();
  document.body.classList.toggle("glyphs-off", !glyphsOn);
  applyWorkbenchThemeState();
  applyEditorFontTheme();
  applyEditorFontSizeTheme();
  applyEditorTheme();
  applyEditorBackgroundTheme();
  applyEditorTextColorTheme();
  applyEditorTextHighlightTheme();
  applyBlockSurfaceTheme();
  applyLineHighlightTheme();
  applySelectionHighlightTheme();
  applyGlyphColors();
  syncSettingsUi();
  updateIndentUi();
  toggleGlyphs.setAttribute("aria-pressed", String(glyphsOn));
  toggleGlyphs.setAttribute("aria-label", glyphsOn ? t("disableGlyphRendering") : t("enableGlyphRendering"));
  toggleGlyphs.setAttribute("title", glyphsOn ? t("disableGlyphRendering") : t("enableGlyphRendering"));
  renderEditor();
}

async function openPaletteConfigImportPicker(startPath = workspaceRootPath) {
  setWorkspacePickerState({
    mode: "file",
    includeFiles: true,
    title: t("importConfigFile"),
    caption: t("chooseConfigFile"),
    confirmLabel: t("importThisFile"),
    onConfirm: async (selectedPath) => {
      const payload = await readBrowserTextFile(selectedPath);
      applyImportedPaletteConfig(payload.content ?? "");
      closeWorkspacePicker();
      showAppToast(t("configImported"), "success");
    },
  });
  workspacePickerOverlay.hidden = false;
  await browseWorkspaceEntries(startPath);
}

async function openPaletteConfigEditor() {
  const rawText = await openTextareaDialog({
    title: t("themeConfig"),
    message: t("themeConfigMessage"),
    confirmLabel: t("confirm"),
    cancelLabel: t("cancel"),
    textarea: buildCustomPaletteConfigText(),
    placeholder: "{\n  \"$schema\": \"https://styio.dev/schemas/theme-customizations.json\"\n}",
  });
  if (rawText === null) {
    return;
  }

  try {
    applyImportedPaletteConfig(rawText);
    showAppToast(t("configSaved"), "success");
  } catch (error) {
    console.error(error);
    await openConfirmDialog({
      title: "",
      message: error.message,
      confirmLabel: t("confirm"),
    });
  }
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
  if (!saveState) {
    return;
  }
  saveState.dataset.saveState = kind;
  saveState.textContent = text;
}

function updateIndentUi() {
  document.querySelectorAll("[data-indent-size]").forEach((button) => {
    const active = Number(button.dataset.indentSize) === indentSize;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  });
  if (indentState) {
    indentState.textContent =
      activeLanguageKey === "zhCn" ? `缩进：${indentSize} 个空格` : `indent: ${indentSize} spaces`;
  }
}

function updateStatusbar(analysis) {
  latestAnalysis = analysis;
  currentFileTitle.textContent = t("appTitle");
  workspacePathHint.hidden = true;
  workspacePathHint.textContent = "";
  if (glyphState) {
    glyphState.textContent =
      activeLanguageKey === "zhCn"
        ? `符号：${glyphsOn ? "开启" : "关闭"} / ${analysis.glyphCount}`
        : `glyphs: ${glyphsOn ? "on" : "off"} / ${analysis.glyphCount}`;
  }
  updateIndentUi();
  if (unitState) {
    unitState.textContent = analysis.ready
      ? activeLanguageKey === "zhCn"
        ? "单元：就绪"
        : "unit: ready"
      : activeLanguageKey === "zhCn"
        ? "单元：未完成"
        : "unit: incomplete";
  }
  if (issueState) {
    issueState.textContent =
      activeLanguageKey === "zhCn"
        ? `诊断：${analysis.warnings.length} 个警告 / ${analysis.errors.length} 个错误`
        : `diagnostics: ${analysis.warnings.length} warning / ${analysis.errors.length} errors`;
  }
  if (renderState) {
    renderState.textContent =
      activeLanguageKey === "zhCn"
        ? `投影：${analysis.glyphCount} 个符号 / ${analysis.blocks.length} 个块`
        : `projection: ${analysis.glyphCount} glyphs / ${analysis.blocks.length} blocks`;
  }
  const { start, end } = normalizedSelectionRange();
  if (start === end) {
    if (cursorState) {
      cursorState.textContent =
        activeLanguageKey === "zhCn"
          ? `选区：第 ${padLine(lineIndexForOffset(analysis, start))} 行`
          : `selection: line ${padLine(lineIndexForOffset(analysis, start))}`;
    }
    return;
  }

  const startLine = lineIndexForOffset(analysis, start);
  const endLine = lineIndexForOffset(analysis, Math.max(start, end - 1));
  if (cursorState) {
    cursorState.textContent =
      activeLanguageKey === "zhCn"
        ? `选区：${padLine(startLine)}-${padLine(endLine)} / ${end - start} 个字符`
        : `selection: ${padLine(startLine)}-${padLine(endLine)} / ${end - start} chars`;
  }
}

function updateSaveUi() {
  if (saveFile) {
    saveFile.disabled = saveInFlight;
    saveFile.textContent = saveInFlight ? (activeLanguageKey === "zhCn" ? "保存中..." : "Saving...") : activeLanguageKey === "zhCn" ? "保存" : "Save";
  }

  if (!workspaceApiAvailable) {
    setSaveState("volatile", activeLanguageKey === "zhCn" ? "磁盘：接口离线" : "disk: api offline");
    return;
  }

  if (saveInFlight) {
    setSaveState("saving", activeLanguageKey === "zhCn" ? "磁盘：保存中" : "disk: saving");
    return;
  }

  if (fileDirty[currentFile]) {
    setSaveState("dirty", activeLanguageKey === "zhCn" ? "磁盘：有未保存改动" : "disk: unsaved edits");
    return;
  }

  setSaveState("saved", activeLanguageKey === "zhCn" ? `磁盘：已保存 / ${currentFile}` : `disk: saved / ${currentFile}`);
}

function renderEditor() {
  const analysis = analyzeSource(fileSources[currentFile]);
  syncBulkDeleteButton();
  syncRefreshWorkspaceButton();
  renderFileTabs();
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

async function focusFile(fileName) {
  if (!fileName) {
    return;
  }

  if (!fileOrder.includes(fileName)) {
    fileOrder.push(fileName);
  }

  currentFile = fileName;
  activeTreePath = fileName;
  try {
    await loadWorkspaceFile(fileName);
  } catch (error) {
    console.error(error);
    if (typeof fileSources[fileName] !== "string") {
      fileSources[fileName] = "";
      fileDirty[fileName] = false;
    }
  }
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

async function loadWorkspace(options = {}) {
  const { preferredFile = currentFile, resetState = false } = options;
  try {
    const response = await fetch(workspaceApiBase, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`workspace load failed with ${response.status}`);
    }

    const payload = await response.json();
    workspaceRootPath = payload.rootPath || "";
    workspaceName = payload.workspaceName || "workspace";
    workspaceEntries = Array.isArray(payload.entries) ? payload.entries : [];
    workspaceFiles = Array.isArray(payload.files) && payload.files.length ? payload.files : [primaryFile];
    const availableDirectoryPaths = collectDirectoryPaths(workspaceEntries);

    if (resetState) {
      workspaceLoadedFiles = new Set();
      Object.keys(fileDirty).forEach((fileName) => {
        delete fileDirty[fileName];
      });
    }

    workspaceFiles.forEach((fileName) => {
      if (!(fileName in fileDirty)) {
        fileDirty[fileName] = false;
      }
    });

    const availableTreePaths = collectTreePaths(workspaceEntries, new Set(workspaceFiles));
    if (!expandedTreePaths.size && availableDirectoryPaths.size) {
      expandedTreePaths = new Set(availableDirectoryPaths);
    } else {
      expandedTreePaths = new Set(Array.from(expandedTreePaths).filter((entry) => availableDirectoryPaths.has(entry)));
    }
    selectedTreePaths = new Set(Array.from(selectedTreePaths).filter((entry) => availableTreePaths.has(entry)));
    if (activeTreePath && !availableTreePaths.has(activeTreePath)) {
      activeTreePath = chooseWorkspaceFile(preferredFile, workspaceFiles);
    }

    const nextCurrentFile = chooseWorkspaceFile(preferredFile, workspaceFiles);
    const nextTabs = fileOrder.filter((fileName) => workspaceFiles.includes(fileName));
    if (!nextTabs.includes(nextCurrentFile)) {
      nextTabs.push(nextCurrentFile);
    }

    fileOrder = nextTabs.length ? nextTabs : [nextCurrentFile];
    currentFile = nextCurrentFile;
    await loadWorkspaceFile(currentFile);

    workspaceApiAvailable = true;
    syncWorkspaceControls();
  } catch (error) {
    console.error(error);
    workspaceApiAvailable = false;
    workspaceRootPath = "";
    workspaceName = "workspace";
    workspaceEntries = [];
    workspaceFiles = [primaryFile];
    fileOrder = [primaryFile];
    currentFile = primaryFile;
    [primaryFile].forEach((fileName) => {
      if (!(fileName in fileDirty)) {
        fileDirty[fileName] = false;
      }
    });
    syncWorkspaceControls();
  }
}

async function saveCurrentFile() {
  if (saveInFlight) {
    return;
  }

  clearAutoSaveTimer();

  if (!workspaceApiAvailable) {
    setSaveState("volatile", "disk: api offline");
    return;
  }

  saveInFlight = true;
  updateSaveUi();

  try {
    const response = await fetch(`${workspaceApiBase}/file/${encodeURIComponent(currentFile)}`, {
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
    workspaceLoadedFiles.add(currentFile);
    renderEditor();
  } catch (error) {
    console.error(error);
    setSaveState("error", "disk: save failed");
  } finally {
    saveInFlight = false;
    updateSaveUi();
  }
}

appDialogClose.addEventListener("click", () => {
  closeAppDialog(null);
});

appDialogCancel.addEventListener("click", () => {
  closeAppDialog(null);
});

appDialogConfirm.addEventListener("click", () => {
  if (!appDialogTextareaField.hidden) {
    closeAppDialog(appDialogTextarea.value);
    return;
  }
  closeAppDialog(appDialogInputField.hidden ? true : appDialogInput.value);
});

appDialogOverlay.addEventListener("click", (event) => {
  if (event.target === appDialogOverlay) {
    closeAppDialog(null);
  }
});

appDialogInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    closeAppDialog(appDialogInput.value);
    return;
  }

  if (event.key === "Escape") {
    event.preventDefault();
    closeAppDialog(null);
  }
});

appDialogTextarea.addEventListener("keydown", (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "enter") {
    event.preventDefault();
    closeAppDialog(appDialogTextarea.value);
    return;
  }

  if (event.key === "Escape") {
    event.preventDefault();
    closeAppDialog(null);
  }
});

document.addEventListener("keydown", (event) => {
  if (appDialogOverlay.hidden) {
    return;
  }

  if (event.key === "Escape") {
    event.preventDefault();
    closeAppDialog(null);
    return;
  }

  if (event.key === "Enter" && appDialogInputField.hidden && appDialogTextareaField.hidden) {
    event.preventDefault();
    closeAppDialog(true);
  }
});

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

fileTabs.addEventListener("click", (event) => {
  const closeButton = event.target.closest("[data-tab-close]");
  if (closeButton) {
    event.preventDefault();
    event.stopPropagation();
    openFileActionMenu = null;
    pendingDeleteFile = null;
    closeFileTab(closeButton.dataset.tabClose);
    return;
  }

  const tabButton = event.target.closest("[data-tab-file]");
  if (!tabButton) {
    return;
  }

  openFileActionMenu = null;
  pendingDeleteFile = null;
  focusFile(tabButton.dataset.tabFile);
});

fileTree.addEventListener("click", (event) => {
  const selectToggle = event.target.closest("[data-select-tree-path]");
  if (selectToggle) {
    event.preventDefault();
    event.stopPropagation();
    const treePath = selectToggle.dataset.selectTreePath;
    if (selectedTreePaths.has(treePath)) {
      selectedTreePaths.delete(treePath);
    } else {
      selectedTreePaths.add(treePath);
    }
    renderEditor();
    return;
  }

  const folderSummary = event.target.closest("[data-tree-folder]");
  if (folderSummary) {
    event.preventDefault();
    const folderPath = folderSummary.dataset.treeFolder;
    if (expandedTreePaths.has(folderPath)) {
      expandedTreePaths.delete(folderPath);
    } else {
      expandedTreePaths.add(folderPath);
    }
    if (bulkDeleteMode) {
      activeTreePath = folderPath;
      if (selectedTreePaths.has(folderPath)) {
        selectedTreePaths.delete(folderPath);
      } else {
        selectedTreePaths.add(folderPath);
      }
    } else {
      activeTreePath = folderPath;
    }
    renderEditor();
    return;
  }

  const previewButton = event.target.closest("[data-preview-file]");
  if (previewButton) {
    event.preventDefault();
    event.stopPropagation();
    focusFile(previewButton.dataset.previewFile);
    return;
  }

  const fileButton = event.target.closest("[data-tree-file]");
  if (!fileButton) {
    return;
  }

  if (bulkDeleteMode) {
    event.preventDefault();
    const fileName = fileButton.dataset.treeFile;
    activeTreePath = fileName;
    if (selectedTreePaths.has(fileName)) {
      selectedTreePaths.delete(fileName);
    } else {
      selectedTreePaths.add(fileName);
    }
    renderEditor();
    return;
  }

  pendingDeleteFile = null;
  openFileActionMenu = null;
  const fileName = fileButton.dataset.treeFile;
  if (activeTreePath === fileName) {
    activeTreePath = "";
    renderEditor();
    return;
  }

  focusFile(fileName);
  activeDrawerTab = "files";
  syncSidebar();
});

workspacePathApply.addEventListener("click", () => {
  openWorkspacePicker(workspaceRootPath);
});

workspaceCalloutOpen.addEventListener("click", () => {
  openWorkspacePicker(workspaceRootPath);
});

workspacePathViewport?.addEventListener("scroll", () => {
  syncWorkspacePathVisual();
});

workspacePathScrollVisual?.addEventListener("pointerdown", (event) => {
  if (!workspacePathViewport || !workspacePathScrollVisual || !workspacePathScrollThumb || !workspacePathText) {
    return;
  }

  const trackRect = workspacePathScrollVisual.getBoundingClientRect();
  const thumbRect = workspacePathScrollThumb.getBoundingClientRect();
  const viewportWidth = workspacePathViewport.clientWidth;
  const contentWidth = workspacePathText.scrollWidth;
  const maxScroll = Math.max(0, contentWidth - viewportWidth);

  if (maxScroll <= 0) {
    return;
  }

  const thumbWidth = thumbRect.width;
  const maxThumbTravel = Math.max(0, trackRect.width - thumbWidth);
  const clickedThumb = event.target === workspacePathScrollThumb;
  const offsetX = clickedThumb ? event.clientX - thumbRect.left : thumbWidth / 2;
  workspacePathDrag = { offsetX, maxScroll, maxThumbTravel, trackLeft: trackRect.left };

  const nextThumbX = Math.min(Math.max(event.clientX - trackRect.left - offsetX, 0), maxThumbTravel);
  workspacePathViewport.scrollLeft = maxThumbTravel > 0 ? (nextThumbX / maxThumbTravel) * maxScroll : 0;
  syncWorkspacePathVisual();
});

window.addEventListener("pointermove", (event) => {
  if (!workspacePathDrag || !workspacePathViewport) {
    return;
  }

  const nextThumbX = Math.min(
    Math.max(event.clientX - workspacePathDrag.trackLeft - workspacePathDrag.offsetX, 0),
    workspacePathDrag.maxThumbTravel,
  );
  workspacePathViewport.scrollLeft =
    workspacePathDrag.maxThumbTravel > 0 ? (nextThumbX / workspacePathDrag.maxThumbTravel) * workspacePathDrag.maxScroll : 0;
  syncWorkspacePathVisual();
});

window.addEventListener("pointerup", () => {
  workspacePathDrag = null;
});

window.addEventListener("resize", () => {
  syncWorkspacePathScrollerMetrics();
});

workspacePickerClose.addEventListener("click", () => {
  closeWorkspacePicker();
});

workspacePickerOverlay.addEventListener("click", (event) => {
  if (event.target === workspacePickerOverlay) {
    closeWorkspacePicker();
  }
});

workspacePickerUp.addEventListener("click", () => {
  if (!workspacePickerParentPath) {
    return;
  }
  browseWorkspaceEntries(workspacePickerParentPath);
});

workspacePickerBreadcrumbs.addEventListener("click", (event) => {
  const button = event.target.closest("[data-picker-path]");
  if (!button) {
    return;
  }
  browseWorkspaceEntries(button.dataset.pickerPath);
});

workspacePickerList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-picker-path]");
  if (!button) {
    return;
  }
  const targetPath = button.dataset.pickerPath;
  const kind = button.dataset.pickerKind || "directory";
  if (kind === "file") {
    workspacePickerSelectedFilePath = targetPath;
    workspacePickerCurrent.value = targetPath;
    workspacePickerConfirm.disabled = false;
    syncWorkspacePickerSelection();
    return;
  }
  browseWorkspaceEntries(targetPath);
});

workspacePickerCurrent.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    browseWorkspaceEntries(workspacePickerCurrent.value);
  }
});

workspacePickerCurrent.addEventListener("blur", () => {
  if (!workspacePickerOverlay.hidden && workspacePickerCurrent.value.trim()) {
    browseWorkspaceEntries(workspacePickerCurrent.value);
  }
});

workspacePickerConfirm.addEventListener("click", async () => {
  const targetPath =
    workspacePickerMode === "file"
      ? workspacePickerSelectedFilePath || workspacePickerCurrent.value
      : workspacePickerCurrent.value || workspacePickerPath;
  if (!targetPath) {
    return;
  }

  if (workspacePickerConfirmAction) {
    try {
      await workspacePickerConfirmAction(targetPath);
    } catch (error) {
      console.error(error);
      setWorkspacePickerMessage(error.message);
    }
    return;
  }

  await applyWorkspaceRoot(targetPath);
});

createFolderButton.addEventListener("click", () => {
  createWorkspaceFolder();
});

quickCreateFileButton.addEventListener("click", () => {
  createWorkspaceFile();
});

refreshWorkspaceButton.addEventListener("click", () => {
  if (bulkDeleteMode) {
    exitBulkDeleteMode();
    renderEditor();
    return;
  }

  refreshWorkspace(currentFile);
});

bulkDeleteButton.addEventListener("click", async () => {
  if (!bulkDeleteMode) {
    const activeEntry = activeTreeEntry();
    if (activeEntry) {
      await confirmDeletePaths([activeEntry.path]);
      return;
    }

    bulkDeleteMode = true;
    pendingDeleteFile = null;
    openFileActionMenu = null;
    clearBulkDeleteSelection();
    if (activeTreePath) {
      selectedTreePaths.add(activeTreePath);
    }
    renderEditor();
    return;
  }

  if (!selectedTreePaths.size) {
    exitBulkDeleteMode();
    renderEditor();
    return;
  }

  await confirmDeletePaths(Array.from(selectedTreePaths));
});

workspaceMoreButton.addEventListener("click", () => {
  openWorkspacePicker(workspaceRootPath);
});

importThemeConfigButton.addEventListener("click", () => {
  openPaletteConfigImportPicker(workspaceRootPath);
});

editThemeConfigButton.addEventListener("click", () => {
  openPaletteConfigEditor();
});

toggleGlyphs.addEventListener("click", () => {
  glyphsOn = !glyphsOn;
  document.body.classList.toggle("glyphs-off", !glyphsOn);
  toggleGlyphs.setAttribute("aria-pressed", String(glyphsOn));
  toggleGlyphs.setAttribute("aria-label", glyphsOn ? t("disableGlyphRendering") : t("enableGlyphRendering"));
  toggleGlyphs.setAttribute("title", glyphsOn ? t("disableGlyphRendering") : t("enableGlyphRendering"));
  persistEditorPreferences();
  renderEditor();
});

indentControl.querySelectorAll("[data-indent-size]").forEach((button) => {
  button.addEventListener("click", () => {
    indentSize = Number(button.dataset.indentSize) || 2;
    persistEditorPreferences();
    updateIndentUi();
  });
});

themeModeDark?.addEventListener("click", () => {
  if (themeMode === "dark") {
    return;
  }

  themeMode = "dark";
  const nextPalette = defaultThemePaletteForMode(themeMode);
  if (nextPalette) {
    applyThemePaletteSelection(nextPalette.key);
  } else {
    syncThemeUi();
  }
  syncSettingsUi();
  persistThemeSettings();
  renderEditor();
});

themeModeLight?.addEventListener("click", () => {
  if (themeMode === "light") {
    return;
  }

  themeMode = "light";
  const nextPalette = defaultThemePaletteForMode(themeMode);
  if (nextPalette) {
    applyThemePaletteSelection(nextPalette.key);
  } else {
    syncThemeUi();
  }
  syncSettingsUi();
  persistThemeSettings();
  renderEditor();
});

themePaletteButton?.addEventListener("click", () => {
  closeSettingsMenus(themePaletteMenuOpen ? "" : "themePalette");
  syncSettingsUi();
});

themePaletteOptionsMenu?.addEventListener("click", (event) => {
  const option = event.target.closest("[data-theme-palette-key]");
  if (!option) {
    return;
  }

  applyThemePaletteSelection(option.dataset.themePaletteKey);
  closeSettingsMenus();
  syncThemeUi();
  persistThemeSettings();
  renderEditor();
});

themeTextButton?.addEventListener("click", () => {
  closeSettingsMenus(themeTextMenuOpen ? "" : "themeText");
  syncSettingsUi();
});

themeTextOptions?.addEventListener("click", (event) => {
  const option = event.target.closest("[data-theme-text-key]");
  if (!option) {
    return;
  }

  const preset = themeTextPresets.find((entry) => entry.key === option.dataset.themeTextKey);
  if (!preset) {
    return;
  }

  activeThemeTextKey = preset.key;
  closeSettingsMenus();
  applyWorkbenchThemeState();
  syncThemeUi();
  persistThemeSettings();
  renderEditor();
});

themeColorButton?.addEventListener("click", () => {
  closeSettingsMenus(themeColorMenuOpen ? "" : "themeColor");
  syncSettingsUi();
});

themeColorOptions?.addEventListener("click", (event) => {
  const option = event.target.closest("[data-theme-color-key]");
  if (!option) {
    return;
  }

  const preset = themeColorPresets.find((entry) => entry.key === option.dataset.themeColorKey);
  if (!preset) {
    return;
  }

  activeThemeColorKey = preset.key;
  closeSettingsMenus();
  applyWorkbenchThemeState();
  syncThemeUi();
  persistThemeSettings();
  renderEditor();
});

themeBackgroundButton?.addEventListener("click", () => {
  closeSettingsMenus(themeBackgroundMenuOpen ? "" : "themeBackground");
  syncSettingsUi();
});

themeBackgroundOptions?.addEventListener("click", (event) => {
  const option = event.target.closest("[data-theme-background-key]");
  if (!option) {
    return;
  }

  const preset = themeBackgroundPresets.find((entry) => entry.key === option.dataset.themeBackgroundKey);
  if (!preset) {
    return;
  }

  activeThemeBackgroundKey = preset.key;
  closeSettingsMenus();
  applyWorkbenchThemeState();
  syncThemeUi();
  persistThemeSettings();
  renderEditor();
});

themeLineButton?.addEventListener("click", () => {
  closeSettingsMenus(themeLineMenuOpen ? "" : "themeLine");
  syncSettingsUi();
});

themeLineOptions?.addEventListener("click", (event) => {
  const option = event.target.closest("[data-theme-line-key]");
  if (!option) {
    return;
  }

  const preset = themeLinePresets.find((entry) => entry.key === option.dataset.themeLineKey);
  if (!preset) {
    return;
  }

  activeThemeLineKey = preset.key;
  closeSettingsMenus();
  applyWorkbenchThemeState();
  syncThemeUi();
  persistThemeSettings();
  renderEditor();
});

interfaceFontButton?.addEventListener("click", () => {
  closeSettingsMenus(interfaceFontMenuOpen ? "" : "interfaceFont");
  syncSettingsUi();
});

interfaceFontOptions?.addEventListener("click", (event) => {
  const option = event.target.closest("[data-interface-font-key]");
  if (!option) {
    return;
  }

  const preset = interfaceFontOptionsList.find((entry) => entry.key === option.dataset.interfaceFontKey);
  if (!preset) {
    return;
  }

  activeInterfaceFontKey = preset.key;
  closeSettingsMenus();
  applyWorkbenchThemeState();
  syncThemeUi();
  persistThemeSettings();
});

interfaceSizeDecrease?.addEventListener("click", () => {
  stepInterfaceSize(-1);
});

interfaceSizeIncrease?.addEventListener("click", () => {
  stepInterfaceSize(1);
});

editorModeDark?.addEventListener("click", () => {
  if (editorMode === "dark") {
    return;
  }

  editorMode = "dark";
  const nextPalette = defaultEditorPaletteForMode(editorMode);
  if (nextPalette) {
    applyEditorPaletteSelection(nextPalette.key);
  }
  syncSettingsUi();
  persistEditorPreferences();
  persistGlyphHighlights();
  renderEditor();
});

editorModeLight?.addEventListener("click", () => {
  if (editorMode === "light") {
    return;
  }

  editorMode = "light";
  const nextPalette = defaultEditorPaletteForMode(editorMode);
  if (nextPalette) {
    applyEditorPaletteSelection(nextPalette.key);
  }
  syncSettingsUi();
  persistEditorPreferences();
  persistGlyphHighlights();
  renderEditor();
});

editorFontButton?.addEventListener("click", () => {
  closeSettingsMenus(editorFontMenuOpen ? "" : "editorFont");
  syncSettingsUi();
});

editorFontOptions?.addEventListener("click", (event) => {
  const option = event.target.closest("[data-editor-font-key]");
  if (!option) {
    return;
  }

  const preset = editorFontOptionsList.find((entry) => entry.key === option.dataset.editorFontKey);
  if (!preset) {
    return;
  }

  activeEditorFontKey = preset.key;
  closeSettingsMenus();
  applyEditorFontTheme();
  syncEditorPreferencesUi();
  persistEditorPreferences();
  renderEditor();
});

editorFontSizeDecrease?.addEventListener("click", () => {
  stepEditorFontSize(-1);
});

editorFontSizeIncrease?.addEventListener("click", () => {
  stepEditorFontSize(1);
});

highlightPaletteButton.addEventListener("click", () => {
  closeSettingsMenus(paletteMenuOpen ? "" : "palette");
  syncSettingsUi();
});

highlightPaletteOptions.addEventListener("click", (event) => {
  const option = event.target.closest("[data-palette-key]");
  if (!option) {
    return;
  }

  applyEditorPaletteSelection(option.dataset.paletteKey);
  closeSettingsMenus();
  syncSettingsUi();
  persistEditorPreferences();
  persistGlyphHighlights();
  renderEditor();
});

editorBackgroundButton?.addEventListener("click", () => {
  closeSettingsMenus(editorBackgroundMenuOpen ? "" : "editorBackground");
  syncSettingsUi();
});

editorBackgroundOptions?.addEventListener("click", (event) => {
  const option = event.target.closest("[data-editor-background-key]");
  if (!option) {
    return;
  }

  const preset = editorBackgroundPresets.find((entry) => entry.key === option.dataset.editorBackgroundKey);
  if (!preset) {
    return;
  }

  activeEditorBackgroundKey = preset.key;
  closeSettingsMenus();
  applyEditorBackgroundTheme();
  syncEditorPreferencesUi();
  persistEditorPreferences();
  renderEditor();
});

textColorButton?.addEventListener("click", () => {
  closeSettingsMenus(textColorMenuOpen ? "" : "textColor");
  syncSettingsUi();
});

textColorOptions?.addEventListener("click", (event) => {
  const option = event.target.closest("[data-text-color-key]");
  if (!option) {
    return;
  }

  const preset = editorTextColorPresets.find((entry) => entry.key === option.dataset.textColorKey);
  if (!preset) {
    return;
  }

  activeEditorTextColorKey = preset.key;
  closeSettingsMenus();
  applyEditorTextColorTheme();
  syncEditorPreferencesUi();
  persistEditorPreferences();
  renderEditor();
});

textHighlightButton?.addEventListener("click", () => {
  closeSettingsMenus(textHighlightMenuOpen ? "" : "textHighlight");
  syncSettingsUi();
});

textHighlightOptions?.addEventListener("click", (event) => {
  const option = event.target.closest("[data-text-highlight-key]");
  if (!option) {
    return;
  }

  const preset = editorTextHighlightPresets.find((entry) => entry.key === option.dataset.textHighlightKey);
  if (!preset) {
    return;
  }

  activeEditorTextHighlightKey = preset.key;
  applySharedGlyphColor(preset.color);
  closeSettingsMenus();
  applyEditorTextHighlightTheme();
  applyGlyphColors();
  syncSettingsUi();
  persistEditorPreferences();
  persistGlyphHighlights();
  renderEditor();
});

blockSurfaceButton.addEventListener("click", () => {
  closeSettingsMenus(blockSurfaceMenuOpen ? "" : "block");
  syncSettingsUi();
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
  closeSettingsMenus();
  applyBlockSurfaceTheme();
  syncSettingsUi();
  persistGlyphHighlights();
});

lineHighlightButton.addEventListener("click", () => {
  closeSettingsMenus(lineHighlightMenuOpen ? "" : "line");
  syncSettingsUi();
});

selectionHighlightButton.addEventListener("click", () => {
  closeSettingsMenus(selectionHighlightMenuOpen ? "" : "selection");
  syncSettingsUi();
});

autoSaveModeButton?.addEventListener("click", () => {
  closeSettingsMenus(autoSaveMenuOpen ? "" : "autoSave");
  syncSettingsUi();
});

autoSaveModeOptions?.addEventListener("click", (event) => {
  const option = event.target.closest("[data-auto-save-mode]");
  if (!option) {
    return;
  }

  autoSaveMode = option.dataset.autoSaveMode;
  closeSettingsMenus();
  clearAutoSaveTimer();
  syncAutoSaveUi();
  persistAutoSaveState();
  if (autoSaveMode === "afterDelay") {
    scheduleAutoSave();
  }
});

autoSaveDelayInput?.addEventListener("input", () => {
  const nextDelay = Number(autoSaveDelayInput.value);
  if (!Number.isFinite(nextDelay) || nextDelay < 250) {
    return;
  }

  autoSaveDelay = Math.round(nextDelay / 250) * 250;
  syncAutoSaveUi();
  persistAutoSaveState();
  if (autoSaveMode === "afterDelay") {
    scheduleAutoSave();
  }
});

autoSaveDelayInput?.addEventListener("change", () => {
  autoSaveDelayInput.value = String(autoSaveDelay);
});

languageModeButton?.addEventListener("click", () => {
  closeSettingsMenus(languageMenuOpen ? "" : "language");
  syncSettingsUi();
});

languageModeOptions?.addEventListener("click", (event) => {
  const option = event.target.closest("[data-language-key]");
  if (!option) {
    return;
  }

  activeLanguageKey = option.dataset.languageKey;
  closeSettingsMenus();
  persistLanguageState();
  applyLanguageUi();
  renderAutoSaveOptions();
  renderThemeControls();
  renderEditorPreferenceControls();
  renderGlyphHighlightControls();
  syncLanguageUi();
  renderEditor();
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
  closeSettingsMenus();
  applyLineHighlightTheme();
  syncSettingsUi();
  persistGlyphHighlights();
});

selectionHighlightOptions.addEventListener("click", (event) => {
  const option = event.target.closest("[data-selection-highlight-key]");
  if (!option) {
    return;
  }

  const preset = selectionHighlightPresets.find((entry) => entry.key === option.dataset.selectionHighlightKey);
  if (!preset) {
    return;
  }

  activeSelectionHighlightKey = preset.key;
  closeSettingsMenus();
  applySelectionHighlightTheme();
  syncSettingsUi();
  persistGlyphHighlights();
});

glyphColorList.addEventListener("click", (event) => {
  const toggle = event.target.closest("[data-glyph-toggle]");
  if (toggle) {
    const key = toggle.dataset.glyphToggle;
    openGlyphColorMenu = openGlyphColorMenu === key ? null : key;
    closeSettingsMenus("glyphColor");
    syncSettingsUi();
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
  syncSettingsUi();
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
  syncSettingsUi();
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
  const insideAnySettingsMenu =
    event.target.closest("#languageModeButton") ||
    event.target.closest("#languageModeOptions") ||
    event.target.closest("#autoSaveModeButton") ||
    event.target.closest("#autoSaveModeOptions") ||
    event.target.closest("#themeModeToggle") ||
    event.target.closest("#themePaletteButton") ||
    event.target.closest("#themePaletteOptions") ||
    event.target.closest("#themeTextButton") ||
    event.target.closest("#themeTextOptions") ||
    event.target.closest("#themeColorButton") ||
    event.target.closest("#themeColorOptions") ||
    event.target.closest("#themeBackgroundButton") ||
    event.target.closest("#themeBackgroundOptions") ||
    event.target.closest("#themeLineButton") ||
    event.target.closest("#themeLineOptions") ||
    event.target.closest("#interfaceFontButton") ||
    event.target.closest("#interfaceFontOptions") ||
    event.target.closest("#interfaceSizeControl") ||
    event.target.closest("#editorModeToggle") ||
    event.target.closest("#editorFontButton") ||
    event.target.closest("#editorFontOptions") ||
    event.target.closest("#editorFontSizeControl") ||
    event.target.closest("#highlightPaletteButton") ||
    event.target.closest("#highlightPaletteOptions") ||
    event.target.closest("#editorBackgroundButton") ||
    event.target.closest("#editorBackgroundOptions") ||
    event.target.closest("#textColorButton") ||
    event.target.closest("#textColorOptions") ||
    event.target.closest("#textHighlightButton") ||
    event.target.closest("#textHighlightOptions") ||
    event.target.closest("#blockSurfaceButton") ||
    event.target.closest("#blockSurfaceOptions") ||
    event.target.closest("#lineHighlightButton") ||
    event.target.closest("#lineHighlightOptions") ||
    event.target.closest("#selectionHighlightButton") ||
    event.target.closest("#selectionHighlightOptions") ||
    event.target.closest("#glyphColorList");

  if (!insideAnySettingsMenu) {
    closeSettingsMenus();
    syncSettingsUi();
  }

  if (!event.target.closest("#fileTree")) {
    if (openFileActionMenu !== null || pendingDeleteFile !== null) {
      openFileActionMenu = null;
      pendingDeleteFile = null;
      renderEditor();
    }
  }
});

if (saveFile) {
  saveFile.addEventListener("click", () => {
    saveCurrentFile();
  });
}

editorInput.addEventListener("input", () => {
  fileSources[currentFile] = editorInput.value;
  fileDirty[currentFile] = true;
  scheduleAutoSave();
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

editorInput.addEventListener("blur", () => {
  if (autoSaveMode === "onFocusChange") {
    triggerAutoSave("focus-change");
  }
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
  editorInput.focus();
  if (event.detail >= 3) {
    const { start, end } = lineSelectionRangeForOffset(editorInput.value, anchor);
    editorInput.setSelectionRange(start, end);
    renderEditor();
    return;
  }

  if (event.detail === 2) {
    const charOffset = characterOffsetForPointer(event, latestAnalysis);
    const { start, end } = wordSelectionRangeForOffset(editorInput.value, charOffset);
    editorInput.setSelectionRange(start, end);
    renderEditor();
    return;
  }

  pointerSelectionAnchor = anchor;
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
  if (!workspacePickerOverlay.hidden && event.key === "Escape") {
    event.preventDefault();
    closeWorkspacePicker();
    return;
  }

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

window.addEventListener("blur", () => {
  if (autoSaveMode === "onWindowChange") {
    triggerAutoSave("window-blur");
  }
});

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden" && autoSaveMode === "onWindowChange") {
    triggerAutoSave("visibility-change");
  }
});

async function bootstrap() {
  [primaryFile].forEach((fileName) => {
    fileDirty[fileName] = false;
  });

  loadLanguageState();
  applyLanguageUi();
  renderLanguageOptions();
  loadThemeSettings();
  loadAutoSaveState();
  loadGlyphHighlightState();
  loadEditorPreferences();
  loadCustomPaletteConfigState();
  applyWorkbenchThemeState();
  renderThemeControls();
  renderAutoSaveOptions();
  document.body.classList.toggle("glyphs-off", !glyphsOn);
  applyEditorFontTheme();
  applyEditorFontSizeTheme();
  applyEditorBackgroundTheme();
  applyEditorTextColorTheme();
  applyEditorTextHighlightTheme();
  renderEditorPreferenceControls();
  renderGlyphHighlightControls();
  toggleGlyphs.setAttribute("aria-pressed", String(glyphsOn));
  toggleGlyphs.setAttribute("aria-label", glyphsOn ? t("disableGlyphRendering") : t("enableGlyphRendering"));
  toggleGlyphs.setAttribute("title", glyphsOn ? t("disableGlyphRendering") : t("enableGlyphRendering"));
  updateIndentUi();
  syncSidebar();
  await loadWorkspace();
  activeTreePath = "";
  editorInput.value = fileSources[currentFile] ?? "";
  renderEditor();
}

bootstrap();
