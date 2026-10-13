/* KD Tech Daily: one episode's content. Edit this file and vo/narration.json; index.html is the engine.
   Rules (checked by `node check.mjs`):
   - exactly 5 stories; sign '+' (good news / launch, green) or '-' (setback, red)
   - lines: 3 headline lines, each <= 13 characters
   - bullets: 2 facts, each <= 75 characters
   - term: [command, output, joke], each <= 34 characters
   - moments fire on spoken words of that story's line (s1..s5): at:'word' or 'word#2' for the 2nd match
   - acts (optional) override Kopi's default moves: { at:'word', until:'word', pose, eyes }
   Moment types: badge {text, color?, pos?:'top'|'bottom', until?}, chips {items[]}, box {x,y,w,h,tag,color?},
                 counter {to, decimals?, prefix?, suffix?, label, red?}, note {cap, big, small, stamp?, stampAt?, until?} */
window.EPISODE = {
  title: 'KD Tech Daily: Agent Skills Special',
  date: { short: 'WED 14.10.26', chip: 'WED 14.10.2026 // AGENT SKILLS SPECIAL', screen: 'WED 14.10.26 // LIVE', ticker: 'WED 14 OCT 2026' },
  outfit: 'varsity',   // rotation: hoodie -> batik -> bomber -> varsity -> raid
  promptCmd: './kd-tech-daily --special agent-skills',
  sources: 'src: agentskills.io, github.com/vercel-labs/skills, supabase.com/docs, skills.wheresryan.sh, cadu.bot.<br>images: screenshots of each official site. Logos are trademarks of their owners; no endorsement implied.',
  stories: [
    { sign: '+', tag: 'STANDARD', short: 'OPEN STANDARD', lines: ['AGENT SKILLS', 'GO OPEN', 'STANDARD'], mood: 'star',
      bullets: ['a skill is a folder: SKILL.md plus optional scripts, references, assets',
                'format first built by Anthropic, now an open spec at agentskills.io'],
      term: ['ls my-skill/', 'SKILL.md  scripts/  references/', 'markdown, but make it a superpower'],
      sticker: 'OPEN SPEC', logo: 'logos/anthropic.svg', media: { type: 'img', src: 'img/agentskills.jpg' }, credit: 'IMAGE: AGENTSKILLS.IO', label: 'AGENTSKILLS.IO',
      moments: [
        { type: 'badge', text: 'SKILL.MD + SCRIPTS + REFERENCES', at: 'folder', until: 'growing', color: '#1f6f43' },
        { type: 'badge', text: 'ADOPTED BY A GROWING LIST OF AGENTS', at: 'growing', color: '#1f6f43' },
      ] },
    { sign: '+', tag: 'TOOLING', short: 'NPX SKILLS ADD', lines: ['ONE COMMAND', 'INSTALLS ANY', 'SKILL'], mood: 'happy',
      bullets: ['npx skills add owner/repo pulls skills straight from a GitHub repo',
                'Vercel Labs CLI: OpenCode, Claude Code, Codex, Cursor and 75 more'],
      term: ['npx skills add owner/repo', 'added 2 skills to .claude/skills', 'copy, paste, superpowers'],
      sticker: '79 AGENTS', logo: 'logos/vercel.svg', media: { type: 'img', src: 'img/skills.jpg' }, credit: 'IMAGE: SKILLS.SH', label: 'SKILLS.SH DIRECTORY',
      moments: [
        { type: 'chips', items: ['OpenCode', 'Claude Code', 'Codex', 'Cursor', '+75 MORE'], at: 'supports' },
        { type: 'badge', text: 'ONE LINE: NPX SKILLS ADD', at: 'runs', until: 'supports', color: '#111' },
      ] },
    { sign: '+', tag: 'DATABASE', short: 'SUPABASE SKILLS', lines: ['SUPABASE', 'SHIPS AGENT', 'SKILLS'], mood: 'happy',
      bullets: ['supabase: auth, storage, edge functions, realtime, RLS, CLI and MCP',
                'postgres best practices: schema, indexes, RLS, queues, pgvector'],
      term: ['skills add supabase/agent-skills', 'found 2: supabase, postgres-best..', 'RLS policies, now with backup'],
      sticker: '2 SKILLS', logo: 'logos/supabase.svg', media: { type: 'img', src: 'img/supabase.jpg' }, credit: 'IMAGE: SUPABASE DOCS', label: 'SUPABASE AGENT SKILLS',
      moments: [
        { type: 'chips', items: ['AUTH', 'STORAGE', 'EDGE FUNCTIONS', 'REALTIME', 'RLS'], at: 'auth' },
        { type: 'badge', text: 'POSTGRES BEST PRACTICES', at: 'postgres', color: '#3ecf8e', ink: '#07090c' },
      ] },
    { sign: '+', tag: 'VISUALS', short: 'ANATOMY SKILL', lines: ['ANATOMY', 'DRAWS IDEAS', 'AS MACHINES'], mood: 'star',
      bullets: ['describe an idea; it invents a physical machine that works the same way',
                'live isometric SVG figures with four-tone shading; MIT licensed'],
      term: ['/anatomy explain an LRU cache', 'figure: a bookcase, interactive', 'diagrams that actually move'],
      sticker: 'ISOMETRIC', logo: 'logos/cube.svg', media: { type: 'img', src: 'img/anatomy.jpg' }, credit: 'IMAGE: SKILLS.WHERESRYAN.SH', label: 'ANATOMY BY RYAN',
      moments: [
        { type: 'note', cap: 'ANATOMY // EXAMPLE', big: 'QUEUE', small: 'becomes a marble run', stamp: 'LIVE SVG', at: 'message', stampAt: 'marble' },
      ] },
    { sign: '+', tag: 'MOBILE', short: 'CADU FOR IPHONE', lines: ['CADU PUTS', 'HERMES ON', 'YOUR IPHONE'], mood: 'happy',
      bullets: ['connect your self-hosted Hermes agent with a QR code or link',
                'chat, manage files, follow activity; Hermes keeps running on your server'],
      term: ['cadu connect --qr', 'paired: hermes@home-server', 'your agent, now in your pocket'],
      sticker: 'TESTFLIGHT', logo: 'logos/cadu.svg', media: { type: 'img', src: 'img/cadu.jpg' }, credit: 'IMAGE: CADU.BOT', label: 'CADU // HERMES FOR IPHONE',
      moments: [
        { type: 'chips', items: ['CHAT', 'FILES', 'ACTIVITY', 'QR CONNECT'], at: 'scan' },
        { type: 'badge', text: 'BETA ON TESTFLIGHT', at: 'testflight', color: '#0a84ff' },
      ] },
  ],
};
