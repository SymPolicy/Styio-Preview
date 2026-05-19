import { defaultGlyphColor, glyphColorOptions, operatorGlyphs } from "./glyph-presets.js";
import { SETTINGS_NODE_KINDS } from "./settings-schema.js";
import { settingsFactoryTokens, serializeSettingsFactoryTokens } from "./settings-tokens.js";

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function escapeAttribute(value) {
  return escapeHtml(value).replaceAll('"', "&quot;");
}

function buildAttributes(attributes) {
  return Object.entries(attributes)
    .filter(([, value]) => value !== null && value !== undefined && value !== false)
    .map(([key, value]) => {
      if (value === true) {
        return key;
      }
      return `${key}="${escapeAttribute(value)}"`;
    })
    .join(" ");
}

function renderIcon(icon) {
  if (icon === "upload") {
    return `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M14 2v5a1 1 0 0 0 1 1h5"></path>
        <path d="M12 18v-6"></path>
        <path d="m9.5 14.5 2.5-2.5 2.5 2.5"></path>
        <path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"></path>
      </svg>
    `;
  }

  if (icon === "eye") {
    return `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"></path>
        <circle cx="12" cy="12" r="3"></circle>
      </svg>
    `;
  }

  if (icon === "moon") {
    return `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M21 12.79A9 9 0 1 1 11.21 3c0 5.23 4.24 9.46 9.46 9.79Z"></path>
      </svg>
    `;
  }

  if (icon === "sun") {
    return `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="4"></circle>
        <path d="M12 2v2"></path>
        <path d="M12 20v2"></path>
        <path d="m4.93 4.93 1.41 1.41"></path>
        <path d="m17.66 17.66 1.41 1.41"></path>
        <path d="M2 12h2"></path>
        <path d="M20 12h2"></path>
        <path d="m6.34 17.66-1.41 1.41"></path>
        <path d="m19.07 4.93-1.41 1.41"></path>
      </svg>
    `;
  }

  if (icon === "glyph") {
    return `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M8 7h3"></path>
        <path d="M8 12h8"></path>
        <path d="M8 17h5"></path>
        <path d="M17 8l3 4-3 4"></path>
      </svg>
    `;
  }

  if (icon === "chevron") {
    return `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="m9 6 6 6-6 6"></path>
      </svg>
    `;
  }

  if (icon === "link") {
    return `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M10 13a5 5 0 0 0 7.07 0l1.41-1.41a5 5 0 0 0-7.07-7.07L10.7 5.23"></path>
        <path d="M14 11a5 5 0 0 0-7.07 0L5.52 12.4a5 5 0 1 0 7.07 7.07l.71-.71"></path>
      </svg>
    `;
  }

  return "";
}

function renderGlyphToken(token) {
  const glyph = operatorGlyphs[token];
  if (!glyph) {
    return escapeHtml(token);
  }
  if (glyph.markup) {
    return `<span class="token-visual ${escapeAttribute(glyph.tokenClass)}">${glyph.markup}</span>`;
  }
  return `<span class="token-visual ${escapeAttribute(glyph.tokenClass)}">${escapeHtml(glyph.visual)}</span>`;
}

function renderNodeMetadata(node) {
  return buildAttributes({
    "data-setting-id": node.id,
    "data-setting-kind": node.kind,
    "data-setting-surface": node.surface,
    "data-setting-section": node.section,
    "data-setting-scope": node.scope,
    "data-setting-action": node.actionKey,
    "data-setting-render-target": node.renderTarget,
    "data-setting-persist-target": node.persistTarget,
    "data-setting-value-source": node.valueSource,
    "data-setting-options-source": node.optionsSource,
  });
}

function renderTitle(titleId, label, className = "setting-title") {
  return `
    <div>
      <p class="${className}" id="${escapeAttribute(titleId)}">${escapeHtml(label)}</p>
    </div>
  `;
}

