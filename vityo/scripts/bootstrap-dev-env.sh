#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TARGET_USER="${SUDO_USER:-$USER}"
TARGET_HOME="$(getent passwd "$TARGET_USER" | cut -d: -f6)"
FLUTTER_HOME="${STYIO_VIEW_FLUTTER_HOME:-$TARGET_HOME/develop/flutter}"
ANDROID_SDK_ROOT="${STYIO_VIEW_ANDROID_SDK_ROOT:-$TARGET_HOME/Android/Sdk}"
ANDROID_PLATFORM="${STYIO_VIEW_ANDROID_PLATFORM:-android-36}"
ANDROID_BUILD_TOOLS="${STYIO_VIEW_ANDROID_BUILD_TOOLS:-36.0.0}"
ANDROID_NDK_VERSION="${STYIO_VIEW_ANDROID_NDK_VERSION:-28.2.13676358}"

usage() {
  cat <<EOF
Usage: $(basename "$0")

Install the Debian/Ubuntu packages and SDKs required to build, test, and run
styio-view on a fresh Linux container or VM.

Optional environment:
  STYIO_VIEW_FLUTTER_HOME        Flutter checkout location
                                 Default: $FLUTTER_HOME
  STYIO_VIEW_ANDROID_SDK_ROOT    Android SDK root
                                 Default: $ANDROID_SDK_ROOT
  STYIO_VIEW_ANDROID_PLATFORM    Android platform package
                                 Default: $ANDROID_PLATFORM
  STYIO_VIEW_ANDROID_BUILD_TOOLS Android build-tools package
                                 Default: $ANDROID_BUILD_TOOLS
  STYIO_VIEW_ANDROID_NDK_VERSION Android NDK package
                                 Default: $ANDROID_NDK_VERSION
EOF
}

log() {
  printf '[styio-view env] %s\n' "$*"
}

fail() {
  printf '[styio-view env] %s\n' "$*" >&2
  exit 1
}

as_root() {
  if [[ $EUID -eq 0 ]]; then
    "$@"
    return
  fi

  if command -v sudo >/dev/null 2>&1; then
    sudo "$@"
    return
  fi

  fail "sudo is required to install system packages"
}

ensure_debian_like() {
  if [[ ! -r /etc/os-release ]]; then
    fail "/etc/os-release is missing; only Debian/Ubuntu hosts are supported"
  fi

  # shellcheck disable=SC1091
  . /etc/os-release

  local family="${ID_LIKE:-}"
  if [[ "${ID:-}" != "debian" && "${ID:-}" != "ubuntu" && "${family}" != *debian* && "${family}" != *ubuntu* ]]; then
    fail "unsupported distribution: ${PRETTY_NAME:-unknown}. Expected Debian/Ubuntu."
  fi
}

install_system_packages() {
  local packages=(
    build-essential
    ca-certificates
    chromium
    clang-18
    cmake
    curl
    default-jdk
    git
    libblkid-dev
    libgtk-3-dev
    liblzma-dev
    mesa-utils
    ninja-build
    nodejs
    npm
    pkg-config
    python3
    python3-pip
    python3-venv
    unzip
    wget
    xz-utils
    zip
  )

  log "installing system packages"
  as_root apt-get update
  as_root env DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends "${packages[@]}"
}

install_flutter() {
  if [[ -d "$FLUTTER_HOME/.git" ]]; then
    log "using existing Flutter checkout at $FLUTTER_HOME"
  else
    log "cloning Flutter stable into $FLUTTER_HOME"
    mkdir -p "$(dirname "$FLUTTER_HOME")"
    git clone --depth 1 -b stable https://github.com/flutter/flutter.git "$FLUTTER_HOME"
  fi
}

latest_android_cmdline_tools_archive() {
  wget -qO- https://dl.google.com/android/repository/repository2-1.xml \
    | grep -o 'commandlinetools-linux-[0-9]*_latest.zip' \
    | head -n 1
}

