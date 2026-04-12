import 'dart:convert';
import 'dart:io';

import '../platform/platform_target.dart';
import 'adapter_contracts.dart';
import 'project_graph_adapter.dart';
import 'project_graph_contract.dart';

Future<ProjectGraphAdapter> createPlatformProjectGraphAdapter({
  required PlatformTarget platformTarget,
}) async {
  return _LocalProjectGraphAdapter(platformTarget: platformTarget);
}

class _LocalProjectGraphAdapter implements ProjectGraphAdapter {
  _LocalProjectGraphAdapter({
    required this.platformTarget,
  });

  final PlatformTarget platformTarget;

  @override
  AdapterCapabilitySnapshot get capabilitySnapshot =>
      const AdapterCapabilitySnapshot(
        adapterKind: AdapterKind.cli,
        languageService: AdapterEndpointCapability(
          level: AdapterCapabilityLevel.unavailable,
          detail:
              'Language-service data still needs a published styio contract.',
        ),
        projectGraph: AdapterEndpointCapability(
          level: AdapterCapabilityLevel.partial,
          detail:
              'Project graph is currently inferred from canonical project files until spio publishes a success payload.',
        ),
        execution: AdapterEndpointCapability(
          level: AdapterCapabilityLevel.unavailable,
          detail:
              'Execution capability is provided by the dedicated execution adapter.',
        ),
        runtimeEvents: AdapterEndpointCapability(
          level: AdapterCapabilityLevel.unavailable,
          detail:
              'Runtime events are not exposed through the current CLI project graph path.',
        ),
      );

  @override
  Future<ProjectGraphSnapshot> loadProjectGraph() async {
    final rootDirectory = _discoverProjectRoot(Directory.current);
    final manifestFile = File(_joinPath(rootDirectory.path, 'spio.toml'));
    final toolchainPin = _findUpwardFile(
      startDirectory: rootDirectory,
      candidates: const <String>['spio-toolchain.toml'],
    );
    final styioConfig = _findUpwardFile(
      startDirectory: rootDirectory,
      candidates: const <String>['styio.toml', '.styio.toml'],
    );
    final compiler = await _probeCompiler(startDirectory: rootDirectory);

    if (!await manifestFile.exists()) {
      final fallbackFile = _joinPath(
        _joinPath(rootDirectory.path, 'scratch'),
        'main.styio',
      );
      return ProjectGraphSnapshot.scratch(
        workspaceRoot: rootDirectory.path,
        activeFilePath: fallbackFile,
        title: 'Scratch Project',
        toolchain: ToolchainStatusSnapshot(
          source: toolchainPin == null
              ? ToolchainResolutionSource.unavailable
              : ToolchainResolutionSource.projectPin,
          detail: toolchainPin == null
              ? 'No spio.toml discovered. The shell is running in scratch mode.'
              : 'Project toolchain pin is present but no manifest was discovered.',
          pinPath: toolchainPin,
        ),
        activeCompiler: compiler,
        notes: <String>[
          'No spio.toml was found while scanning upward from ${Directory.current.path}.',
          'The editor remains usable in scratch mode and can still target published styio single-file execution.',
        ],
      );
    }

    final parsedRoot = await _parseManifest(
      manifestPath: manifestFile.path,
      workspaceRoot: rootDirectory.path,
      isWorkspaceMember: false,
    );

    final packages = <ProjectPackageSnapshot>[];
    final dependencies = <ProjectDependencySnapshot>[];
    final targets = <ProjectTargetDescriptor>[];

    if (parsedRoot.package != null) {
      packages.add(parsedRoot.package!);
      dependencies.addAll(parsedRoot.dependencies);
      targets.addAll(parsedRoot.package!.targets);
    }

    for (final member in parsedRoot.workspaceMembers) {
      final memberManifestPath = _joinPath(
        _joinPath(rootDirectory.path, member),
        'spio.toml',
      );
      final memberManifest = File(memberManifestPath);
      if (!await memberManifest.exists()) {
        continue;
      }
      final parsedMember = await _parseManifest(
        manifestPath: memberManifestPath,
        workspaceRoot: _joinPath(rootDirectory.path, member),
        isWorkspaceMember: true,
      );
      if (parsedMember.package != null) {
        packages.add(parsedMember.package!);
        dependencies.addAll(parsedMember.dependencies);
        targets.addAll(parsedMember.package!.targets);
      }
    }

    final manifestKind = parsedRoot.workspaceMembers.isNotEmpty
        ? (parsedRoot.package != null
            ? ProjectKind.combinedRoot
            : ProjectKind.workspace)
        : ProjectKind.package;
    final editorFiles = <String>{
      for (final target in targets) target.filePath,
    }.toList(growable: false);
    if (editorFiles.isEmpty) {
      editorFiles.add(
        _joinPath(
          _joinPath(rootDirectory.path, 'src'),
          'main.styio',
        ),
      );
    }

    final lockfilePath = _joinPath(rootDirectory.path, 'spio.lock');
    final vendorRoot =
        _joinPath(_joinPath(rootDirectory.path, '.spio'), 'vendor');
    final buildRoot =
        _joinPath(_joinPath(rootDirectory.path, '.spio'), 'build');
    final toolchain = _toolchainFromManifest(
      parsedRoot.toolchain,
      toolchainPin: toolchainPin,
    );

    return ProjectGraphSnapshot(
      id: manifestFile.path,
      title: parsedRoot.package?.packageName ?? 'Workspace Project',
      kind: manifestKind,
      workspaceRoot: rootDirectory.path,
      workspaceMembers: parsedRoot.workspaceMembers,
      manifestPath: manifestFile.path,
      lockfilePath: lockfilePath,
      toolchainPinPath: toolchainPin,
      styioConfigPath: styioConfig,
      vendorRoot: vendorRoot,
      buildRoot: buildRoot,
      packages: packages,
      dependencies: dependencies,
      targets: targets,
      editorFiles: editorFiles,
      toolchain: toolchain,
      lockState: await File(lockfilePath).exists()
          ? ProjectLockState.unknown
          : ProjectLockState.missing,
      vendorState: await Directory(vendorRoot).exists()
          ? ProjectVendorState.present
          : ProjectVendorState.missing,
      activeCompiler: compiler,
      notes: <String>[
        'Project graph is built from canonical spio/styio files until spio publishes a dedicated project graph payload.',
        if (parsedRoot.workspaceMembers.isNotEmpty)
          'Workspace members discovered: ${parsedRoot.workspaceMembers.join(', ')}',
      ],
    );
  }
}

