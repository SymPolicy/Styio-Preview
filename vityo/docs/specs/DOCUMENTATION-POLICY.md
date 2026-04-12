# Styio View Documentation Policy

**Purpose:** 定义 `styio-view` 的文档目录、单一事实来源、联动更新规则与最小维护要求；产品行为与系统边界分别以 `docs/design/` 中的权威文档为准。

**Last updated:** 2026-04-12

## 0. 文档维护准则

### 0.1 Top-Level `Purpose`

每个 `docs/**/*.md` 文件必须在标题附近给出顶层 `Purpose:` 行，说明该文档何时使用、拥有何种边界。

### 0.2 最小重复原则

1. 同一主题的长篇事实解释只保留一个 SSOT。
2. 其它文档只保留摘要和链接，不复写完整规则。
3. 如同一主题在三处及以上文档出现实质性重复，必须指定唯一权威并删改重复内容。

### 0.3 常见 SSOT 速查

| 主题 | 权威文档 | 其它文档应 |
|------|----------|------------|
| 产品定位、术语、不变量、功能域 | `../design/Styio-View-Product-Spec.md` | 链接或一段摘要 |
| 系统层次、数据流、执行后端 | `../design/Styio-View-System-Architecture.md` | 链接 |
| 仓库职责边界 | `REPOSITORY-MAP.md` | 链接 |
| 文档目录与更新规则 | `DOCUMENTATION-POLICY.md` | 链接 |
| 人机协作、变更批处理要求 | `CONTRIBUTOR-AND-AGENT-SPEC.md` | 链接 |
| 第三方依赖清单 | `THIRD-PARTY.md` | 与实现同步更新 |
| 跨工作流实施计划 | `../plans/Styio-View-Implementation-Plan.md` | 链接 |
| `styio` 对接边界与接口合同 | `../for-styio/` | 链接 |
| 冻结里程碑与任务清单 | `../milestones/<YYYY-MM-DD>/00-Milestone-Index.md` | 链接 |
| 测试与验收映射 | `../assets/workflow/TEST-CATALOG.md` | 链接 |
| 架构裁决 | `../adr/` | 只保留决策摘要 |
| 未决风险与冲突 | `../review/Logic-Conflicts.md` | 链接 |

### 0.4 文档状态

1. `docs/design/` 是产品和系统级 SSOT。
2. `docs/plans/` 是实施路线，不可覆盖设计边界。
3. `docs/milestones/` 是冻结批次；后续若要变更，新增日期目录，不覆盖原批次结论。
4. `docs/review/` 中的未决问题一旦裁决，应迁入 ADR 并在 review 文档中回填链接。

## 1. 目录职责

| 路径 | 存放内容 |
|------|----------|
| `docs/design/` | 产品规格、系统架构、核心术语、不变量 |
| `docs/specs/` | 文档策略、仓库边界、协作规范、依赖清单 |
| `docs/plans/` | 跨里程碑实施计划与工作流 |
| `docs/milestones/` | 冻结的阶段目标、任务表与门禁 |
| `docs/adr/` | 架构决策记录 |
| `docs/review/` | 风险、冲突、待裁决问题 |
| `docs/assets/` | 测试目录、复用交付资产 |
| `docs/history/` | 按日记录与恢复信息 |
| `docs/for-styio/` | 与上游 `styio` 的接口、责任边界与对接清单 |

## 2. 联动更新规则

1. 变更产品语义或交互规则时，至少检查：
   - `design/Styio-View-Product-Spec.md`
   - `design/Styio-View-System-Architecture.md`
   - 相关 ADR
   - 对应里程碑文件
   - `assets/workflow/TEST-CATALOG.md`
2. 新增或替换依赖时，必须同步更新 `THIRD-PARTY.md`。
3. 新增一个长期架构边界时，必须新增 ADR，不能只写在计划或里程碑里。
4. 新增一个重要风险但尚未裁决时，先写入 `review/Logic-Conflicts.md`。

## 3. 文件命名规则

1. 设计级文档使用稳定主题名，优先 `Styio-View-*.md`。
2. 规范文件使用稳定全大写或描述性短横线命名。
3. 计划文件优先 `<Topic>-Plan.md` 或 `<Topic>-Implementation-Plan.md`。
4. 历史文件严格使用 `YYYY-MM-DD.md`。
5. ADR 文件严格使用 `ADR-XXXX-<slug>.md`。
6. 里程碑目录严格使用日期，入口文件为 `00-Milestone-Index.md`。

## 4. 当前最低维护门禁

1. 新文档必须带 `Purpose` 与 `Last updated`。
2. 每次结构变更必须更新对应目录的 `INDEX.md`。
3. 产品语义变化必须能在里程碑和测试目录中找到映射。
4. 任何实现如果违反已接受 ADR，必须先新增替代 ADR 或回滚计划。
