# Styio View Build And Dev Environment

**Purpose:** Provide the repository-level entry point for bootstrapping a fresh machine, installing shared GUI toolchains, and routing contributors to the correct implementation surface.

**Last updated:** 2026-04-19

## Who This Is For

1. Contributors bringing up `styio-view` on a fresh Debian/Ubuntu VM or container.
2. Contributors working on the Flutter shell in `frontend/styio_view_app/`.
3. Contributors working on the handwritten web prototype in `prototype/`.

## Fresh Machine Bootstrap

From the repository root:

```bash
./scripts/bootstrap-dev-env.sh
```

That script installs the Linux/Web/Flutter/Android toolchains used by this repository, provisions Flutter and the Android SDK under the current user account, and restores the in-repo `npm` and `flutter pub` dependencies.

## Required Toolchains

1. Flutter stable with the Linux, Web, and Android targets enabled.
2. Android SDK command-line tools, platform tools, build tools, and NDK.
3. Chromium for local web verification.
4. Node.js and npm for the handwritten prototype.
5. Python 3 for docs and repository hygiene scripts.

## Typical Build And Test Commands

Flutter shell:

```bash
cd frontend/styio_view_app
flutter analyze
flutter test
flutter build web
```

Handwritten prototype:

```bash
cd prototype
npm run selftest:editor
```

If you use the bundled `dev_server.py`, set the focused editor URL explicitly because the server listens on port `4180`:

```bash
cd prototype
STYIO_EDITOR_URL=http://127.0.0.1:4180/editor.html npm run selftest:editor
```

Repository docs and hygiene checks:

```bash
./scripts/docs-gate.sh
python3 scripts/repo-hygiene-gate.py --mode tracked
./scripts/delivery-gate.sh --mode checkpoint --skip-health
```

Full checkpoint delivery floor:

```bash
./scripts/delivery-gate.sh --mode checkpoint
```

## Subsystem-Specific Follow-Ups

1. Flutter shell details: [../frontend/styio_view_app/README.md](../frontend/styio_view_app/README.md)
2. Handwritten prototype details: [../prototype/README.md](../prototype/README.md)
3. Product and system design: [design/Styio-View-System-Architecture.md](./design/Styio-View-System-Architecture.md)
4. Team and review routing: [teams/COORDINATION-RUNBOOK.md](./teams/COORDINATION-RUNBOOK.md)

## Related Docs

1. Docs tree guide: [README.md](./README.md)
2. Product spec: [design/Styio-View-Product-Spec.md](./design/Styio-View-Product-Spec.md)
3. Handwritten Web IDE handbook: [specs/HANDWRITTEN-WEB-IDE-ENGINEERING-HANDBOOK.md](./specs/HANDWRITTEN-WEB-IDE-ENGINEERING-HANDBOOK.md)