class _ParsedManifest {
  const _ParsedManifest({
    required this.package,
    required this.workspaceMembers,
    required this.dependencies,
    required this.toolchain,
  });

  final ProjectPackageSnapshot? package;
  final List<String> workspaceMembers;
  final List<ProjectDependencySnapshot> dependencies;
  final _ParsedToolchain toolchain;
}

class _ParsedToolchain {
  const _ParsedToolchain({
    this.channel,
  });

  final String? channel;
}

class _ParsedDependency {
  const _ParsedDependency({
    required this.name,
    required this.kind,
    required this.requirement,
    required this.isWorkspaceReference,
  });

  final String name;
  final ProjectDependencyKind kind;
  final String requirement;
  final bool isWorkspaceReference;
}

class _MutableTarget {
  _MutableTarget({
    required this.kind,
  });

  final ProjectTargetKind kind;
  String? name;
  String? path;
}

Future<_ParsedManifest> _parseManifest({
  required String manifestPath,
  required String workspaceRoot,
  required bool isWorkspaceMember,
}) async {
  final lines = await File(manifestPath).readAsLines();
  String? packageName;
  String? packageVersion;
  final workspaceMembers = <String>[];
  final targets = <ProjectTargetDescriptor>[];
  final parsedDependencies = <_ParsedDependency>[];
  _MutableTarget? pendingTarget;
  var section = '';
  String? toolchainChannel;

  void flushPendingTarget() {
    final current = pendingTarget;
    if (current == null) {
      return;
    }
    if (current.path != null) {
      final resolvedPath = _resolveRelativePath(workspaceRoot, current.path!);
      final targetName = current.kind == ProjectTargetKind.lib
          ? (packageName?.split('/').last ?? 'lib')
          : (current.name ?? current.kind.name);
      final package = packageName ?? 'workspace/anonymous';
      targets.add(
        ProjectTargetDescriptor(
          id: '$package:${current.kind.name}:$targetName',
          packageName: package,
          kind: current.kind,
          name: targetName,
          filePath: resolvedPath,
        ),
      );
    }
    pendingTarget = null;
  }

  for (final rawLine in lines) {
    final line = _stripComment(rawLine).trim();
    if (line.isEmpty) {
      continue;
    }
    if (line.startsWith('[[') && line.endsWith(']]')) {
      flushPendingTarget();
      section = line.substring(2, line.length - 2).trim();
      switch (section) {
        case 'bin':
          pendingTarget = _MutableTarget(kind: ProjectTargetKind.bin);
        case 'test':
          pendingTarget = _MutableTarget(kind: ProjectTargetKind.test);
      }
      continue;
    }
    if (line.startsWith('[') && line.endsWith(']')) {
      flushPendingTarget();
      section = line.substring(1, line.length - 1).trim();
      if (section == 'lib') {
        pendingTarget = _MutableTarget(kind: ProjectTargetKind.lib);
      }
      continue;
    }

    final separator = line.indexOf('=');
    if (separator == -1) {
      continue;
    }
    final key = line.substring(0, separator).trim();
    final value = line.substring(separator + 1).trim();

    switch (section) {
      case 'package':
        if (key == 'name') {
          packageName = _parseString(value);
        } else if (key == 'version') {
          packageVersion = _parseString(value);
        }
      case 'workspace':
        if (key == 'members') {
          workspaceMembers.addAll(_parseStringArray(value));
        }
      case 'dependencies':
        parsedDependencies.add(
          _parseDependency(
            name: key,
            value: value,
            kind: ProjectDependencyKind.runtime,
          ),
        );
      case 'dev-dependencies':
        parsedDependencies.add(
          _parseDependency(
            name: key,
            value: value,
            kind: ProjectDependencyKind.dev,
          ),
        );
      case 'toolchain':
        if (key == 'channel') {
          toolchainChannel = _parseString(value);
        }
      case 'lib':
        if (key == 'path') {
          pendingTarget?.path = _parseString(value);
        }
      case 'bin':
      case 'test':
        if (key == 'name') {
          pendingTarget?.name = _parseString(value);
        } else if (key == 'path') {
          pendingTarget?.path = _parseString(value);
        }
    }
  }

  flushPendingTarget();

  final resolvedPackageName = packageName;
  final package = resolvedPackageName == null
      ? null
      : ProjectPackageSnapshot(
          packageName: resolvedPackageName,
          version: packageVersion ?? '0.0.0',
          rootPath: workspaceRoot,
          manifestPath: manifestPath,
          targets: targets,
          dependencies: parsedDependencies
              .map(
                (dependency) => ProjectDependencySnapshot(
                  sourcePackageName: resolvedPackageName,
                  dependencyName: dependency.name,
                  kind: dependency.kind,
                  requirement: dependency.requirement,
                  isWorkspaceReference: dependency.isWorkspaceReference,
                ),
              )
              .toList(growable: false),
          isWorkspaceMember: isWorkspaceMember,
        );

  return _ParsedManifest(
    package: package,
    workspaceMembers: workspaceMembers,
    dependencies: package?.dependencies ?? const <ProjectDependencySnapshot>[],
    toolchain: _ParsedToolchain(channel: toolchainChannel),
  );
}