function createDropdownRow(node, context) {
  if (node.variant === "glyphColor") {
    const currentColor = node.initialValue ?? defaultGlyphColor;
    return `
      <div class="glyph-color-row" ${renderNodeMetadata(node)} data-glyph-key="${escapeAttribute(node.glyphKey)}">
        <div class="glyph-preview" aria-hidden="true">${renderGlyphToken(node.previewToken)}</div>
        <div class="glyph-color-stack">
          <div class="glyph-color-control">
            <label class="glyph-color-field">
              <span class="glyph-color-swatch" data-glyph-swatch="${escapeAttribute(node.glyphKey)}" style="--glyph-swatch-color:${escapeAttribute(currentColor)}"></span>
              <input
                class="glyph-color-value"
                type="text"
                value="${escapeAttribute(currentColor)}"
                inputmode="text"
                spellcheck="false"
                data-glyph-value="${escapeAttribute(node.glyphKey)}"
                aria-label="${escapeAttribute(node.label)} hex value"
              />
            </label>
            <button
              class="glyph-dropdown-toggle"
              type="button"
              data-setting-button-for="${escapeAttribute(node.id)}"
              data-glyph-toggle="${escapeAttribute(node.glyphKey)}"
              aria-expanded="false"
            >
              ${renderIcon("chevron")}
            </button>
          </div>
          <div class="glyph-option-list" data-glyph-options="${escapeAttribute(node.glyphKey)}">
            ${glyphColorOptions
              .map(
                (color) => `
                  <button
                    class="glyph-option"
                    type="button"
                    data-glyph-option-key="${escapeAttribute(node.glyphKey)}"
                    data-glyph-option="${escapeAttribute(color)}"
                  >
                    <span class="glyph-option-swatch" style="--glyph-option-color:${escapeAttribute(color)}"></span>
                    <span class="glyph-option-value">${escapeHtml(color.toUpperCase())}</span>
                  </button>
                `,
              )
              .join("")}
          </div>
        </div>
      </div>
    `;
  }

  const rowClass = node.variant === "stacked" ? "setting-row setting-row-stack" : "setting-row";
  const controlClass = node.compact ? "palette-control palette-control-compact" : "palette-control";
  const control = `
    <div class="${controlClass}">
      <button
        class="pill palette-button"
        id="${escapeAttribute(node.buttonId)}"
        type="button"
        aria-expanded="false"
        data-setting-button-for="${escapeAttribute(node.id)}"
        ${node.actionKey ? `data-surface-action="${escapeAttribute(node.actionKey)}"` : ""}
      >${escapeHtml(node.initialValueLabel ?? node.label)}</button>
      <div
        class="palette-option-list palette-option-list-compact"
        id="${escapeAttribute(node.optionsId)}"
        data-setting-options-for="${escapeAttribute(node.id)}"
      ></div>
    </div>
  `;

  if (node.variant === "stacked") {
    return `
      <div class="${rowClass}" ${renderNodeMetadata(node)}>
        ${renderTitle(node.titleId, node.label)}
        <div class="autosave-controls">
          ${control}
          <label class="glyph-color-field autosave-delay-field" id="${escapeAttribute(node.auxiliary.fieldId)}" hidden>
            <span class="autosave-delay-label" id="${escapeAttribute(node.auxiliary.labelId)}">${escapeHtml(node.auxiliary.label ?? "Delay")}</span>
            <input
              class="glyph-color-value autosave-delay-input"
              id="${escapeAttribute(node.auxiliary.inputId)}"
              type="number"
              min="250"
              step="250"
              inputmode="numeric"
              value="${escapeAttribute(node.auxiliary.initialValue ?? "1000")}"
              aria-label="Auto save delay in milliseconds"
            />
            <span class="autosave-delay-suffix">ms</span>
          </label>
        </div>
      </div>
    `;
  }

  return `
    <div class="${rowClass}" ${renderNodeMetadata(node)}>
      ${renderTitle(node.titleId, node.label)}
      ${control}
    </div>
  `;
}

function createModeToggle(node) {
  const isTheme = node.containerId === "themeModeToggle";
  const darkId = isTheme ? "themeModeDark" : "editorModeDark";
  const lightId = isTheme ? "themeModeLight" : "editorModeLight";
  return `
    <div class="mode-toggle" id="${escapeAttribute(node.containerId)}" role="group" aria-label="${escapeAttribute(node.label)}" data-mode="dark">
      <button class="mode-toggle-button is-active" id="${darkId}" type="button" data-${isTheme ? "theme" : "editor"}-mode="dark" data-surface-action="${escapeAttribute(node.actionKey)}" aria-label="Dark mode" title="Dark mode">
        <span class="sr-only">${escapeHtml(node.label)} dark</span>
        ${renderIcon("moon")}
      </button>
      <button class="mode-toggle-button" id="${lightId}" type="button" data-${isTheme ? "theme" : "editor"}-mode="light" data-surface-action="${escapeAttribute(node.actionKey)}" aria-label="Light mode" title="Light mode">
        <span class="sr-only">${escapeHtml(node.label)} light</span>
        ${renderIcon("sun")}
      </button>
    </div>
  `;
}

