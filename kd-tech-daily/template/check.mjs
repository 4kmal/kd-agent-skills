// Pre-render check: text limits in episode.js, voice lines vs their windows, missing media files,
// and every word cue (WT miss) the page could not find in the narration.
// usage: node check.mjs            (run after vo/gen_vo.py + vo/wordtimes.py)
import fs from 'fs';
import path from 'path';
import vm from 'vm';
import { pathToFileURL } from 'url';
import { chromium } from 'playwright';

const problems = [];
const ctx = { window: {} }; vm.runInNewContext(fs.readFileSync('episode.js', 'utf8'), ctx);
const EP = ctx.window.EPISODE;
if (!EP || EP.stories?.length !== 5) problems.push('episode.js must define window.EPISODE with exactly 5 stories');
for (const [i, s] of (EP?.stories || []).entries()) {
  const n = `story ${i + 1}`;
  if (!['+', '-'].includes(s.sign)) problems.push(`${n}: sign must be '+' or '-'`);
  if (s.lines?.length !== 3) problems.push(`${n}: needs 3 headline lines`);
  s.lines?.forEach(l => l.length > 13 && problems.push(`${n}: headline "${l}" is ${l.length} chars (max 13)`));
  if (s.bullets?.length !== 2) problems.push(`${n}: needs 2 bullets`);
  s.bullets?.forEach(b => b.length > 75 && problems.push(`${n}: bullet is ${b.length} chars (max 75): ${b}`));
  if (s.term?.length !== 3) problems.push(`${n}: term needs [command, output, joke]`);
  s.term?.forEach(t => t.length > 34 && problems.push(`${n}: terminal line "${t}" is ${t.length} chars (max 34)`));
  for (const f of [s.logo, s.logo2, s.mlogo, s.media?.type === 'img' ? s.media.src : null].filter(Boolean))
    if (!fs.existsSync(f)) problems.push(`${n}: missing file ${f}`);
  if (s.media?.type === 'clip' && !fs.existsSync(`clips/${s.media.name}/0001.jpg`)) problems.push(`${n}: missing clip frames clips/${s.media.name}/`);
}
if (fs.existsSync('vo/timeline.json')) {
  const nar = JSON.parse(fs.readFileSync('vo/narration.json', 'utf8'));
  const tl = JSON.parse(fs.readFileSync('vo/timeline.json', 'utf8'));
  for (const ln of nar.lines) {
    const c = tl.clips.find(x => x.id === ln.id);
    if (!c) problems.push(`voice line ${ln.id} has no clip: run vo/gen_vo.py`);
    else if (c.text !== ln.text) problems.push(`voice line ${ln.id} changed since it was recorded: run vo/gen_vo.py ${ln.id}`);
    else if (c.dur > ln.max) problems.push(`voice line ${ln.id} is ${c.dur}s, over its ${ln.max}s window: shorten the text`);
  }
} else problems.push('no vo/timeline.json yet: run vo/gen_vo.py and vo/wordtimes.py');

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
const errs = [];
page.on('pageerror', e => errs.push(e.message));
page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
await page.goto(pathToFileURL(path.resolve('index.html')).href);
await page.waitForFunction(() => window.__ready === true, null, { timeout: 30000 }).catch(() => errs.push('page never became ready'));
await browser.close();
problems.push(...errs.map(e => 'page: ' + e));

if (problems.length) { console.log('PROBLEMS:\n- ' + problems.join('\n- ')); process.exit(1); }
console.log('check ok: 5 stories, text limits, voice windows, media files and word cues all fine');
