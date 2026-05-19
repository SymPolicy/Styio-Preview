# Distribution Channel Policy Schema

**Purpose:** 冻结 `DistributionChannelPolicy` 的最小合同，使模块宿主能判断某模块如何分发、能否 staged update、以及是否属于 `iOS-safe`。

**Last updated:** 2026-04-12

**Status:** Draft schema baseline

## 1. 枚举

### 1.1 `channel`

- `self_hosted`
- `app_store`
- `hosted_web`

### 1.2 `deliveryMode`

- `staged_module_update`
- `store_bundled_only`
- `hosted_service`

## 2. Canonical Shape

`DistributionChannelPolicy` 必须包含：

1. `policyId: string`
2. `schemaVersion: string`
3. `channel: enum`
4. `deliveryMode: enum`
5. `platforms: string[]`
6. `requiresStoreReview: boolean`
7. `iosSafe: boolean`
8. `allowsStagedUpdate: boolean`
9. `allowsBinarySideLoad: boolean`
10. `minimumHostVersion?: string`

## 3. 首发标准 policy

### 3.1 `desktop_self_hosted`

1. `channel=self_hosted`
2. `deliveryMode=staged_module_update`
3. `platforms=[macos, windows, linux]`
4. `requiresStoreReview=false`
5. `iosSafe=false`
6. `allowsStagedUpdate=true`
7. `allowsBinarySideLoad=true`

### 3.2 `android_self_hosted`

1. `channel=self_hosted`
2. `deliveryMode=staged_module_update`
3. `platforms=[android]`
4. `requiresStoreReview=false`
5. `iosSafe=false`
6. `allowsStagedUpdate=true`
7. `allowsBinarySideLoad=true`

### 3.3 `ios_store_bundled_only`

1. `channel=app_store`
2. `deliveryMode=store_bundled_only`
3. `platforms=[ios]`
4. `requiresStoreReview=true`
5. `iosSafe=true`
6. `allowsStagedUpdate=false`
7. `allowsBinarySideLoad=false`

### 3.4 `web_hosted_service`

1. `channel=hosted_web`
2. `deliveryMode=hosted_service`
3. `platforms=[web]`
4. `requiresStoreReview=false`
5. `iosSafe=false`
6. `allowsStagedUpdate=true`
7. `allowsBinarySideLoad=false`

## 4. 校验规则

1. `channel=app_store` 时，`platforms` 只能包含 `ios`。
2. `channel=app_store` 时，`requiresStoreReview=true`、`allowsBinarySideLoad=false`、`deliveryMode=store_bundled_only`。
3. `iosSafe=true` 的模块必须绑定 `channel=app_store` 或显式声明 `hosted_service` 且不在本地执行代码。
4. `hosted_web` 只允许 Web 宿主消费。
5. `allowsStagedUpdate=false` 的 policy 不得为本地可执行模块提供会话后 staged update 路径。

## 5. 绑定规则

1. 每个 `ModuleManifest` 必须引用一个 `distributionPolicyRef`。
2. `ModuleCapabilityMatrix` 先判平台支持，再判 `DistributionChannelPolicy`。
3. iOS 宿主只允许挂载 `iosSafe=true` 的模块。
