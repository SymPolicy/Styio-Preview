# M7 — Theme And Profile System

**Purpose:** 建立细粒度主题系统和用户 profile 骨架，使编辑器、运行视图和 AI 面板具备统一但可局部覆写的风格能力。

**Last updated:** 2026-04-12

**Status:** Planned

## 1. 目标

1. 提供常见 IDE 主题预设。
2. 支持 token、语义块、面板、运行图区和 agent 面板的分层配色。
3. 为后续云 profile 同步留接口。
4. 在没有 sync 组件时保持完整本地 profile 模式。

## 2. 任务

| Task ID | Deliverable | Dependency | Exit |
|---------|-------------|------------|------|
| M7-T01 | 定义 `ThemeProfile` 数据模型 | M1 | 分层字段冻结 |
| M7-T02 | 准备首批主题预设 | M7-T01 | 至少 3 套预设 |
| M7-T03 | 支持编辑器 token 层主题 | M3 | 视觉替换可继承主题 |
| M7-T04 | 支持 semantic block surface 主题 | M3-T06 | 块表面可定制 |
| M7-T05 | 支持 runtime surface 与 AI 面板主题 | M5 / M6 | 面板主题可统一 |
| M7-T06 | 提供用户局部覆写入口 | M7-T01 | 可修改部分主题项 |
| M7-T07 | 为 profile 同步预留序列化格式 | M7-T01 | 后续云同步可接入 |
| M7-T08 | 定义 local profile store 与 cloud mirror 的分层关系 | M7-T07 / M6-T10 | sync 组件可独立挂载 |

## 3. 门禁

1. 主题预设可切换。
2. 用户可做细粒度覆写。
3. 各个 UI 面层不会共享一套不可拆分的配色配置。
4. 未挂载 sync 组件时，profile 仍能完整读写在本地。
