import '../platform/platform_target.dart';
import 'adapter_contracts.dart';
import 'project_graph_contract.dart';

class ExecutionRouteSummary {
  const ExecutionRouteSummary({
    required this.title,
    required this.body,
    required this.primaryAdapterKind,
    required this.previewOnly,
  });

  final String title;
  final String body;
  final AdapterKind primaryAdapterKind;
  final bool previewOnly;
}

ExecutionRouteSummary summarizeExecutionRoute({
  required PlatformTarget platformTarget,
  required ProjectGraphSnapshot projectGraph,
  required List<AdapterCapabilitySnapshot> adapterCapabilities,
}) {
  final cli = _capabilityFor(adapterCapabilities, AdapterKind.cli);
  final ffi = _capabilityFor(adapterCapabilities, AdapterKind.ffi);
  final cloud = _capabilityFor(adapterCapabilities, AdapterKind.cloud);

  if (platformTarget == PlatformTarget.ios) {
    return ExecutionRouteSummary(
      title: 'Cloud-only by policy',
      body:
          'iOS keeps compile/run in the Cloud Adapter path. Local CLI and FFI execution stay disabled even when a compiler is installed elsewhere.',
      primaryAdapterKind: AdapterKind.cloud,
      previewOnly: !cloud.execution.isAvailable,
    );
  }

  if (platformTarget == PlatformTarget.web || projectGraph.isHosted) {
    return const ExecutionRouteSummary(
      title: 'Hosted project route',
      body:
          'Hosted workspaces use Cloud Adapter project graph and execution routes. Local binaries are not part of the Web path.',
      primaryAdapterKind: AdapterKind.cloud,
      previewOnly: true,
    );
  }

  if (projectGraph.isScratch) {
    if (cli.execution.level != AdapterCapabilityLevel.unavailable &&
        projectGraph.hasActiveCompiler) {
      return const ExecutionRouteSummary(
        title: 'Scratch single-file route',
        body:
            'The active buffer can run through published styio CLI single-file entry. Diagnostics return over the jsonl machine path.',
        primaryAdapterKind: AdapterKind.cli,
        previewOnly: false,
      );
    }

    if (ffi.execution.level != AdapterCapabilityLevel.unavailable) {
      return const ExecutionRouteSummary(
        title: 'Scratch route reserved for FFI',
        body:
            'No local CLI compiler was resolved, but the shell still reserves the same scratch route for a future FFI Adapter.',
        primaryAdapterKind: AdapterKind.ffi,
        previewOnly: true,
      );
    }

    return const ExecutionRouteSummary(
      title: 'Scratch route blocked',
      body:
          'No local compiler route is available yet. Install styio or point STYIO_VIEW_STYIO_BIN to a published CLI binary.',
      primaryAdapterKind: AdapterKind.cli,
      previewOnly: true,
    );
  }

  if (projectGraph.compilePlanConsumerAdvertised) {
    return const ExecutionRouteSummary(
      title: 'Project route ready for compile-plan handoff',
      body:
          'The active compiler advertises compile-plan support. The shell can keep its current UI and swap the preview path for a live adapter implementation.',
      primaryAdapterKind: AdapterKind.cli,
      previewOnly: false,
    );
  }

  if (platformTarget == PlatformTarget.android &&
      cloud.execution.level != AdapterCapabilityLevel.unavailable) {
    return const ExecutionRouteSummary(
      title: 'Project route preview-only',
      body:
          'Android keeps local-first intent, but current project build/run stays preview-only until styio publishes a live compile-plan consumer. Cloud remains the fallback route.',
      primaryAdapterKind: AdapterKind.cli,
      previewOnly: true,
    );
  }

  return const ExecutionRouteSummary(
    title: 'Project route preview-only',
    body:
        'The shell can inspect spio projects today, but build/run/test stays preview-only until styio publishes a live compile-plan consumer.',
    primaryAdapterKind: AdapterKind.cli,
    previewOnly: true,
  );
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
