#!/usr/bin/env python3
from __future__ import annotations

import fnmatch
import subprocess
import sys
from pathlib import Path, PurePosixPath

REPO_ROOT = Path(__file__).resolve().parents[1]
DOCS_AUDIT = REPO_ROOT / "scripts" / "docs-audit.py"

FORBIDDEN_PATH_PARTS = {
    ".artifacts",
    ".dart_tool",
    ".gradle",
    ".next",
    ".nuxt",
    ".pytest_cache",
    ".ruff_cache",
    ".turbo",
    "__pycache__",
    "build",
    "coverage",
    "dist",
    "node_modules",
}

FORBIDDEN_FILE_SUFFIXES = (
    ".a",
    ".aar",
    ".apk",
    ".app",
    ".bin",
    ".class",
    ".dll",
    ".dmg",
    ".dylib",
    ".egg",
    ".exe",
    ".gz",
    ".ipa",
    ".jar",
    ".lib",
    ".nar",
    ".o",
    ".obj",
    ".out",
    ".pdb",
    ".pyc",
    ".pyo",
    ".rar",
    ".so",
    ".tar",
    ".tgz",
    ".war",
    ".whl",
    ".zip",
    ".7z",
)

ALLOWED_BINARY_GLOBS = (
    "docs/assets/*.gif",
    "docs/assets/*.jpeg",
    "docs/assets/*.jpg",
    "docs/assets/*.png",
    "docs/assets/*.svg",
    "docs/assets/*.webp",
    "docs/assets/**/*.gif",
    "docs/assets/**/*.jpeg",
    "docs/assets/**/*.jpg",
    "docs/assets/**/*.png",
    "docs/assets/**/*.svg",
    "docs/assets/**/*.webp",
    "frontend/styio_view_app/android/app/src/main/res/**/*.png",
    "frontend/styio_view_app/ios/Runner/Assets.xcassets/**/*.png",
    "frontend/styio_view_app/macos/Runner/Assets.xcassets/**/*.png",
    "frontend/styio_view_app/web/*.png",
    "frontend/styio_view_app/web/**/*.png",
    "frontend/styio_view_app/windows/runner/resources/*.ico",
)
REQUIRED_GITIGNORE_PATTERNS = (
    ".DS_Store",
    ".cursor/",
    ".idea/",
    ".vscode/",
    ".cache/",
    "__pycache__/",
    ".pytest_cache/",
    ".mypy_cache/",
    ".ruff_cache/",
    ".venv/",
    "venv/",
    "node_modules/",
    "build/",
    "build-*/",
    "tmp/",
    "*.tmp",
    "*.log",
    "!docs/**/build/",
    "!docs/**/build/**",
    "!docs/**/build-*/",
    "!docs/**/build-*/**",
    "!docs/**/tmp/",
    "!docs/**/tmp/**",
    "!docs/**/*.tmp",
    "!docs/**/*.log",
    "!frontend/styio_view_app/test/**/build/",
    "!frontend/styio_view_app/test/**/build/**",
    "!frontend/styio_view_app/test/**/build-*/",
    "!frontend/styio_view_app/test/**/build-*/**",
    "!frontend/styio_view_app/test/**/tmp/",
    "!frontend/styio_view_app/test/**/tmp/**",
    "!frontend/styio_view_app/test/**/*.tmp",
    "!frontend/styio_view_app/test/**/*.log",
)
REQUIRED_DOC_REFERENCES = {
    Path("docs/README.md"): (
        "scripts/docs-index.py",
        "scripts/docs-lifecycle.py",
        "scripts/docs-audit.py",
    ),
    Path("docs/specs/DOCUMENTATION-POLICY.md"): (
        "scripts/docs-index.py",
        "scripts/docs-lifecycle.py",
        "scripts/docs-audit.py",
        "scripts/check_repo_hygiene.py",
    ),
    Path("docs/teams/DOCS-DELIVERY-RUNBOOK.md"): (
        "scripts/check_repo_hygiene.py",
        "scripts/docs-audit.py",
    ),
}


def tracked_files() -> list[str]:
    result = subprocess.run(
        ["git", "ls-files", "-z"],
        cwd=REPO_ROOT,
        check=True,
        capture_output=True,
    )
    raw_paths = result.stdout.decode("utf-8")
    return [path for path in raw_paths.split("\0") if path]


def has_forbidden_path_part(rel_path: str) -> bool:
    return any(part in FORBIDDEN_PATH_PARTS for part in PurePosixPath(rel_path).parts)


