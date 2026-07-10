#!/usr/bin/env bash
set -euo pipefail

die() {
  echo "pafio-installer-channel-smoke: $*" >&2
  exit 1
}

if [ "$#" -ne 1 ]; then
  die "usage: $0 <pafio-binary>"
fi

pafio_binary=$1
if [ ! -x "$pafio_binary" ]; then
  die "pafio binary is not executable: $pafio_binary"
fi

script_dir=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
repo_root=$(cd "$script_dir/../.." && pwd)

detect_platform() {
  local os
  local arch
  os=$(uname -s | tr '[:upper:]' '[:lower:]')
  arch=$(uname -m | tr '[:upper:]' '[:lower:]')
  case "$os" in
    linux|darwin) ;;
    *) die "unsupported test OS: $(uname -s)" ;;
  esac
  case "$arch" in
    aarch64|arm64) arch="aarch64" ;;
    x86_64|amd64) arch="x86_64" ;;
    *) die "unsupported test CPU: $(uname -m)" ;;
  esac
  printf '%s-%s\n' "$os" "$arch"
}

sha256_value() {
  if command -v sha256sum >/dev/null 2>&1; then
    sha256sum "$1" | awk '{print $1}'
  else
    shasum -a 256 "$1" | awk '{print $1}'
  fi
}

work_dir=$(mktemp -d "${TMPDIR:-/tmp}/pafio-installer-channel.XXXXXX")
server_pid=""

cleanup() {
  if [ -n "$server_pid" ]; then
    kill "$server_pid" 2>/dev/null || true
    wait "$server_pid" 2>/dev/null || true
  fi
  rm -rf "$work_dir"
}
trap cleanup EXIT

platform=$(detect_platform)
remote_dir="$work_dir/remote"
install_dir="$work_dir/bin"
pafio_home="$work_dir/pafio-home"
version="0.1.0-dev"
release_dir="$remote_dir/tools/pafio/releases/$version/$platform"
channel_dir="$remote_dir/tools/pafio/channel/latest/$platform"
mkdir -p "$release_dir" "$channel_dir" "$install_dir"

cp "$pafio_binary" "$release_dir/pafio"
cp "$repo_root/scripts/install-pafio.sh" "$remote_dir/tools/pafio/install-pafio.sh"
chmod +x "$release_dir/pafio" "$remote_dir/tools/pafio/install-pafio.sh"
digest=$(sha256_value "$release_dir/pafio")
printf '%s\n' "$digest" >"$release_dir/pafio.sha256"
printf '%s\n' "$version" >"$channel_dir/version"

port_file="$work_dir/http-port"
python3 -c '
import functools
import http.server
import socketserver
import sys

remote_dir = sys.argv[1]
port_file = sys.argv[2]

class Server(socketserver.TCPServer):
    allow_reuse_address = True

handler = functools.partial(http.server.SimpleHTTPRequestHandler, directory=remote_dir)
with Server(("127.0.0.1", 0), handler) as httpd:
    with open(port_file, "w", encoding="utf-8") as fh:
        fh.write(str(httpd.server_address[1]))
        fh.write("\n")
    httpd.serve_forever()
' "$remote_dir" "$port_file" &
server_pid=$!

for _ in $(seq 1 100); do
  [ -s "$port_file" ] && break
  sleep 0.05
done
[ -s "$port_file" ] || die "local installer HTTP server did not start"

base_url="http://127.0.0.1:$(cat "$port_file")"
curl -fsSL "$base_url/tools/pafio/install-pafio.sh" | PAFIO_HOME="$pafio_home" sh -s -- --base-url "$base_url" --install-dir "$install_dir" --no-styio-shim

installed="$install_dir/pafio"
[ -x "$installed" ] || die "channel installer did not create an executable pafio"
[ "$(sha256_value "$installed")" = "$digest" ] || die "installed pafio digest does not match channel checksum"
"$installed" --version | grep -q '^pafio '
[ "$(cat "$pafio_home/config/tool-release-root")" = "$base_url" ] ||
  die "installer did not persist tool release root"

empty_checksum_dir="$work_dir/empty-checksum-bin"
mkdir -p "$empty_checksum_dir"
: >"$release_dir/pafio.sha256"
if curl -fsSL "$base_url/tools/pafio/install-pafio.sh" |
  PAFIO_HOME="$work_dir/empty-checksum-home" sh -s -- --base-url "$base_url" --install-dir "$empty_checksum_dir" --no-styio-shim >/dev/null 2>"$work_dir/empty-checksum.stderr"; then
  die "installer accepted an empty sha256 file"
fi
grep -q 'failed to fetch sha256' "$work_dir/empty-checksum.stderr" ||
  die "installer did not explain empty sha256 failure"

echo "pafio installer channel smoke passed"
