#!/usr/bin/env bash
# Full pipeline: narration → score → mix → picture → master MP4 (+ subtitles, poster, contact sheet)
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p .cache out

if [ ! -f .cache/kokoro-v1.0.onnx ]; then
  base=https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0
  curl -sSL -o .cache/kokoro-v1.0.onnx $base/kokoro-v1.0.onnx
  curl -sSL -o .cache/voices-v1.0.bin $base/voices-v1.0.bin
fi

python3 tools/tts.py          # VO + timeline.json
python3 tools/score.py        # music.wav
tools/mix.sh                  # mix.wav (-14 LUFS)
python3 tools/srt.py          # film.srt

(cd video && npx remotion render src/index.ts Film ../.cache/video.mp4 --codec=h264 --crf=17 --muted --concurrency=4)

ffmpeg -y -loglevel error -i .cache/video.mp4 -i .cache/mix.wav \
  -map 0:v -map 1:a -c:v copy -c:a aac -b:a 256k -movflags +faststart -shortest \
  -metadata title="A Revolution That No Longer Needs Us" out/film.mp4

ffmpeg -y -loglevel error -ss 190 -i out/film.mp4 -frames:v 1 -q:v 2 out/poster.jpg
ffmpeg -y -loglevel error -i out/film.mp4 -vf "fps=1/6,scale=480:-1,tile=6x6:padding=4" -frames:v 1 -q:v 3 out/contact-sheet.jpg
ffprobe -v error -show_entries format=duration:stream=codec_name,width,height,r_frame_rate -of compact out/film.mp4
