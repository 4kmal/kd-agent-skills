// Turns storyboard.json into the voice script and the scene timing the page plays.
//   1st run (before recording): writes vo/narration.json and an estimated plan.js
//   2nd run (after vo/gen_vo.py): lays scenes end to end around the recorded clip lengths,
//   moves each clip's start in vo/timeline.json to its scene, and rewrites plan.js
// usage: node plan.mjs
import fs from 'fs';

const HEAD = 0.45, TAIL = 0.65, MIN = 3.0, WPS = 2.6;
const sb = JSON.parse(fs.readFileSync('storyboard.json', 'utf8'));
const tlPath = 'vo/timeline.json';
const tl = fs.existsSync(tlPath) ? JSON.parse(fs.readFileSync(tlPath, 'utf8')) : null;
const clip = id => tl?.clips.find(c => c.id === id);

let t = 0, recorded = 0;
const scenes = sb.scenes.map(s => {
  const c = clip(s.id), fresh = c && c.text === s.vo;
  if (fresh) recorded++;
  const voDur = fresh ? c.dur : s.vo.split(/\s+/).length / WPS;
  const dur = +Math.max(MIN, HEAD + voDur + TAIL + (s.tail || 0)).toFixed(2);
  const out = { id: s.id, start: +t.toFixed(2), dur, voStart: +(t + HEAD).toFixed(2), voDur: +voDur.toFixed(2) };
  t += dur; return out;
});
const dur = +t.toFixed(2);

fs.mkdirSync('vo', { recursive: true });
fs.writeFileSync('vo/narration.json', JSON.stringify({
  voices: { narrator: sb.voice?.voice || 'am_michael' },
  base_speed: { narrator: sb.voice?.speed || 1.05 },
  lines: sb.scenes.map((s, i) => ({ id: s.id, speaker: 'narrator', start: scenes[i].voStart, max: 30, text: s.vo })),
}, null, 1));
if (tl) {
  for (const c of tl.clips) { const p = scenes.find(s => s.id === c.id); if (p) c.start = p.voStart; }
  fs.writeFileSync(tlPath, JSON.stringify(tl, null, 1));
}
fs.writeFileSync('plan.js', `window.STORYBOARD=${JSON.stringify(sb)};\nwindow.PLAN=${JSON.stringify({ fps: 30, dur, scenes })};\n`);
console.log(`${scenes.length} scenes, ${dur}s total (${recorded}/${scenes.length} with recorded voice${recorded < scenes.length ? '; run vo/gen_vo.py then plan.mjs again' : ''})`);
for (const s of scenes) console.log(`  ${s.id.padEnd(10)} ${s.start.toFixed(2).padStart(6)}s  +${s.dur.toFixed(2)}s  voice ${s.voDur.toFixed(2)}s`);
