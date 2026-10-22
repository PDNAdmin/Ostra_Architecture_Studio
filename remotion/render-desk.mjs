// Renders the Studio desk film. Usage: node render-desk.mjs [stills]
// Disk is tight: small JPEG frames, and the temporary bundle is deleted afterwards.
import { bundle } from '@remotion/bundler';
import { renderMedia, renderStill, selectComposition } from '@remotion/renderer';
import path from 'node:path';
import fs from 'node:fs';
const site = path.resolve('../site/assets');
const lab = path.resolve('./lab');
fs.mkdirSync(lab, { recursive: true });
const serveUrl = await bundle({ entryPoint: path.resolve('src/index.ts'), enableCaching: false });
try {
  const composition = await selectComposition({ serveUrl, id: 'Desk' });
  const last = composition.durationInFrames - 1;
  if (process.argv[2] === 'stills') {
    for (const p of [0.15, 0.35, 0.55, 0.75, 1]) {
      await renderStill({ composition, serveUrl, frame: Math.round(p * last), imageFormat: 'jpeg', jpegQuality: 70,
        output: path.join(lab, `desk-${String(Math.round(p * 100)).padStart(3, '0')}.jpg`) });
    }
  } else {
    await renderStill({ composition, serveUrl, frame: last, imageFormat: 'jpeg', jpegQuality: 84, output: path.join(site, 'desk-poster.jpg') });
    await renderMedia({ composition, serveUrl, codec: 'h264', crf: 22, gopSize: 6, pixelFormat: 'yuv420p', colorSpace: 'bt709', muted: true,
      imageFormat: 'jpeg', jpegQuality: 80, concurrency: 2, outputLocation: path.join(site, 'desk.mp4') });
    console.log('rendered desk');
  }
} finally {
  fs.rmSync(serveUrl, { recursive: true, force: true });
}
