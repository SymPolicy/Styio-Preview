export const EDITORIAL_STYLE_KEY = "editorial";

export function isEditorialStyle(styleKey) {
  return styleKey === EDITORIAL_STYLE_KEY;
}

export function mountSharedDrawerContent({
  activeUiStyleKey,
  sharedDrawerContent,
  gridDrawerMount,
  editorialDrawerMount,
}) {
  if (!sharedDrawerContent) {
    return;
  }

  const targetMount = isEditorialStyle(activeUiStyleKey) ? editorialDrawerMount : gridDrawerMount;
  if (!targetMount || sharedDrawerContent.parentElement === targetMount) {
    return;
  }

  targetMount.appendChild(sharedDrawerContent);
}

export function mountSharedDrawerTabs({
  activeUiStyleKey,
  sharedDrawerTabs,
  sharedDrawerListShell,
  gridDrawerTabsDock,
}) {
  if (!sharedDrawerTabs || !sharedDrawerListShell) {
    return;
  }

  if (isEditorialStyle(activeUiStyleKey) || !gridDrawerTabsDock) {
    if (sharedDrawerTabs.parentElement === sharedDrawerListShell) {
      return;
    }
    const firstDrawerPanel = sharedDrawerListShell.querySelector(".drawer-panel");
    sharedDrawerListShell.insertBefore(sharedDrawerTabs, firstDrawerPanel ?? sharedDrawerListShell.firstChild);
    return;
  }

  if (sharedDrawerTabs.parentElement === gridDrawerTabsDock) {
    return;
  }

  gridDrawerTabsDock.appendChild(sharedDrawerTabs);
}

export function syncShellVisibility({
  activeUiStyleKey,
  gridMainHead,
  gridFileTabs,
  gridSidebar,
  editorialMainTitle,
  editorialSidebar,
  editorialRail,
}) {
  const editorialActive = isEditorialStyle(activeUiStyleKey);
  const gridActive = !editorialActive;

  if (gridMainHead) {
    gridMainHead.hidden = !gridActive;
  }
  if (gridFileTabs) {
    gridFileTabs.hidden = !gridActive;
  }
  if (gridSidebar) {
    gridSidebar.hidden = !gridActive;
    gridSidebar.setAttribute("aria-hidden", String(!gridActive));
  }
  if (editorialMainTitle) {
    editorialMainTitle.hidden = !editorialActive;
  }
  if (editorialSidebar) {
    editorialSidebar.hidden = !editorialActive;
    editorialSidebar.setAttribute("aria-hidden", String(!editorialActive));
  }
  if (editorialRail) {
    editorialRail.hidden = !editorialActive;
    editorialRail.setAttribute("aria-hidden", String(!editorialActive));
  }
}
