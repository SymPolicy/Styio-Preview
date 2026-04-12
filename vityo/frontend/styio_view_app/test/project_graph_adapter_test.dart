import 'dart:io';

import 'package:flutter_test/flutter_test.dart';
import 'package:styio_view_app/src/integration/project_graph_adapter.dart';
import 'package:styio_view_app/src/integration/project_graph_contract.dart';
import 'package:styio_view_app/src/platform/platform_target.dart';

void main() {
  test('project graph adapter discovers canonical spio package files',
      () async {
    final tempRoot = await Directory.systemTemp.createTemp(
      'styio_view_project_graph_test_',
    );
    addTearDown(() => tempRoot.delete(recursive: true));

    final previousCurrentDirectory = Directory.current;
    addTearDown(() => Directory.current = previousCurrentDirectory);

    File('${tempRoot.path}${Platform.pathSeparator}spio.toml')
      ..createSync(recursive: true)
      ..writeAsStringSync('''
[package]
name = "demo/app"
version = "0.1.0"

[workspace]
members = ["packages/render-kit"]

[toolchain]
channel = "stable"

[dependencies]
render-kit = { path = "packages/render-kit" }
palette = "^2.0.0"

[dev-dependencies]
assertions = "^1.0.0"

[lib]
path = "src/lib.styio"

[[bin]]
name = "demo"
path = "src/main.styio"

[[test]]
name = "render-flow"
path = "tests/render_flow.styio"
''');
    File('${tempRoot.path}${Platform.pathSeparator}spio.lock')
      ..createSync(recursive: true)
      ..writeAsStringSync('# lock');
    File('${tempRoot.path}${Platform.pathSeparator}spio-toolchain.toml')
      ..createSync(recursive: true)
      ..writeAsStringSync('channel = "stable"\n');
    File('${tempRoot.path}${Platform.pathSeparator}styio.toml')
      ..createSync(recursive: true)
      ..writeAsStringSync('target = "preview"\n');
    Directory(
      '${tempRoot.path}${Platform.pathSeparator}.spio${Platform.pathSeparator}vendor',
    ).createSync(recursive: true);
    Directory(
      '${tempRoot.path}${Platform.pathSeparator}.spio${Platform.pathSeparator}build',
    ).createSync(recursive: true);
    Directory(
      '${tempRoot.path}${Platform.pathSeparator}src',
    ).createSync(recursive: true);
    Directory(
      '${tempRoot.path}${Platform.pathSeparator}packages${Platform.pathSeparator}render-kit${Platform.pathSeparator}src',
    ).createSync(recursive: true);
    Directory(
      '${tempRoot.path}${Platform.pathSeparator}tests',
    ).createSync(recursive: true);
    File(
      '${tempRoot.path}${Platform.pathSeparator}packages${Platform.pathSeparator}render-kit${Platform.pathSeparator}spio.toml',
    )
      ..createSync(recursive: true)
      ..writeAsStringSync('''
[package]
name = "demo/render-kit"
version = "0.2.0"

[lib]
path = "src/lib.styio"
''');

    Directory.current = tempRoot;

    final adapter = await createProjectGraphAdapter(
      platformTarget: PlatformTarget.macos,
    );
    final graph = await adapter.loadProjectGraph();

    expect(graph.kind, ProjectKind.combinedRoot);
    expect(
      graph.manifestPath,
      endsWith('${Platform.pathSeparator}spio.toml'),
    );
    expect(graph.lockState, ProjectLockState.unknown);
    expect(graph.vendorState, ProjectVendorState.present);
    expect(graph.toolchain.source, ToolchainResolutionSource.projectPin);
    expect(
      graph.toolchainPinPath,
      endsWith('${Platform.pathSeparator}spio-toolchain.toml'),
    );
    expect(
      graph.styioConfigPath,
      endsWith('${Platform.pathSeparator}styio.toml'),
    );
    expect(
      graph.packages.map((package) => package.packageName).toSet(),
      {'demo/app', 'demo/render-kit'},
    );
    expect(graph.workspaceMembers, ['packages/render-kit']);
    expect(graph.workspaceMemberCount, 1);
    expect(graph.packages.length, 2);
    expect(graph.dependencyCount, 3);
    expect(
      graph.dependencies
          .where((dependency) => dependency.sourcePackageName == 'demo/app')
          .map((dependency) => dependency.dependencyName)
          .toSet(),
      {'render-kit', 'palette', 'assertions'},
    );
    expect(graph.targets.length, 4);
    expect(
      graph.targets.map((target) => target.kind).toSet(),
      {
        ProjectTargetKind.lib,
        ProjectTargetKind.bin,
        ProjectTargetKind.test,
      },
    );
  });

  test('project graph adapter falls back to scratch mode without spio.toml',
      () async {
    final tempRoot = await Directory.systemTemp.createTemp(
      'styio_view_project_graph_scratch_test_',
    );
    addTearDown(() => tempRoot.delete(recursive: true));

    final previousCurrentDirectory = Directory.current;
    addTearDown(() => Directory.current = previousCurrentDirectory);

    Directory.current = tempRoot;

    final adapter = await createProjectGraphAdapter(
      platformTarget: PlatformTarget.linux,
    );
    final graph = await adapter.loadProjectGraph();

    expect(graph.kind, ProjectKind.scratch);
    expect(graph.manifestPath, isNull);
    expect(
        graph.editorFiles.single
            .endsWith('scratch${Platform.pathSeparator}main.styio'),
        isTrue);
    expect(graph.notes, isNotEmpty);
  });
}
