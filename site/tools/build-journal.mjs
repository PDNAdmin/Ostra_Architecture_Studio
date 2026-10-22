// Writes journal.html and one journal-<slug>.html per article.
// Run from site/: node tools/build-journal.mjs
import { head, header, tail, crumbs, title, arrow, cta, ph, esc, write } from './lib.mjs';
import { ARTICLES, CATEGORIES } from './journal-data.mjs';
import { cover } from './covers.mjs';
import { PROJECTS_DATA } from '../js/projects.js';

const words = (a) => [a.open, ...a.body.flatMap(([, v]) => (Array.isArray(v) ? v : [v]))].join(' ').replace(/<[^>]+>/g, '').split(/\s+/).length;
const minutes = (a) => Math.max(2, Math.ceil(words(a) / 200));
const href = (a) => `journal-${a.slug}.html`;
const coverLabel = (a) => `Drawing for "${a.title}"`;
const meta = (a) => `<p class="jn-meta"><span class="jn-cat">${a.category}</span><span>${minutes(a)} min read</span><span>${a.date}</span></p>`;

const card = (a, i) => `          <li class="jn-card${i === 0 ? ' jn-card--lead' : ''}" data-cat="${a.category}" data-jn-card>
            <a class="jn-card__link" href="${href(a)}">
              <figure class="jn-card__cover">${cover(a.cover, coverLabel(a))}</figure>
              <div class="jn-card__text">
                ${meta(a)}
                <h2 class="jn-card__title">${a.title}</h2>
                <p class="jn-card__desc">${a.desc}</p>
                <span class="link-row">Read the answer${arrow}</span>
              </div>
            </a>
          </li>`;

const index = head({
  title: 'Journal: notes for people planning to build',
  desc: "Plain answers on cost, planning, design and building from Ostra Studio's architects.",
  css: ['css/journal.css'],
}) + header + `  <main id="main" class="pg jn">
    <section class="pg-top" aria-labelledby="jn-title">
      <div class="pg-top__inner">
        ${crumbs([['Home', 'index.html'], ['Journal']])}
        ${title('jn-title', ['Notes for people', 'planning to build.'])}
        <div class="pg-side" data-pg-side>
          <p class="pg-lede">Plain answers on cost, planning, design and building, from the architects who do the work.</p>
        </div>
      </div>
    </section>

    <section class="jn-list" aria-label="Articles">
      <div class="jn-bar">
        <div class="jn-bar__inner" role="group" aria-label="Filter articles">
          <span class="pg-note">Show me</span>
          <button class="jn-chip is-on" type="button" data-filter="all" aria-pressed="true">All<span>${ARTICLES.length}</span></button>
${CATEGORIES.map((c) => `          <button class="jn-chip" type="button" data-filter="${c}" aria-pressed="false">${c}<span>${ARTICLES.filter((a) => a.category === c).length}</span></button>`).join('\n')}
        </div>
      </div>
      <div class="pg-wrap jn-list__wrap">
        <ul class="jn-grid" data-jn-grid>
${ARTICLES.map(card).join('\n')}
        </ul>
        <p class="jn-empty" data-jn-empty hidden>Nothing here yet. Try another topic, or <a href="contact.html">ask us a question</a>.</p>
      </div>
    </section>

${cta('Have a question we haven’t answered?', 'Ask it on a short call. 30 minutes, free, no obligation.')}  </main>

` + tail(['js/journal.js']);
write('journal.html', index);

// ---------------------------------------------------------------- articles
const block = ([tag, v], i) => {
  if (tag === 'h2') return `<h2 id="s${i}">${v}</h2>`;
  if (tag === 'ul' || tag === 'ol') return `<${tag}>${v.map((li) => `<li>${ph(li)}</li>`).join('')}</${tag}>`;
  if (tag === 'div') return `<div class="callout">${ph(v)}</div>`;
  return `<p>${ph(v)}</p>`;
};

for (const a of ARTICLES) {
  const heads = a.body.map((b, i) => [b, i]).filter(([b]) => b[0] === 'h2');
  const rel = ARTICLES.filter((x) => x !== a).sort((x, y) => (y.category === a.category) - (x.category === a.category)).slice(0, 3);
  const proj = PROJECTS_DATA.find((p) => p.slug === a.related);
  const html = head({ title: `${a.title} | Ostra Studio`, desc: a.desc, css: ['css/journal.css'] }) + header + `  <main id="main" class="pg jn">
    <article class="jn-art" aria-labelledby="art-title">
      <header class="jn-art__top">
        ${crumbs([['Home', 'index.html'], ['Journal', 'journal.html'], [a.category]])}
        ${meta(a)}
        <h1 id="art-title" class="jn-art__title" data-pg-title><span class="line"><span>${a.title}</span></span></h1>
        <p class="jn-art__by" data-pg-side><span>By ${a.author[0]}, ${a.author[1]}.</span> <span>Updated ${a.date}.</span></p>
        <figure class="jn-art__cover" data-reveal>${cover(a.cover, coverLabel(a))}</figure>
      </header>
      <div class="jn-art__body">
        <aside class="toc" aria-label="In this article">
          <span class="toc__label">In this article</span>
          <ol data-toc>
            <i class="toc__bar" data-toc-bar aria-hidden="true"></i>
${heads.map(([b, i]) => `            <li><a href="#s${i}">${b[1]}</a></li>`).join('\n')}
          </ol>
        </aside>
        <div class="prose" data-prose>
          <p class="jn-art__open">${ph(a.open)}</p>
          ${a.body.map(block).join('\n          ')}
          ${proj ? `<a class="jn-proj" href="${proj.href || `case-${proj.slug}.html`}">
            <img src="assets/photos/ground/${proj.slug}-800.jpg" width="800" height="533" alt="" loading="lazy" decoding="async">
            <span class="jn-proj__k">See it built</span><span class="jn-proj__t">${proj.name}, ${proj.place}</span><span class="jn-proj__s">${proj.idea}</span>
          </a>` : ''}
          <p class="jn-art__draft">General guidance, not advice for your site. Every project is different, so ask us about yours.</p>
        </div>
      </div>
    </article>

${cta('Planning this yourself?', 'Talk it through with us. A first call takes 30 minutes and costs nothing.')}
    <section class="jn-more" aria-labelledby="jn-more-title">
      <div class="pg-wrap">
        <h2 id="jn-more-title" class="pg-label">Keep reading</h2>
        <ul class="jn-grid jn-grid--3">
${rel.map((r) => card(r, 1).replace(' jn-card--lead', '')).join('\n')}
        </ul>
      </div>
    </section>
  </main>

` + tail(['js/journal.js']);
  write(href(a), html);
}
