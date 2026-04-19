# Shell / Editor Runbook

**Purpose:** 提供 Flutter 主壳、编辑器核心、language UI 外壳与手写 Web Editor 主线的日常维护入口。

**Last updated:** 2026-04-19

## Mission

负责 app shell、editor core、source buffer fidelity、language inspector 外壳和手写 `editor.html` 主线。该团队不拥有 adapter 合同本身，也不定义上游 `styio` 的语言语义。

## Owned Surface

Primary paths:

1. `frontend/styio_view_app/lib/src/app/`
2. `frontend/styio_view_app/lib/src/editor/`
3. `frontend/styio_view_app/lib/src/language/`
4. `prototype/editor.html`
5. `prototype/editor.css`
6. `prototype/editor.js`
7. `prototype/editor-modules/`
8. `prototype/workspace/`
9. `prototype/README.md`

Key SSOTs:

1. `产品规格 -> ../design/Styio-View-Product-Spec.md`
2. `系统架构 -> ../design/Styio-View-System-Architecture.md`
3. `手写 Web IDE handbook -> ../specs/HANDWRITTEN-WEB-IDE-ENGINEERING-HANDBOOK.md`

## Daily Workflow

1. 先确认变更属于“显示层”还是“源码层”；不得把显示替换误写成源码改写。
2. 改动 `prototype/editor.html` 主线前，先按 handbook 检查分层、渲染切片和工作流约束。
3. 若 Flutter 壳层和手写原型都受影响，先明确哪条是主验证线，再同步另一条的约束或 handoff。
4. 变更编辑语义、光标、selection 或 inspector 流程时，同时检查测试目录映射是否要补。
5. 手写原型入口或自测说明变化时，同批更新 `prototype/README.md`，不要把 focused editor 运行方式留在仓库级入口里漂移。

## Change Classes

1. Small: 局部输入、选区、布局或 inspector 文案修正。运行最小自测。
2. Medium: focused editor 主线、language feedback、source fidelity 或 editor state 行为变化。补测试目录映射并跑两条主验证线。
3. High: 显示替换与源码关系、最小可编译单元交互、editor 主工作流或主布局架构变化。走协调 review，并同步设计/ADR/里程碑。

## Required Gates

Minimum:

```bash
cd prototype && npm run selftest:editor
cd frontend/styio_view_app && flutter analyze && flutter test
```

## Cross-Team Dependencies

1. Adapter / Contracts 必须 review 任何新 payload 假设、diagnostic/text edit 语义或上游 handoff 依赖。
2. Theme / UX 必须 review 影响层级、排版、容器约束和视觉基线的变更。
3. Runtime / Agent 必须 review 会影响 runtime/debug/agent surface 入口或布局的变更。
4. Docs / Delivery 必须 review handbook、里程碑和测试目录映射的更新。

## Handoff / Recovery

Record:

1. 受影响的编辑主线是 Flutter、handwritten web，还是两者同时。
2. 已跑的自测命令与失败截图或失败场景。
3. 当前是否仍满足 source buffer fidelity。
4. 下一步要改的 surface、回滚点和对应 history 记录。
