import '../platform/platform_target.dart';
import 'dependency_source_adapter.dart';
import 'project_graph_contract.dart';

Future<DependencySourceAdapter> createPlatformDependencySourceAdapter({
  required PlatformTarget platformTarget,
}) async {
  return _UnavailableDependencySourceAdapter(platformTarget: platformTarget);
}

class _UnavailableDependencySourceAdapter implements DependencySourceAdapter {
  const _UnavailableDependencySourceAdapter({
    required this.platformTarget,
  });

  final PlatformTarget platformTarget;

  @override
  Future<DependencySourceCommandResult> fetchDependencies({
    required ProjectGraphSnapshot projectGraph,
    bool locked = false,
    bool offline = false,
  }) {
    return Future<DependencySourceCommandResult>.value(_blocked('fetch'));
  }

  @override
  Future<DependencySourceCommandResult> vendorDependencies({
    required ProjectGraphSnapshot projectGraph,
    String? outputPath,
    bool locked = false,
    bool offline = false,
  }) {
    return Future<DependencySourceCommandResult>.value(_blocked('vendor'));
  }

  DependencySourceCommandResult _blocked(String command) {
    return DependencySourceCommandResult(
      command: command,
      status: DependencySourceCommandStatus.blocked,
      statusMessage:
          '${platformTarget.label} does not expose local spio dependency materialization commands.',
      stdout: '',
      stderr: '',
    );
  }
}
