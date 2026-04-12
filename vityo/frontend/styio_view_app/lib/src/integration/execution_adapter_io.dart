import 'dart:convert';
import 'dart:io';

import '../editor/document_state.dart';
import '../language/language_contract.dart';
import '../platform/platform_target.dart';
import 'adapter_contracts.dart';
import 'execution_adapter.dart';
import 'project_graph_contract.dart';

Future<ExecutionAdapter> createPlatformExecutionAdapter({
  required PlatformTarget platformTarget,
  required ProjectGraphSnapshot projectGraph,
}) async {
  final compiler = projectGraph.activeCompiler;
  return _LocalCliExecutionAdapter(
    platformTarget: platformTarget,
    compiler: compiler,
  );
}

class _LocalCliExecutionAdapter implements ExecutionAdapter {
  const _LocalCliExecutionAdapter({
    required this.platformTarget,
    required this.compiler,
  });

  final PlatformTarget platformTarget;
  final CompilerHandshakeSnapshot? compiler;

  @override
  AdapterCapabilitySnapshot get capabilitySnapshot {
    if (platformTarget == PlatformTarget.ios) {
      return const AdapterCapabilitySnapshot(
        adapterKind: AdapterKind.cli,
        languageService: AdapterEndpointCapability(
          level: AdapterCapabilityLevel.unavailable,
          detail: 'iOS does not expose local CLI language execution.',
        ),
        projectGraph: AdapterEndpointCapability(
          level: AdapterCapabilityLevel.unavailable,
          detail: 'Project graph is not driven through the local execution path on iOS.',
        ),
        execution: AdapterEndpointCapability(
          level: AdapterCapabilityLevel.unavailable,
          detail: 'iOS execution remains cloud-routed by policy.',
        ),
        runtimeEvents: AdapterEndpointCapability(
          level: AdapterCapabilityLevel.unavailable,
          detail: 'Runtime events remain cloud-routed on iOS.',
        ),
      );
    }

    if (compiler == null) {
      return const AdapterCapabilitySnapshot(
        adapterKind: AdapterKind.cli,
        languageService: AdapterEndpointCapability(
          level: AdapterCapabilityLevel.unavailable,
          detail: 'No published local styio binary was resolved for CLI language services.',
        ),
        projectGraph: AdapterEndpointCapability(
          level: AdapterCapabilityLevel.unavailable,
          detail: 'Project graph is handled by the dedicated project graph adapter.',
        ),
        execution: AdapterEndpointCapability(
          level: AdapterCapabilityLevel.unavailable,
          detail: 'No local styio binary was resolved. Set STYIO_VIEW_STYIO_BIN or install styio through spio.',
        ),
        runtimeEvents: AdapterEndpointCapability(
          level: AdapterCapabilityLevel.unavailable,
          detail: 'Runtime events require a published execution/runtime contract.',
        ),
      );
    }

    return const AdapterCapabilitySnapshot(
      adapterKind: AdapterKind.cli,
      languageService: AdapterEndpointCapability(
        level: AdapterCapabilityLevel.partial,
        detail: 'Published CLI contract currently provides machine-info and jsonl diagnostics only.',
      ),
      projectGraph: AdapterEndpointCapability(
        level: AdapterCapabilityLevel.unavailable,
        detail: 'Project graph is handled by the dedicated project graph adapter.',
      ),
      execution: AdapterEndpointCapability(
        level: AdapterCapabilityLevel.partial,
        detail:
            'CLI execution is currently limited to published single-file entry plus jsonl diagnostics.',
      ),
      runtimeEvents: AdapterEndpointCapability(
        level: AdapterCapabilityLevel.unavailable,
        detail:
            'Runtime events stay unavailable until styio publishes a runtime event machine contract.',
      ),
    );
  }

