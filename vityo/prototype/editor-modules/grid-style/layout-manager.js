export function buildGridLayoutCssVars(config = {}) {
  const resolved = normalizeResolvedGridLayoutConfig(config);
  const effectiveInnerMargin = resolved.inner_outer_margin_consistent ? resolved.outer_margin : resolved.inner_margin;
  const shellInlineInset = resolved.shell_inline_inset_base * resolved.outer_margin;
  const shellVerticalInset = resolved.shell_vertical_inset_base * resolved.outer_margin;
  const sectionGap = resolved.shell_vertical_inset_base * effectiveInnerMargin;

  return Object.freeze({
    config: Object.freeze({
      ...resolved,
      inner_margin_effective: effectiveInnerMargin,
    }),
    cssVars: Object.freeze({
      "--grid-shell-inline-inset": formatPx(shellInlineInset),
      "--grid-shell-vertical-inset": formatPx(shellVerticalInset),
      "--grid-shell-block-start-inset": formatPx(shellVerticalInset),
      "--grid-shell-section-gap": formatPx(sectionGap),
      "--grid-shell-inline-inset-base": formatPx(resolved.shell_inline_inset_base),
      "--grid-shell-vertical-inset-base": formatPx(resolved.shell_vertical_inset_base),
      "--grid-shell-inner-margin-scale": formatScalar(resolved.inner_margin),
      "--grid-shell-outer-margin-scale": formatScalar(resolved.outer_margin),
      "--grid-shell-inner-margin-scale-effective": formatScalar(effectiveInnerMargin),
      "--grid-shell-inner-outer-margin-consistent": resolved.inner_outer_margin_consistent ? "1" : "0",
    }),
  });
}

export function applyGridLayoutConfig(target, config = {}) {
  const resolved = buildGridLayoutCssVars(config);
  if (!target?.style) {
    return resolved;
  }

  Object.entries(resolved.cssVars).forEach(([cssVar, value]) => {
    target.style.setProperty(cssVar, value);
  });

  return resolved;
}

function normalizeResolvedGridLayoutConfig(config) {
  return Object.freeze({
    shell_inline_inset_base: normalizePositiveScalar(config.shell_inline_inset_base, 18),
    shell_vertical_inset_base: normalizePositiveScalar(config.shell_vertical_inset_base, 16),
    inner_outer_margin_consistent: Boolean(config.inner_outer_margin_consistent ?? true),
    inner_margin: normalizePositiveScalar(config.inner_margin, 1),
    outer_margin: normalizePositiveScalar(config.outer_margin, 1),
  });
}

function normalizePositiveScalar(value, fallback) {
  const numeric = Number(value);
  return Number.isFinite(numeric) && numeric > 0 ? numeric : fallback;
}

function formatPx(value) {
  return `${roundScalar(value)}px`;
}

function formatScalar(value) {
  return String(roundScalar(value));
}

function roundScalar(value) {
  return Math.round((value + Number.EPSILON) * 1000) / 1000;
}
