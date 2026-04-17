# Current State

**Purpose:** 提供 `styio-view` 当前治理和产品主线的压缩入口；优先给出当前文件治理状态、主线推进状态和下一个治理 checkpoint。

**Last updated:** 2026-04-17

## Summary

1. `styio-view` 已补齐 `archive/rollups`、docs index/audit/lifecycle，并把它们接进了现有 hygiene gate。
2. 根 `.gitignore` 与 `scripts/check_repo_hygiene.py` 现在已经对齐 shared file-governance baseline，`docs/**` 与 `frontend/styio_view_app/test/**` 的 temp/build 风格 tracked fixture 也有显式 negate 规则。
3. 当前活跃治理 checkpoint 是 `FG4`：维持这套 baseline，不让 `view` 再退回人工维护或 repo-specific 例外。
4. 产品主线仍以 adapter、project/execution/environment shell 和上游 contract 消费为先，页面润色继续后置。

## Read Order

1. `NEXT-STAGE-GAP-LEDGER.md`
2. `../plans/Styio-Ecosystem-File-Governance-Alignment-Plan.md`
3. `../plans/Styio-View-Implementation-Plan.md`
4. `../specs/DOCUMENTATION-POLICY.md`
5. `../teams/DOCS-DELIVERY-RUNBOOK.md`

## Recovery Baseline

```bash
python3 scripts/docs-lifecycle.py refresh
python3 scripts/docs-index.py --write
python3 scripts/docs-audit.py
python3 scripts/check_repo_hygiene.py
```