  @override
  Future<ExecutionSession> runActiveDocument({
    required PlatformTarget platformTarget,
    required ProjectGraphSnapshot projectGraph,
    required DocumentState document,
    required String activeFilePath,
  }) async {
    if (platformTarget == PlatformTarget.ios) {
      return const ExecutionSession(
        sessionId: 'ios-cloud-only',
        kind: 'run',
        status: ExecutionSessionStatus.blocked,
        statusMessage: 'iOS execution is cloud-only and is not routed through the local CLI adapter.',
        diagnostics: <Diagnostic>[],
        stdoutEvents: <ExecutionLogEvent>[],
        stderrEvents: <ExecutionLogEvent>[],
      );
    }

    final resolvedCompiler = compiler;
    if (resolvedCompiler == null) {
      return const ExecutionSession(
        sessionId: 'missing-styio-binary',
        kind: 'run',
        status: ExecutionSessionStatus.blocked,
        statusMessage:
            'No local styio binary was resolved. Set STYIO_VIEW_STYIO_BIN or install styio through spio.',
        diagnostics: <Diagnostic>[],
        stdoutEvents: <ExecutionLogEvent>[],
        stderrEvents: <ExecutionLogEvent>[],
      );
    }

    if (projectGraph.hasManifest) {
      return const ExecutionSession(
        sessionId: 'compile-plan-preview-only',
        kind: 'run',
        status: ExecutionSessionStatus.blocked,
        statusMessage:
            'Project build/run remains preview-only until styio publishes a live compile-plan consumer.',
        diagnostics: <Diagnostic>[],
        stdoutEvents: <ExecutionLogEvent>[],
        stderrEvents: <ExecutionLogEvent>[],
      );
    }

    final tempDirectory = await Directory.systemTemp.createTemp(
      'styio-view-run-',
    );
    final tempFile = File('${tempDirectory.path}${Platform.pathSeparator}main.styio');
    try {
      await tempFile.writeAsString(document.text);
      final result = await Process.run(
        resolvedCompiler.binaryPath,
        <String>[
          '--file',
          tempFile.path,
          '--error-format=jsonl',
        ],
      );

      final diagnostics = _parseDiagnostics(
        stdout: '${result.stdout}',
        stderr: '${result.stderr}',
      );
      final stdoutEvents = _toLogEvents(
        '${result.stdout}',
        skipJsonDiagnostics: true,
      );
      final stderrEvents = _toLogEvents(
        '${result.stderr}',
        skipJsonDiagnostics: true,
      );

      return ExecutionSession(
        sessionId: DateTime.now().microsecondsSinceEpoch.toString(),
        kind: 'run',
        status: result.exitCode == 0
            ? ExecutionSessionStatus.succeeded
            : ExecutionSessionStatus.failed,
        statusMessage: result.exitCode == 0
            ? 'Single-file CLI run completed through styio.'
            : 'styio exited with code ${result.exitCode}.',
        diagnostics: diagnostics,
        stdoutEvents: stdoutEvents,
        stderrEvents: stderrEvents,
        unitRange: SourceRange(start: 0, end: document.length),
      );
    } finally {
      if (await tempDirectory.exists()) {
        await tempDirectory.delete(recursive: true);
      }
    }
  }
}

List<Diagnostic> _parseDiagnostics({
  required String stdout,
  required String stderr,
}) {
  final diagnostics = <Diagnostic>[];
  for (final line in <String>[
    ...stdout.split('\n'),
    ...stderr.split('\n'),
  ]) {
    final trimmed = line.trim();
    if (trimmed.isEmpty || !trimmed.startsWith('{')) {
      continue;
    }
    try {
      final decoded = jsonDecode(trimmed);
      if (decoded is! Map<String, dynamic>) {
        continue;
      }
      final category = decoded['category'] as String? ?? 'diagnostic';
      final message = decoded['message'] as String? ?? 'Compiler diagnostic';
      diagnostics.add(
        Diagnostic(
          severity: _severityFromCategory(category),
          code: decoded['code'] as String? ?? category,
          message: message,
          range: const SourceRange(start: 0, end: 0),
        ),
      );
    } catch (_) {
      continue;
    }
  }
  return diagnostics;
}

List<ExecutionLogEvent> _toLogEvents(
  String output, {
  required bool skipJsonDiagnostics,
}) {
  final events = <ExecutionLogEvent>[];
  for (final line in output.split('\n')) {
    final trimmed = line.trim();
    if (trimmed.isEmpty) {
      continue;
    }
    if (skipJsonDiagnostics && trimmed.startsWith('{')) {
      try {
        final decoded = jsonDecode(trimmed);
        if (decoded is Map<String, dynamic> && decoded.containsKey('message')) {
          continue;
        }
      } catch (_) {
        // Fall through and keep the line.
      }
    }
    events.add(ExecutionLogEvent(message: trimmed));
  }
  return events;
}

DiagnosticSeverity _severityFromCategory(String category) {
  final normalized = category.toLowerCase();
  if (normalized.contains('runtime') || normalized.contains('type')) {
    return DiagnosticSeverity.error;
  }
  if (normalized.contains('warning')) {
    return DiagnosticSeverity.warning;
  }
  return DiagnosticSeverity.error;
}
