# KD Agent Skills

Agent Skills from [KrackedDevs](https://wiki.krackeddevs.com/agent-skills) for Claude Code, Codex, Cursor, OpenCode and any agent that reads the [Agent Skills](https://agentskills.io) format.

| Skill | What it makes | Install |
|---|---|---|
| [`kd-tech-daily`](kd-tech-daily/SKILL.md) | An 83-second tech news episode anchored by Kopi, a pixel-anime news anchor with lip-sync. 16:9 and 9:16, local voice, original music, captions. | `npx skills add 4kmal/kd-agent-skills --skill kd-tech-daily` |
| [`paper-collage-news`](paper-collage-news/SKILL.md) | A Vox-style paper-collage news explainer (9:16) with torn paper, ransom letters, tape, marker scribbles and stop-motion boil. | `npx skills add 4kmal/kd-agent-skills --skill paper-collage-news` |

Add `-g -a claude-code` to install globally for Claude Code only, or copy a skill folder into `~/.claude/skills/`.

Both skills render HTML/GSAP pages frame by frame with Playwright and encode with ffmpeg. The voice is the open-source [Kokoro](https://github.com/thewh1teagle/kokoro-onnx) model running locally, and all music and sound effects are synthesized in Python, so nothing needs an API key. See each skill's `references/setup.md`.

Example output for both skills (an "Agent Skills" tech news report) is on the [Agent Skills page of the KD wiki](https://wiki.krackeddevs.com/agent-skills).

## License

MIT for the code and documentation in this repository. Kopi, the KD logo and the "KD Tech Daily" name are KrackedDevs branding: rebrand before publishing your own show. Third-party logos and screenshots you fetch remain their owners' property.
