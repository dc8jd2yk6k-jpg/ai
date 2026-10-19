"""Original procedural score + sound design, timed from video/src/timeline.json.

Writes .cache/music.wav (48 kHz stereo). Everything here is synthesized; no samples.
"""
import json
from pathlib import Path

import numpy as np
import soundfile as sf
from scipy.signal import butter, fftconvolve, sosfilt

ROOT = Path(__file__).resolve().parent.parent
SR = 48000
TL = json.loads((ROOT / "video" / "src" / "timeline.json").read_text())
TOTAL = TL["total"]
N = int((TOTAL + 4) * SR)
rs = np.random.default_rng(1820)

dry = np.zeros((2, N), np.float32)
wet = np.zeros((2, N), np.float32)

S = {s["id"]: s for s in TL["scenes"]}


def line(sid, lid):
    return next(l for l in S[sid]["lines"] if l["id"] == lid)


def word(sid, lid, prefix, nth=0):
    hits = [w["t"] for w in line(sid, lid)["words"] if w["w"].strip(".,:;!?'’").lower().startswith(prefix)]
    return hits[min(nth, len(hits) - 1)]


def note(name):
    names = {"C": -9, "D": -7, "E": -5, "F": -4, "G": -2, "A": 0, "B": 2}
    n, acc, octv = name[0], name[1:-1], int(name[-1])
    semi = names[n] + (1 if acc == "#" else -1 if acc == "b" else 0) + (octv - 4) * 12
    return 440.0 * 2 ** (semi / 12)


def tt(dur):
    return np.arange(int(dur * SR)) / SR


def env_adsr(n, a=0.01, r=0.2):
    e = np.ones(n, np.float32)
    na, nr = max(1, int(a * SR)), max(1, int(r * SR))
    e[:na] = np.linspace(0, 1, na)
    if nr < n:
        e[-nr:] *= np.linspace(1, 0, nr)
    return e


def lp(x, f, order=2):
    return sosfilt(butter(order, f, "low", fs=SR, output="sos"), x)


def hp(x, f, order=2):
    return sosfilt(butter(order, f, "high", fs=SR, output="sos"), x)


def bp(x, lo, hi, order=2):
    return sosfilt(butter(order, [lo, hi], "band", fs=SR, output="sos"), x)


def add(t0, sig, gain=1.0, pan=0.0, send=0.2):
    i = int(t0 * SR)
    if i >= N or len(sig) == 0:
        return
    if i < 0:
        sig, i = sig[-i:], 0
    sig = sig[: N - i].astype(np.float32) * gain
    l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    dry[0, i:i + len(sig)] += sig * l * (1 - send * 0.5)
    dry[1, i:i + len(sig)] += sig * r * (1 - send * 0.5)
    wet[0, i:i + len(sig)] += sig * l * send
    wet[1, i:i + len(sig)] += sig * r * send


# ─── instruments ───
def piano(f, dur=4.0, vel=1.0):
    t = tt(dur)
    out = np.zeros_like(t)
    B = 0.00035
    for n in range(1, 10):
        fn = n * f * np.sqrt(1 + B * n * n)
        if fn > 12000:
            break
        decay = 1.2 + n * 0.9
        out += np.sin(2 * np.pi * fn * t + rs.random() * 6) * (1 / n ** 1.25) * np.exp(-t * decay * (0.6 + 0.4 * vel))
    click = lp(rs.normal(0, 1, len(t)), 3000) * np.exp(-t * 300) * 0.15
    out = (out + click) * env_adsr(len(t), 0.004, 0.3)
    return out * vel * 0.35


def pad(freqs, dur, a=2.0, r=2.5, bright=1200):
    t = tt(dur)
    out = np.zeros_like(t)
    for f in freqs:
        for det in (-0.004, 0, 0.0045):
            ff = f * (1 + det)
            for n in range(1, 7):
                out += np.sin(2 * np.pi * ff * n * t + rs.random() * 6) / (n * 1.4)
    out = lp(out, bright)
    out *= env_adsr(len(t), a, r)
    return out / (len(freqs) * 6)


def drone(dur, f=note("D2")):
    t = tt(dur)
    lfo = 0.6 + 0.4 * np.sin(2 * np.pi * 0.07 * t)
    out = (np.sin(2 * np.pi * f * t) + 0.5 * np.sin(2 * np.pi * f * 1.5 * t + 1) + 0.35 * np.sin(2 * np.pi * f * 2.003 * t)) * lfo
    out += lp(rs.normal(0, 1, len(t)), 180) * 0.6
    return out * env_adsr(len(t), 3, 3) * 0.18


