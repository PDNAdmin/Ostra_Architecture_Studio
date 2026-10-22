// Writes work.html from js/projects.js, reusing the masthead and footer from index.html.
// Run from site/: node tools/build-work.mjs
import fs from 'node:fs';
import { PROJECTS_DATA, TYPE_LABEL } from '../js/projects.js';

const idx = fs.readFileSync('index.html', 'utf8');
const cut = (a, b) => { const i = idx.indexOf(a), j = idx.indexOf(b, i); if (i < 0 || j < 0) throw new Error('anchor ' + a); return idx.slice(i, j); };
const header = cut('  <a class="skip"', '  <main id="main">');
const footer = cut('  <!-- Footer: the site', '  <script src="vendor/gsap.min.js"></script>');
const icon = (idx.match(/<link rel="icon"[^>]*>/) || [''])[0];
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

const FILTERS = [
  ['all', 'All', () => true],
  ['new-build', 'New builds', (p) => p.type === 'new-build'],
  ['remodel', 'Remodels', (p) => p.type === 'remodel'],
  ['extension', 'Extensions', (p) => p.type === 'extension'],
  ['progress', 'In progress', (p) => p.status === 'progress'],
];
const ph = (t) => t.replace(/\[([^\]]+)\]/g, '<span class="ph">[$1]</span>');

const card = (p, i) => {
  const href = p.href || `case-${p.slug}.html`;
  const status = p.status === 'progress' ? `On site · handover ${p.year}` : `Completed ${p.year}`;
  const alt = `Axonometric drawing of ${p.name}: ${p.idea.charAt(0).toLowerCase()}${p.idea.slice(1, -1)}. The key idea is marked in orange.`;
  return `          <li class="wx-card" data-type="${p.type}" data-status="${p.status}" data-index="${i}">
            <a class="wx-card__link" href="${href}">
              <figure class="wx-card__media${p.photo ? ' has-photo' : ''}"${p.focus ? ` style="--fx:${p.focus[0]}%;--fy:${p.focus[1]}%"` : ''}>
                <svg class="wx-card__drawing" data-drawing="${p.drawing}" role="img" aria-label="${esc(alt)}"></svg>
                ${p.photo ? `<img class="wx-card__photo" src="${p.photo}.jpg" srcset="${p.photo}-800.jpg 800w, ${p.photo}.jpg 1448w" sizes="(max-width: 960px) 92vw, 50vw" width="1448" height="1086" alt="${esc(p.status === 'progress' ? 'Visualisation of ' : '')}${esc(p.name)}, ${esc(p.place)}, seen from above with its garden." loading="lazy" decoding="async">
                <span class="wx-card__pin" aria-hidden="true">Key idea</span>
                <span class="wx-card__snap" data-snap><span class="wx-card__paper"><img src="assets/photos/ground/${p.slug}-800.jpg" width="800" height="533" alt="" loading="lazy" decoding="async"><span class="wx-card__snapcap">From the ground</span></span></span>` : ''}
                ${p.status === 'progress' ? '<span class="wx-card__flag">In progress · Visualisation</span>' : ''}
              </figure>
              <div class="wx-card__block">
                <span class="wx-col wx-col--job">${p.job}</span>
                <h2 class="wx-col wx-col--name">${esc(p.name)}</h2>
                <span class="wx-col wx-col--place">${esc(p.place)}</span>
                <span class="wx-col wx-col--type">${TYPE_LABEL[p.type]}</span>
                <span class="wx-col wx-col--size">${esc(p.size)}</span>
                <span class="wx-col wx-col--year">${status}</span>
                <p class="wx-card__idea"><b>Key idea</b>${esc(p.idea)}</p>
                <span class="wx-card__go">${p.href ? 'Read the case study' : 'View project'}<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M2 8h11M9 4l4 4-4 4" /></svg></span>
              </div>
            </a>
          </li>`;
};

