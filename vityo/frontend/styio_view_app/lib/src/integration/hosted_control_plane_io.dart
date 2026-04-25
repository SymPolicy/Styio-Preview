import 'dart:convert';
import 'dart:io';

import '../platform/platform_target.dart';
import 'hosted_control_plane.dart';

Map<String, String> Function() _hostedEnvironmentProvider =
    () => Platform.environment;

void debugOverrideHostedEnvironment(Map<String, String>? environment) {
  _hostedEnvironmentProvider = environment == null
      ? () => Platform.environment
      : () => Map<String, String>.unmodifiable(environment);
}

HostedControlPlaneConfig? resolveHostedControlPlaneConfig({
  required PlatformTarget platformTarget,
}) {
  final env = _hostedEnvironmentProvider();
  final baseUrl = _envValue(env, 'STYIO_VIEW_HOSTED_URL');
  final workspaceRoot = _envValue(env, 'STYIO_VIEW_HOSTED_WORKSPACE_ROOT');
  final manifestPath = _envValue(env, 'STYIO_VIEW_HOSTED_MANIFEST_PATH');
  final workspaceId = _envValue(env, 'STYIO_VIEW_HOSTED_WORKSPACE_ID');
  final forceHosted = _envValue(env, 'STYIO_VIEW_FORCE_HOSTED_ROUTE') == '1';
  if (baseUrl == null || workspaceRoot == null) {
    return null;
  }
  if (platformTarget != PlatformTarget.ios &&
      platformTarget != PlatformTarget.web &&
      !(platformTarget == PlatformTarget.android && forceHosted)) {
    return null;
  }
  return HostedControlPlaneConfig(
    baseUrl: baseUrl,
    workspaceRoot: workspaceRoot,
    manifestPath: manifestPath,
    workspaceId: workspaceId,
    forceHostedRoute: forceHosted,
  );
}

Future<HostedControlPlaneClient?> createHostedControlPlaneClient({
  required PlatformTarget platformTarget,
}) async {
  final config =
      resolveHostedControlPlaneConfig(platformTarget: platformTarget);
  return config == null ? null : _IoHostedControlPlaneClient(config: config);
}

class _IoHostedControlPlaneClient implements HostedControlPlaneClient {
  _IoHostedControlPlaneClient({
    required this.config,
  });

  @override
  final HostedControlPlaneConfig config;

  @override
  Future<Map<String, dynamic>> openWorkspace({
    required PlatformTarget platformTarget,
  }) {
    return _post(
      '/workspaces/open',
      <String, Object?>{
        'workspace_root': config.workspaceRoot,
        if (config.manifestPath != null) 'manifest_path': config.manifestPath,
        'platform': platformTarget.wireValue,
      },
    );
  }

  @override
  Future<Map<String, dynamic>> projectGraph({
    required String workspaceId,
  }) {
    return _get('/workspaces/$workspaceId/project-graph');
  }

  @override
  Future<Map<String, dynamic>> toolInstall({
    required String workspaceId,
    required String styioBinaryPath,
  }) {
    return _post(
      '/workspaces/$workspaceId/tool/install',
      <String, Object?>{'styio_binary_path': styioBinaryPath},
    );
  }

  @override
  Future<Map<String, dynamic>> toolUse({
    required String workspaceId,
    required String compilerVersion,
    String? channel,
  }) {
    return _post(
      '/workspaces/$workspaceId/tool/use',
      <String, Object?>{
        'compiler_version': compilerVersion,
        if (channel != null && channel.isNotEmpty) 'channel': channel,
      },
    );
  }

  @override
  Future<Map<String, dynamic>> toolPin({
    required String workspaceId,
    required String compilerVersion,
    String? channel,
  }) {
    return _post(
      '/workspaces/$workspaceId/tool/pin',
      <String, Object?>{
        'compiler_version': compilerVersion,
        if (channel != null && channel.isNotEmpty) 'channel': channel,
      },
    );
  }

  @override
  Future<Map<String, dynamic>> toolClearPin({
    required String workspaceId,
  }) {
    return _post(
        '/workspaces/$workspaceId/tool/clear-pin', const <String, Object?>{});
  }

  @override
  Future<Map<String, dynamic>> fetchDependencies({
    required String workspaceId,
    bool locked = false,
    bool offline = false,
  }) {
    return _post(
      '/workspaces/$workspaceId/dependencies/fetch',
      <String, Object?>{
        'locked': locked,
        'offline': offline,
      },
    );
  }

  @override
  Future<Map<String, dynamic>> vendorDependencies({
    required String workspaceId,
    String? outputPath,
    bool locked = false,
    bool offline = false,
  }) {
    return _post(
      '/workspaces/$workspaceId/dependencies/vendor',
      <String, Object?>{
        if (outputPath != null && outputPath.isNotEmpty)
          'output_path': outputPath,
        'locked': locked,
        'offline': offline,
      },
    );
  }

