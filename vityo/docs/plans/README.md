# Plans Docs

**Purpose:** 定义 `docs/plans/` 中跨里程碑实施计划的范围；具体计划索引见 [INDEX.md](./INDEX.md)。

**Last updated:** 2026-04-17

## Scope

1. 记录跨阶段工作流、依赖链、实施顺序和回退策略。
2. 计划不是产品 SSOT；若与 `docs/design/` 冲突，应先更新设计文档或 ADR。
3. 跨三仓总纲以 `styio-nightly/docs/plans/Styio-Ecosystem-Delivery-Master-Plan.md` 为权威源，本目录只保留 `styio-view` 镜像和本仓拆解。
4. 跨三仓文件治理对齐以 `styio-nightly/docs/plans/Styio-Ecosystem-File-Governance-Alignment-Plan.md` 为权威源，本目录保留本仓镜像。
5. 若一次变更影响三仓共同里程碑、repo exit 或 checkpoint ID，先更新 `Styio-Ecosystem-Delivery-Master-Plan.md` 镜像，再更新 `Styio-View-Implementation-Plan.md`。
6. 若一次变更影响 docs tree、索引、lifecycle、ignore-policy 或 fixture 反忽略规则，先更新 `Styio-Ecosystem-File-Governance-Alignment-Plan.md` 镜像，再更新本仓文档策略和 runbook。