install_android_cmdline_tools() {
  local archive_name
  archive_name="$(latest_android_cmdline_tools_archive)"

  if [[ -z "$archive_name" ]]; then
    fail "unable to determine latest Android command-line tools archive"
  fi

  if [[ -x "$ANDROID_SDK_ROOT/cmdline-tools/latest/bin/sdkmanager" ]]; then
    log "using existing Android command-line tools at $ANDROID_SDK_ROOT"
    return
  fi

  log "installing Android command-line tools into $ANDROID_SDK_ROOT"
  mkdir -p "$ANDROID_SDK_ROOT"

  local workdir
  workdir="$(mktemp -d)"
  trap 'rm -rf "$workdir"' RETURN

  wget -O "$workdir/$archive_name" "https://dl.google.com/android/repository/$archive_name"
  unzip -q "$workdir/$archive_name" -d "$workdir"

  rm -rf "$ANDROID_SDK_ROOT/cmdline-tools/latest"
  mkdir -p "$ANDROID_SDK_ROOT/cmdline-tools"
  mv "$workdir/cmdline-tools" "$ANDROID_SDK_ROOT/cmdline-tools/latest"
}

configure_android_sdk() {
  local flutter_bin="$FLUTTER_HOME/bin/flutter"
  local sdkmanager="$ANDROID_SDK_ROOT/cmdline-tools/latest/bin/sdkmanager"

  export JAVA_HOME="/usr/lib/jvm/default-java"
  export ANDROID_HOME="$ANDROID_SDK_ROOT"
  export PATH="$FLUTTER_HOME/bin:$ANDROID_SDK_ROOT/cmdline-tools/latest/bin:$ANDROID_SDK_ROOT/platform-tools:$ANDROID_SDK_ROOT/build-tools/$ANDROID_BUILD_TOOLS:$PATH"

  log "configuring Flutter toolchains"
  "$flutter_bin" config --android-sdk "$ANDROID_SDK_ROOT" --enable-web --enable-linux-desktop --enable-android

  log "accepting Android SDK licenses"
  yes | "$sdkmanager" --sdk_root="$ANDROID_SDK_ROOT" --licenses >/dev/null

  log "installing Android SDK packages"
  yes | "$sdkmanager" --sdk_root="$ANDROID_SDK_ROOT" \
    "platform-tools" \
    "platforms;$ANDROID_PLATFORM" \
    "build-tools;$ANDROID_BUILD_TOOLS" \
    "ndk;$ANDROID_NDK_VERSION" >/dev/null
}

install_repo_dependencies() {
  log "installing prototype npm dependencies"
  (cd "$ROOT/prototype" && npm install)

  log "installing Flutter package dependencies"
  (
    cd "$ROOT/frontend/styio_view_app"
    "$FLUTTER_HOME/bin/flutter" pub get
  )
}

print_summary() {
  local chrome_bin
  chrome_bin="$(command -v chromium || true)"

  cat <<EOF

styio-view bootstrap complete.

Suggested shell exports:
  export FLUTTER_HOME="$FLUTTER_HOME"
  export ANDROID_SDK_ROOT="$ANDROID_SDK_ROOT"
  export ANDROID_HOME="\$ANDROID_SDK_ROOT"
  export JAVA_HOME=/usr/lib/jvm/default-java
  export STYIO_CHROME_PATH="${chrome_bin:-/usr/bin/chromium}"
  export CHROME_EXECUTABLE="\$STYIO_CHROME_PATH"
  export PATH="\$FLUTTER_HOME/bin:\$ANDROID_SDK_ROOT/cmdline-tools/latest/bin:\$ANDROID_SDK_ROOT/platform-tools:\$ANDROID_SDK_ROOT/build-tools/$ANDROID_BUILD_TOOLS:\$PATH"

Typical next steps:
  cd "$ROOT/frontend/styio_view_app" && "\$FLUTTER_HOME/bin/flutter" analyze
  cd "$ROOT/frontend/styio_view_app" && "\$FLUTTER_HOME/bin/flutter" test
  cd "$ROOT/prototype" && STYIO_EDITOR_URL=http://127.0.0.1:4180/editor.html npm run selftest:editor
EOF
}

main() {
  if [[ "${1:-}" == "--help" ]]; then
    usage
    exit 0
  fi

  ensure_debian_like
  install_system_packages
  install_flutter
  install_android_cmdline_tools
  configure_android_sdk
  install_repo_dependencies
  print_summary
}

main "$@"
