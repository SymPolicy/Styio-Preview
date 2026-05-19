export const settingsFactoryTokens = Object.freeze({
  groupGap: "12px",
  cardPaddingX: "14px",
  cardPaddingY: "14px",
  sectionPaddingX: "12px",
  sectionPaddingY: "12px",
  sectionGap: "14px",
  rowGap: "12px",
  rowMinHeight: "36px",
  titleSize: "15px",
  labelSize: "12px",
  iconSize: "16px",
  controlMinWidth: "88px",
  controlWidth: "176px",
  controlCompactWidth: "128px",
  pillRadius: "999px",
  dropdownRadius: "18px",
  dividerThickness: "1px",
});

const tokenCssVarMap = Object.freeze({
  groupGap: "--settings-group-gap",
  cardPaddingX: "--settings-card-pad-x",
  cardPaddingY: "--settings-card-pad-y",
  sectionPaddingX: "--settings-section-pad-x",
  sectionPaddingY: "--settings-section-pad-y",
  sectionGap: "--settings-section-gap",
  rowGap: "--settings-row-gap",
  rowMinHeight: "--settings-row-min-height",
  titleSize: "--settings-title-size",
  labelSize: "--settings-label-size",
  iconSize: "--settings-icon-size",
  controlMinWidth: "--settings-control-min-width",
  controlWidth: "--settings-control-width",
  controlCompactWidth: "--settings-control-width-compact",
  pillRadius: "--settings-pill-radius",
  dropdownRadius: "--settings-dropdown-radius",
  dividerThickness: "--settings-divider-thickness",
});

export function serializeSettingsFactoryTokens(tokens = settingsFactoryTokens) {
  return Object.entries(tokenCssVarMap)
    .map(([tokenKey, cssVar]) => `${cssVar}:${tokens[tokenKey] ?? settingsFactoryTokens[tokenKey]}`)
    .join("; ");
}
