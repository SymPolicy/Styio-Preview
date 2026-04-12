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
}
