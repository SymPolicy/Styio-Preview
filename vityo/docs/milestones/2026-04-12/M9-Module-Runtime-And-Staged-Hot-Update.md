# M9 — Module Runtime And Staged Hot Update

**Purpose:** 建立模块宿主、capability matrix、按设备安装/卸载和 staged update 机制，使不同平台只挂载可用模块。

**Last updated:** 2026-04-12

**Status:** Planned

## 1. 目标

1. 所有长期功能以 core module 或 optional module 的形式组织。
2. 用户可以按设备安装、卸载或禁用 optional module。
3. 模块更新采用 staged update：当前版本继续运行，重启后切换新版本。
4. iOS 客户端不挂载本地编译模块。
5. 平台化卸载回收策略可被宿主执行。

## 2. 任务

| Task ID | Deliverable | Dependency | Exit |
|---------|-------------|------------|------|
| M9-T01 | 定义 `ModuleManifest` 与版本字段 | M1 | manifest schema 冻结 |
| M9-T02 | 定义 `ModuleCapabilityMatrix` | M9-T01 | 各平台可判定可挂载性 |
| M9-T03 | 实现 core / optional module 分类 | M9-T01 | 基础宿主可区分模块类型 |
| M9-T04 | 实现安装、卸载、禁用入口 | M9-T03 | 用户可操作 optional module |
| M9-T05 | 实现 mounted / staged / pending-removal 生命周期 | M9-T03 | 生命周期可追踪 |
| M9-T06 | 实现 staged update 下载与重启后激活 | M9-T05 | 旧模块在当前会话继续运行 |
| M9-T07 | 实现平台不支持模块的入口隐藏规则 | M9-T02 | iOS 不显示本地编译入口 |
| M9-T08 | 定义模块卸载后的状态回收协议 | M9-T04 | 卸载不留下失效入口 |
| M9-T09 | 支持 runtime surface feature module slot 与入口列表回收 | M9-T01 / M9-T08 | 可视化入口随模块安装卸载变化 |
| M9-T10 | 定义 `DistributionChannelPolicy` 与 iOS-safe 标记 | M9-T01 / M9-T02 | 各模块可判定分发边界 |
| M9-T11 | 实现移动端卸载的全量回收协议 | M9-T08 | 手机端卸载后无残留 |
| M9-T12 | 实现桌面端卸载的保留/清除数据选择 | M9-T08 | 桌面端用户可自行决定 |

## 3. 门禁

1. core module 与 optional module 分界清晰。
2. 用户能按设备安装、卸载和更新 optional module。
3. 当前会话中的运行模块在重启前保持稳定。
4. iOS 客户端不暴露本地编译模块入口。
5. 运行可视化入口列表随模块安装、卸载、staged update 正确变化。
6. 移动端与桌面端的卸载回收行为符合各自策略。