def sub_hit(dur=3.5):
    t = tt(dur)
    f = 32 + 60 * np.exp(-t * 9)
    ph = 2 * np.pi * np.cumsum(f) / SR
    body = np.sin(ph) * np.exp(-t * 1.6)
    trans = hp(rs.normal(0, 1, len(t)), 2000) * np.exp(-t * 60) * 0.25
    return (body + trans) * 0.9


def riser(dur=1.8):
    t = tt(dur)
    n = rs.normal(0, 1, len(t))
    out = np.zeros_like(t)
    seg = 2048
    for i in range(0, len(t), seg):
        fc = 300 + 7000 * (i / len(t)) ** 2
        out[i:i + seg] = bp(n[max(0, i - 4096):i + seg], fc * 0.7, min(fc * 1.3, 20000))[-len(n[i:i + seg]):]
    return out * (t / dur) ** 2.2 * 0.35


def clack(bright=1.0):
    t = tt(0.25)
    n = rs.normal(0, 1, len(t))
    body = bp(n, 700 * bright, 2400 * bright) * np.exp(-t * 45)
    thump = np.sin(2 * np.pi * 110 * t) * np.exp(-t * 30) * 0.6
    return (body + thump) * 0.5


def tick(f=3200):
    t = tt(0.08)
    return (np.sin(2 * np.pi * f * t) * 0.5 + hp(rs.normal(0, 1, len(t)), 4000) * 0.4) * np.exp(-t * 90) * 0.35


def blip(f, dur=0.12):
    t = tt(dur)
    return np.sin(2 * np.pi * f * t) * np.exp(-t * 30) * 0.25


def whoosh(dur=1.0):
    t = tt(dur)
    e = np.sin(np.pi * t / dur) ** 2
    return bp(rs.normal(0, 1, len(t)), 400, 3000) * e * 0.25


def water(dur):
    t = tt(dur)
    n = lp(rs.normal(0, 1, len(t)), 900)
    swell = 0.5 + 0.5 * np.sin(2 * np.pi * 0.18 * t) * np.sin(2 * np.pi * 0.07 * t + 1)
    return n * swell * env_adsr(len(t), 1, 1.5) * 0.35


def thud(f=55, dur=1.2):
    t = tt(dur)
    return (np.sin(2 * np.pi * f * t) * np.exp(-t * 5) + lp(rs.normal(0, 1, len(t)), 400) * np.exp(-t * 25) * 0.6) * 0.8


def snap():
    t = tt(4.0)
    crack = hp(rs.normal(0, 1, len(t)), 1500) * np.exp(-t * 120) * 0.9
    f = 420 * np.exp(-t * 0.9) + 60
    twang = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 2.2) * 0.35
    return crack + twang


def hum(dur, f=100):
    t = tt(dur)
    out = sum(np.sin(2 * np.pi * f * k * t) / k for k in (1, 2, 3, 5))
    out += bp(rs.normal(0, 1, len(t)), 3000, 6000) * 0.08
    return out * env_adsr(len(t), 1.0, 1.0) * 0.06


def mixs(*sigs):
    out = np.zeros(max(len(x) for x in sigs))
    for x in sigs:
        out[: len(x)] += x
    return out


MOTIF = ["A4", "D4", "F4", "E4"]


def motif(t0, gap=0.9, vel=0.7, octave_down=False, pan=0.0):
    for i, nm in enumerate(MOTIF):
        f = note(nm) / (2 if octave_down else 1)
        add(t0 + i * gap, piano(f, 5, vel * (1 - i * 0.08)), 1, pan + (i - 1.5) * 0.15, 0.45)


# ─── the cue sheet ───
def at(sid, off=0.0):
    return S[sid]["start"] + off


# global bed: drone under everything but the end, breathing with the acts
add(0, drone(S["final"]["start"] + 6), 1.0, 0, 0.3)
add(0, drone(S["final"]["start"] + 6, note("D1") * 1.0), 0.5, 0, 0.2)

