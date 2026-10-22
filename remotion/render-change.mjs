// Renders the "same change, three prices" clip for the closing CTA.
// Usage: node render-change.mjs [stills]
import { bundle } from '@remotion/bundler';
import { renderMedia, renderStill, selectComposition } from '@remotion/renderer';
import path from 'node:path';
import fs from 'node:fs';

const out = path.resolve('../site/assets');
const lab = path.resolve('./lab');
fs.mkdirSync(lab, { recursive: true });
const serveUrl = await bundle({ entryPoint: path.resolve('src/index.ts'), enableCaching: false });
const stillsOnly = process.argv[2] === 'stills';
const checks = [0.18, 0.23, 0.3, 0.42, 0.47, 0.62, 0.68, 0.73, 0.82, 1];

for (const [id, name] of [['ChangeDesktop', 'change-desktop'], ['ChangeMobile', 'change-mobile']]) {
  const composition = await selectComposition({ serveUrl, id });
  const last = composition.durationInFrames - 1;
  if (stillsOnly) {
    for (const p of checks) {
      await renderStill({ composition, serveUrl, frame: Math.round(p * last), output: path.join(lab, `${name}-${String(Math.round(p * 100)).padStart(3, '0')}.png`) });
    }
    if (id === 'ChangeDesktop') continue; // desktop checks are enough to judge the drawing
    continue;
  }
  await renderStill({ composition, serveUrl, frame: last, output: path.join(out, `${name}-poster.png`) });
  await renderMedia({
    composition, serveUrl, codec: 'h264', crf: 20, gopSize: 6, pixelFormat: 'yuv420p', muted: true,
    outputLocation: path.join(out, `${name}.mp4`),
  });
  console.log('rendered', name);
}
