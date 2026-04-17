import 'package:flutter/material.dart';

import '../../agent/agent_surface.dart';
import '../../editor/editor_surface.dart';
import '../../integration/adapter_contracts.dart';
import '../../integration/execution_route_summary.dart';
import '../../integration/project_graph_contract.dart';
import '../../integration/required_handoff_summary.dart';
import '../../module_host/module_definition.dart';
import '../../module_host/module_manifest.dart';
import '../../platform/platform_target.dart';
import '../../platform/viewport_profile.dart';
import '../../runtime/debug_console_surface.dart';
import '../../runtime/runtime_surface.dart';
import '../commands/app_commands.dart';
import '../state/shell_model.dart';
import '../state/shell_scope.dart';

class StyioShellScaffold extends StatelessWidget {
  const StyioShellScaffold({super.key});

  @override
  Widget build(BuildContext context) {
    final shell = ShellScope.of(context);
    final project = shell.workspaceController.activeProject;
    final viewportProfile = resolveViewportProfile(
      platformTarget: shell.platformTarget,
      width: MediaQuery.sizeOf(context).width,
      height: MediaQuery.sizeOf(context).height,
    );

    return Shortcuts(
      shortcuts: StyioCommandRegistry.shortcutIntents,
      child: Actions(
        actions: <Type, Action<Intent>>{
          AppCommandIntent: CallbackAction<AppCommandIntent>(
            onInvoke: (intent) {
              shell.executeCommand(intent.commandId);
              return null;
            },
          ),
        },
        child: Focus(
          autofocus: true,
          child: Scaffold(
            body: SafeArea(
              child: Padding(
                padding: const EdgeInsets.all(18),
                child: Column(
                  children: [
                    _TopBar(
                      platformTarget: shell.platformTarget,
                      activeProjectTitle: project.title,
                      viewportProfile: viewportProfile,
                    ),
                    const SizedBox(height: 16),
                    Expanded(
                      child: LayoutBuilder(
                        builder: (context, constraints) {
                          final layoutViewport = resolveViewportProfile(
                            platformTarget: shell.platformTarget,
                            width: constraints.maxWidth,
                            height: constraints.maxHeight,
                          );

                          if (layoutViewport.isMobile) {
                            return _MobileShellBody(
                              shell: shell,
                              viewportProfile: layoutViewport,
                              bottomSurface: _buildBottomSurface(
                                shell,
                                layoutViewport,
                              ),
                            );
                          }

                          return _DesktopShellBody(
                            shell: shell,
                            viewportProfile: layoutViewport,
                            bottomSurface: _buildBottomSurface(
                              shell,
                              layoutViewport,
                            ),
                          );
                        },
                      ),
                    ),
                    const SizedBox(height: 12),
                    _ShellStatusBar(
                      platformTarget: shell.platformTarget,
                      viewportProfile: viewportProfile,
                      mountedModuleCount: shell.mountedModules.length,
                      visibleModuleCount: shell.visibleModules.length,
                      projectTitle: project.title,
                      activeFilePath: shell.workspaceController.activeFilePath,
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildBottomSurface(
    ShellModel shell,
    ViewportProfile viewportProfile,
  ) {
    switch (shell.activeBottomTab) {
      case BottomSurfaceTab.runtime:
        return RuntimeSurface(
          platformTarget: shell.platformTarget,
          viewportProfile: viewportProfile,
          projectGraph: shell.workspaceController.activeProject,
          mountedModules: shell.mountedModules,
          adapterCapabilities: shell.adapterCapabilities,
          executionSession: shell.lastExecutionSession,
        );
      case BottomSurfaceTab.agent:
        return AgentSurface(
          platformTarget: shell.platformTarget,
          viewportProfile: viewportProfile,
          visibleModules: shell.visibleModules,
          adapterCapabilities: shell.adapterCapabilities,
        );
      case BottomSurfaceTab.debug:
        return DebugConsoleSurface(
          viewportProfile: viewportProfile,
          entries: shell.debugLog,
        );
    }
  }
}

class _TopBar extends StatelessWidget {
  const _TopBar({
    required this.platformTarget,
    required this.activeProjectTitle,
    required this.viewportProfile,
  });

  final PlatformTarget platformTarget;
  final String activeProjectTitle;
  final ViewportProfile viewportProfile;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Card(
      child: LayoutBuilder(
        builder: (context, constraints) {
          final compact =
              viewportProfile.isMobile || constraints.maxWidth < 900;

          return Padding(
            padding: const EdgeInsets.symmetric(
              horizontal: 24,
              vertical: 18,
            ),
            child: compact
                ? Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Styio View Integration Shell',
                        style: theme.textTheme.headlineMedium,
                      ),
                      const SizedBox(height: 6),
                      Text(
                        'Product-owned adapters, project graph, and execution routes across Web, desktop, and mobile shells.',
                        style: theme.textTheme.bodyMedium,
                      ),
                      const SizedBox(height: 12),
                      Wrap(
                        spacing: 12,
                        runSpacing: 10,
                        children: [
                          Chip(label: Text(platformTarget.label)),
                          Chip(label: Text(viewportProfile.label)),
                        ],
                      ),
                      const SizedBox(height: 10),
                      Text(
                        activeProjectTitle,
                        style: theme.textTheme.bodySmall,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  )
                : Row(
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Styio View Integration Shell',
                              style: theme.textTheme.headlineMedium,
                            ),
                            const SizedBox(height: 6),
                            Text(
                              'Product-owned adapters, project graph, and execution routes across Web, desktop, and mobile shells.',
                              style: theme.textTheme.bodyMedium,
                            ),
                          ],
                        ),
                      ),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          Chip(label: Text(platformTarget.label)),
                          const SizedBox(height: 8),
                          Chip(label: Text(viewportProfile.label)),
                          const SizedBox(height: 8),
                          Text(
                            activeProjectTitle,
                            style: theme.textTheme.bodySmall,
                          ),
                        ],
                      ),
                    ],
                  ),
          );
        },
      ),
    );
  }
}

class _ShellStatusBar extends StatelessWidget {
  const _ShellStatusBar({
    required this.platformTarget,
    required this.viewportProfile,
    required this.mountedModuleCount,
    required this.visibleModuleCount,
    required this.projectTitle,
    required this.activeFilePath,
  });

