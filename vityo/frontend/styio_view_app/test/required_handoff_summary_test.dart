import 'package:flutter_test/flutter_test.dart';
import 'package:styio_view_app/src/integration/adapter_contracts.dart';
import 'package:styio_view_app/src/integration/project_graph_contract.dart';
import 'package:styio_view_app/src/integration/required_handoff_summary.dart';
import 'package:styio_view_app/src/platform/platform_target.dart';

void main() {
  test('summarizes styio and spio handoffs for preview-only project route', () {
    final handoffs = summarizeRequiredHandoffs(
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
          source: ToolchainResolutionSource.unknown,
          detail: 'unknown',
        ),
        lockState: ProjectLockState.unknown,
        vendorState: ProjectVendorState.unknown,
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
            detail: 'not published',
          ),
        ),
      ],
    );

    expect(handoffs, isNotEmpty);
    expect(
      handoffs.any(
        (handoff) =>
            handoff.owner == HandoffOwner.styio &&
            handoff.title.contains('language-service'),
      ),
      isTrue,
    );
    expect(
      handoffs.any(
        (handoff) =>
            handoff.owner == HandoffOwner.styio &&
            handoff.title.contains('compile-plan consumer'),
      ),
      isTrue,
    );
    expect(
      handoffs.any(
        (handoff) =>
            handoff.owner == HandoffOwner.spio &&
            handoff.title.contains('project graph'),
      ),
      isTrue,
    );
    expect(
      handoffs.any(
        (handoff) =>
            handoff.owner == HandoffOwner.spio &&
            handoff.title.contains('toolchain'),
      ),
      isTrue,
    );
  });

  test('does not request live compile-plan handoff for iOS cloud-only route',
      () {
    final handoffs = summarizeRequiredHandoffs(
      platformTarget: PlatformTarget.ios,
      projectGraph: const ProjectGraphSnapshot(
        id: 'cloud-demo',
        title: 'Cloud Demo',
        kind: ProjectKind.hosted,
        workspaceRoot: '/workspace/cloud-demo',
        workspaceMembers: <String>[],
        manifestPath: '/workspace/cloud-demo/spio.toml',
        dependencies: <ProjectDependencySnapshot>[],
        packages: <ProjectPackageSnapshot>[],
        targets: <ProjectTargetDescriptor>[],
        editorFiles: <String>['/workspace/cloud-demo/src/main.styio'],
        toolchain: ToolchainStatusSnapshot(
          source: ToolchainResolutionSource.projectPin,
          detail: 'project pin',
        ),
        lockState: ProjectLockState.fresh,
        vendorState: ProjectVendorState.present,
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
            level: AdapterCapabilityLevel.unavailable,
            detail: 'cloud only',
          ),
          runtimeEvents: AdapterEndpointCapability(
            level: AdapterCapabilityLevel.unavailable,
            detail: 'cloud only',
          ),
        ),
      ],
    );

    expect(
      handoffs.any(
        (handoff) => handoff.title.contains('compile-plan consumer'),
      ),
      isFalse,
    );
  });
}
