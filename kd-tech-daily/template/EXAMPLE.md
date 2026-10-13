# Bundled example: "Agent Skills Special" (WED 14.10.26)

`episode.js` and `vo/narration.json` hold a finished episode about agent skills, so you can render something before writing your own. Brand marks and screenshots are not redistributed here; fetch them first:

```bash
node tools/logo.mjs anthropic vercel supabase
curl -L -o logos/cadu.svg https://cadu.bot/brand/cadu-cloud-blob.svg
node research/capture.mjs agentskills=https://agentskills.io/ skills=https://skills.sh/ supabase=https://supabase.com/docs/guides/ai-tools/ai-skills anatomy=https://skills.wheresryan.sh/anatomy cadu=https://cadu.bot/
```

`words.js` and `lipsync.js` match the bundled narration, so `node snap.mjs 8 16 30` works straight away; record the voice (`vo/gen_vo.py`) before rendering with sound. Pages change over time, so your screenshots may differ from the published video at https://wiki.krackeddevs.com/agent-skills.
