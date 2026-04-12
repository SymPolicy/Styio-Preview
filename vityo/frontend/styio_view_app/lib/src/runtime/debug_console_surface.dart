import 'package:flutter/material.dart';

import '../platform/viewport_profile.dart';

class DebugConsoleSurface extends StatelessWidget {
  const DebugConsoleSurface({
    super.key,
    required this.viewportProfile,
    required this.entries,
  });

  final ViewportProfile viewportProfile;
  final List<String> entries;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final latestEntry = entries.isEmpty ? 'No host events yet.' : entries.first;

    return Card(
      key: ValueKey('debug-surface-${viewportProfile.label.toLowerCase()}'),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (viewportProfile.isMobile)
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Debug Console', style: theme.textTheme.titleMedium),
                  const SizedBox(height: 6),
                  Text(
                    'Compact development log aligned to the mobile shell.',
                    style: theme.textTheme.bodySmall,
                  ),
                  const SizedBox(height: 12),
                  Wrap(
                    spacing: 10,
                    runSpacing: 10,
                    children: [
                      Chip(label: Text('events ${entries.length}')),
                      Chip(label: Text(viewportProfile.label)),
                    ],
                  ),
                ],
              )
            else
              Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Debug Console',
                          style: theme.textTheme.titleMedium,
                        ),
                        const SizedBox(height: 6),
                        Text(
                          'Desktop development log slot. M4/M5 will feed compile and runtime events here.',
                          style: theme.textTheme.bodySmall,
                        ),
                      ],
                    ),
                  ),
                  Chip(label: Text('events ${entries.length}')),
                ],
              ),
            const SizedBox(height: 14),
            Container(
              width: double.infinity,
              decoration: BoxDecoration(
                color: const Color(0xFFF3ECDD),
                borderRadius: BorderRadius.circular(16),
              ),
              padding: const EdgeInsets.all(12),
              child: Text(
                latestEntry,
                style: theme.textTheme.bodySmall,
                maxLines: viewportProfile.isMobile ? 3 : 2,
                overflow: TextOverflow.ellipsis,
              ),
            ),
            const SizedBox(height: 14),
            Expanded(
              child: Container(
                width: double.infinity,
                decoration: BoxDecoration(
                  color: const Color(0xFF29282B),
                  borderRadius: BorderRadius.circular(18),
                ),
                padding: const EdgeInsets.all(14),
                child: ListView.separated(
                  reverse: false,
                  itemCount: entries.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 8),
                  itemBuilder: (context, index) {
                    return Text(
                      entries[index],
                      style: const TextStyle(
                        color: Color(0xFFF2F0EC),
                        height: 1.35,
                        fontFamily: 'monospace',
                      ),
                    );
                  },
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
