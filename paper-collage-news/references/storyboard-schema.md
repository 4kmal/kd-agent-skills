# storyboard.json

Top level:

| Field | Example | Notes |
|---|---|---|
| `title` | `"The KD Brief: Agent Skills"` | Page title |
| `masthead` | `"THE KD BRIEF"` | Newspaper name on the cover, top tag and footer |
| `report` | `"TECH NEWS REPORT"` | Kicker under the masthead |
| `dateLine` / `dateShort` | `"WEDNESDAY 14 OCTOBER 2026"` / `"WED 14.10.26"` | Cover and footer |
| `voice` | `{ "voice": "am_michael", "speed": 1.05 }` | Kokoro voice and base speed |
| `scenes` | `[...]` | 5–7 scenes, played in order |

Every scene has `id` (unique, used as the voice clip name), `type`, `vo` (the spoken line) and optionally `tail` (extra seconds held after the voice, e.g. on the last scene). Fields ending in `At` are **a word from that scene's `vo`** (case and punctuation ignored, prefix match; `"word#2"` = second occurrence). The piece appears when that word is spoken.

## Scene types

### `cover` — newspaper front page
`issue` ("No. 01"), `title` (array of 1–2 short words, shown as ransom letters on pink paper), `titleAt`, `kicker` (one line on a black strip, ≤ 30 chars), `kickerAt`, `stamp` (one word, red rubber stamp), `stampAt`.

### `explain` — a folder with three index cards
`headline` (≤ 18 chars), `folder` (tab label), `folderAt`, `cards` (exactly 3: `{ label ≤ 12 chars, note ≤ 18 chars (handwritten), at }`), `annotation` (red handwriting, ≤ 26 chars), `annotationAt`.

### `terminal` — a command on a torn black sheet
`headline` (ransom, 1–2 words), `subhead` (typewriter, ≤ 24 chars), `command` (≤ 30 chars, typed), `commandAt`, `output` (green line), `circle` (part of the command to circle in red), `circleAt`, `note` (yellow sticky, ≤ 24 chars), `noteAt`.

### `cutouts` — three photocopied polaroids
`headline` (≤ 12 chars), `items` (exactly 3: `{ img: "img/x.jpg", label ≤ 10 chars, caption ≤ 18 chars, at }`). Images are cropped to 4:3 from the top, so use 1600x900 page screenshots or photos.

### `ransom` — the brief, crossed out and rewritten
`bubble` (a chat request, ≤ 24 chars), `strikeAt` (red X and "not a brief!"), `lines` (2 ransom lines, ≤ 10 and ≤ 7 chars), `linesAt`, `frames` (3 storyboard thumbnail labels), `strip` (black strip, ≤ 24 chars), `stripAt`.

### `signoff` — where to go next
`headline` (ransom, ≤ 14 chars, wraps by word), `url` (host/path, split onto two lines at the first `/`), `urlAt`, `footer` (black strip, ≤ 20 chars), `footerAt`. Logo from `brand/kd_logo.png`.

## Adding a scene type

Add `BUILD.<type>(scene, plan)` returning HTML (use `C.piece`, `C.ransom`, `C.tape`, `C.scribble`, `C.photo`), `ANIM.<type>(scene, plan, root)` using `slap`, `slide`, `pop`, `letters`, `draw` and `typeAt` with `WT(scene.id, word)`, a sheet colour in `SHEETS`, and its required fields in `check.mjs` → `NEEDS`.

Sound effect cues come from the helpers (`paper`, `snip`, `tape`, `marker`, `stamp`, `key`, `tick`, `whoosh`, `pop`); `audio.py` synthesizes each one at its time.
