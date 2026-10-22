// One-off: writes the story bible (tools/story.mjs) into the hand-made pages and the builders' fixed copy.
// Each swap must match exactly once or more; a miss stops the run. Run from site/: node tools/fill.mjs
import fs from 'node:fs';
import { STUDIO as S, HOME_QUOTES, PROJECT_STORY, STAGE_LENGTH } from './story.mjs';

const P = (t) => `<span class="ph">${t}</span>`;
const files = {};
const load = (f) => (files[f] ??= fs.readFileSync(f, 'utf8'));
function swap(f, a, b, { all = true } = {}) {
  const s = load(f);
  if (!s.includes(a)) throw new Error(`${f}: not found: ${a.slice(0, 90)}`);
  files[f] = all ? s.split(a).join(b) : s.replace(a, b);
}

const mail = (e) => `<a href="mailto:${e}">${e}</a>`;
const tel = `<a href="tel:${S.phoneHref}">${S.phone}</a>`;

// ---------------------------------------------------------------- footer and contact details (home + Court House)
for (const f of ['index.html', 'case-study.html']) {
  swap(f, `${P('[Address]')}<br>`, `${S.address[0]}, ${S.address[1]}<br>${S.address[2]} ${S.address[3]}<br>`);
  swap(f, `<a href="mailto:">${P('[Email]')}</a>`, mail(S.email));
  swap(f, `<a href="tel:">${P('[Phone]')}</a>`, tel);
  swap(f, `<a href="#">${P('[Instagram]')}</a>`, `<a href="${S.instagram[1]}" rel="noopener">Instagram ${S.instagram[0]}</a>`);
  swap(f, `<a href="#">${P('[LinkedIn]')}</a>`, `<a href="${S.linkedin[1]}" rel="noopener">LinkedIn</a>`);
  swap(f, `© ${P('[Year]')} Ostra Studio`, `© ${S.year} ${S.legal}`);
  swap(f, `<p>${P('[Registration number]')}</p>`, `<p>${S.registration}</p>`);
}

// ---------------------------------------------------------------- home
swap('index.html', `${P('[Years in practice]')} years. ${P('[Number]')} homes built. ${P('[Region]')}.`, `${S.years} years. ${S.homes} homes built. ${S.region}.`);
const QUOTE_SLOTS = [
  "[Verbatim quote about the result: how the finished house feels to live in, in the client's own words.]",
  '[Verbatim quote about the process: always knowing what happened next, and who to call.]',
  '[Verbatim quote about the budget: the final cost against what was planned at the start.]',
];
QUOTE_SLOTS.forEach((slot, i) => {
  const [q, who, proj, where, year] = HOME_QUOTES[i];
  swap('index.html', P(slot), q);
  swap('index.html', `${P('[Client first name]')} · ${P('[Project]')} · ${P('[Location]')} · ${P('[Year]')}`, `${who} · ${proj} · ${where} · ${year}`, { all: false });
});
swap('index.html', `${P('[Free or paid]')} 30-minute call. No obligation. We reply within ${P('[one working day]')}.`, `${S.call}. No obligation. We reply within ${S.reply}.`);
swap('index.html', 'Drawings and renders are illustrative visualisations. Project photography to follow.', 'Renders are illustrative visualisations of each house.');
swap('index.html', '<title>Ostra Studio: custom home architects</title>', `<title>Ostra Studio: custom home architects in ${S.city}</title>`);
swap('index.html', 'Ostra Studio designs custom homes and major remodels, from first sketch to handover.', `Ostra Studio designs custom homes and major remodels in ${S.city} and across southern England, from first sketch to handover.`);

