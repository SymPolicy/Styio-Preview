import '../platform/platform_target.dart';
import 'adapter_contracts.dart';
import 'execution_adapter.dart';

abstract class RuntimeEventAdapter {
  AdapterCapabilitySnapshot get capabilitySnapshot;

  Stream<RuntimeEventEnvelope> sessionEvents(String sessionId);
}

RuntimeEventAdapter createRuntimeEventAdapter({
  required PlatformTarget platformTarget,
}) {
  if (platformTarget == PlatformTarget.ios || platformTarget == PlatformTarget.web) {
    return const NoopRuntimeEventAdapter(
      capabilitySnapshot: AdapterCapabilitySnapshot(
        adapterKind: AdapterKind.cloud,
        languageService: AdapterEndpointCapability(
          level: AdapterCapabilityLevel.unavailable,
          detail: 'Cloud runtime events remain unpublished.',
        ),
        projectGraph: AdapterEndpointCapability(
          level: AdapterCapabilityLevel.unavailable,
          detail: 'Cloud runtime event adapter does not expose project graph data.',
        ),
        execution: AdapterEndpointCapability(
          level: AdapterCapabilityLevel.partial,
          detail: 'Cloud execution route is reserved but not yet integrated.',
        ),
        runtimeEvents: AdapterEndpointCapability(
          level: AdapterCapabilityLevel.partial,
          detail: 'Cloud runtime events will flow once the hosted route is published.',
        ),
      ),
    );
  }

  return const NoopRuntimeEventAdapter(
    capabilitySnapshot: AdapterCapabilitySnapshot(
      adapterKind: AdapterKind.cli,
      languageService: AdapterEndpointCapability(
        level: AdapterCapabilityLevel.unavailable,
        detail: 'CLI runtime event adapter does not expose language-service data.',
      ),
      projectGraph: AdapterEndpointCapability(
        level: AdapterCapabilityLevel.unavailable,
        detail: 'CLI runtime event adapter does not expose project graph data.',
      ),
      execution: AdapterEndpointCapability(
        level: AdapterCapabilityLevel.partial,
        detail: 'CLI execution stays single-file only until project-level contracts are published.',
      ),
      runtimeEvents: AdapterEndpointCapability(
        level: AdapterCapabilityLevel.unavailable,
        detail: 'Runtime event streaming is not yet published by styio.',
      ),
    ),
  );
}

class NoopRuntimeEventAdapter implements RuntimeEventAdapter {
  const NoopRuntimeEventAdapter({
    required this.capabilitySnapshot,
  });

  @override
  final AdapterCapabilitySnapshot capabilitySnapshot;

  @override
  Stream<RuntimeEventEnvelope> sessionEvents(String sessionId) {
    return const Stream<RuntimeEventEnvelope>.empty();
  }
}
