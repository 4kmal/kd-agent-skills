// Pre-render check: storyboard fields per scene type, image files, voice recorded for the current text,
// plan.js up to date, and every word cue (WT miss) the page could not find in the narration.
// usage: node check.mjs            (run after vo/gen_vo.py, node plan.mjs and vo/wordtimes.py)
import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';
import { chromium } from 'playwright';

const NEEDS = {
  cover: ['issue', 'title', 'titleAt', 'kicker', 'kickerAt', 'stamp', 'stampAt'],
  explain: ['headline', 'folder', 'folderAt', 'cards', 'annotation', 'annotationAt'],
  terminal: ['headline', 'subhead', 'command', 'commandAt', 'output', 'circle', 'circleAt', 'note', 'noteAt'],
  cutouts: ['headline', 'items'],
  ransom: ['bubble', 'strikeAt', 'lines', 'linesAt', 'strip', 'stripAt', 'frames'],
  signoff: ['headline', 'url', 'urlAt', 'footer', 'footerAt'],
};
const problems = [];
const sb = JSON.parse(fs.readFileSync('storyboard.json', 'utf8'));
for (const k of ['title', 'masthead', 'report', 'dateLine', 'dateShort']) if (!sb[k]) problems.push(`storyboard: missing "${k}"`);
const ids = new Set();
for (const s of sb.scenes) {
  if (ids.has(s.id)) problems.push(`scene id "${s.id}" is used twice`); ids.add(s.id);
  if (!NEEDS[s.type]) { problems.push(`${s.id}: unknown type "${s.type}" (use ${Object.keys(NEEDS).join(', ')})`); continue; }
  for (const f of NEEDS[s.type]) if (s[f] === undefined) problems.push(`${s.id}: ${s.type} needs "${f}"`);
  if (!s.vo) problems.push(`${s.id}: needs a "vo" line`);
  if (s.type === 'explain' && s.cards?.length !== 3) problems.push(`${s.id}: explain takes exactly 3 cards`);
  if (s.type === 'cutouts') { if (s.items?.length !== 3) problems.push(`${s.id}: cutouts takes exactly 3 items`); s.items?.forEach(it => fs.existsSync(it.img) || problems.push(`${s.id}: missing image ${it.img}`)); }
  if (s.type === 'ransom' && s.frames?.length !== 3) problems.push(`${s.id}: ransom takes exactly 3 storyboard frames`);
  if (s.type === 'terminal' && s.command && s.circle && !s.command.includes(s.circle)) problems.push(`${s.id}: circle "${s.circle}" is not part of the command`);
  if (s.type === 'terminal' && s.command?.length > 30) problems.push(`${s.id}: command is ${s.command.length} chars (max 30 to fit the terminal)`);
}
if (fs.existsSync('vo/timeline.json')) {
  const tl = JSON.parse(fs.readFileSync('vo/timeline.json', 'utf8'));
  for (const s of sb.scenes) { const c = tl.clips.find(x => x.id === s.id); if (!c || c.text !== s.vo) problems.push(`${s.id}: voice not recorded for the current text (vo/gen_vo.py ${s.id}, then node plan.mjs)`); }
} else problems.push('no vo/timeline.json yet: node plan.mjs, then vo/gen_vo.py, node plan.mjs, vo/wordtimes.py');
if (!fs.existsSync('plan.js') || fs.statSync('plan.js').mtimeMs < fs.statSync('storyboard.json').mtimeMs) problems.push('plan.js is older than storyboard.json: run node plan.mjs');

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
const errs = [];
page.on('pageerror', e => errs.push(e.message));
page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
await page.goto(pathToFileURL(path.resolve('index.html')).href);
await page.waitForFunction(() => window.__ready === true, null, { timeout: 30000 }).catch(() => errs.push('page never became ready'));
await browser.close();
problems.push(...errs.map(e => 'page: ' + e));

if (problems.length) { console.log('PROBLEMS:\n- ' + problems.join('\n- ')); process.exit(1); }
console.log(`check ok: ${sb.scenes.length} scenes, voice recorded, images present, word cues all found`);
