# Next Stage Gap Ledger

**Purpose:** 压缩记录 `styio-view` 仍与三仓统一文件治理基线存在的活跃缺口，确保治理债务能以 checkpoint 大小推进，而不是继续靠人工兜底。

**Last updated:** 2026-04-17

## Active Gaps

1. `FG4`: 保持 `check_repo_hygiene.py`、root `.gitignore` 和 shared mirror 计划同步，避免后续 checkpoint 又退回 repo-specific 漂移。
2. `FG4`: 若未来要在 `docs/**` 与 `frontend/styio_view_app/test/**` 之外追踪 temp/build 风格 repro 资产，必须先扩显式 negate 规则与 gate。

## Exit Condition

当 `styio-view` 具备以下能力时，这个 ledger 可以转入维护态：

1. `active/history/archive` 生命周期清晰，
2. docs 索引和 lifecycle 可脚本校验，
3. repo hygiene 会显式发现 docs/file governance 漂移。