  final PlatformTarget platformTarget;
  final ViewportProfile viewportProfile;
  final int mountedModuleCount;
  final int visibleModuleCount;
  final String projectTitle;
  final String activeFilePath;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return DecoratedBox(
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.58),
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: theme.dividerColor),
      ),
      child: Padding(
        padding: const EdgeInsets.symmetric(
          horizontal: 16,
          vertical: 12,
        ),
        child: viewportProfile.isMobile
            ? Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Wrap(
                    spacing: 12,
                    runSpacing: 8,
                    children: [
                      Text(
                        'Platform ${platformTarget.label}',
                        style: theme.textTheme.bodySmall,
                      ),
                      Text(
                        'Viewport ${viewportProfile.label}',
                        style: theme.textTheme.bodySmall,
                      ),
                      Text(
                        'Mounted $mountedModuleCount/$visibleModuleCount modules',
                        style: theme.textTheme.bodySmall,
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Project $projectTitle · $activeFilePath',
                    style: theme.textTheme.bodySmall,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              )
            : Row(
                children: [
                  Text(
                    'Platform ${platformTarget.label}',
                    style: theme.textTheme.bodySmall,
                  ),
                  const SizedBox(width: 12),
                  Text(
                    'Viewport ${viewportProfile.label}',
                    style: theme.textTheme.bodySmall,
                  ),
                  const SizedBox(width: 12),
                  Text(
                    'Mounted $mountedModuleCount/$visibleModuleCount modules',
                    style: theme.textTheme.bodySmall,
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Text(
                      'Project $projectTitle · $activeFilePath',
                      style: theme.textTheme.bodySmall,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      textAlign: TextAlign.end,
                    ),
                  ),
                ],
              ),
      ),
    );
  }
}

class _DesktopShellBody extends StatelessWidget {
  const _DesktopShellBody({
    required this.shell,
    required this.viewportProfile,
    required this.bottomSurface,
  });

  final ShellModel shell;
  final ViewportProfile viewportProfile;
  final Widget bottomSurface;

