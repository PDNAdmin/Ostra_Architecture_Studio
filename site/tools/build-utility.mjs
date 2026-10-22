// Writes press, careers (and the role template), credentials, the legal pages and the 404.
// Copy follows docs/copy.doc; [brackets] are facts Ostra must confirm. Run from site/: node tools/build-utility.mjs
import { head, header, tail, crumbs, title, arrow, cta, ph, write } from './lib.mjs';
import { STUDIO as S, PRESS as PRESS_LIST, ROLE, UPDATED } from './story.mjs';

const STUDIO = ['Studio', 'studio.html'];
const HOME = ['Home', 'index.html'];
const strip = (s) => s.replace(/[[\]]/g, '');

// ---------------------------------------------------------------- press
// Copy deck rule: list only what the client can document; if there is nothing yet, hide the page and its links.
const PRESS = PRESS_LIST;
const PRESS_HREF = { 'Court House': 'case-study.html', 'Long Reach': 'case-long-reach.html', 'Orchard Barn': 'case-orchard-barn.html', 'Niamh Byrne': 'journal-fabric-first.html' };
write('press.html', head({
  title: 'Awards and press | Ostra Studio',
  desc: "Awards and coverage of Ostra Studio's work.",
  css: ['css/pages.css', 'css/utility.css'],
}) + header + `  <main id="main" class="pg">
    <section class="pg-top" aria-labelledby="pg-title">
      <div class="pg-top__inner">
        ${crumbs([HOME, STUDIO, ['Awards and press']])}
        ${title('pg-title', ['Recognised by people', 'who know buildings.'])}
        <div class="pg-side" data-pg-side>
          <p class="pg-lede">Awards and coverage of our work.</p>
        </div>
      </div>
    </section>

    <section class="press" aria-labelledby="press-title">
      <div class="pg-wrap">
        <h2 id="press-title" class="pg-label">Coverage and awards</h2>
        <ul class="press__list">
${PRESS.map(([pub, what, proj, year, img]) => `          <li><a class="press__row" href="${PRESS_HREF[proj] || 'work.html'}" data-more data-reveal><img class="more__img" src="assets/${img}-800.jpg" width="800" height="533" alt="" loading="lazy" decoding="async"><span class="press__pub">${pub}<small>${what}</small></span><span class="press__proj">${proj}</span><span class="press__year">${year}</span><span class="press__go">${proj === 'Niamh Byrne' ? 'Read the article' : 'See the project'}${arrow}</span></a></li>`).join('\n')}
        </ul>
      </div>
    </section>

    <section class="kit" aria-labelledby="kit-title">
      <div class="pg-wrap kit__wrap" data-reveal>
        <h2 id="kit-title" class="kit__title">Writing about us?</h2>
        <p class="kit__body">Email <a href="mailto:${S.press}">${S.press}</a> for images and a project summary. We reply within ${S.reply}.</p>
        <dl class="kit__list">
          <div><dt>Press kit</dt><dd>Logo, studio photographs and images of eight projects, with photographer credits. <a href="mailto:${S.press}?subject=Press%20kit">Ask for the press kit</a> (PDF and images, 48 MB).</dd></div>
          <div><dt>Image use</dt><dd>Free for editorial use about our work. Credit the photographer named with each image, and Ostra Studio as architect.</dd></div>
        </dl>
      </div>
    </section>
  </main>

` + tail(['js/trail.js']));

