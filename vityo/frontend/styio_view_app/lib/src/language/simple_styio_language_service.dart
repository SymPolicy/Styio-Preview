import '../editor/document_state.dart';
import 'language_contract.dart';
import 'styio_language_service.dart';

class SimpleStyioLanguageService implements StyioLanguageService {
  const SimpleStyioLanguageService();

  static const Set<String> _keywords = {
    'fn',
    'let',
    'pipeline',
    'state',
    'when',
    'emit',
    'spawn',
    'sync',
  };

  static const Set<String> _operatorLexemes = {
    '->',
    '|>',
    '<-',
    '=>',
    '=',
  };

  @override
  StyioDocumentAnalysis analyzeDocument(DocumentState document) {
    final tokenSpans = _tokenize(document.text);
    final semanticSpans = _resolveSemanticSpans(tokenSpans);
    final diagnostics = _lintDocument(document.text, tokenSpans);
    final formattingEdits = formatDocument(document);
    final semanticBlocks = _resolveSemanticBlocks(document.text, tokenSpans);

    return StyioDocumentAnalysis(
      tokenSpans: tokenSpans,
      semanticSpans: semanticSpans,
      diagnostics: diagnostics,
      formattingEdits: formattingEdits,
      semanticBlocks: semanticBlocks,
    );
  }

  @override
  List<FormattingEdit> formatDocument(DocumentState document) {
    final original = document.text;
    final normalizedLines = original
        .split('\n')
        .map((line) => line.replaceFirst(RegExp(r'\s+$'), ''))
        .toList(growable: false);
    final normalized = normalizedLines.join('\n');

    if (normalized == original) {
      return const <FormattingEdit>[];
    }

    return [
      FormattingEdit(
        range: SourceRange(start: 0, end: original.length),
        newText: normalized,
      ),
    ];
  }

  @override
  List<CompletionItem> completeAt(DocumentState document, int offset) {
    final token = _tokenAt(document.text, offset);
    final seed = token?.lexeme ?? '';

    final items = <CompletionItem>[
      const CompletionItem(
        label: 'fn',
        kind: CompletionItemKind.keyword,
        insertText: 'fn ',
        detail: 'Declare a function.',
      ),
      const CompletionItem(
        label: 'pipeline',
        kind: CompletionItemKind.keyword,
        insertText: 'pipeline ',
        detail: 'Declare a pipeline.',
      ),
      const CompletionItem(
        label: 'state',
        kind: CompletionItemKind.keyword,
        insertText: 'state ',
        detail: 'Declare a state.',
      ),
      const CompletionItem(
        label: 'emit',
        kind: CompletionItemKind.keyword,
        insertText: 'emit ',
        detail: 'Emit a value.',
      ),
      const CompletionItem(
        label: 'when',
        kind: CompletionItemKind.snippet,
        insertText: 'when condition -> state next_state',
        detail: 'State transition snippet.',
      ),
    ];

    if (seed.isEmpty || token == null || token.kind == TokenKind.keyword) {
      return items;
    }

    return items
        .where(
          (item) =>
              item.label.startsWith(seed) || item.insertText.startsWith(seed),
        )
        .toList(growable: false);
  }

  @override
  HoverPayload? hoverAt(DocumentState document, int offset) {
    final token = _tokenAt(document.text, offset);
    if (token == null) {
      return null;
    }

    if (token.kind == TokenKind.keyword) {
      return HoverPayload(
        range: token.range,
        markdown: 'Keyword `${token.lexeme}` in Styio source.',
      );
    }

    if (_operatorLexemes.contains(token.lexeme)) {
      return HoverPayload(
        range: token.range,
        markdown:
            'Operator `${token.lexeme}` is rendered by the display layer only.',
      );
    }

    if (token.kind == TokenKind.identifier) {
      return HoverPayload(
        range: token.range,
        markdown: 'Identifier `${token.lexeme}`.',
      );
    }

    return null;
  }

  @override
  List<DiagnosticQuickFix> quickFixesForDiagnostic(
    DocumentState document,
    Diagnostic diagnostic,
  ) {
    switch (diagnostic.code) {
      case 'missing-assignment':
        final lineText = document.text.substring(
          diagnostic.range.start,
          diagnostic.range.end,
        );
        final trimmedLine = lineText.replaceFirst(RegExp(r'\s+$'), '');
        final insertionOffset = diagnostic.range.start + trimmedLine.length;
        return [
          DiagnosticQuickFix(
            label: 'Insert assignment',
            detail: 'Append ` = value` to the declaration.',
            edits: [
              FormattingEdit(
                range: SourceRange(
                  start: insertionOffset,
                  end: insertionOffset,
                ),
                newText: ' = value',
              ),
            ],
          ),
        ];
      case 'unexpected-closing-brace':
        return [
          DiagnosticQuickFix(
            label: 'Remove stray brace',
            detail: 'Delete the unmatched closing brace.',
            edits: [
              FormattingEdit(
                range: diagnostic.range,
                newText: '',
              ),
            ],
          ),
        ];
      case 'unclosed-block':
        final suffix = document.text.endsWith('\n') ? '}' : '\n}';
        return [
          DiagnosticQuickFix(
            label: 'Append closing brace',
            detail: 'Insert a matching `}` at the end of the document.',
            edits: [
              FormattingEdit(
                range: SourceRange(
                  start: document.length,
                  end: document.length,
                ),
                newText: suffix,
              ),
            ],
          ),
        ];
    }

    return const <DiagnosticQuickFix>[];
  }

