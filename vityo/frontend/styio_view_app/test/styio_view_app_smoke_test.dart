import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:styio_view_app/src/app/app_bootstrap.dart';
import 'package:styio_view_app/src/app/state/workspace_document_store.dart';
import 'package:styio_view_app/src/app/state/shell_model.dart';
import 'package:styio_view_app/src/app/state/shell_scope.dart';
import 'package:styio_view_app/src/app/state/workspace_controller.dart';
import 'package:styio_view_app/src/app/styio_view_app.dart';
import 'package:styio_view_app/src/app/layout/styio_shell_scaffold.dart';
import 'package:styio_view_app/src/editor/editor_controller.dart';
import 'package:styio_view_app/src/editor/document_state.dart';
import 'package:styio_view_app/src/integration/adapter_contracts.dart';
import 'package:styio_view_app/src/integration/execution_adapter.dart';
import 'package:styio_view_app/src/integration/project_graph_contract.dart';
import 'package:styio_view_app/src/integration/runtime_event_adapter.dart';
import 'package:styio_view_app/src/language/language_contract.dart';
import 'package:styio_view_app/src/language/simple_styio_language_service.dart';
import 'package:styio_view_app/src/module_host/module_registry.dart';
import 'package:styio_view_app/src/platform/native_module_loader.dart';
import 'package:styio_view_app/src/platform/platform_target.dart';