// ---------------------------------------------------------------- careers
const ROLES = [ROLE];
write('careers.html', head({
  title: 'Careers at Ostra Studio',
  desc: 'Join a small architecture studio in Lewes. See open roles or send a portfolio.',
  css: ['css/pages.css', 'css/utility.css'],
}) + header + `  <main id="main" class="pg">
    <section class="pg-top" aria-labelledby="pg-title">
      <div class="pg-top__inner">
        ${crumbs([HOME, STUDIO, ['Careers']])}
        ${title('pg-title', ['Work on homes', 'people live in.'])}
        <div class="pg-side" data-pg-side>
          <p class="pg-lede">We're a small studio, so every role carries real responsibility.</p>
        </div>
      </div>
    </section>

    <section class="join" aria-labelledby="join-title">
      <div class="pg-wrap join__wrap">
        <figure class="join__photo" data-reveal>
          <img src="assets/photos/studio-workroom.jpg" srcset="assets/photos/studio-workroom-800.jpg 800w, assets/photos/studio-workroom.jpg 1536w" sizes="(max-width: 960px) 92vw, 55vw" width="1536" height="1024" alt="The studio workroom: a long oak table with card models and drawings." loading="lazy" decoding="async">
          <figcaption class="pg-cap">The studio · Visualisation, illustrative</figcaption>
        </figure>
        <div class="join__why" data-reveal>
          <h2 id="join-title" class="pg-label">Why join</h2>
          <ul class="join__list">
            <li><b>The work</b>Houses, remodels and extensions, each one from first sketch to handover. No fit-outs, no shopping centres.</li>
            <li><b>Learning</b>£1,500 a year each for courses, two study days, and a partner to review your work every month.</li>
            <li><b>The week</b>37.5 hours over four and a half days, Friday afternoons off. In the studio Tuesday to Thursday, the rest is up to you.</li>
          </ul>
        </div>
      </div>
    </section>

    <section class="roles" aria-labelledby="roles-title">
      <div class="pg-wrap">
        <h2 id="roles-title" class="roles__title" data-reveal>Open roles</h2>
        <ul class="roles__list">
${ROLES.map((r) => `          <li data-reveal><a class="roles__row" href="careers-${r.slug}.html"><span class="roles__name">${ph(r.title)}</span><span class="roles__where">${ph(r.where)}</span><span class="roles__go">See the role${arrow}</span></a></li>`).join('\n')}
        </ul>
        <p class="roles__none" data-reveal>Not seeing a role? We're not always hiring, but we read every portfolio. Send yours to <a href="mailto:${S.careers}">${S.careers}</a> and we'll keep it on file.</p>
      </div>
    </section>
  </main>

` + tail());

const list = (items) => `<ul class="role__list">${items.map((x) => `<li>${ph(x)}</li>`).join('')}</ul>`;
for (const r of ROLES) {
  write(`careers-${r.slug}.html`, head({
    title: `${strip(r.title)}, Careers | Ostra Studio`,
    desc: strip(`${r.title}, ${r.where}. ${r.line}`),
    css: ['css/pages.css', 'css/utility.css'],
    noindex: false,
  }) + header + `  <main id="main" class="pg">
    <section class="pg-top" aria-labelledby="pg-title">
      <div class="pg-top__inner">
        ${crumbs([HOME, STUDIO, ['Careers', 'careers.html'], [r.title]])}
        ${title('pg-title', [`${ph(r.title)},`, ph(r.where)])}
        <div class="pg-side" data-pg-side>
          <p class="pg-lede">${ph(r.line)}</p>
          <a class="btn btn-primary role__btn" href="#apply" data-magnetic>Apply for this role</a>
        </div>
      </div>
    </section>

    <section class="role" aria-label="About the role">
      <div class="pg-wrap role__wrap">
        <div class="role__block" data-reveal>
          <h2 class="pg-label">What you'll do</h2>
          ${list(r.do)}
        </div>
        <div class="role__block" data-reveal>
          <h2 class="pg-label">What you bring</h2>
          <h3 class="role__sub">Must have</h3>
          ${list(r.must)}
          <h3 class="role__sub">Nice to have</h3>
          ${list(r.nice)}
        </div>
        <div class="role__block" data-reveal>
          <h2 class="pg-label">What we offer</h2>
          <p class="role__text">${r.offer}</p>
        </div>
        <div class="role__block role__apply" id="apply" data-reveal>
          <h2 class="pg-label">How to apply</h2>
          <p class="role__text">${r.apply}</p>
          <a class="btn btn-primary" href="mailto:${S.careers}?subject=${encodeURIComponent(r.title + ' application')}" data-magnetic>Apply for this role</a>
        </div>
      </div>
    </section>
  </main>

` + tail());
}

