"""Narration: Kokoro ONNX -> per-line WAVs, a single VO track, and timeline.json.

timeline.json is the single source of truth for timing; Remotion and the score both read it.
"""
import json
import re
import sys
from pathlib import Path

import numpy as np
import soundfile as sf
from kokoro_onnx import Kokoro

ROOT = Path(__file__).resolve().parent.parent
CACHE = ROOT / ".cache"
PUBLIC = ROOT / "video" / "public"
SR = 24000
FPS = 30


def trim(audio, thresh=0.004):
    idx = np.where(np.abs(audio) > thresh)[0]
    if len(idx) == 0:
        return audio
    a, b = max(0, idx[0] - 240), min(len(audio), idx[-1] + 1200)
    return audio[a:b]


def word_times(text, start, dur):
    """Estimate per-word onsets by syllable-ish weight (Kokoro gives no alignment)."""
    words = text.split()
    weights = []
    for w in words:
        core = re.sub(r"[^A-Za-z']", "", w)
        vowels = len(re.findall(r"[aeiouy]+", core.lower())) or 1
        weights.append(0.6 + vowels + len(core) * 0.05)
        if re.search(r"[.,:;]$", w):
            weights[-1] += 1.2  # punctuation pause
    total = sum(weights)
    t, out = start, []
    for w, wt in zip(words, weights):
        out.append({"w": w, "t": round(t, 3)})
        t += dur * wt / total
    return out


def main():
    spec = json.loads((ROOT / "script" / "narration.json").read_text())
    only = set(sys.argv[1:])
    kokoro = Kokoro(str(CACHE / "kokoro-v1.0.onnx"), str(CACHE / "voices-v1.0.bin"))
    vo_dir = CACHE / "vo"
    vo_dir.mkdir(exist_ok=True)

    t = 0.0
    scenes, track = [], []
    for sc in spec["scenes"]:
        start = t
        entry = {"id": sc["id"], "start": round(start, 3)}
        if "card" in sc:
            entry["card"] = sc["card"]
            t += sc["dur"]
        else:
            t += sc.get("lead", 0.3)
            lines = []
            for ln in sc["lines"]:
                wav = vo_dir / f"{ln['id']}.wav"
                if not wav.exists() or ln["id"] in only:
                    samples, sr = kokoro.create(ln["text"], voice=spec["voice"],
                                                speed=ln.get("speed", spec["speed"]), lang=spec["lang"])
                    assert sr == SR
                    sf.write(wav, trim(samples), SR)
                audio, _ = sf.read(wav)
                d = len(audio) / SR
                lines.append({"id": ln["id"], "text": ln["text"], "start": round(t, 3), "dur": round(d, 3),
                              "words": word_times(ln["text"], t, d)})
                track.append((t, audio))
                t += d + ln.get("pause", 0.3)
            t += sc.get("tail", 0.4)
            entry["lines"] = lines
        entry["dur"] = round(t - start, 3)
        scenes.append(entry)
        print(f"{sc['id']:8s} {start:7.2f}  {entry['dur']:6.2f}s")

    total = t
    out = np.zeros(int(total * SR) + SR, dtype=np.float32)
    for st, a in track:
        i = int(st * SR)
        out[i:i + len(a)] += a.astype(np.float32)
    sf.write(CACHE / "vo_track.wav", out, SR)

    timeline = {"fps": FPS, "total": round(total, 3), "title": spec["title"], "date": spec["date"], "scenes": scenes}
    PUBLIC.mkdir(parents=True, exist_ok=True)
    (PUBLIC / "timeline.json").write_text(json.dumps(timeline, indent=1))
    (ROOT / "video" / "src").mkdir(exist_ok=True)
    (ROOT / "video" / "src" / "timeline.json").write_text(json.dumps(timeline, indent=1))
    print(f"TOTAL {total:.2f}s")


if __name__ == "__main__":
    main()
