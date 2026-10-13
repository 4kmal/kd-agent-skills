// Official brand marks from the simple-icons package, recoloured for the dark set -> logos/<slug>.svg
// usage: node tools/logo.mjs supabase vercel anthropic [--color=#ffffff]
// Find slugs at https://simpleicons.org. Logos are trademarks of their owners: credit them in the sources line.
import fs from 'fs';
const args = process.argv.slice(2);
const color = (args.find(a => a.startsWith('--color=')) || '--color=#ffffff').slice(8);
fs.mkdirSync('logos', { recursive: true });
for (const slug of args.filter(a => !a.startsWith('--'))) {
  const src = `node_modules/simple-icons/icons/${slug}.svg`;
  if (!fs.existsSync(src)) { console.error(`no simple-icons logo "${slug}"`); process.exitCode = 1; continue; }
  const svg = fs.readFileSync(src, 'utf8').replace('<svg ', `<svg fill="${color}" `);
  fs.writeFileSync(`logos/${slug}.svg`, svg);
  console.log(`logos/${slug}.svg`);
}
