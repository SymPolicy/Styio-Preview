# Profile Sync Adapter Schema

**Purpose:** 冻结 `ProfileSyncAdapter` 的最小合同，使 prompt、theme 和偏好设置能够在可选同步组件存在时镜像到云端，而在缺席时保持本地可用。

**Last updated:** 2026-04-12

**Status:** Draft schema baseline

## 1. 设计原则

1. 本地 profile store 始终可用。
2. sync 组件是可插拔能力，不是主壳前提。
3. secrets 默认不进入 sync 通道。

## 2. 枚举

### 2.1 `mode`

- `local_only`
- `cloud_mirror`

### 2.2 `conflictPolicy`

- `local_authoritative`
- `manual_merge`

### 2.3 `transport`

- `none`
- `https_json`

## 3. Canonical Shape

`ProfileSyncAdapterSpec` 必须包含：

1. `adapterId: string`
2. `schemaVersion: string`
3. `displayName: string`
4. `moduleId: string`
5. `distributionPolicyRef: string`
6. `mode: enum`
7. `recordScopes: string[]`
8. `conflictPolicy: enum`
9. `transport: enum`
10. `syncTriggers: string[]`
11. `status: object`

## 4. 字段细化

### 4.1 `recordScopes`

首发允许：

1. `prompt_profiles`
2. `theme_profiles`
3. `provider_presets`
4. `workspace_preferences`

### 4.2 `syncTriggers`

首发允许：

1. `app_start`
2. `profile_save`
3. `manual_sync`

### 4.3 `status`

1. `lastSyncAt?: string`
2. `lastError?: string`
3. `remoteProfileId?: string`

### 4.4 云端配置

当 `transport=https_json` 时，允许：

1. `endpointBase: string`
2. `authMode: string`
3. `secretRef?: string`

## 5. 校验规则

1. `mode=local_only` 时，`transport` 必须为 `none`。
2. `mode=cloud_mirror` 时，`transport` 不能为 `none`。
3. `recordScopes` 不得为空。
4. 首发默认 `conflictPolicy=local_authoritative`。
5. provider API keys、token secret、local bridge credential 不得放入同步 payload。
6. 未挂载 adapter 或 adapter 离线时，本地 profile 读写不得失败。

## 6. 同步语义

1. `local_only`：只写本地，不产生远端写流。
2. `cloud_mirror`：本地为主，远端为镜像；冲突时按 `conflictPolicy` 处理。
3. `manual_merge` 首发只保留接口，不要求完整 UI。

## 7. Local Store Shape

`LocalProfileStore` 首发至少包含：

1. `promptProfiles`
2. `themeProfiles`
3. `providerPresets`
4. `workspacePreferences`

## 8. 默认值

1. `mode = local_only`
2. `conflictPolicy = local_authoritative`
3. `syncTriggers = [app_start, profile_save, manual_sync]`
