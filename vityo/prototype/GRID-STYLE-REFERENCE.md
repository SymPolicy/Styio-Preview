# Grid Style Reference

**Purpose:** 记录 `prototype/editor.html` 中 `Grid` 风格的当前布局规则、共享变量、几何约束与维护边界，避免后续继续靠聊天上下文口头约定。  
**Companion doc:** `GRID-STYLE-PRACTICE.md` 负责记录这一轮工作的经验、方法与避坑点。

**Last updated:** 2026-04-15

## Scope

1. 本文只约束 `Grid` 风格。
2. `Editorial` 必须独立演进，不得借用本文的结构假设。
3. `Grid` 的行为与样式 SSOT 分别在：
   - `editor.html`
   - `editor-styles/grid-style.css`
   - `scripts/check-editor-load.mjs`

## DOM Structure

### Left

`Grid` 左侧主区必须固定为三段：

1. `#gridMainToolbar`
2. `#gridMainToolbarSpacer`
3. `#gridEditorPane`

说明：

1. `#gridMainToolbar` 只承载两类子组件：
   - `#gridFileTabs`
   - `#gridToggleSidebar`
2. `#gridMainToolbarSpacer` 是显式空白容器，不允许再退回用 `margin-bottom` 模拟这段留白。
3. `#gridEditorPane` 只承载编辑器区域，并通过自身 padding 提供外侧留白。

### Right

`Grid` 右侧栏必须固定为三段：

1. `#gridDrawerHeader`
2. `#gridDrawerHeaderSpacer`
3. `#gridDrawerContent`

说明：

1. `#gridDrawerHeader` 只承载两类子组件：
   - `#gridDrawerTabsDock`
   - `#gridCloseSidebar`
2. `#gridDrawerHeaderSpacer` 是显式空白容器，不允许再退回用 `margin-bottom` 模拟这段留白。
3. `#gridDrawerContent` 负责侧栏内容区的外侧 padding。
4. `#gridDrawerMount` 是 content 内部真正的挂载点，不再额外加外侧 padding。

## Shared Geometry Tokens

当前 `Grid` 的维护入口分成两层：

1. `prototype/editor-modules/grid-style/layout-config-store.js`
   负责单例配置、倍率管理、订阅分发与页面自动更新。
2. `prototype/editor-modules/grid-style/layout-manager.js`
   负责把当前配置换算为 CSS 变量。
3. `prototype/editor-styles/grid-style.css`
   只消费已经算好的 CSS 变量，不再手写拆散的间距数字。

### Internal Layout Scale Config

这三个变量是内部维护入口，不进入用户设置：

```js
const defaultGridLayoutConfig = {
  shell_inline_inset_base: 18,
  shell_vertical_inset_base: 16,
  inner_outer_margin_consistent: true,
  inner_margin: 1,
  outer_margin: 1,
};
```

本文后续出现的 `16px / 18px` 等显式数值，均指这组默认配置计算出的当前结果。

含义：

1. `inner_outer_margin_consistent`
   为 `true` 时，内部间距和外部间距共用同一倍率；此时 `inner_margin` 只保留为配置项，不作为实际生效倍率。
2. `inner_margin`
   内部组件之间的显式留白倍率，作用对象主要是 `toolbar/header` 下方 spacer。
3. `outer_margin`
   边缘组件与外侧卡片边界的倍率，作用对象主要是顶部 inset、左右 inset、底部 inset。

单例配置入口：

```js
gridLayoutConfigStore.update({ outer_margin: 1.1 });
```

页面自动同步入口：

```js
bindGridLayoutConfigTarget(document.body, {
  onAfterApply: () => scheduleLayoutRender(),
});
```

它会统一产出这组维护用变量：

```css
--grid-shell-inner-margin-scale
--grid-shell-outer-margin-scale
--grid-shell-inner-margin-scale-effective
--grid-shell-inner-outer-margin-consistent
```

以及这组真正参与布局的变量：

```css
--grid-shell-inline-inset: 18px;
--grid-shell-vertical-inset: 16px;
--grid-shell-block-start-inset: var(--grid-shell-vertical-inset);
--grid-shell-control-size: 44px;
--grid-shell-control-row-height: 44px;
--grid-shell-control-gap: 18px;
--grid-shell-section-gap: var(--grid-shell-vertical-inset);
--grid-sidebar-width-open: 368px;
```

规则：

1. 左右两边必须共用同一组 `inline inset / block-start inset / control size / section gap`。
2. 左右两边的 header/toolbar 高度必须共用 `--grid-shell-control-row-height`。
3. 任何局部微调，都必须优先改 `layout-config-store.js` 的单例配置，而不是散落魔法数字。

## Margin Dependency Map

当前这组 `16px` 纵向基线，直接影响 `8` 个布局容器，间接带动 `6` 个关键子组件。

### Direct

1. `.main-editor-card`
2. `#gridMainToolbar`
3. `#gridMainToolbarSpacer`
4. `#gridEditorPane`
5. `#gridSideDrawer`
6. `#gridDrawerHeader`
7. `#gridDrawerHeaderSpacer`
8. `#gridDrawerContent`

### Derived

1. `#gridFileTabs`
2. `#gridToggleSidebar`
3. `#sharedDrawerTabs`
4. `#gridCloseSidebar`
5. `.main-editor-card .editor-frame`
6. `#gridDrawerMount`

一致性链路：

