#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TARGET_USER="${SUDO_USER:-$USER}"
TARGET_HOME="$(getent passwd "$TARGET_USER" | cut -d: -f6)"
DEBIAN_STANDARD_VERSION="${STYIO_TOOLCHAIN_DEBIAN_STANDARD_VERSION:-13}"
LLVM_STANDARD_SERIES="${STYIO_TOOLCHAIN_LLVM_STANDARD_SERIES:-18.1.x}"
CMAKE_STANDARD_VERSION="${STYIO_TOOLCHAIN_CMAKE_STANDARD_VERSION:-3.31.6}"
PYTHON_STANDARD_VERSION="${STYIO_TOOLCHAIN_PYTHON_STANDARD_VERSION:-$(tr -d '[:space:]' < "$ROOT/.python-version")}"
NODE_STANDARD_VERSION="${STYIO_TOOLCHAIN_NODE_STANDARD_VERSION:-$(tr -d '[:space:]' < "$ROOT/.nvmrc")}"
FLUTTER_STANDARD_VERSION="${STYIO_TOOLCHAIN_FLUTTER_STANDARD_VERSION:-$(tr -d '[:space:]' < "$ROOT/.flutter-version")}"
DART_STANDARD_VERSION="${STYIO_TOOLCHAIN_DART_STANDARD_VERSION:-3.11.5}"
CHROMIUM_STANDARD_VERSION="${STYIO_TOOLCHAIN_CHROMIUM_STANDARD_VERSION:-$(tr -d '[:space:]' < "$ROOT/.chromium-version")}"
FLUTTER_HOME="${STYIO_VIEW_FLUTTER_HOME:-$TARGET_HOME/develop/flutter}"
ANDROID_SDK_ROOT="${STYIO_VIEW_ANDROID_SDK_ROOT:-$TARGET_HOME/Android/Sdk}"
ANDROID_PLATFORM="${STYIO_VIEW_ANDROID_PLATFORM:-android-36}"
ANDROID_BUILD_TOOLS="${STYIO_VIEW_ANDROID_BUILD_TOOLS:-36.0.0}"
ANDROID_NDK_VERSION="${STYIO_VIEW_ANDROID_NDK_VERSION:-28.2.13676358}"
NODE_INSTALL_ROOT="${STYIO_VIEW_NODE_INSTALL_ROOT:-/usr/local/lib/nodejs}"

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

Standardized baseline:
  Debian                  $DEBIAN_STANDARD_VERSION (trixie)
  LLVM / Clang            $LLVM_STANDARD_SERIES via clang-18
  CMake / CTest           $CMAKE_STANDARD_VERSION
  Python                  $PYTHON_STANDARD_VERSION
  Node.js                 v$NODE_STANDARD_VERSION LTS
  Flutter / Dart          $FLUTTER_STANDARD_VERSION / $DART_STANDARD_VERSION
  Chromium                $CHROMIUM_STANDARD_VERSION
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

report_standard_baseline() {
  # shellcheck disable=SC1091
  . /etc/os-release
  if [[ "${ID:-}" == "debian" && "${VERSION_ID:-}" == "$DEBIAN_STANDARD_VERSION" ]]; then
    log "host matches the standardized dev baseline: Debian $DEBIAN_STANDARD_VERSION"
    return
  fi

  log "host is ${PRETTY_NAME:-unknown}; standardized dev baseline is Debian $DEBIAN_STANDARD_VERSION (trixie). Continuing with the compatible Debian/Ubuntu bootstrap path."
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

node_arch() {
  case "$(uname -m)" in
    x86_64|amd64)
      echo "x64"
      ;;
    aarch64|arm64)
      echo "arm64"
      ;;
    *)
      fail "unsupported architecture for official Node.js binaries: $(uname -m)"
      ;;
  esac
}