  @override
  Future<Map<String, dynamic>> runWorkflow({
    required String workspaceId,
    required String activeFilePath,
    required String documentText,
    String? packageName,
    String? targetName,
    String? targetKind,
  }) {
    return _post(
      '/workspaces/$workspaceId/execution/run',
      <String, Object?>{
        'active_file_path': activeFilePath,
        'document_text': documentText,
        if (packageName != null && packageName.isNotEmpty)
          'package_name': packageName,
        if (targetName != null && targetName.isNotEmpty)
          'target_name': targetName,
        if (targetKind != null && targetKind.isNotEmpty)
          'target_kind': targetKind,
      },
    );
  }

  @override
  Future<Map<String, dynamic>> buildWorkflow({
    required String workspaceId,
    required String activeFilePath,
    required String documentText,
    String? packageName,
    String? targetName,
    String? targetKind,
  }) {
    return _post(
      '/workspaces/$workspaceId/execution/build',
      <String, Object?>{
        'active_file_path': activeFilePath,
        'document_text': documentText,
        if (packageName != null && packageName.isNotEmpty)
          'package_name': packageName,
        if (targetName != null && targetName.isNotEmpty)
          'target_name': targetName,
        if (targetKind != null && targetKind.isNotEmpty)
          'target_kind': targetKind,
      },
    );
  }

  @override
  Future<Map<String, dynamic>> testWorkflow({
    required String workspaceId,
    required String activeFilePath,
    required String documentText,
    String? packageName,
    String? targetName,
    String? targetKind,
  }) {
    return _post(
      '/workspaces/$workspaceId/execution/test',
      <String, Object?>{
        'active_file_path': activeFilePath,
        'document_text': documentText,
        if (packageName != null && packageName.isNotEmpty)
          'package_name': packageName,
        if (targetName != null && targetName.isNotEmpty)
          'target_name': targetName,
        if (targetKind != null && targetKind.isNotEmpty)
          'target_kind': targetKind,
      },
    );
  }

  @override
  Future<Map<String, dynamic>> packProject({
    required String workspaceId,
    String? packageName,
    String? outputPath,
  }) {
    return _post(
      '/workspaces/$workspaceId/deployment/pack',
      <String, Object?>{
        if (packageName != null && packageName.isNotEmpty)
          'package_name': packageName,
        if (outputPath != null && outputPath.isNotEmpty)
          'output_path': outputPath,
      },
    );
  }

  @override
  Future<Map<String, dynamic>> preparePublish({
    required String workspaceId,
    String? packageName,
    String? outputPath,
  }) {
    return _post(
      '/workspaces/$workspaceId/deployment/preflight',
      <String, Object?>{
        if (packageName != null && packageName.isNotEmpty)
          'package_name': packageName,
        if (outputPath != null && outputPath.isNotEmpty)
          'output_path': outputPath,
      },
    );
  }

  @override
  Future<Map<String, dynamic>> publishToRegistry({
    required String workspaceId,
    required String registryRoot,
    String? packageName,
    String? outputPath,
  }) {
    return _post(
      '/workspaces/$workspaceId/deployment/publish',
      <String, Object?>{
        'registry_root': registryRoot,
        if (packageName != null && packageName.isNotEmpty)
          'package_name': packageName,
        if (outputPath != null && outputPath.isNotEmpty)
          'output_path': outputPath,
      },
    );
  }

  Future<Map<String, dynamic>> _get(String path) async {
    final uri = Uri.parse('${config.baseUrl}$path');
    final client = HttpClient();
    try {
      final request = await client.getUrl(uri);
      final response = await request.close();
      return _decodeResponse(uri, response);
    } finally {
      client.close(force: true);
    }
  }

  Future<Map<String, dynamic>> _post(
    String path,
    Map<String, Object?> body,
  ) async {
    final uri = Uri.parse('${config.baseUrl}$path');
    final client = HttpClient();
    try {
      final encoded = utf8.encode(jsonEncode(body));
      final request = await client.postUrl(uri);
      request.headers.contentType = ContentType.json;
      request.contentLength = encoded.length;
      request.add(encoded);
      final response = await request.close();
      return _decodeResponse(uri, response);
    } finally {
      client.close(force: true);
    }
  }

  Future<Map<String, dynamic>> _decodeResponse(
    Uri uri,
    HttpClientResponse response,
  ) async {
    final text = await response.transform(utf8.decoder).join();
    final decoded = jsonDecode(text);
    if (decoded is! Map<String, dynamic>) {
      throw StateError(
          'Hosted control plane at $uri did not return a JSON object.');
    }
    if (response.statusCode >= 400) {
      throw StateError(decoded['message'] as String? ??
          'Hosted control plane request failed.');
    }
    return decoded;
  }
}

String? _envValue(Map<String, String> env, String name) {
  final value = env[name];
  if (value == null) {
    return null;
  }
  final trimmed = value.trim();
  return trimmed.isEmpty ? null : trimmed;
}
