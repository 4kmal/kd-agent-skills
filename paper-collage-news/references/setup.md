# Setup and troubleshooting

## Requirements
- **Node.js 18+** with npm. `npm install` brings GSAP, Playwright and the @fontsource fonts (loaded from `node_modules`, so no network at render time).
- **Chromium for Playwright:** `npx playwright install chromium`. If renders fail with "Executable doesn't exist", the installed Playwright wants a newer browser build; run the command again inside the episode folder.
- **ffmpeg with libx264 on PATH.** Playwright's bundled ffmpeg cannot encode H.264; install a full build:
  - Windows: `winget install Gyan.FFmpeg` (open a new terminal afterwards, or add `%LOCALAPPDATA%\Microsoft\WinGet\Links` to PATH)
  - macOS: `brew install ffmpeg`
  - Debian/Ubuntu: `sudo apt install ffmpeg`
- **Python 3.10–3.12** (3.11 recommended) in a venv: `pip install -r requirements.txt`. The first run of `misaki` downloads the spaCy `en_core_web_sm` model (about 13 MB).
- **Kokoro voice model** (about 350 MB), from https://github.com/thewh1teagle/kokoro-onnx/releases/tag/model-files-v1.0:
  - `kokoro-v1.0.onnx` and `voices-v1.0.bin` into `models/` next to `index.html`, or anywhere with `KOKORO_MODELS=<folder>`.

## Windows notes
- Run `encode.sh` with Git Bash (`bash encode.sh name`); it writes pass-1 output to `NUL` automatically.
- PowerShell environment variables: `$env:FMT='916'; node render.mjs 6; Remove-Item Env:FMT`.
- If Python prints `UnicodeEncodeError` for phonemes, set `PYTHONIOENCODING=utf-8`.

## Speed
`node render.mjs 6` renders with 6 Chromium pages in parallel; a 45 s video (about 1,350 frames) takes 1–2 minutes on a modern laptop. Lower the worker count if memory is tight.

## Common problems
| Symptom | Fix |
|---|---|
| `WT miss picks word` in `check.mjs` | That cue word is not in the `picks` scene's `vo`; change the cue or the line, re-run `gen_vo.py picks`, `node plan.mjs` and `wordtimes.py` |
| Scenes feel rushed | Raise HEAD/TAIL in `plan.mjs` or add `"tail": 1.0` to a scene |
| A polaroid is blank | The `img` path in `storyboard.json` does not exist (check.mjs lists it) |

| Fonts look wrong in stills | `npm install` did not finish; fonts load from `node_modules/@fontsource` |
| Voice mispronounces a name | Add it to `LEXICON` in `tools/kd_voice.py` (misaki phonemes), check with `python tools/kd_voice.py "text"` |
