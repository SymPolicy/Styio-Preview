import 'dart:convert';
import 'dart:io';

import '../platform/platform_target.dart';
import 'deployment_adapter.dart';
import 'project_graph_contract.dart';
import 'spio_cli_discovery.dart';

Future<DeploymentAdapter> createPlatformDeploymentAdapter({
  required PlatformTarget platformTarget,
}) async {
  return _LocalCliDeploymentAdapter(platformTarget: platformTarget);
}

class _LocalCliDeploymentAdapter implements DeploymentAdapter {
  const _LocalCliDeploymentAdapter({
    required this.platformTarget,
  });

  final PlatformTarget platformTarget;

  @override
  Future<DeploymentCommandResult> packProject({
    required ProjectGraphSnapshot projectGraph,
    String? packageName,
    String? outputPath,
  }) {
    return _runDeploymentCommand(
      projectGraph: projectGraph,
      command: 'pack',
      args: <String>[
        '--json',
        'pack',
        ..._manifestArgs(projectGraph),
        if (packageName != null && packageName.isNotEmpty) ...<String>[
          '--package',
          packageName,
        ],
        if (outputPath != null && outputPath.isNotEmpty) ...<String>[
          '--output',
          outputPath,
        ],
      ],
    );
  }

  @override
  Future<DeploymentCommandResult> preparePublish({
    required ProjectGraphSnapshot projectGraph,
    String? packageName,
    String? outputPath,
  }) {
    final resolvedPublishPackage = _resolvePublishPackage(
      projectGraph: projectGraph,
      explicitPackageName: packageName,
    );
    if (resolvedPublishPackage.blockedResult case final blockedResult?) {
      return Future<DeploymentCommandResult>.value(blockedResult);
    }
    return _runDeploymentCommand(
      projectGraph: projectGraph,
      command: 'publish',
      args: <String>[
        '--json',
        'publish',
        ..._manifestArgs(projectGraph),
        if (resolvedPublishPackage.packageName
            case final resolvedPackageName?) ...<String>[
          '--package',
          resolvedPackageName,
        ],
        if (outputPath != null && outputPath.isNotEmpty) ...<String>[
          '--output',
          outputPath,
        ],
        '--dry-run',
      ],
    );
  }

  @override
  Future<DeploymentCommandResult> publishToRegistry({
    required ProjectGraphSnapshot projectGraph,
    required String registryRoot,
    String? packageName,
    String? outputPath,
  }) {
    final resolvedPublishPackage = _resolvePublishPackage(
      projectGraph: projectGraph,
      explicitPackageName: packageName,
    );
    if (resolvedPublishPackage.blockedResult case final blockedResult?) {
      return Future<DeploymentCommandResult>.value(blockedResult);
    }
    return _runDeploymentCommand(
      projectGraph: projectGraph,
      command: 'publish',
      args: <String>[
        '--json',
        'publish',
        ..._manifestArgs(projectGraph),
        if (resolvedPublishPackage.packageName
            case final resolvedPackageName?) ...<String>[
          '--package',
          resolvedPackageName,
        ],
        if (outputPath != null && outputPath.isNotEmpty) ...<String>[
          '--output',
          outputPath,
        ],
        '--registry',
        registryRoot,
      ],
    );
  }

  Future<DeploymentCommandResult> _runDeploymentCommand({
    required ProjectGraphSnapshot projectGraph,
    required String command,
    required List<String> args,
  }) async {
    if (platformTarget == PlatformTarget.ios ||
        platformTarget == PlatformTarget.web) {
      return DeploymentCommandResult(
        command: command,
        status: DeploymentCommandStatus.blocked,
        statusMessage:
            '${platformTarget.label} does not expose local spio deployment commands.',
        stdout: '',
        stderr: '',
      );
    }

    final manifestPath = projectGraph.manifestPath;
    if (manifestPath == null || manifestPath.isEmpty) {
      return DeploymentCommandResult(
        command: command,
        status: DeploymentCommandStatus.blocked,
        statusMessage:
            'Deployment commands require a resolved spio manifest path.',
        stdout: '',
        stderr: '',
      );
    }

    final spioBinary = await resolveSpioBinary(
      workspaceRoot: projectGraph.workspaceRoot,
    );
    if (spioBinary == null) {
      return DeploymentCommandResult(
        command: command,
        status: DeploymentCommandStatus.blocked,
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
        return DeploymentCommandResult(
          command: command,
          status: DeploymentCommandStatus.succeeded,
          statusMessage: successPayload?['message'] as String? ??
              '$command completed through spio.',
          stdout: stdout,
          stderr: stderr,
          payload: successPayload,
        );
      }

      return DeploymentCommandResult(
        command: command,
        status: DeploymentCommandStatus.failed,
        statusMessage: failurePayload?['message'] as String? ??
            '$command exited with code ${result.exitCode}.',
        stdout: stdout,
        stderr: stderr,
        errorPayload: failurePayload,
      );
    } on ProcessException catch (error) {
      return DeploymentCommandResult(
        command: command,
        status: DeploymentCommandStatus.failed,
        statusMessage: 'Failed to execute spio: ${error.message}',
        stdout: '',
        stderr: '',
      );
    }
  }
}

class _ResolvedPublishPackage {
  const _ResolvedPublishPackage({
    this.packageName,
    this.blockedResult,
  });

  final String? packageName;
  final DeploymentCommandResult? blockedResult;
}

_ResolvedPublishPackage _resolvePublishPackage({
  required ProjectGraphSnapshot projectGraph,
  required String? explicitPackageName,
}) {
  if (explicitPackageName != null && explicitPackageName.isNotEmpty) {
    return _ResolvedPublishPackage(packageName: explicitPackageName);
  }

  final distribution = projectGraph.packageDistribution;
  if (distribution == null || distribution.packages.isEmpty) {
    return const _ResolvedPublishPackage();
  }

  final publishablePackages = distribution.packages
      .where((package) => package.publishReady)
      .toList(growable: false);
  if (publishablePackages.length == 1) {
    return _ResolvedPublishPackage(
      packageName: publishablePackages.single.packageName,
    );
  }
  if (publishablePackages.isEmpty) {
    final blockedPackages = distribution.packages
        .where((package) => !package.publishReady)
        .toList(growable: false);
    final headline = blockedPackages.isEmpty
        ? 'No publish-ready package is available for deployment.'
        : 'No publish-ready package is available: ${blockedPackages.map((package) => package.packageName).join(', ')}.';
    final details = blockedPackages.take(2).expand((package) {
      if (package.blockingReasons.isEmpty) {
        return <String>[];
      }
      return <String>[
        '${package.packageName}: ${package.blockingReasons.join(' | ')}',
      ];
    }).join(' ');
    return _ResolvedPublishPackage(
      blockedResult: DeploymentCommandResult(
        command: 'publish',
        status: DeploymentCommandStatus.blocked,
        statusMessage: details.isEmpty ? headline : '$headline $details',
        stdout: '',
        stderr: '',
      ),
    );
  }

  return _ResolvedPublishPackage(
    blockedResult: DeploymentCommandResult(
      command: 'publish',
      status: DeploymentCommandStatus.blocked,
      statusMessage:
          'Multiple publish-ready packages are available. Select a package before publish: ${publishablePackages.map((package) => package.packageName).join(', ')}.',
      stdout: '',
      stderr: '',
    ),
  );
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
