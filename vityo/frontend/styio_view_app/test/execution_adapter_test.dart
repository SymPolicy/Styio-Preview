import 'dart:convert';
import 'dart:io';

import 'package:flutter_test/flutter_test.dart';
import 'package:styio_view_app/src/editor/document_state.dart';
import 'package:styio_view_app/src/integration/execution_adapter.dart';
import 'package:styio_view_app/src/integration/project_graph_contract.dart';
import 'package:styio_view_app/src/platform/platform_target.dart';

void main() {
  test(
    'execution adapter prefers published spio workflow payloads and preserves JSON program output',
    () async {
      final tempRoot = await _createTempRoot(
        'styio_view_execution_payload_test_',
      );
      final sourceFile = File(
        '${tempRoot.path}${Platform.pathSeparator}src${Platform.pathSeparator}main.styio',
      )
        ..createSync(recursive: true)
        ..writeAsStringSync('>_("demo")\n');

      File('${tempRoot.path}${Platform.pathSeparator}spio.toml')
        ..createSync(recursive: true)
        ..writeAsStringSync('''
[package]
name = "demo/app"
version = "0.1.0"

[toolchain]
channel = "stable"
implicit-std = true

[[bin]]
name = "demo"
path = "src/main.styio"
''');

      await _writeExecutable(
        File(
          '${tempRoot.path}${Platform.pathSeparator}.spio${Platform.pathSeparator}bin${Platform.pathSeparator}spio',
        ),
        '''#!/usr/bin/env python3
import json, sys

if sys.argv[1:] == ['machine-info', '--json']:
    print(json.dumps({
        'tool': 'spio',
        'feature_flags': {'workflow_success_payloads': True},
        'supported_contract_versions': {'workflow_success_payloads': [1]},
    }))
    raise SystemExit(0)

if '--json' in sys.argv and 'run' in sys.argv:
    if '--package' not in sys.argv or sys.argv[sys.argv.index('--package') + 1] != 'demo/app':
        raise SystemExit(65)
    if '--bin' not in sys.argv or sys.argv[sys.argv.index('--bin') + 1] != 'demo':
        raise SystemExit(66)
    print(json.dumps({
        'command': 'run',
        'mode': 'execute',
        'workflow_payload_version': 1,
        'message': 'completed compiler run via payload',
        'stdout': '{"message":"user-log"}\\n{"a":1}\\nspio-run-ok\\n',
        'stderr': '',
        'diagnostics': [],
        'receipt': {
            'schema_version': 1,
            'intent': 'run',
            'executed': True,
        },
    }))
    raise SystemExit(0)

raise SystemExit(64)
''',
      );

      final adapter = await createExecutionAdapter(
        platformTarget: PlatformTarget.macos,
        projectGraph: _projectGraph(
          workspaceRoot: tempRoot.path,
          manifestPath: '${tempRoot.path}${Platform.pathSeparator}spio.toml',
          targets: <ProjectTargetDescriptor>[
            ProjectTargetDescriptor(
              id: 'demo/app:bin:demo',
              packageName: 'demo/app',
              kind: ProjectTargetKind.bin,
              name: 'demo',
              filePath: sourceFile.path,
            ),
          ],
          packages: <ProjectPackageSnapshot>[
            _packageSnapshot(
              packageName: 'demo/app',
              rootPath: tempRoot.path,
              manifestPath:
                  '${tempRoot.path}${Platform.pathSeparator}spio.toml',
              targets: <ProjectTargetDescriptor>[
                ProjectTargetDescriptor(
                  id: 'demo/app:bin:demo',
                  packageName: 'demo/app',
                  kind: ProjectTargetKind.bin,
                  name: 'demo',
                  filePath: sourceFile.path,
                ),
              ],
            ),
          ],
          activeCompiler: _compilerSnapshot('/toolchains/styio/bin/styio'),
        ),
      );

      final session = await adapter.runActiveDocument(
        platformTarget: PlatformTarget.macos,
        projectGraph: _projectGraph(
          workspaceRoot: tempRoot.path,
          manifestPath: '${tempRoot.path}${Platform.pathSeparator}spio.toml',
          targets: <ProjectTargetDescriptor>[
            ProjectTargetDescriptor(
              id: 'demo/app:bin:demo',
              packageName: 'demo/app',
              kind: ProjectTargetKind.bin,
              name: 'demo',
              filePath: sourceFile.path,
            ),
          ],
          packages: <ProjectPackageSnapshot>[
            _packageSnapshot(
              packageName: 'demo/app',
              rootPath: tempRoot.path,
              manifestPath:
                  '${tempRoot.path}${Platform.pathSeparator}spio.toml',
              targets: <ProjectTargetDescriptor>[
                ProjectTargetDescriptor(
                  id: 'demo/app:bin:demo',
                  packageName: 'demo/app',
                  kind: ProjectTargetKind.bin,
                  name: 'demo',
                  filePath: sourceFile.path,
                ),
              ],
            ),
          ],
          activeCompiler: _compilerSnapshot('/toolchains/styio/bin/styio'),
        ),
        document: const DocumentState(
          documentId: 'demo',
          text: '>_("demo")\n',
          revision: 1,
        ),
        activeFilePath: sourceFile.path,
      );

      expect(session.status, ExecutionSessionStatus.succeeded);
      expect(
        session.statusMessage,
        contains('completed compiler run via payload'),
      );
      expect(
        session.stdoutEvents.map((event) => event.message),
        containsAll(<String>[
          '{"message":"user-log"}',
          '{"a":1}',
          'spio-run-ok',
        ]),
      );
      expect(session.stderrEvents, isEmpty);
      expect(session.diagnostics, isEmpty);
    },
  );

  test(
    'execution adapter falls back to package build for non-entry project files',
    () async {
      final tempRoot = await _createTempRoot(
        'styio_view_execution_non_entry_test_',
      );
      final helperFile = File(
        '${tempRoot.path}${Platform.pathSeparator}src${Platform.pathSeparator}helper.styio',
      )
        ..createSync(recursive: true)
        ..writeAsStringSync('# helper := 1\n');
      final mainFile = File(
        '${tempRoot.path}${Platform.pathSeparator}src${Platform.pathSeparator}main.styio',
      )
        ..createSync(recursive: true)
        ..writeAsStringSync('>_("demo")\n');
      final libFile = File(
        '${tempRoot.path}${Platform.pathSeparator}src${Platform.pathSeparator}lib.styio',
      )
        ..createSync(recursive: true)
        ..writeAsStringSync('# lib := 1\n');

      File('${tempRoot.path}${Platform.pathSeparator}spio.toml')
        ..createSync(recursive: true)
        ..writeAsStringSync('''
[package]
name = "demo/app"
version = "0.1.0"

[toolchain]
channel = "stable"
implicit-std = true

[lib]
path = "src/lib.styio"

[[bin]]
name = "demo"
path = "src/main.styio"
''');

      await _writeExecutable(
        File(
          '${tempRoot.path}${Platform.pathSeparator}.spio${Platform.pathSeparator}bin${Platform.pathSeparator}spio',
        ),
        '''#!/usr/bin/env python3
import json, sys

if sys.argv[1:] == ['machine-info', '--json']:
    print(json.dumps({
        'tool': 'spio',
        'feature_flags': {'workflow_success_payloads': True},
        'supported_contract_versions': {'workflow_success_payloads': [1]},
    }))
    raise SystemExit(0)

if '--json' in sys.argv and 'build' in sys.argv:
    if '--package' not in sys.argv or sys.argv[sys.argv.index('--package') + 1] != 'demo/app':
        raise SystemExit(65)
    if '--bin' in sys.argv or '--lib' in sys.argv or '--test' in sys.argv:
        raise SystemExit(66)
    print(json.dumps({
        'command': 'build',
        'mode': 'execute',
        'workflow_payload_version': 1,
        'message': 'completed compiler build via payload',
        'stdout': '',
        'stderr': '',
        'diagnostics': [],
        'receipt': {
            'schema_version': 1,
            'intent': 'build',
            'executed': False,
        },
    }))
    raise SystemExit(0)

if 'run' in sys.argv:
    raise SystemExit(67)

raise SystemExit(64)
''',
      );

      final projectGraph = _projectGraph(
        workspaceRoot: tempRoot.path,
        manifestPath: '${tempRoot.path}${Platform.pathSeparator}spio.toml',
        targets: <ProjectTargetDescriptor>[
          ProjectTargetDescriptor(
            id: 'demo/app:lib:demo',
            packageName: 'demo/app',
            kind: ProjectTargetKind.lib,
            name: 'demo',
            filePath: libFile.path,
          ),
          ProjectTargetDescriptor(
            id: 'demo/app:bin:demo',
            packageName: 'demo/app',
            kind: ProjectTargetKind.bin,
            name: 'demo',
            filePath: mainFile.path,
          ),
        ],
        packages: <ProjectPackageSnapshot>[
          _packageSnapshot(
            packageName: 'demo/app',
            rootPath: tempRoot.path,
            manifestPath: '${tempRoot.path}${Platform.pathSeparator}spio.toml',
            targets: <ProjectTargetDescriptor>[
              ProjectTargetDescriptor(
                id: 'demo/app:lib:demo',
                packageName: 'demo/app',
                kind: ProjectTargetKind.lib,
                name: 'demo',
                filePath: libFile.path,
              ),
              ProjectTargetDescriptor(
                id: 'demo/app:bin:demo',
                packageName: 'demo/app',
                kind: ProjectTargetKind.bin,
                name: 'demo',
                filePath: mainFile.path,
              ),
            ],
          ),
        ],
        activeCompiler: _compilerSnapshot('/toolchains/styio/bin/styio'),
      );
      final adapter = await createExecutionAdapter(
        platformTarget: PlatformTarget.macos,
        projectGraph: projectGraph,
      );

      final session = await adapter.runActiveDocument(
        platformTarget: PlatformTarget.macos,
        projectGraph: projectGraph,
        document: const DocumentState(
          documentId: 'helper',
          text: '# helper := 2\n',
          revision: 2,
        ),
        activeFilePath: helperFile.path,
      );

      expect(session.status, ExecutionSessionStatus.succeeded);
      expect(session.kind, 'build');
      expect(
        session.statusMessage,
        contains('completed compiler build via payload'),
      );
      expect(session.diagnostics, isEmpty);
    },
  );

  test('execution adapter surfaces structured spio failure payloads', () async {
    final tempRoot = await _createTempRoot(
      'styio_view_execution_failure_payload_test_',
    );
    final sourceFile = File(
      '${tempRoot.path}${Platform.pathSeparator}src${Platform.pathSeparator}main.styio',
    )
      ..createSync(recursive: true)
      ..writeAsStringSync('>_("demo")\n');

    File('${tempRoot.path}${Platform.pathSeparator}spio.toml')
      ..createSync(recursive: true)
      ..writeAsStringSync('''
[package]
name = "demo/app"
version = "0.1.0"

[toolchain]
channel = "stable"
implicit-std = true

[[bin]]
name = "demo"
path = "src/main.styio"
''');

    await _writeExecutable(
      File(
        '${tempRoot.path}${Platform.pathSeparator}.spio${Platform.pathSeparator}bin${Platform.pathSeparator}spio',
      ),
      '''#!/usr/bin/env python3
import json, sys

if sys.argv[1:] == ['machine-info', '--json']:
    print(json.dumps({
        'tool': 'spio',
        'feature_flags': {'workflow_success_payloads': True},
        'supported_contract_versions': {'workflow_success_payloads': [1]},
    }))
    raise SystemExit(0)

if '--json' in sys.argv and 'run' in sys.argv:
    sys.stderr.write(json.dumps({
        'category': 'CompilerError',
        'code': 23,
        'message': 'compile-plan failed through payload',
        'command': 'run',
        'diagnostics': [{
            'category': 'SyntaxError',
            'code': 'STYIO_SYN',
            'subcode': 'missing-token',
            'message': 'missing token',
            'file': ${jsonEncode(sourceFile.path)},
            'offset': 2,
            'length': 4,
        }],
    }) + '\\n')
    raise SystemExit(23)

raise SystemExit(64)
''',
    );

    final projectGraph = _projectGraph(
      workspaceRoot: tempRoot.path,
      manifestPath: '${tempRoot.path}${Platform.pathSeparator}spio.toml',
      targets: <ProjectTargetDescriptor>[
        ProjectTargetDescriptor(
          id: 'demo/app:bin:demo',
          packageName: 'demo/app',
          kind: ProjectTargetKind.bin,
          name: 'demo',
          filePath: sourceFile.path,
        ),
      ],
      packages: <ProjectPackageSnapshot>[
        _packageSnapshot(
          packageName: 'demo/app',
          rootPath: tempRoot.path,
          manifestPath: '${tempRoot.path}${Platform.pathSeparator}spio.toml',
          targets: <ProjectTargetDescriptor>[
            ProjectTargetDescriptor(
              id: 'demo/app:bin:demo',
              packageName: 'demo/app',
              kind: ProjectTargetKind.bin,
              name: 'demo',
              filePath: sourceFile.path,
            ),
          ],
        ),
      ],
      activeCompiler: _compilerSnapshot('/toolchains/styio/bin/styio'),
    );
    final adapter = await createExecutionAdapter(
      platformTarget: PlatformTarget.macos,
      projectGraph: projectGraph,
    );

    final session = await adapter.runActiveDocument(
      platformTarget: PlatformTarget.macos,
      projectGraph: projectGraph,
      document: const DocumentState(
        documentId: 'demo',
        text: '>_("demo")\n',
        revision: 1,
      ),
      activeFilePath: sourceFile.path,
    );

    expect(session.status, ExecutionSessionStatus.failed);
    expect(
        session.statusMessage, contains('compile-plan failed through payload'));
    expect(session.diagnostics, isNotEmpty);
    expect(session.diagnostics.first.code, 'STYIO_SYN:missing-token');
    expect(session.diagnostics.first.message, 'missing token');
    expect(session.diagnostics.first.range.start, 2);
    expect(session.diagnostics.first.range.end, 6);
  });

  test(
    'single-file execution uses an overlay path and leaves the real file untouched',
    () async {
      final tempRoot = await _createTempRoot(
        'styio_view_execution_scratch_path_test_',
      );
      final sourceFile = File(
        '${tempRoot.path}${Platform.pathSeparator}scratch${Platform.pathSeparator}main.styio',
      )
        ..createSync(recursive: true)
        ..writeAsStringSync('>_("before")\n');
      File('${tempRoot.path}${Platform.pathSeparator}styio.toml')
        ..createSync(recursive: true)
        ..writeAsStringSync('dict_impl = "rbmap"\n');

      final fakeStyio = await _writeExecutable(
        File('${tempRoot.path}${Platform.pathSeparator}fake-styio'),
        '''#!/usr/bin/env python3
import json, os, sys

real_path = ${jsonEncode(sourceFile.path)}

def has_expected_config(path: str) -> bool:
    current = os.path.dirname(path)
    while True:
        for name in ('styio.toml', '.styio.toml'):
            candidate = os.path.join(current, name)
            if os.path.exists(candidate):
                return 'dict_impl = "rbmap"' in open(candidate, 'r', encoding='utf-8').read()
        parent = os.path.dirname(current)
        if parent == current:
            return False
        current = parent

if len(sys.argv) >= 4 and sys.argv[1] == '--file' and sys.argv[3] == '--error-format=jsonl':
    run_path = sys.argv[2]
    if (run_path != real_path and
        open(real_path, 'r', encoding='utf-8').read() == '>_("before")\\n' and
        open(run_path, 'r', encoding='utf-8').read() == '>_("after")\\n' and
        has_expected_config(run_path)):
        print(json.dumps({'executed_path': run_path}))
        raise SystemExit(0)

sys.stderr.write(json.dumps({
    'category': 'SyntaxError',
    'code': 'WRONG_FILE',
    'message': sys.argv[2] if len(sys.argv) > 2 else 'missing file',
}) + '\\n')
raise SystemExit(65)
''',
      );

      final projectGraph = ProjectGraphSnapshot.scratch(
        workspaceRoot: tempRoot.path,
        activeFilePath: sourceFile.path,
        title: 'Scratch Project',
        notes: const <String>[],
        activeCompiler: _compilerSnapshot(
          fakeStyio.path,
          contracts: const <String, List<int>>{
            'machine_info': <int>[1],
          },
        ),
      );
      final adapter = await createExecutionAdapter(
        platformTarget: PlatformTarget.macos,
        projectGraph: projectGraph,
      );

      final session = await adapter.runActiveDocument(
        platformTarget: PlatformTarget.macos,
        projectGraph: projectGraph,
        document: const DocumentState(
          documentId: 'scratch',
          text: '>_("after")\n',
          revision: 2,
        ),
        activeFilePath: sourceFile.path,
      );

      expect(session.status, ExecutionSessionStatus.succeeded);
      expect(
        session.stdoutEvents.map((event) => event.message),
        contains(
            predicate((String message) => message.contains('executed_path'))),
      );
      expect(sourceFile.readAsStringSync(), '>_("before")\n');
    },
  );

  test('cross-file CLI diagnostics stay out of active-file ranges', () async {
    final tempRoot = await _createTempRoot(
      'styio_view_execution_cross_file_diag_test_',
    );
    final sourceFile = File(
      '${tempRoot.path}${Platform.pathSeparator}scratch${Platform.pathSeparator}main.styio',
    )
      ..createSync(recursive: true)
      ..writeAsStringSync('>_("main")\n');
    final helperFile = File(
      '${tempRoot.path}${Platform.pathSeparator}scratch${Platform.pathSeparator}helper.styio',
    )
      ..createSync(recursive: true)
      ..writeAsStringSync('# helper := 1\n');

    final fakeStyio = await _writeExecutable(
      File('${tempRoot.path}${Platform.pathSeparator}fake-styio'),
      '''#!/usr/bin/env python3
import json, sys

if len(sys.argv) >= 4 and sys.argv[1] == '--file' and sys.argv[3] == '--error-format=jsonl':
    sys.stderr.write(json.dumps({
        'category': 'SyntaxError',
        'code': 'HELPER',
        'message': 'helper failed',
        'file': ${jsonEncode(helperFile.path)},
        'offset': 1,
        'length': 3,
    }) + '\\n')
    raise SystemExit(65)

raise SystemExit(64)
''',
    );

    final projectGraph = ProjectGraphSnapshot.scratch(
      workspaceRoot: tempRoot.path,
      activeFilePath: sourceFile.path,
      title: 'Scratch Project',
      notes: const <String>[],
      activeCompiler: _compilerSnapshot(
        fakeStyio.path,
        contracts: const <String, List<int>>{
          'machine_info': <int>[1],
        },
      ),
    );
    final adapter = await createExecutionAdapter(
      platformTarget: PlatformTarget.macos,
      projectGraph: projectGraph,
    );

    final session = await adapter.runActiveDocument(
      platformTarget: PlatformTarget.macos,
      projectGraph: projectGraph,
      document: const DocumentState(
        documentId: 'scratch',
        text: '>_("main")\n',
        revision: 1,
      ),
      activeFilePath: sourceFile.path,
    );

    expect(session.status, ExecutionSessionStatus.failed);
    expect(session.diagnostics, isEmpty);
    expect(
      session.stderrEvents.map((event) => event.message),
      contains('${helperFile.path}: helper failed'),
    );
  });
}

