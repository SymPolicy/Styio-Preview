import 'package:flutter/foundation.dart';

import 'document_state.dart';
import 'editor_render_layers.dart';
import '../language/language_contract.dart';
import '../language/styio_language_service.dart';
import 'selection_state.dart';

class EditorSessionController extends ChangeNotifier {
  EditorSessionController({
    required DocumentState initialDocument,
    required StyioLanguageService languageService,
    SelectionState? initialSelection,
    EditorRenderPlan? renderPlan,
  })  : _document = initialDocument,
        _languageService = languageService,
        _selection = initialSelection ??
            SelectionState.collapsed(initialDocument.length),
        _renderPlan = renderPlan ?? EditorRenderPlan.foundation(),
        _analysis = languageService.analyzeDocument(initialDocument);

  final List<_EditorSnapshot> _undoStack = <_EditorSnapshot>[];
  final List<_EditorSnapshot> _redoStack = <_EditorSnapshot>[];

  DocumentState _document;
  final StyioLanguageService _languageService;
  SelectionState _selection;
  final EditorRenderPlan _renderPlan;
  StyioDocumentAnalysis _analysis;

  DocumentState get document => _document;
  SelectionState get selection => _selection;
  EditorRenderPlan get renderPlan => _renderPlan;
  StyioDocumentAnalysis get analysis => _analysis;
  int get inspectionOffset =>
      selection.isCollapsed ? selection.end : selection.start;
  HoverPayload? get hoverAtSelection =>
      _languageService.hoverAt(_document, inspectionOffset);
  List<CompletionItem> get completionsAtSelection =>
      _languageService.completeAt(_document, inspectionOffset);
  TokenSpan? get tokenAtSelection => _tokenAroundOffset(inspectionOffset);
  SemanticKind? get semanticKindAtSelection {
    final token = tokenAtSelection;
    if (token == null) {
      return null;
    }

    for (final span in _analysis.semanticSpans) {
      if (span.range.intersects(token.range)) {
        return span.kind;
      }
    }
    return null;
  }

  List<Diagnostic> get diagnosticsAtSelectionToken {
    final token = tokenAtSelection;
    if (token == null) {
      return const <Diagnostic>[];
    }
    return _analysis.diagnostics
        .where((diagnostic) => diagnostic.range.intersects(token.range))
        .toList(growable: false);
  }

  List<DiagnosticQuickFix> quickFixesForDiagnostics(
    Iterable<Diagnostic> diagnostics,
  ) {
    final fixes = <DiagnosticQuickFix>[];
    final seenSignatures = <String>{};

    for (final diagnostic in diagnostics) {
      final diagnosticFixes = _languageService.quickFixesForDiagnostic(
        _document,
        diagnostic,
      );
      for (final fix in diagnosticFixes) {
        final signature = [
          fix.label,
          for (final edit in fix.edits)
            '${edit.range.start}:${edit.range.end}:${edit.newText}',
        ].join('|');
        if (seenSignatures.add(signature)) {
          fixes.add(fix);
        }
      }
    }

    return fixes;
  }

  bool get canUndo => _undoStack.isNotEmpty;
  bool get canRedo => _redoStack.isNotEmpty;

  void loadDocument(DocumentState document) {
    _document = document;
    _selection = SelectionState.collapsed(document.length);
    _refreshAnalysis();
    _undoStack.clear();
    _redoStack.clear();
    notifyListeners();
  }

  void selectCollapsed(int offset) {
    final clamped = offset.clamp(0, _document.length);
    _selection = SelectionState.collapsed(clamped);
    _refreshAnalysis();
    notifyListeners();
  }

  void selectRange({
    required int baseOffset,
    required int extentOffset,
  }) {
    _selection = SelectionState(
      baseOffset: baseOffset.clamp(0, _document.length),
      extentOffset: extentOffset.clamp(0, _document.length),
    );
    _refreshAnalysis();
    notifyListeners();
  }

  void selectLineColumn({
    required int line,
    required int column,
  }) {
    selectCollapsed(
      _document.offsetForLineColumn(
        line: line,
        column: column,
      ),
    );
  }

  void insertText(String value) {
    _pushUndoSnapshot();
    _replaceSelection(value);
    _redoStack.clear();
    notifyListeners();
  }

  void insertNewline() {
    insertText('\n');
  }

