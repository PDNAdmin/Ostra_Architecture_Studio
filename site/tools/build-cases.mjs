// Writes case-<slug>.html for every project except Court House (case-study.html, which has the walkthrough film
// and the photo gallery). Same order as the copy deck's case study template. Run from site/: node tools/build-cases.mjs
import fs from 'node:fs';
import { head, header, tail, ph, write } from './lib.mjs';
import { PROJECTS_DATA, TYPE_LABEL } from '../js/projects.js';
import { PROJECT_STORY } from './story.mjs';

const TYPE_PAGE = { 'new-build': ['New builds', 'work-new-builds.html'], remodel: ['Remodels', 'work.html?show=remodel'], extension: ['Extensions', 'work.html?show=extension'] };
// Alt text pattern from the copy deck: [Room or view] of [Project name], [one concrete detail].
const GROUND_ALT = {
  'long-reach': 'The meadow side of Long Reach, its dark timber upper floor reaching out over the glazed ground floor.',
  'mill-lane': 'The garden of Mill Lane, with the low timber and glass wing beside the old stone cottage.',
  'albert-terrace': 'The garden of 14 Albert Terrace, looking into the glass extension at the back of the brick terrace.',
  'orchard-barn': 'The long room of Orchard Barn, under the old oak roof frame, with glazed doors to the orchard.',
  'ashdown-studio': 'Ashdown Studio among silver birches, its north roof lights along the ridge and an orange door.',
  'hollow-way': 'Hollow Way stepping down the hillside in three levels of dark stone and timber, above the valley.',
  'sea-lane': 'Sea Lane on site: two timber gables facing the sea, one still in scaffolding.',
};
// split a sentence into two balanced title lines
const twoLines = (s) => {
  const w = s.split(' ');
  let best = 1, diff = Infinity;
  for (let i = 1; i < w.length; i++) {
    const d = Math.abs(w.slice(0, i).join(' ').length - w.slice(i).join(' ').length);
    if (d < diff) { diff = d; best = i; }
  }
  return [w.slice(0, best).join(' '), w.slice(best).join(' ')];
};

