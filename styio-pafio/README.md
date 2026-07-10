# pafio

**Purpose:** `pafio` is the local-first package manager and project workflow client for Styio. It is designed to work offline when packages are available locally and to use `pafio` only as an optional service foundation.

**Last updated:** 2026-05-03

## Scope

- `pafio` manages package manifests, lockfiles, dependency resolution, cache layout, local package import/export, package build orchestration, and project-level commands.
- `pafio` does not parse Styio source semantics on its own.
- `pafio` does not own hosted compile services, registry server control planes, worker pools, or extensible cloud-service backends; those live in `pafio`.
- `pafio` must remain useful without a platform connection when dependencies are satisfied by workspace, path, vendor, cache, or explicitly imported offline packages.
- `pafio` supports two project toolchain modes:
  - `binary`: published compiler path through a versioned machine contract and a process boundary
  - `build`: source-build path through an official `styio` source checkout and local compiler build cache

## Product Surface Split

- `frontend/console/` is reserved for the repo-hosted human control console page.
- `src/` remains the native package-manager core and compatibility renderer for client-side package, registry, toolchain, and compile-plan handoff behavior.
- `docs/registry/` and `docs/governance/` remain the SSOT for package-manager client contracts; service-side runbooks and control planes move to `pafio`.
- the native CLI stays the machine/admin surface; it is not the user-facing control console.

The normative split is defined in
[`docs/governance/Pafio-Control-Console-And-Service-Split.md`](docs/governance/Pafio-Control-Console-And-Service-Split.md).

## Native Target Split

- `src/` no longer builds as one monolithic `pafio_core`.
- package-manager/domain code now composes from internal static libraries such as `pafio_foundation`, `pafio_manifest`, `pafio_resolution`, `pafio_toolchain_service`, `pafio_package_service`, and `pafio_project_service`.
- the CLI surface now sits on top as `pafio_cli_support`, `pafio_cli_commands`, and `pafio_cli_shell`, with the `pafio` executable linking the shell target only.
- this keeps the local CLI split from compatibility payload rendering while platform service binaries move to `pafio`.

The source-level ownership summary lives in
[`src/README.md`](src/README.md) and the planning note for the split lives in
[`docs/planning/Pafio-Native-Target-Split.md`](docs/planning/Pafio-Native-Target-Split.md).

## Independence Rules

- `pafio` must not include or link against `styio` implementation headers or libraries.
- `pafio` must not depend on files under `../src`, `../tests`, or any other compiler-internal path.
- `pafio` may depend on a published external `styio` executable only through the documented binary-mode discovery path such as `--styio-bin` or `PAFIO_STYIO_BIN`.
- `pafio` source-build mode may fetch the official `styio` source tree from `https://github.com/SymPolicy/Styio-Preview.git`, using the `stable` and `nightly` branches as the channel roots, through the documented source-build contract and cache layout.
- `pafio/contracts/` is the source of truth for package-manager-side machine contracts. Hosted workspace, registry control-plane server, and cloud-service contracts are downstream in `pafio`.
- Local package import/export is a client-side contract. It must not require
  `pafio`; platform mirrors only improve discovery and distribution.

## Tree

```text
styio-pafio/
  frontend/
    console/
  src/
  tests/
    unit/
    integration/
  docs/
  contracts/
  scripts/
```

## Monorepo Note

`styio-pafio/` is imported as a sibling module in `Styio-Preview`. It remains source-independent from `styio/`: shared behavior crosses process and contract boundaries instead of C++ include or link boundaries.

## Implementation Stack Note

The active implementation target is a native `C++20` + `CMake` codebase aligned with the operational toolchain used by `styio`.

The native core is now the active implementation path for:

- CLI shape
- manifest and lockfile validation rules
- machine-facing contract boundaries
- registry `v2` static distribution and control-plane contract gates
- offline package cache, local import/export, and project-local Styio environment optimization

Python remains in-tree only where it owns repository automation, contract gates, and registry/control-plane helper tooling.

## Developer Context Pack

When working on `pafio` against the sibling `styio/` compiler module, developers should read:

- `docs/external/for-styio/Styio-for-Pafio-Developers.md`
- `docs/external/for-styio/Styio-Public-Interface-Roadmap.md`
- `docs/governance/Pafio-Version-Decoupling-Constraints.md`