  void backspace() {
    if (_selection.isCollapsed && _selection.end == 0) {
      return;
    }

    _pushUndoSnapshot();

    if (_selection.isCollapsed) {
      final deleteStart = _selection.end - 1;
      _replaceRange(
        start: deleteStart,
        end: _selection.end,
        replacement: '',
        selectionOffset: deleteStart,
      );
    } else {
      _replaceSelection('');
    }

    _redoStack.clear();
    notifyListeners();
  }

  void deleteForward() {
    if (_selection.isCollapsed && _selection.end >= _document.length) {
      return;
    }

    _pushUndoSnapshot();

    if (_selection.isCollapsed) {
      _replaceRange(
        start: _selection.start,
        end: _selection.end + 1,
        replacement: '',
        selectionOffset: _selection.start,
      );
    } else {
      _replaceSelection('');
    }

    _redoStack.clear();
    notifyListeners();
  }

  void moveCaretHorizontally(
    int delta, {
    bool expandSelection = false,
  }) {
    if (delta == 0) {
      return;
    }
    final nextOffset =
        (_selection.extentOffset + delta).clamp(0, _document.length);
    if (expandSelection) {
      selectRange(
        baseOffset: _selection.baseOffset,
        extentOffset: nextOffset,
      );
      return;
    }
    selectCollapsed(nextOffset);
  }

  void moveCaretVertically(
    int deltaLines, {
    bool expandSelection = false,
  }) {
    if (deltaLines == 0) {
      return;
    }

    final position = _document.positionForOffset(_selection.extentOffset);
    final nextOffset = _document.offsetForLineColumn(
      line: position.line + deltaLines,
      column: position.column,
    );
    if (expandSelection) {
      selectRange(
        baseOffset: _selection.baseOffset,
        extentOffset: nextOffset,
      );
      return;
    }
    selectCollapsed(nextOffset);
  }

  void moveCaretToLineBoundary({
    required bool end,
    bool expandSelection = false,
  }) {
    final position = _document.positionForOffset(_selection.extentOffset);
    final nextOffset = _document.offsetForLineColumn(
      line: position.line,
      column: end ? _document.lines[position.line].length : 0,
    );
    if (expandSelection) {
      selectRange(
        baseOffset: _selection.baseOffset,
        extentOffset: nextOffset,
      );
      return;
    }
    selectCollapsed(nextOffset);
  }

  void applyCompletionItem(CompletionItem item) {
    _pushUndoSnapshot();
    final replacementRange = _completionReplacementRange();
    _replaceRange(
      start: replacementRange.start,
      end: replacementRange.end,
      replacement: item.insertText,
      selectionOffset: replacementRange.start + item.insertText.length,
    );
    _redoStack.clear();
    notifyListeners();
  }

  void applyFormattingEdits(Iterable<FormattingEdit> edits) {
    final normalizedEdits = edits.toList(growable: false);
    if (normalizedEdits.isEmpty) {
      return;
    }

    final editsAscending = normalizedEdits.toList(growable: false)
      ..sort((left, right) => left.range.start.compareTo(right.range.start));
    final editsDescending = editsAscending.reversed.toList(growable: false);
    final nextBaseOffset = _transformOffsetWithEdits(
      _selection.baseOffset,
      editsAscending,
    );
    final nextExtentOffset = _transformOffsetWithEdits(
      _selection.extentOffset,
      editsAscending,
    );

    _pushUndoSnapshot();

    var nextDocument = _document;
    for (final edit in editsDescending) {
      nextDocument = nextDocument.replaceRange(
        start: edit.range.start,
        end: edit.range.end,
        replacement: edit.newText,
      );
    }

    _document = nextDocument;
    _selection = SelectionState(
      baseOffset: nextBaseOffset.clamp(0, _document.length),
      extentOffset: nextExtentOffset.clamp(0, _document.length),
    );
    _refreshAnalysis();
    _redoStack.clear();
    notifyListeners();
  }

  void applyDiagnosticQuickFix(DiagnosticQuickFix fix) {
    applyFormattingEdits(fix.edits);
  }

  void _replaceSelection(String replacement) {
    final start = _selection.start;
    _replaceRange(
      start: start,
      end: _selection.end,
      replacement: replacement,
      selectionOffset: start + replacement.length,
    );
  }

  void _replaceRange({
    required int start,
    required int end,
    required String replacement,
    required int selectionOffset,
  }) {
    _document = _document.replaceRange(
      start: start,
      end: end,
      replacement: replacement,
    );
    _selection = SelectionState.collapsed(selectionOffset);
    _refreshAnalysis();
  }

  void undo() {
    if (!canUndo) {
      return;
    }
    _redoStack.add(_captureSnapshot());
    final snapshot = _undoStack.removeLast();
    _document = snapshot.document;
    _selection = snapshot.selection;
    _refreshAnalysis();
    notifyListeners();
  }