# chapter cards: riser → sub-hit + low piano octave
for sid, s in S.items():
    if s.get("card") and not s["card"].get("end"):
        add(s["start"] - 1.8, riser(1.8), 0.8, 0, 0.2)
        add(s["start"], sub_hit(), 1.0, 0, 0.35)
        add(s["start"] + 0.05, piano(note("D2"), 5, 0.9) + piano(note("D3"), 5, 0.6), 0.9, 0, 0.5)

# COLD OPEN — thread motif
motif(at("cold", 0.6), 1.1, 0.6)
add(at("cold", 0), pad([note("D3"), note("A3")], 13, 4, 3, 700), 0.7, 0, 0.5)
add(at("cold") + word("cold", "c3", "expire") - S["cold"]["start"], pad([note("A4"), note("A5")], 2.5, 0.8, 1.5, 3000), 0.25, 0, 0.6)

# WEAVE — hand clacks, then the power loom
ws = S["weave"]["start"]
t_power = word("weave", "w3", "power")
t = ws + 0.2
k = 0
while t < t_power:
    add(t, clack(0.9 + rs.random() * 0.2), 0.7, -0.3 + rs.random() * 0.6, 0.25)
    t += 0.62 + rs.normal(0, 0.06)
    k += 1
bpm_step = 60 / 152 / 2
t = t_power
end_mech = S["machine"]["start"] + S["machine"]["dur"]
while t < end_mech:
    fade = 1.0 if t < S["chasm"]["start"] else 0.35 if t < S["rail"]["start"] else 0.0 if t < S["machine"]["start"] else 0.3
    if fade > 0:
        add(t, clack(1.4) if int(round((t - t_power) / bpm_step)) % 2 == 0 else tick(2600), 0.55 * fade, 0.25, 0.1)
    t += bpm_step
add(t_power, thud(48, 1.5), 0.8, 0, 0.3)
# counter ticks for 250,000
for i in range(28):
    add(ws + 0.3 + i * 0.095, tick(4200), 0.25, 0.5, 0.05)

# CHASM — low heartbeat & motif in the bass
cs = S["chasm"]["start"]
for i in range(9):
    add(cs + i * 0.95, thud(50, 0.6), 0.45, 0, 0.2)
    add(cs + i * 0.95 + 0.22, thud(46, 0.5), 0.3, 0, 0.2)
motif(cs + 3.9, 1.0, 0.5, octave_down=True)

# RAIL — chug that dies at "changed"
rsct = S["rail"]["start"]
t_changed = word("rail", "w8", "changed")
t = rsct
i = 0
while t < t_changed - 0.1:
    n = rs.normal(0, 1, int(0.18 * SR))
    ch = bp(n, 150, 900) * np.exp(-tt(0.18) * 18)
    add(t, ch, 0.55 if i % 2 == 0 else 0.35, 0, 0.15)
    t += 0.36
    i += 1
add(rsct, pad([note("D3"), note("F#3"), note("A3")], line("rail", "w7")["start"] - rsct + 1, 2, 2, 900), 0.5, 0, 0.4)
add(t_changed, sub_hit(4), 0.8, 0, 0.5)
add(t_changed, pad([note("D3"), note("F3"), note("Ab3")], 3.5, 0.05, 3, 1500), 0.5, 0, 0.6)

# MACHINE — hum + data blips
ms = S["machine"]["start"]
add(ms, hum(S["machine"]["dur"] + 0.5), 1, 0, 0.1)
scale = [note(n) for n in ["D5", "F5", "A5", "C6", "D6", "E5", "G5"]]
t = ms + 0.3
while t < ms + S["machine"]["dur"]:
    dens = 0.25 if t < line("machine", "m2")["start"] else 0.9
    if rs.random() < dens:
        add(t, blip(scale[rs.integers(len(scale))]), 0.5, rs.random() * 1.6 - 0.8, 0.35)
    t += 0.125
add(line("machine", "m2")["start"] + 0.4, riser(3), 0.4, 0, 0.3)

# TUG — tense tremolo strings
tg = S["tug"]["start"]
d = S["tug"]["dur"]
trem = pad([note("D3"), note("A3"), note("Eb4")], d + 0.5, 1.2, 1.2, 1600) * (0.65 + 0.35 * np.sign(np.sin(2 * np.pi * 7 * tt(d + 0.5))))
add(tg, trem, 0.7, 0, 0.4)
add(line("tug", "m4")["start"], thud(41, 2.5), 0.6, 0, 0.4)