  @override
  Widget build(BuildContext context) {
    final denseDesktop = viewportProfile.width < 1440;
    final workspaceWidth = denseDesktop ? 252.0 : 288.0;
    final moduleWidth = denseDesktop ? 320.0 : 348.0;
    final bottomSurfaceHeight = viewportProfile.height >= 840
        ? 250.0
        : viewportProfile.height >= 680
            ? 200.0
            : 160.0;

    return KeyedSubtree(
      key: const ValueKey('shell-viewport-desktop'),
      child: Row(
        children: [
          SizedBox(
            width: workspaceWidth,
            child: _WorkspaceSidebar(shell: shell),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              children: [
                Expanded(
                  child: Row(
                    children: [
                      Expanded(
                        flex: denseDesktop ? 6 : 5,
                        child: EditorSurface(
                          controller: shell.editorController,
                          viewportProfile: viewportProfile,
                        ),
                      ),
                      const SizedBox(width: 16),
                      SizedBox(
                        width: moduleWidth,
                        child: _ModuleSidebar(shell: shell),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 16),
                _BottomSurfaceTabs(
                  shell: shell,
                  viewportProfile: viewportProfile,
                ),
                const SizedBox(height: 10),
                SizedBox(
                  height: bottomSurfaceHeight,
                  child: bottomSurface,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _MobileShellBody extends StatelessWidget {
  const _MobileShellBody({
    required this.shell,
    required this.viewportProfile,
    required this.bottomSurface,
  });

  final ShellModel shell;
  final ViewportProfile viewportProfile;
  final Widget bottomSurface;

  @override
  Widget build(BuildContext context) {
    final editorHeight = viewportProfile.height >= 820 ? 460.0 : 400.0;
    final workspaceHeight = viewportProfile.height >= 820 ? 320.0 : 280.0;
    final moduleHeight = viewportProfile.height >= 820 ? 320.0 : 280.0;
    final bottomSurfaceHeight = viewportProfile.height >= 820 ? 220.0 : 180.0;

    return KeyedSubtree(
      key: const ValueKey('shell-viewport-mobile'),
      child: ListView(
        children: [
          SizedBox(
            height: editorHeight,
            child: EditorSurface(
              controller: shell.editorController,
              viewportProfile: viewportProfile,
            ),
          ),
          const SizedBox(height: 16),
          SizedBox(
            height: workspaceHeight,
            child: _WorkspaceSidebar(shell: shell),
          ),
          const SizedBox(height: 16),
          SizedBox(
            height: moduleHeight,
            child: _ModuleSidebar(shell: shell),
          ),
          const SizedBox(height: 16),
          _BottomSurfaceTabs(
            shell: shell,
            viewportProfile: viewportProfile,
          ),
          const SizedBox(height: 10),
          SizedBox(
            height: bottomSurfaceHeight,
            child: bottomSurface,
          ),
        ],
      ),
    );
  }
}

class _WorkspaceSidebar extends StatelessWidget {
  const _WorkspaceSidebar({
    required this.shell,
  });

  final ShellModel shell;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final project = shell.workspaceController.activeProject;

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(18),
        child: ListView(
          key: const ValueKey('workspace-sidebar-scroll'),
          children: [
            Text('Project Graph', style: theme.textTheme.titleMedium),
            const SizedBox(height: 12),
            _ProjectSummaryCard(project: project),
            const SizedBox(height: 12),
            _ProjectWorkflowCard(
              platformTarget: shell.platformTarget,
              project: project,
              adapterCapabilities: shell.adapterCapabilities,
            ),
            const SizedBox(height: 12),
            _CompilerHandshakeCard(project: project),
            const SizedBox(height: 12),
            _RequiredHandoffsCard(
              platformTarget: shell.platformTarget,
              project: project,
              adapterCapabilities: shell.adapterCapabilities,
            ),
            if (project.workspaceMembers.isNotEmpty) ...[
              const SizedBox(height: 18),
              Text('Workspace Members', style: theme.textTheme.titleMedium),
              const SizedBox(height: 12),
              for (final member in project.workspaceMembers)
                Padding(
                  padding: const EdgeInsets.only(bottom: 8),
                  child: _WorkspaceMemberTile(memberPath: member),
                ),
            ],
            if (project.packages.isNotEmpty) ...[
              const SizedBox(height: 18),
              Text('Packages', style: theme.textTheme.titleMedium),
              const SizedBox(height: 12),
              for (final package in project.packages)
                Padding(
                  padding: const EdgeInsets.only(bottom: 8),
                  child: _ProjectPackageTile(package: package),
                ),
            ],
            if (project.dependencies.isNotEmpty) ...[
              const SizedBox(height: 18),
              Text('Dependencies', style: theme.textTheme.titleMedium),
              const SizedBox(height: 12),
              for (final dependency in project.dependencies)
                Padding(
                  padding: const EdgeInsets.only(bottom: 8),
                  child: _ProjectDependencyTile(dependency: dependency),
                ),
            ],
            if (shell.workspaceController.targets.isNotEmpty) ...[
              const SizedBox(height: 18),
              Text('Targets', style: theme.textTheme.titleMedium),
              const SizedBox(height: 12),
              for (final target in shell.workspaceController.targets)
                Padding(
                  padding: const EdgeInsets.only(bottom: 8),
                  child: _ProjectTargetTile(
                    target: target,
                    active: target.filePath ==
                        shell.workspaceController.activeFilePath,
                    onTap: () => shell.workspaceController.openTarget(target),
                  ),
                ),
            ],
            const SizedBox(height: 18),
            Text('Files', style: theme.textTheme.titleMedium),
            const SizedBox(height: 12),
            for (final file in shell.workspaceController.files)
              Padding(
                padding: const EdgeInsets.only(bottom: 8),
                child: _WorkspaceFileTile(
                  file: file,
                  active: file == shell.workspaceController.activeFilePath,
                  onTap: () => shell.workspaceController.openFile(file),
                ),
              ),
          ],
        ),
      ),
    );
  }
}

class _ProjectSummaryCard extends StatelessWidget {
  const _ProjectSummaryCard({
    required this.project,
  });

  final ProjectGraphSnapshot project;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return DecoratedBox(
      decoration: BoxDecoration(
        color: const Color(0xFFF1ECE3),
        borderRadius: BorderRadius.circular(18),
      ),
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(project.title, style: theme.textTheme.titleMedium),
            const SizedBox(height: 6),
            Text(project.workspaceRoot, style: theme.textTheme.bodySmall),
            const SizedBox(height: 10),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                Chip(label: Text(project.kind.label)),
                Chip(label: Text('lock ${project.lockState.label}')),
                Chip(label: Text('vendor ${project.vendorState.label}')),
                Chip(label: Text('${project.packageCount} package')),
                Chip(label: Text('${project.workspaceMemberCount} member')),
                Chip(label: Text('${project.dependencyCount} dependency')),
                Chip(label: Text('${project.targetCount} target')),
                Chip(label: Text('${project.editorFileCount} file')),
              ],
            ),
            const SizedBox(height: 10),
            Text(
              project.toolchain.detail,
              style: theme.textTheme.bodySmall,
            ),
            if (project.manifestPath != null) ...[
              const SizedBox(height: 6),
              Text(
                'manifest ${project.manifestPath}',
                style: theme.textTheme.bodySmall,
              ),
            ],
            if (project.toolchainPinPath != null) ...[
              const SizedBox(height: 4),
              Text(
                'toolchain ${project.toolchainPinPath}',
                style: theme.textTheme.bodySmall,
              ),
            ],
            if (project.styioConfigPath != null) ...[
              const SizedBox(height: 4),
              Text(
                'styio ${project.styioConfigPath}',
                style: theme.textTheme.bodySmall,
              ),
            ],
            if (project.notes.isNotEmpty) ...[
              const SizedBox(height: 10),
              Text(
                project.notes.first,
                style: theme.textTheme.bodySmall,
              ),
            ],
          ],
        ),
      ),
    );
  }
}

class _ProjectWorkflowCard extends StatelessWidget {
  const _ProjectWorkflowCard({
    required this.platformTarget,
    required this.project,
    required this.adapterCapabilities,
  });

  final PlatformTarget platformTarget;
  final ProjectGraphSnapshot project;
  final List<AdapterCapabilitySnapshot> adapterCapabilities;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final summary = summarizeExecutionRoute(
      platformTarget: platformTarget,
      projectGraph: project,
      adapterCapabilities: adapterCapabilities,
    );

    return DecoratedBox(
      key: const ValueKey('project-workflow-card'),
      decoration: BoxDecoration(
        color: const Color(0xFFEAF0E5),
        borderRadius: BorderRadius.circular(18),
      ),
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Project Workflow', style: theme.textTheme.titleMedium),
            const SizedBox(height: 6),
            Text(summary.title, style: theme.textTheme.titleSmall),
            const SizedBox(height: 8),
            Text(
              summary.body,
              style: theme.textTheme.bodySmall,
            ),
            const SizedBox(height: 10),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                Chip(label: Text(summary.primaryAdapterKind.label)),
                Chip(
                  label: Text(
                    summary.previewOnly ? 'preview-only' : 'live-capable',
                  ),
                ),
                if (project.compilePlanConsumerAdvertised)
                  const Chip(label: Text('compile-plan detected')),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _CompilerHandshakeCard extends StatelessWidget {
  const _CompilerHandshakeCard({
    required this.project,
  });

  final ProjectGraphSnapshot project;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final compiler = project.activeCompiler;

    return DecoratedBox(
      key: const ValueKey('compiler-handshake-card'),
      decoration: BoxDecoration(
        color: const Color(0xFFE8EDF5),
        borderRadius: BorderRadius.circular(18),
      ),
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Compiler Handshake', style: theme.textTheme.titleMedium),
            const SizedBox(height: 6),
            if (compiler == null)
              Text(
                'No local styio machine-info handshake has been resolved yet.',
                style: theme.textTheme.bodySmall,
              )
            else ...[
              Text(
                '${compiler.tool} ${compiler.compilerVersion} · ${compiler.channel}',
                style: theme.textTheme.titleSmall,
              ),
              const SizedBox(height: 6),
              Text(
                'variant ${compiler.variant} · phase ${compiler.integrationPhase}',
                style: theme.textTheme.bodySmall,
              ),
              const SizedBox(height: 8),
              Text(
                compiler.contractSummary,
                style: theme.textTheme.bodySmall,
              ),
              const SizedBox(height: 6),
              Text(
                compiler.capabilitySummary,
                style: theme.textTheme.bodySmall,
              ),
            ],
            const SizedBox(height: 10),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                Chip(label: Text(project.toolchain.source.label)),
                if (project.toolchain.channel != null)
                  Chip(label: Text('channel ${project.toolchain.channel}')),
                if (compiler != null &&
                    compiler.supportsContract('compile_plan'))
                  const Chip(label: Text('compile-plan ready')),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _RequiredHandoffsCard extends StatelessWidget {
  const _RequiredHandoffsCard({
    required this.platformTarget,
    required this.project,
    required this.adapterCapabilities,
  });

  final PlatformTarget platformTarget;
  final ProjectGraphSnapshot project;
  final List<AdapterCapabilitySnapshot> adapterCapabilities;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final handoffs = summarizeRequiredHandoffs(
      platformTarget: platformTarget,
      projectGraph: project,
      adapterCapabilities: adapterCapabilities,
    );
    final blockingCount = handoffs.where((handoff) => handoff.blocking).length;
    final styioCount =
        handoffs.where((handoff) => handoff.owner == HandoffOwner.styio).length;
    final spioCount =
        handoffs.where((handoff) => handoff.owner == HandoffOwner.spio).length;

    return DecoratedBox(
      key: const ValueKey('required-handoffs-card'),
      decoration: BoxDecoration(
        color: const Color(0xFFF3ECE7),
        borderRadius: BorderRadius.circular(18),
      ),
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Required Handoffs', style: theme.textTheme.titleMedium),
            const SizedBox(height: 6),
            Text(
              'This card only states what `styio-view` still needs from upstream machine contracts. It does not prescribe upstream internals.',
              style: theme.textTheme.bodySmall,
            ),
            const SizedBox(height: 10),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                Chip(label: Text('$blockingCount blocking')),
                Chip(label: Text('$styioCount styio')),
                Chip(label: Text('$spioCount spio')),
              ],
            ),
            const SizedBox(height: 10),
            if (handoffs.isEmpty)
              Text(
                'No product-side handoffs are currently outstanding for this route.',
                style: theme.textTheme.bodySmall,
              )
            else
              for (var index = 0; index < handoffs.length; index += 1) ...[
                if (index > 0) const SizedBox(height: 10),
                _RequiredHandoffTile(handoff: handoffs[index]),
              ],
          ],
        ),
      ),
    );
  }
}