// ---------------------------------------------------------------- request credentials
// The form fills a transmittal slip as you tick documents, the sheet architects send with drawings.
const DOCS = [
  ['registration', 'Registration', 'ARB registration for both partners, and our RIBA Chartered Practice certificate'],
  ['insurance', 'Insurance', 'Professional indemnity certificate, £2 million each and every claim'],
  ['references', 'References', 'Two client references from completed houses'],
  ['portfolio', 'Portfolio', 'Eight selected projects, with costs and timelines (PDF)'],
];
const field = (id, label, input, error, helper = '') => `
            <div class="field" data-field="${id}">
              <label class="field__label" for="${id}">${label}</label>
              ${input}
              ${helper ? `<p class="field__help" id="${id}-help">${helper}</p>` : ''}
              <p class="field__error" id="${id}-error" hidden>${error}</p>
            </div>`;
write('credentials.html', head({
  title: 'Request our credentials | Ostra Studio',
  desc: "Request Ostra Studio's registration, insurance and references for tenders, lenders or planning.",
  css: ['css/contact.css', 'css/pages.css', 'css/utility.css'],
}) + header + `  <main id="main" class="pg">
    <section class="pg-top" aria-labelledby="pg-title">
      <div class="pg-top__inner">
        ${crumbs([HOME, ['Contact', 'contact.html'], ['Request credentials']])}
        ${title('pg-title', ['Request our', 'credentials.'])}
        <div class="pg-side" data-pg-side>
          <p class="pg-lede">For tenders, lenders and planning bodies. Tell us what you need and we'll send it within two working days.</p>
        </div>
      </div>
    </section>

    <section class="cred" aria-label="Request credentials">
      <div class="pg-wrap cred__wrap">
        <form class="ct-form cred__form" data-cred novalidate>
${field('name', 'Your name', '<input id="name" name="name" type="text" autocomplete="name" required>', 'Please add your name.')}
${field('org', 'Organisation', '<input id="org" name="org" type="text" autocomplete="organization" required>', 'Please add your organisation.')}
${field('email', 'Email', '<input id="email" name="email" type="email" autocomplete="email" required aria-describedby="email-help">', "That email doesn't look right. Check it and try again.", "We'll send the documents here.")}
          <fieldset class="field field--group" data-field="need">
            <legend class="field__label">What you need</legend>
            <div class="opts">${DOCS.map(([v, l]) => `<label class="opt"><input type="checkbox" name="need" value="${v}"><span>${l}</span></label>`).join('')}</div>
            <p class="field__error" id="need-error" hidden>Please choose at least one document.</p>
          </fieldset>
          <div class="ct-send">
            <button class="btn btn-primary ct-submit" type="submit"><span>Request credentials</span></button>
            <p class="ct-status" role="status" aria-live="polite" data-cred-status></p>
          </div>
        </form>

        <aside class="slip" aria-label="Your request so far">
          <div class="slip__sheet" data-slip>
            <div class="slip__head"><span>Transmittal</span><span data-slip-ref>Ref OS-T</span></div>
            <dl class="slip__to">
              <div><dt>To</dt><dd data-slip-out="name">—</dd></div>
              <div><dt>Organisation</dt><dd data-slip-out="org">—</dd></div>
            </dl>
            <table class="slip__docs">
              <thead><tr><th scope="col">No.</th><th scope="col">Document</th><th scope="col">Sent</th></tr></thead>
              <tbody>
${DOCS.map(([v, l, d], i) => `                <tr data-slip-doc="${v}"><td>0${i + 1}</td><td><b>${l}</b>${ph(d)}</td><td class="slip__tick" aria-hidden="true"></td></tr>`).join('\n')}
              </tbody>
            </table>
            <p class="slip__stamp" data-slip-stamp aria-hidden="true">Requested</p>
          </div>
          <p class="slip__note">The documents we'll send, listed on the sheet that goes with them.</p>
        </aside>
      </div>
    </section>
  </main>

` + tail(['js/credentials.js']));