  List<TokenSpan> _tokenize(String source) {
    final tokens = <TokenSpan>[];
    var index = 0;

    while (index < source.length) {
      final char = source[index];

      if (_isWhitespace(char)) {
        final start = index;
        while (index < source.length && _isWhitespace(source[index])) {
          index += 1;
        }
        tokens.add(
          TokenSpan(
            range: SourceRange(start: start, end: index),
            kind: TokenKind.whitespace,
            lexeme: source.substring(start, index),
          ),
        );
        continue;
      }

      if (_startsWith(source, index, '//')) {
        final start = index;
        while (index < source.length && source[index] != '\n') {
          index += 1;
        }
        tokens.add(
          TokenSpan(
            range: SourceRange(start: start, end: index),
            kind: TokenKind.comment,
            lexeme: source.substring(start, index),
          ),
        );
        continue;
      }

      if (_isQuote(char)) {
        final start = index;
        index += 1;
        while (index < source.length && source[index] != '"') {
          if (source[index] == '\\' && index + 1 < source.length) {
            index += 2;
          } else {
            index += 1;
          }
        }
        if (index < source.length) {
          index += 1;
        }
        tokens.add(
          TokenSpan(
            range: SourceRange(start: start, end: index),
            kind: TokenKind.string,
            lexeme: source.substring(start, index),
          ),
        );
        continue;
      }

      final operator = _matchOperator(source, index);
      if (operator != null) {
        tokens.add(
          TokenSpan(
            range: SourceRange(start: index, end: index + operator.length),
            kind: TokenKind.operator,
            lexeme: operator,
          ),
        );
        index += operator.length;
        continue;
      }

      if (_isPunctuation(char)) {
        tokens.add(
          TokenSpan(
            range: SourceRange(start: index, end: index + 1),
            kind: TokenKind.punctuation,
            lexeme: char,
          ),
        );
        index += 1;
        continue;
      }

      if (_isDigit(char)) {
        final start = index;
        while (index < source.length && _isDigit(source[index])) {
          index += 1;
        }
        tokens.add(
          TokenSpan(
            range: SourceRange(start: start, end: index),
            kind: TokenKind.number,
            lexeme: source.substring(start, index),
          ),
        );
        continue;
      }

      if (_isIdentifierStart(char)) {
        final start = index;
        while (index < source.length && _isIdentifierPart(source[index])) {
          index += 1;
        }
        final lexeme = source.substring(start, index);
        tokens.add(
          TokenSpan(
            range: SourceRange(start: start, end: index),
            kind: _keywords.contains(lexeme)
                ? TokenKind.keyword
                : TokenKind.identifier,
            lexeme: lexeme,
          ),
        );
        continue;
      }

      tokens.add(
        TokenSpan(
          range: SourceRange(start: index, end: index + 1),
          kind: TokenKind.unknown,
          lexeme: char,
        ),
      );
      index += 1;
    }

    return tokens;
  }

  List<SemanticSpan> _resolveSemanticSpans(List<TokenSpan> tokens) {
    final spans = <SemanticSpan>[];

    for (var index = 0; index < tokens.length; index += 1) {
      final token = tokens[index];
      if (token.kind != TokenKind.keyword) {
        continue;
      }

      final nextIdentifier = _nextTokenOfKind(
        tokens,
        startIndex: index + 1,
        kind: TokenKind.identifier,
      );

      switch (token.lexeme) {
        case 'fn':
          if (nextIdentifier != null) {
            spans.add(
              SemanticSpan(
                range: nextIdentifier.range,
                kind: SemanticKind.function,
              ),
            );
          }
          break;
        case 'pipeline':
          if (nextIdentifier != null) {
            spans.add(
              SemanticSpan(
                range: nextIdentifier.range,
                kind: SemanticKind.pipeline,
              ),
            );
          }
          break;
        case 'state':
          if (nextIdentifier != null) {
            spans.add(
              SemanticSpan(
                range: nextIdentifier.range,
                kind: SemanticKind.state,
              ),
            );
          }
          break;
        case 'let':
          if (nextIdentifier != null) {
            spans.add(
              SemanticSpan(
                range: nextIdentifier.range,
                kind: SemanticKind.variable,
              ),
            );
          }
          break;
        default:
          break;
      }
    }

    return spans;
  }

