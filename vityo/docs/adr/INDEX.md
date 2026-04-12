# ADR Index

**Purpose:** 维护 `docs/adr/` 中的架构决策索引与状态。

**Last updated:** 2026-04-12

| ADR | Status | Title |
|-----|--------|-------|
| [ADR-0001](./ADR-0001-frontend-runtime-flutter.md) | Accepted | 前端运行时选择 Flutter |
| [ADR-0002](./ADR-0002-native-core-bridge-via-c-abi.md) | Accepted | 原生桥接统一暴露为 `FFI Adapter` |
| [ADR-0003](./ADR-0003-custom-editor-engine.md) | Accepted | 编辑器采用自研文档与渲染引擎，不复用传统 IDE 控件 |
| [ADR-0004](./ADR-0004-platform-execution-backend-split.md) | Accepted | 桌面、Android、iOS、云端采用分层执行后端 |
| [ADR-0005](./ADR-0005-visual-runtime-from-event-stream.md) | Accepted | 运行可视化以事件流和中间图模型驱动 |
| [ADR-0006](./ADR-0006-ai-agent-panel-first-class-surface.md) | Accepted | AI agent 作为 IDE 一等交互面板 |
| [ADR-0007](./ADR-0007-theme-system-layering.md) | Accepted | 主题系统按 token、语义、表面、运行图区分层 |
| [ADR-0008](./ADR-0008-mobile-interaction-model-diverges-from-desktop.md) | Accepted | 移动端交互模型允许与桌面完全分化 |
| [ADR-0009](./ADR-0009-module-runtime-and-staged-updates.md) | Accepted | 功能模块采用可挂载、可卸载、staged update 的宿主模型 |
| [ADR-0010](./ADR-0010-shared-core-cross-platform.md) | Accepted | 桌面与移动端共享核心框架，仅在展示和交互层分化 |
| [ADR-0011](./ADR-0011-runtime-surface-feature-registry.md) | Accepted | 运行可视化能力通过特性入口注册表发现与装载 |
| [ADR-0012](./ADR-0012-runtime-event-protocol.md) | Accepted | 执行层与运行视图之间采用有序 RuntimeEvent 协议 |
| [ADR-0013](./ADR-0013-agent-and-profile-provider-adapters.md) | Accepted | AI 与 profile 集成通过 provider adapter 和外接组件接入 |
| [ADR-0014](./ADR-0014-ios-compliance-floor-and-distribution-policy.md) | Accepted | iOS 作为唯一商店受限平台并定义共享合规下限 |
| [ADR-0015](./ADR-0015-uninstall-reclamation-and-hosted-workspace-retention.md) | Accepted | 卸载回收与托管工作区保留/删除采用显式策略 |
| [ADR-0016](./ADR-0016-language-service-layering-and-lsp-like-contracts.md) | Accepted | 语言服务分离高亮、诊断与格式化，并采用 LSP-like 数据合同 |
