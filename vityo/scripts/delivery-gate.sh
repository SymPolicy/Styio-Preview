#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'USAGE'
Usage: scripts/delivery-gate.sh [options]

Run the common Styio delivery floor by composing repository hygiene, the docs
gate, external audit, and checkpoint health into one entrypoint.

Options:
  --mode <checkpoint|push>  Delivery mode (default: checkpoint)
  --base <ref>              Base ref for team-docs-gate branch checks
  --range <rev-range>       Explicit revision range for repo-hygiene push mode
  --skip-health             Skip checkpoint-health (docs/process-only deliveries)
  --skip-audit              Skip external General-Auditor gate
  --audit-root <path>        Trusted General-Auditor checkout
  -h, --help                Show this help
USAGE
}

log() {
  echo "[delivery-gate] $*"
}

run_cmd() {
  log "$*"
  "$@"
}

default_upstream_base() {
  git rev-parse --abbrev-ref --symbolic-full-name '@{upstream}' 2>/dev/null || true
}

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

MODE="checkpoint"
BASE_REF=""
REV_RANGE=""
RUN_HEALTH=1
RUN_AUDIT=1
AUDIT_BIN="${GENERAL_AUDITOR_ROOT:-}"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --mode)
      MODE="$2"
      shift 2
      ;;
    --base)
      BASE_REF="$2"
      shift 2
      ;;
    --range)
      REV_RANGE="$2"
      shift 2
      ;;
    --skip-health)
      RUN_HEALTH=0
      shift
      ;;
    --skip-audit)
      RUN_AUDIT=0
      shift
      ;;
    --audit-root)
      AUDIT_BIN="$2"
      shift 2
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown option: $1" >&2
      usage >&2
      exit 2
      ;;
  esac
done

REPO_CMD=(python3 scripts/repo-hygiene-gate.py)
DOCS_GATE_CMD=(./scripts/docs-gate.sh)
HEALTH_CMD=(./scripts/checkpoint-health.sh)

case "$MODE" in
  checkpoint)
    REPO_CMD+=(--mode staged)
    DOCS_GATE_CMD+=(--mode staged)
    ;;
  push)
    REPO_CMD+=(--mode push)
    if [[ -n "$REV_RANGE" ]]; then
      REPO_CMD+=(--range "$REV_RANGE")
    fi
    if [[ -z "$BASE_REF" ]]; then
      BASE_REF="$(default_upstream_base)"
    fi
    if [[ -z "$BASE_REF" ]]; then
      echo "push mode requires --base <ref> or a configured upstream branch" >&2
      exit 2
    fi
    DOCS_GATE_CMD+=(--mode push --base "$BASE_REF")
    ;;
  *)
    echo "Unsupported mode: $MODE" >&2
    usage >&2
    exit 2
    ;;
esac

run_cmd "${REPO_CMD[@]}"
run_cmd "${DOCS_GATE_CMD[@]}"

audit_status=0
if [[ "$RUN_AUDIT" -eq 1 ]]; then
  if [ -z "${AUDIT_BIN:-}" ]; then
    AUDIT_BIN="$(git -C "$ROOT" config --local --get generalAuditor.root || true)"
  fi
  case "$AUDIT_BIN" in
    /*) ;;
    *) echo 'General-Auditor requires an absolute trusted root; use GENERAL_AUDITOR_ROOT or local git config generalAuditor.root.' >&2; exit 2 ;;
  esac
  if [ ! -f "$AUDIT_BIN/action_entry.py" ] || [ ! -f "$AUDIT_BIN/profiles/SymPolicy/Styio-Preview.json" ]; then
    echo 'General-Auditor root must contain action_entry.py and the exact repository profile.' >&2
    exit 2
  fi
  audit_directory="$(git -C "$ROOT" rev-parse --show-toplevel)"
  report="$(git -C "$ROOT" rev-parse --path-format=absolute --git-path general-auditor)"
  audit_status=0
  python3 -I "$AUDIT_BIN/action_entry.py" scan --policy-root "$AUDIT_BIN" --directory "$audit_directory" --repository "SymPolicy/Styio-Preview" --scope history --output "$report/history.json" || audit_status=$?
  python3 -I "$AUDIT_BIN/action_entry.py" scan --policy-root "$AUDIT_BIN" --directory "$audit_directory" --repository "SymPolicy/Styio-Preview" --scope worktree --output "$report/worktree.json" || audit_status=$?
else
  log "General-Auditor skipped"
fi

if [[ "$RUN_HEALTH" -eq 1 ]]; then
  run_cmd "${HEALTH_CMD[@]}"
else
  log "checkpoint-health skipped"
fi

if [[ "$audit_status" -eq 0 ]]; then log "all checks passed"; fi
exit "$audit_status"
