// Cuts the team portraits out of their orange backdrop.
// The subjects are pure greyscale, so any chroma (red minus blue) is backdrop: alpha = 1 - chroma / backdrop chroma,
// and the grey value is recovered by un-mixing the backdrop colour. Writes assets/team/team-0N.webp (with alpha).
// Run from site/: node tools/key-team.mjs
import fs from 'node:fs';
import { chromium } from 'playwright-core';

const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
const page = await browser.newPage();
for (let n = 1; n <= 6; n++) {
  const src = `assets/team/team-0${n}.png`;
  const data = 'data:image/png;base64,' + fs.readFileSync(src).toString('base64');
  const out = await page.evaluate(async (data) => {
    const im = new Image();
    im.src = data;
    await im.decode();
    const W = 1000, H = Math.round(im.height * W / im.width);
    const c = document.createElement('canvas');
    c.width = W; c.height = H;
    const g = c.getContext('2d');
    g.drawImage(im, 0, 0, W, H);
    const d = g.getImageData(0, 0, W, H), p = d.data;
    // backdrop colour: median of the two top corners
    const rs = [], gs = [], bs = [];
    for (const [x0, y0] of [[8, 8], [W - 48, 8]]) for (let y = y0; y < y0 + 40; y++) for (let x = x0; x < x0 + 40; x++) {
      const i = (y * W + x) * 4; rs.push(p[i]); gs.push(p[i + 1]); bs.push(p[i + 2]);
    }
    const med = (a) => a.sort((m, n) => m - n)[a.length >> 1];
    const bg = [med(rs), med(gs), med(bs)], cb = bg[0] - bg[2];
    for (let i = 0; i < p.length; i += 4) {
      const r = p[i], gg = p[i + 1], b = p[i + 2];
      let a = 1 - (r - b) / cb;
      a = Math.min(1, Math.max(0, (a - 0.08) / 0.84));
      let v = 0;
      if (a > 0.01) {
        const k = 1 - a;
        v = ((r - k * bg[0]) + (gg - k * bg[1]) + (b - k * bg[2])) / (3 * a);
      }
      v = Math.min(255, Math.max(0, v));
      p[i] = p[i + 1] = p[i + 2] = v; p[i + 3] = Math.round(a * 255);
    }
    g.putImageData(d, 0, 0);
    return { url: c.toDataURL('image/webp', 0.86), bg, W, H };
  }, data);
  fs.writeFileSync(`assets/team/team-0${n}.webp`, Buffer.from(out.url.split(',')[1], 'base64'));
  console.log(n, out.bg.join(','), `${out.W}x${out.H}`, Math.round(fs.statSync(`assets/team/team-0${n}.webp`).size / 1024) + 'KB');
}
await browser.close();
