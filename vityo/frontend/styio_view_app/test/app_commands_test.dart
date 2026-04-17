import 'package:flutter_test/flutter_test.dart';
import 'package:styio_view_app/src/app/commands/app_commands.dart';

void main() {
  test('command registry exposes primary command strip in mainline order', () {
    expect(
      StyioCommandRegistry.primaryCommands.map((command) => command.id),
      <AppCommandId>[
        AppCommandId.run,
        AppCommandId.fetchDependencies,
        AppCommandId.vendorDependencies,
        AppCommandId.refreshModules,
      ],
    );
  });

  test('command registry resolves descriptors and shortcuts for source ops',
      () {
    final fetch = StyioCommandRegistry.descriptorFor(
      AppCommandId.fetchDependencies,
    );
    final vendor = StyioCommandRegistry.descriptorFor(
      AppCommandId.vendorDependencies,
    );

    expect(fetch.label, 'Fetch');
    expect(fetch.shortcutHint, 'Cmd/Ctrl+Shift+F');
    expect(fetch.primary, isTrue);
    expect(fetch.shortcuts, hasLength(2));

    expect(vendor.label, 'Vendor');
    expect(vendor.shortcutHint, 'Cmd/Ctrl+Shift+V');
    expect(vendor.primary, isTrue);
    expect(vendor.shortcuts, hasLength(2));
  });
}
