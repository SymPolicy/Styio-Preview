# Adapter / Contracts Runbook

**Purpose:** 提供 adapter 合同、integration 层以及上游 `styio` / `spio` handoff 文档的日常维护入口。

**Last updated:** 2026-04-19

## Mission

负责 `styio-view` 自己拥有的 adapter 合同、integration layer 以及对上游的 required handoff。该团队不规划上游内部实现，也不降低前端产品语义去适配临时实现。

## Owned Surface

Primary paths:

1. `frontend/styio_view_app/lib/src/integration/`
2. `docs/contracts/`
3. `docs/for-styio/`
4. `docs/for-spio/`
5. `docs/specs/AGENT-PROVIDER-ADAPTER-SCHEMA.md`
6. `docs/specs/PROFILE-SYNC-ADAPTER-SCHEMA.md`
7. `docs/specs/HOSTED-WORKSPACE-RECORD-SCHEMA.md`

Key SSOTs:

1. `Contracts README -> ../contracts/README.md`
2. `For Styio README -> ../for-styio/README.md`
3. `For Spio README -> ../for-spio/README.md`
4. `仓库边界 -> ../specs/REPOSITORY-MAP.md`

## Daily Workflow

1. 先判断当前变更属于产品自有合同、对上游的 handoff，还是 integration layer 的消费适配。
2. 合同变化先改 `docs/contracts/` 或对应 schema，再改消费层和测试目录映射。
3. 上游缺能力时，把缺口记在 `for-styio/` 或 `for-spio/`，不要直接在前端层静默降级产品语义。
4. 若 contract 与既有计划或实现冲突，先显式指出冲突，再改文档和代码。
5. integration 层的卫生修复如果改变了 workflow selection、runtime event replay、hosted payload 解码、overlay 文件系统枚举覆盖或 Web-only hosted shim，也要同步记录到本 runbook 或对应合同文档，避免代码表面和交接说明漂移。

## Change Classes

1. Small: 合同说明补全、integration 层局部适配或 handoff 文案清理。更新相应索引。
2. Medium: schema 字段、adapter failure 语义、capability snapshot、payload parser、project workflow selection 或 runtime event surface 变化。补测试目录映射。
3. High: 主合同分层、责任边界、上游 handoff 模式或 hosted workspace 生命周期变化。走协调 review 并补 ADR。

## Required Gates

Minimum:

```bash
cd frontend/styio_view_app && flutter analyze && flutter test
python3 scripts/check_repo_hygiene.py
```

## Cross-Team Dependencies

1. Shell / Editor、Runtime / Agent、Module / Platform 都必须 review 自己消费到的合同变化。
2. Docs / Delivery 必须 review 任何 handoff、里程碑和测试目录映射更新。
3. Theme / UX 在 contract 影响展示层时应共同 review。
4. 若合同变化涉及长期架构边界，必须同步 ADR。

## Handoff / Recovery

Record:

1. 变更的是哪类合同或 handoff 文档。
2. 哪些消费团队已经适配，哪些还未适配。
3. 已补的 schema、计划、测试目录条目。
4. 仍待上游确认的缺口与下一步动作。
