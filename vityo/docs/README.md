# Styio View Docs

**Purpose:** 定义 `docs/` 树的范围、入口和维护规则；具体主题分别由各目录下的 `README.md`、`INDEX.md` 和权威文档负责。

**Last updated:** 2026-04-12

## Tree Contract

1. 产品与系统级 SSOT 放在 `docs/design/`。
2. 协作规则、仓库边界、依赖与文档策略放在 `docs/specs/`。
3. 实施路线、工作流与跨阶段拆解放在 `docs/plans/`。
4. 冻结里程碑与任务清单放在 `docs/milestones/`。
5. 架构决策记录放在 `docs/adr/`。
6. 风险、冲突和待裁决问题放在 `docs/review/`。
7. 可复用测试/交付资产放在 `docs/assets/`。
8. 按日记录的演进历史放在 `docs/history/`。
9. `styio-view` 产品拥有的 adapter 合同放在 `docs/contracts/`。
10. 与上游 `styio` 的对接边界、接口合同和阻塞项放在 `docs/for-styio/`。
11. 与上游 `spio` 的项目图、toolchain 与 workflow handoff 放在 `docs/for-spio/`。

## Entry Points

1. 目录索引：[INDEX.md](./INDEX.md)
2. 产品规格：[design/Styio-View-Product-Spec.md](./design/Styio-View-Product-Spec.md)
3. 系统架构：[design/Styio-View-System-Architecture.md](./design/Styio-View-System-Architecture.md)
4. 文档策略：[specs/DOCUMENTATION-POLICY.md](./specs/DOCUMENTATION-POLICY.md)
5. 实施计划：[plans/Styio-View-Implementation-Plan.md](./plans/Styio-View-Implementation-Plan.md)
6. 里程碑入口：[milestones/INDEX.md](./milestones/INDEX.md)
7. ADR 入口：[adr/INDEX.md](./adr/INDEX.md)
8. 产品合同入口：[contracts/INDEX.md](./contracts/INDEX.md)
9. `styio` 对接入口：[for-styio/INDEX.md](./for-styio/INDEX.md)
10. `spio` 对接入口：[for-spio/INDEX.md](./for-spio/INDEX.md)

## Maintenance Rules

1. `README.md` 解释目录边界与维护方式。
2. `INDEX.md` 维护该目录内的人工索引。
3. 产品语义变化时，同批更新 `design/`、相关 ADR、对应里程碑和测试目录。
4. `styio-view` 的产品合同由本仓拥有；上游实现需适配这些合同，而不是反过来驱动前端退化。
5. 若实现边界与上游仓库当前实现冲突，先把 required handoff 记录到 `for-styio/` 或 `for-spio/`，再在本仓 ADR 中记录适配决策。
