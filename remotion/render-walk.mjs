// Renders the case-study walkthrough (3D sketch).
// Usage: node render-walk.mjs [stills]
//   full run: exports/ostra-walkthrough-master.mp4 (high quality, for AI video conversion)
//             site/assets/walk.mp4 (dense keyframes for scroll scrubbing) and walk-poster.jpg
// Uses ANGLE for WebGL. Deletes its temporary bundle afterwards (the disk is tight).
import { bundle } from '@remotion/bundler';
import { renderMedia, renderStill, selectComposition } from '@remotion/renderer';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';

const site = path.resolve('../site/assets');
const exportsDir = path.resolve('../exports');
const lab = path.resolve('./lab');
fs.mkdirSync(lab, { recursive: true });
fs.mkdirSync(exportsDir, { recursive: true });
const ffmpeg = path.resolve('node_modules/@remotion/compositor-win32-x64-msvc/ffmpeg.exe');
const stills = process.argv[2] === 'stills';
const serveUrl = await bundle({ entryPoint: path.resolve('src/index.ts'), enableCaching: false });
const chromiumOptions = { gl: 'angle' };

try {
  const composition = await selectComposition({ serveUrl, id: 'WalkSketch', chromiumOptions });
  const last = composition.durationInFrames - 1;
  if (stills) {
    for (const p of [0, 0.25, 0.37, 0.5, 0.62, 0.72, 0.85, 1]) {
      await renderStill({ composition, serveUrl, chromiumOptions, frame: Math.round(p * last), imageFormat: 'jpeg', jpegQuality: 82,
        output: path.join(lab, `sketch-${String(Math.round(p * 100)).padStart(3, '0')}.jpg`) });
    }
  } else {
    const master = path.join(exportsDir, 'ostra-walkthrough-master.mp4');
    await renderMedia({
      composition, serveUrl, chromiumOptions, codec: 'h264', crf: 15, pixelFormat: 'yuv420p', colorSpace: 'bt709', muted: true,
      imageFormat: 'jpeg', jpegQuality: 92, concurrency: 2, outputLocation: master,
    });
    // site copy: keyframe every 6 frames so scrubbing seeks fast
    execFileSync(ffmpeg, ['-y', '-loglevel', 'error', '-i', master, '-c:v', 'libx264', '-crf', '23', '-g', '6', '-pix_fmt', 'yuv420p',
      '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-color_range', 'tv', '-movflags', '+faststart', '-an',
      path.join(site, 'walk.mp4')]);
    await renderStill({ composition, serveUrl, chromiumOptions, frame: Math.round(0.5 * last), imageFormat: 'jpeg', jpegQuality: 86,
      output: path.join(site, 'walk-poster.jpg') });
    console.log('rendered master and site copy');
  }
} finally {
  fs.rmSync(serveUrl, { recursive: true, force: true });
}