Those documents are the knowledge pack for working against `styio` without creating hidden source-level dependencies.

## Developer Entry Points

Start repo bootstrap and common build/test commands from [docs/BUILD-AND-DEV-ENV.md](docs/BUILD-AND-DEV-ENV.md).

## Alpha User Bootstrap

The v0.1.0-alpha install flow is intended to be a prebuilt-first path:

```sh
curl -fsSL https://packages.styio.dev/tools/pafio/install-pafio.sh | sh -s -- --base-url https://packages.styio.dev && pafio install styio@latest && styio --version
```

`install-pafio.sh` installs `pafio`, writes `PAFIO_HOME/config/tool-release-root`
when installed from a platform release root, and installs a companion `styio`
shim. `pafio install styio@latest` then resolves the current platform to a
client release target such as `styio-linux` or `styio-macos-cli`, downloads the
platform-hosted prebuilt compiler, verifies its SHA-256 checksum, and promotes it
under `PAFIO_HOME/tools/styio/current/`.

The first alpha artifact set covers `darwin-aarch64`, `linux-aarch64`, and
`linux-musl-aarch64`. x86_64 Linux artifacts and fully self-contained runtime
archives are still release-engineering follow-ups.

Use `pafio doctor` when a fresh machine fails to bootstrap. It reports the
detected release platform, the resolved Styio client release target, release-root
configuration, required shell tools, `PAFIO_HOME`, and managed `styio` status in
one place.

Project-local workflow mode selection now uses:

- `./scripts/pafio use binary`
- `./scripts/pafio use build`
- `./scripts/pafio set channel as stable`
- `./scripts/pafio set channel as nightly`
- `./scripts/pafio set build as minimal`
- `./scripts/pafio set risk as trusted-internal|partner-controlled|untrusted-user`
- `./scripts/pafio set lane as isolated|warm-shared`
- `./scripts/pafio set security as sandbox-default|partner-restricted|trusted-warm`
- `./scripts/pafio project-graph --json`
- `./scripts/pafio doctor --json`
- `./scripts/pafio cloud status --json`
- `./scripts/pafio cloud plan --json build minimal`
- `./scripts/cloud-compile-stress.py --require-hot-replacement --summary-json /tmp/pafio-cloud-stress-summary.json --events-jsonl /tmp/pafio-cloud-stress-events.jsonl`
- `./scripts/pafio sync`
- `./scripts/pafio tool status --json`
- `./scripts/pafio build minimal`

`./scripts/pafio` is the repository-local convenience wrapper. It ensures the native binary exists under `./build-codex/bin/pafio` and then forwards the remaining arguments. Use the wrapper in day-to-day developer docs; use the explicit binary path when a gate or external harness needs a concrete executable.

Current source-build and platform boundary:

- `build` mode is implemented as a local source-build workflow rooted in the official `https://github.com/SymPolicy/Styio-Preview.git` source tree, with the `styio` compiler built through the monorepo root CMake target.
- `cloud status` and `cloud plan` remain local machine-readable compatibility surfaces for package-manager clients.
- the remote async control plane, queue, worker pools, hosted workspace APIs, registry server control planes, and extensible cloud-service runbooks belong to `pafio`.
- offline package use, local package import/export, local cache warm-up, vendor snapshots, and project-local compiler environment tuning belong to `styio-pafio`.

统一 docs/process 与交付入口分别为：

- `./scripts/docs-gate.sh`
- `./scripts/checkpoint-health.sh`
- `./scripts/delivery-gate.sh --mode checkpoint`

## Planning Entry Points

For the full implementation and migration plan, start with:

- `docs/planning/Pafio-Master-Plan.md`
- `docs/planning/Pafio-Stage-Review-and-Future-Features.md`
- `docs/planning/Pafio-Workstreams-and-TODOs.md`
- `docs/operations/Pafio-Verification-Matrix.md`
- `docs/operations/Pafio-Repo-Split-Runbook.md`
- `docs/governance/Pafio-Local-Offline-Package-Contract.md`

Recommended local preflight:

```text
./scripts/bootstrap-dev-env.sh
./scripts/preflight-readiness-check.py --styio-bin /absolute/path/to/styio
```
