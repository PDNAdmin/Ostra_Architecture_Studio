// What clients say: tabs (one per worry). Choosing one swaps the quote:
// the old one lifts away, the new one reads in word by word.
const { gsap, ScrollTrigger } = window;
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const section = document.querySelector('[data-voices]');
const tabs = [...section.querySelectorAll('[role="tab"]')];
const quotes = [...section.querySelectorAll('[data-quote]')];

// Split quote text into word spans, keeping the placeholder wrapper so it still reads as one sentence.
function splitWords(p) {
  const host = p.querySelector('.ph') || p;
  const words = host.textContent.trim().split(/\s+/);
  host.textContent = '';
  words.forEach((w, i) => {
    const s = document.createElement('span');
    s.className = 'w';
    s.textContent = i < words.length - 1 ? `${w} ` : w;
    host.appendChild(s);
  });
}
if (!reduce) quotes.forEach((q) => splitWords(q.querySelector('[data-say]')));

function readIn(q) {
  if (reduce) return;
  gsap.fromTo(q, { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.6, ease: 'expo.out' });
  gsap.fromTo(q.querySelectorAll('.w'), { opacity: 0.12 }, { opacity: 1, duration: 0.35, stagger: 0.045, ease: 'none', delay: 0.1 });
  gsap.fromTo(q.querySelector('figcaption'), { opacity: 0 }, { opacity: 1, duration: 0.6, ease: 'power2.out', delay: 0.5 });
}

let current = 0;
let busy = null;
function select(i, focus = false) {
  if (i === current) return;
  const prev = quotes[current];
  const next = quotes[i];
  tabs.forEach((t, j) => {
    t.setAttribute('aria-selected', String(j === i));
    t.tabIndex = j === i ? 0 : -1;
  });
  if (focus) tabs[i].focus();
  current = i;
  if (busy) busy.kill();
  if (reduce) {
    prev.hidden = true;
    next.hidden = false;
    return;
  }
  gsap.killTweensOf([prev, next]);
  busy = gsap.to(prev, {
    autoAlpha: 0, y: -14, duration: 0.28, ease: 'power2.in',
    onComplete: () => {
      quotes.forEach((q) => { q.hidden = q !== next; });
      gsap.set(prev, { clearProps: 'transform' });
      readIn(next);
    },
  });
}

tabs.forEach((t, i) => {
  t.addEventListener('click', () => select(i));
  // Arrow keys move between worries (standard tabs pattern).
  t.addEventListener('keydown', (e) => {
    const k = e.key;
    if (k === 'ArrowDown' || k === 'ArrowRight') { e.preventDefault(); select((i + 1) % tabs.length, true); }
    if (k === 'ArrowUp' || k === 'ArrowLeft') { e.preventDefault(); select((i - 1 + tabs.length) % tabs.length, true); }
    if (k === 'Home') { e.preventDefault(); select(0, true); }
    if (k === 'End') { e.preventDefault(); select(tabs.length - 1, true); }
  });
});

if (!reduce) {
  gsap.registerPlugin(ScrollTrigger);
  // First arrival: heading and worries come in on the ink curve, then the first quote reads in.
  gsap.set(quotes[0], { autoAlpha: 0 });
  gsap.from(section.querySelectorAll('.voices__title, .voices__lede, .voices__tab'), {
    y: 20, opacity: 0, duration: 0.9, ease: 'expo.out', stagger: 0.07,
    scrollTrigger: { trigger: section, start: 'top 70%', once: true },
  });
  ScrollTrigger.create({ trigger: section, start: 'top 55%', once: true, onEnter: () => readIn(quotes[0]) });
}
