// Ostra hero: Lenis + GSAP ScrollTrigger drive one progress value.
// The Remotion ink clip draws the house; the live light layer turns the day.
import { VIEWS, INTRO_END, sunAt, formatClock, window01, easeInOut } from './house.js';
import { Wash, Annotations } from './light.js';

const { gsap, ScrollTrigger, Lenis } = window;
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const mobileMQ = matchMedia('(max-width: 760px), (orientation: portrait) and (max-width: 1024px)');
const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;

const hero = document.querySelector('[data-hero]');
const sheet = hero.querySelector('[data-sheet]');
const boxes = [...hero.querySelectorAll('[data-box]')];
const drawing = hero.querySelector('[data-ink-box]');
const plane = Object.fromEntries([...hero.querySelectorAll('[data-plane]')].map((n) => [n.dataset.plane, n]));
const video = hero.querySelector('[data-ink]');
const still = hero.querySelector('[data-ink-still]');
const beat = hero.querySelector('[data-beat]');
const clocks = [...hero.querySelectorAll('[data-clock]')];
const altEl = hero.querySelector('[data-alt]');
const azEl = hero.querySelector('[data-az]');

const S = {
  mode: '', view: null, wash: null, annot: null,
  scroll: 0, scrollS: 0,          // pinned progress, raw and smoothed
  prog: 0,                         // ink progress 0..1 (video time / duration)
  ready: false, introDone: false, stillMode: false,
  reveal: 0, flow: 0, lastHours: 8, lastClock: '',
  mx: 0, my: 0, tmx: 0, tmy: 0,
};

// ---------------------------------------------------------------- layout
function setMode() {
  const mode = mobileMQ.matches ? 'mobile' : 'desktop';
  if (mode === S.mode) return layout();
  S.mode = mode;
  S.view = VIEWS[mode];
  boxes.forEach((b) => { b.style.width = `${S.view.w}px`; b.style.height = `${S.view.h}px`; });
  S.wash = new Wash(hero.querySelector('[data-wash]'), S.view, { compact: mode === 'mobile' });
  S.annot = new Annotations(hero.querySelector('[data-annot]'), S.view, { compact: mode === 'mobile' });
  still.src = `assets/ink-${mode}-poster.jpg`;
  if (!S.stillMode) {
    S.ready = false; S.introDone = false;
    video.src = `assets/ink-${mode}.mp4`;
    video.load();
  }
  layout();
}

