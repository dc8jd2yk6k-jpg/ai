#!/usr/bin/env bash
# VO + score → ducked, loudness-normalized master (.cache/mix.wav)
set -euo pipefail
cd "$(dirname "$0")/.."
TOTAL=$(python3 -c "import json;print(json.load(open('video/src/timeline.json'))['total'])")
ffmpeg -y -loglevel error \
  -i .cache/vo_track.wav -i .cache/music.wav \
  -filter_complex "
    [0:a]aresample=48000,pan=stereo|c0=c0|c1=c0,highpass=f=70,
         equalizer=f=3200:t=q:w=1.2:g=2.5,equalizer=f=250:t=q:w=1:g=-2,
         acompressor=threshold=-20dB:ratio=3:attack=5:release=120:makeup=3,
         asplit=2[vo][sc];
    [1:a]volume=1.6[mus];
    [mus][sc]sidechaincompress=threshold=0.05:ratio=3:attack=60:release=600:makeup=1[duck];
    [vo]aecho=0.8:0.5:40|70:0.10|0.06[voroom];
    [voroom][duck]amix=inputs=2:weights=1 1:normalize=0,atrim=0:${TOTAL}[out]" \
  -map "[out]" -c:a pcm_s24le .cache/premix.wav
# two-pass linear loudness normalization (keeps the dynamics of the score)
M=$(ffmpeg -hide_banner -i .cache/premix.wav -af loudnorm=I=-14:TP=-1.0:LRA=20:print_format=json -f null - 2>&1 | sed -n '/^{/,/^}/p')
get() { echo "$M" | python3 -c "import json,sys;print(json.load(sys.stdin)['$1'])"; }
ffmpeg -y -loglevel error -i .cache/premix.wav -af "loudnorm=I=-14:TP=-1.0:LRA=20:linear=true:measured_I=$(get input_i):measured_TP=$(get input_tp):measured_LRA=$(get input_lra):measured_thresh=$(get input_thresh):offset=$(get target_offset),aresample=48000" -c:a pcm_s24le .cache/mix.wav
ffmpeg -hide_banner -i .cache/mix.wav -af ebur128=peak=true -f null - 2>&1 | grep -A12 Summary | grep -E "I:|Peak:|LRA:"