void main() {
  Future<void> revealMobileLanguagePane(WidgetTester tester) async {
    final mobileInspectorScroll = find.byKey(
      const ValueKey('editor-language-layout-scroll-mobile'),
      skipOffstage: false,
    );
    if (mobileInspectorScroll.evaluate().isNotEmpty) {
      for (var attempt = 0; attempt < 2; attempt += 1) {
        await tester.drag(
          mobileInspectorScroll,
          const Offset(0, -260),
        );
        await tester.pumpAndSettle();
      }
    }
  }

  ProjectGraphSnapshot createProjectSnapshot(PlatformTarget target) {
    final root = target == PlatformTarget.ios
        ? '/workspace/cloud-preview'
        : '/workspace/demo';
    final title =
        target == PlatformTarget.ios ? 'Cloud Preview Project' : 'Demo Project';
    const packageName = 'demo/app';
    final targets = <ProjectTargetDescriptor>[
      ProjectTargetDescriptor(
        id: '$packageName:bin:demo',
        packageName: packageName,
        kind: ProjectTargetKind.bin,
        name: 'demo',
        filePath: '$root/src/main.styio',
      ),
      ProjectTargetDescriptor(
        id: '$packageName:test:render-flow',
        packageName: packageName,
        kind: ProjectTargetKind.test,
        name: 'render-flow',
        filePath: '$root/src/render_flow.styio',
      ),
    ];

    return ProjectGraphSnapshot(
      id: '$root/spio.toml',
      title: title,
      kind: ProjectKind.combinedRoot,
      workspaceRoot: root,
      workspaceMembers: const <String>['packages/render-kit'],
      manifestPath: '$root/spio.toml',
      lockfilePath: '$root/spio.lock',
      toolchainPinPath: '$root/spio-toolchain.toml',
      styioConfigPath: '$root/styio.toml',
      vendorRoot: '$root/.spio/vendor',
      buildRoot: '$root/.spio/build',
      packages: <ProjectPackageSnapshot>[
        ProjectPackageSnapshot(
          packageName: packageName,
          version: '0.0.1',
          rootPath: root,
          manifestPath: '$root/spio.toml',
          dependencies: const <ProjectDependencySnapshot>[
            ProjectDependencySnapshot(
              sourcePackageName: 'demo/app',
              dependencyName: 'render/kit',
              kind: ProjectDependencyKind.runtime,
              requirement: 'workspace',
              isWorkspaceReference: true,
            ),
            ProjectDependencySnapshot(
              sourcePackageName: 'demo/app',
              dependencyName: 'assertions',
              kind: ProjectDependencyKind.dev,
              requirement: '^1.0.0',
            ),
          ],
          targets: targets,
        ),
      ],
      dependencies: const <ProjectDependencySnapshot>[
        ProjectDependencySnapshot(
          sourcePackageName: 'demo/app',
          dependencyName: 'render/kit',
          kind: ProjectDependencyKind.runtime,
          requirement: 'workspace',
          isWorkspaceReference: true,
        ),
        ProjectDependencySnapshot(
          sourcePackageName: 'demo/app',
          dependencyName: 'assertions',
          kind: ProjectDependencyKind.dev,
          requirement: '^1.0.0',
        ),
      ],
      targets: targets,
      editorFiles: <String>[
        '$root/src/main.styio',
        '$root/src/render_flow.styio',
        '$root/src/runtime_graph.styio',
      ],
      toolchain: const ToolchainStatusSnapshot(
        source: ToolchainResolutionSource.projectPin,
        detail: 'Project toolchain pin discovered for the smoke test fixture.',
        pinPath: '/workspace/demo/spio-toolchain.toml',
        channel: 'stable',
        version: '0.0.1',
      ),
      lockState: ProjectLockState.unknown,
      vendorState: ProjectVendorState.present,
      activeCompiler: const CompilerHandshakeSnapshot(
        binaryPath: '/toolchains/styio/bin/styio',
        tool: 'styio',
        compilerVersion: '0.0.1',
        channel: 'stable',
        variant: 'smoke-fixture',
        capabilities: <String>[
          'machine_info_json',
          'single_file_entry',
          'jsonl_diagnostics',
        ],
        supportedContractVersions: <String, List<int>>{
          'machine_info': <int>[1],
          'jsonl_diagnostics': <int>[1],
        },
        integrationPhase: 'bootstrap-single-file',
      ),
      notes: const <String>[
        'Smoke test fixture mirrors a canonical spio project.',
      ],
    );
  }

  Future<AppBootstrap> createBootstrap(PlatformTarget target) async {
    final projectSnapshot = createProjectSnapshot(target);
    final workspaceController = WorkspaceController(
      projectSnapshot: projectSnapshot,
    );
    return AppBootstrap(
      platformTarget: target,
      moduleRegistry: ModuleRegistry(
        platformTarget: target,
        definitions: const [],
      ),
      nativeModuleLoader: NoopNativeModuleLoader(
        platformTarget: target,
      ),
      adapterCapabilities: normalizeCapabilitySnapshots([
        const AdapterCapabilitySnapshot(
          adapterKind: AdapterKind.cli,
          languageService: AdapterEndpointCapability(
            level: AdapterCapabilityLevel.partial,
            detail:
                'Smoke test CLI adapter keeps language-service contracts partial.',
          ),
          projectGraph: AdapterEndpointCapability(
            level: AdapterCapabilityLevel.available,
            detail:
                'Smoke test project graph is resolved from a canonical fixture.',
          ),
          execution: AdapterEndpointCapability(
            level: AdapterCapabilityLevel.partial,
            detail: 'Smoke test execution stays preview-only.',
          ),
          runtimeEvents: AdapterEndpointCapability(
            level: AdapterCapabilityLevel.unavailable,
            detail: 'Smoke test runtime events are not wired.',
          ),
        ),
        buildFfiAdapterCapability(
          visible: target != PlatformTarget.ios && target != PlatformTarget.web,
          executionSlotVisible:
              target != PlatformTarget.ios && target != PlatformTarget.web,
          detail: 'Smoke test FFI slot stays deferred.',
        ),
        buildCloudAdapterCapability(
          supportsCloudExecution:
              target == PlatformTarget.ios || target == PlatformTarget.android,
          supportsHostedProjectGraph:
              target == PlatformTarget.ios || target == PlatformTarget.web,
          detail: 'Smoke test cloud route remains illustrative.',
        ),
      ]),
      workspaceController: workspaceController,
      workspaceDocumentStore: InMemoryWorkspaceDocumentStore(),
      editorController: EditorSessionController(
        initialDocument: EditorSessionController.seedDocumentForPath(
          workspaceController.activeFilePath,
        ),
        languageService: const SimpleStyioLanguageService(),
      ),
      executionAdapter: const _FakeExecutionAdapter(),
      runtimeEventAdapter: createRuntimeEventAdapter(platformTarget: target),
    );
  }

  testWidgets('builds shared shell scaffold in desktop viewport family', (
    tester,
  ) async {
    tester.view.physicalSize = const Size(1600, 1200);
    tester.view.devicePixelRatio = 1.0;
    addTearDown(tester.view.resetPhysicalSize);
    addTearDown(tester.view.resetDevicePixelRatio);

    final bootstrap = await createBootstrap(PlatformTarget.macos);

    await tester.pumpWidget(
      StyioViewApp(bootstrap: bootstrap),
    );

    expect(
        find.byKey(const ValueKey('shell-viewport-desktop')), findsOneWidget);
    expect(
        find.byKey(const ValueKey('editor-viewport-desktop')), findsOneWidget);
    expect(find.byKey(const ValueKey('language-pane-desktop')), findsOneWidget);
    expect(
      find.byKey(const ValueKey('editor-language-family-desktop')),
      findsOneWidget,
    );
    expect(
      find.byKey(const ValueKey('runtime-surface-desktop')),
      findsOneWidget,
    );
    expect(find.text('Styio View Integration Shell'), findsOneWidget);
    expect(find.text('Project Graph'), findsOneWidget);
    await tester.scrollUntilVisible(
      find.byKey(const ValueKey('required-handoffs-card')),
      120,
      scrollable: find.descendant(
        of: find.byKey(const ValueKey('workspace-sidebar-scroll')),
        matching: find.byType(Scrollable),
      ),
    );
    await tester.pumpAndSettle();
    expect(find.text('Required Handoffs'), findsOneWidget);
    await tester.scrollUntilVisible(
      find.text('Packages'),
      120,
      scrollable: find.descendant(
        of: find.byKey(const ValueKey('workspace-sidebar-scroll')),
        matching: find.byType(Scrollable),
      ),
    );
    await tester.pumpAndSettle();
    expect(find.text('Packages'), findsOneWidget);
    expect(find.text('demo/app'), findsWidgets);
    expect(find.text('Adapter Routes'), findsWidgets);
    expect(
      find.byKey(
        const ValueKey('required-handoffs-card'),
        skipOffstage: false,
      ),
      findsOneWidget,
    );
    expect(find.byIcon(Icons.play_arrow_rounded), findsWidgets);
    expect(find.byIcon(Icons.arrow_right_alt_rounded), findsWidgets);

    await tester.tap(find.byKey(const ValueKey('source-buffer-surface')));
    await tester.pump();

    await tester.tap(find.byKey(const ValueKey('source-line-0')));
    await tester.pump();

    expect(find.text('editing'), findsOneWidget);
    expect(
      find.byKey(const ValueKey('inline-language-feedback-desktop')),
      findsOneWidget,
    );
    expect(
      find.byKey(const ValueKey('active-token-context')),
      findsOneWidget,
    );

    await tester.sendKeyDownEvent(LogicalKeyboardKey.shiftLeft);
    await tester.sendKeyEvent(LogicalKeyboardKey.arrowRight);
    await tester.sendKeyEvent(LogicalKeyboardKey.arrowRight);
    await tester.sendKeyUpEvent(LogicalKeyboardKey.shiftLeft);
    await tester.pump();

    expect(find.textContaining('selection '), findsOneWidget);

    await tester.tap(find.text('Debug'));
    await tester.pumpAndSettle();

    expect(
      find.byKey(const ValueKey('debug-surface-desktop')),
      findsOneWidget,
    );
  });

  testWidgets('builds shared shell scaffold in mobile viewport family', (
    tester,
  ) async {
    tester.view.physicalSize = const Size(430, 932);
    tester.view.devicePixelRatio = 1.0;
    addTearDown(tester.view.resetPhysicalSize);
    addTearDown(tester.view.resetDevicePixelRatio);

    final bootstrap = await createBootstrap(PlatformTarget.android);

    await tester.pumpWidget(
      StyioViewApp(bootstrap: bootstrap),
    );

    expect(find.byKey(const ValueKey('shell-viewport-mobile')), findsOneWidget);
    expect(
        find.byKey(const ValueKey('editor-viewport-mobile')), findsOneWidget);
    expect(
      find.byKey(const ValueKey('editor-language-family-mobile')),
      findsOneWidget,
    );
    expect(find.text('Mobile'), findsWidgets);

    await revealMobileLanguagePane(tester);
    expect(
      find.byKey(const ValueKey('language-pane-mobile'), skipOffstage: false),
      findsOneWidget,
    );

    final shell = ShellScope.of(
      tester.element(find.byType(StyioShellScaffold)),
    );
    shell.selectBottomTab(BottomSurfaceTab.agent);
    await tester.pumpAndSettle();

    await tester.drag(
      find.byType(Scrollable).first,
      const Offset(0, -720),
    );
    await tester.pumpAndSettle();

    expect(
      find.byKey(
        const ValueKey('agent-surface-mobile'),
        skipOffstage: false,
      ),
      findsOneWidget,
    );
  });

  testWidgets('keeps mobile editor layout on wide iOS viewport', (
    tester,
  ) async {
    tester.view.physicalSize = const Size(1366, 1024);
    tester.view.devicePixelRatio = 1.0;
    addTearDown(tester.view.resetPhysicalSize);
    addTearDown(tester.view.resetDevicePixelRatio);

    final bootstrap = await createBootstrap(PlatformTarget.ios);

    await tester.pumpWidget(
      StyioViewApp(bootstrap: bootstrap),
    );

    expect(find.byKey(const ValueKey('shell-viewport-mobile')), findsOneWidget);
    expect(
        find.byKey(const ValueKey('editor-viewport-mobile')), findsOneWidget);
    expect(
      find.byKey(const ValueKey('editor-language-family-mobile')),
      findsOneWidget,
    );
    expect(
      find.byKey(const ValueKey('editor-language-family-desktop')),
      findsNothing,
    );

    await revealMobileLanguagePane(tester);
    expect(
      find.byKey(const ValueKey('language-pane-mobile'), skipOffstage: false),
      findsOneWidget,
    );
  });

  testWidgets('shows token context for the caret-resolved token', (
    tester,
  ) async {
    tester.view.physicalSize = const Size(1600, 1200);
    tester.view.devicePixelRatio = 1.0;
    addTearDown(tester.view.resetPhysicalSize);
    addTearDown(tester.view.resetDevicePixelRatio);

    final bootstrap = await createBootstrap(PlatformTarget.macos);
    final sourceOffset = bootstrap.editorController.document.text.indexOf(
      'source',
    );
    bootstrap.editorController.selectCollapsed(sourceOffset + 2);

    await tester.pumpWidget(
      StyioViewApp(bootstrap: bootstrap),
    );

    expect(
      find.byKey(const ValueKey('active-token-context')),
      findsOneWidget,
    );
    expect(find.textContaining('Token `source`'), findsOneWidget);
  });

  testWidgets('applies inline diagnostic quick fix from the active line', (
    tester,
  ) async {
    tester.view.physicalSize = const Size(1600, 1200);
    tester.view.devicePixelRatio = 1.0;
    addTearDown(tester.view.resetPhysicalSize);
    addTearDown(tester.view.resetDevicePixelRatio);

    final bootstrap = await createBootstrap(PlatformTarget.macos);
    bootstrap.editorController.loadDocument(
      const DocumentState(
        documentId: 'broken.styio',
        text: 'fn broken() {\n  emit stream\n',
        revision: 0,
      ),
    );

    await tester.pumpWidget(
      StyioViewApp(bootstrap: bootstrap),
    );

    await tester.tap(find.byKey(const ValueKey('source-buffer-surface')));
    await tester.pump();
    await tester.tap(find.byKey(const ValueKey('source-line-0')));
    await tester.pump();

    expect(
      find.byKey(const ValueKey('inline-diagnostic-fix-0')),
      findsOneWidget,
    );

    await tester.ensureVisible(
      find.byKey(const ValueKey('inline-diagnostic-fix-0')),
    );
    await tester.pumpAndSettle();
    await tester.tap(find.byKey(const ValueKey('inline-diagnostic-fix-0')));
    await tester.pump();

    expect(bootstrap.editorController.document.text.endsWith('}'), isTrue);
    expect(
      bootstrap.editorController.analysis.diagnostics
          .where((item) => item.code == 'unclosed-block'),
      isEmpty,
    );
  });
}

