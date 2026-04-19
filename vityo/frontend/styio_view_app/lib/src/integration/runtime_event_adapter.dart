import '../platform/platform_target.dart';
import 'adapter_contracts.dart';
import 'execution_adapter.dart';
import 'hosted_control_plane.dart';

final Map<String, List<RuntimeEventEnvelope>> _runtimeEventRegistry =
    <String, List<RuntimeEventEnvelope>>{};

abstract class RuntimeEventAdapter {
  AdapterCapabilitySnapshot get capabilitySnapshot;

  Stream<RuntimeEventEnvelope> sessionEvents(String sessionId);
}

void recordRuntimeEventsForSession(
  String sessionId,
  List<RuntimeEventEnvelope> events,
) {
  if (sessionId.isEmpty) {
    return;
  }
  _runtimeEventRegistry[sessionId] = List<RuntimeEventEnvelope>.unmodifiable(
    events,
  );
}

void clearRuntimeEventsForSession(String sessionId) {
  if (sessionId.isEmpty) {
    return;
  }
  _runtimeEventRegistry.remove(sessionId);
}

RuntimeEventAdapter createRuntimeEventAdapter({
  required PlatformTarget platformTarget,
}) {
  final hostedConfig = resolveHostedControlPlaneConfig(
    platformTarget: platformTarget,
  );
  if (hostedConfig != null) {
    return const _HostedPublishedRuntimeEventAdapter(
      capabilitySnapshot: AdapterCapabilitySnapshot(
        adapterKind: AdapterKind.cloud,
        languageService: AdapterEndpointCapability(
          level: AdapterCapabilityLevel.partial,
          detail:
              'Hosted runtime adapter does not yet expose cloud language-service events.',
        ),
        projectGraph: AdapterEndpointCapability(
          level: AdapterCapabilityLevel.available,
          detail:
              'Hosted runtime adapter follows the same shared control-plane project route.',
          supportedContractVersions: <int>[1],
        ),
        execution: AdapterEndpointCapability(
          level: AdapterCapabilityLevel.available,
          detail: 'Hosted execution is live through the shared control plane.',
          supportedContractVersions: <int>[1],
        ),
        runtimeEvents: AdapterEndpointCapability(
          level: AdapterCapabilityLevel.available,
          detail:
              'Hosted execution publishes replayable runtime event payloads through the shared control plane.',
          supportedContractVersions: <int>[1],
        ),
      ),
    );
  }

  if (platformTarget == PlatformTarget.ios ||
      platformTarget == PlatformTarget.web) {
    return const NoopRuntimeEventAdapter(
      capabilitySnapshot: AdapterCapabilitySnapshot(
        adapterKind: AdapterKind.cloud,
        languageService: AdapterEndpointCapability(
          level: AdapterCapabilityLevel.unavailable,
          detail: 'Cloud runtime events remain unpublished.',
        ),
        projectGraph: AdapterEndpointCapability(
          level: AdapterCapabilityLevel.unavailable,
          detail:
              'Cloud runtime event adapter does not expose project graph data.',
        ),
        execution: AdapterEndpointCapability(
          level: AdapterCapabilityLevel.partial,
          detail: 'Cloud execution route is reserved but not yet integrated.',
        ),
        runtimeEvents: AdapterEndpointCapability(
          level: AdapterCapabilityLevel.partial,
          detail:
              'Cloud runtime events will flow once the hosted route is published.',
        ),
      ),
    );
  }

  return const _LocalPublishedRuntimeEventAdapter(
    capabilitySnapshot: AdapterCapabilitySnapshot(
      adapterKind: AdapterKind.cli,
      languageService: AdapterEndpointCapability(
        level: AdapterCapabilityLevel.unavailable,
        detail:
            'CLI runtime event adapter does not expose language-service data.',
      ),
      projectGraph: AdapterEndpointCapability(
        level: AdapterCapabilityLevel.unavailable,
        detail: 'CLI runtime event adapter does not expose project graph data.',
      ),
      execution: AdapterEndpointCapability(
        level: AdapterCapabilityLevel.partial,
        detail:
            'CLI execution is live for single-file and spio-routed project workflows.',
      ),
      runtimeEvents: AdapterEndpointCapability(
        level: AdapterCapabilityLevel.partial,
        detail:
            'Local CLI execution publishes replayable runtime event artifacts for completed sessions.',
        supportedContractVersions: const <int>[1],
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

class _HostedPublishedRuntimeEventAdapter implements RuntimeEventAdapter {
  const _HostedPublishedRuntimeEventAdapter({
    required this.capabilitySnapshot,
  });

  @override
  final AdapterCapabilitySnapshot capabilitySnapshot;

  @override
  Stream<RuntimeEventEnvelope> sessionEvents(String sessionId) {
    final events = _runtimeEventRegistry[sessionId];
    if (events == null || events.isEmpty) {
      return const Stream<RuntimeEventEnvelope>.empty();
    }
    return Stream<RuntimeEventEnvelope>.fromIterable(events);
  }
}

class _LocalPublishedRuntimeEventAdapter implements RuntimeEventAdapter {
  const _LocalPublishedRuntimeEventAdapter({
    required this.capabilitySnapshot,
  });

  @override
  final AdapterCapabilitySnapshot capabilitySnapshot;

  @override
  Stream<RuntimeEventEnvelope> sessionEvents(String sessionId) {
    final events = _runtimeEventRegistry[sessionId];
    if (events == null || events.isEmpty) {
      return const Stream<RuntimeEventEnvelope>.empty();
    }
    return Stream<RuntimeEventEnvelope>.fromIterable(events);
  }
}