def has_forbidden_file_suffix(rel_path: str) -> bool:
    lower_path = rel_path.lower()
    return lower_path.endswith(FORBIDDEN_FILE_SUFFIXES)


def is_allowed_binary(rel_path: str) -> bool:
    return any(fnmatch.fnmatchcase(rel_path, pattern) for pattern in ALLOWED_BINARY_GLOBS)


def is_binary_file(rel_path: str) -> bool:
    file_path = REPO_ROOT / rel_path
    sample = file_path.read_bytes()[:8192]
    if not sample:
        return False
    if b"\0" in sample:
        return True
    try:
        sample.decode("utf-8")
        return False
    except UnicodeDecodeError:
        return True


def check_gitignore() -> list[str]:
    gitignore = REPO_ROOT / ".gitignore"
    if not gitignore.exists():
        return [".gitignore is missing"]

    patterns = {
        line.strip()
        for line in gitignore.read_text(encoding="utf-8").splitlines()
        if line.strip() and not line.lstrip().startswith("#")
    }
    errors: list[str] = []
    for required in REQUIRED_GITIGNORE_PATTERNS:
        if required not in patterns:
            errors.append(f".gitignore must include: {required}")
    return errors


def check_doc_references() -> list[str]:
    errors: list[str] = []
    for relative_path, needles in REQUIRED_DOC_REFERENCES.items():
        path = REPO_ROOT / relative_path
        if not path.exists():
            errors.append(f"required documentation file is missing: {relative_path.as_posix()}")
            continue
        text = path.read_text(encoding="utf-8")
        for needle in needles:
            if needle not in text:
                errors.append(f"{relative_path.as_posix()} must document {needle}")
    return errors


def print_issue_group(title: str, paths: list[str], limit: int = 20) -> None:
    print(title)
    for path in paths[:limit]:
        print(f"  - {path}")
    remaining = len(paths) - limit
    if remaining > 0:
        print(f"  - ... and {remaining} more")
    print()


def main() -> int:
    forbidden_paths: list[str] = []
    forbidden_suffixes: list[str] = []
    unexpected_binaries: list[str] = []
    gitignore_errors = check_gitignore()
    doc_reference_errors = check_doc_references()

    for rel_path in tracked_files():
        if has_forbidden_path_part(rel_path):
            forbidden_paths.append(rel_path)
            continue

        if has_forbidden_file_suffix(rel_path):
            forbidden_suffixes.append(rel_path)
            continue

        if is_binary_file(rel_path) and not is_allowed_binary(rel_path):
            unexpected_binaries.append(rel_path)

    docs_audit = subprocess.run(
        [sys.executable, str(DOCS_AUDIT)],
        cwd=REPO_ROOT,
        capture_output=True,
        text=True,
    )

    if (
        forbidden_paths
        or forbidden_suffixes
        or unexpected_binaries
        or gitignore_errors
        or doc_reference_errors
        or docs_audit.returncode != 0
    ):
        print("Repository hygiene gate failed.\n")
        print("Tracked files must not contain generated artifacts, dependency payloads, or")
        print("unexpected binary blobs. Docs/file governance drift is also rejected here.\n")

        if forbidden_paths:
            print_issue_group(
                "Found tracked files inside generated or dependency directories:",
                sorted(forbidden_paths),
            )

        if forbidden_suffixes:
            print_issue_group(
                "Found tracked files with blocked binary/package suffixes:",
                sorted(forbidden_suffixes),
            )

        if unexpected_binaries:
            print_issue_group(
                "Found tracked binary files outside the approved asset allowlist:",
                sorted(unexpected_binaries),
            )

        if gitignore_errors:
            print_issue_group(
                "Root .gitignore is missing shared file-governance patterns:",
                sorted(gitignore_errors),
            )

        if doc_reference_errors:
            print_issue_group(
                "Governance docs are missing required script references:",
                sorted(doc_reference_errors),
            )

        if docs_audit.returncode != 0:
            print("Docs governance audit failed:\n")
            detail = docs_audit.stderr.strip() or docs_audit.stdout.strip() or "docs-audit.py failed"
            for line in detail.splitlines():
                print(f"  - {line}")
            print()

        print("If a new binary asset is genuinely required, add a narrow allowlist entry in")
        print("scripts/check_repo_hygiene.py instead of widening the general rules.")
        return 1

    print(f"Repository hygiene gate passed for {len(tracked_files())} tracked files.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
