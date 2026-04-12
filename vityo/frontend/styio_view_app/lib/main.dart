import 'package:flutter/widgets.dart';

import 'src/app/app_bootstrap.dart';
import 'src/app/styio_view_app.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  final bootstrap = await AppBootstrap.load();
  runApp(StyioViewApp(bootstrap: bootstrap));
}
