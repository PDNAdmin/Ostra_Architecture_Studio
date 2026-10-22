// Work page: smooth scroll, filter chips that rearrange the sheets in place (GSAP Flip),
// a Sheets / Index view switch, drawings that ink themselves as each sheet comes into view,
// and in Index view a drawing preview that follows the pointer.
import { PROJECTS, build, drawTimeline } from './drawings.js';

const { gsap, ScrollTrigger, Flip, Lenis } = window;
gsap.registerPlugin(ScrollTrigger, Flip);
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;

// ---------------------------------------------------------------- smooth scroll and menu
if (!reduce) {
  const lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
  window.__lenis = lenis;
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}
const menu = document.querySelector('[data-menu]');
const openBtn = document.querySelector('[data-menu-open]');
const closeBtn = document.querySelector('[data-menu-close]');
function setMenu(open) {
  menu.hidden = !open;
  openBtn.setAttribute('aria-expanded', String(open));
  document.documentElement.style.overflow = open ? 'hidden' : '';
  if (window.__lenis) open ? window.__lenis.stop() : window.__lenis.start();
  (open ? menu.querySelector('a') : openBtn).focus();
}
openBtn.addEventListener('click', () => setMenu(true));
closeBtn.addEventListener('click', () => setMenu(false));
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !menu.hidden) setMenu(false); });

// ---------------------------------------------------------------- drawings
const list = document.querySelector('[data-wx-list]');
const cards = [...list.querySelectorAll('.wx-card')];
// One timeline per sheet: the ink drawing draws itself, then the render develops out of the key idea
// (an ink-bleed that grows from the orange part, desaturated to full colour), the sketch fades, and a pin marks the idea.
const items = cards.map((card) => {
  const svg = card.querySelector('[data-drawing]');
  const photo = card.querySelector('.wx-card__photo');
  const pin = card.querySelector('.wx-card__pin');
  const draw = drawTimeline(build(svg, PROJECTS[svg.dataset.drawing]));
  const tl = gsap.timeline({ paused: true, defaults: { ease: 'none' } });
  tl.add(draw.paused(false), 0);
  if (photo) {
    tl.fromTo(photo, { '--r': '0%', '--g': 1, scale: 1.08 }, { '--r': '175%', duration: 0.9, ease: 'power2.in' }, 1.02)
      .to(photo, { '--g': 0, scale: 1, duration: 0.7, ease: 'power2.out' }, 1.35)
      .to(svg, { opacity: 0, duration: 0.45 }, 1.45);
    if (pin) tl.fromTo(pin, { autoAlpha: 0, y: 6 }, { autoAlpha: 1, y: 0, duration: 0.2 }, 1.95);
    // then a snapshot of the house from the ground is clipped to the sheet
    const snap = card.querySelector('[data-snap]');
    if (snap) tl.fromTo(snap, { autoAlpha: 0, y: 28, rotation: -11 }, { autoAlpha: 1, y: 0, rotation: -3, duration: 0.22, ease: 'back.out(1.6)' }, 2.0);
    tl.to({}, { duration: 0.05 }, 2.15);
  }
  return { card, svg, tl, st: null };
});

let view = 'sheets';
function bindDrawings() {
  items.forEach((it) => {
    if (it.st) it.st.kill();
    it.st = null;
    if (reduce || view === 'index') { it.tl.progress(1); return; }
    // Ink in as the sheet arrives; finished once the whole drawing is on screen.
    // Ink, then render: starts as the sheet arrives, finished while the whole sheet is still on screen.
    it.st = ScrollTrigger.create({
      trigger: it.card.querySelector('.wx-card__media'), start: 'top 95%', end: 'center 42%',
      animation: it.tl, scrub: 0.4, invalidateOnRefresh: true,
    });
  });
}