class _RequiredHandoffTile extends StatelessWidget {
  const _RequiredHandoffTile({
    required this.handoff,
  });

  final RequiredHandoff handoff;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return DecoratedBox(
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.68),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: theme.dividerColor),
      ),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Wrap(
              spacing: 8,
              runSpacing: 8,
              crossAxisAlignment: WrapCrossAlignment.center,
              children: [
                Chip(label: Text(handoff.owner.label)),
                Chip(
                  label: Text(
                    handoff.blocking ? 'blocking' : 'follow-up',
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Text(
              handoff.title,
              style: theme.textTheme.titleSmall,
            ),
            const SizedBox(height: 6),
            Text(
              handoff.detail,
              style: theme.textTheme.bodySmall,
            ),
            const SizedBox(height: 6),
            Text(
              handoff.docPath,
              style: theme.textTheme.bodySmall,
            ),
          ],
        ),
      ),
    );
  }
}

class _WorkspaceFileTile extends StatelessWidget {
  const _WorkspaceFileTile({
    required this.file,
    required this.active,
    required this.onTap,
  });

  final String file;
  final bool active;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return InkWell(
      borderRadius: BorderRadius.circular(14),
      onTap: onTap,
      child: Ink(
        padding: const EdgeInsets.symmetric(
          horizontal: 12,
          vertical: 10,
        ),
        decoration: BoxDecoration(
          color: active ? const Color(0xFFF1ECE3) : Colors.transparent,
          borderRadius: BorderRadius.circular(14),
        ),
        child: Row(
          children: [
            Icon(
              active ? Icons.article_rounded : Icons.article_outlined,
              size: 18,
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Text(
                file,
                style: theme.textTheme.bodyMedium,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _ProjectTargetTile extends StatelessWidget {
  const _ProjectTargetTile({
    required this.target,
    required this.active,
    required this.onTap,
  });

  final ProjectTargetDescriptor target;
  final bool active;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return InkWell(
      borderRadius: BorderRadius.circular(14),
      onTap: onTap,
      child: Ink(
        padding: const EdgeInsets.symmetric(
          horizontal: 12,
          vertical: 10,
        ),
        decoration: BoxDecoration(
          color: active ? const Color(0xFFF1ECE3) : Colors.transparent,
          borderRadius: BorderRadius.circular(14),
        ),
        child: Row(
          children: [
            const Icon(Icons.track_changes_rounded, size: 18),
            const SizedBox(width: 10),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('${target.kind.name} ${target.name}'),
                  Text(
                    target.packageName,
                    style: theme.textTheme.bodySmall,
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _ProjectPackageTile extends StatelessWidget {
  const _ProjectPackageTile({
    required this.package,
  });

  final ProjectPackageSnapshot package;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return DecoratedBox(
      decoration: BoxDecoration(
        color: const Color(0xFFF8F4ED),
        borderRadius: BorderRadius.circular(14),
      ),
      child: Padding(
        padding: const EdgeInsets.symmetric(
          horizontal: 12,
          vertical: 10,
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Expanded(
                  child: Text(
                    package.packageName,
                    style: theme.textTheme.titleSmall,
                  ),
                ),
                Chip(label: Text(package.version)),
              ],
            ),
            const SizedBox(height: 6),
            Text(
              package.rootPath,
              style: theme.textTheme.bodySmall,
            ),
            const SizedBox(height: 8),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                Chip(label: Text('${package.targets.length} target')),
                Chip(label: Text('${package.dependencies.length} dependency')),
                Chip(
                  label: Text(
                    package.isWorkspaceMember
                        ? 'workspace member'
                        : 'root package',
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _WorkspaceMemberTile extends StatelessWidget {
  const _WorkspaceMemberTile({
    required this.memberPath,
  });

  final String memberPath;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return DecoratedBox(
      decoration: BoxDecoration(
        color: const Color(0xFFF0F3EA),
        borderRadius: BorderRadius.circular(14),
      ),
      child: Padding(
        padding: const EdgeInsets.symmetric(
          horizontal: 12,
          vertical: 10,
        ),
        child: Row(
          children: [
            const Icon(Icons.folder_open_rounded, size: 18),
            const SizedBox(width: 10),
            Expanded(
              child: Text(
                memberPath,
                style: theme.textTheme.bodyMedium,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _ProjectDependencyTile extends StatelessWidget {
  const _ProjectDependencyTile({
    required this.dependency,
  });

  final ProjectDependencySnapshot dependency;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return DecoratedBox(
      decoration: BoxDecoration(
        color: const Color(0xFFF5F0E8),
        borderRadius: BorderRadius.circular(14),
      ),
      child: Padding(
        padding: const EdgeInsets.symmetric(
          horizontal: 12,
          vertical: 10,
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                Chip(label: Text(dependency.kind.label)),
                if (dependency.isWorkspaceReference)
                  const Chip(label: Text('workspace ref')),
              ],
            ),
            const SizedBox(height: 8),
            Text(
              '${dependency.sourcePackageName} -> ${dependency.dependencyName}',
              style: theme.textTheme.titleSmall,
            ),
            const SizedBox(height: 6),
            Text(
              dependency.requirement,
              style: theme.textTheme.bodySmall,
            ),
          ],
        ),
      ),
    );
  }
}

class _ModuleSidebar extends StatelessWidget {
  const _ModuleSidebar({
    required this.shell,
  });

  final ShellModel shell;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(18),
        child: ListView(
          children: [
            Text('Adapter Routes', style: theme.textTheme.titleMedium),
            const SizedBox(height: 6),
            Text(
              'Product-owned capability surface across CLI, FFI, and Cloud adapters.',
              style: theme.textTheme.bodySmall,
            ),
            const SizedBox(height: 12),
            for (final capability in shell.adapterCapabilities)
              Padding(
                padding: const EdgeInsets.only(bottom: 10),
                child: _AdapterCapabilityTile(capability: capability),
              ),
            const SizedBox(height: 8),
            Text('Module Host', style: theme.textTheme.titleMedium),
            const SizedBox(height: 6),
            Text(
              'Capability matrix filtered for ${shell.platformTarget.label}.',
              style: theme.textTheme.bodySmall,
            ),
            const SizedBox(height: 12),
            for (var index = 0; index < shell.visibleModules.length; index += 1)
              Padding(
                padding: EdgeInsets.only(
                  bottom: index == shell.visibleModules.length - 1 ? 0 : 10,
                ),
                child: _ModuleTile(
                  module: shell.visibleModules[index],
                  mounted: shell.visibleModules[index].isMountedOn(
                    shell.platformTarget,
                  ),
                  platformTarget: shell.platformTarget,
                ),
              ),
          ],
        ),
      ),
    );
  }
}

class _AdapterCapabilityTile extends StatelessWidget {
  const _AdapterCapabilityTile({
    required this.capability,
  });

  final AdapterCapabilitySnapshot capability;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return DecoratedBox(
      decoration: BoxDecoration(
        color: const Color(0xFFF8F4ED),
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: theme.dividerColor),
      ),
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              capability.adapterKind.label,
              style: theme.textTheme.titleMedium,
            ),
            const SizedBox(height: 8),
            Text(
              'language ${capability.languageService.level.label} · project ${capability.projectGraph.level.label}',
              style: theme.textTheme.bodySmall,
            ),
            const SizedBox(height: 4),
            Text(
              'execution ${capability.execution.level.label} · runtime ${capability.runtimeEvents.level.label}',
              style: theme.textTheme.bodySmall,
            ),
            const SizedBox(height: 8),
            Text(
              capability.execution.detail,
              style: theme.textTheme.bodySmall,
            ),
          ],
        ),
      ),
    );
  }
}

class _BottomSurfaceTabs extends StatelessWidget {
  const _BottomSurfaceTabs({
    required this.shell,
    required this.viewportProfile,
  });

  final ShellModel shell;
  final ViewportProfile viewportProfile;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final tabs = <Widget>[
      _SurfaceTabChip(
        label: 'Runtime',
        active: shell.activeBottomTab == BottomSurfaceTab.runtime,
        onTap: () => shell.selectBottomTab(BottomSurfaceTab.runtime),
      ),
      _SurfaceTabChip(
        label: 'Agent',
        active: shell.activeBottomTab == BottomSurfaceTab.agent,
        onTap: () => shell.selectBottomTab(BottomSurfaceTab.agent),
      ),
      _SurfaceTabChip(
        label: 'Debug',
        active: shell.activeBottomTab == BottomSurfaceTab.debug,
        onTap: () => shell.selectBottomTab(BottomSurfaceTab.debug),
      ),
    ];

    if (viewportProfile.isMobile) {
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Wrap(
            spacing: 10,
            runSpacing: 10,
            children: tabs,
          ),
          const SizedBox(height: 8),
          Text(
            'Mobile shell keeps runtime, agent, and debug on one vertical route. Hardware keyboard shortcuts remain optional.',
            style: Theme.of(context).textTheme.bodySmall,
          ),
        ],
      );
    }

    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: Row(
        children: [
          for (var index = 0; index < tabs.length; index += 1) ...[
            if (index > 0) const SizedBox(width: 10),
            tabs[index],
          ],
          const SizedBox(width: 16),
          for (final command in StyioCommandRegistry.primaryCommands)
            Padding(
              padding: const EdgeInsets.only(left: 8),
              child: Tooltip(
                message: shell.blockedReasonForCommand(command.id) ??
                    '${command.description} (${command.shortcutHint})',
                child: ActionChip(
                  key: ValueKey('command-strip-${command.id.name}'),
                  onPressed: shell.blockedReasonForCommand(command.id) == null
                      ? () => shell.executeCommand(command.id)
                      : null,
                  avatar: Icon(
                    _commandIcon(command.id),
                    size: 18,
                    color: shell.blockedReasonForCommand(command.id) == null
                        ? theme.colorScheme.primary
                        : theme.disabledColor,
                  ),
                  label: Text('${command.label} · ${command.shortcutHint}'),
                ),
              ),
            ),
        ],
      ),
    );
  }
}

IconData _commandIcon(AppCommandId commandId) {
  switch (commandId) {
    case AppCommandId.run:
      return Icons.play_arrow_rounded;
    case AppCommandId.fetchDependencies:
      return Icons.cloud_download_rounded;
    case AppCommandId.vendorDependencies:
      return Icons.inventory_2_rounded;
    case AppCommandId.refreshModules:
      return Icons.refresh_rounded;
    case AppCommandId.save:
      return Icons.save_rounded;
    case AppCommandId.showRuntime:
      return Icons.terminal_rounded;
    case AppCommandId.showAgent:
      return Icons.smart_toy_outlined;
    case AppCommandId.showDebug:
      return Icons.bug_report_outlined;
    case AppCommandId.openSettings:
      return Icons.settings_outlined;
  }
}

class _SurfaceTabChip extends StatelessWidget {
  const _SurfaceTabChip({
    required this.label,
    required this.active,
    required this.onTap,
  });

  final String label;
  final bool active;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      borderRadius: BorderRadius.circular(999),
      onTap: onTap,
      child: Ink(
        decoration: BoxDecoration(
          color: active ? const Color(0xFFEFE7DA) : const Color(0xFFF7F2E9),
          borderRadius: BorderRadius.circular(999),
        ),
        padding: const EdgeInsets.symmetric(
          horizontal: 14,
          vertical: 10,
        ),
        child: Text(label),
      ),
    );
  }
}

class _ModuleTile extends StatelessWidget {
  const _ModuleTile({
    required this.module,
    required this.mounted,
    required this.platformTarget,
  });

  final ModuleDefinition module;
  final bool mounted;
  final PlatformTarget platformTarget;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final rule = module.ruleFor(platformTarget);

    return DecoratedBox(
      decoration: BoxDecoration(
        color: mounted ? const Color(0xFFF3ECDD) : const Color(0xFFF8F4ED),
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: theme.dividerColor),
      ),
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Expanded(
                  child: Text(
                    module.manifest.displayName,
                    style: theme.textTheme.titleMedium,
                  ),
                ),
                Chip(
                  label: Text(mounted ? 'Mounted' : 'Visible'),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Text(
              module.manifest.description,
              style: theme.textTheme.bodySmall,
            ),
            const SizedBox(height: 10),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                Chip(label: Text(module.manifest.kind.wireValue)),
                Chip(label: Text(module.manifest.slot.wireValue)),
                Chip(label: Text(rule.distributionChannel)),
              ],
            ),
            const SizedBox(height: 10),
            Text(rule.note, style: theme.textTheme.bodySmall),
          ],
        ),
      ),
    );
  }
}
