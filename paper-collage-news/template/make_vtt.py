"""Write WebVTT captions from the recorded narration -> out/captions.vtt
Cues follow the word timings in vo/words.json (from vo/wordtimes.py), at most ~42 characters per cue,
breaking after punctuation where possible. Both formats share these captions.
usage: python make_vtt.py [out/captions.vtt]"""
import json, sys, os

out_path = sys.argv[1] if len(sys.argv) > 1 else 'out/captions.vtt'
tl = json.load(open('vo/timeline.json', encoding='utf-8'))
words = json.load(open('vo/words.json', encoding='utf-8'))
MAXC = 42

def ts(t):
    h, r = divmod(max(0.0, t), 3600); m, s = divmod(r, 60)
    return f"{int(h):02d}:{int(m):02d}:{s:06.3f}"

cues = []
for c in sorted(tl['clips'], key=lambda c: c['start']):
    ws, end = words[c['id']], c['start'] + c['dur']
    cur, t0 = [], None
    for k, (w, t) in enumerate(ws):
        if t0 is None: t0 = t
        cur.append(w)
        nxt = ws[k + 1][1] if k + 1 < len(ws) else end
        text = ' '.join(cur)
        brk = k + 1 == len(ws) or len(text) + 1 + len(ws[k + 1][0]) > MAXC or (w[-1] in '.!?' and len(text) > 18)
        if brk:
            cues.append((t0, nxt if k + 1 < len(ws) else end + 0.2, text)); cur, t0 = [], None

os.makedirs(os.path.dirname(out_path) or '.', exist_ok=True)
with open(out_path, 'w', encoding='utf-8', newline='\n') as f:
    f.write('WEBVTT\n\n')
    for i, (a, b, text) in enumerate(cues, 1):
        f.write(f"{i}\n{ts(a)} --> {ts(max(b, a + 0.6))}\n{text}\n\n")
print(f"{len(cues)} cues -> {out_path}")
