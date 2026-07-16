#!/usr/bin/env bash
set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
VIDEO_DIR="$ROOT_DIR/assets/videos"
OUT_DIR="$VIDEO_DIR/optimized"
MODE="${1:-}"

if ! command -v ffmpeg >/dev/null 2>&1; then
  echo "ffmpeg is required. On Ubuntu: sudo apt install ffmpeg" >&2
  exit 1
fi

mkdir -p "$OUT_DIR"
shopt -s nullglob
files=("$VIDEO_DIR"/*.mp4)
if ((${#files[@]} == 0)); then
  echo "No MP4 files found in $VIDEO_DIR"
  exit 0
fi

for input in "${files[@]}"; do
  name="$(basename "$input")"
  output="$OUT_DIR/$name"
  echo "Preparing $name"
  if [[ "$MODE" == "--reencode" ]]; then
    ffmpeg -y -i "$input" \
      -c:v libx264 -preset medium -crf 20 \
      -g 60 -keyint_min 60 -sc_threshold 0 \
      -c:a aac -b:a 160k \
      -movflags +faststart "$output"
  else
    ffmpeg -y -i "$input" -map 0 -c copy -movflags +faststart "$output"
  fi
done

echo "Optimized videos written to $OUT_DIR"