  void redo() {
    if (!canRedo) {
      return;
    }
    _undoStack.add(_captureSnapshot());
    final snapshot = _redoStack.removeLast();
    _document = snapshot.document;
    _selection = snapshot.selection;
    _refreshAnalysis();
    notifyListeners();
  }

  _EditorSnapshot _captureSnapshot() {
    return _EditorSnapshot(
      document: _document,
      selection: _selection,
    );
  }

  void _pushUndoSnapshot() {
    _undoStack.add(_captureSnapshot());
    if (_undoStack.length > 128) {
      _undoStack.removeAt(0);
    }
  }

  void _refreshAnalysis() {
    _analysis = _languageService.analyzeDocument(_document);
  }

  SourceRange _completionReplacementRange() {
    if (!_selection.isCollapsed) {
      return SourceRange(
        start: _selection.start,
        end: _selection.end,
      );
    }

    for (final token in _analysis.tokenSpans) {
      final touchesCaret = token.range.contains(_selection.end) ||
          token.range.end == _selection.end;
      if (!touchesCaret) {
        continue;
      }

      switch (token.kind) {
        case TokenKind.identifier:
        case TokenKind.keyword:
        case TokenKind.unknown:
          return token.range;
        case TokenKind.number:
        case TokenKind.string:
        case TokenKind.comment:
        case TokenKind.operator:
        case TokenKind.punctuation:
        case TokenKind.whitespace:
          break;
      }
    }

    return SourceRange(
      start: _selection.end,
      end: _selection.end,
    );
  }

  int _transformOffsetWithEdits(
    int offset,
    List<FormattingEdit> editsAscending,
  ) {
    var delta = 0;
    for (final edit in editsAscending) {
      final start = edit.range.start;
      final end = edit.range.end;
      final replacementLength = edit.newText.length;
      final originalLength = end - start;

      if (offset < start) {
        break;
      }

      if (offset <= end) {
        final relativeOffset = offset - start;
        final clampedRelativeOffset =
            relativeOffset.clamp(0, replacementLength);
        return start + delta + clampedRelativeOffset;
      }

      delta += replacementLength - originalLength;
    }

    return offset + delta;
  }

  TokenSpan? _tokenAroundOffset(int offset) {
    final safeOffset = offset.clamp(0, _document.length);
    TokenSpan? trailingToken;
    TokenSpan? leadingToken;

    for (final token in _analysis.tokenSpans) {
      if (token.kind == TokenKind.whitespace) {
        continue;
      }

      if (token.range.contains(safeOffset)) {
        return token;
      }
      if (token.range.end == safeOffset) {
        trailingToken = token;
      }
      if (leadingToken == null && token.range.start == safeOffset) {
        leadingToken = token;
      }
    }

    return trailingToken ?? leadingToken;
  }

  static DocumentState seedDocumentForPath(String path) {
    final samples = <String, String>{
      'main.styio': '''
fn main() {
  let stream = source |> normalize -> sink
  emit stream
}
''',
      'render_flow.styio': '''
pipeline renderFlow

let commitFlow = source |> normalize |> shade -> commit

fn commitFrame(frame) {
  state paint_ready
  when frame.ready -> state submitted
  emit frame.commit
}
''',
      'runtime_graph.styio': '''
fn bootRuntime() {
  spawn worker_a
  spawn worker_b
  sync worker_a -> worker_b
}
''',
      'cloud/main.styio': '''
fn main() {
  let session = remote_source |> hydrate -> cloud_sink
  emit session
}
''',
      'cloud/runtime_surface.styio': '''
fn inspectCloudSession() {
  state awaiting_container
  when container.ready -> state connected
}
''',
    };

    final normalizedPath = path.replaceAll('\\', '/');
    final basename = normalizedPath.split('/').last;
    final cloudPath = normalizedPath.contains('/cloud/');
    final lookupOrder = <String>[
      normalizedPath,
      if (cloudPath) 'cloud/$basename',
      basename,
    ];

    String? sample;
    for (final candidate in lookupOrder) {
      sample = samples[candidate];
      if (sample != null) {
        break;
      }
    }

    return DocumentState(
      documentId: path,
      text: sample ?? '// empty document\n',
      revision: 0,
    );
  }
}

class _EditorSnapshot {
  const _EditorSnapshot({
    required this.document,
    required this.selection,
  });

  final DocumentState document;
  final SelectionState selection;
}
