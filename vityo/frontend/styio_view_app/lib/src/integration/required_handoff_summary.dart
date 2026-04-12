import '../platform/platform_target.dart';
import 'adapter_contracts.dart';
import 'project_graph_contract.dart';

enum HandoffOwner {
  styio,
  spio,
}

extension HandoffOwnerX on HandoffOwner {
  String get label {
    switch (this) {
      case HandoffOwner.styio:
        return 'styio';
      case HandoffOwner.spio:
        return 'spio';
    }
  }
}

class RequiredHandoff {
  const RequiredHandoff({
    required this.owner,
    required this.title,
    required this.detail,
    required this.docPath,
    this.blocking = false,
  });

  final HandoffOwner owner;
  final String title;
  final String detail;
  final String docPath;
  final bool blocking;
}

List<RequiredHandoff> summarizeRequiredHandoffs({
  required PlatformTarget platformTarget,
  required ProjectGraphSnapshot projectGraph,
  required List<AdapterCapabilitySnapshot> adapterCapabilities,
}) {
  final handoffs = <RequiredHandoff>[];
  final cli = _capabilityFor(adapterCapabilities, AdapterKind.cli);

  if (cli.languageService.level != AdapterCapabilityLevel.available) {
    handoffs.add(
      const RequiredHandoff(
        owner: HandoffOwner.styio,
        title: 'Publish language-service machine contract',
        detail:
            'Editor semantics still run on mock layers because published token, semantic, completion, formatting, hover, and quick-fix payloads are not fully available.',
        docPath: 'docs/for-styio/Styio-Language-Service-Adapter-Contract.md',
        blocking: true,
      ),
    );
  }

  final projectNeedsLiveExecution = !projectGraph.isScratch &&
      platformTarget != PlatformTarget.ios &&
      platformTarget != PlatformTarget.web &&
      !projectGraph.compilePlanConsumerAdvertised;
  if (projectNeedsLiveExecution) {
    handoffs.add(
      const RequiredHandoff(
        owner: HandoffOwner.styio,
        title: 'Publish compile-plan consumer and live execution contract',
        detail:
            'Project build/run/test remains preview-only until styio accepts versioned compile-plan input and returns machine-readable compile/run results.',
        docPath: 'docs/for-styio/Styio-Compile-Run-Contract.md',
        blocking: true,
      ),
    );
  }

  if (cli.runtimeEvents.level != AdapterCapabilityLevel.available) {
    handoffs.add(
      const RequiredHandoff(
        owner: HandoffOwner.styio,
        title: 'Publish runtime event stream',
        detail:
            'Runtime surface still uses placeholders because ordered compile/run/thread/state/log events are not published through a stable machine envelope.',
        docPath: 'docs/for-styio/Styio-Compile-Run-Contract.md',
      ),
    );
  }

  if (cli.projectGraph.level != AdapterCapabilityLevel.available) {
    handoffs.add(
      const RequiredHandoff(
        owner: HandoffOwner.spio,
        title: 'Publish project graph success payload',
        detail:
            'Workspace members, packages, targets, and toolchain state are still inferred from canonical files because spio has not published a dedicated project graph payload.',
        docPath: 'docs/for-spio/Spio-Project-Graph-Contract.md',
        blocking: true,
      ),
    );
  }

  if (projectGraph.lockState == ProjectLockState.unknown ||
      projectGraph.vendorState == ProjectVendorState.unknown) {
    handoffs.add(
      const RequiredHandoff(
        owner: HandoffOwner.spio,
        title: 'Publish lock and vendor freshness state',
        detail:
            'The shell can see canonical files, but freshness and workflow completion state still need stable success payloads from spio.',
        docPath: 'docs/for-spio/Spio-Workflow-Success-Payloads.md',
      ),
    );
  }

  if (projectGraph.toolchain.source == ToolchainResolutionSource.unknown ||
      projectGraph.toolchain.source == ToolchainResolutionSource.unavailable) {
    handoffs.add(
      const RequiredHandoff(
        owner: HandoffOwner.spio,
        title: 'Publish toolchain and registry state',
        detail:
            'Toolchain resolution, managed installs, and registry readiness need a machine-readable spio contract instead of filesystem inference.',
        docPath: 'docs/for-spio/Spio-Toolchain-And-Registry-State.md',
      ),
    );
  }

  return handoffs;
}

AdapterCapabilitySnapshot _capabilityFor(
  List<AdapterCapabilitySnapshot> snapshots,
  AdapterKind kind,
) {
  return snapshots.firstWhere(
    (snapshot) => snapshot.adapterKind == kind,
    orElse: () => AdapterCapabilitySnapshot(
      adapterKind: kind,
      languageService: const AdapterEndpointCapability(
        level: AdapterCapabilityLevel.unavailable,
        detail: 'No adapter capability resolved.',
      ),
      projectGraph: const AdapterEndpointCapability(
        level: AdapterCapabilityLevel.unavailable,
        detail: 'No adapter capability resolved.',
      ),
      execution: const AdapterEndpointCapability(
        level: AdapterCapabilityLevel.unavailable,
        detail: 'No adapter capability resolved.',
      ),
      runtimeEvents: const AdapterEndpointCapability(
        level: AdapterCapabilityLevel.unavailable,
        detail: 'No adapter capability resolved.',
      ),
    ),
  );
}
