// Renders the ink-house clips for the hero.
// Usage: node render.mjs [stills]   (stills = only render check frames)
import { bundle } from '@remotion/bundler';
import { renderMedia, renderStill, selectComposition } from '@remotion/renderer';
import path from 'node:path';
import fs from 'node:fs';

const out = path.resolve('../site/assets');
const lab = path.resolve('./lab');
fs.mkdirSync(out, { recursive: true });
fs.mkdirSync(lab, { recursive: true });

const serveUrl = await bundle({ entryPoint: path.resolve('src/index.ts'), enableCaching: false });
const stillsOnly = process.argv[2] === 'stills';

for (const [id, name] of [['InkDesktop', 'ink-desktop'], ['InkMobile', 'ink-mobile']]) {
  const composition = await selectComposition({ serveUrl, id });
  // Check frames at intro end and the final frame. The final frame is also the poster.
  for (const f of [40, 92, 149]) {
    await renderStill({ composition, serveUrl, frame: f, output: path.join(lab, `${name}-${f}.png`) });
  }
  if (stillsOnly) continue;
  await renderStill({ composition, serveUrl, frame: 149, output: path.join(out, `${name}-poster.png`) });
  await renderMedia({
    composition, serveUrl, codec: 'h264', crf: 20, gopSize: 6, // short GOP so seeking stays fast
    pixelFormat: 'yuv420p', muted: true,
    outputLocation: path.join(out, `${name}.mp4`),
  });
  console.log('rendered', name);
}
