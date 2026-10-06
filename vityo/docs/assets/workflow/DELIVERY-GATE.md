# Delivery Gate

**Purpose:** Define the common delivery-floor entrypoint for `Vityo` so contributors can run repository hygiene, the unified docs gate, external `General-Auditor`, and checkpoint health through one command before checkpoint merge or branch delivery.

**Last updated:** 2026-04-19

## Command

Checkpoint delivery floor:

```bash
./scripts/delivery-gate.sh --mode checkpoint
```

Push or branch-delivery floor:

```bash
./scripts/delivery-gate.sh --mode push --base origin/main
```

Docs/process-only delivery:

```bash
./scripts/delivery-gate.sh --mode checkpoint --skip-health
```

Use `GENERAL_AUDITOR_ROOT` with the local commands in `GENERAL-AUDITOR.md`.

## What It Runs

1. `python3 scripts/repo-hygiene-gate.py`
2. `./scripts/docs-gate.sh`
3. external `General-Auditor gate --project Vityo`
4. `./scripts/checkpoint-health.sh`
