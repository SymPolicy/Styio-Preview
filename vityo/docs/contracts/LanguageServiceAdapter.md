# LanguageServiceAdapter

**Purpose:** 冻结 `styio-view` 需要的语言层结果；任何上游实现只要满足本合同，就能驱动当前编辑器语义。

**Last updated:** 2026-04-12

## 1. Responsibilities

`LanguageServiceAdapter` 必须提供：

1. `tokens[]`
2. `semanticSpans[]`
3. `diagnostics[]`
4. `quickFixes[]`
5. `formattingEdits[]`
6. `completionItems[]`
7. `hover`
8. `semanticBlocks[]`

## 2. Snapshot Contract

### 2.1 `LanguageServiceSnapshot`

1. `documentId`
2. `revision`
3. `tokens[]`
4. `semanticSpans[]`
5. `diagnostics[]`
6. `formattingEdits[]`
7. `completionItems[]`
8. `hover`
9. `semanticBlocks[]`

### 2.2 Required Types

1. `TokenSpan { range, kind, lexeme }`
2. `SemanticSpan { range, kind, modifiers[] }`
3. `Diagnostic { severity, code, message, range }`
4. `DiagnosticQuickFix { label, detail, edits[] }`
5. `FormattingEdit { range, newText }`
6. `CompletionItem { label, kind, insertText, detail }`
7. `HoverPayload { range, markdown }`
8. `SemanticBlockRange { range, label }`

## 3. Non-Negotiable Rules

1. 基础高亮由 `TokenSpan` 与 `SemanticSpan` 驱动，不由 linter 决定。
2. diagnostics 必须带 source range，不能只返回纯文本消息。
3. quick fix 和 formatting 必须返回补丁，不直接修改前端 buffer。
4. semantic block ranges 必须能驱动函数体灰底圆角块，不要求前端猜测结构。

## 4. Adapter Modes

允许三种实现：

1. `CLI Adapter`
2. `FFI Adapter`
3. `Cloud Adapter`

只要 snapshot shape 一致，`styio-view` 不关心实现方式。
