# Docs / Delivery Runbook

**Purpose:** 提供 `styio-view` 文档树、里程碑、history、repo hygiene 与交付文档的日常维护入口。

**Last updated:** 2026-04-17

## Mission

负责 docs 树结构、README/INDEX 接线、里程碑与 history 记录、review 队列和 repo hygiene 文档纪律。该团队不替 feature owner 决定产品语义或合同内容，但负责确保这些内容被放在正确的 owner 文档里。

## Owned Surface

Primary paths:

1. `README.md`
2. `docs/`
3. `scripts/check_repo_hygiene.py`
4. `scripts/docs-index.py`
5. `scripts/docs-lifecycle.py`
6. `scripts/docs-audit.py`
7. `prototype/README.md`
8. `frontend/styio_view_app/README.md`

Key SSOTs:

1. `文档策略 -> ../specs/DOCUMENTATION-POLICY.md`
2. `人机协作规范 -> ../specs/CONTRIBUTOR-AND-AGENT-SPEC.md`
3. `测试目录 -> ../assets/workflow/TEST-CATALOG.md`
4. `文件治理镜像 -> ../plans/Styio-Ecosystem-File-Governance-Alignment-Plan.md`
5. `当前状态摘要 -> ../rollups/CURRENT-STATE.md`

## Daily Workflow

1. 先判断当前变化属于 owner 文档变化，还是目录/索引/交付接线变化。
2. 任何结构性文档变更，都要同步更新对应目录的 `README.md` 和 `INDEX.md`。
3. 若一次变更改变了团队边界、review 路由或 handoff 路径，同批更新 `docs/teams/`。
4. 中断时把恢复信息写入 `docs/history/YYYY-MM-DD.md`，不要只留在聊天或注释里。
5. docs tree 变化时，同批运行 `docs-lifecycle.py`、`docs-index.py`、`docs-audit.py`，而不是只靠 `README/INDEX` 手工刷新。
6. 根 `.gitignore` 若新增 temp/build/log/cache 类忽略规则，同批补 `docs/**` 与 `frontend/styio_view_app/test/**` 的显式 negate 规则，并让 `scripts/check_repo_hygiene.py` 通过。

## Change Classes

1. Small: 链接修复、索引补全、history 补记或局部文案整理。运行 repo hygiene。
2. Medium: docs 树结构、里程碑映射、测试目录映射、archive/rollup lifecycle 或 handoff 路径变化。同步相关入口文档和 docs 自动化脚本。
3. High: owner 文档迁移、文档策略重构、团队边界调整或交付纪律变化。走协调 review。

## Required Gates

Minimum:

```bash
python3 scripts/docs-audit.py
python3 scripts/check_repo_hygiene.py
```

`scripts/check_repo_hygiene.py` 现在同时负责：

1. 构建/依赖产物与意外二进制拦截；
2. shared `.gitignore` baseline 与 fixture negate 规则检查；
3. docs/file governance 关键脚本接线检查。

## Cross-Team Dependencies

1. 每个 feature 团队都必须 review 会改变其工作流的文档结构变化。
2. Adapter / Contracts 必须 review handoff 和 contract owner 文档的接线变化。
3. Theme / UX 必须 review 会影响 handbook 或视觉基线记录的文档更新。
4. Shell / Editor、Runtime / Agent、Module / Platform 必须各自确认里程碑和测试目录映射没有失真。

## Handoff / Recovery

Record:

1. 更新了哪些 owner 文档、README、INDEX 或 history。
2. 还有哪些目录需要补索引或交付接线。
3. 这批交付影响了哪些 team runbook。
4. 下一个恢复点和需要继续确认的 owner 团队。
