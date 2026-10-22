// Journal: covers draw themselves in, the topic filter, and the article's reading ruler.
const { gsap, ScrollTrigger } = window;
const { reduce } = window.__page;

// ---------------------------------------------------------------- covers
// Ink lines draw in, then the bone fills settle, as each cover arrives.
if (!reduce) {
  document.querySelectorAll('[data-cover]').forEach((svg) => {
    const lines = svg.querySelectorAll('.cv-ink');
    const fills = svg.querySelectorAll('.cv-fill, .cv-fill-h, .cv-light, .cv-dots, .cv-ink-fill, .cv-shadow');
    gsap.set(lines, { strokeDasharray: 1, strokeDashoffset: 1 });
    gsap.set(fills, { opacity: 0 });
    gsap.timeline({ scrollTrigger: { trigger: svg, start: 'top 85%', once: true } })
      .to(lines, { strokeDashoffset: 0, duration: 1.1, ease: 'power2.inOut', stagger: 0.05 })
      .to(fills, { opacity: 1, duration: 0.6, ease: 'power1.out', stagger: 0.03 }, 0.5);
  });
}

// ---------------------------------------------------------------- filter
const grid = document.querySelector('[data-jn-grid]');
if (grid) {
  const chips = [...document.querySelectorAll('[data-filter]')];
  const cards = [...grid.querySelectorAll('[data-jn-card]')];
  const empty = document.querySelector('[data-jn-empty]');
  function apply(cat) {
    chips.forEach((c) => { const on = c.dataset.filter === cat; c.classList.toggle('is-on', on); c.setAttribute('aria-pressed', String(on)); });
    let first = true;
    cards.forEach((card) => {
      const show = cat === 'all' || card.dataset.cat === cat;
      card.hidden = !show;
      // the first visible article always leads
      card.classList.toggle('jn-card--lead', show && first);
      if (show) first = false;
    });
    empty.hidden = cards.some((c) => !c.hidden);
    if (!reduce) gsap.fromTo(cards.filter((c) => !c.hidden), { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.6, ease: 'expo.out', stagger: 0.05 });
    ScrollTrigger.refresh();
  }
  chips.forEach((c) => c.addEventListener('click', () => apply(c.dataset.filter)));
}

// ---------------------------------------------------------------- reading ruler
const toc = document.querySelector('[data-toc]');
if (toc) {
  const prose = document.querySelector('[data-prose]');
  const bar = toc.querySelector('[data-toc-bar]');
  const links = [...toc.querySelectorAll('a')];
  const heads = links.map((a) => document.querySelector(a.getAttribute('href')));
  ScrollTrigger.create({
    trigger: prose, start: 'top 60%', end: 'bottom 60%',
    onUpdate: (self) => { bar.style.setProperty('--read', `${(self.progress * 100).toFixed(1)}%`); },
  });
  heads.forEach((h, i) => ScrollTrigger.create({
    trigger: h, start: 'top 45%', end: () => (heads[i + 1] ? `top+=${heads[i + 1].offsetTop - h.offsetTop} 45%` : 'bottom top'),
    onToggle: (self) => { if (self.isActive) links.forEach((l, j) => l.classList.toggle('is-on', j === i)); },
  }));
}
