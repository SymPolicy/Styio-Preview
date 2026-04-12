# RuntimeEventAdapter

**Purpose:** 冻结 runtime surface、debug console 和后续状态机图消费的统一事件壳。

**Last updated:** 2026-04-12

## 1. Envelope Contract

### `RuntimeEventEnvelope`

1. `schemaVersion`
2. `sessionId`
3. `sequence`
4. `timestamp`
5. `eventKind`
6. `origin`
7. `payload`

## 2. First Required Event Families

1. `compile.*`
2. `run.*`
3. `thread.*`
4. `unit.*`
5. `state.*`
6. `transition.fired`
7. `log.emitted`
8. `diagnostic.emitted`

## 3. Non-Negotiable Rules

1. 事件必须有稳定顺序。
2. 未识别 event kind 只能降级显示，不能把 UI 打崩。
3. runtime graph、thread lanes、debug console 必须都来自同一条 event stream，而不是多条彼此不一致的输出。
