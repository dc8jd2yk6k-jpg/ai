"""Sidecar subtitles from timeline.json → out/film.srt"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
tl = json.loads((ROOT / "video" / "src" / "timeline.json").read_text())


def ts(x):
    h, m, s = int(x // 3600), int(x % 3600 // 60), x % 60
    return f"{h:02d}:{m:02d}:{int(s):02d},{int((s % 1) * 1000):03d}"


rows = [(l["start"], l["start"] + l["dur"] + 0.15, l["text"].replace("A.I.", "AI")) for s in tl["scenes"] for l in s.get("lines", [])]
out = "\n".join(f"{i}\n{ts(a)} --> {ts(b)}\n{t}\n" for i, (a, b, t) in enumerate(rows, 1))
(ROOT / "out" / "film.srt").write_text(out)
print(f"{len(rows)} cues")
