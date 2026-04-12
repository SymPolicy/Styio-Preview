# Spio Project Graph Contract

**Purpose:** 冻结 `styio-view` 对 `spio` 项目图的 handoff 要求。

**Last updated:** 2026-04-12

## 1. Required Fields

1. `workspaceRoot`
2. `manifestPath`
3. `lockfilePath`
4. `toolchainPinPath`
5. `packages[]`
6. `targets[]`
7. `workspaceMembers[]`
8. `dependencyGraph`
9. `lockState`
10. `vendorState`
11. `buildRoot`
12. `activeCompiler`

## 2. Required Behaviors

1. combined root、workspace root、single package 必须能区分。
2. `[lib] / [[bin]] / [[test]]` targets 必须结构化给出。
3. lock freshness 和 vendor presence 必须机器可读。
4. toolchain pin resolution 必须机器可读。

## 3. Current Frontend Assumption

在正式 payload 发布前，`styio-view` 允许围绕这些 canonical files 做 partial inference：

1. `spio.toml`
2. `spio.lock`
3. `spio-toolchain.toml`
4. `.spio/vendor/`
5. `.spio/build/`

但一旦 `spio` 发布正式 graph payload，前端主线要切到正式 payload。

当前前端 partial inference 已覆盖：

1. `workspace members`
2. `package list`
3. `[dependencies] / [dev-dependencies]` 的基础 dependency graph
4. `[lib] / [[bin]] / [[test]]` targets
