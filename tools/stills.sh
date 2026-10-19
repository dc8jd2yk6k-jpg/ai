#!/usr/bin/env bash
# stills.sh SHEET.jpg t1 t2 ... (seconds) — render stills at times and tile them
set -e
cd "$(dirname "$0")/../video"
out=$1; shift
files=()
for s in "$@"; do
  f=$(python3 -c "print(round($s*30))")
  npx remotion still src/index.ts Film ../out/stills/t$s.jpg --frame=$f --log=error >/dev/null
  files+=(../out/stills/t$s.jpg)
done
python3 ../tools/sheet.py "$out" 2 "${files[@]}"
