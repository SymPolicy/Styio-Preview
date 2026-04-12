import '../integration/adapter_contracts.dart';
import '../integration/execution_adapter.dart';
import '../integration/project_graph_adapter.dart';
import '../integration/runtime_event_adapter.dart';
import '../editor/editor_controller.dart';
import '../language/simple_styio_language_service.dart';
import '../module_host/module_registry.dart';
import '../platform/native_module_loader.dart';
import '../platform/platform_target.dart';
import 'state/workspace_document_store.dart';
import 'state/workspace_controller.dart';

class AppBootstrap {
  const AppBootstrap({
    required this.platformTarget,
    required this.moduleRegistry,
    required this.nativeModuleLoader,
    required this.adapterCapabilities,
    required this.workspaceController,
    required this.workspaceDocumentStore,
    required this.editorController,
    required this.executionAdapter,
    required this.runtimeEventAdapter,
  });

  final PlatformTarget platformTarget;
  final ModuleRegistry moduleRegistry;
  final NativeModuleLoader nativeModuleLoader;
  final List<AdapterCapabilitySnapshot> adapterCapabilities;
  final WorkspaceController workspaceController;
  final WorkspaceDocumentStore workspaceDocumentStore;
  final EditorSessionController editorController;
  final ExecutionAdapter executionAdapter;
  final RuntimeEventAdapter runtimeEventAdapter;

  static Future<AppBootstrap> load() async {
    final platformTarget = detectPlatformTarget();
    final workspaceDocumentStore = await createWorkspaceDocumentStore();
    final moduleRegistry = await ModuleRegistry.loadFromAssets(
      indexAssetPath: 'assets/module_manifests/index.json',
      platformTarget: platformTarget,
    );
    final nativeModuleLoader = NoopNativeModuleLoader(
      platformTarget: platformTarget,
    );
    final projectGraphAdapter = await createProjectGraphAdapter(
      platformTarget: platformTarget,
    );
    final projectSnapshot = await projectGraphAdapter.loadProjectGraph();
    final workspaceController = WorkspaceController(
      projectSnapshot: projectSnapshot,
    );
    final executionAdapter = await createExecutionAdapter(
      platformTarget: platformTarget,
      projectGraph: projectSnapshot,
    );
    final runtimeEventAdapter = createRuntimeEventAdapter(
      platformTarget: platformTarget,
    );
    final ffiBridge = await nativeModuleLoader.describe('local.runtime.desktop');
    final adapterCapabilities = normalizeCapabilitySnapshots([
      projectGraphAdapter.capabilitySnapshot,
      executionAdapter.capabilitySnapshot,
      runtimeEventAdapter.capabilitySnapshot,
      buildFfiAdapterCapability(
        visible: ffiBridge.state != NativeBridgeState.unavailable,
        executionSlotVisible: ffiBridge.state != NativeBridgeState.unavailable,
        detail: ffiBridge.detail,
      ),
      buildCloudAdapterCapability(
        supportsCloudExecution: platformTarget == PlatformTarget.ios ||
            platformTarget == PlatformTarget.web ||
            platformTarget == PlatformTarget.android,
        supportsHostedProjectGraph:
            platformTarget == PlatformTarget.ios ||
                platformTarget == PlatformTarget.web,
        detail: platformTarget == PlatformTarget.web
            ? 'Hosted/cloud adapters back Web workspaces while local binaries stay unavailable.'
            : platformTarget == PlatformTarget.ios
                ? 'iOS keeps cloud execution as the compliance floor.'
                : 'Cloud adapters remain a supplement for mobile fallback and hosted workspaces.',
      ),
    ]);
    final initialDocument = await workspaceDocumentStore.loadDocument(
      workspaceController.activeFilePath,
    );

    return AppBootstrap(
      platformTarget: platformTarget,
      moduleRegistry: moduleRegistry,
      nativeModuleLoader: nativeModuleLoader,
      adapterCapabilities: adapterCapabilities,
      workspaceController: workspaceController,
      workspaceDocumentStore: workspaceDocumentStore,
      editorController: EditorSessionController(
        initialDocument: initialDocument,
        languageService: const SimpleStyioLanguageService(),
      ),
      executionAdapter: executionAdapter,
      runtimeEventAdapter: runtimeEventAdapter,
    );
  }
}
