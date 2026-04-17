import '../platform/platform_target.dart';
import 'project_graph_contract.dart';
import 'toolchain_management_adapter.dart';

Future<ToolchainManagementAdapter> createPlatformToolchainManagementAdapter({
  required PlatformTarget platformTarget,
}) async {
  return _UnavailableToolchainManagementAdapter(platformTarget: platformTarget);
}

class _UnavailableToolchainManagementAdapter
    implements ToolchainManagementAdapter {
  const _UnavailableToolchainManagementAdapter({
    required this.platformTarget,
  });

  final PlatformTarget platformTarget;

  @override
  Future<ToolchainCommandResult> installManagedCompiler({
    required ProjectGraphSnapshot projectGraph,
    required String styioBinaryPath,
  }) {
    return Future<ToolchainCommandResult>.value(_blocked('tool install'));
  }

  @override
  Future<ToolchainCommandResult> useManagedCompiler({
    required ProjectGraphSnapshot projectGraph,
    required String compilerVersion,
    String? channel,
  }) {
    return Future<ToolchainCommandResult>.value(_blocked('tool use'));
  }

  @override
  Future<ToolchainCommandResult> pinManagedCompiler({
    required ProjectGraphSnapshot projectGraph,
    required String compilerVersion,
    String? channel,
  }) {
    return Future<ToolchainCommandResult>.value(_blocked('tool pin'));
  }

  @override
  Future<ToolchainCommandResult> clearPinnedCompiler({
    required ProjectGraphSnapshot projectGraph,
  }) {
    return Future<ToolchainCommandResult>.value(_blocked('tool pin'));
  }

  ToolchainCommandResult _blocked(String command) {
    return ToolchainCommandResult(
      command: command,
      status: ToolchainCommandStatus.blocked,
      statusMessage:
          '${platformTarget.label} does not expose local spio toolchain management.',
      stdout: '',
      stderr: '',
    );
  }
}