class _FakeExecutionAdapter implements ExecutionAdapter {
  const _FakeExecutionAdapter();

  @override
  AdapterCapabilitySnapshot get capabilitySnapshot =>
      const AdapterCapabilitySnapshot(
        adapterKind: AdapterKind.cli,
        languageService: AdapterEndpointCapability(
          level: AdapterCapabilityLevel.unavailable,
          detail: 'Fake execution adapter exposes no language-service data.',
        ),
        projectGraph: AdapterEndpointCapability(
          level: AdapterCapabilityLevel.unavailable,
          detail: 'Fake execution adapter does not own project graph data.',
        ),
        execution: AdapterEndpointCapability(
          level: AdapterCapabilityLevel.partial,
          detail: 'Fake execution adapter keeps run requests blocked.',
        ),
        runtimeEvents: AdapterEndpointCapability(
          level: AdapterCapabilityLevel.unavailable,
          detail: 'Fake execution adapter does not emit runtime events.',
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
      sessionId: 'smoke-test',
      kind: 'run',
      status: ExecutionSessionStatus.blocked,
      statusMessage: 'Smoke test execution route remains blocked.',
      diagnostics: <Diagnostic>[],
      stdoutEvents: <ExecutionLogEvent>[],
      stderrEvents: <ExecutionLogEvent>[],
    );
  }
}
