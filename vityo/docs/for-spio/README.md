# For Spio Docs

**Purpose:** 集中维护 `styio-view` 需要上游 `spio` 提供、确认或共同定义的 machine contract；凡是会影响项目图、toolchain、workflow success payload、registry/package 状态的内容，统一收在这里。

**Last updated:** 2026-04-12

## Scope

这里的文档只回答一个问题：

`styio-view` 还需要 `spio` 提供什么，双方如何对接。

## Entry Points

1. 目录索引：[INDEX.md](./INDEX.md)
2. 对接总览：[Spio-Integration-Overview.md](./Spio-Integration-Overview.md)
3. 项目图合同：[Spio-Project-Graph-Contract.md](./Spio-Project-Graph-Contract.md)
4. workflow success payload：[Spio-Workflow-Success-Payloads.md](./Spio-Workflow-Success-Payloads.md)
5. toolchain 与 registry 状态：[Spio-Toolchain-And-Registry-State.md](./Spio-Toolchain-And-Registry-State.md)

## Rules

1. 本目录只提 `styio-view` 需要的 machine handoff，不替 `spio` 规划内部实现。
2. 文档聚焦输入输出、稳定字段、能力等级和失败语义。
3. 只要 `spio` 能满足这里的 machine contract，具体内部设计由 `spio` 自己决定。