// One template for the Work index and the work-by-type pages. o.only narrows the projects; o.extra adds blocks.
const page = (o) => {
  const list = PROJECTS_DATA.filter(o.only || (() => true));
  const count = (f) => list.filter(f).length;
  const years = list.map((p) => +p.year);
  // on a type page, only the chips that still split the list make sense
  const filters = FILTERS.filter(([k, , f]) => k === 'all' || !o.only || (count(f) > 0 && count(f) < list.length));
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>${o.title}</title>
  <meta name="description" content="${o.desc}">
  <link rel="canonical" href="${o.file}">
  <meta name="theme-color" content="#EFE9DD">
  ${icon}
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600&family=Geist+Mono:wght@400;500&family=Space+Grotesk:wght@500;700&display=swap">
  <link rel="stylesheet" href="vendor/lenis.css">
  <link rel="stylesheet" href="css/tokens.css">
  <link rel="stylesheet" href="css/hero.css">
  <link rel="stylesheet" href="css/work.css">
  <link rel="stylesheet" href="css/foot.css">
  <link rel="stylesheet" href="css/work-page.css">
</head>
<body>
${header}  <main id="main" class="wx">
    <section class="wx-top" aria-labelledby="wx-title">
      <div class="wx-top__inner">
        <nav class="crumbs" aria-label="Breadcrumb"><ol><li><a href="index.html">Home</a></li>${o.crumb ? `<li><a href="work.html">Work</a></li><li aria-current="page">${o.crumb}</li>` : '<li aria-current="page">Work</li>'}</ol></nav>
        <h1 id="wx-title" class="wx-title" data-wx-title>
${o.h1.map((l) => `          <span class="line"><span>${l}</span></span>`).join('\n')}
        </h1>
        <div class="wx-top__side">
          <p class="wx-lede">${o.lede}</p>
          <p class="wx-tally"><b>${list.length}</b> projects · <b>${Math.min(...years)}–${Math.max(...years)}</b> · Orange marks each house's key idea</p>
        </div>
      </div>
    </section>

    <div class="wx-bar" data-wx-bar>
      <div class="wx-bar__inner">
        <div class="wx-filter" role="group" aria-labelledby="wx-show">
          <span id="wx-show" class="wx-filter__label">Show me</span>
${filters.map(([key, label, f]) => `          <button type="button" class="wx-chip" data-filter="${key}" aria-pressed="${key === 'all'}">${label}<span class="wx-chip__n">${count(f)}</span></button>`).join('\n')}
        </div>
        <div class="wx-view" role="group" aria-label="View">
          <button type="button" class="wx-view__btn" data-view="sheets" aria-pressed="true">Sheets</button>
          <button type="button" class="wx-view__btn" data-view="index" aria-pressed="false">Index</button>
        </div>
      </div>
    </div>

    <section class="wx-body" aria-label="Projects">
      <div class="wx-body__inner">
        <div class="wx-head" aria-hidden="true">
          <span class="wx-col--job">Job</span><span class="wx-col--name">Project</span><span class="wx-col--place">Location</span>
          <span class="wx-col--type">Type</span><span class="wx-col--size">Size</span><span class="wx-col--year">Status</span>
        </div>
        <ol class="wx-list" data-wx-list>
${list.map(card).join('\n')}
        </ol>
        <p class="wx-empty" data-wx-empty hidden>No projects match yet. <a href="?show=all" data-clear>Clear the filter</a>, or <a href="contact.html">tell us what you're planning</a> and we'll show you the closest work.</p>
      </div>
    </section>

${o.extra || ''}    <section class="wx-end" aria-labelledby="wx-end-title">
      <div class="wx-end__inner">
        <h2 id="wx-end-title" class="wx-end__title">${o.end}</h2>
        <a class="btn btn-primary" href="contact.html" data-magnetic>Book a consultation</a>
      </div>
    </section>
  </main>

${footer}  <script src="vendor/gsap.min.js"></script>
  <script src="vendor/ScrollTrigger.min.js"></script>
  <script src="vendor/Flip.min.js"></script>
  <script src="vendor/lenis.min.js"></script>
  <script type="module" src="js/work-page.js"></script>
  <script type="module" src="js/foot.js"></script>
</body>
</html>
`;
};

fs.writeFileSync('work.html', page({
  file: 'work.html',
  title: 'Our work: custom homes and remodels | Ostra Studio',
  desc: 'Browse custom homes, remodels and extensions by Ostra Studio, with budgets and lessons from each project.',
  h1: ["Homes we've designed", 'and built.'],
  lede: "Browse by project type or location. Every project links to the full story, including the budget range and what we'd do differently.",
  end: 'Planning something similar?',
}));
console.log('wrote work.html,', PROJECTS_DATA.length, 'projects');

// Work by type. Copy deck rule: a type gets its own page only once it holds three or more projects,
// so Remodels and Extensions stay as filters on work.html for now.
const TYPES = [
  {
    type: 'new-build', file: 'work-new-builds.html', crumb: 'New builds', end: 'Planning a new build?',
    title: 'New build homes by Ostra Studio',
    desc: 'New homes designed from scratch by Ostra Studio. See the projects and what shaped each one.',
    h1: ['New homes,', 'drawn from scratch.'],
    lede: 'Building on an empty plot means every decision is yours, and every decision has a cost. These are the new builds we designed, with the choices that shaped each one.',
    expect: [
      ['The first conversation', 'Your plot, your brief and your budget, and a frank view of what they add up to.'],
      ['The design', 'Sketches, then full drawings and the planning application. Usually 3 to 6 months.'],
      ['The build', 'Site visits, contractor oversight and a report every Friday until handover. Usually 9 to 14 months.'],
    ],
  },
];
for (const t of TYPES) {
  const n = PROJECTS_DATA.filter((p) => p.type === t.type).length;
  if (n < 3) { console.log('skipped', t.file, '(fewer than three projects)'); continue; }
  const extra = `    <section class="wx-type" aria-label="What to expect">
      <div class="wx-type__inner">
        <div class="wx-type__expect">
          <h2 class="wx-type__h">What to expect</h2>
          <ol>${t.expect.map(([h, d], i) => `<li><span>0${i + 1}</span><b>${h}</b><p>${ph(d)}</p></li>`).join('')}</ol>
        </div>
        <div class="wx-type__budget">
          <h2 class="wx-type__h">Typical budget</h2>
          <p class="wx-type__range">Most of our new homes cost £550,000 to £850,000 to build, before fees. Garden studios start at about £60,000.</p>
          <p>A range helps the right inquiries arrive, and saves everyone else a call.</p>
        </div>
      </div>
    </section>

`;
  fs.writeFileSync(t.file, page({ ...t, only: (p) => p.type === t.type, extra }));
  console.log('wrote', t.file + ',', n, 'projects');
}