ToolchainStatusSnapshot _toolchainFromManifest(
  _ParsedToolchain toolchain, {
  required String? toolchainPin,
}) {
  if (toolchainPin != null) {
    return ToolchainStatusSnapshot(
      source: ToolchainResolutionSource.projectPin,
      detail: 'Project toolchain pin discovered at $toolchainPin.',
      pinPath: toolchainPin,
      channel: toolchain.channel,
    );
  }
  if (toolchain.channel != null) {
    return ToolchainStatusSnapshot(
      source: ToolchainResolutionSource.unknown,
      detail:
          'Manifest declares toolchain channel `${toolchain.channel}` but no project pin is present.',
      channel: toolchain.channel,
    );
  }
  return const ToolchainStatusSnapshot(
    source: ToolchainResolutionSource.unavailable,
    detail: 'No toolchain pin or explicit manifest channel was resolved.',
  );
}

Future<CompilerHandshakeSnapshot?> _probeCompiler({
  required Directory startDirectory,
}) async {
  final candidates = <String>[];
  final explicit = Platform.environment['STYIO_VIEW_STYIO_BIN'];
  if (explicit != null && explicit.isNotEmpty) {
    candidates.add(explicit);
  }
  final spioManaged = Platform.environment['SPIO_STYIO_BIN'];
  if (spioManaged != null && spioManaged.isNotEmpty) {
    candidates.add(spioManaged);
  }

  var current = startDirectory.absolute;
  while (true) {
    candidates.add(_joinPath(current.path, '../styio/build/bin/styio'));
    candidates.add(_joinPath(current.path, '../styio/build-codex/bin/styio'));
    candidates.add(
        _joinPath(current.path, '../../Unka-Malloc/styio/build/bin/styio'));
    candidates.add(_joinPath(
        current.path, '../../Unka-Malloc/styio/build-codex/bin/styio'));
    final parent = current.parent;
    if (parent.path == current.path) {
      break;
    }
    current = parent;
  }

  for (final candidate in candidates) {
    final binary = File(candidate);
    if (!await binary.exists()) {
      continue;
    }

    try {
      final result = await Process.run(binary.path, const <String>[
        '--machine-info=json',
      ]);
      if (result.exitCode != 0) {
        continue;
      }
      final decoded = jsonDecode(result.stdout as String);
      if (decoded is! Map<String, dynamic>) {
        continue;
      }
      final contracts = <String, List<int>>{};
      final rawContracts = decoded['supported_contracts'];
      if (rawContracts is Map<String, dynamic>) {
        for (final entry in rawContracts.entries) {
          final rawVersions = entry.value;
          if (rawVersions is List) {
            contracts[entry.key] = rawVersions
                .whereType<num>()
                .map((value) => value.toInt())
                .toList(growable: false);
          }
        }
      }
      return CompilerHandshakeSnapshot(
        binaryPath: binary.path,
        tool: decoded['tool'] as String? ?? 'styio',
        compilerVersion: decoded['compiler_version'] as String? ?? 'unknown',
        channel: decoded['channel'] as String? ?? 'unknown',
        variant: decoded['variant'] as String? ?? 'unknown',
        capabilities: (decoded['capabilities'] as List? ?? const <Object>[])
            .whereType<String>()
            .toList(growable: false),
        supportedContractVersions: contracts,
        integrationPhase: contracts['compile_plan']?.isNotEmpty == true
            ? 'compile-plan-live'
            : 'bootstrap-single-file',
      );
    } catch (_) {
      continue;
    }
  }
  return null;
}

