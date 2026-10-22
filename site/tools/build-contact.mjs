// Writes contact.html and thank-you.html, reusing the masthead and footer from index.html.
// Run from site/: node tools/build-contact.mjs
import fs from 'node:fs';

const idx = fs.readFileSync('index.html', 'utf8');
const cut = (a, b) => { const i = idx.indexOf(a), j = idx.indexOf(b, i); if (i < 0 || j < 0) throw new Error('anchor ' + a); return idx.slice(i, j); };
const header = cut('  <a class="skip"', '  <main id="main">');
const footer = cut('  <!-- Footer: the site', '  <script src="vendor/gsap.min.js"></script>');
const icon = (idx.match(/<link rel="icon"[^>]*>/) || [''])[0];

const head = (title, desc) => `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>${title}</title>
  <meta name="description" content="${desc}">
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
  <link rel="stylesheet" href="css/contact.css">
</head>
<body>
`;
const tail = (script) => `${footer}  <script src="vendor/gsap.min.js"></script>
  <script src="vendor/ScrollTrigger.min.js"></script>
  <script src="vendor/lenis.min.js"></script>
  <script type="module" src="${script}"></script>
  <script type="module" src="js/foot.js"></script>
</body>
</html>
`;

const radio = (name, value, label) =>
  `<label class="opt"><input type="radio" name="${name}" value="${value}" required><span>${label}</span></label>`;
const field = (id, label, helper, input, error) => `
            <div class="field" data-field="${id}">
              <label class="field__label" for="${id}">${label}</label>
              ${input}
              ${helper ? `<p class="field__help" id="${id}-help">${helper}</p>` : ''}
              ${error ? `<p class="field__error" id="${id}-error" hidden>${error}</p>` : ''}
            </div>`;
const group = (id, label, helper, opts, error) => `
            <fieldset class="field field--group" data-field="${id}" aria-describedby="${id}-help">
              <legend class="field__label">${label}</legend>
              <div class="opts">${opts.map(([v, l]) => radio(id, v, l)).join('')}</div>
              ${helper ? `<p class="field__help" id="${id}-help">${helper}</p>` : ''}
              ${error ? `<p class="field__error" id="${id}-error" hidden>${error}</p>` : ''}
            </fieldset>`;

