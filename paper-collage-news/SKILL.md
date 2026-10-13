---
name: paper-collage-news
description: Make a Vox-style paper-collage motion video (9:16, 1080x1920, 30-60 s) for a tech news report or explainer - torn paper, ransom-note letters, masking tape, marker scribbles, halftone cut-out photos and stop-motion "boil" - rendered from an HTML/GSAP page to MP4 with a local Kokoro voiceover, original lo-fi music and paper sound effects. Use when someone asks for a collage, paper-cutout, scrapbook, zine, "Vox style" or handmade-looking video, a vertical news explainer, or a short report video for Reels, TikTok, Shorts or Threads.
license: MIT
compatibility: Node.js 18+, Python 3.10-3.12, ffmpeg with libx264 on PATH, about 400 MB for the Kokoro voice model. Runs fully offline after setup; no API keys.
metadata:
  author: KrackedDevs (wiki.krackeddevs.com)
  version: "1.0"
---

# Paper Collage News

**Storyboard first, build second.** A video is a list of scenes in `storyboard.json`. Each scene has a type (a ready-made collage layout), a voice line, and words in that line that trigger each piece of paper. `plan.mjs` lays the scenes end to end around the recorded voice, `index.html` builds the collage and the GSAP timeline, Playwright renders every frame, ffmpeg encodes.

The look: cream and coloured paper with fibres and grain, torn edges, ransom-note letters cut from different "magazines", masking tape, red/blue marker circles, underlines and Xs that draw themselves, photocopied halftone photos, and the whole page animating on twos (15 drawings a second) with a slight stop-motion boil.

## Setup (once per machine)

Copy `template/` to a new working folder, then inside it:

```bash
npm install
npx playwright install chromium
python -m venv .venv          # Python 3.11 is safest for misaki
.venv/Scripts/pip install -r requirements.txt     # macOS/Linux: .venv/bin/pip
```

Activate the venv so `python` below is the venv's. Download `kokoro-v1.0.onnx` and `voices-v1.0.bin` from https://github.com/thewh1teagle/kokoro-onnx/releases (tag `model-files-v1.0`) into `models/`, or set `KOKORO_MODELS` to their folder. See [references/setup.md](references/setup.md).

## Workflow

1. **Direction before code.** Decide the one thing the viewer should remember, then write the storyboard as 5–7 scenes: hook, explain, proof, picks or examples, the twist or tip, sign-off. Aim for 35–50 s total, one idea per scene, one short sentence or two of voice per scene (5–25 words).
2. **Write `storyboard.json`.** Pick a scene type for each beat and fill its fields; every `...At` field is a word from that scene's `vo` line. Scene types and fields: [references/storyboard-schema.md](references/storyboard-schema.md). Visual rules: [references/style-guide.md](references/style-guide.md).
3. **Get images** for `cutouts` scenes: `node research/capture.mjs name=https://official.page` writes 1600x900 stills to `img/` (they are shown as photocopied cut-outs, so screenshots of official pages work well). Credit the sources in your post caption.
4. **Record the voice:**
   ```bash
   node plan.mjs                      # writes vo/narration.json from the storyboard
   cd vo && python gen_vo.py && cd ..
   node plan.mjs                      # re-times every scene around the recorded clips
   cd vo && python wordtimes.py && cd ..
   ```
   Words printed as `guessed` came from eSpeak: listen, add wrong ones to `LEXICON` in `tools/kd_voice.py`, and re-record that scene with `python gen_vo.py <scene-id>` (then `node plan.mjs` and `wordtimes.py` again). Pick the narrator in `storyboard.json` → `voice` (Kokoro voices such as `am_michael`, `af_heart`, `bf_emma`).
5. **Check:** `node check.mjs` validates every scene's fields, images, recorded voice and word cues. Fix what it lists (`WT miss` = a cue word not in that scene's line).
6. **Look before rendering:** `node snap.mjs 1 5 12 20 30 40` then `python tools/sheet.py snaps sheet.jpg`, and open the sheet. Look for text running off the page, pieces covering each other's captions, and empty scenes. Adjust coordinates in `index.html` → `BUILD.<type>` only if a layout genuinely does not fit your content.
7. **Render, audio, encode:**
   ```bash
   node render.mjs 6
   python audio.py && python mix_vo.py
   ffmpeg -y -i out/audio_vo.wav -af "acompressor=threshold=-18dB:ratio=2.5:attack=8:release=120,loudnorm=I=-14:TP=-2.5:LRA=9,alimiter=limit=0.7:level=false" out/audio_final.wav
   bash encode.sh <name> 5      # <name>_9x16.mp4 (~27 MB cap, +faststart) and a poster frame at 5 s
   python make_vtt.py           # out/captions.vtt
   ```
8. **QA:** pull 6–8 frames from the final MP4 (`ffmpeg -ss <t> -i <name>_9x16.mp4 -frames:v 1 f.jpg`) and look at them; check loudness is about -14 LUFS (`ffmpeg -i <name>_9x16.mp4 -af ebur128 -f null -`). Deliver the MP4, poster, VTT and a short caption.

## Rules that matter

- One idea per scene; if a scene needs more than ~25 spoken words, split it.
- Every on-screen fact must be sourced. Never invent numbers for the sake of a nice clipping.
- Keep the stop-motion quantisation (`__seek` snaps to 1/15 s); smooth 30 fps motion breaks the handmade look.
- No stock textures or downloaded fonts beyond the npm @fontsource packages: everything paper-like is procedural in `collage.js`.
- Use `ransom` text for 1–3 words only; long ransom lines are unreadable.
- The voice stays smooth (it is not quantised); music sits 18–20 dB under it.

## Files

| File | Purpose |
|---|---|
| `template/storyboard.json` | The video: scenes, voice lines, cue words (edit) |
| `template/plan.mjs` | Storyboard → `vo/narration.json`, scene timing → `plan.js` |
| `template/index.html` | Scene layouts (`BUILD`), their animation (`ANIM`), timeline and `__seek` API |
| `template/collage.js` | The paper kit: `torn`, `piece`, `ransom`, `tape`, `scribble`, `photo`, textures |
| `template/check.mjs` | Pre-render validator |
| `template/render.mjs`, `snap.mjs` | Frame renderer, still grabber |
| `template/audio.py`, `mix_vo.py`, `encode.sh`, `make_vtt.py` | Lo-fi bed + paper SFX, voice mix, encode + poster, captions |
| `template/vo/gen_vo.py`, `wordtimes.py`, `tools/kd_voice.py` | Kokoro voice, word timings, pronunciation dictionary |
| `template/research/capture.mjs`, `tools/sheet.py` | Official-page stills, contact sheets |