Directory _discoverProjectRoot(Directory startDirectory) {
  var current = startDirectory.absolute;
  while (true) {
    final manifest = File(_joinPath(current.path, 'spio.toml'));
    final styioConfig = File(_joinPath(current.path, 'styio.toml'));
    final gitDir = Directory(_joinPath(current.path, '.git'));
    if (manifest.existsSync() ||
        styioConfig.existsSync() ||
        gitDir.existsSync()) {
      return current;
    }
    final parent = current.parent;
    if (parent.path == current.path) {
      return startDirectory.absolute;
    }
    current = parent;
  }
}

String? _findUpwardFile({
  required Directory startDirectory,
  required List<String> candidates,
}) {
  var current = startDirectory.absolute;
  while (true) {
    for (final candidate in candidates) {
      final file = File(_joinPath(current.path, candidate));
      if (file.existsSync()) {
        return file.path;
      }
    }
    final parent = current.parent;
    if (parent.path == current.path) {
      return null;
    }
    current = parent;
  }
}

String _parseString(String raw) {
  final trimmed = raw.trim();
  if (trimmed.startsWith('"') && trimmed.endsWith('"') && trimmed.length >= 2) {
    return trimmed.substring(1, trimmed.length - 1);
  }
  return trimmed;
}

List<String> _parseStringArray(String raw) {
  final trimmed = raw.trim();
  if (!trimmed.startsWith('[') || !trimmed.endsWith(']')) {
    return const <String>[];
  }
  final body = trimmed.substring(1, trimmed.length - 1).trim();
  if (body.isEmpty) {
    return const <String>[];
  }
  return body
      .split(',')
      .map(_parseString)
      .where((value) => value.isNotEmpty)
      .toList(growable: false);
}

_ParsedDependency _parseDependency({
  required String name,
  required String value,
  required ProjectDependencyKind kind,
}) {
  final trimmed = value.trim();
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    final body = trimmed.substring(1, trimmed.length - 1);
    final entries = <String, String>{};
    for (final fragment in body.split(',')) {
      final separator = fragment.contains(':')
          ? fragment.indexOf(':')
          : fragment.indexOf('=');
      if (separator == -1) {
        continue;
      }
      final key = fragment.substring(0, separator).trim();
      final entryValue = fragment.substring(separator + 1).trim();
      entries[key] = _parseString(entryValue);
    }
    final path = entries['path'];
    final version = entries['version'];
    final workspace = entries['workspace'];
    return _ParsedDependency(
      name: name,
      kind: kind,
      requirement: path != null
          ? 'path:$path'
          : version ?? (workspace == 'true' ? 'workspace' : trimmed),
      isWorkspaceReference: path != null || workspace == 'true',
    );
  }

  return _ParsedDependency(
    name: name,
    kind: kind,
    requirement: _parseString(trimmed),
    isWorkspaceReference: false,
  );
}

String _stripComment(String line) {
  final hashIndex = line.indexOf('#');
  if (hashIndex == -1) {
    return line;
  }
  return line.substring(0, hashIndex);
}

String _resolveRelativePath(String rootPath, String rawPath) {
  if (_isAbsolutePath(rawPath)) {
    return rawPath;
  }
  return Directory(rootPath).uri.resolve(rawPath).toFilePath();
}

bool _isAbsolutePath(String path) {
  return path.startsWith(Platform.pathSeparator) ||
      RegExp(r'^[A-Za-z]:[\\/]').hasMatch(path);
}

String _joinPath(String base, String child) {
  return Directory(base).uri.resolve(child).toFilePath();
}
