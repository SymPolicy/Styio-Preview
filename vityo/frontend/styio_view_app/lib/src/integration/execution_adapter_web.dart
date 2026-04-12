import '../editor/document_state.dart';
import '../language/language_contract.dart';
import '../platform/platform_target.dart';
import 'adapter_contracts.dart';
import 'execution_adapter.dart';
import 'project_graph_contract.dart';

Future<ExecutionAdapter> createPlatformExecutionAdapter({
  required PlatformTarget platformTarget,
  required ProjectGraphSnapshot projectGraph,
}) async {
  return _HostedExecutionAdapter(platformTarget: platformTarget);
}

class _HostedExecutionAdapter implements ExecutionAdapter {
  _HostedExecutionAdapter({
    required this.platformTarget,
  });

  final PlatformTarget platformTarget;

  @override
  AdapterCapabilitySnapshot get capabilitySnapshot => const AdapterCapabilitySnapshot(
        adapterKind: AdapterKind.cloud,
        languageService: AdapterEndpointCapability(
          level: AdapterCapabilityLevel.partial,
          detail: 'Hosted language service remains a future route.',
        ),
        projectGraph: AdapterEndpointCapability(
          level: AdapterCapabilityLevel.partial,
          detail: 'Hosted project graph stays preview-only until spio publishes dedicated machine payloads.',
        ),
        execution: AdapterEndpointCapability(
          level: AdapterCapabilityLevel.partial,
          detail: 'Hosted execution is reserved for future cloud/runtime integration.',
        ),
        runtimeEvents: AdapterEndpointCapability(
          level: AdapterCapabilityLevel.partial,
          detail: 'Hosted runtime events stay reserved behind the cloud adapter.',
        ),
      );

  @override
  Future<ExecutionSession> runActiveDocument({
    required PlatformTarget platformTarget,
    required ProjectGraphSnapshot projectGraph,
    required DocumentState document,
    required String activeFilePath,
  }) async {
    return const ExecutionSession(
      sessionId: 'hosted-preview',
      kind: 'run',
      status: ExecutionSessionStatus.blocked,
      statusMessage:
          'Hosted/cloud execution is not wired into the current preview shell yet.',
      diagnostics: <Diagnostic>[],
      stdoutEvents: <ExecutionLogEvent>[],
      stderrEvents: <ExecutionLogEvent>[],
    );
  }
}