# CEILING — falling glide + hits at each threshold
cl = S["ceiling"]["start"]
d = S["ceiling"]["dur"]
tg_ = tt(d)
glide_f = 330 * 2 ** (-2.2 * tg_ / d)
glide = np.sin(2 * np.pi * np.cumsum(glide_f) / SR) * env_adsr(len(tg_), 1, 1) * 0.12
add(cl, glide + 0.6 * np.sin(2 * np.pi * np.cumsum(glide_f * 1.5) / SR) * env_adsr(len(tg_), 1, 1) * 0.08, 1, 0, 0.4)
for w in ("rent", "food", "alive"):
    add(word("ceiling", "m6", w), thud(44, 1.4), 0.7, 0, 0.4)
    add(word("ceiling", "m6", w), piano(note("D2"), 3, 0.8), 0.6, 0, 0.4)

# HORSES — year ticks + falling motif
hs = S["horses"]["start"]
t_by = word("horses", "m7", "by")
for i in range(45):
    add(t_by - 0.2 + i * 2.6 / 45, tick(1800 + i * 10), 0.18, -0.4, 0.05)
motif(hs + 0.5, 0.8, 0.45, octave_down=True, pan=0.2)

# FAMINE — sea, then 1933 hits
fs = S["famine"]["start"]
add(fs, water(S["famine"]["dur"] * 0.55), 0.9, 0, 0.3)
add(fs, pad([note("D3"), note("F3"), note("A3"), note("C4")], S["famine"]["dur"] + 1, 2.5, 2, 800), 0.55, 0, 0.5)
for w in ("milk", "six", "cities"):
    add(word("famine", "a2", w), piano(note("D3"), 3, 0.8) + piano(note("A2"), 3, 0.6), 0.6, 0, 0.4)

# SEN — sparse, then the strike-through
sn = S["sen"]["start"]
motif(sn + 0.2, 1.2, 0.45)
t_shared = word("sen", "a4", "shared")
add(t_shared + 0.25, snap()[: int(0.6 * SR)] * 0.6, 0.6, 0.2, 0.4)

# BOAT — water and wind
bs = S["boat"]["start"]
add(bs - 0.3, water(S["boat"]["dur"] + 1), 1.2, 0, 0.4)
add(bs, pad([note("D3"), note("A3"), note("E4")], S["boat"]["dur"], 1.5, 2, 900), 0.5, 0, 0.6)
add(word("boat", "b1", "capsize"), thud(36, 3), 0.6, 0, 0.5)

# CURSE — pumpjack, then servers, stamp
cu = S["curse"]["start"]
t_b4 = line("curse", "b4")["start"]
period = 2 * np.pi / 2.2
t = cu
while t < t_b4:
    add(t, thud(60, 0.7), 0.4, -0.2, 0.2)
    add(t + period / 2, thud(52, 0.7), 0.3, 0.2, 0.2)
    t += period
add(t_b4 - 0.2, hum(S["curse"]["dur"] - (t_b4 - cu) + 1, 120), 1.2, 0, 0.1)
t_int = word("curse", "b4", "intelligence")
add(t_int, mixs(thud(45, 2.0), clack(0.6)), 1.0, 0, 0.5)

# WEAPONS — three X hits, then surveillance
wp = S["weapons"]["start"]
t_strike = word("weapons", "b5", "strike")
t_b6 = line("weapons", "b6")["start"]
for i, tx in enumerate([t_strike, t_strike + 1.1, t_b6 + 0.3]):
    add(tx, mixs(thud(70 - i * 8, 0.9), clack(1.8) * 0.5), 0.6, -0.4 + i * 0.4, 0.3)
add(t_b6 + 0.5, hum(S["weapons"]["dur"] - (t_b6 - wp), 60), 1.0, 0, 0.1)
for i in range(12):
    add(t_b6 + 0.6 + i * 0.4, blip(1760 if i % 4 else 2349, 0.06), 0.35, 0.6, 0.1)

# ASSETS — whooshes into the node; clock at "time"
for w in ("savings", "home", "business"):
    add(word("assets", "n1", w) + 0.05, whoosh(1.1), 0.9, 0.3, 0.3)
    add(word("assets", "n1", w) + 1.1, thud(50, 0.8), 0.4, 0.5, 0.3)
add(word("assets", "n2", "enclosure"), clack(0.5), 0.6, 0, 0.3)
t_time = word("assets", "n2", "time", 1)
for i in range(6):
    add(t_time - 0.6 + i * 1.0, tick(1400) * 1.5, 0.6, 0, 0.3)
