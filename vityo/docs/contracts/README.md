# Contracts Docs

**Purpose:** 冻结 `styio-view` 产品拥有的 adapter 合同；这些合同定义前端需要什么，而不是上游当前碰巧提供什么。

**Last updated:** 2026-04-12

## Scope

本目录只维护四类主合同与一个公共能力快照：

1. `LanguageServiceAdapter`
2. `ProjectGraphAdapter`
3. `ExecutionAdapter`
4. `RuntimeEventAdapter`
5. `AdapterCapabilitySnapshot`

## Rules

1. 合同只定义输入输出、能力等级和失败语义，不绑定具体实现形态。
2. 任一合同都允许 `CLI Adapter`、`FFI Adapter`、`Cloud Adapter` 三种实现。
3. `styio-view` 主线只依赖这里的合同，不依赖 `styio` 或 `spio` 的内部目录、类名或私有 ABI。
4. 上游缺能力时，不降低产品语义；把缺口记录到 `../for-styio/` 或 `../for-spio/`。
5. 这些合同是前端侧需求声明，不是对上游内部实现的规划文档。