function createToggleControl(node) {
  if (node.variant === "mode") {
    return createModeToggle(node);
  }

  if (node.variant === "segment") {
    return `
      <div class="segment-control" id="${escapeAttribute(node.containerId)}" role="group" aria-label="${escapeAttribute(node.label)}">
        <button class="segment-button is-active" type="button" data-setting-segment-for="${escapeAttribute(node.id)}" data-indent-size="2">2</button>
        <button class="segment-button" type="button" data-setting-segment-for="${escapeAttribute(node.id)}" data-indent-size="4">4</button>
      </div>
    `;
  }

  return `
    <button
      class="toggle-icon-button"
      id="${escapeAttribute(node.buttonId)}"
      data-setting-toggle-for="${escapeAttribute(node.id)}"
      aria-pressed="true"
      aria-label="Toggle glyph rendering"
      title="Toggle glyph rendering"
      type="button"
    >
      <span class="toggle-track">
        <span class="toggle-thumb">${renderIcon("glyph")}</span>
      </span>
    </button>
  `;
}

function createToggleRow(node) {
  return `
    <div class="setting-row" ${renderNodeMetadata(node)}>
      ${renderTitle(node.titleId, node.label)}
      ${createToggleControl(node)}
    </div>
  `;
}

function createStepperRow(node) {
  return `
    <div class="setting-row" ${renderNodeMetadata(node)}>
      ${renderTitle(node.titleId, node.label)}
      <div class="stepper-control" id="${escapeAttribute(node.controlId)}" role="group" aria-label="${escapeAttribute(node.label)}">
        <button class="stepper-button" id="${escapeAttribute(node.decreaseId)}" type="button" data-surface-action="${escapeAttribute(node.actionKey)}" data-setting-step-for="${escapeAttribute(node.id)}" data-setting-step-direction="decrease" aria-label="Decrease ${escapeAttribute(node.label)}">−</button>
        <span class="stepper-value" id="${escapeAttribute(node.valueId)}">${escapeHtml(String(node.initialValue ?? ""))}</span>
        <button class="stepper-button" id="${escapeAttribute(node.increaseId)}" type="button" data-surface-action="${escapeAttribute(node.actionKey)}" data-setting-step-for="${escapeAttribute(node.id)}" data-setting-step-direction="increase" aria-label="Increase ${escapeAttribute(node.label)}">+</button>
      </div>
    </div>
  `;
}

function createDialogRow(node) {
  return `
    <div class="setting-row" ${renderNodeMetadata(node)}>
      ${renderTitle(node.titleId, node.label)}
      <div class="setting-inline-actions setting-inline-actions-row">
        ${node.dialogSpec.actions
          .map(
            (action) => `
              <button class="setting-mini-button" id="${escapeAttribute(action.id)}" type="button" aria-label="${escapeAttribute(action.label)}" title="${escapeAttribute(action.label)}">
                <span class="sr-only">${escapeHtml(action.label)}</span>
                ${renderIcon(action.icon)}
              </button>
            `,
          )
          .join("")}
      </div>
    </div>
  `;
}

function createCard(node, context) {
  const body = createSettingsNodes(node.children ?? [], context);
  const accessory = node.headAccessory ? createToggleControl(node.headAccessory) : "";
  const cardClasses = ["setting-subcard"];
  if (node.plain) {
    cardClasses.push("setting-subcard-plain");
  }
  if (node.cardVariant) {
    cardClasses.push(`setting-subcard-${node.cardVariant}`);
  }
  return `
    <div class="${cardClasses.join(" ")}" ${renderNodeMetadata(node)}>
      ${
        node.label
          ? `
        <div class="setting-subcard-head">
          <p class="setting-subtitle" id="${escapeAttribute(node.titleId)}">${escapeHtml(node.label)}</p>
          ${accessory}
        </div>
      `
          : ""
      }
      <div class="setting-stack">
        ${body}
      </div>
    </div>
  `;
}

function createExpanderRow(node, context) {
  const disclosureClasses = ["setting-disclosure"];
  if (node.nested) {
    disclosureClasses.push("setting-disclosure-nested");
  }

  const bodyMarkup = createSettingsNodes(node.children ?? [], context);
  const bodyContent = node.listId
    ? `<div class="glyph-color-list" id="${escapeAttribute(node.listId)}">${bodyMarkup}</div>`
    : bodyMarkup;

  return `
    <details class="${disclosureClasses.join(" ")}" id="${escapeAttribute(node.id)}" ${node.defaultOpen ? "open" : ""} ${renderNodeMetadata(node)}>
      <summary class="setting-disclosure-summary">
        ${renderTitle(node.titleId, node.label)}
        <div class="setting-disclosure-actions">
          <span class="disclosure-chevron" aria-hidden="true"></span>
        </div>
      </summary>
      <div class="disclosure-body">
        ${bodyContent}
      </div>
    </details>
  `;
}