motif(S["assets"]["start"] + 5.0, 1.0, 0.4, octave_down=True)

# MAP — routes, then everywhere at once, then the rung falls
mp = S["map"]["start"]
add(mp, pad([note("D3"), note("A3"), note("D4")], 5.5, 1.5, 1.5, 900), 0.5, 0, 0.5)
t_all = word("map", "n4", "everywhere")
add(t_all - 1.6, riser(1.6), 0.7, 0, 0.3)
add(t_all, sub_hit(4) * 0.8, 1, 0, 0.5)
add(t_all, pad([note("D3"), note("A3"), note("D4"), note("E4"), note("A4")], 5, 0.05, 3.5, 4000), 0.55, 0, 0.6)
for i in range(30):
    add(t_all + rs.random() * 0.3, blip(note("D6") * (1 + rs.integers(0, 3) * 0.5), 0.2), 0.2, rs.random() * 2 - 1, 0.6)
t_cheap = word("map", "n5", "cheap")
add(t_cheap, clack(0.4) * 1.5, 0.5, 0.3, 0.2)
t_worth = word("map", "n5", "worthless")
add(t_worth + 0.6, mixs(thud(40, 2.2), clack(0.5)), 0.9, 0.4, 0.5)

# QUIET — room tone, UI clicks, the motif alone
qs = S["quiet"]["start"]
for w in ("posting", "contract", "graduate"):
    add(word("quiet", "e2", w) - 0.1, blip(1200, 0.05) + blip(1800, 0.05), 0.5, 0, 0.2)
motif(qs + 0.6, 1.4, 0.4)

# FINALE — craft (piano), dazzling city (bright pad), silence, snap
fn = S["final"]["start"]
add(fn + 0.2, piano(note("D3"), 5, 0.8) + piano(note("A3"), 5, 0.6), 0.8, 0, 0.5)
t_e4 = line("final", "e4")["start"]
t_e6 = line("final", "e6")["start"]
city_len = t_e6 - t_e4 + 0.6
add(t_e4 - 0.8, riser(1.6), 0.6, 0, 0.3)
city = pad([note("D3"), note("A3"), note("D4"), note("F#4"), note("A4"), note("E5")], city_len, 1.2, 0.6, 5000)
add(t_e4 - 0.2, city, 0.9, 0, 0.6)
for i in range(int(city_len / 0.25)):
    if rs.random() < 0.6:
        add(t_e4 + i * 0.25, blip([note(n) for n in ("D6", "F#6", "A6", "E6")][rs.integers(4)], 0.3), 0.18, rs.random() * 2 - 1, 0.7)
t_snap = line("final", "e6")["start"] + line("final", "e6")["dur"] + 0.35
add(t_snap, snap(), 1.0, 0, 0.6)
add(t_snap + 0.05, sub_hit(5) * 0.6, 1, 0, 0.6)

# END CARD — one low note, long tail
es = S["end"]["start"]
add(es + 0.6, piano(note("D2"), 6, 0.9) + piano(note("D3"), 6, 0.5) + piano(note("A3"), 6, 0.35), 0.9, 0, 0.7)

# silence the drone bed before the final line (the duck to near-nothing)
bed_mute = np.ones(N, np.float32)
a = int((t_e6 - 0.6) * SR)
b = int(t_e6 * SR)
bed_mute[a:b] = np.linspace(1, 0.15, b - a)
bed_mute[b:int(t_snap * SR)] = 0.15
c2 = int((t_snap + 0.1) * SR)
bed_mute[int(t_snap * SR):c2] = np.linspace(0.15, 1, c2 - int(t_snap * SR))
dry *= bed_mute
wet *= bed_mute

# reverb: synthetic stereo hall
ir_t = tt(3.6)
irs = [hp(rs.normal(0, 1, len(ir_t)), 120) * np.exp(-ir_t * 1.9) for _ in range(2)]
irs = [lp(ir, 6000) for ir in irs]
rev = np.stack([fftconvolve(wet[i], irs[i])[:N] for i in range(2)]) * 0.06
mix = dry + rev
mix = hp(mix, 28)
peak = np.max(np.abs(mix))
mix = mix / peak * 0.89
sf.write(ROOT / ".cache" / "music.wav", mix.T, SR, subtype="PCM_24")
print(f"music.wav {N / SR:.1f}s peak-normalized from {peak:.2f}")