1. `outer_margin` 控制 `--grid-shell-inline-inset` 与 `--grid-shell-block-start-inset`。
2. `inner_outer_margin_consistent = true` 时，`--grid-shell-section-gap` 直接跟随 `outer_margin`。
3. `inner_outer_margin_consistent = false` 时，`--grid-shell-section-gap` 改由 `inner_margin` 单独控制。
4. `scripts/check-editor-load.mjs` 会直接读取当前 CSS 变量，而不是写死 `16px`，因此缩放后自测仍然有效。
5. `window.__styioGridLayoutConfig` 暴露了内部维护用的 `getSnapshot / set / update / reset`，用于运行时验证这套自动更新链路。

## Layout Rules

### Left

1. `#gridMainToolbar` 的顶边距离左侧外部卡片顶边，固定为 `--grid-shell-block-start-inset`。
2. `#gridFileTabs` 的高度必须等于 `#gridMainToolbar` 的高度。
3. `#gridMainToolbarSpacer` 的高度必须等于 `--grid-shell-section-gap`，当前与顶部 inset 同为 `16px`。
4. `#gridEditorPane` 的外侧 padding 当前为：
   - left: `18px`
   - right: `18px`
   - bottom: `16px`
5. `#gridEditorPane` 顶部不再使用额外 margin；它与 toolbar 的距离完全由 `#gridMainToolbarSpacer` 提供。

### Right

1. `#gridDrawerHeader` 的顶边距离右侧外部卡片顶边，固定为 `--grid-shell-block-start-inset`。
2. `#gridDrawerHeader` 的宽度必须等于右侧栏宽度。
3. `#gridDrawerHeader` 的高度必须等于内部最大子组件高度；当前即 `44px`。
4. `#gridDrawerTabsDock` 必须贴左，`#gridCloseSidebar` 必须贴右。
5. `#gridDrawerHeaderSpacer` 的高度必须等于 `--grid-shell-section-gap`，当前与顶部 inset 同为 `16px`。
6. `#gridDrawerContent` 的外侧 padding 当前为：
   - left: `18px`
   - right: `18px`
   - bottom: `16px`
7. `#gridDrawerContent` 顶部不再使用额外 margin；它与 header 的距离完全由 `#gridDrawerHeaderSpacer` 提供。

## Button Symmetry Rule

`Open sidebar` 和 `Close sidebar` 必须视为同一个几何锚点在左右两侧的镜像。

当前约束：

1. top inset: `16px`
2. inline edge inset: `18px`
3. control size: `44px`
4. center-top inset: `38px`
5. center-inline inset: `40px`

解释：

1. `center-top inset = block-start inset + control-size / 2`
2. `center-inline inset = inline inset + control-size / 2`
3. 左侧按钮以主编辑区右边界为参照。
4. 右侧按钮以侧边栏右边界为参照。

## Spacing Rules Inside Sidebar Content

1. `#drawerPanelFiles` 当前使用 `gap: 10px` 作为内部区块主间距。
2. `.workspace-action-row` 当前使用对称 padding：

```css
padding: 2px 0;
```

这条规则的目的，是保证 action row 上下的附加留白一致。

## Prohibited Patterns

1. 不允许重新把 spacer 退回为 `margin-bottom`。
2. 不允许让 header/toolbar 通过内部 padding 人为撑出顶部空白。
3. 不允许让按钮靠 `absolute + top` 单独漂移，而脱离共享几何变量。
4. 不允许让 `Grid` 再次依赖通用 `--drawer-width` 作为唯一来源；`Grid` 必须维护自己的 `--grid-sidebar-width`。
5. 不允许让右侧 header 溢出侧边栏轨道来“假装展开”。

## Programmatic Verification

`scripts/check-editor-load.mjs` 已对 `Grid` 几何关系做数值校验。当前会检查：

1. toolbar 高度与 file tabs 高度一致。
2. 左右顶部 inset 必须等于当前 `--grid-shell-block-start-inset`。
3. 左右 spacer 高度必须等于当前 `--grid-shell-section-gap`。
4. 右侧 header 高度等于内部子组件高度。
5. `Open` / `Close` 按钮的 top inset 一致。
6. `Open` / `Close` 按钮的 inline edge inset 一致。
7. `Open` / `Close` 按钮的中心点到边界距离一致。
8. 左标签栏和右 toggle 组的中心线一致。
9. 左编辑器 content 的左右下外侧 padding 符合当前布局变量。
10. 右侧 content 的左右下外侧 padding 符合当前布局变量。
11. 当 `inner_outer_margin_consistent = true` 时，额外校验 `section gap == block-start inset`。
12. 运行时通过单例配置 `update()` 后，页面会自动更新当前 `Grid` 几何变量。
13. `reset()` 后，几何会回到基线。
14. 右侧栏宽度在展开态必须大于 `0`。

## Change Workflow

后续若继续调整 `Grid`，必须按这个顺序：

1. 先改 `editor-modules/grid-style/layout-config-store.js` 的单例配置。
2. 若结构变化，再改 `editor.html`。
3. 若需要新增推导变量，再改 `editor-modules/grid-style/layout-manager.js`。
4. 仅在新增布局消费点时，再改 `editor-styles/grid-style.css`。
5. 同步更新 `scripts/check-editor-load.mjs` 的几何校验。
6. 运行 `npm run selftest:editor`。
7. 若规则变化，更新本文。
