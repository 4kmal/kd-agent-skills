# House rules (KD Tech Daily)

## Content
- Five stories, the day's most useful for builders. Each needs a primary source (company post, docs, filing, repo). Two independent reports are acceptable when there is no primary source.
- One concrete detail per story (a number, a name, a date). Do not round in a way that changes meaning, and never invent a figure to fill a bullet.
- `sign` reflects the news for builders, not the company's mood: a breach or a shutdown is `-`; a launch, an open-source release or a price cut is `+`.
- Jokes live only in the terminal's third line. Keep them kind and about the tech, never about people or victims.

## Media
- Real, official media: the company's own screenshots, product pages, blog images or video. Credit every one on screen (`IMAGE: GOOGLE`, `VIDEO: SHOPIFY`).
- Official logos are smaller than the KD mark, white on dark, with "Logos are trademarks of their owners; no endorsement implied." in the sources line.
- Video clips: frame sequences at 30 fps in `clips/<name>/` (Chromium headless cannot play H.264).

## Voice
- Kopi: Kokoro `af_heart` at 1.1x, auto-sped to fit (max 1.4x).
- Write acronyms the normal way (AI, APIs, FTC); add mispronounced names to `LEXICON`/`PHRASES` in `tools/kd_voice.py` instead of misspelling them in the script.
- Optional check: `python tools/vo_check.py vo` transcribes each clip with faster-whisper and lists words heard differently.

## Wardrobe
Rotate Kopi's outfit each episode: hoodie → batik → bomber → varsity → raid (`classic` was episode 1 only).

## Mix and delivery
- Music 18–20 dB under the voice while anyone talks, never swelling between lines; master to -14 LUFS, true peak ≤ -1.5 dBTP.
- Two files, same audio: `<name>_16x9.mp4` (1920x1080) and `<name>_9x16.mp4` (1080x1920), each under 30 MB, `+faststart`.
- QA before delivery: a contact sheet of ~20 frames, loudness, and a listen to every line.

## Post caption (one caption covers both formats)
- **Hook:** one catchy line that teases the episode without naming the stories.
- **One bullet per story** with slightly more detail than the video (a key number, name or fact).
- **Sign-off:** `Learn. Build. Ship. #KDTechDaily`

Example:
> Wednesday's changelog is all about giving your agent new tricks 🧠
>
> • Agent Skills is an open standard: a folder with a SKILL.md, first built by Anthropic, now at agentskills.io
> • `npx skills add owner/repo` installs a skill from GitHub into Claude Code, Codex, Cursor and 75 more agents
> • Supabase ships two official skills: the full platform, plus Postgres best practices
> • Anatomy turns a one-line idea into a live isometric machine (a message queue becomes a marble run)
> • Cadu puts your self-hosted Hermes agent on iPhone, connected by QR code; TestFlight beta now
>
> Learn. Build. Ship. #KDTechDaily
