# Spio Toolchain And Registry State

**Purpose:** 冻结 `styio-view` 对 `spio` toolchain、registry 和 package 状态的 handoff 要求。

**Last updated:** 2026-04-12

## 1. Toolchain State

至少需要：

1. installed compilers
2. current compiler
3. project pin
4. compatibility result
5. source of resolution

## 2. Registry And Package State

至少需要：

1. package metadata
2. registry source status
3. publish preflight result
4. fetch/vendor result
5. pack/publish result summary

## 3. Rules

1. `styio-view` 不通过私有目录推断 registry 状态。
2. publish preflight 必须可单独消费，用于在 UI 中提前显示阻塞项。
3. package/registry contract 最终也必须能落到 `CLI / FFI / Cloud` 三类 adapter 之一。