Future<Directory> _createTempRoot(String prefix) async {
  final tempRoot = await Directory.systemTemp.createTemp(prefix);
  addTearDown(() => tempRoot.delete(recursive: true));

  final previousCurrentDirectory = Directory.current;
  addTearDown(() => Directory.current = previousCurrentDirectory);
  Directory.current = tempRoot;
  return tempRoot;
}

Future<File> _writeExecutable(File file, String contents) async {
  await file.create(recursive: true);
  await file.writeAsString(contents);
  Process.runSync('chmod', <String>['+x', file.path]);
  return file;
}

CompilerHandshakeSnapshot _compilerSnapshot(
  String binaryPath, {
  Map<String, List<int>> contracts = const <String, List<int>>{
    'machine_info': <int>[1],
    'compile_plan': <int>[1],
  },
}) {
  return CompilerHandshakeSnapshot(
    binaryPath: binaryPath,
    tool: 'styio',
    compilerVersion: '0.0.5',
    channel: 'stable',
    variant: 'desktop',
    capabilities: const <String>[
      'machine_info_json',
      'single_file_entry',
      'jsonl_diagnostics',
      'compile_plan_consumer',
    ],
    supportedContractVersions: contracts,
    integrationPhase: 'compile-plan-live',
    featureFlags: const <String, bool>{'compile_plan_consumer': true},
  );
}

