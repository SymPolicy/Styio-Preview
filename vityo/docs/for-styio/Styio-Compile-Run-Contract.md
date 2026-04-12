# Styio Compile Run Contract

**Purpose:** 冻结 `styio-view` 与上游 `styio` 在执行、runtime 事件、compile-plan consumer 和 machine-info 扩展上的对接边界。

**Last updated:** 2026-04-12

## 1. Required Execution Handoff

上游 `styio` 需要提供：

1. `resolveMinimalCompilableUnit`
2. `compile request / result`
3. `run request / result`
4. `stdout / stderr / diagnostics` machine stream

## 2. Required Runtime Event Handoff

第一批至少需要：

1. `compile.*`
2. `run.*`
3. `thread.*`
4. `state.*`
5. `transition.fired`
6. `log.emitted`
7. `diagnostic.emitted`

每个事件至少应带：

1. `schemaVersion`
2. `sessionId`
3. `sequence`
4. `timestamp`
5. `eventKind`
6. `origin`
7. `payload`

## 3. Compile-Plan Consumer

`styio-view` 需要 `styio` 发布正式 `compile-plan` consumer：

1. 接受 `spio` 输出的 versioned compile plan
2. 明确 accept / reject path
3. 失败时返回 machine-readable payload

在此之前，项目级 build/run/test 只能停留在 compile-plan preview。

## 4. Machine-Info Extension

`styio --machine-info=json` 后续必须扩展为至少包含：

1. `active_integration_phase`
2. `supported_contract_versions`
3. `supported_adapter_modes`
4. `feature_flags`

## 5. Rules

1. `styio-view` 不解析人类 stderr 来猜状态。
2. 未发布的执行路径必须明确返回 `blocked` 原因，而不是让前端猜测。
3. 上游可以只先交付 `CLI` 或 `FFI` 中的一种，但 shape 必须满足 `docs/contracts/ExecutionAdapter.md` 与 `docs/contracts/RuntimeEventAdapter.md`。
