import 'package:flutter/widgets.dart';

enum AppCommandId {
  save,
  run,
  showRuntime,
  showAgent,
  showDebug,
  refreshModules,
  openSettings,
}

class AppCommandIntent extends Intent {
  const AppCommandIntent(this.commandId);

  final AppCommandId commandId;
}

class AppCommandDescriptor {
  const AppCommandDescriptor({
    required this.id,
    required this.label,
    required this.shortcutHint,
    required this.description,
  });

  final AppCommandId id;
  final String label;
  final String shortcutHint;
  final String description;
}

class StyioCommandRegistry {
  static const List<AppCommandDescriptor> commands = [
    AppCommandDescriptor(
      id: AppCommandId.save,
      label: 'Save',
      shortcutHint: 'Cmd/Ctrl+S',
      description: 'Persist the current workspace target.',
    ),
    AppCommandDescriptor(
      id: AppCommandId.run,
      label: 'Run Unit',
      shortcutHint: 'Cmd/Ctrl+Enter',
      description: 'Run the active minimal compilable unit.',
    ),
    AppCommandDescriptor(
      id: AppCommandId.showRuntime,
      label: 'Runtime',
      shortcutHint: 'Shift+1',
      description: 'Focus the runtime surface.',
    ),
    AppCommandDescriptor(
      id: AppCommandId.showAgent,
      label: 'Agent',
      shortcutHint: 'Shift+2',
      description: 'Focus the agent surface.',
    ),
    AppCommandDescriptor(
      id: AppCommandId.showDebug,
      label: 'Debug',
      shortcutHint: 'Shift+3',
      description: 'Focus the debug console.',
    ),
    AppCommandDescriptor(
      id: AppCommandId.refreshModules,
      label: 'Refresh Modules',
      shortcutHint: 'Cmd/Ctrl+R',
      description: 'Refresh module host state and bridge descriptors.',
    ),
    AppCommandDescriptor(
      id: AppCommandId.openSettings,
      label: 'Settings',
      shortcutHint: 'Cmd/Ctrl+,',
      description: 'Open settings and profile routes.',
    ),
  ];
}