ProjectPackageSnapshot _packageSnapshot({
  required String packageName,
  required String rootPath,
  required String manifestPath,
  required List<ProjectTargetDescriptor> targets,
}) {
  return ProjectPackageSnapshot(
    packageName: packageName,
    version: '0.1.0',
    rootPath: rootPath,
    manifestPath: manifestPath,
    targets: targets,
  );
}

ProjectGraphSnapshot _projectGraph({
  required String workspaceRoot,
  required String manifestPath,
  required List<ProjectTargetDescriptor> targets,
  required List<ProjectPackageSnapshot> packages,
  required CompilerHandshakeSnapshot activeCompiler,
}) {
  return ProjectGraphSnapshot(
    id: manifestPath,
    title: packages.isEmpty ? 'demo/app' : packages.first.packageName,
    kind: ProjectKind.package,
    workspaceRoot: workspaceRoot,
    workspaceMembers: const <String>[],
    manifestPath: manifestPath,
    lockfilePath: '$workspaceRoot${Platform.pathSeparator}spio.lock',
    toolchainPinPath:
        '$workspaceRoot${Platform.pathSeparator}spio-toolchain.toml',
    vendorRoot:
        '$workspaceRoot${Platform.pathSeparator}.spio${Platform.pathSeparator}vendor',
    buildRoot:
        '$workspaceRoot${Platform.pathSeparator}.spio${Platform.pathSeparator}build',
    packages: packages,
    dependencies: const <ProjectDependencySnapshot>[],
    targets: targets,
    editorFiles:
        targets.map((target) => target.filePath).toList(growable: false),
    toolchain: const ToolchainStatusSnapshot(
      source: ToolchainResolutionSource.projectPin,
      detail: 'project pin',
    ),
    lockState: ProjectLockState.missing,
    vendorState: ProjectVendorState.missing,
    activeCompiler: activeCompiler,
    notes: const <String>[],
  );
}
