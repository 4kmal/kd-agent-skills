// Screenshot official pages as 1600x900 JPEG stills for the media panel -> img/<name>.jpg
// usage: node research/capture.mjs <name>=<url> [<name>=<url> ...] [--scroll=<px>] [--dark]
// Use the company's own page (docs, blog, product site) and credit it on screen ("IMAGE: SUPABASE DOCS").
// Pages are loaded headless with no sign-in; cookie banners are left as they are, so pick a clean viewport.
import fs from 'fs';
import { chromium } from 'playwright';
const args = process.argv.slice(2);
const scroll = Number((args.find(a => a.startsWith('--scroll=')) || '--scroll=0').slice(9));
const dark = args.includes('--dark');
fs.mkdirSync('img', { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1600, height: 900 }, deviceScaleFactor: 1, colorScheme: dark ? 'dark' : 'light' });
for (const pair of args.filter(a => !a.startsWith('--'))) {
  const i = pair.indexOf('='); const name = pair.slice(0, i), url = pair.slice(i + 1);
  if (!/^https:\/\//.test(url)) { console.error(`skip ${name}: only https URLs`); continue; }
  await page.goto(url, { waitUntil: 'networkidle', timeout: 45000 }).catch(e => console.error(`${name}: ${e.message}`));
  await page.waitForTimeout(1200);
  if (scroll) await page.evaluate(y => window.scrollTo(0, y), scroll);
  await page.waitForTimeout(400);
  await page.screenshot({ path: `img/${name}.jpg`, type: 'jpeg', quality: 90 });
  console.log(`img/${name}.jpg  <- ${url}`);
}
await browser.close();
