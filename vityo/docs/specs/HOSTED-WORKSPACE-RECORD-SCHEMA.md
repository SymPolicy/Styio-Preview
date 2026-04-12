# Hosted Workspace Record Schema

**Purpose:** 冻结 `HostedWorkspaceRecord` 的最小合同，使 Web 路径、云执行平面和删除保留作业能够共享同一生命周期模型。

**Last updated:** 2026-04-12

**Status:** Draft schema baseline

## 1. 枚举

### 1.1 `status`

- `provisioning`
- `active`
- `closing`
- `pending_deletion`
- `deleted`

### 1.2 `exportState`

- `not_requested`
- `preparing`
- `ready`
- `expired`

## 2. Canonical Shape

`HostedWorkspaceRecord` 必须包含：

1. `workspaceId: string`
2. `schemaVersion: string`
3. `ownerRef: string`
4. `status: enum`
5. `entryUrl: string`
6. `createdAt: string`
7. `lastActiveAt: string`
8. `retentionDays: integer`
9. `exportState: enum`

## 3. 可选字段

1. `runtimeRef?: string`
2. `region?: string`
3. `closedAt?: string`
4. `retentionDeadline?: string`
5. `coreFileExportUrl?: string`
6. `coreFileExportExpiresAt?: string`
7. `warningAcknowledgedAt?: string`

## 4. 校验规则

1. `retentionDays` 首发默认值必须为 `7`。
2. `status=pending_deletion` 时，`closedAt` 与 `retentionDeadline` 必填。
3. `exportState=ready` 时，`coreFileExportUrl` 必填。
4. `status=deleted` 时，`entryUrl` 必须失效，不再提供 workspace 会话入口。
5. Web UI 在触发关闭前必须要求用户确认清空后果，并展示导出入口或导出准备状态。

## 5. 生命周期

1. `provisioning -> active`
2. `active -> closing`
3. `closing -> pending_deletion`
4. `pending_deletion -> deleted`

## 6. UI 必须可见的信息

1. 当前 `status`
2. 是否已进入 `pending_deletion`
3. `retentionDeadline`
4. `coreFileExportUrl` 或导出准备状态

## 7. 默认行为

1. Web 关闭 hosted workspace 后进入 `pending_deletion`。
2. 若用户未恢复或重新打开，系统在 `retentionDeadline` 后删除。
3. 导出链接应只面向核心文件，不要求导出整个云环境镜像。
