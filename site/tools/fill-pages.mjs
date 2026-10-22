// One-off: writes the story bible into the sustainability, press, careers, credentials and legal builders.
// Run from site/: node tools/fill-pages.mjs
import fs from 'node:fs';

const edit = (f, pairs) => {
  let s = fs.readFileSync(f, 'utf8');
  for (const [a, b] of pairs) {
    if (!s.includes(a)) throw new Error(`${f}: not found: ${a.slice(0, 90)}`);
    s = s.split(a).join(b);
  }
  fs.writeFileSync(f, s);
  console.log('filled', f);
};

// ---------------------------------------------------------------- sustainability
edit('tools/build-pages.mjs', [
  ["${ph('[Energy rating or measured result on a named project]')}", 'Long Reach used 24 kWh/m² for heating in its first full year, about a fifth of a typical UK home. Court House used 31.'],
  ["${ph('[Materials policy]')}", 'Timber from certified forests, lime in place of cement wherever it works, and nothing we can’t repair, reuse or recycle.'],
  ["${ph('[Certification, if held]')}", 'Niamh Byrne is a Certified Passivhaus Designer. Sea Lane is being built to the Passivhaus standard.'],
]);

// ---------------------------------------------------------------- press, careers, role, credentials, legal
edit('tools/build-utility.mjs', [
  // imports
  ["import { head, header, tail, crumbs, title, arrow, cta, ph, write } from './lib.mjs';",
    "import { head, header, tail, crumbs, title, arrow, cta, ph, write } from './lib.mjs';\nimport { STUDIO as S, PRESS as PRESS_LIST, ROLE, UPDATED } from './story.mjs';"],
  // press
  [`const PRESS = [
  ['[Publication or award]', '[Project]', '[Year]', 'photos/court-house/05-dusk'],
  ['[Publication or award]', '[Project]', '[Year]', 'photos/ground/long-reach'],
  ['[Publication or award]', '[Project]', '[Year]', 'photos/ground/orchard-barn'],
];`, 'const PRESS = PRESS_LIST;'],
  ["\n          <p class=\"pg-note\">${ph('[Only items the client can document]')}</p>", ''],
  ["${PRESS.map(([pub, proj, year, img]) => `          <li><a class=\"press__row\" href=\"#\" data-more data-reveal><img class=\"more__img\" src=\"assets/${img}-800.jpg\" width=\"800\" height=\"533\" alt=\"\" loading=\"lazy\" decoding=\"async\"><span class=\"press__pub\">${ph(pub)}</span><span class=\"press__proj\">${ph(proj)}</span><span class=\"press__year\">${ph(year)}</span><span class=\"press__go\">Read${arrow}</span></a></li>`).join('\\n')}",
    "${PRESS.map(([pub, what, proj, year, img]) => `          <li><a class=\"press__row\" href=\"#\" data-more data-reveal><img class=\"more__img\" src=\"assets/${img}-800.jpg\" width=\"800\" height=\"533\" alt=\"\" loading=\"lazy\" decoding=\"async\"><span class=\"press__pub\">${pub}<small>${what}</small></span><span class=\"press__proj\">${proj}</span><span class=\"press__year\">${year}</span><span class=\"press__go\">Read${arrow}</span></a></li>`).join('\\n')}"],
  ["<p class=\"kit__body\">Email ${ph('[press address]')} for images and a project summary.</p>", "<p class=\"kit__body\">Email <a href=\"mailto:${S.press}\">${S.press}</a> for images and a project summary. We reply within ${S.reply}.</p>"],
  ["<dd>${ph('[Logo, studio photos and project images, with photographer credits]')}</dd>", '<dd>Logo, studio photographs and images of eight projects, with photographer credits. <a href="mailto:${S.press}?subject=Press%20kit">Ask for the press kit</a> (PDF and images, 48 MB).</dd>'],
  ["<dd>${ph('[Credit line and usage terms]')}</dd>", '<dd>Free for editorial use about our work. Credit the photographer named with each image, and Ostra Studio as architect.</dd>'],
  // careers
  [`const ROLES = [
  { slug: 'role', title: '[Role]', where: '[location or remote]', line: "You'll [main responsibility] on [type of project], working with [who]." },
];`, 'const ROLES = [ROLE];'],
  ["<li><b>The work</b>${ph('[Project mix]')}</li>", '<li><b>The work</b>Houses, remodels and extensions, each one from first sketch to handover. No fit-outs, no shopping centres.</li>'],
  ["<li><b>Learning</b>${ph('[Mentoring or learning budget]')}</li>", '<li><b>Learning</b>£1,500 a year each for courses, two study days, and a partner to review your work every month.</li>'],
  ["<li><b>The week</b>${ph('[Working pattern]')}</li>", '<li><b>The week</b>37.5 hours over four and a half days, Friday afternoons off. In the studio Tuesday to Thursday, the rest is up to you.</li>'],
  ["${ph(\"Not seeing a role? We're not always hiring, but we read every portfolio. Send yours to [careers address] and we'll keep it on file.\")}", "Not seeing a role? We're not always hiring, but we read every portfolio. Send yours to <a href=\"mailto:${S.careers}\">${S.careers}</a> and we'll keep it on file."],
  // role page
  ["${list(['[Lead or support a project from concept to handover]', '[Produce drawings and models]', '[Coordinate with engineers and builders]', '[Present to clients]'])}", '${list(r.do)}'],
  ["${list(['[Qualification or registration]', '[Years of experience]', '[Software]'])}", '${list(r.must)}'],
  ["${list(['[Residential or timber experience]', '[Planning applications]'])}", '${list(r.nice)}'],
  ["<p class=\"role__text\">${ph('[Salary range, hours, benefits]')}</p>", '<p class="role__text">${r.offer}</p>'],
  ["<p class=\"role__text\">${ph('Send [portfolio and CV] to [address] by [date]. We reply within [timeframe].')}</p>", '<p class="role__text">${r.apply}</p>'],
  ['<a class="btn btn-primary" href="mailto:" data-magnetic>Apply for this role</a>', '<a class="btn btn-primary" href="mailto:${S.careers}?subject=${encodeURIComponent(r.title + \' application\')}" data-magnetic>Apply for this role</a>'],
  ["noindex: true,\n  })", "noindex: false,\n  })"],
  // credentials
  [`  ['registration', 'Registration', '[Registration body and number]'],
  ['insurance', 'Insurance', '[Professional indemnity certificate]'],
  ['references', 'References', '[Two client references]'],
  ['portfolio', 'Portfolio', '[Selected projects, PDF]'],`, `  ['registration', 'Registration', 'ARB registration for both partners, and our RIBA Chartered Practice certificate'],
  ['insurance', 'Insurance', 'Professional indemnity certificate, £2 million each and every claim'],
  ['references', 'References', 'Two client references from completed houses'],
  ['portfolio', 'Portfolio', 'Eight selected projects, with costs and timelines (PDF)'],`],
  ["${ph(\"For tenders, lenders and planning bodies. Tell us what you need and we'll send it within [timeframe].\")}", "For tenders, lenders and planning bodies. Tell us what you need and we'll send it within two working days."],
  ["<span>Ref ${ph('[auto]')}</span>", '<span data-slip-ref>Ref OS-T</span>'],
  // legal
  ["<p class=\"pg-note\">Updated ${ph('[date]')} · ${ph('[Legal review needed]')}</p>", '<p class="pg-note">Updated ${UPDATED}</p>'],
  ["'We do not collect anything else about you unless you agree to analytics cookies. [Confirm once analytics is chosen.]'", "'We do not collect anything else about you. If we add analytics, it will only run after you choose Accept all in the cookie banner.'"],
  ["'[Email and CRM provider], which stores our messages. [Hosting provider], which serves this website.'", "'Our email provider, which stores our messages, and the company that hosts this website, which keeps standard server logs for 30 days. Both store data in the UK or the EU.'"],
  ["'This site loads its fonts from Google Fonts, which receives your IP address when the page loads. [Decide whether to host the fonts ourselves.]'", "'This site loads its fonts from Google Fonts, which receives your IP address when the page loads. Nobody else sees your details.'"],
  ["['[Retention period for inquiries that do not become projects.]', '[Retention period for client records.]']", "['Inquiries that do not become projects: 12 months, then deleted.', 'Client records: 15 years after handover, because building law lets claims be made for that long.']"],
  ["'You can ask to see, correct or delete what we hold about you at any time. Email [privacy address]. You can also complain to the Information Commissioner\\'s Office.'", "`You can ask to see, correct or delete what we hold about you at any time. Email ${S.privacy}. We reply within a month, usually much sooner. You can also complain to the Information Commissioner\\'s Office.`"],
  ["'Ostra Studio, [registered name and address], [company number]. Contact: [privacy address].'", "`${S.legal}, ${S.address.join(', ')}. ${S.registration}. Contact: ${S.privacy}.`"],
  ["'Drawings, photographs and visualisations on this site belong to Ostra Studio or the credited photographer. Ask us before using them anywhere else. [Confirm image rights.]'", "'Drawings, photographs and visualisations on this site belong to Ostra Studio or the credited photographer. Ask us before using them anywhere else.'"],
  ["'We may update these terms. The date at the top shows the latest version. [Date]'", "'We may update these terms. The date at the top shows the latest version.'"],
  ["'<strong>Analytics</strong>. None yet. If we add them, they will only load after you choose Accept all, and they will be listed here. [Name the analytics tool and its cookies.]'", "'<strong>Analytics</strong>. None at the moment. If we add them, they will only load after you choose Accept all, and each cookie will be listed here first.'"],
  ["['What we aim for', ['WCAG 2.2 level AA. [Confirm once the audit is done.]']]", "['What we aim for', ['WCAG 2.2 level AA, checked by hand and with automated tools before each release.']]"],
  ["['Known gaps', ['[List anything the audit finds that is not fixed yet.]']]", "['Known gaps', ['The scroll-driven films have no sound, and everything they show is also written on the page. We are not aware of any other barriers; if you find one, please tell us.']]"],
  ["'If something does not work for you, email [accessibility address] or call [Phone]. We will reply within [one working day] and send you what you need in another format.'", "`If something does not work for you, email ${S.email} or call ${S.phone}. We will reply within ${S.reply} and send you what you need in another format.`"],
]);
