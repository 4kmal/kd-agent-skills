---
name: kd-tech-daily
description: Make an 83-second tech news episode ("KD Tech Daily") anchored by Kopi, a pixel-anime news anchor with lip-sync, rendered from an HTML/GSAP page to MP4 in both 16:9 and 9:16, with a local Kokoro voiceover, original synthesized music, captions and a post caption. Use when someone asks for a tech news video, a daily tech recap, a news-anchor episode, a "KD Tech Daily", or a short news report video about products, launches or AI tools, even if they do not name the show.
license: MIT
compatibility: Node.js 18+, Python 3.10-3.12, ffmpeg with libx264 on PATH, about 400 MB for the Kokoro voice model. Runs fully offline after setup; no API keys.
metadata:
  author: KrackedDevs (wiki.krackeddevs.com)
  version: "1.0"
---

# KD Tech Daily

An episode is one HTML page (`template/index.html`) driven by a paused GSAP timeline. Playwright steps it frame by frame, ffmpeg encodes the frames, a local Kokoro TTS model reads the script, and Python synthesizes the music and sound effects. You only edit **two files**: `episode.js` (the five stories) and `vo/narration.json` (what Kopi says).

Fixed format (83 s, 30 fps): intro 0–4.5 s, studio open 4.5–11 s, five stories of 13 s each (3 s studio card + 10 s story package), outro 76–83 s.

## Setup (once per machine)

Copy `template/` to a new working folder for the episode, then inside it:

```bash
npm install
npx playwright install chromium
python -m venv .venv          # Python 3.11 is safest for misaki
.venv/Scripts/pip install -r requirements.txt     # macOS/Linux: .venv/bin/pip
```

Activate the venv (`.venv\Scriptsctivate` on Windows, `source .venv/bin/activate` elsewhere) so `python` below is the venv's.

Download `kokoro-v1.0.onnx` and `voices-v1.0.bin` from https://github.com/thewh1teagle/kokoro-onnx/releases (tag `model-files-v1.0`) into `models/`, or point `KOKORO_MODELS` at a folder that has them. Full details and fixes per OS: [references/setup.md](references/setup.md).

## Workflow

1. **Research five stories.** Use primary sources (company blog, docs, release notes, filings). Write down one concrete number or name per story. Never invent stats; if a number cannot be sourced, leave it out.
2. **Write `episode.js`.** Date strings, Kopi's outfit (rotate per episode), the sources line, and five stories. Rules and every field: [references/episode-schema.md](references/episode-schema.md). Limits: 3 headline lines of at most 13 characters, 2 bullets of at most 75, terminal lines of at most 34.
3. **Get media.**
   - Logos: `node tools/logo.mjs supabase vercel anthropic` (white marks from simple-icons into `logos/`). For brands simple-icons lacks, use the company's own SVG or a simple icon you draw.
   - Stills: `node research/capture.mjs name=https://official.page ...` writes 1600x900 screenshots into `img/`. Credit every image on screen (`credit: 'IMAGE: SUPABASE DOCS'`).
   - Video clips play as JPEG frame sequences (`clips/<name>/0001.jpg`, 30 fps) because headless Chromium cannot decode H.264: `ffmpeg -i clip.mp4 -vf fps=30,scale=1600:-2 clips/<name>/%04d.jpg`.
4. **Write the narration** in `vo/narration.json`: lines `open` (max 5.6 s), `s1`–`s5` (max 12.3 s, about 30 words each), `out` (max 6 s). Keep line ids and start times. Write acronyms normally (AI, APIs, GPT-6); never space them out.
5. **Record the voice:** `cd vo && python gen_vo.py && python wordtimes.py && cd ..`. Each line is auto-sped (up to 1.4x) to fit its window; if a line prints `<-- OVER`, shorten the text. Words printed as `guessed` came from eSpeak: listen, and add wrong ones to `LEXICON` in `tools/kd_voice.py`, then re-record that line with `python gen_vo.py s3`.
6. **Lip-sync:** `python lipsync.py 83`.
7. **Check:** `node check.mjs`. It validates text limits, voice windows, media files and every word cue. Fix everything it lists. A `WT miss` means a `moments`/`acts` word is not in that story's narration.
8. **Look at stills before rendering:** `node snap.mjs 2.5 8 16 30 47 70 80` and `FMT=916 node snap.mjs 8 16 58`, then `python tools/sheet.py snaps sheet.jpg`. Open the sheet image and check for overlaps, cut-off text and empty media panels.
9. **Render both formats:** `node render.mjs 6` (writes `out/video_silent.mp4`) and `FMT=916 node render.mjs 6` (writes `out-916/`). On Windows PowerShell: `$env:FMT='916'; node render.mjs 6; Remove-Item Env:FMT`.
10. **Audio:** `python audio.py && python mix_vo.py`, then master to -14 LUFS:
    `ffmpeg -y -i out/audio_vo.wav -af "acompressor=threshold=-18dB:ratio=2.5:attack=8:release=120,loudnorm=I=-14:TP=-2.5:LRA=9,alimiter=limit=0.7:level=false" out/audio_final.wav`
11. **Encode:** `bash encode.sh kd-tech-daily_<yyyy-mm-dd>` produces `<name>_16x9.mp4` and `<name>_9x16.mp4` (two-pass x264, about 27 MB each, `+faststart`). Captions: `python make_vtt.py` writes `out/captions.vtt`.
12. **QA and deliver:** sample frames from the final MP4s, confirm loudness (`ffmpeg -i x.mp4 -af ebur128 -f null -` should report about -14 LUFS), then deliver both MP4s, the VTT and a post caption ([references/house-rules.md](references/house-rules.md)).

## Rules that matter

- Every episode ships in **both** 16:9 (1920x1080) and 9:16 (1080x1920) from the same page and audio.
- Real media only, credited on screen; logos smaller than the KD mark, no implied endorsement, trademark note in the sources line.
- Music sits 18–20 dB under the voice and never swells between lines (`mix_vo.py` defaults).
- `sign: '-'` turns a story red and makes Kopi's drone flash; use it for setbacks, not for neutral news.
- Do not edit the timeline code in `index.html` for content changes; everything episode-specific lives in `episode.js`.

## Rebranding

The show is KrackedDevs-branded. To make it yours: replace `brand/kd_logo.png`, the "TECH DAILY" strings and tagline in `index.html`, Kopi's name in the cam lower third, and the greeting in `vo/narration.json`. `anchor.js` draws Kopi (outfits: classic, hoodie, batik, bomber, varsity, raid); `newsdesk.js` draws the desk.

## Files

| File | Purpose |
|---|---|
| `template/episode.js` | The episode's content (edit) |
| `template/vo/narration.json` | Kopi's script (edit) |
| `template/index.html` | Engine: layout, timeline, `__seek` API used by the renderer |
| `template/anchor.js`, `newsdesk.js` | Kopi sprite (poses, eyes, mouths, outfits, drone) and the desk props |
| `template/render.mjs`, `snap.mjs` | Frame renderer and still grabber |
| `template/check.mjs` | Pre-render validator |
| `template/audio.py`, `mix_vo.py`, `encode.sh`, `make_vtt.py` | Music + SFX, voice mix, final encode, captions |
| `template/vo/gen_vo.py`, `wordtimes.py`, `tools/kd_voice.py` | Kokoro voice, word timings, pronunciation dictionary |
| `template/tools/logo.mjs`, `research/capture.mjs`, `tools/sheet.py` | Logos, official-page stills, contact sheets |
