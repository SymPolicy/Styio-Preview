import 'package:flutter_test/flutter_test.dart';
import 'package:styio_view_app/src/integration/adapter_contracts.dart';
import 'package:styio_view_app/src/integration/execution_route_summary.dart';
import 'package:styio_view_app/src/integration/project_graph_contract.dart';
import 'package:styio_view_app/src/platform/platform_target.dart';

void main() {
  test('scratch project prefers local CLI route when compiler is resolved', () {
    final summary = summarizeExecutionRoute(
      platformTarget: PlatformTarget.macos,
      projectGraph: ProjectGraphSnapshot.scratch(
        workspaceRoot: '/workspace/demo',
        activeFilePath: '/workspace/demo/scratch/main.styio',
        title: 'Scratch',
        activeCompiler: const CompilerHandshakeSnapshot(
          binaryPath: '/toolchains/styio/bin/styio',
          tool: 'styio',
          compilerVersion: '0.1.0',
          channel: 'stable',
          variant: 'desktop',
          capabilities: <String>['machine_info_json', 'single_file_entry'],
          supportedContractVersions: <String, List<int>>{
            'machine_info': <int>[1],
          },
          integrationPhase: 'bootstrap-single-file',
        ),
        notes: const <String>['scratch route'],
      ),
      adapterCapabilities: const <AdapterCapabilitySnapshot>[
        AdapterCapabilitySnapshot(
          adapterKind: AdapterKind.cli,
          languageService: AdapterEndpointCapability(
            level: AdapterCapabilityLevel.partial,
            detail: 'partial',
          ),
          projectGraph: AdapterEndpointCapability(
            level: AdapterCapabilityLevel.unavailable,
            detail: 'n/a',
          ),
          execution: AdapterEndpointCapability(
            level: AdapterCapabilityLevel.partial,
            detail: 'single-file only',
          ),
          runtimeEvents: AdapterEndpointCapability(
            level: AdapterCapabilityLevel.unavailable,
            detail: 'n/a',
          ),
        ),
      ],
    );

    expect(summary.title, 'Scratch single-file route');
    expect(summary.primaryAdapterKind, AdapterKind.cli);
    expect(summary.previewOnly, isFalse);
  });

  test('project route stays preview-only without compile-plan consumer', () {
    final summary = summarizeExecutionRoute(
      platformTarget: PlatformTarget.macos,
      projectGraph: const ProjectGraphSnapshot(
        id: 'demo',
        title: 'Demo',
        kind: ProjectKind.package,
        workspaceRoot: '/workspace/demo',
        workspaceMembers: <String>[],
        manifestPath: '/workspace/demo/spio.toml',
        lockfilePath: '/workspace/demo/spio.lock',
        toolchainPinPath: '/workspace/demo/spio-toolchain.toml',
        dependencies: <ProjectDependencySnapshot>[],
        packages: <ProjectPackageSnapshot>[],
        targets: <ProjectTargetDescriptor>[],
        editorFiles: <String>['/workspace/demo/src/main.styio'],
        toolchain: ToolchainStatusSnapshot(
          source: ToolchainResolutionSource.projectPin,
          detail: 'project pin',
        ),
        lockState: ProjectLockState.unknown,
        vendorState: ProjectVendorState.present,
        activeCompiler: CompilerHandshakeSnapshot(
          binaryPath: '/toolchains/styio/bin/styio',
          tool: 'styio',
          compilerVersion: '0.1.0',
          channel: 'stable',
          variant: 'desktop',
          capabilities: <String>['machine_info_json'],
          supportedContractVersions: <String, List<int>>{
            'machine_info': <int>[1],
          },
          integrationPhase: 'bootstrap-single-file',
        ),
        notes: <String>[],
      ),
      adapterCapabilities: const <AdapterCapabilitySnapshot>[
        AdapterCapabilitySnapshot(
          adapterKind: AdapterKind.cli,
          languageService: AdapterEndpointCapability(
            level: AdapterCapabilityLevel.partial,
            detail: 'partial',
          ),
          projectGraph: AdapterEndpointCapability(
            level: AdapterCapabilityLevel.partial,
            detail: 'partial',
          ),
          execution: AdapterEndpointCapability(
            level: AdapterCapabilityLevel.partial,
            detail: 'preview only',
          ),
          runtimeEvents: AdapterEndpointCapability(
            level: AdapterCapabilityLevel.unavailable,
            detail: 'n/a',
          ),
        ),
      ],
    );

    expect(summary.title, 'Project route preview-only');
    expect(summary.previewOnly, isTrue);
  });

  test('project route is live when compile-plan consumer is advertised', () {
    final summary = summarizeExecutionRoute(
      platformTarget: PlatformTarget.macos,
      projectGraph: const ProjectGraphSnapshot(
        id: 'demo-live',
        title: 'Demo Live',
        kind: ProjectKind.package,
        workspaceRoot: '/workspace/demo-live',
        workspaceMembers: <String>[],
        manifestPath: '/workspace/demo-live/spio.toml',
        lockfilePath: '/workspace/demo-live/spio.lock',
        toolchainPinPath: '/workspace/demo-live/spio-toolchain.toml',
        dependencies: <ProjectDependencySnapshot>[],
        packages: <ProjectPackageSnapshot>[],
        targets: <ProjectTargetDescriptor>[],
        editorFiles: <String>['/workspace/demo-live/src/main.styio'],
        toolchain: ToolchainStatusSnapshot(
          source: ToolchainResolutionSource.projectPin,
          detail: 'project pin',
        ),
        lockState: ProjectLockState.unknown,
        vendorState: ProjectVendorState.present,
        activeCompiler: CompilerHandshakeSnapshot(
          binaryPath: '/toolchains/styio/bin/styio',
          tool: 'styio',
          compilerVersion: '0.1.0',
          channel: 'stable',
          variant: 'desktop',
          capabilities: <String>[
            'machine_info_json',
            'jsonl_diagnostics',
            'single_file_entry',
          ],
          supportedContractVersions: <String, List<int>>{
            'machine_info': <int>[1],
            'compile_plan': <int>[1],
          },
          integrationPhase: 'compile-plan-live',
          featureFlags: <String, bool>{
            'compile_plan_consumer': true,
          },
        ),
        notes: <String>[],
      ),
      adapterCapabilities: const <AdapterCapabilitySnapshot>[
        AdapterCapabilitySnapshot(
          adapterKind: AdapterKind.cli,
          languageService: AdapterEndpointCapability(
            level: AdapterCapabilityLevel.partial,
            detail: 'partial',
          ),
          projectGraph: AdapterEndpointCapability(
            level: AdapterCapabilityLevel.partial,
            detail: 'partial',
          ),
          execution: AdapterEndpointCapability(
            level: AdapterCapabilityLevel.available,
            detail: 'live compile-plan handoff',
          ),
          runtimeEvents: AdapterEndpointCapability(
            level: AdapterCapabilityLevel.unavailable,
            detail: 'n/a',
          ),
        ),
      ],
    );

    expect(summary.title, 'Project route live through spio');
    expect(summary.previewOnly, isFalse);
  });

  test('hosted web route is live once cloud project workflow is published', () {
    final summary = summarizeExecutionRoute(
      platformTarget: PlatformTarget.web,
      projectGraph: ProjectGraphSnapshot(
        id: 'hosted-demo',
        title: 'Hosted Demo',
        kind: ProjectKind.hosted,
        workspaceRoot: '/workspace/hosted-demo',
        workspaceMembers: <String>[],
        manifestPath: '/workspace/hosted-demo/spio.toml',
        dependencies: <ProjectDependencySnapshot>[],
        packages: <ProjectPackageSnapshot>[],
        targets: <ProjectTargetDescriptor>[],
        editorFiles: <String>['/workspace/hosted-demo/src/main.styio'],
        toolchain: const ToolchainStatusSnapshot(
          source: ToolchainResolutionSource.projectPin,
          detail: 'hosted pin',
        ),
        lockState: ProjectLockState.fresh,
        vendorState: ProjectVendorState.present,
        hostedWorkspace: HostedWorkspaceRecordSnapshot(
          workspaceId: 'hosted-demo',
          schemaVersion: '1',
          ownerRef: 'styio-view',
          status: HostedWorkspaceStatus.active,
          entryUrl: 'https://hosted.test/workspaces/hosted-demo',
          createdAt: DateTime.utc(2026, 4, 18),
          lastActiveAt: DateTime.utc(2026, 4, 18, 1),
          retentionDays: 7,
          exportState: HostedWorkspaceExportState.notRequested,
        ),
        notes: <String>[],
      ),
      adapterCapabilities: const <AdapterCapabilitySnapshot>[
        AdapterCapabilitySnapshot(
          adapterKind: AdapterKind.cloud,
          languageService: AdapterEndpointCapability(
            level: AdapterCapabilityLevel.partial,
            detail: 'partial',
          ),
          projectGraph: AdapterEndpointCapability(
            level: AdapterCapabilityLevel.available,
            detail: 'hosted project graph',
          ),
          execution: AdapterEndpointCapability(
            level: AdapterCapabilityLevel.available,
            detail: 'hosted execution',
          ),
          runtimeEvents: AdapterEndpointCapability(
            level: AdapterCapabilityLevel.available,
            detail: 'hosted runtime events',
          ),
        ),
      ],
    );

    expect(summary.title, 'Hosted project route');
    expect(summary.primaryAdapterKind, AdapterKind.cloud);
    expect(summary.previewOnly, isFalse);
  });
}
