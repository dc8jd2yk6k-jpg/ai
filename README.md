# A Revolution That No Longer Needs Us — the film

A 3½-minute motion-design essay film adapted from the essay *A Revolution That No Longer Needs Us*
(October 16, 2026). Every frame, note and word of narration is generated in code: no stock footage,
no samples, no recorded voice.

**Output:** `out/film.mp4` (1920×1080, 30 fps, H.264 + AAC, −14 LUFS) · `out/film.srt` · `out/poster.jpg` · `out/contact-sheet.jpg`

## The idea

One red thread runs through the whole film. It's woven into cloth by the handloom weavers. Then it's the
wage line in the 1780–1840 chart, the rail of the railway that once rescued their grandchildren, the falling
wage ceiling, the shipping routes out of Britain, and the line under the last city. The essay's
"contract", that machines needed people, is that thread. In the last shot it snaps.

| Chapter | Scenes |
|---|---|
| Cold open | The thread draws across black: *"That was the contract. It is about to expire."* |
| I · The Weavers' Contract | Procedural loom (hand-woven rows, then the power loom); 250 figures × 1,000 weavers disappear; Allen's *Engels' Pause* chart with a generation living in the gap; a receding railway whose job tags turn into machine glyphs |
| II · The Machine That Learns Everything | One core absorbing every screen task; Acemoglu–Restrepo tug-of-war with the 1987 divergence; the wage ceiling crushing a worker through rent → food → survival; 20 M → 3 M horses with Leontief's 1983 warning |
| III · Abundance Does Not Distribute Itself | Grain ships leaving Ireland while the death counter rises; 1933's milk and six million piglets; Sen; *"Priced, not shared"* |
| IV · When the Boat No Longer Needs the Water | Xunzi's boat as the water drains away; the pumpjack becomes a server rack, stamped INTELLIGENCE CURSE; strike, boycott and revolt struck out; machine-vision HUD over a crowd |
| V · No New World | Savings, home and business slide down the thread into one node; More's sheep replace people inside a fence; Natural Earth map with Britain's 1840 export routes, then every country lit at once; the ladder's bottom rung falls |
| VI · The End of the Contract | The quiet end as three UI cards (0 results, contract not renewed, 312 applications); a glittering, empty procedural city; the thread snaps |

## Pipeline

```
script/narration.json ──► tools/tts.py ──► .cache/vo/*.wav, video/src/timeline.json  (audio-first timing)
                                   │
           timeline.json ──► tools/score.py ──► .cache/music.wav   (numpy synthesis: drone, loom, piano motif, SFX, hall reverb)
                                   │
                         tools/mix.sh ──► .cache/mix.wav   (VO EQ/comp, sidechain duck, two-pass linear loudnorm −14 LUFS)
                                   │
           video/ (Remotion + React + SVG/canvas, d3-geo) ──► .cache/video.mp4
                                   │
                              ffmpeg mux ──► out/film.mp4
```

- **Narration:** [Kokoro-82M](https://github.com/thewh1teagle/kokoro-onnx) (ONNX), voice `bm_george`, run locally.
  Scene and word timings come from the generated audio, so picture stays locked to the voice.
- **Picture:** [Remotion](https://remotion.dev) compositions in `video/src/scenes/` (`Act1`–`Act4`), sharing
  `components/` (kinetic type, the thread, grain, HUD, chapter cards). Fonts: Fraunces, JetBrains Mono, Inter (via `@fontsource`).
  Map: `world-atlas` 110m + `d3-geo` Natural Earth projection.
- **Score:** `tools/score.py` synthesizes everything (additive piano with inharmonic partials, detuned pads,
  noise-based loom clacks, sub-hits, risers, water, Karplus-style snap) and places every cue by word time.

## Build

Requires Python 3 (`pip install kokoro-onnx soundfile scipy numpy`), Node 22, ffmpeg and a Chromium headless
shell (set `REMOTION_BROWSER` if not at the default path in `video/remotion.config.ts`).

```bash
(cd video && npm install)
tools/render.sh            # full pipeline → out/film.mp4
cd video && npx remotion studio   # scrub/edit scenes live
tools/stills.sh out/x.jpg 12 95 190   # quick stills at given seconds, tiled
```

To re-voice a line, edit `script/narration.json`, delete its file in `.cache/vo/` (or pass its id:
`python3 tools/tts.py c1`), and re-run. Every scene and the score retime themselves.

## Data notes

Charts are labelled as they are on screen. The 1780–1840 output and wage indices follow R. C. Allen,
"Engels' Pause" (2009): output per worker +46%, real wages +12%. The displacement/reinstatement chart is
*illustrative*, after Acemoglu & Restrepo (2019), with a dashed projection. Horse counts (≈20 M in 1915, ≈3 M
in 1960) and the other historical figures are the essay's.
