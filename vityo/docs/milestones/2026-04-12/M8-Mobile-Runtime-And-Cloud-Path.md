# M8 — Mobile Runtime And Cloud Path

**Purpose:** 建立移动端专属交互与云执行路径，覆盖 Android 本地优先、iOS 云执行主路径、Web hosted workspace 和移动端输入预测 agent 骨架。

**Last updated:** 2026-04-12

**Status:** Planned

## 1. 目标

1. 移动端不照搬桌面交互。
2. Android 具备本地优先路径。
3. iOS 具备云执行主路径。
4. 移动端 pipeline selector 与输入预测 agent 有基础骨架。
5. iOS 不暴露本地编译模块入口。
6. Android 本地运行模块体积控制在当前接受预算 `<= 50 MB`。
7. Web 端具备 hosted workspace 的关闭、导出与保留窗口规则。

## 2. 任务

| Task ID | Deliverable | Dependency | Exit |
|---------|-------------|------------|------|
| M8-T01 | 定义移动端交互模型与手势映射 | M2 | 与桌面清晰分层 |
| M8-T02 | 设计 Android 本地 runtime 模块接入方案 | M4 / M9 | Android 本地路径冻结 |
| M8-T03 | 设计 iOS 云执行工作流与仅云模块矩阵 | M4 / M9 | iOS 云执行主路径冻结 |
| M8-T04 | 设计移动端 pipeline selector 长按滚动交互 | M3-T07 | 类型安全候选可滚动选择 |
| M8-T05 | 建立移动端输入预测 agent 骨架 | M6 | 本地/云端输入辅助可插入 |
| M8-T06 | 设计离线/在线能力切换提示 | M8-T02 / M8-T03 | 用户知道当前运行路径 |
| M8-T07 | 确保 iOS 客户端不暴露本地编译入口 | M8-T03 | iOS UI 与模块矩阵一致 |
| M8-T08 | 建立 Android 本地运行模块体积预算门禁 | M8-T02 | 构建产物可检查 `<= 50 MB` |
| M8-T09 | 建立移动端基础 e2e 验收清单 | M8 | 能映射到测试目录 |
| M8-T10 | 冻结 iOS 最后上线与 App Store 合规基线 | M8-T03 / M9-T02 | iOS 分发边界清晰 |
| M8-T11 | 定义 Web hosted workspace 关闭提示与核心文件导出流 | M8-T03 | Web 退出路径清晰 |
| M8-T12 | 定义 hosted workspace 的 7 天保留与删除流程 | M8-T11 | 保留窗口可验证 |

## 3. 门禁

1. Android 至少具备一条本地最小执行路径。
2. iOS 至少具备一条云执行最小闭环。
3. 移动端交互与桌面端不混淆。
4. iOS 客户端不存在本地编译模块入口。
5. Android 本地运行模块符合当前 `<= 50 MB` 预算目标。
6. Web hosted workspace 关闭前会提示清空后果并提供核心文件导出。
7. hosted workspace 的默认 7 天保留窗口对用户可见。
