export function createEditorialShellRefs(doc) {
  return {
    mainTitle: doc.querySelector(".editorial-main-title"),
    brandTitle: doc.getElementById("editorBrandTitle"),
    sidebar: doc.getElementById("editorialSideDrawer"),
    sidebarTitle: doc.getElementById("editorialSidebarTitle"),
    drawerMount: doc.getElementById("editorialDrawerMount"),
    rail: doc.getElementById("editorialSidebarRail"),
    railToggleButton: doc.getElementById("editorialRailOpen"),
    railFilesButton: doc.getElementById("editorialRailFiles"),
    railSettingsButton: doc.getElementById("editorialRailSettings"),
  };
}

export function applyEditorialShellLabels(refs, t) {
  if (refs.brandTitle) {
    refs.brandTitle.textContent = t("appTitle");
  }
  if (refs.sidebarTitle) {
    refs.sidebarTitle.textContent = t("workspace");
  }
  refs.railToggleButton?.setAttribute("aria-label", t("openSidebar"));
  refs.railToggleButton?.setAttribute("title", t("openSidebar"));
  refs.railFilesButton?.setAttribute("aria-label", t("fileTree"));
  refs.railFilesButton?.setAttribute("title", t("fileTree"));
  refs.railSettingsButton?.setAttribute("aria-label", t("settings"));
  refs.railSettingsButton?.setAttribute("title", t("settings"));
}

export function syncEditorialShell(refs, { sidebarOpen, t }) {
  if (!refs.railToggleButton) {
    return;
  }

  const railToggleLabel = sidebarOpen ? t("closeSidebar") : t("openSidebar");
  refs.railToggleButton.setAttribute("aria-label", railToggleLabel);
  refs.railToggleButton.setAttribute("title", railToggleLabel);
  refs.railToggleButton.setAttribute("aria-expanded", String(sidebarOpen));
}

export function bindEditorialShellEvents(refs, { onToggle, onFiles, onSettings }) {
  refs.railToggleButton?.addEventListener("click", onToggle);
  refs.railFilesButton?.addEventListener("click", onFiles);
  refs.railSettingsButton?.addEventListener("click", onSettings);
}
