import 'dart:convert';
import 'dart:io';

import '../platform/platform_target.dart';
import 'project_graph_contract.dart';
import 'spio_cli_discovery.dart';
import 'toolchain_management_adapter.dart';

Future<ToolchainManagementAdapter> createPlatformToolchainManagementAdapter({
  required PlatformTarget platformTarget,
}) async {
  return _LocalCliToolchainManagementAdapter(platformTarget: platformTarget);
}

class _LocalCliToolchainManagementAdapter
    implements ToolchainManagementAdapter {
  const _LocalCliToolchainManagementAdapter({
    required this.platformTarget,
  });

  final PlatformTarget platformTarget;

  @override
  Future<ToolchainCommandResult> installManagedCompiler({
    required ProjectGraphSnapshot projectGraph,
    required String styioBinaryPath,
  }) {
    return _runToolchainCommand(
      projectGraph: projectGraph,
      command: 'tool install',
      args: <String>[
        '--json',
        'tool',
        'install',
        '--styio-bin',
        styioBinaryPath,
      ],
    );
  }

  @override
  Future<ToolchainCommandResult> useManagedCompiler({
    required ProjectGraphSnapshot projectGraph,
    required String compilerVersion,
    String? channel,
  }) {
    return _runToolchainCommand(
      projectGraph: projectGraph,
      command: 'tool use',
      args: <String>[
        '--json',
        'tool',
        'use',
        '--version',
        compilerVersion,
        if (channel != null && channel.isNotEmpty) ...<String>[
          '--channel',
          channel,
        ],
      ],
    );
  }

  @override
  Future<ToolchainCommandResult> pinManagedCompiler({
    required ProjectGraphSnapshot projectGraph,
    required String compilerVersion,
    String? channel,
  }) {
    final manifestPath = projectGraph.manifestPath;
    if (manifestPath == null || manifestPath.isEmpty) {
      return Future<ToolchainCommandResult>.value(
        const ToolchainCommandResult(
          command: 'tool pin',
          status: ToolchainCommandStatus.blocked,
          statusMessage:
              'Project pinning requires a resolved spio manifest path.',
          stdout: '',
          stderr: '',
        ),
      );
    }
    return _runToolchainCommand(
      projectGraph: projectGraph,
      command: 'tool pin',
      args: <String>[
        '--json',
        'tool',
        'pin',
        '--manifest-path',
        manifestPath,
        '--version',
        compilerVersion,
        if (channel != null && channel.isNotEmpty) ...<String>[
          '--channel',
          channel,
        ],
      ],
    );
  }

  @override
  Future<ToolchainCommandResult> clearPinnedCompiler({
    required ProjectGraphSnapshot projectGraph,
  }) {
    final manifestPath = projectGraph.manifestPath;
    if (manifestPath == null || manifestPath.isEmpty) {
      return Future<ToolchainCommandResult>.value(
        const ToolchainCommandResult(
          command: 'tool pin',
          status: ToolchainCommandStatus.blocked,
          statusMessage:
              'Clearing a project pin requires a resolved spio manifest path.',
          stdout: '',
          stderr: '',
        ),
      );
    }
    return _runToolchainCommand(
      projectGraph: projectGraph,
      command: 'tool pin',
      args: <String>[
        '--json',
        'tool',
        'pin',
        '--manifest-path',
        manifestPath,
        '--clear',
      ],
    );
  }

  Future<ToolchainCommandResult> _runToolchainCommand({
    required ProjectGraphSnapshot projectGraph,
    required String command,
    required List<String> args,
  }) async {
    if (platformTarget == PlatformTarget.ios ||
        platformTarget == PlatformTarget.web) {
      return ToolchainCommandResult(
        command: command,
        status: ToolchainCommandStatus.blocked,
        statusMessage:
            '${platformTarget.label} does not expose local spio toolchain management.',
        stdout: '',
        stderr: '',
      );
    }

    final spioBinary = await resolveSpioBinary(
      workspaceRoot: projectGraph.workspaceRoot,
    );
    if (spioBinary == null) {
      return ToolchainCommandResult(
        command: command,
        status: ToolchainCommandStatus.blocked,
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
        return ToolchainCommandResult(
          command: command,
          status: ToolchainCommandStatus.succeeded,
          statusMessage: successPayload?['message'] as String? ??
              '$command completed through spio.',
          stdout: stdout,
          stderr: stderr,
          payload: successPayload,
        );
      }

      return ToolchainCommandResult(
        command: command,
        status: ToolchainCommandStatus.failed,
        statusMessage: failurePayload?['message'] as String? ??
            '$command exited with code ${result.exitCode}.',
        stdout: stdout,
        stderr: stderr,
        errorPayload: failurePayload,
      );
    } on ProcessException catch (error) {
      return ToolchainCommandResult(
        command: command,
        status: ToolchainCommandStatus.failed,
        statusMessage: 'Failed to execute spio: ${error.message}',
        stdout: '',
        stderr: '',
      );
    }
  }
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
