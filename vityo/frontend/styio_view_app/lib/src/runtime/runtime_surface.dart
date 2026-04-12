import 'package:flutter/material.dart';

import '../integration/adapter_contracts.dart';
import '../integration/execution_adapter.dart';
import '../integration/execution_route_summary.dart';
import '../integration/project_graph_contract.dart';
import '../module_host/module_definition.dart';
import '../module_host/module_manifest.dart';
import '../platform/platform_target.dart';
import '../platform/viewport_profile.dart';

class RuntimeSurface extends StatelessWidget {
  const RuntimeSurface({
    super.key,
    required this.platformTarget,
    required this.viewportProfile,
    required this.projectGraph,
    required this.mountedModules,
    required this.adapterCapabilities,
    required this.executionSession,
  });

  final PlatformTarget platformTarget;
  final ViewportProfile viewportProfile;
  final ProjectGraphSnapshot projectGraph;
  final List<ModuleDefinition> mountedModules;
  final List<AdapterCapabilitySnapshot> adapterCapabilities;
  final ExecutionSession? executionSession;

  @override
  Widget build(BuildContext context) {
    final runtimeModules = mountedModules
        .where(
          (module) => switch (module.manifest.slot) {
            ModuleSlot.runtimeSurface ||
            ModuleSlot.localRuntime ||
            ModuleSlot.cloudRuntime ||
            ModuleSlot.debugTools =>
              true,
            _ => false,
          },
        )
        .toList(growable: false);
    final routeSummary = summarizeExecutionRoute(
      platformTarget: platformTarget,
      projectGraph: projectGraph,
      adapterCapabilities: adapterCapabilities,
    );
    final laneCount = runtimeModules.any(
      (module) => module.manifest.slot == ModuleSlot.localRuntime,
    )
        ? 3
        : 1;
    final executionCapability = adapterCapabilities
        .firstWhere(
          (snapshot) => snapshot.adapterKind == AdapterKind.cli,
          orElse: () => const AdapterCapabilitySnapshot(
            adapterKind: AdapterKind.cli,
            languageService: AdapterEndpointCapability(
              level: AdapterCapabilityLevel.unavailable,
              detail: 'No CLI adapter resolved.',
            ),
            projectGraph: AdapterEndpointCapability(
              level: AdapterCapabilityLevel.unavailable,
              detail: 'No CLI adapter resolved.',
            ),
            execution: AdapterEndpointCapability(
              level: AdapterCapabilityLevel.unavailable,
              detail: 'No CLI adapter resolved.',
            ),
            runtimeEvents: AdapterEndpointCapability(
              level: AdapterCapabilityLevel.unavailable,
              detail: 'No CLI adapter resolved.',
            ),
          ),
        )
        .execution;
    final cardSpacing = viewportProfile.isMobile ? 12.0 : 14.0;

    return _SurfaceFrame(
      key: ValueKey(
        'runtime-surface-${viewportProfile.label.toLowerCase()}',
      ),
      title: 'Runtime Surface',
      subtitle:
          '${platformTarget.label} runtime route aligned to the ${viewportProfile.label.toLowerCase()} shell.',
      child: viewportProfile.isMobile
          ? Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _MetricSection(
                  title: 'Execution Route',
                  body:
                      '${routeSummary.title}. ${routeSummary.body} ${executionCapability.detail}',
                  accent: const Color(0xFFD9E8F8),
                ),
                SizedBox(height: cardSpacing),
                _MetricSection(
                  title: 'Lane Preview',
                  body:
                      '$laneCount lane slot(s) reserved. M5 will replace this placeholder with event-driven thread lanes.',
                  accent: const Color(0xFFEDE6D9),
                ),
                SizedBox(height: cardSpacing),
                _MetricSection(
                  title: 'Registry Gate',
                  body:
                      '${runtimeModules.length} runtime-related module(s) mounted. Unsupported semantic subsets will continue to degrade explicitly.',
                  accent: const Color(0xFFE4E7D2),
                ),
                SizedBox(height: cardSpacing),
                _ExecutionSessionSection(
                  executionSession: executionSession,
                ),
                SizedBox(height: cardSpacing),
                _ModuleChipSection(
                  title: 'Mounted Runtime Modules',
                  modules: runtimeModules,
                ),
              ],
            )
          : Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _MetricSection(
                  title: 'Execution Route',
                  body:
                      '${routeSummary.title}. ${routeSummary.body} ${executionCapability.detail}',
                  accent: const Color(0xFFD9E8F8),
                ),
                SizedBox(height: cardSpacing),
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(
                      child: _MetricSection(
                        title: 'Lane Preview',
                        body:
                            '$laneCount lane slot(s) reserved. Local runtime capable targets expose broader parallel lane previews.',
                        accent: const Color(0xFFEDE6D9),
                      ),
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: _MetricSection(
                        title: 'Registry Gate',
                        body:
                            '${runtimeModules.length} runtime-related module(s) mounted. Surface features will load from the module registry at startup.',
                        accent: const Color(0xFFE4E7D2),
                      ),
                    ),
                  ],
                ),
                SizedBox(height: cardSpacing),
                _ExecutionSessionSection(
                  executionSession: executionSession,
                ),
                SizedBox(height: cardSpacing),
                _ModuleChipSection(
                  title: 'Mounted Runtime Modules',
                  modules: runtimeModules,
                ),
              ],
            ),
    );
  }
}

