import '../platform/platform_target.dart';
import 'deployment_adapter.dart';
import 'project_graph_contract.dart';

Future<DeploymentAdapter> createPlatformDeploymentAdapter({
  required PlatformTarget platformTarget,
}) async {
  return _UnavailableDeploymentAdapter(platformTarget: platformTarget);
}

class _UnavailableDeploymentAdapter implements DeploymentAdapter {
  const _UnavailableDeploymentAdapter({
    required this.platformTarget,
  });

  final PlatformTarget platformTarget;

  @override
  Future<DeploymentCommandResult> packProject({
    required ProjectGraphSnapshot projectGraph,
    String? packageName,
    String? outputPath,
  }) async {
    return _blocked('pack');
  }

  @override
  Future<DeploymentCommandResult> preparePublish({
    required ProjectGraphSnapshot projectGraph,
    String? packageName,
    String? outputPath,
  }) async {
    return _blocked('publish');
  }

  @override
  Future<DeploymentCommandResult> publishToRegistry({
    required ProjectGraphSnapshot projectGraph,
    required String registryRoot,
    String? packageName,
    String? outputPath,
  }) async {
    return _blocked('publish');
  }

  DeploymentCommandResult _blocked(String command) {
    return DeploymentCommandResult(
      command: command,
      status: DeploymentCommandStatus.blocked,
      statusMessage:
          '${platformTarget.label} does not expose local spio deployment commands.',
      stdout: '',
      stderr: '',
    );
  }
}
