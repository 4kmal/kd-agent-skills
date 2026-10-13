# episode.js

```js
window.EPISODE = {
  title: 'KD Tech Daily: Fri 02.10.26',
  date: { short: 'FRI 02.10.26', chip: 'FRI 02.10.2026 // 5 STORIES', screen: 'FRI 02.10.26 // LIVE', ticker: 'FRI 02 OCT 2026' },
  outfit: 'varsity',                 // hoodie -> batik -> bomber -> varsity -> raid (rotate per episode)
  promptCmd: './kd-tech-daily --today',
  sources: 'src: ... <br>images: ... Logos are trademarks of their owners; no endorsement implied.',
  stories: [ /* exactly 5 */ ],
};
```

## A story

| Field | Rule | Shown |
|---|---|---|
| `sign` | `'+'` good news / launch (green), `'-'` setback (red, Kopi's drone flashes) | Gutter, colours |
| `tag` | One word, caps | `@@ 01/05 // TAG @@`, cam lower third |
| `short` | ≤ 16 chars | Rundown rows, studio card |
| `lines` | 3 lines, each ≤ 13 chars; the last one gets the highlight bar | Headline |
| `mood` | `happy`, `worried`, `normal`, `dollar`, `shocked`, `star` | Kopi's visor eyes |
| `bullets` | 2 facts, each ≤ 75 chars, lower case start, a number or a name in each | Typed bullets |
| `term` | `[command, output, joke]`, each ≤ 34 chars | Terminal panel |
| `sticker` | ≤ 12 chars | Stamped sticker on the media panel |
| `logo`, `logo2?`, `mlogo?` | Paths in `logos/` (white SVG on dark) | Rundown, wall screen, badge, media label |
| `co` | ≤ 10 chars | Label beside the logo badge |
| `media` | `{type:'img', src:'img/x.jpg'}` (1600x900) or `{type:'clip', name:'x', n:frames}` | Media panel (Ken Burns zoom) |
| `thumb?` | Image path | Studio card and cam screen (defaults to the media) |
| `credit` | `'IMAGE: COMPANY'` / `'VIDEO: COMPANY'` | Media panel corner |
| `label` | ≤ 28 chars | Media panel top-left |
| `moments?` | Overlays timed to spoken words (below) | Media panel |
| `acts?` | Kopi's moves timed to words (below) | Kopi |

## Moments (overlays on the media panel)

Every moment has `at: 'word'` (a word in this story's narration line; `'word#2'` for the second match) and optional `until: 'word'`.

| type | fields |
|---|---|
| `badge` | `text`, `color?` (bg), `ink?` (text colour), `pos?: 'top' \| 'bottom'` |
| `chips` | `items: [...]` (short words, up to ~6) |
| `box` | `x, y, w, h` (px inside the 860x484 panel), `tag`, `color?`: highlight a region of the image |
| `counter` | `to` (number), `decimals?`, `prefix?`, `suffix?`, `label`, `red?` |
| `note` | `cap`, `big`, `small`, `stamp?`, `stampAt?`: a paper note slapped onto the image |

## Acts (optional)

Kopi already follows a default pattern per story (react, point at the screen, read, gesture, thumbs up, sip coffee, tidy papers). Override part of it with `acts: [{ at: 'word', until: 'word', pose, eyes }]`.

Poses: rest, papers, read, sip, tablet, headset, tuck, point, pen, write, thumb, heart, visor, fist, wave. Eyes: normal, blink, happy, worried, dollar, shocked, star, down, wink, heart.

## vo/narration.json

Seven lines with fixed ids and start times: `open` (5.1 s, max 5.6), `s1`–`s5` (11.35 + 13·i, max 12.3), `out` (76.6, max 6.0). Voice `af_heart` at 1.1x. Greet the community in `open`, name the day/date, and sign off in `out` (the outro card shows "that's the diff." and "now go build something.").