// ---------------------------------------------------------------- Court House case study
const C = PROJECT_STORY['court-house'];
const ch = 'case-study.html';
swap(ch, `<dd>${P('[Range, if approved]')}</dd>`, `<dd>${C.budget}</dd>`);
swap(ch, `${P('[Client]')} came to us with ${P('[a site or house]')} that ${P('[problem, in their words]')}.`, `${C.client} came to us with ${C.site} that ${C.problem}.`);
swap(ch, P('[One paragraph on the hardest constraint: the slope, planning limits, the budget, a listed building.]'), C.challenge);
swap(ch, P('[How the plan answers the brief, ending with how the house feels.]'), C.design);
swap(ch, P('[Lime render, oak, clay tile and lime plaster, and why each was chosen, ending with how the rooms feel.]'), C.materials);
swap(ch, P('[How it was built and kept on track, ending with how the finished house feels.]'), C.build);
swap(ch, `<dd>${P('[months]')}</dd>`, `<dd>${C.months}</dd>`);
swap(ch, `<dd>${P('[figure]')}</dd>`, `<dd>${C.cost}</dd>`);
swap(ch, `<dd>${P('[measured result]')}</dd>`, `<dd>${C.energy}</dd>`);
swap(ch, '\n          <p class="story__note">Only figures the client confirms in writing are published.</p>', '');
swap(ch, `<blockquote><p>${P('[Verbatim client quote about the finished house.]')}</p></blockquote>`, `<blockquote><p>${C.quote}</p></blockquote>`);
swap(ch, `<figcaption>${P('[Client name]')}, ${P('[Year]')}</figcaption>`, `<figcaption>${C.quoteBy}, Court House, ${C.quoteYear}</figcaption>`);
['[Photographer]', '[Engineer]', '[Builder]', '[Landscape architect]'].forEach((slot, i) => swap(ch, `<dd>${P(slot)}</dd>`, `<dd>${C.credits[i]}</dd>`));

// ---------------------------------------------------------------- studio builder
const st = 'tools/build-studio.mjs';
swap(st, 'About Ostra Studio, architects in [city]', `About Ostra Studio, architects in ${S.city}`);
swap(st, `Ostra is <span class="ph">[number]</span> architects and designers in <span class="ph">[city]</span>, working on <span class="ph">[number]</span> projects at a time`,
  `Ostra is ${S.team} architects and designers in ${S.city}, working on no more than ${S.maxProjects} projects at a time`);
['[30 minutes]', '[weeks]', '[months]', '[months]', '[days]'].forEach((slot, i) => swap(st, `'${slot}'],`, `'${STAGE_LENGTH[i]}'],`, { all: false }));
swap(st, `<dd><span class="ph">[Registration body and number]</span></dd>`, `<dd>${S.arb}</dd>`);
swap(st, `<dd><span class="ph">[Professional indemnity]</span></dd>`, `<dd>${S.insurance}</dd>`);
swap(st, `<dd><span class="ph">[Professional memberships]</span></dd>`, `<dd>${S.memberships}</dd>`);
swap(st, `Email <span class="ph">[press address]</span> for images`, `Email ${S.press} for images`);
swap(st, `A first call costs you <span class="ph">[30 minutes]</span> and tells you`, 'A first call costs you 30 minutes and tells you');

// ---------------------------------------------------------------- contact builder
const ct = 'tools/build-contact.mjs';
swap(ct, 'get a reply within [one working day].', `get a reply within ${S.reply}.`);
swap(ct, `We reply within <span class="ph">[one working day]</span>`, `We reply within ${S.reply}`);
swap(ct, `<dd><span class="ph">[Address]</span></dd>`, `<dd>${S.address.join('<br>')}</dd>`);
swap(ct, `<a href="tel:"><span class="ph">[Phone]</span></a>`, tel);
swap(ct, `<a href="mailto:"><span class="ph">[Email]</span></a>`, mail(S.email));
swap(ct, `<dd><span class="ph">[Hours]</span></dd>`, `<dd>${S.hours}</dd>`);

for (const [f, s] of Object.entries(files)) fs.writeFileSync(f, s);
console.log('filled', Object.keys(files).join(', '));