// ---------------------------------------------------------------- legal pages
// Intros from the copy deck. Every page needs legal review before launch; facts about this build are stated as they are.
const LEGAL = {
  privacy: {
    title: 'Privacy', h: ['Privacy.'], desc: 'What Ostra Studio collects, why, and how to ask us to delete it.',
    intro: 'What we collect, why, and how to ask us to delete it. In plain words.',
    sections: [
      ['What we collect', ['When you send an inquiry or a credentials request, we receive what you type into the form: your name, email, phone if you add it, and what you tell us about your project.', 'We do not collect anything else about you. If we add analytics, it will only run after you choose Accept all in the cookie banner.']],
      ['Why we collect it', ['To reply to you, book a call and, if you become a client, to run your project. We never sell your details or use them for marketing you did not ask for.']],
      ['Who else sees it', ['Our email provider, which stores our messages, and the company that hosts this website, which keeps standard server logs for 30 days. Both store data in the UK or the EU.', 'This site loads its fonts from Google Fonts, which receives your IP address when the page loads. Nobody else sees your details.']],
      ['How long we keep it', ['Inquiries that do not become projects: 12 months, then deleted.', 'Client records: 15 years after handover, because building law lets claims be made for that long.']],
      ['Your rights', [`You can ask to see, correct or delete what we hold about you at any time. Email ${S.privacy}. We reply within a month, usually much sooner. You can also complain to the Information Commissioner\'s Office.`]],
      ['Who we are', [`${S.legal}, ${S.address.join(', ')}. ${S.registration}. Contact: ${S.privacy}.`]],
    ],
  },
  terms: {
    title: 'Terms', h: ['Terms of use.'], desc: 'The rules for using the Ostra Studio website.',
    intro: 'The rules for using this site. Our client terms are agreed separately.',
    sections: [
      ['Using this site', ['You can browse, share links to and print pages from this site for your own use.']],
      ['Images and drawings', ['Drawings, photographs and visualisations on this site belong to Ostra Studio or the credited photographer. Ask us before using them anywhere else.', 'Some images are visualisations, marked as illustrative. They show the design intent, not a guarantee of the finished building.']],
      ['Articles are guidance, not advice', ['Journal articles explain how things usually work. Every site and project is different, so do not rely on them as professional advice for yours.']],
      ['Client work', ['If you appoint us, our agreement with you sets out the terms of the work. These website terms do not form part of it.']],
      ['Changes', ['We may update these terms. The date at the top shows the latest version.']],
    ],
  },
  cookies: {
    title: 'Cookies', h: ['Cookies.'], desc: 'The cookies Ostra Studio uses, what each one does, and how to change your choice.',
    intro: 'The cookies we use, what each one does, and how to change your choice.',
    sections: [
      ['What we use now', ['<strong>Your cookie choice</strong> (ostra-cookies, stored in your browser). Remembers whether you chose Accept all or Essential only, so we do not ask again. Essential.', '<strong>Analytics</strong>. None at the moment. If we add them, they will only load after you choose Accept all, and each cookie will be listed here first.']],
      ['Changing your choice', ['Use the Manage link in the cookie banner, or clear this site\'s data in your browser settings and choose again.']],
      ['Third parties', ['Fonts load from Google Fonts. They do not set cookies, but Google receives your IP address. See our privacy page.']],
    ],
  },
  accessibility: {
    title: 'Accessibility', h: ['Accessibility.'], desc: 'How the Ostra Studio website is built to be usable by everyone, and how to tell us when it is not.',
    intro: 'We want everyone who might live in one of our houses to be able to use this site. Here is what we have done, and how to tell us where it falls short.',
    sections: [
      ['What we aim for', ['WCAG 2.2 level AA, checked by hand and with automated tools before each release.']],
      ['What the site does', ['Every page works with a keyboard, and a skip link at the top jumps straight to the content.', 'If your device is set to reduce motion, scroll-driven animations and films are replaced with still images and full text.', 'Images carry descriptions, and decorative drawings are hidden from screen readers.', 'Text colours are chosen to meet contrast guidelines on the paper-coloured background.', 'Forms label every field and explain errors in words, not just colour.']],
      ['Known gaps', ['The scroll-driven films have no sound, and everything they show is also written on the page. We are not aware of any other barriers; if you find one, please tell us.']],
      ['Tell us', [`If something does not work for you, email ${S.email} or call ${S.phone}. We will reply within ${S.reply} and send you what you need in another format.`]],
    ],
  },
};
for (const [slug, L] of Object.entries(LEGAL)) {
  write(`${slug}.html`, head({ title: `${L.title} | Ostra Studio`, desc: L.desc, css: ['css/pages.css', 'css/utility.css'] }) + header + `  <main id="main" class="pg">
    <section class="pg-top" aria-labelledby="pg-title">
      <div class="pg-top__inner">
        ${crumbs([HOME, [L.title]])}
        ${title('pg-title', L.h)}
        <div class="pg-side" data-pg-side>
          <p class="pg-lede">${ph(L.intro)}</p>
          <p class="pg-note">Updated ${UPDATED}</p>
        </div>
      </div>
    </section>

    <section class="legal" aria-label="${L.title}">
      <div class="pg-wrap legal__wrap">
        <aside class="toc" aria-label="On this page">
          <span class="toc__label">On this page</span>
          <ol data-toc>
            <i class="toc__bar" data-toc-bar aria-hidden="true"></i>
${L.sections.map(([h], i) => `            <li><a href="#s${i}">${h}</a></li>`).join('\n')}
          </ol>
        </aside>
        <div class="prose" data-prose>
${L.sections.map(([h, ps], i) => `          <h2 id="s${i}">${h}</h2>\n${ps.map((p) => `          <p>${ph(p)}</p>`).join('\n')}`).join('\n')}
        </div>
      </div>
    </section>
  </main>

` + tail(['js/journal.js']));
}

