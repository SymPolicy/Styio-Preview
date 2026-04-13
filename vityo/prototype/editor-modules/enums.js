export const LANGUAGE_KEYS = Object.freeze({
  ZH_CN: "zhCn",
  EN: "en",
});

export const AUTO_SAVE_MODES = Object.freeze({
  OFF: "off",
  AFTER_DELAY: "afterDelay",
  ON_FOCUS_CHANGE: "onFocusChange",
  ON_WINDOW_CHANGE: "onWindowChange",
});

export const THEME_MODES = Object.freeze({
  DARK: "dark",
  LIGHT: "light",
});

export const DRAWER_TABS = Object.freeze({
  FILES: "files",
  SETTINGS: "settings",
});

export const SURFACE_KEYS = Object.freeze({
  THEME: "theme",
  EDITOR: "editor",
});

export const autoSaveModeOptionsList = [
  { key: "off", label: "Off" },
  { key: "afterDelay", label: "After Delay" },
  { key: "onFocusChange", label: "On Focus Change" },
  { key: "onWindowChange", label: "On Window Change" },
];
export const languageOptionsList = [
  { key: "zhCn", label: "中文" },
  { key: "en", label: "English" },
];
