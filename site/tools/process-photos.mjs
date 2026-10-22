// Turns the generated PNGs into web JPEGs: <out>.jpg (full width, max 1600) and <out>-800.jpg.
// Run from site/: node tools/process-photos.mjs
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright-core';

const SRC = 'assets/all_generated_architecture_images';
const MAP = {
  '02_A_Court_House/golden_hour_mediterranean_courtyard.png': 'photos/court-house/01-arrival',
  '02_A_Court_House/mediterranean_living_room_courtyard_view.png': 'photos/court-house/02-court',
  '02_A_Court_House/sunlit_mediterranean_kitchen_dining_space.png': 'photos/court-house/03-kitchen',
  '02_A_Court_House/warm_mediterranean_window_detail.png': 'photos/court-house/04-detail',
  '02_A_Court_House/twilight_mediterranean_courtyard_villa.png': 'photos/court-house/05-dusk',
  '03_B_Projects/cantilevered_house_at_golden_hour.png': 'photos/ground/long-reach',
  '03_B_Projects/coastal_gables_under_construction.png': 'photos/ground/sea-lane',
  '03_B_Projects/cotswold_cottage_and_modern_garden_wing.png': 'photos/ground/mill-lane',
  '03_B_Projects/modern_cabin_among_birch_trees.png': 'photos/ground/ashdown-studio',
  '03_B_Projects/sunlit_rustic_barn_living_space.png': 'photos/ground/orchard-barn',
  '03_B_Projects/terraced_woodland_house_overlooking_misty_valley.png': 'photos/ground/hollow-way',
  '03_B_Projects/victorian_brick_house_with_glass_extension.png': 'photos/ground/albert-terrace',
  '02_A_Court_House/golden_hour_mediterranean_courtyard.png#2': 'photos/ground/court-house',
  '05_E_Sustainability/wide_minimalist_interior_scene_with_a_calm_warm.png': 'photos/sustainability',
  '06_F_Studio/wide_airy_sunlit_interior_workspace_studio_sce.png': 'photos/studio-interior',
  '06_F_Studio/wide_detailed_interior_scene_of_a_bright_airy_ar.png': 'photos/studio-workroom',
};

const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
const page = await browser.newPage();
for (const [src, out] of Object.entries(MAP)) {
  const file = path.join(SRC, src.replace(/#\d+$/, ''));
  const data = 'data:image/png;base64,' + fs.readFileSync(file).toString('base64');
  const res = await page.evaluate(async (data) => {
    const im = new Image();
    im.src = data;
    await im.decode();
    const enc = (w) => {
      const h = Math.round(im.height * w / im.width);
      const c = document.createElement('canvas');
      c.width = w; c.height = h;
      const g = c.getContext('2d');
      g.imageSmoothingQuality = 'high';
      g.drawImage(im, 0, 0, w, h);
      return c.toDataURL('image/jpeg', 0.82);
    };
    return { full: enc(Math.min(1600, im.width)), small: enc(Math.min(800, im.width)), w: Math.min(1600, im.width), h: Math.round(im.height * Math.min(1600, im.width) / im.width) };
  }, data);
  const dest = path.join('assets', out);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest + '.jpg', Buffer.from(res.full.split(',')[1], 'base64'));
  fs.writeFileSync(dest + '-800.jpg', Buffer.from(res.small.split(',')[1], 'base64'));
  console.log(out, `${res.w}x${res.h}`, Math.round(fs.statSync(dest + '.jpg').size / 1024) + 'KB');
}
await browser.close();