// ---------------------------------------------------------------- 404
// A plan with one room that was never built: its walls are still dashed, and the door leads back to the work.
write('404.html', head({ title: "This page isn't here | Ostra Studio", desc: 'The page you were looking for has moved or does not exist.', css: ['css/pages.css', 'css/utility.css'], noindex: true }) + header + `  <main id="main" class="pg">
    <section class="nf" aria-labelledby="pg-title">
      <div class="pg-wrap nf__wrap">
        <div class="nf__text">
          <p class="pg-note">Error 404</p>
          ${title('pg-title', ["This page", "isn't here."])}
          <p class="pg-lede" data-pg-side>It may have moved. Try the work, or tell us what you were looking for.</p>
          <p class="nf__links" data-pg-side><a class="btn btn-primary" href="work.html" data-magnetic>See the work</a><a class="link-row" href="contact.html">Contact us${arrow}</a></p>
        </div>
        <figure class="nf__plan" aria-hidden="true">
          <svg viewBox="0 0 520 420" data-nf>
            <path class="nf-wall" d="M40 60H300V200H40Z M300 60H480V200H300 M40 200V360H300V200"/>
            <path class="nf-door" d="M150 200h40 M150 200a40 40 0 0 1 40 40"/>
            <path class="nf-ghost" d="M300 200H480V360H300"/>
            <text class="nf-label" x="170" y="135" text-anchor="middle">LIVING</text>
            <text class="nf-label" x="390" y="135" text-anchor="middle">KITCHEN</text>
            <text class="nf-label" x="170" y="285" text-anchor="middle">HALL</text>
            <text class="nf-404" x="390" y="296" text-anchor="middle">404</text>
            <text class="nf-label nf-label--o" x="390" y="324" text-anchor="middle">NOT BUILT YET</text>
          </svg>
        </figure>
      </div>
    </section>
  </main>

` + tail());
