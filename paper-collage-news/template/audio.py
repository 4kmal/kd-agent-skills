"""Synthesize an original lo-fi bed + paper/scissors/tape/marker sound effects synced to out/events.json
-> out/music.npy, out/sfx.npy (stems for mix_vo.py) and out/audio.wav. Everything is generated here; no samples."""
import json, os, numpy as np
from scipy.signal import butter, sosfilt
from scipy.io import wavfile

_M = json.load(open('out/music.json')) if os.path.exists('out/music.json') else {}
SR = 44100; DUR = _M.get('dur', 45.0); N = int(SR * DUR)
BPM = 84; BEAT = 60 / BPM; STEP = BEAT / 4; BAR = BEAT * 4
rng = np.random.default_rng(11)
music = np.zeros((N, 2)); sfx = np.zeros((N, 2))

def mtof(m): return 440.0 * 2 ** ((m - 69) / 12)
def lp(x, f, o=2): return sosfilt(butter(o, f, 'low', fs=SR, output='sos'), x)
def hp(x, f, o=2): return sosfilt(butter(o, f, 'high', fs=SR, output='sos'), x)
def bp(x, lo, hi, o=2): return sosfilt(butter(o, [lo, hi], 'band', fs=SR, output='sos'), x)
def tt(d): return np.arange(int(d * SR)) / SR
def expenv(d, dec, att=0.003):
    t = tt(d); return np.minimum(1, t / att) * np.exp(-t / dec)
def add(buf, t, x, gain=1.0, pan=0.0):
    i = int(t * SR)
    if i >= N or i + len(x) <= 0: return
    if i < 0: x, i = x[-i:], 0
    x = x[: N - i]
    l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    buf[i:i + len(x), 0] += x * gain * l * 1.414
    buf[i:i + len(x), 1] += x * gain * r * 1.414

# ---------- instruments: soft electric piano, sine bass, dusty drums, vinyl ----------
def keys(ms, d):
    t = tt(d); x = np.zeros(len(t))
    for m in ms:
        f = mtof(m); x += (np.sin(2 * np.pi * f * t) + 0.25 * np.sin(4 * np.pi * f * t) * np.exp(-t / 0.4)) * np.exp(-t / 1.6)
    trem = 1 + 0.12 * np.sin(2 * np.pi * 4.5 * t)
    return lp(x * trem / len(ms), 2600) * np.minimum(1, t / 0.01)
def bass(m, d): t = tt(d); return np.sin(2 * np.pi * mtof(m) * t) * expenv(d, 0.5, 0.01)
def kick():
    t = tt(0.3); f = 50 + 70 * np.exp(-t / 0.04)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * expenv(0.3, 0.12)
def snap():
    n = bp(rng.standard_normal(int(0.18 * SR)), 1200, 6000) * expenv(0.18, 0.05)
    return lp(n, 5000)
def shaker(): return hp(rng.standard_normal(int(0.06 * SR)), 6000) * expenv(0.06, 0.018)

CH = [(53, [65, 69, 72, 76]), (52, [64, 67, 71, 74]), (50, [62, 65, 69, 72]), (48, [60, 64, 67, 71])]   # Fmaj7 Em7 Dm7 Cmaj7
nbars = int(DUR / BAR) + 1
for b in range(nbars):
    t0 = b * BAR; root, ch = CH[b % 4]
    add(music, t0, keys(ch, BAR + 0.4), 0.22, pan=-0.15)
    add(music, t0 + 2.5 * BEAT, keys(ch[1:], BEAT * 1.2), 0.08, pan=0.25)
    add(music, t0, bass(root - 12, BEAT * 1.6), 0.32); add(music, t0 + 2.5 * BEAT, bass(root - 12, BEAT), 0.24)
    if b == 0: continue
    for s in range(16):
        ts = t0 + s * STEP + (0.018 if s % 2 else 0)        # lazy swing
        if s in (0, 7, 10): add(music, ts, kick(), 0.55)
        if s in (4, 12): add(music, ts, snap(), 0.22, pan=0.1)
        if s % 2 == 0: add(music, ts, shaker(), 0.05 if s % 4 else 0.08, pan=0.3)
