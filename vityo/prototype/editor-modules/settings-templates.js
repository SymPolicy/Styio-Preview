const SETTINGS_TEMPLATE_KINDS = Object.freeze({
  CARD: "card",
  SURFACE_TABS: "surfaceTabs",
});

export function createGridPlainCard(id, children, extra = {}) {
  return {
    id,
    kind: SETTINGS_TEMPLATE_KINDS.CARD,
    plain: true,
    cardVariant: "gridSection",
    children,
    ...extra,
  };
}

export function createGridSingleRowCard(cardId, rowNode, extra = {}) {
  return createGridPlainCard(cardId, [rowNode], extra);
}

export function createConfigDialogRow({
  id,
  titleId,
  valueSource,
  renderTarget = "settingsState",
  persistTarget,
  importButtonId,
  editButtonId,
}) {
  return {
    id,
    kind: "dialog",
    labelKey: "themeConfig",
    label: "Config",
    titleId,
    valueSource,
    actionKey: id,
    renderTarget,
    persistTarget,
    dialogSpec: {
      actions: [
        {
          id: importButtonId,
          icon: "upload",
          labelKey: "importConfig",
          label: "Import Config",
        },
        {
          id: editButtonId,
          icon: "eye",
          labelKey: "editConfig",
          label: "Edit",
        },
      ],
    },
  };
}

export function createSurfaceTabsTemplate(config) {
  return {
    kind: SETTINGS_TEMPLATE_KINDS.SURFACE_TABS,
    cardVariant: "gridSurfaceTabs",
    ...config,
  };
}
