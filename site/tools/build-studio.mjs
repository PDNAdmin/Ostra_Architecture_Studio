// Writes studio.html, reusing the masthead and footer from index.html.
// Run from site/: node tools/build-studio.mjs
import fs from 'node:fs';

const idx = fs.readFileSync('index.html', 'utf8');
const cut = (a, b) => { const i = idx.indexOf(a), j = idx.indexOf(b, i); if (i < 0 || j < 0) throw new Error('anchor ' + a); return idx.slice(i, j); };
const header = cut('  <a class="skip"', '  <main id="main">');
const footer = cut('  <!-- Footer: the site', '  <script src="vendor/gsap.min.js"></script>');
const icon = (idx.match(/<link rel="icon"[^>]*>/) || [''])[0];

const RULES = [
  ['Start with a floor plan.', 'Start with how you live.', 'Every design begins with your routines, not a template.'],
  ['Talk money after the drawings.', 'Say the cost early.', 'We talk budget in the first call, not after the drawings.'],
  ['Build it, then fix it.', "Draw it until it's right.", 'We model and test before anything is built.'],
];
const STAGES = [
  ['Consultation', 'A frank view on your site, brief and budget', '30 minutes'],
  ['Concept', 'Sketches and a first cost range', '4 to 6 weeks'],
  ['Design', 'Full drawings, materials and planning submission', '3 to 6 months'],
  ['Build', 'Site visits, contractor oversight, regular updates', '9 to 14 months'],
  ['Handover', 'A finished house, a guide to using it, a walk-through', '2 days'],
];
const TEAM = [
  ['Adaeze Okafor', 'Founding Partner · Architect', 'Leads the design, from the first call to handover.'],
  ['Rohan Mehta', 'Partner · Design Director', 'Shapes the plan, the light and how each house feels.'],
  ['Ji-woo Han', 'Project Architect', 'Turns the design into drawings a builder can price and build.'],
  ['Mateo Ruiz', 'Senior Designer · Interiors and materials', "Chooses the materials you'll touch every day, and tests them."],
  ['Niamh Byrne', 'Sustainability and Technical Lead', 'Makes sure the house is warm, bright and cheap to run.'],
  ['Marcus Grant', 'Studio Manager · Client lead', 'Your first call, and the person who always knows what happens next.'],
];
const ph = (s) => s.replace(/\[([^\]]+)\]/g, '<span class="ph">[$1]</span>');

const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>About Ostra Studio, architects in Lewes</title>
  <meta name="description" content="Meet the architects behind Ostra Studio and the principles that shape every home we design.">
  <meta name="theme-color" content="#EFE9DD">
  ${icon}
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600&family=Geist+Mono:wght@400;500&family=Space+Grotesk:wght@500;700&display=swap">
  <link rel="stylesheet" href="vendor/lenis.css">
  <link rel="stylesheet" href="css/tokens.css">
  <link rel="stylesheet" href="css/hero.css">
  <link rel="stylesheet" href="css/foot.css">
  <link rel="stylesheet" href="css/page.css">
  <link rel="stylesheet" href="css/studio.css">
</head>
<body>
${header}  <main id="main" class="st">
    <section class="st-top" aria-labelledby="st-title">
      <div class="st-top__inner">
        <nav class="crumbs" aria-label="Breadcrumb"><ol><li><a href="index.html">Home</a></li><li aria-current="page">Studio</li></ol></nav>
        <h1 id="st-title" class="st-title" data-st-title>
          <span class="line"><span>A small studio</span></span>
          <span class="line"><span>with a clear</span></span>
          <span class="line"><span>point of view.</span></span>
        </h1>
        <div class="st-top__side">
          <p class="st-lede">Ostra is six architects and designers in Lewes, working on no more than eight projects at a time so each one gets senior attention.</p>
          <nav class="st-index" aria-label="On this page">
            <a href="#principles"><span>01</span>Principles</a>
            <a href="#approach"><span>02</span>Approach</a>
            <a href="#people"><span>03</span>People</a>
            <a href="#more"><span>04</span>Sustainability, press, careers</a>
          </nav>
        </div>
      </div>
    </section>

    <!-- Principles as redlines: the industry habit is struck through, Ostra's rule is written in. -->
    <section class="rules" id="principles" aria-labelledby="rules-title">
      <div class="rules__inner">
        <h2 id="rules-title" class="st-label">How we work, in three corrections</h2>
        <ol class="rules__list">
${RULES.map(([habit, rule, proof], i) => `          <li class="rule" data-rule>
            <span class="rule__n">${i + 1}</span>
            <p class="rule__habit"><s data-strike>${habit}</s><span class="sr-only"> is what usually happens.</span></p>
            <p class="rule__fix" data-fix>${rule}</p>
            <p class="rule__proof" data-proof>${proof}</p>
          </li>`).join('\n')}
        </ol>
      </div>
    </section>

    <!-- Approach: the desk. A Remotion film of the five stages landing on a drafting table, scrubbed by scroll. -->
    <section class="desk" id="approach" aria-labelledby="desk-title" data-desk>
      <div class="desk__pin" data-desk-pin>
        <div class="desk__film" aria-hidden="true">
          <video class="desk__video" data-desk-video muted playsinline preload="auto" tabindex="-1" disablepictureinpicture></video>
          <img class="desk__still" src="assets/desk-poster.jpg" alt="" decoding="async">
        </div>
        <div class="desk__copy">
          <h2 id="desk-title" class="desk__title">From first sketch to handover.</h2>
          <p class="desk__ba"><span>Before</span>Building a home feels like handing over a lot of money and hoping.</p>
          <p class="desk__ba"><span>With us</span>You know what happens next, what it costs and who is responsible, at every stage.</p>
          <ol class="stages" data-stages>
