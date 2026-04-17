import 'dart:convert';
import 'dart:io';

import '../platform/platform_target.dart';
import 'dependency_source_adapter.dart';
import 'project_graph_contract.dart';
import 'spio_cli_discovery.dart';

Future<DependencySourceAdapter> createPlatformDependencySourceAdapter({
  required PlatformTarget platformTarget,
}) async {
  return _LocalCliDependencySourceAdapter(platformTarget: platformTarget);
}

class _LocalCliDependencySourceAdapter implements DependencySourceAdapter {
  const _LocalCliDependencySourceAdapter({
    required this.platformTarget,
  });

  final PlatformTarget platformTarget;

  @override
  Future<DependencySourceCommandResult> fetchDependencies({
    required ProjectGraphSnapshot projectGraph,
    bool locked = false,
    bool offline = false,
  }) {
    return _runCommand(
      projectGraph: projectGraph,
      command: 'fetch',
      args: <String>[
        '--json',
        'fetch',
        ..._manifestArgs(projectGraph),
        if (locked) '--locked',
        if (offline) '--offline',
      ],
    );
  }

  @override
  Future<DependencySourceCommandResult> vendorDependencies({
    required ProjectGraphSnapshot projectGraph,
    String? outputPath,
    bool locked = false,
    bool offline = false,
  }) {
    return _runCommand(
      projectGraph: projectGraph,
      command: 'vendor',
      args: <String>[
        '--json',
        'vendor',
        ..._manifestArgs(projectGraph),
        if (outputPath != null && outputPath.isNotEmpty) ...<String>[
          '--output',
          outputPath,
        ],
        if (locked) '--locked',
        if (offline) '--offline',
      ],
    );
  }

  Future<DependencySourceCommandResult> _runCommand({
    required ProjectGraphSnapshot projectGraph,
    required String command,
    required List<String> args,
  }) async {
    final blockedReason = blockedDependencySourceCommandReason(
      platformTarget: platformTarget,
      projectGraph: projectGraph,
      command: command,
    );
    if (blockedReason != null) {
      return DependencySourceCommandResult(
        command: command,
        status: DependencySourceCommandStatus.blocked,
        statusMessage: blockedReason,
        stdout: '',
        stderr: '',
      );
    }

    final spioBinary = await resolveSpioBinary(
      workspaceRoot: projectGraph.workspaceRoot,
    );
    if (spioBinary == null) {
      return DependencySourceCommandResult(
        command: command,
        status: DependencySourceCommandStatus.blocked,
        statusMessage:
            'No spio binary was resolved. Set STYIO_VIEW_SPIO_BIN or keep styio-spio available in the local workspace.',
        stdout: '',
        stderr: '',
      );
    }

    try {
      final result = await Process.run(
        spioBinary,
        args,
        workingDirectory: projectGraph.workspaceRoot,
      );
      final stdout = '${result.stdout}';
      final stderr = '${result.stderr}';
      final successPayload = _parseJsonObject(stdout);
      final failurePayload = _parseJsonObject(stderr);
      if (result.exitCode == 0) {
        return DependencySourceCommandResult(
          command: command,
          status: DependencySourceCommandStatus.succeeded,
          statusMessage: successPayload?['message'] as String? ??
              '$command completed through spio.',
          stdout: stdout,
          stderr: stderr,
          payload: successPayload,
        );
      }

      return DependencySourceCommandResult(
        command: command,
        status: DependencySourceCommandStatus.failed,
        statusMessage: failurePayload?['message'] as String? ??
            '$command exited with code ${result.exitCode}.',
        stdout: stdout,
        stderr: stderr,
        errorPayload: failurePayload,
      );
    } on ProcessException catch (error) {
      return DependencySourceCommandResult(
        command: command,
        status: DependencySourceCommandStatus.failed,
        statusMessage: 'Failed to execute spio: ${error.message}',
        stdout: '',
        stderr: '',
      );
    }
  }
}

List<String> _manifestArgs(ProjectGraphSnapshot projectGraph) {
  final manifestPath = projectGraph.manifestPath;
  if (manifestPath == null || manifestPath.isEmpty) {
    return const <String>[];
  }
  return <String>[
    '--manifest-path',
    manifestPath,
  ];
}

Map<String, dynamic>? _parseJsonObject(String text) {
  final trimmed = text.trim();
  if (!trimmed.startsWith('{')) {
    return null;
  }

  try {
    final decoded = jsonDecode(trimmed);
    return decoded is Map<String, dynamic> ? decoded : null;
  } on FormatException {
    return null;
  }
}
