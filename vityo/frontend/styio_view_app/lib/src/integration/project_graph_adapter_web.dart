import '../platform/platform_target.dart';
import 'adapter_contracts.dart';
import 'project_graph_adapter.dart';
import 'project_graph_contract.dart';

Future<ProjectGraphAdapter> createPlatformProjectGraphAdapter({
  required PlatformTarget platformTarget,
}) async {
  return _HostedProjectGraphAdapter(platformTarget: platformTarget);
}

class _HostedProjectGraphAdapter implements ProjectGraphAdapter {
  _HostedProjectGraphAdapter({
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
              'Web project graph does not expose local compiler language data.',
        ),
        projectGraph: AdapterEndpointCapability(
          level: AdapterCapabilityLevel.partial,
          detail:
              'Hosted/web project graph currently uses preview data until spio publishes a project graph machine contract.',
        ),
        execution: AdapterEndpointCapability(
          level: AdapterCapabilityLevel.unavailable,
          detail:
              'Web project execution is cloud-routed and does not use the local CLI adapter.',
        ),
        runtimeEvents: AdapterEndpointCapability(
          level: AdapterCapabilityLevel.unavailable,
          detail: 'Runtime events are pending hosted workspace integration.',
        ),
      );

  @override
  Future<ProjectGraphSnapshot> loadProjectGraph() async {
    return ProjectGraphSnapshot(
      id: 'hosted-preview',
      title: platformTarget == PlatformTarget.web
          ? 'Hosted Workspace Preview'
          : 'Cloud Project Preview',
      kind: ProjectKind.hosted,
      workspaceRoot: '/workspace/hosted',
      workspaceMembers: const <String>['packages/pipeline'],
      manifestPath: '/workspace/hosted/spio.toml',
      lockfilePath: '/workspace/hosted/spio.lock',
      toolchainPinPath: '/workspace/hosted/spio-toolchain.toml',
      styioConfigPath: '/workspace/hosted/styio.toml',
      vendorRoot: '/workspace/hosted/.spio/vendor',
      buildRoot: '/workspace/hosted/.spio/build',
      packages: const <ProjectPackageSnapshot>[
        ProjectPackageSnapshot(
          packageName: 'hosted/preview',
          version: '0.0.1',
          rootPath: '/workspace/hosted',
          manifestPath: '/workspace/hosted/spio.toml',
          dependencies: <ProjectDependencySnapshot>[
            ProjectDependencySnapshot(
              sourcePackageName: 'hosted/preview',
              dependencyName: 'pipeline/core',
              kind: ProjectDependencyKind.runtime,
              requirement: 'workspace',
              isWorkspaceReference: true,
            ),
          ],
          targets: <ProjectTargetDescriptor>[
            ProjectTargetDescriptor(
              id: 'hosted/preview:bin:preview',
              packageName: 'hosted/preview',
              kind: ProjectTargetKind.bin,
              name: 'preview',
              filePath: '/workspace/hosted/src/main.styio',
            ),
          ],
        ),
      ],
      dependencies: const <ProjectDependencySnapshot>[
        ProjectDependencySnapshot(
          sourcePackageName: 'hosted/preview',
          dependencyName: 'pipeline/core',
          kind: ProjectDependencyKind.runtime,
          requirement: 'workspace',
          isWorkspaceReference: true,
        ),
      ],
      targets: const <ProjectTargetDescriptor>[
        ProjectTargetDescriptor(
          id: 'hosted/preview:bin:preview',
          packageName: 'hosted/preview',
          kind: ProjectTargetKind.bin,
          name: 'preview',
          filePath: '/workspace/hosted/src/main.styio',
        ),
      ],
      editorFiles: const <String>[
        '/workspace/hosted/src/main.styio',
        '/workspace/hosted/src/runtime_surface.styio',
      ],
      toolchain: const ToolchainStatusSnapshot(
        source: ToolchainResolutionSource.unavailable,
        detail:
            'Hosted preview uses cloud-managed toolchains until spio publishes toolchain state payloads.',
      ),
      lockState: ProjectLockState.unknown,
      vendorState: ProjectVendorState.unknown,
      notes: const <String>[
        'Hosted/web project graph remains a preview route.',
        'Project graph will switch to formal spio payloads once published.',
      ],
    );
  }
}
