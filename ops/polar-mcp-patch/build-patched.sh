#!/usr/bin/env bash
# Build polar-mcp.index.PATCHED.js from a fresh dump of the live Worker.
#
#   ./build-patched.sh <live-dump.js> [out.js]
#
# <live-dump.js> is the bundled index.js as returned by the Cloudflare API /
# MCP `workers_get_worker_code` (a multipart wrapper is stripped if present) or
# copied out of the dashboard editor. The script refuses to run if the anchors
# are missing or ambiguous, or if a patch marker is already present.
set -euo pipefail

LIVE="${1:?usage: build-patched.sh <live-dump.js> [out.js]}"
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OUT="${2:-$HERE/polar-mcp.index.PATCHED.js}"
WORK="$(mktemp)"
trap 'rm -f "$WORK"' EXIT

# 1. Strip the multipart/form-data wrapper the API dump carries
#    (leading `--boundary` + Content-Disposition + blank line, trailing blank
#    line(s) + `--boundary--`). A dashboard copy has no wrapper and passes through.
awk '
  NR==1 && /^--[0-9A-Za-z]+\r?$/ { skip=1; next }
  skip==1 && /^Content-Disposition/ { skip=2; next }
  skip==2 && /^\r?$/ { skip=3; next }
  { skip=3; lines[++n]=$0 }
  END {
    while (n>0 && (lines[n] ~ /^--[0-9A-Za-z]+--\r?$/ || lines[n] ~ /^\r?$/)) n--
    for (i=1;i<=n;i++) print lines[i]
  }
' "$LIVE" > "$WORK"

# 2. Refuse if already patched.
if grep -q 'polar_webhook_rejected' "$WORK" || grep -q 'api/integrations/discord/interactions' "$WORK"; then
  echo "refusing: a patch marker is already present in $LIVE — apply surgically instead" >&2
  exit 2
fi

# 3. Locate anchors (each must match exactly once).
anchor() {
  local n
  n=$(grep -nF -- "$1" "$WORK" | cut -d: -f1 | tr '\n' ' ')
  if [ "$(echo "$n" | wc -w)" -ne 1 ]; then
    echo "anchor not unique or missing: $1 -> [$n]" >&2
    exit 3
  fi
  echo "$n" | tr -d ' '
}
A_START=$(anchor 'app.post("/api/polar/webhook", async (c) => {')
A_NEXT=$(anchor 'app.get("/api/polar/events", (c) => {')
B_AT=$(anchor 'app.get("/api/integrations/google/status", (c) => {')
A_END=$((A_NEXT - 1))
[ "$A_START" -lt "$A_END" ] || { echo "bad patch A range $A_START..$A_END" >&2; exit 3; }
[ "$A_END" -lt "$B_AT" ] || { echo "patch B anchor precedes patch A — unexpected layout" >&2; exit 3; }

# Sanity: the live handler we are replacing must contain the known bug.
sed -n "${A_START},${A_END}p" "$WORK" | grep -q 'INSERT OR IGNORE INTO polar_webhook_events' \
  || { echo "live webhook handler does not look like the expected one" >&2; exit 3; }

# 4. Assemble: [0..A_START) + patchA + (A_END..B_AT) + patchB + [B_AT..]
{
  sed -n "1,$((A_START - 1))p" "$WORK"
  cat "$HERE/patchA.js"
  sed -n "$((A_END + 1)),$((B_AT - 1))p" "$WORK"
  cat "$HERE/patchB.js"
  sed -n "${B_AT},\$p" "$WORK"
} > "$OUT"

# 5. Syntax check (ESM parse only; cloudflare:/node: imports are not resolved).
cp "$OUT" "$WORK.mjs"
node --check "$WORK.mjs"
rm -f "$WORK.mjs"

echo "live:    $(wc -l < "$WORK") lines (wrapper stripped)"
echo "patched: $(wc -l < "$OUT") lines -> $OUT"
echo "patch A replaced lines $A_START-$A_END; patch B inserted before old line $B_AT"
echo "markers: polar_webhook_rejected=$(grep -c polar_webhook_rejected "$OUT") discord/interactions=$(grep -c 'api/integrations/discord/interactions' "$OUT")"
