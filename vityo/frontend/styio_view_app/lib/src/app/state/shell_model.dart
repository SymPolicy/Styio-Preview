import 'dart:async';

import 'package:flutter/foundation.dart';

import '../../editor/editor_controller.dart';
import '../../editor/document_state.dart';
import '../../integration/adapter_contracts.dart';
import '../../integration/execution_adapter.dart';
import '../../integration/runtime_event_adapter.dart';
import '../../module_host/module_definition.dart';
import '../../module_host/module_registry.dart';
import '../../platform/native_module_loader.dart';
import '../../platform/platform_target.dart';
import '../commands/app_commands.dart';
import 'workspace_document_store.dart';
import 'workspace_controller.dart';

enum BottomSurfaceTab {
  runtime,
  agent,
  debug,
}

class ShellModel extends ChangeNotifier {
  ShellModel({
    required this.platformTarget,
    required this.adapterCapabilities,
    required this.workspaceController,
    required this.workspaceDocumentStore,
    required this.moduleRegistry,
    required this.nativeModuleLoader,
    required this.editorController,
    required this.executionAdapter,
    required this.runtimeEventAdapter,
  })  : _activeBottomTab = BottomSurfaceTab.runtime,
        _activeDocumentPath = workspaceController.activeFilePath {
    workspaceController.addListener(_handleWorkspaceChanged);
    editorController.addListener(_handleDocumentChanged);
    _documentCache[_activeDocumentPath] = editorController.document;
    appendLog(
      'Shell booted for ${platformTarget.label} with '
      '${moduleRegistry.visibleModules.length} visible modules and '
      '${adapterCapabilities.length} adapter route(s).',
    );
  }

  final PlatformTarget platformTarget;
  final List<AdapterCapabilitySnapshot> adapterCapabilities;
  final WorkspaceController workspaceController;
  final WorkspaceDocumentStore workspaceDocumentStore;
  final ModuleRegistry moduleRegistry;
  final NativeModuleLoader nativeModuleLoader;
  final EditorSessionController editorController;
  final ExecutionAdapter executionAdapter;
  final RuntimeEventAdapter runtimeEventAdapter;

  BottomSurfaceTab _activeBottomTab;
  final List<String> _debugLog = <String>[];
  final Map<String, DocumentState> _documentCache = <String, DocumentState>{};
  String _activeDocumentPath;
  ExecutionSession? _lastExecutionSession;

  BottomSurfaceTab get activeBottomTab => _activeBottomTab;
  List<String> get debugLog => List<String>.unmodifiable(_debugLog);
  ExecutionSession? get lastExecutionSession => _lastExecutionSession;

  List<ModuleDefinition> get mountedModules => moduleRegistry.mountedModules;
  List<ModuleDefinition> get visibleModules => moduleRegistry.visibleModules;

  void selectBottomTab(BottomSurfaceTab tab) {
    if (_activeBottomTab == tab) {
      return;
    }
    _activeBottomTab = tab;
    appendLog('Bottom surface switched to ${tab.name}.');
  }

  Future<void> executeCommand(AppCommandId commandId) async {
    switch (commandId) {
      case AppCommandId.save:
        _documentCache[_activeDocumentPath] = editorController.document;
        await workspaceDocumentStore.saveDocument(editorController.document);
        appendLog(
          'Save requested for ${workspaceController.activeFilePath} '
          '(rev ${editorController.document.revision}).',
        );
        return;
      case AppCommandId.run:
        final session = await executionAdapter.runActiveDocument(
          platformTarget: platformTarget,
          projectGraph: workspaceController.activeProject,
          document: editorController.document,
          activeFilePath: workspaceController.activeFilePath,
        );
        _lastExecutionSession = session;
        appendLog('Run ${session.status.name}: ${session.statusMessage}');
        for (final event in session.stdoutEvents.take(3)) {
          appendLog('stdout: ${event.message}');
        }
        for (final event in session.stderrEvents.take(3)) {
          appendLog('stderr: ${event.message}');
        }
        if (session.diagnostics.isNotEmpty) {
          appendLog(
            'diagnostics: ${session.diagnostics.length} issue(s) returned by the execution route.',
          );
        }
        selectBottomTab(BottomSurfaceTab.runtime);
        notifyListeners();
        return;
      case AppCommandId.showRuntime:
        selectBottomTab(BottomSurfaceTab.runtime);
        return;
      case AppCommandId.showAgent:
        selectBottomTab(BottomSurfaceTab.agent);
        return;
      case AppCommandId.showDebug:
        selectBottomTab(BottomSurfaceTab.debug);
        return;
      case AppCommandId.refreshModules:
        appendLog(
          'Module host refresh requested on ${platformTarget.label}.',
        );
        final bridge = await nativeModuleLoader.describe(
          'local.runtime.desktop',
        );
        appendLog(
          'Native bridge ${bridge.moduleId}: ${bridge.state.name} '
          '(${bridge.detail})',
        );
        return;
      case AppCommandId.openSettings:
        appendLog('Settings route is reserved for M7 theme/profile system.');
        return;
    }
  }

  void appendLog(String message) {
    final timestamp = DateTime.now().toIso8601String().substring(11, 19);
    _debugLog.insert(0, '$timestamp  $message');
    if (_debugLog.length > 48) {
      _debugLog.removeRange(48, _debugLog.length);
    }
    notifyListeners();
  }

  void _handleWorkspaceChanged() {
    unawaited(_loadActiveWorkspaceDocument());
  }

  void _handleDocumentChanged() {
    _documentCache[_activeDocumentPath] = editorController.document;
  }

  Future<void> _loadActiveWorkspaceDocument() async {
    _documentCache[_activeDocumentPath] = editorController.document;
    final nextPath = workspaceController.activeFilePath;
    _activeDocumentPath = nextPath;
    final nextDocument = _documentCache[nextPath] ??
        await workspaceDocumentStore.loadDocument(nextPath);
    if (_activeDocumentPath != nextPath) {
      return;
    }
    editorController.loadDocument(nextDocument);
    appendLog(
      'Project route -> ${workspaceController.activeProject.title} / '
      '${workspaceController.activeFilePath}',
    );
  }

  @override
  void dispose() {
    workspaceController.removeListener(_handleWorkspaceChanged);
    editorController.removeListener(_handleDocumentChanged);
    super.dispose();
  }
}