const contact = head('Contact Ostra Studio', 'Tell us about your project. Book a consultation and get a reply within one working day.') + header + `  <main id="main" class="ct">
    <section class="ct-top" aria-labelledby="ct-title">
      <div class="ct-top__inner">
        <nav class="crumbs" aria-label="Breadcrumb"><ol><li><a href="index.html">Home</a></li><li aria-current="page">Contact</li></ol></nav>
        <h1 id="ct-title" class="ct-title" data-ct-title>
          <span class="line"><span>Tell us what</span></span>
          <span class="line"><span>you're planning.</span></span>
        </h1>
        <div class="ct-top__side">
          <p class="ct-lede">Not sure where to start? A short call is enough. We'll tell you honestly if we're the right studio.</p>
          <p class="ct-promise">We reply within one working day.</p>
        </div>
      </div>
    </section>

    <section class="ct-body" aria-label="Book a consultation">
      <div class="ct-body__inner">
        <form class="ct-form" data-form novalidate action="thank-you.html" method="get">
          <h2 class="ct-step"><span>1</span>About you</h2>
${field('name', 'Your name', '', '<input id="name" name="name" type="text" autocomplete="name" required data-brief="client">', 'Please add your name.')}
${field('email', 'Email', "We'll only use this to reply.", '<input id="email" name="email" type="email" autocomplete="email" required aria-describedby="email-help">', "That email doesn't look right. Check it and try again.")}
${field('phone', 'Phone (optional)', 'Easier to talk? Add a number.', '<input id="phone" name="phone" type="tel" autocomplete="tel" aria-describedby="phone-help">', '')}

          <h2 class="ct-step"><span>2</span>The project</h2>
${group('type', 'What are you planning?', 'Pick the closest match.', [['new-build', 'A new build'], ['remodel', 'A remodel'], ['extension', 'An extension'], ['other', 'Something else']], 'Please choose a project type.')}
${field('location', 'Where is the site?', 'Town or postcode is enough.', '<input id="location" name="location" type="text" autocomplete="address-level2" required data-brief="site" aria-describedby="location-help">', 'Please tell us where the site is.')}
${group('budget', 'Rough budget', 'A range helps us give a straight answer.', [['u250', 'Under £250k'], ['250-500', '£250k–£500k'], ['500-1m', '£500k–£1m'], ['o1m', 'Over £1m'], ['unsure', 'Not sure yet']], 'Please choose a range.')}
${group('timing', 'When do you hope to start?', '', [['6m', 'Within 6 months'], ['12m', '6 to 12 months'], ['later', 'In over a year'], ['exploring', 'Just exploring']], '')}
${field('message', 'Tell us about it', 'A few lines on the site, the brief and what matters most.', '<textarea id="message" name="message" rows="5" aria-describedby="message-help"></textarea>', '')}

          <div class="ct-send">
            <button class="btn btn-primary ct-submit" type="submit" data-submit>
              <span data-submit-label>Send my inquiry</span>
              <i class="ct-submit__line" aria-hidden="true"></i>
            </button>
            <p class="ct-status" role="status" aria-live="polite" data-status></p>
            <p class="ct-fit">We take on new homes, remodels and extensions, mostly between £250k and £1m. If yours is different, we'll point you to someone who can help.</p>
          </div>
        </form>

        <!-- The brief, drawn up as you type: a title block and a drawing of the kind of house. -->
        <aside class="brief" aria-label="Your brief so far" data-brief-sheet>
          <div class="brief__sheet">
            <div class="brief__head">
              <span>Your brief</span><span>Sheet 00 · Draft</span>
            </div>
            <div class="brief__drawing">
              <svg data-brief-drawing role="img" aria-label="A drawing of the kind of project you have chosen."></svg>
              <p class="brief__empty" data-brief-empty>Choose a project type and we'll start the drawing.</p>
            </div>
            <dl class="brief__block">
              <div><dt>Client</dt><dd data-out="client">—</dd></div>
              <div><dt>Project</dt><dd data-out="type">—</dd></div>
              <div><dt>Site</dt><dd data-out="site">—</dd></div>
              <div><dt>Budget</dt><dd data-out="budget">—</dd></div>
              <div><dt>Start</dt><dd data-out="timing">—</dd></div>
              <div><dt>Status</dt><dd data-out="status">Drafting</dd></div>
            </dl>
          </div>
          <p class="brief__note">This is what we'll have on the table when we call you.</p>
        </aside>
      </div>
    </section>

    <section class="ct-direct" aria-labelledby="ct-direct-title">
      <div class="ct-direct__inner">
        <h2 id="ct-direct-title" class="ct-direct__title">Rather talk now?</h2>
        <dl class="ct-direct__list">
          <div><dt>Studio</dt><dd>The Old Tannery<br>14 Westgate Street<br>Lewes, East Sussex<br>BN7 1YR</dd></div>
          <div><dt>Phone</dt><dd><a href="tel:+441632960418">01632 960 418</a></dd></div>
          <div><dt>Email</dt><dd><a href="mailto:hello@ostrastudio.co.uk">hello@ostrastudio.co.uk</a></dd></div>
          <div><dt>Hours</dt><dd>Monday to Friday, 9am to 5.30pm</dd></div>
        </dl>
        <p class="ct-direct__alt">Tendering, lending or planning? <a href="credentials.html">Request our credentials</a>.</p>
        <figure class="ct-studio">
          <img src="assets/photos/studio-interior.jpg" srcset="assets/photos/studio-interior-800.jpg 800w, assets/photos/studio-interior.jpg 1536w" sizes="(max-width: 760px) 92vw, 90vw" width="1536" height="1024" alt="The Ostra studio: a long oak worktable with card models and drawings under tall steel windows." loading="lazy" decoding="async">
          <figcaption>The studio · Where your first meeting happens · Visualisation, illustrative</figcaption>
        </figure>
      </div>
    </section>
  </main>

` + tail('js/contact.js');

const thanks = head('Thank you | Ostra Studio', 'We have your inquiry.') + header + `  <main id="main" class="ct">
    <section class="ty" aria-labelledby="ty-title">
      <div class="ty__inner">
        <p class="ty__stamp" data-ty-stamp><span>Received</span><span data-ty-date></span></p>
        <h1 id="ty-title" class="ct-title" data-ct-title>
          <span class="line"><span>Thanks.</span></span>
          <span class="line"><span>We've got it.</span></span>
        </h1>
        <p class="ct-lede ty__body"><span data-ty-name></span>We'll read your message and reply within one working day to book your call. Meanwhile, see how we worked with a client like you.</p>
        <a class="link-arrow" href="case-study.html">See a recent project<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M2 8h11M9 4l4 4-4 4" /></svg></a>
      </div>
    </section>
  </main>

` + tail('js/thanks.js');

fs.writeFileSync('contact.html', contact);
fs.writeFileSync('thank-you.html', thanks.replace('<meta name="description"', '<meta name="robots" content="noindex">\n  <meta name="description"'));
console.log('wrote contact.html and thank-you.html');
