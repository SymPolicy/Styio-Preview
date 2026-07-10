# Dependency Usage Boundary

**Purpose:** Record dependency authorization boundaries for `Styio-Preview`.

**Last updated:** 2026-06-29

`Styio-Preview` is an Apache-2.0 aggregation workspace for Styio, Pafio, and Vityo source trees. Its current build, test, app, prototype, runner, docs, and fixture dependency boundary is:

- CMake and CTest drive native compiler/runtime, Pafio, and test workflows.
- `LLVM`, `ICU`, `Python3`, `tree_sitter_runtime`, and `googletest` are inherited from the Styio compiler/runtime build and test surfaces.
- `tomlplusplus` and `nlohmann_json` are inherited from the Pafio package-manager build surface.
- Flutter SDK, Dart SDK, `sdk`, `flutter`, `flutter_test`, `flutter_lints`, `crypto`, `cryptography`, `cupertino_icons`, `shared_preferences`, `path_provider`, and `web` are Vityo frontend dependencies governed by `vityo/frontend/vityo_app/pubspec.yaml`.
- `playwright-core` is Vityo prototype screenshot and browser automation tooling governed by `vityo/prototype/package.json`.
- `PkgConfig` is used by inherited Linux Flutter runner CMake files to discover platform libraries during local desktop builds.
- Repository workflows may invoke system tools such as `git`, `cmake`, shell utilities, package-manager tooling, and configured compiler/runtime tools through explicit process boundaries.

Dependency policy:

- No dependency may require commercial authorization, paid licensing, subscription access, membership access, trial-only terms, proprietary-use approval, or private registry access.
- Any future dependency must be listed here with its license evidence, source boundary, and usage boundary before it can pass audit.
- Fixture-only and prototype-only dependencies must stay scoped to fixtures or prototypes and must not become runtime requirements without this file being updated.
- Generated reports and gate summaries must summarize dependency and license evidence without copying target repository source.