function createSurfaceTabsCard(node, context) {
  const themePanelBody = createSettingsNodes(node.themeChildren ?? [], context);
  const editorPanelBody = createSettingsNodes(node.editorChildren ?? [], context);
  const cardClasses = ["setting-subcard", "setting-subcard-plain", "surface-tabs-card"];
  if (node.cardVariant) {
    cardClasses.push(`surface-tabs-card-${node.cardVariant}`);
  }
  return `
    <div class="${cardClasses.join(" ")}" id="${escapeAttribute(node.id)}" ${renderNodeMetadata(node)}>
      <div class="surface-tabs-header" role="tablist" aria-label="${escapeAttribute(node.label)}">
        ${node.tabs
          .map(
            (tab) => `
              <button
                class="surface-tabs-tab${tab.key === "theme" ? " is-active" : ""}"
                id="${escapeAttribute(tab.key === "theme" ? node.themeTabId : node.editorTabId)}"
                type="button"
                role="tab"
                aria-selected="${tab.key === "theme" ? "true" : "false"}"
                data-linked-surface-tab="${escapeAttribute(tab.key)}"
              >${escapeHtml(tab.label)}</button>
            `,
          )
          .join("")}
      </div>
      <div class="setting-stack surface-tabs-body">
        <div class="setting-subcard setting-subcard-plain surface-tabs-mode-card">
          <div class="setting-stack">
            <div class="setting-row surface-tabs-mode-row">
              ${renderTitle(node.modeTitleId, node.modeLabel)}
              <div class="surface-tabs-mode-controls">
                <button
                  class="setting-mini-button mode-link-button"
                  id="${escapeAttribute(node.linkButtonId)}"
                  type="button"
                  data-linked-editor-mode-link
                  aria-label="Link editor mode to theme"
                  title="Link editor mode to theme"
                  hidden
                >
                  <span class="sr-only">Link editor mode to theme</span>
                  ${renderIcon("link")}
                </button>
                <div class="mode-toggle" id="${escapeAttribute(node.toggleContainerId)}" role="group" aria-label="${escapeAttribute(node.modeLabel)}" data-mode="dark">
                  <button
                    class="mode-toggle-button is-active"
                    id="${escapeAttribute(node.darkId)}"
                    type="button"
                    data-linked-surface-mode="dark"
                    aria-label="Dark mode"
                    title="Dark mode"
                  >
                    <span class="sr-only">${escapeHtml(node.modeLabel)} dark</span>
                    ${renderIcon("moon")}
                  </button>
                  <button
                    class="mode-toggle-button"
                    id="${escapeAttribute(node.lightId)}"
                    type="button"
                    data-linked-surface-mode="light"
                    aria-label="Light mode"
                    title="Light mode"
                  >
                    <span class="sr-only">${escapeHtml(node.modeLabel)} light</span>
                    ${renderIcon("sun")}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="surface-tabs-panels">
          <div
            class="surface-tabs-panel is-active"
            id="${escapeAttribute(node.themePanelId)}"
            data-linked-surface-panel="${escapeAttribute(node.tabs[0]?.key ?? "theme")}"
          >
            ${themePanelBody}
          </div>
          <div
            class="surface-tabs-panel"
            id="${escapeAttribute(node.editorPanelId)}"
            data-linked-surface-panel="${escapeAttribute(node.tabs[1]?.key ?? "editor")}"
            hidden
          >
            ${editorPanelBody}
          </div>
        </div>
      </div>
    </div>
  `;
}

function createSettingsNode(node, context) {
  switch (node.kind) {
    case SETTINGS_NODE_KINDS.CARD:
      return createCard(node, context);
    case SETTINGS_NODE_KINDS.DROPDOWN:
      return createDropdownRow(node, context);
    case SETTINGS_NODE_KINDS.TOGGLE:
      return createToggleRow(node, context);
    case SETTINGS_NODE_KINDS.STEPPER:
      return createStepperRow(node, context);
    case SETTINGS_NODE_KINDS.DIALOG:
      return createDialogRow(node, context);
    case SETTINGS_NODE_KINDS.EXPANDER:
      return createExpanderRow(node, context);
    case SETTINGS_NODE_KINDS.SURFACE_TABS:
      return createSurfaceTabsCard(node, context);
    default:
      return "";
  }
}

export function createSettingsNodes(nodes, context = {}) {
  return nodes.map((node) => createSettingsNode(node, context)).join("");
}

export function createCardFactory({ nodes, tokens = settingsFactoryTokens } = {}) {
  return {
    tokens,
    style: serializeSettingsFactoryTokens(tokens),
    markup: createSettingsNodes(nodes ?? [], { tokens }),
  };
}

export {
  createCard,
  createDialogRow,
  createDropdownRow,
  createExpanderRow,
  createSettingsNode,
  createSurfaceTabsCard,
  createStepperRow,
  createToggleRow,
};