install_node() {
  local arch version archive url workdir

  if command -v node >/dev/null 2>&1; then
    version="$(node --version 2>/dev/null || true)"
    if [[ "$version" == "v$NODE_STANDARD_VERSION" ]]; then
      log "Node.js already matches standardized version $version"
      return
    fi
  fi

  arch="$(node_arch)"
  archive="node-v${NODE_STANDARD_VERSION}-linux-${arch}.tar.xz"
  url="https://nodejs.org/dist/v${NODE_STANDARD_VERSION}/${archive}"
  workdir="$(mktemp -d)"
  trap 'rm -rf "$workdir"' RETURN

  log "installing official Node.js v$NODE_STANDARD_VERSION into $NODE_INSTALL_ROOT"
  wget -qO "$workdir/$archive" "$url"
  as_root mkdir -p "$NODE_INSTALL_ROOT"
  as_root rm -rf "$NODE_INSTALL_ROOT/node-v${NODE_STANDARD_VERSION}-linux-${arch}"
  as_root tar -xJf "$workdir/$archive" -C "$NODE_INSTALL_ROOT"
  as_root ln -sf "$NODE_INSTALL_ROOT/node-v${NODE_STANDARD_VERSION}-linux-${arch}/bin/node" /usr/local/bin/node
  as_root ln -sf "$NODE_INSTALL_ROOT/node-v${NODE_STANDARD_VERSION}-linux-${arch}/bin/npm" /usr/local/bin/npm
  as_root ln -sf "$NODE_INSTALL_ROOT/node-v${NODE_STANDARD_VERSION}-linux-${arch}/bin/npx" /usr/local/bin/npx
  as_root ln -sf "$NODE_INSTALL_ROOT/node-v${NODE_STANDARD_VERSION}-linux-${arch}/bin/corepack" /usr/local/bin/corepack
}

install_flutter() {
  local current_version=""
  local archive="flutter_linux_${FLUTTER_STANDARD_VERSION}-stable.tar.xz"
  local url="https://storage.googleapis.com/flutter_infra_release/releases/stable/linux/${archive}"
  local workdir

  if [[ -r "$FLUTTER_HOME/version" ]]; then
    current_version="$(tr -d '[:space:]' < "$FLUTTER_HOME/version")"
  fi

  if [[ "$current_version" == "$FLUTTER_STANDARD_VERSION" ]]; then
    log "Flutter already matches standardized version $FLUTTER_STANDARD_VERSION"
    return
  fi

  workdir="$(mktemp -d)"
  trap 'rm -rf "$workdir"' RETURN

  log "installing Flutter $FLUTTER_STANDARD_VERSION into $FLUTTER_HOME"
  mkdir -p "$(dirname "$FLUTTER_HOME")"
  rm -rf "$FLUTTER_HOME"
  wget -qO "$workdir/$archive" "$url"
  tar -xJf "$workdir/$archive" -C "$workdir"
  mv "$workdir/flutter" "$FLUTTER_HOME"
  if [[ $EUID -eq 0 && "$TARGET_USER" != "root" ]]; then
    chown -R "$TARGET_USER":"$TARGET_USER" "$FLUTTER_HOME"
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
  if [[ $EUID -eq 0 && "$TARGET_USER" != "root" ]]; then
    chown -R "$TARGET_USER":"$TARGET_USER" "$ANDROID_SDK_ROOT"
  fi
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
  (cd "$ROOT/prototype" && npm ci)

  log "installing Flutter package dependencies"
  (
    cd "$ROOT/frontend/styio_view_app"
    "$FLUTTER_HOME/bin/flutter" pub get
  )
}

verify_tool_versions() {
  local node_version chromium_version flutter_version

  node_version="$(node --version 2>/dev/null || true)"
  chromium_version="$(chromium --product-version 2>/dev/null || true)"
  flutter_version="$("$FLUTTER_HOME/bin/flutter" --version --machine 2>/dev/null | python3 -c 'import json,sys; print(json.load(sys.stdin)["frameworkVersion"])' 2>/dev/null || true)"

  [[ "$node_version" == "v$NODE_STANDARD_VERSION" ]] || fail "Node.js version mismatch: expected v$NODE_STANDARD_VERSION, got ${node_version:-missing}"
  [[ "$chromium_version" == "$CHROMIUM_STANDARD_VERSION" ]] || fail "Chromium version mismatch: expected $CHROMIUM_STANDARD_VERSION, got ${chromium_version:-missing}"
  [[ "$flutter_version" == "$FLUTTER_STANDARD_VERSION" ]] || fail "Flutter version mismatch: expected $FLUTTER_STANDARD_VERSION, got ${flutter_version:-missing}"
}

print_summary() {
  local chrome_bin
  chrome_bin="$(command -v chromium || true)"

  cat <<EOF

styio-view bootstrap complete.

Standardized baseline:
  Debian:        $DEBIAN_STANDARD_VERSION (trixie)
  LLVM series:   $LLVM_STANDARD_SERIES
  CMake/CTest:   $CMAKE_STANDARD_VERSION
  Python:        $PYTHON_STANDARD_VERSION
  Node.js:       v$NODE_STANDARD_VERSION
  Flutter/Dart:  $FLUTTER_STANDARD_VERSION / $DART_STANDARD_VERSION
  Chromium:      $CHROMIUM_STANDARD_VERSION

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
  report_standard_baseline
  install_system_packages
  install_node
  install_flutter
  install_android_cmdline_tools
  configure_android_sdk
  install_repo_dependencies
  verify_tool_versions
  print_summary
}

main "$@"