// Alternate wide and narrow sheets (7/5, then 5/7) across the visible ones.
function sizeSheets() {
  const shown = cards.filter((c) => !c.hidden);
  shown.forEach((c, i) => {
    const row = Math.floor(i / 2);
    const first = i % 2 === 0;
    c.dataset.size = shown.length === 1 ? 'wide' : (row % 2 === 0) === first ? 'wide' : 'narrow';
  });
}

// ---------------------------------------------------------------- filter
const chips = [...document.querySelectorAll('[data-filter]')];
const empty = document.querySelector('[data-wx-empty]');
const match = (c, f) => f === 'all' || (f === 'progress' ? c.dataset.status === 'progress' : c.dataset.type === f);

function applyFilter(f, animate = true) {
  chips.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.filter === f)));
  const state = animate && !reduce ? Flip.getState(cards) : null;
  cards.forEach((c) => { c.hidden = !match(c, f); });
  sizeSheets();
  empty.hidden = cards.some((c) => !c.hidden);
  const url = new URL(location.href);
  if (f === 'all') url.searchParams.delete('show'); else url.searchParams.set('show', f);
  history.replaceState(null, '', url);
  if (state) {
    Flip.from(state, {
      duration: 0.7, ease: 'power3.inOut', absolute: true, nested: true,
      onEnter: (els) => gsap.fromTo(els, { opacity: 0, scale: 0.96 }, { opacity: 1, scale: 1, duration: 0.5, delay: 0.2 }),
      onLeave: (els) => gsap.to(els, { opacity: 0, scale: 0.96, duration: 0.3 }),
      onComplete: () => ScrollTrigger.refresh(),
    });
  } else {
    ScrollTrigger.refresh();
  }
}
chips.forEach((b) => b.addEventListener('click', () => applyFilter(b.dataset.filter)));
document.querySelector('[data-clear]').addEventListener('click', (e) => { e.preventDefault(); applyFilter('all'); });

// ---------------------------------------------------------------- view: sheets or index
const viewBtns = [...document.querySelectorAll('[data-view]')];
function setView(v) {
  if (v === view) return;
  viewBtns.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.view === v)));
  const state = reduce ? null : Flip.getState(cards.filter((c) => !c.hidden).map((c) => c.querySelector('.wx-card__block')));
  view = v;
  if (v === 'sheets') gsap.set(cards.map((c) => c.querySelector('.wx-card__media')), { x: 0, y: 0 });
  document.body.classList.toggle('wx--index', v === 'index');
  bindDrawings();
  if (state) Flip.from(state, { duration: 0.6, ease: 'power3.inOut', nested: true, onComplete: () => ScrollTrigger.refresh() });
  else ScrollTrigger.refresh();
}
viewBtns.forEach((b) => b.addEventListener('click', () => setView(b.dataset.view)));

// Index view: the row's drawing follows the pointer as a preview.
if (fine) {
  cards.forEach((c) => {
    const media = c.querySelector('.wx-card__media');
    const qx = gsap.quickTo(media, 'x', { duration: 0.45, ease: 'power3.out' });
    const qy = gsap.quickTo(media, 'y', { duration: 0.45, ease: 'power3.out' });
    c.addEventListener('pointermove', (e) => {
      if (view !== 'index') return;
      const r = c.getBoundingClientRect();
      qx(e.clientX - r.left - 160);
      qy(e.clientY - r.top - 230);
    });
    c.addEventListener('pointerleave', () => { if (view === 'index') { qx(0); qy(0); } });
  });
}

// ---------------------------------------------------------------- arrivals
if (!reduce) {
  gsap.from('[data-wx-title] .line > span', { yPercent: 108, duration: 1.1, ease: 'expo.out', stagger: 0.09, delay: 0.1 });
  gsap.from('.wx-top__side > *, .wx-bar__inner > *', { opacity: 0, y: 14, duration: 0.8, ease: 'expo.out', stagger: 0.06, delay: 0.4 });
}

const start = new URLSearchParams(location.search).get('show');
applyFilter(chips.some((b) => b.dataset.filter === start) ? start : 'all', false);
bindDrawings();