  List<Diagnostic> _lintDocument(String source, List<TokenSpan> tokens) {
    final diagnostics = <Diagnostic>[];
    final blockStack = <TokenSpan>[];

    for (final token in tokens) {
      if (token.kind != TokenKind.punctuation) {
        continue;
      }

      if (token.lexeme == '{') {
        blockStack.add(token);
      } else if (token.lexeme == '}') {
        if (blockStack.isEmpty) {
          diagnostics.add(
            Diagnostic(
              severity: DiagnosticSeverity.error,
              code: 'unexpected-closing-brace',
              message: 'Closing brace has no matching opening brace.',
              range: token.range,
            ),
          );
        } else {
          blockStack.removeLast();
        }
      }
    }

    for (final unclosed in blockStack) {
      diagnostics.add(
        Diagnostic(
          severity: DiagnosticSeverity.error,
          code: 'unclosed-block',
          message: 'Opening brace is missing a closing brace.',
          range: unclosed.range,
        ),
      );
    }

    final lines = source.split('\n');
    var lineStart = 0;
    for (final line in lines) {
      final trimmed = line.trimLeft();
      if (trimmed.startsWith('let ') && !line.contains('=')) {
        diagnostics.add(
          Diagnostic(
            severity: DiagnosticSeverity.warning,
            code: 'missing-assignment',
            message: 'Variable declaration is missing `=`.',
            range: SourceRange(
              start: lineStart,
              end: lineStart + line.length,
            ),
          ),
        );
      }
      lineStart += line.length + 1;
    }

    return diagnostics;
  }

  List<SemanticBlockRange> _resolveSemanticBlocks(
    String source,
    List<TokenSpan> tokens,
  ) {
    final blocks = <SemanticBlockRange>[];

    for (var index = 0; index < tokens.length; index += 1) {
      final token = tokens[index];
      if (token.kind != TokenKind.keyword || token.lexeme != 'fn') {
        continue;
      }

      final functionName = _nextTokenOfKind(
        tokens,
        startIndex: index + 1,
        kind: TokenKind.identifier,
      );
      final openingBrace = _nextTokenByLexeme(
        tokens,
        startIndex: index + 1,
        lexeme: '{',
      );

      if (openingBrace == null) {
        continue;
      }

      final closingBrace = _matchingClosingBrace(tokens, openingBrace);
      if (closingBrace == null) {
        continue;
      }

      blocks.add(
        SemanticBlockRange(
          range: SourceRange(
            start: openingBrace.range.start,
            end: closingBrace.range.end,
          ),
          label: functionName?.lexeme ?? 'function_block',
        ),
      );
    }

    return blocks;
  }

  TokenSpan? _tokenAt(String source, int offset) {
    final safeOffset = offset.clamp(0, source.length);
    for (final token in _tokenize(source)) {
      if (token.range.contains(safeOffset)) {
        return token;
      }
    }
    return null;
  }

  TokenSpan? _nextTokenOfKind(
    List<TokenSpan> tokens, {
    required int startIndex,
    required TokenKind kind,
  }) {
    for (var index = startIndex; index < tokens.length; index += 1) {
      final token = tokens[index];
      if (token.kind == TokenKind.whitespace ||
          token.kind == TokenKind.comment) {
        continue;
      }
      if (token.kind == kind) {
        return token;
      }
      return null;
    }
    return null;
  }

  TokenSpan? _nextTokenByLexeme(
    List<TokenSpan> tokens, {
    required int startIndex,
    required String lexeme,
  }) {
    for (var index = startIndex; index < tokens.length; index += 1) {
      final token = tokens[index];
      if (token.kind == TokenKind.whitespace ||
          token.kind == TokenKind.comment) {
        continue;
      }
      if (token.lexeme == lexeme) {
        return token;
      }
    }
    return null;
  }

  TokenSpan? _matchingClosingBrace(
    List<TokenSpan> tokens,
    TokenSpan openingBrace,
  ) {
    var depth = 0;
    var seenOpening = false;

    for (final token in tokens) {
      if (token.range.start < openingBrace.range.start) {
        continue;
      }

      if (token.kind != TokenKind.punctuation) {
        continue;
      }

      if (token.lexeme == '{') {
        depth += 1;
        seenOpening = true;
      } else if (token.lexeme == '}') {
        depth -= 1;
        if (seenOpening && depth == 0) {
          return token;
        }
      }
    }

    return null;
  }

  String? _matchOperator(String source, int index) {
    const orderedOperators = ['|>', '->', '<-', '=>', '='];
    for (final operator in orderedOperators) {
      if (_startsWith(source, index, operator)) {
        return operator;
      }
    }
    return null;
  }

  bool _startsWith(String source, int start, String value) {
    if (start + value.length > source.length) {
      return false;
    }
    return source.substring(start, start + value.length) == value;
  }

  bool _isWhitespace(String char) {
    return char == ' ' || char == '\n' || char == '\t' || char == '\r';
  }

  bool _isIdentifierStart(String char) {
    final code = char.codeUnitAt(0);
    return (code >= 65 && code <= 90) ||
        (code >= 97 && code <= 122) ||
        char == '_';
  }

  bool _isIdentifierPart(String char) {
    return _isIdentifierStart(char) || _isDigit(char);
  }

  bool _isDigit(String char) {
    final code = char.codeUnitAt(0);
    return code >= 48 && code <= 57;
  }

  bool _isQuote(String char) {
    return char == '"';
  }

  bool _isPunctuation(String char) {
    return '{}()[],:;'.contains(char);
  }
}
