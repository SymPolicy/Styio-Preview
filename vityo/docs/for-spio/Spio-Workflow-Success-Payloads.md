# Spio Workflow Success Payloads

**Purpose:** 冻结 `styio-view` 对 `spio` workflow success payload 的 handoff 要求。

**Last updated:** 2026-04-12

## 1. Commands That Need Success Payloads

1. `check`
2. `lock`
3. `tree`
4. `vendor`
5. `pack`
6. `publish`
7. `tool install`
8. `tool use`
9. `tool pin`
10. `build --dry-run`
11. `run --dry-run`
12. `test --dry-run`

## 2. Rules

1. 不能只有失败 JSON；成功也必须有稳定机器输出。
2. payload 必须包含 contract version。
3. 对 compile-plan preview，必须明确 plan schema version 和 consumer expectations。
4. 一旦 `styio` 发布 compile-plan live consumer，`styio-view` 将通过 `spio` 的项目级 build/run/test machine path 消费结果。