const list = PROJECTS_DATA;
list.forEach((p, i) => {
  if (p.href) return; // Court House has its own page
  const next = list[(i + 1) % list.length];
  const nextHref = next.href || `case-${next.slug}.html`;
  const progress = p.status === 'progress';
  const s = PROJECT_STORY[p.slug];
  const result = p.idea.charAt(0).toLowerCase() + p.idea.slice(1);
  const [l1, l2] = twoLines(result);
  const [typeName, typeHref] = TYPE_PAGE[p.type];
  const html = head({
    title: `${p.name} | Ostra Studio`,
    desc: `${p.name}, ${p.place}: ${result} See how it was designed${progress ? ' and how the build is going' : ' and built'}.`,
    css: ['css/work.css', 'css/case.css', 'css/case-page.css'],
  }) + header + `  <main id="main" class="case cp">
    <section class="case-top" aria-labelledby="case-title">
      <div class="case-top__inner">
        <nav class="crumbs" aria-label="Breadcrumb"><ol><li><a href="index.html">Home</a></li><li><a href="work.html">Work</a></li><li><a href="${typeHref}">${typeName}</a></li><li aria-current="page">${p.name}</li></ol></nav>
        <h1 id="case-title" class="case-title" data-pg-title>
          <span class="line"><span>${p.name}:</span></span>
          <span class="line"><span>${l1}</span></span>
          <span class="line"><span>${l2}</span></span>
        </h1>
        <dl class="facts" data-pg-side>
          <div><dt>Location</dt><dd>${p.place}</dd></div>
          <div><dt>Type</dt><dd>${TYPE_LABEL[p.type]}</dd></div>
          <div><dt>Size</dt><dd>${p.size}</dd></div>
          <div><dt>${progress ? 'Handover' : 'Year'}</dt><dd>${p.year}</dd></div>
          <div><dt>Budget</dt><dd>${s.budget}</dd></div>
          <div><dt>Role</dt><dd>${s.role}</dd></div>
        </dl>
      </div>
      <figure class="case-drawing cp-drawing" data-cp-drawing>
        <div class="case-drawing__frame cp-drawing__frame">
          <svg class="cp-drawing__svg" data-drawing="${p.drawing}" role="img" aria-label="Axonometric drawing of ${p.name}: ${result.slice(0, -1)}. The key idea is marked in orange."></svg>
          <img class="case-drawing__render" data-cp-render style="--fx:${p.focus[0]}%;--fy:${p.focus[1]}%" src="${p.photo}.jpg" srcset="${p.photo}-800.jpg 800w, ${p.photo}.jpg 1448w" sizes="92vw" width="1448" height="1086" alt="${p.name} from above, with its garden." decoding="async">
        </div>
        <figcaption>Drawn, then ${progress ? 'being built' : 'built'}: axonometric and render, illustrative</figcaption>
      </figure>
    </section>

    <!-- From the ground: the eye-level view opens out from a slot, like a door being opened onto the house. -->
    <section class="cp-ground" aria-label="${p.name} from the ground">
      <figure class="cp-ground__fig" data-cp-ground>
        <div class="cp-ground__frame"><img src="assets/photos/ground/${p.slug}.jpg" srcset="assets/photos/ground/${p.slug}-800.jpg 800w, assets/photos/ground/${p.slug}.jpg 1536w" sizes="100vw" width="1536" height="1024" alt="${GROUND_ALT[p.slug]}" loading="lazy" decoding="async"></div>
        <figcaption><span>From the ground</span><span>${progress ? 'On site now · ' : ''}Visualisation, illustrative</span></figcaption>
      </figure>
    </section>

    <section class="story" aria-label="Project story">
      <div class="story__inner">
        <div class="story__row" data-reveal>
          <h2 class="story__label">The brief</h2>
          <p class="story__lead">${s.client} came to us with ${s.site} that ${s.problem}.</p>
        </div>
        <div class="story__row" data-reveal>
          <h2 class="story__label">The challenge</h2>
          <p>${s.challenge}</p>
        </div>
        <div class="story__row story__row--did" data-reveal>
          <h2 class="story__label">What we did</h2>
          <ol class="did">
            <li><h3>Design</h3><p>${s.design}</p></li>
            <li><h3>Materials</h3><p>${s.materials}</p></li>
            <li><h3>Build</h3><p>${s.build}</p></li>
          </ol>
        </div>
        <div class="story__row" data-reveal>
          <h2 class="story__label">${progress ? 'So far' : 'The result'}</h2>
          <dl class="result">
            <div><dt>${progress ? 'Handover' : 'First sketch to handover'}</dt><dd>${s.months}</dd></div>
            <div><dt>${progress ? 'Cost so far against budget' : 'Final cost against budget'}</dt><dd>${s.cost}</dd></div>
            <div><dt>${progress ? 'Energy target' : 'Energy or comfort'}</dt><dd>${s.energy}</dd></div>
          </dl>
        </div>
      </div>
    </section>

${progress ? '' : `    <section class="case-quote" aria-label="Client quote" data-reveal>
      <figure>
        <blockquote><p>${s.quote}</p></blockquote>
        <figcaption>${s.quoteBy}, ${p.name}, ${s.quoteYear}</figcaption>
      </figure>
    </section>

`}    <section class="credits" aria-labelledby="credits-title" data-reveal>
      <div class="credits__inner">
        <h2 id="credits-title" class="story__label">Credits</h2>
        <dl class="credits__list">
${['Photography', 'Structural engineer', 'Builder', 'Landscape'].map((k, j) => `          <div><dt>${k}</dt><dd>${s.credits[j]}</dd></div>`).join('\n')}
        </dl>
      </div>
    </section>

    <section class="next" aria-label="Next project and consultation">
      <div class="next__inner">
        <a class="next__link" href="${nextHref}" data-reveal>
          <span class="next__label">Next project</span>
          <span class="next__name">${next.name}</span>
          <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M2 8h11M9 4l4 4-4 4" /></svg>
        </a>
        <div class="next__ask" data-reveal>
          <h2 class="next__title">Have a site like this?</h2>
          <p>Tell us about it on a short call.</p>
          <a class="btn btn-primary" href="contact.html" data-magnetic>Book a consultation</a>
        </div>
      </div>
    </section>
  </main>

` + tail(['js/case-page.js']);
  write(`case-${p.slug}.html`, html);
});

// Court House's next-project link points at the next case study
const ch = fs.readFileSync('case-study.html', 'utf8');
const second = list[list.findIndex((p) => p.href === 'case-study.html') + 1];
fs.writeFileSync('case-study.html', ch.replace(/<a class="next__link" href="[^"]*"/, `<a class="next__link" href="case-${second.slug}.html"`)
  .replace(/<span class="next__name">[^<]*<\/span>/, `<span class="next__name">${second.name}</span>`));
console.log('linked Court House to', second.name);
