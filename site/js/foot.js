// Footer: the wordmark is the last drawing on the page. Its outline is traced, then diagonal
// hatching sweeps across the letters, finishing exactly as the page reaches its end.
// Also: back to top through Lenis, and the cookie choices.
const { gsap, ScrollTrigger } = window;
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const foot = document.querySelector('[data-foot]');
const svg = foot.querySelector('[data-wordmark]');
const NS = 'http://www.w3.org/2000/svg';
const el = (tag, attrs, parent = svg) => {
  const n = document.createElementNS(NS, tag);
  for (const k in attrs) n.setAttribute(k, attrs[k]);
  parent.appendChild(n);
  return n;
};

// ---------------------------------------------------------------- wordmark
const W = 1000, H = 268, BASE = 236;
const textAttrs = {
  x: 2, y: BASE, textLength: W - 4, lengthAdjust: 'spacingAndGlyphs',
  'font-family': 'Space Grotesk, Helvetica Neue, Arial, sans-serif', 'font-weight': 700, 'font-size': 300, 'letter-spacing': -10,
};
const defs = el('defs', {});
const clip = el('clipPath', { id: 'wm-clip' }, defs);
el('text', textAttrs, clip).textContent = 'Ostra';

// hatching, clipped to the letters: 45 degree lines across the whole mark
const hatch = el('g', { class: 'wm-hatch', 'clip-path': 'url(#wm-clip)' });
const lines = [];
const GAP = 9;
for (let c = -H; c < W + H; c += GAP) {
  lines.push(el('line', { x1: c, y1: H, x2: c + H, y2: 0, pathLength: 1 }, hatch));
}
const outline = el('text', { ...textAttrs, class: 'wm-outline' });
outline.textContent = 'Ostra';

if (reduce) {
  // finished drawing
} else {
  gsap.registerPlugin(ScrollTrigger);
  gsap.set(lines, { strokeDasharray: '1 1', strokeDashoffset: 1 });
  gsap.set(outline, { strokeDasharray: '1600 1600', strokeDashoffset: 1600 });
  const tl = gsap.timeline({ defaults: { ease: 'none' } })
    .to(outline, { strokeDashoffset: 0, duration: 0.4 }, 0)
    .to(lines, { strokeDashoffset: 0, duration: 0.12, stagger: { amount: 0.55 } }, 0.22);
  ScrollTrigger.create({
    trigger: svg,
    start: 'top bottom+=160', // just before the mark comes on screen, so the outline is traced as it arrives
    endTrigger: foot,
    end: 'bottom bottom', // the footer's bottom edge meets the screen's: the end of the page
    animation: tl,
    scrub: 0.4,
    invalidateOnRefresh: true,
  });
  // If the page ends before the mark reaches that line, finish on arrival at the bottom.
  ScrollTrigger.create({
    trigger: foot, start: 'bottom bottom',
    onEnter: () => gsap.to(tl, { progress: 1, duration: 0.6, ease: 'power2.out', overwrite: true }),
  });

  gsap.from(foot.querySelectorAll('.foot__line, .foot__ask, .foot__cell'), {
    y: 18, opacity: 0, duration: 0.9, ease: 'expo.out', stagger: 0.06,
    scrollTrigger: { trigger: foot, start: 'top 80%', once: true },
  });
}

// ---------------------------------------------------------------- back to top
foot.querySelector('[data-to-top]').addEventListener('click', (e) => {
  if (window.__lenis) {
    e.preventDefault();
    window.__lenis.scrollTo(0, { duration: 2.2 });
    document.querySelector('.skip')?.focus({ preventScroll: true });
  }
});

// ---------------------------------------------------------------- cookie choices
const box = document.querySelector('[data-cookies]');
const KEY = 'ostra-cookies';
const read = () => { try { return localStorage.getItem(KEY); } catch { return null; } };
const save = (v) => { try { localStorage.setItem(KEY, v); } catch { /* private mode: ask again next visit */ } };
const manage = box.querySelector('[data-cookies-manage]');
const toggle = box.querySelector('[data-cookies-toggle]');
const analytics = box.querySelector('[data-cookies-analytics]');

function close(choice) {
  save(choice);
  if (reduce) { box.hidden = true; return; }
  gsap.to(box, { y: 24, autoAlpha: 0, duration: 0.3, ease: 'power2.in', onComplete: () => { box.hidden = true; } });
}
box.querySelector('[data-cookies-accept]').addEventListener('click', () => close('all'));
box.querySelector('[data-cookies-essential]').addEventListener('click', () => close('essential'));
toggle.addEventListener('click', () => {
  const open = manage.hidden;
  manage.hidden = !open;
  toggle.setAttribute('aria-expanded', String(open));
  toggle.textContent = open ? 'Save choices' : 'Manage';
  if (!open) close(analytics.checked ? 'all' : 'essential');
});

if (!read()) {
  setTimeout(() => {
    box.hidden = false;
    if (!reduce) gsap.from(box, { y: 24, autoAlpha: 0, duration: 0.6, ease: 'expo.out' });
  }, 1600);
}