# vinyl: crackle + hiss
crackle = np.zeros(N); pos = rng.integers(0, N, int(DUR * 9)); crackle[pos] = rng.uniform(-1, 1, len(pos))
crackle = hp(crackle, 1500) * 0.5 + lp(rng.standard_normal(N), 3000) * 0.012
music += np.stack([crackle, crackle], axis=1) * 0.5
music = np.stack([lp(music[:, c], 7000) for c in range(2)], axis=1)
fade = np.ones(N); fi = int(0.4 * SR); fade[:fi] = np.linspace(0, 1, fi)
fo0 = int((DUR - 2.5) * SR); fade[fo0:] = np.linspace(1, 0, N - fo0) ** 1.5
music *= fade[:, None]; music /= np.max(np.abs(music)) + 1e-9; music *= 0.5

# ---------- SFX ----------
def paper(d=0.38):
    n = rng.standard_normal(int(d * SR)); env = np.zeros(len(n))
    for _ in range(14):                                    # crinkles: many tiny bursts
        w = int(rng.integers(200, 1400)); c = int(rng.integers(0, len(n) - w)); env[c:c + w] += np.hanning(w) * rng.uniform(0.3, 1)
    return bp(n * np.clip(env, 0, 1), 1800, 9000) * np.sin(np.linspace(0, np.pi, len(n))) ** 0.5
def snip():
    out = np.zeros(int(0.22 * SR))
    for k, t in enumerate((0.0, 0.07)):
        i = int(t * SR); c = hp(rng.standard_normal(int(0.012 * SR)), 3000) * expenv(0.012, 0.003)
        ring = np.sin(2 * np.pi * (3200 + 400 * k) * tt(0.08)) * expenv(0.08, 0.02) * 0.4
        out[i:i + len(c)] += c; out[i:i + len(ring)] += ring
    return out
def tape():
    d = 0.32; n = rng.standard_normal(int(d * SR)); t = tt(d)
    am = 0.55 + 0.45 * np.sign(np.sin(2 * np.pi * 38 * t))
    return bp(n * am, 600, 5000) * np.sin(np.linspace(0, np.pi, len(n)))
def marker(d=0.45):
    t = tt(d); f = 1150 + 180 * np.sin(2 * np.pi * 3 * t)
    sq = np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.25 + bp(rng.standard_normal(len(t)), 2000, 7000) * 0.8
    return sq * np.sin(np.linspace(0, np.pi, len(t))) ** 0.7
def stamp():
    th = np.sin(2 * np.pi * np.cumsum(110 * np.exp(-tt(0.3) / 0.08) + 45) / SR) * expenv(0.3, 0.09)
    return np.tanh(2 * th) + bp(rng.standard_normal(len(th)), 600, 4000) * expenv(0.3, 0.02) * 0.6
def key():
    d = 0.05; c = hp(rng.standard_normal(int(d * SR)), 1800) * expenv(d, 0.008)
    return c + np.sin(2 * np.pi * 180 * tt(d)) * expenv(d, 0.01) * 0.6        # typewriter-ish thock
def tick(): return bp(rng.standard_normal(int(0.03 * SR)), 2500, 8000) * expenv(0.03, 0.006)
def whoosh(d=0.4):
    n = rng.standard_normal(int(d * SR)); return bp(n, 400, 3500) * np.sin(np.linspace(0, np.pi, len(n))) ** 1.5
def pop(): return np.sin(2 * np.pi * np.cumsum(np.linspace(420, 900, int(0.07 * SR))) / SR) * expenv(0.07, 0.03)

for e in json.load(open('out/events.json')):
    t, ty = e['t'], e['type']; pan = float(rng.uniform(-0.25, 0.25))
    if ty == 'paper':    add(sfx, t, paper(), 0.55, pan)
    elif ty == 'snip':   add(sfx, t, snip(), 0.45, pan)
    elif ty == 'tape':   add(sfx, t, tape(), 0.32, pan)
    elif ty == 'marker': add(sfx, t, marker(e.get('d', 0.45)), 0.16, pan)
    elif ty == 'stamp':  add(sfx, t, stamp(), 0.6)
    elif ty == 'key':    add(sfx, t, key(), float(rng.uniform(0.18, 0.26)), pan)
    elif ty == 'tick':   add(sfx, t, tick(), 0.18, pan)
    elif ty == 'whoosh': add(sfx, t, whoosh(), 0.35, pan)
    elif ty == 'pop':    add(sfx, t, pop(), 0.25, pan)

np.save('out/music.npy', music.astype(np.float32)); np.save('out/sfx.npy', sfx.astype(np.float32))
mix = music + sfx; peak = np.max(np.abs(mix)); mix = mix / peak * 0.89
wavfile.write('out/audio.wav', SR, (mix * 32767).astype(np.int16))
print('audio ok', DUR, 's, peak before norm', round(float(peak), 3))
