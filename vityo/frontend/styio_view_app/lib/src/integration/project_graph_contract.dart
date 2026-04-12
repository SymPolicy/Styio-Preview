enum ProjectKind {
  scratch,
  package,
  workspace,
  combinedRoot,
  hosted,
}

extension ProjectKindX on ProjectKind {
  String get label {
    switch (this) {
      case ProjectKind.scratch:
        return 'scratch';
      case ProjectKind.package:
        return 'package';
      case ProjectKind.workspace:
        return 'workspace';
      case ProjectKind.combinedRoot:
        return 'combined-root';
      case ProjectKind.hosted:
        return 'hosted';
    }
  }
}

enum ProjectTargetKind {
  lib,
  bin,
  test,
}

extension ProjectTargetKindX on ProjectTargetKind {
  String get label {
    switch (this) {
      case ProjectTargetKind.lib:
        return 'lib';
      case ProjectTargetKind.bin:
        return 'bin';
      case ProjectTargetKind.test:
        return 'test';
    }
  }
}

enum ProjectDependencyKind {
  runtime,
  dev,
}

extension ProjectDependencyKindX on ProjectDependencyKind {
  String get label {
    switch (this) {
      case ProjectDependencyKind.runtime:
        return 'runtime';
      case ProjectDependencyKind.dev:
        return 'dev';
    }
  }
}

enum ProjectLockState {
  fresh,
  stale,
  missing,
  unknown,
}

extension ProjectLockStateX on ProjectLockState {
  String get label {
    switch (this) {
      case ProjectLockState.fresh:
        return 'fresh';
      case ProjectLockState.stale:
        return 'stale';
      case ProjectLockState.missing:
        return 'missing';
      case ProjectLockState.unknown:
        return 'unknown';
    }
  }
}

enum ProjectVendorState {
  present,
  missing,
  unknown,
}

extension ProjectVendorStateX on ProjectVendorState {
  String get label {
    switch (this) {
      case ProjectVendorState.present:
        return 'present';
      case ProjectVendorState.missing:
        return 'missing';
      case ProjectVendorState.unknown:
        return 'unknown';
    }
  }
}

enum ToolchainResolutionSource {
  projectPin,
  managedCurrent,
  environment,
  unavailable,
  unknown,
}

extension ToolchainResolutionSourceX on ToolchainResolutionSource {
  String get label {
    switch (this) {
      case ToolchainResolutionSource.projectPin:
        return 'project-pin';
      case ToolchainResolutionSource.managedCurrent:
        return 'managed-current';
      case ToolchainResolutionSource.environment:
        return 'environment';
      case ToolchainResolutionSource.unavailable:
        return 'unavailable';
      case ToolchainResolutionSource.unknown:
        return 'unknown';
    }
  }
}

class ProjectTargetDescriptor {
  const ProjectTargetDescriptor({
    required this.id,
    required this.packageName,
    required this.kind,
    required this.name,
    required this.filePath,
  });

  final String id;
  final String packageName;
  final ProjectTargetKind kind;
  final String name;
  final String filePath;
}

class ProjectPackageSnapshot {
  const ProjectPackageSnapshot({
    required this.packageName,
    required this.version,
    required this.rootPath,
    required this.manifestPath,
    required this.targets,
    this.dependencies = const <ProjectDependencySnapshot>[],
    this.isWorkspaceMember = false,
  });

  final String packageName;
  final String version;
  final String rootPath;
  final String manifestPath;
  final List<ProjectTargetDescriptor> targets;
  final List<ProjectDependencySnapshot> dependencies;
  final bool isWorkspaceMember;
}

class ProjectDependencySnapshot {
  const ProjectDependencySnapshot({
    required this.sourcePackageName,
    required this.dependencyName,
    required this.kind,
    required this.requirement,
    this.isWorkspaceReference = false,
  });

  final String sourcePackageName;
  final String dependencyName;
  final ProjectDependencyKind kind;
  final String requirement;
  final bool isWorkspaceReference;
}

class ToolchainStatusSnapshot {
  const ToolchainStatusSnapshot({
    required this.source,
    required this.detail,
    this.pinPath,
    this.channel,
    this.version,
  });

  final ToolchainResolutionSource source;
  final String detail;
  final String? pinPath;
  final String? channel;
  final String? version;
}

