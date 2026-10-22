// Case study page: smooth scroll, the title and drawing arriving, and the walkthrough.
// The walkthrough is a Remotion 3D film (remotion/src/Walkthrough.tsx) scrubbed by scroll;
// captions, the room ruler and the numbered keynotes are live text kept in step with it.
const { gsap, ScrollTrigger, Lenis } = window;
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
const mobile = matchMedia('(max-width: 760px)').matches;

// ---------------------------------------------------------------- smooth scroll
gsap.registerPlugin(ScrollTrigger);
if (!reduce) {
  const lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
  window.__lenis = lenis;
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}

// ---------------------------------------------------------------- menu (same behaviour as the home page)
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

// ---------------------------------------------------------------- arrivals
if (!reduce) {
  gsap.from('[data-case-title] .line > span', { yPercent: 108, duration: 1.1, ease: 'expo.out', stagger: 0.09, delay: 0.1 });
  gsap.from('[data-facts] > div', { opacity: 0, y: 14, duration: 0.8, ease: 'expo.out', stagger: 0.05, delay: 0.45 });
  // the drawing is printed in, top to bottom, like a sheet coming off the plotter
  // The drawing prints in top to bottom, then the house develops out of its orange roof.
  gsap.timeline({ defaults: { ease: 'none' },
    scrollTrigger: { trigger: '[data-case-drawing]', start: 'top 85%', end: 'bottom 80%', scrub: 0.4 } })
    .fromTo('[data-case-drawing] picture img', { clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)', duration: 1 })
    .fromTo('[data-case-render]', { '--r': '0%', '--g': 1, scale: 1.06 }, { '--r': '170%', duration: 0.9, ease: 'power2.in' }, 1.1)
    .to('[data-case-render]', { '--g': 0, scale: 1, duration: 0.7, ease: 'power2.out' }, 1.45)
    .to('[data-case-drawing] picture img', { opacity: 0, duration: 0.45 }, 1.4);
  gsap.utils.toArray('[data-reveal]').forEach((el) => {
    gsap.from(el, { opacity: 0, y: 24, duration: 0.9, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 82%', once: true } });
  });
  if (fine) {
    document.querySelectorAll('[data-magnetic]').forEach((btn) => {
      const qx = gsap.quickTo(btn, 'x', { duration: 0.5, ease: 'power3.out' });
      const qy = gsap.quickTo(btn, 'y', { duration: 0.5, ease: 'power3.out' });
      window.addEventListener('pointermove', (e) => {
        const r = btn.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
        const reach = Math.max(r.width, r.height) / 2 + 90;
        if (Math.hypot(dx, dy) < reach) { qx(dx * 0.18); qy(dy * 0.18); } else { qx(0); qy(0); }
      }, { passive: true });
    });
  }
}

// ---------------------------------------------------------------- walk through it
const walk = document.querySelector('[data-walk]');
const video = walk.querySelector('[data-walk-video]');
const still = walk.querySelector('[data-walk-still]');
const caps = [...walk.querySelectorAll('[data-walk-caps] li')];
const rulerItems = [...walk.querySelectorAll('.walk__ruler li')];
const marker = walk.querySelector('[data-walk-marker]');
// The photoreal walkthrough (16:9; a square crop on phones), re-encoded with a keyframe every 6 frames so it scrubs smoothly.
const FILM = mobile ? 'assets/house-walk-mobile' : 'assets/house-walk';
still.src = `${FILM}-poster.jpg`;

// Rooms along the ruler, by film progress: outside, front door, living room, the court.
const ROOMS = [0, 0.32, 0.6, 0.78, 1];

function staticWalk() {
  walk.classList.add('walk--static');
  caps.forEach((c) => c.classList.add('is-on'));
}

if (reduce) {
  staticWalk();
} else {
  video.src = `${FILM}.mp4`;
  video.load();
  let ready = false;
  video.addEventListener('loadeddata', () => { ready = true; });
  video.addEventListener('canplay', () => { ready = true; });

  const S = { s: 0, ss: 0, cap: -1, room: -1 };
  const st = ScrollTrigger.create({
    trigger: walk,
    start: 'top top',
    end: () => `+=${Math.round(innerHeight * (mobile ? 4.5 : 5.5))}`,
    pin: walk.querySelector('[data-walk-pin]'),
    scrub: true,
    invalidateOnRefresh: true,
    onUpdate: (self) => { S.s = self.progress; },
  });

  gsap.ticker.add(() => {
    S.ss += (S.s - S.ss) * 0.16;
    if (Math.abs(S.s - S.ss) < 0.0004) S.ss = S.s;
    const p = S.ss;
    if (ready && video.duration) {
      const t = Math.min(video.duration - 0.04, p * video.duration);
      if (!video.seeking && Math.abs(video.currentTime - t) > 1 / 45) video.currentTime = t;
    }
    const ci = caps.findIndex((c) => p >= +c.dataset.from && p < +c.dataset.to);
    if (ci !== S.cap) { S.cap = ci; caps.forEach((c, j) => c.classList.toggle('is-on', j === ci)); }
    let r = 0;
    while (r < 3 && p >= ROOMS[r + 1]) r++;
    if (r !== S.room) { S.room = r; rulerItems.forEach((li, j) => li.classList.toggle('is-on', j === r)); }
    const within = (p - ROOMS[r]) / (ROOMS[r + 1] - ROOMS[r]);
    marker.style.left = `${((r + Math.min(1, Math.max(0, within))) / 4) * 100}%`;
  });

  video.addEventListener('error', () => { st.kill(true); staticWalk(); ScrollTrigger.refresh(); });
}

// ---------------------------------------------------------------- the finished house
// A key plan of the house (the hero's geometry, js/house.js) with one camera. As the photos slide past,
// the camera walks to where each was taken and its view cone turns to match.
import('./house.js').then(({ BOXES, TREES, SITE }) => {
  const shots = document.querySelector('[data-shots]');
  if (!shots) return;
  const svg = shots.querySelector('[data-shots-plan]');
  const figs = [...shots.querySelectorAll('[data-shot]')];
  const cams = figs.map((f) => f.dataset.cam.split(',').map(Number));
  const NS = 'http://www.w3.org/2000/svg';
  const el = (tag, attrs, parent = svg) => {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    parent.appendChild(e);
    return e;
  };
  // plan coordinates are x east, y north, so the plan group flips y
  const g = el('g', { transform: 'scale(1,-1)' });
  el('rect', { class: 'kp-site', x: SITE.min[0], y: SITE.min[1], width: SITE.max[0] - SITE.min[0], height: SITE.max[1] - SITE.min[1] }, g);
  el('rect', { class: 'kp-court', x: 0.35, y: 0.35, width: 13.65, height: 8.65 }, g);
  for (const b of BOXES) {
    if (b.id === 'roof' || b.id === 'flue') continue;
    el('rect', { class: b.id.startsWith('wall') ? 'kp-wall' : 'kp-wing', x: b.min[0], y: b.min[1], width: b.max[0] - b.min[0], height: b.max[1] - b.min[1] }, g);
  }
  for (const t of TREES) el('circle', { class: 'kp-tree', cx: t.base[0], cy: t.base[1], r: t.r }, g);
  el('path', { class: 'kp-north', d: 'M21 -14.5 v-2.6 M20.2 -16.2 L21 -17.4 L21.8 -16.2' });
  el('text', { class: 'kp-north-t', x: 21, y: -13.2 }).textContent = 'N';
  const wedge = (x, y, dir, fov, r) => {
    const a0 = (dir - fov / 2) * Math.PI / 180, a1 = (dir + fov / 2) * Math.PI / 180;
    return `M${x} ${y} L${x + r * Math.cos(a0)} ${y + r * Math.sin(a0)} A${r} ${r} 0 0 1 ${x + r * Math.cos(a1)} ${y + r * Math.sin(a1)} Z`;
  };
  const marks = cams.map(([x, y], i) => {
    const m = el('g', { class: 'kp-mark' });
    el('circle', { cx: x, cy: -y, r: 0.75 }, m);
    el('text', { x, y: -y }, m).textContent = i + 1;
    return m;
  });

  if (reduce || mobile) {
    // no pin: show every camera position at once, numbered like the photos
    cams.forEach((c) => el('path', { class: 'kp-cone', d: wedge(c[0], c[1], c[2], c[3], 4) }, g));
    marks.forEach((m) => svg.appendChild(m));
    return;
  }

  const cone = el('path', { class: 'kp-cone' }, g);
  const cam = el('circle', { class: 'kp-cam', r: 0.55 }, g);
  marks.forEach((m) => svg.appendChild(m));
  const nEl = shots.querySelector('[data-shots-n]');
  const roomEl = shots.querySelector('[data-shots-room]');
  const rooms = figs.map((f) => f.querySelector('.shot__room').textContent);
  const ease = gsap.parseEase('power2.inOut');
  const lerpAng = (a, b, t) => a + ((((b - a + 540) % 360) - 180) * t);
  let on = -1;
  function at(p) {
    const f = p * (cams.length - 1);
    const i = Math.min(cams.length - 2, Math.floor(f));
    const t = ease(Math.min(1, f - i));
    const [x0, y0, d0, v0] = cams[i], [x1, y1, d1, v1] = cams[i + 1];
    const x = x0 + (x1 - x0) * t, y = y0 + (y1 - y0) * t;
    cone.setAttribute('d', wedge(x, y, lerpAng(d0, d1, t), v0 + (v1 - v0) * t, 7));
    cam.setAttribute('cx', x);
    cam.setAttribute('cy', y);
    const n = Math.round(f);
    if (n !== on) {
      on = n;
      marks.forEach((m, j) => m.classList.toggle('is-on', j === n));
      nEl.textContent = String(n + 1).padStart(2, '0');
      roomEl.textContent = rooms[n];
    }
  }
  at(0);
  const track = shots.querySelector('[data-shots-track]');
  const dist = () => Math.max(0, track.scrollWidth - track.clientWidth);
  gsap.to(track, {
    x: () => -dist(), ease: 'none',
    scrollTrigger: {
      trigger: shots, start: 'top top', end: () => `+=${Math.round(dist() * 1.1)}`,
      pin: shots.querySelector('[data-shots-pin]'), scrub: 0.6, invalidateOnRefresh: true,
      onUpdate: (self) => {
        at(self.progress);
        // each photo drifts inside its frame as it crosses the screen
        const mid = innerWidth * 0.65;
        figs.forEach((f) => {
          const r = f.getBoundingClientRect();
          f.style.setProperty('--px', `${(((r.left + r.width / 2) - mid) / innerWidth) * -6}%`);
        });
      },
    },
  });
  ScrollTrigger.refresh();
});
