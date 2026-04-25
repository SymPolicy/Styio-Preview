import 'dart:convert';
import 'dart:io';

import '../platform/platform_target.dart';
import 'hosted_control_plane.dart';
import 'project_graph_contract.dart';
import 'spio_cli_discovery.dart';
import 'toolchain_management_adapter.dart';

Future<ToolchainManagementAdapter> createPlatformToolchainManagementAdapter({
  required PlatformTarget platformTarget,
}) async {
  final hostedClient = await createHostedControlPlaneClient(
    platformTarget: platformTarget,
  );
  if (hostedClient != null) {
    return _HostedToolchainManagementAdapter(
      platformTarget: platformTarget,
      hostedClient: hostedClient,
    );
  }
  return _LocalCliToolchainManagementAdapter(platformTarget: platformTarget);
}

class _HostedToolchainManagementAdapter implements ToolchainManagementAdapter {
  const _HostedToolchainManagementAdapter({
    required this.platformTarget,
    required this.hostedClient,
  });

  final PlatformTarget platformTarget;
  final HostedControlPlaneClient hostedClient;

  @override
  Future<ToolchainCommandResult> installManagedCompiler({
    required ProjectGraphSnapshot projectGraph,
    required String styioBinaryPath,
  }) async {
    final workspaceId = projectGraph.hostedWorkspace?.workspaceId;
    if (workspaceId == null || workspaceId.isEmpty) {
      return const ToolchainCommandResult(
        command: 'tool install',
        status: ToolchainCommandStatus.blocked,
        statusMessage:
            'Hosted workspace identity is unavailable for tool install.',
        stdout: '',
        stderr: '',
      );
    }
    try {
      final response = await hostedClient.toolInstall(
        workspaceId: workspaceId,
        styioBinaryPath: styioBinaryPath,
      );
      return _toolchainCommandResultFromHostedResponse(
        command: 'tool install',
        response: response,
      );
    } catch (error) {
      return ToolchainCommandResult(
        command: 'tool install',
        status: ToolchainCommandStatus.failed,
        statusMessage: 'Hosted tool install failed: $error',
        stdout: '',
        stderr: '',
      );
    }
  }

  @override
  Future<ToolchainCommandResult> useManagedCompiler({
    required ProjectGraphSnapshot projectGraph,
    required String compilerVersion,
    String? channel,
  }) async {
    final workspaceId = projectGraph.hostedWorkspace?.workspaceId;
    if (workspaceId == null || workspaceId.isEmpty) {
      return const ToolchainCommandResult(
        command: 'tool use',
        status: ToolchainCommandStatus.blocked,
        statusMessage:
            'Hosted workspace identity is unavailable for tool use.',
        stdout: '',
        stderr: '',
      );
    }
    try {
      final response = await hostedClient.toolUse(
        workspaceId: workspaceId,
        compilerVersion: compilerVersion,
        channel: channel,
      );
      return _toolchainCommandResultFromHostedResponse(
        command: 'tool use',
        response: response,
      );
    } catch (error) {
      return ToolchainCommandResult(
        command: 'tool use',
        status: ToolchainCommandStatus.failed,
        statusMessage: 'Hosted tool use failed: $error',
        stdout: '',
        stderr: '',
      );
    }
  }

  @override
  Future<ToolchainCommandResult> pinManagedCompiler({
    required ProjectGraphSnapshot projectGraph,
    required String compilerVersion,
    String? channel,
  }) async {
    final workspaceId = projectGraph.hostedWorkspace?.workspaceId;
    if (workspaceId == null || workspaceId.isEmpty) {
      return const ToolchainCommandResult(
        command: 'tool pin',
        status: ToolchainCommandStatus.blocked,
        statusMessage:
            'Hosted workspace identity is unavailable for tool pin.',
        stdout: '',
        stderr: '',
      );
    }
    try {
      final response = await hostedClient.toolPin(
        workspaceId: workspaceId,
        compilerVersion: compilerVersion,
        channel: channel,
      );
      return _toolchainCommandResultFromHostedResponse(
        command: 'tool pin',
        response: response,
      );
    } catch (error) {
      return ToolchainCommandResult(
        command: 'tool pin',
        status: ToolchainCommandStatus.failed,
        statusMessage: 'Hosted tool pin failed: $error',
        stdout: '',
        stderr: '',
      );
    }
  }

  @override
  Future<ToolchainCommandResult> clearPinnedCompiler({
    required ProjectGraphSnapshot projectGraph,
  }) async {
    final workspaceId = projectGraph.hostedWorkspace?.workspaceId;
    if (workspaceId == null || workspaceId.isEmpty) {
      return const ToolchainCommandResult(
        command: 'tool pin',
        status: ToolchainCommandStatus.blocked,
        statusMessage:
            'Hosted workspace identity is unavailable for tool pin clear.',
        stdout: '',
        stderr: '',
      );
    }
    try {
      final response = await hostedClient.toolClearPin(workspaceId: workspaceId);
      return _toolchainCommandResultFromHostedResponse(
        command: 'tool pin',
        response: response,
      );
    } catch (error) {
      return ToolchainCommandResult(
        command: 'tool pin',
        status: ToolchainCommandStatus.failed,
        statusMessage: 'Hosted tool pin clear failed: $error',
        stdout: '',
        stderr: '',
      );
    }
  }
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

ToolchainCommandResult _toolchainCommandResultFromHostedResponse({
  required String command,
  required Map<String, dynamic> response,
}) {
  final returnCode = response['returncode'] as int? ?? 1;
  final stdout = response['stdout'] as String? ?? '';
  final stderr = response['stderr'] as String? ?? '';
  if (returnCode == 0) {
    return ToolchainCommandResult(
      command: command,
      status: ToolchainCommandStatus.succeeded,
      statusMessage: response['message'] as String? ??
          '$command completed through the hosted control plane.',
      stdout: stdout,
      stderr: stderr,
      payload: response['payload'] as Map<String, dynamic>?,
    );
  }
  return ToolchainCommandResult(
    command: command,
    status: ToolchainCommandStatus.failed,
    statusMessage: response['message'] as String? ??
        '$command failed through the hosted control plane.',
    stdout: stdout,
    stderr: stderr,
    errorPayload: response['error_payload'] as Map<String, dynamic>?,
  );
}