class CompilerHandshakeSnapshot {
  const CompilerHandshakeSnapshot({
    required this.binaryPath,
    required this.tool,
    required this.compilerVersion,
    required this.channel,
    required this.variant,
    required this.capabilities,
    required this.supportedContractVersions,
    required this.integrationPhase,
  });

  final String binaryPath;
  final String tool;
  final String compilerVersion;
  final String channel;
  final String variant;
  final List<String> capabilities;
  final Map<String, List<int>> supportedContractVersions;
  final String integrationPhase;

  bool supportsContract(String contractName) {
    return supportedContractVersions[contractName]?.isNotEmpty == true;
  }

  String get contractSummary {
    if (supportedContractVersions.isEmpty) {
      return 'no published contract versions';
    }
    return supportedContractVersions.entries
        .map(
          (entry) => '${entry.key}:${entry.value.join('/')}',
        )
        .join(' · ');
  }

  String get capabilitySummary {
    if (capabilities.isEmpty) {
      return 'no declared capabilities';
    }
    return capabilities.join(' · ');
  }
}

class ProjectGraphSnapshot {
  const ProjectGraphSnapshot({
    required this.id,
    required this.title,
    required this.kind,
    required this.workspaceRoot,
    required this.workspaceMembers,
    required this.packages,
    required this.dependencies,
    required this.targets,
    required this.editorFiles,
    required this.toolchain,
    required this.lockState,
    required this.vendorState,
    required this.notes,
    this.manifestPath,
    this.lockfilePath,
    this.toolchainPinPath,
    this.styioConfigPath,
    this.vendorRoot,
    this.buildRoot,
    this.activeCompiler,
  });

  final String id;
  final String title;
  final ProjectKind kind;
  final String workspaceRoot;
  final List<String> workspaceMembers;
  final String? manifestPath;
  final String? lockfilePath;
  final String? toolchainPinPath;
  final String? styioConfigPath;
  final String? vendorRoot;
  final String? buildRoot;
  final List<ProjectPackageSnapshot> packages;
  final List<ProjectDependencySnapshot> dependencies;
  final List<ProjectTargetDescriptor> targets;
  final List<String> editorFiles;
  final ToolchainStatusSnapshot toolchain;
  final ProjectLockState lockState;
  final ProjectVendorState vendorState;
  final CompilerHandshakeSnapshot? activeCompiler;
  final List<String> notes;

  bool get hasManifest => manifestPath != null;

  bool get hasActiveCompiler => activeCompiler != null;

  bool get isScratch => kind == ProjectKind.scratch;

  bool get isHosted => kind == ProjectKind.hosted;

  int get packageCount => packages.length;

  int get targetCount => targets.length;

  int get editorFileCount => editorFiles.length;

  int get workspaceMemberCount => workspaceMembers.length;

  int get dependencyCount => dependencies.length;

  bool get compilePlanConsumerAdvertised =>
      activeCompiler?.supportsContract('compile_plan') == true;

  static ProjectGraphSnapshot scratch({
    required String workspaceRoot,
    required String activeFilePath,
    required String title,
    required List<String> notes,
    ToolchainStatusSnapshot? toolchain,
    CompilerHandshakeSnapshot? activeCompiler,
  }) {
    return ProjectGraphSnapshot(
      id: 'scratch:${workspaceRoot.hashCode}',
      title: title,
      kind: ProjectKind.scratch,
      workspaceRoot: workspaceRoot,
      workspaceMembers: const <String>[],
      manifestPath: null,
      lockfilePath: '$workspaceRoot/spio.lock',
      toolchainPinPath: null,
      styioConfigPath: null,
      vendorRoot: '$workspaceRoot/.spio/vendor',
      buildRoot: '$workspaceRoot/.spio/build',
      packages: const <ProjectPackageSnapshot>[],
      dependencies: const <ProjectDependencySnapshot>[],
      targets: const <ProjectTargetDescriptor>[],
      editorFiles: <String>[activeFilePath],
      toolchain: toolchain ??
          const ToolchainStatusSnapshot(
            source: ToolchainResolutionSource.unavailable,
            detail: 'No project toolchain pin is active in scratch mode.',
          ),
      lockState: ProjectLockState.missing,
      vendorState: ProjectVendorState.missing,
      activeCompiler: activeCompiler,
      notes: notes,
    );
  }
}