class _SurfaceFrame extends StatelessWidget {
  const _SurfaceFrame({
    super.key,
    required this.title,
    required this.subtitle,
    required this.child,
  });

  final String title;
  final String subtitle;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: ListView(
          children: [
            Text(title, style: theme.textTheme.titleMedium),
            const SizedBox(height: 6),
            Text(subtitle, style: theme.textTheme.bodySmall),
            const SizedBox(height: 18),
            child,
          ],
        ),
      ),
    );
  }
}

class _MetricSection extends StatelessWidget {
  const _MetricSection({
    required this.title,
    required this.body,
    required this.accent,
  });

  final String title;
  final String body;
  final Color accent;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        color: accent,
        borderRadius: BorderRadius.circular(18),
      ),
      padding: const EdgeInsets.all(14),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: theme.textTheme.titleMedium),
          const SizedBox(height: 8),
          Text(body, style: theme.textTheme.bodySmall),
        ],
      ),
    );
  }
}

class _ExecutionSessionSection extends StatelessWidget {
  const _ExecutionSessionSection({
    required this.executionSession,
  });

  final ExecutionSession? executionSession;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final session = executionSession;
    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        color: const Color(0xFFF7F2E9),
        borderRadius: BorderRadius.circular(18),
      ),
      padding: const EdgeInsets.all(14),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Execution Status', style: theme.textTheme.titleMedium),
          const SizedBox(height: 10),
          if (session == null)
            Text(
              'No execution session has been started yet.',
              style: theme.textTheme.bodySmall,
            )
          else ...[
            Text(
              '${session.kind} · ${session.status.name}',
              style: theme.textTheme.titleMedium,
            ),
            const SizedBox(height: 6),
            Text(
              session.statusMessage,
              style: theme.textTheme.bodySmall,
            ),
            if (session.unitRange != null) ...[
              const SizedBox(height: 6),
              Text(
                'unit ${session.unitRange!.start}-${session.unitRange!.end}',
                style: theme.textTheme.bodySmall,
              ),
            ],
            if (session.diagnostics.isNotEmpty) ...[
              const SizedBox(height: 8),
              Text(
                '${session.diagnostics.length} diagnostic(s) returned from the execution route.',
                style: theme.textTheme.bodySmall,
              ),
            ],
            if (session.stdoutEvents.isNotEmpty ||
                session.stderrEvents.isNotEmpty) ...[
              const SizedBox(height: 8),
              Text(
                '${session.stdoutEvents.length} stdout event(s) · ${session.stderrEvents.length} stderr event(s)',
                style: theme.textTheme.bodySmall,
              ),
            ],
          ],
        ],
      ),
    );
  }
}

class _ModuleChipSection extends StatelessWidget {
  const _ModuleChipSection({
    required this.title,
    required this.modules,
  });

  final String title;
  final List<ModuleDefinition> modules;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        color: const Color(0xFFF7F2E9),
        borderRadius: BorderRadius.circular(18),
      ),
      padding: const EdgeInsets.all(14),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: theme.textTheme.titleMedium),
          const SizedBox(height: 10),
          if (modules.isEmpty)
            Text(
              'No runtime modules are mounted for this target.',
              style: theme.textTheme.bodySmall,
            )
          else
            Wrap(
              spacing: 10,
              runSpacing: 10,
              children: modules
                  .map(
                    (module) => Chip(
                      label: Text(module.manifest.displayName),
                    ),
                  )
                  .toList(growable: false),
            ),
        ],
      ),
    );
  }
}
