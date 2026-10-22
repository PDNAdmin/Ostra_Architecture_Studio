// Writes the Studio sub-pages and utility pages: sustainability, press, careers (and role template),
// credentials, the legal pages and the 404. Copy follows docs/copy.doc; [brackets] are facts Ostra must confirm.
// Run from site/: node tools/build-pages.mjs
import { head, header, tail, crumbs, title, arrow, cta, ph, write } from './lib.mjs';

const STUDIO = ['Studio', 'studio.html'];
const HOME = ['Home', 'index.html'];

// ---------------------------------------------------------------- sustainability
const PRINCIPLES = [
  ['Orientation', 'We place rooms by the sun, so the house warms itself in winter and stays cool in summer.'],
  ['Insulation and airtightness', 'A well-sealed, well-insulated shell cuts the heat a house needs before any equipment is chosen.'],
  ['Daylight', 'Rooms shaped for daylight need less electric light, and they feel better to be in.'],
  ['Materials that last', "Materials that age well and can be repaired don't need replacing, which is the lowest-carbon choice of all."],
];
write('sustainability.html', head({
  title: 'Sustainable home design | Ostra Studio',
  desc: 'How Ostra Studio designs homes that cost less to run, with measured results.',
  css: ['css/pages.css'],
}) + header + `  <main id="main" class="pg">
    <section class="pg-top" aria-labelledby="pg-title">
      <div class="pg-top__inner">
        ${crumbs([HOME, STUDIO, ['Sustainability']])}
        ${title('pg-title', ['Homes that cost', 'less to live in.'])}
        <div class="pg-side" data-pg-side>
          <p class="pg-lede">Good design cuts energy use before any technology is added: orientation, insulation, daylight and materials that last.</p>
        </div>
      </div>
    </section>

    <!-- The sun through the year: a live section of a south-facing room. Scroll moves the noon sun from
         December to June; rays are traced through the window, and the overhang shades the summer sun. -->
    <section class="sun" aria-labelledby="sun-title" data-sun>
      <div class="sun__pin" data-sun-pin>
        <div class="sun__copy">
          <h2 id="sun-title" class="sun__title">The sun, through the year</h2>
          <p class="sun__tag">Noon sun, southern England, about 51° north</p>
          <p class="sun__read" aria-hidden="true"><span data-sun-month>December</span><span class="sun__deg"><b data-sun-deg>15</b>° above the horizon</span></p>
          <ol class="sun__caps" data-sun-caps>
            <li data-to="0.28"><b>Winter</b>The low sun reaches deep into the room and warms the floor, for free.</li>
            <li data-to="0.62"><b>Spring and autumn</b>Light reaches halfway in. The floor stores the warmth into the evening.</li>
            <li data-to="1.01"><b>Summer</b>The overhang shades the glass from the high sun, so the room stays cool.</li>
          </ol>
          <div class="sun__months" aria-hidden="true"><span>Dec</span><span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span><i data-sun-tick></i></div>
        </div>
        <figure class="sun__fig">
          <svg class="sun__svg" viewBox="0 0 1000 560" data-sun-svg role="img" aria-label="Section through a south-facing room. In winter the low sun shines deep into the room; in summer a roof overhang shades the window."></svg>
        </figure>
      </div>
    </section>

    <section class="prin" aria-labelledby="prin-title">
      <div class="pg-wrap">
        <h2 id="prin-title" class="pg-label">Four things we design in from the first sketch</h2>
        <ol class="prin__list">
${PRINCIPLES.map(([t, d], i) => `          <li class="prin__item" data-reveal><span class="prin__n">0${i + 1}</span><h3>${t}</h3><p>${d}</p></li>`).join('\n')}
        </ol>
        <p class="prin__more" data-reveal><a class="link-row" href="journal-fabric-first.html">Why we insulate before adding solar panels${arrow}</a></p>
      </div>
    </section>

    <section class="proof" aria-labelledby="proof-title">
      <div class="pg-wrap proof__wrap">
        <figure class="proof__photo" data-reveal>
          <img src="assets/photos/sustainability.jpg" srcset="assets/photos/sustainability-800.jpg 800w, assets/photos/sustainability.jpg 1536w" sizes="(max-width: 960px) 92vw, 50vw" width="1536" height="1024" alt="A deep window seat in a thick insulated wall, with low winter sun across an oak floor." loading="lazy" decoding="async">
          <figcaption>A deep reveal: thick walls, low winter sun · Visualisation, illustrative</figcaption>
        </figure>
        <div class="proof__text" data-reveal>
          <h2 id="proof-title" class="proof__title">Measured, not claimed.</h2>
          <p>We only publish results we have measured on a named project, or a certification we hold.</p>
          <dl class="proof__list">
            <div><dt>Measured result</dt><dd>Long Reach used 24 kWh/m² for heating in its first full year, about a fifth of a typical UK home. Court House used 31.</dd></div>
            <div><dt>Materials policy</dt><dd>Timber from certified forests, lime in place of cement wherever it works, and nothing we can’t repair, reuse or recycle.</dd></div>
            <div><dt>Certification</dt><dd>Niamh Byrne is a Certified Passivhaus Designer. Sea Lane is being built to the Passivhaus standard.</dd></div>
          </dl>
        </div>
      </div>
    </section>

${cta('Want a house that costs less to run?', 'Ask us on a short call. We’ll show you where the heat goes and what to fix first.')}  </main>

` + tail(['js/sun.js']));