${STAGES.map(([name, what, len], i) => `            <li class="stage" data-stage="${i}">
              <span class="stage__n">${i + 1}</span>
              <h3 class="stage__name">${name}</h3>
              <dl class="stage__out">
                <div><dt>What you get</dt><dd>${what}</dd></div>
                <div><dt>Typical length</dt><dd>${ph(len)}</dd></div>
              </dl>
            </li>`).join('\n')}
          </ol>
          <a class="link-arrow desk__cta" href="contact.html">Ready for stage one? Book a consultation<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M2 8h11M9 4l4 4-4 4" /></svg></a>
        </div>
      </div>
    </section>

    <!-- People as scale figures: each portrait is cut out of its orange backdrop, so the backdrop is a separate plate
         that inks in on scroll, and the head breaks out above the sheet. -->
    <section class="team" id="people" aria-labelledby="team-title">
      <div class="team__inner">
        <header class="team__head">
          <h2 id="team-title" class="team__title" data-team-title><span class="line"><span>The people</span></span><span class="line"><span>you'll work with.</span></span></h2>
          <p class="team__lede" data-reveal>Six of us, drawn to scale. You'll know every name before anything is built.</p>
        </header>
        <ul class="team__list">
${TEAM.map(([name, role, what], i) => `          <li class="mate${i < 2 ? ' mate--lead' : ''}" data-mate>
            <figure class="mate__sheet">
              <span class="mate__plate" data-plate aria-hidden="true"></span>
              <img class="mate__cut" data-cut src="assets/team/team-0${i + 1}.webp" width="1000" height="1250" alt="Portrait of ${name}, ${role.replace(/ · .*/, '')}." loading="lazy" decoding="async">
              <span class="mate__no" aria-hidden="true">T-0${i + 1}</span>
              <span class="mate__dim" aria-hidden="true"><i></i><b>1:1</b><i></i></span>
            </figure>
            <div class="mate__block">
              <h3 class="mate__name">${name}</h3>
              <p class="mate__role">${role}</p>
              <p class="mate__what">${what}</p>
            </div>
          </li>`).join('\n')}
        </ul>
        <dl class="creds" data-reveal>
          <div><dt>Registration</dt><dd>Architects Registration Board: Adaeze Okafor (071542), Rohan Mehta (058816)</dd></div>
          <div><dt>Insurance</dt><dd>Professional indemnity, £2 million for each and every claim</dd></div>
          <div><dt>Memberships</dt><dd>RIBA Chartered Practice · Passivhaus Trust · AECB</dd></div>
        </dl>
      </div>
    </section>

    <section class="more" id="more" aria-label="More about the studio">
      <ul class="more__list">
        <li><a href="sustainability.html" data-reveal data-more><img class="more__img" src="assets/photos/sustainability-800.jpg" width="800" height="533" alt="" loading="lazy" decoding="async"><span class="more__k">Sustainability</span><span class="more__t">Homes that cost less to live in.</span><span class="more__s">Orientation, insulation, daylight and materials that last, before any technology is added.</span><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M2 8h11M9 4l4 4-4 4" /></svg></a></li>
        <li><a href="press.html" data-reveal data-more><img class="more__img" src="assets/photos/court-house/05-dusk-800.jpg" width="800" height="533" alt="" loading="lazy" decoding="async"><span class="more__k">Awards and press</span><span class="more__t">Recognised by people who know buildings.</span><span class="more__s">Writing about us? Email press@ostrastudio.co.uk for images and a project summary.</span><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M2 8h11M9 4l4 4-4 4" /></svg></a></li>
        <li><a href="careers.html" data-reveal data-more><img class="more__img" src="assets/photos/studio-workroom-800.jpg" width="800" height="533" alt="" loading="lazy" decoding="async"><span class="more__k">Careers</span><span class="more__t">Work on homes people live in.</span><span class="more__s">We're a small studio, so every role carries real responsibility.</span><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M2 8h11M9 4l4 4-4 4" /></svg></a></li>
      </ul>
    </section>

    <section class="st-end" aria-labelledby="st-end-title">
      <div class="st-end__inner" data-reveal>
        <h2 id="st-end-title" class="st-end__title">Meet us before you commit.</h2>
        <p>A first call costs you 30 minutes and tells you if we're the right fit.</p>
        <a class="btn btn-primary" href="contact.html" data-magnetic>Book a consultation</a>
      </div>
    </section>
  </main>

${footer}  <script src="vendor/gsap.min.js"></script>
  <script src="vendor/ScrollTrigger.min.js"></script>
  <script src="vendor/lenis.min.js"></script>
  <script type="module" src="js/studio.js"></script>
  <script type="module" src="js/trail.js"></script>
  <script type="module" src="js/foot.js"></script>
</body>
</html>
`;
fs.writeFileSync('studio.html', html);
console.log('wrote studio.html');
