# Third-Party Inventory

**Purpose:** 记录 `styio-view` 当前接受、计划或明确暂缓的第三方依赖与运行时边界；第一方上游 `styio` 也在此登记，便于实现期核对。

**Last updated:** 2026-04-12

## 1. 已接受依赖

| Dependency | Status | Role | Notes |
|------------|--------|------|-------|
| Flutter SDK | Accepted | 主前端运行时与跨端 UI 框架 | 负责桌面、移动与 Web 端 UI。 |
| Dart SDK | Accepted | Flutter 语言运行时 | 作为 Flutter 的直接依赖。 |
| `styio` upstream repository | Accepted (first-party upstream) | 语言与编译器核心 | 非第三方，但属于本仓依赖边界。 |
| LLVM | Accepted (via `styio`) | CodeGen / JIT / IR 后端 | 由上游 `styio` 维护。 |

## 2. 计划中但未冻结

| Dependency / Service | Status | Intended Role | Blocking Question |
|----------------------|--------|---------------|-------------------|
| 图布局引擎 | Planned | 底部运行可视图的自动布局 | 选择 Flutter 原生实现还是引入外部库未定。 |
| 云容器执行平面 | Planned | iOS 与远程工作区执行后端 | 资源调度、计费与沙箱边界待定。 |
| 本地 AI 模型运行时 | Planned | 移动端输入预测 agent / 本地 coding agent | 模型大小、授权与设备门槛待定。 |
| 模块分发与更新服务 | Planned | 模块下载、筛选、staged update | 平台分发、签名和缓存策略待定。 |
| OpenAI-compatible cloud endpoint | Planned | 云端 coding agent 的兼容服务接口 | 首批需要验证兼容端点、鉴权和错误模型。 |
| OpenRouter provider | Planned (prelaunch candidate) | 预上线阶段的云端 agent provider | 通过 OpenAI-compatible adapter 接入，不写死在主壳。 |
| Profile sync service | Planned | prompt / profile 的可选云同步组件 | 未挂载时必须保持 local-only。 |

## 3. 明确暂缓

| Dependency | Status | Reason |
|------------|--------|--------|
| Qt / Qt Quick | Deferred | 当前已决定 Flutter 为主前端。 |
| Electron | Rejected | 不符合项目对原生显示与非 Chromium 主路径的要求。 |
| Tauri 作为主 UI 路线 | Rejected | 仍以 WebView 为主，不符合当前架构目标。 |

## 4. 维护规则

1. 引入新的长期依赖前先更新本文件。
2. 若依赖会影响平台策略、打包、许可或运行时模型，应新增 ADR。
3. 若某依赖只用于实验，不得写入“已接受”表。