function layout() {
  const W = sheet.clientWidth, H = sheet.clientHeight, v = S.view;
  let k, x, y;
  if (S.mode === 'desktop') {
    // Fit the building and its notes; the white of the clip multiplies away, so no cover crop is needed.
    k = Math.min(W / 1640, H / 930);
    // keep the east wing clear of the right edge; the copy owns the left
    x = W - 120 * (W / 1440) - 1420 * k;
    y = (H - v.h * k) / 2 + H * 0.07;
  } else {
    k = W / v.w;
    x = 0;
    y = H - v.h * k + 8;
  }
  boxes.forEach((b) => {
    b.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) scale(${k.toFixed(4)})`;
    b.style.setProperty('--k', k.toFixed(4));
  });
  // Scale about the building's centre for the slow push-in.
  const ox = x + v.cx * k, oy = y + v.cy * k;
  plane.stage.style.transformOrigin = `${ox}px ${oy}px`;
  plane.ink.style.transformOrigin = `${ox}px ${oy}px`;
  plane.fg.style.transformOrigin = `${ox}px ${oy}px`;
}

// ---------------------------------------------------------------- video
function goStill() {
  S.stillMode = true;
  drawing.classList.add('is-still');
  S.prog = 1; S.ready = true; S.introDone = true;
  video.removeAttribute('src');
  video.load();
}

function onVideoReady() {
  if (S.ready || S.stillMode) return;
  S.ready = true;
  video.currentTime = 0;
  const p = video.play();
  if (p && p.catch) p.catch(() => {
    // Autoplay refused: draw the intro by seeking instead.
    const o = { t: 0 };
    gsap.to(o, { t: INTRO_END * video.duration, duration: 3, ease: 'none', onUpdate: () => { video.currentTime = o.t; } });
  });
}
video.addEventListener('loadeddata', onVideoReady);
video.addEventListener('canplay', onVideoReady);
video.addEventListener('error', goStill);

// ---------------------------------------------------------------- frame
function tick() {
  const v = S.view;
  S.scrollS += (S.scroll - S.scrollS) * 0.16;
  if (Math.abs(S.scroll - S.scrollS) < 0.0005) S.scrollS = S.scroll;
  const p = S.scrollS;

  // Ink: intro plays to INTRO_END, then the scroll owns the clip.
  if (S.ready && !S.stillMode && video.duration) {
    const dur = video.duration;
    if (!S.introDone && video.currentTime >= INTRO_END * dur - 0.03) {
      video.pause();
      S.introDone = true;
      gsap.to(S, { reveal: 1, duration: 1.8, ease: 'power2.out' });
    }
    if (S.introDone) {
      const target = Math.min(dur - 0.04, (INTRO_END + (1 - INTRO_END) * window01(p, 0.02, 0.5)) * dur);
      if (!video.seeking && Math.abs(video.currentTime - target) > 1 / 45) video.currentTime = target;
    }
    S.prog = Math.min(1, video.currentTime / dur);
  }

  // The day: 08:00 to 18:30 across the pin.
  const hours = reduce ? 15.5 : 8 + 10.5 * easeInOut(window01(p, 0.06, 0.94));
  const dh = Math.abs(hours - S.lastHours);
  S.flow += dh * 90 + (S.introDone ? 0.12 : 0);
  S.lastHours = hours;

  const light = S.stillMode ? 1 : window01(S.prog, 0.5, 0.62);
  S.wash.render(S.prog, hours, light);
  S.annot.render(hours, S.stillMode ? 1 : S.reveal, S.flow);

  // Readouts
  const clock = formatClock(hours);
  if (clock !== S.lastClock) {
    S.lastClock = clock;
    const sun = sunAt(hours);
    clocks.forEach((c) => { c.textContent = clock; });
    altEl.textContent = String(Math.round(sun.alt)).padStart(2, '0');
    azEl.textContent = String(Math.round(sun.az)).padStart(3, '0');
  }

  if (reduce) return;

  // Second beat
  const b = window01(p, 0.16, 0.28);
  beat.style.opacity = b.toFixed(3);
  beat.style.transform = `translateY(${((1 - b) * 14).toFixed(1)}px)`;

  // Depth: three planes, three rates (0.15x, 1x, 1.15x), plus a small pointer offset.
  S.mx += (S.tmx - S.mx) * 0.06;
  S.my += (S.tmy - S.my) * 0.06;
  const T = S.mode === 'desktop' ? 120 : 64;
  const push = 1 + 0.045 * easeInOut(p);
  plane.bg.style.transform = `translate3d(${(S.mx * -5).toFixed(2)}px, ${(-p * T * 0.15 + S.my * -3).toFixed(2)}px, 0)`;
  plane.stage.style.transform = plane.ink.style.transform = `translate3d(${(S.mx * -10).toFixed(2)}px, ${(-p * T + S.my * -6).toFixed(2)}px, 0) scale(${push.toFixed(4)})`;
  plane.fg.style.transform = `translate3d(${(S.mx * -16).toFixed(2)}px, ${(-p * T * 1.15 + S.my * -9).toFixed(2)}px, 0) scale(${push.toFixed(4)})`;
}

// ---------------------------------------------------------------- boot
setMode();

if (reduce) {
  goStill();
  S.reveal = 1;
  tick();
} else {
  const lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
  window.__lenis = lenis;
  gsap.registerPlugin(ScrollTrigger);
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => { lenis.raf(t * 1000); tick(); });
  gsap.ticker.lagSmoothing(0);

  ScrollTrigger.create({
    trigger: hero,
    start: 'top top',
    end: () => `+=${Math.round(innerHeight * (S.mode === 'mobile' ? 1.4 : 2.1))}`,
    pin: true,
    pinSpacing: true,
    invalidateOnRefresh: true,
    onUpdate: (self) => { S.scroll = self.progress; },
  });

  // Entrance: the ink curve, slow in and quick out.
  gsap.set(beat, { opacity: 0 });
  const ink = 'expo.out';
  const tl = gsap.timeline({ delay: 0.1 });
  tl.from('.hero__title .line > span', { yPercent: 108, duration: 1.15, ease: ink, stagger: 0.09 })
    .from('.hero__sub, .hero__actions, .hero__trust', { y: 16, opacity: 0, duration: 0.9, ease: ink, stagger: 0.07 }, 0.35)
    .from('.titleblock', { opacity: 0, y: 10, duration: 0.9, ease: ink }, 0.8);

  // If the clip has not arrived in time, show the finished drawing instead of an empty sheet.
  setTimeout(() => { if (!S.ready) goStill(); }, 4500);

  if (fine) {
    sheet.addEventListener('pointermove', (e) => {
      const r = sheet.getBoundingClientRect();
      S.tmx = ((e.clientX - r.left) / r.width - 0.5) * 2;
      S.tmy = ((e.clientY - r.top) / r.height - 0.5) * 2;
    });
    sheet.addEventListener('pointerleave', () => { S.tmx = 0; S.tmy = 0; });

    // Magnetic primary button (design system: primary buttons only, fine pointers only).
    document.querySelectorAll('[data-magnetic]').forEach((btn) => {
      const qx = gsap.quickTo(btn, 'x', { duration: 0.5, ease: 'power3.out' });
      const qy = gsap.quickTo(btn, 'y', { duration: 0.5, ease: 'power3.out' });
      const R = 90;
      window.addEventListener('pointermove', (e) => {
        const r = btn.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        const d = Math.hypot(dx, dy);
        const reach = Math.max(r.width, r.height) / 2 + R;
        if (d < reach) { qx(dx * 0.18); qy(dy * 0.18); } else { qx(0); qy(0); }
      }, { passive: true });
    });
  }

  let rz;
  window.addEventListener('resize', () => {
    clearTimeout(rz);
    rz = setTimeout(() => { setMode(); ScrollTrigger.refresh(); }, 120);
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden) video.pause(); });
}

// ---------------------------------------------------------------- menu
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
