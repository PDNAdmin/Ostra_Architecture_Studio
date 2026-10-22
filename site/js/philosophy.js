// Philosophy section: before, after, bridge, told by one floor plan.
// The plan sits beside the copy and is scrubbed by scroll (Lenis + ScrollTrigger from hero.js).
// Numbered keynotes on the plan match a legend under it, so the drawing explains itself.
const { gsap, ScrollTrigger } = window;
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

const section = document.querySelector('.philosophy');
const svg = section.querySelector('[data-plan-svg]');
const keysets = [...section.querySelectorAll('[data-keyset]')];
const steps = [...section.querySelectorAll('[data-step]')];

const NS = 'http://www.w3.org/2000/svg';
const el = (tag, attrs = {}, parent = svg) => {
  const n = document.createElementNS(NS, tag);
  for (const k in attrs) n.setAttribute(k, attrs[k]);
  parent.appendChild(n);
  return n;
};
const ptsStr = (a) => a.map((p) => p.join(',')).join(' ');
const MM_PER_UNIT = 25; // the plan is 520 units, 13 m, wide

// Room layouts: [x, y, w, h] in plan units. Same rooms, two arrangements.
const BEFORE = {
  bed1: [40, 60, 150, 140], study: [190, 60, 130, 140], bath: [320, 60, 90, 140], kitchen: [410, 60, 150, 140],
  hall: [40, 200, 520, 40], living: [40, 240, 300, 140], bed2: [340, 240, 220, 140], court: [320, 290, 0, 0],
};
const AFTER = {
  bath: [40, 60, 100, 140], study: [140, 60, 90, 140], kitchen: [230, 60, 180, 140], bed1: [410, 60, 150, 160],
  hall: [230, 200, 180, 0], living: [40, 200, 190, 180], bed2: [410, 220, 150, 160], court: [230, 200, 180, 180],
};
const NAMES = { bed1: 'Bed', bed2: 'Bed', study: 'Study', bath: 'Bath', kitchen: 'Kitchen', hall: 'Hall', living: 'Living', court: 'Court' };

// The morning route: bed, kitchen, the chair where you sit. Same point count in both plans so it morphs.
const ROUTE_B = [[115, 108], [115, 220], [485, 220], [485, 165], [485, 225], [110, 225], [110, 338]];
const ROUTE_A = [[485, 108], [425, 160], [330, 168], [300, 182], [240, 212], [180, 262], [135, 315]];
const SEAT_B = [110, 338];
const SEAT_A = [135, 315];
const WEDGE_0 = [[140, 381], [140, 381], [140, 381], [140, 381]];
const WEDGE_1 = [[72, 381], [208, 381], [168, 300], [104, 300]];

// Keynotes: each marker sits on the point its note explains. Order matches the legend lists.
// Ink for what goes wrong, orange for what changes, cyan for testing (design system colour roles).
const KEYS = [
  [[485, 100], [340, 300], [300, 220]],                // kitchen, shared wall, hall route
  [[320, 200], [178, 336], [230, 345], [210, 237]],    // kitchen to court, chair in sun, sliding wall, route
  [[560, 60], [22, 36], [560, 380]],                   // drafts, dimensions, sign-off
];

// ---------------------------------------------------------------- build the drawing
const defs = el('defs');
const hatch = el('pattern', { id: 'plan-dark', width: 6, height: 6, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(45)' }, defs);
el('line', { x1: 0, y1: 0, x2: 0, y2: 6, class: 'pl-hatch' }, hatch);
const dots = el('pattern', { id: 'plan-court', width: 9, height: 9, patternUnits: 'userSpaceOnUse' }, defs);
el('circle', { cx: 2, cy: 2, r: 1.1, class: 'pl-dot' }, dots);
el('circle', { cx: 6.5, cy: 6.5, r: 0.8, class: 'pl-dot' }, dots);

const ghosts = [el('rect', { x: 40, y: 60, width: 520, height: 320, class: 'pl-ghost' }), el('rect', { x: 40, y: 60, width: 520, height: 320, class: 'pl-ghost' })];
const wedge = el('polygon', { points: ptsStr(WEDGE_0), class: 'pl-light' });

const rooms = {};
const darks = {};
const labels = {};
for (const id of Object.keys(BEFORE)) {
  const [x, y, w, h] = BEFORE[id];
  rooms[id] = el('rect', { x, y, width: w, height: h, class: `pl-room${id === 'court' ? ' pl-room--court' : ''}`, pathLength: 1 });
}
for (const id of ['kitchen', 'bath']) {
  const [x, y, w, h] = BEFORE[id];
  darks[id] = el('rect', { x, y, width: w, height: h, class: 'pl-dark' });
}
const outline = el('rect', { x: 40, y: 60, width: 520, height: 320, class: 'pl-outline', pathLength: 1 });
for (const id of Object.keys(BEFORE)) {
  const [x, y, w, h] = BEFORE[id];
  labels[id] = el('text', { x: x + w / 2, y: y + h / 2 + 4, class: 'pl-label', 'text-anchor': 'middle' });
  labels[id].textContent = NAMES[id].toUpperCase();
}

// Window in the living room's south wall, where the light comes in
const glazing = el('g', { class: 'pl-glazing' });
el('rect', { x: 72, y: 376, width: 136, height: 8 }, glazing);
el('line', { x1: 72, y1: 380, x2: 208, y2: 380 }, glazing);

// Sliding wall between living room and court
const door = el('line', { x1: 230, y1: 240, x2: 230, y2: 310, class: 'pl-door' });

// Route and the chair
const route = el('polyline', { points: ptsStr(ROUTE_B), class: 'pl-route', pathLength: 1 });
const routeStart = el('circle', { cx: ROUTE_B[0][0], cy: ROUTE_B[0][1], r: 4, class: 'pl-route-end' });
const seat = el('g', { class: 'pl-seat' });
el('rect', { x: -9, y: -9, width: 18, height: 18, rx: 3 }, seat);
el('line', { x1: -9, y1: -9, x2: 9, y2: -9, class: 'pl-seat-back' }, seat);
seat.setAttribute('transform', `translate(${SEAT_B[0]} ${SEAT_B[1]})`);

// Dimensions and stamp for the final plan
const dims = el('g', { class: 'pl-dims' });
const chain = (xs, y, vertical = false) => {
  const a = vertical ? [y, xs[0]] : [xs[0], y];
  const b = vertical ? [y, xs[xs.length - 1]] : [xs[xs.length - 1], y];
  el('line', { x1: a[0], y1: a[1], x2: b[0], y2: b[1], class: 'pl-dimline', pathLength: 1 }, dims);
  xs.forEach((v, i) => {
    const p = vertical ? [y, v] : [v, y];
    el('line', { x1: p[0] - 4, y1: p[1] + 4, x2: p[0] + 4, y2: p[1] - 4, class: 'pl-dimline' }, dims);
    if (i < xs.length - 1) {
      const m = (v + xs[i + 1]) / 2;
      const mm = Math.round((xs[i + 1] - v) * MM_PER_UNIT);
      const t = vertical
        ? el('text', { x: y - 8, y: m, class: 'pl-dimtext', 'text-anchor': 'middle', transform: `rotate(-90 ${y - 8} ${m})` }, dims)
        : el('text', { x: m, y: y - 7, class: 'pl-dimtext', 'text-anchor': 'middle' }, dims);
      t.textContent = mm.toLocaleString('en-GB').replace(',', ' ');
    }
  });
};
chain([40, 140, 230, 410, 560], 36);
chain([60, 200, 380], 22, true);
const stampAt = el('g', { transform: 'translate(560 430)' });
const stamp = el('g', { class: 'pl-stamp' }, stampAt);
el('rect', { x: -184, y: -20, width: 184, height: 32 }, stamp);
const st = el('text', { x: -92, y: 0, 'text-anchor': 'middle' }, stamp);
st.textContent = 'REV C · READY TO BUILD';

// Keynote markers, drawn last so they sit on top. The inner group is counter-scaled in CSS
// so a marker stays the same size on screen however large the plan is drawn.
const keyGroups = KEYS.map((set, si) => {
  const g = el('g', { class: `pl-keys pl-keys--${si}` });
  set.forEach(([x, y], i) => {
    const at = el('g', { transform: `translate(${x} ${y})` }, g);
    const k = el('g', { class: 'pl-key', style: `--i:${i}` }, at);
    el('circle', { r: 11.5 }, k);
    const t = el('text', { 'text-anchor': 'middle', dy: '0.36em' }, k);
    t.textContent = String(i + 1);
  });
  return g;
});

// ---------------------------------------------------------------- helpers
const lengthOf = (p) => {
  let L = 0;
  for (let i = 1; i < p.length; i++) L += Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1]);
  return (L * MM_PER_UNIT) / 1000;
};
// Route lengths in the legend are measured from the drawn routes, not typed in.
section.querySelector('[data-route-before]').textContent = lengthOf(ROUTE_B).toFixed(1);
section.querySelector('[data-route-after]').textContent = lengthOf(ROUTE_A).toFixed(1);

// Markers clear while the plan is changing; the legend holds its set until the next one is ready.
let lastKeys = '';
const setKeys = (marker, legend = marker) => {
  const key = marker + '|' + legend;
  if (key === lastKeys) return;
  lastKeys = key;
  keysets.forEach((n, j) => n.classList.toggle('is-on', j === legend));
  keyGroups.forEach((g, j) => g.classList.toggle('is-on', j === marker));
};

const fit = () => svg.style.setProperty('--k', (Math.min(svg.clientWidth / 588, svg.clientHeight / 446)).toFixed(3));
fit();
new ResizeObserver(fit).observe(svg);

const attrOf = (r) => ({ x: r[0], y: r[1], width: r[2], height: r[3] });
const labelOf = (r) => ({ x: r[0] + r[2] / 2, y: r[1] + r[3] / 2 + 4 });

// ---------------------------------------------------------------- reduced motion: the finished plan
function finalState() {
  for (const id in AFTER) {
    gsap.set(rooms[id], { attr: attrOf(AFTER[id]), strokeDashoffset: 0 });
    gsap.set(labels[id], { attr: labelOf(AFTER[id]), opacity: id === 'hall' ? 0 : 1 });
  }
  for (const id in darks) gsap.set(darks[id], { attr: attrOf(AFTER[id]), opacity: 0 });
  gsap.set(outline, { strokeDashoffset: 0 });
  gsap.set(route, { attr: { points: ptsStr(ROUTE_A) }, strokeDashoffset: 0 });
  gsap.set(routeStart, { attr: { cx: ROUTE_A[0][0], cy: ROUTE_A[0][1] } });
  gsap.set(seat, { attr: { transform: `translate(${SEAT_A[0]} ${SEAT_A[1]})` } });
  seat.classList.add('is-lit');
  gsap.set(wedge, { attr: { points: ptsStr(WEDGE_1) }, opacity: 1 });
  gsap.set(door, { attr: { y1: 310, y2: 380 }, opacity: 1 });
  gsap.set(glazing, { opacity: 1 });
  gsap.set(ghosts, { opacity: 0 });
  gsap.set(dims, { opacity: 1 });
  gsap.set(stamp, { opacity: 1 });
  steps.forEach((s) => s.classList.add('is-active'));
  setKeys(1); // the finished plan, explained
}

if (reduce) {
  finalState();
} else {
  gsap.registerPlugin(ScrollTrigger);

  // Start: nothing drawn yet.
  gsap.set([...Object.values(rooms), outline, route], { strokeDasharray: '1 1', strokeDashoffset: 1 });
  gsap.set(Object.values(labels), { opacity: 0 });
  gsap.set([door, glazing, routeStart, seat, dims, stamp], { opacity: 0 });
  gsap.set(rooms.court, { opacity: 0 });
  gsap.set(Object.values(darks), { opacity: 0 });
  gsap.set(ghosts[0], { x: 22, y: -16, rotation: -1.2, transformOrigin: '50% 50%', opacity: 0 });
  gsap.set(ghosts[1], { x: -16, y: 12, rotation: 0.8, transformOrigin: '50% 50%', opacity: 0 });
  gsap.set(dims.querySelectorAll('.pl-dimline'), { strokeDasharray: '1 1', strokeDashoffset: 1 });

  const ease = 'power2.inOut';
  const tl = gsap.timeline({ defaults: { ease } });

  // 1. Before: the typical plan draws itself.
  tl.to(outline, { strokeDashoffset: 0, duration: 0.5 }, 0)
    .to(Object.values(rooms).filter((r) => r !== rooms.court), { strokeDashoffset: 0, duration: 0.45, stagger: 0.05 }, 0.15)
    .to(Object.entries(labels).filter(([id]) => id !== 'court').map(([, n]) => n), { opacity: 1, duration: 0.25, stagger: 0.03 }, 0.45)
    .to(Object.values(darks), { opacity: 1, duration: 0.3 }, 0.6)
    .to([routeStart, seat], { opacity: 1, duration: 0.2 }, 0.7)
    .to(route, { strokeDashoffset: 0, duration: 0.45, ease: 'none' }, 0.75);

  // 2. After: the same rooms move around a court. Light finds the chair. The route shortens.
  // Paragraph centres land at about 32%, 64% and 96% of the scroll, so: before by 1.2, morph from 2.3, bridge from 4.1.
  const M = 2.3;
  for (const id in AFTER) {
    tl.to(rooms[id], { attr: attrOf(AFTER[id]), duration: 1 }, M);
    tl.to(labels[id], { attr: labelOf(AFTER[id]), duration: 1 }, M);
  }
  for (const id in darks) tl.to(darks[id], { attr: attrOf(AFTER[id]), opacity: 0, duration: 1 }, M);
  tl.to(labels.hall, { opacity: 0, duration: 0.3 }, M + 0.2)
    .to(rooms.court, { opacity: 1, duration: 0.4 }, M + 0.3)
    .to(labels.court, { opacity: 1, duration: 0.3 }, M + 0.7)
    .to(route, { attr: { points: ptsStr(ROUTE_A) }, duration: 1 }, M)
    .to(routeStart, { attr: { cx: ROUTE_A[0][0], cy: ROUTE_A[0][1] }, duration: 1 }, M)
    .to(seat, { attr: { transform: `translate(${SEAT_A[0]} ${SEAT_A[1]})` }, duration: 1 }, M)
    .to(glazing, { opacity: 1, duration: 0.3 }, M + 0.7)
    .to(wedge, { attr: { points: ptsStr(WEDGE_1) }, opacity: 1, duration: 0.7, ease: 'power3.out' }, M + 0.9)
    // rooms open when you want company: the wall slides back
    .to(door, { opacity: 1, duration: 0.2 }, M + 1)
    .to(door, { attr: { y1: 310, y2: 380 }, duration: 0.5, ease: 'power3.inOut' }, M + 1.25);

  // 3. Bridge: earlier drafts line up, the plan is dimensioned and stamped.
  const N = 4.1;
  tl.to(ghosts, { opacity: 0.55, duration: 0.25 }, N)
    .to(ghosts, { x: 0, y: 0, rotation: 0, duration: 0.8, ease: 'power3.inOut' }, N + 0.15)
    .to(ghosts, { opacity: 0, duration: 0.3 }, N + 0.85)
    .to(dims, { opacity: 1, duration: 0.2 }, N + 0.6)
    .to(dims.querySelectorAll('.pl-dimline'), { strokeDashoffset: 0, duration: 0.4, stagger: 0.02 }, N + 0.6)
    .fromTo(stamp, { opacity: 0, scale: 1.25, transformOrigin: '100% 50%' }, { opacity: 1, scale: 1, duration: 0.35, ease: 'back.out(2)' }, N + 1.1)
    .to({}, { duration: 0.1 }, 5.4); // timeline length 5.5: hold the finished plan

  // Keynotes and chair follow the drawing itself (the scrub eases behind the scroll).
  // Each set shows once its part of the drawing has settled, and clears while the plan changes.
  tl.eventCallback('onUpdate', () => {
    const t = tl.time();
    setKeys(
      t < 1.0 ? -1 : t < M ? 0 : t < M + 1.5 ? -1 : t < N ? 1 : t < N + 1.2 ? -1 : 2,
      t < 1.0 ? -1 : t < M + 1.3 ? 0 : t < N + 1.0 ? 1 : 2,
    );
    seat.classList.toggle('is-lit', t > M + 1.2); // the light reaches the chair
  });

  ScrollTrigger.create({
    trigger: section.querySelector('[data-phil-steps]'),
    start: 'top 85%',
    end: 'bottom bottom',
    animation: tl,
    scrub: 0.6,
  });

  // Each step lights up while it holds the middle of the screen.
  steps.forEach((s) => {
    ScrollTrigger.create({
      trigger: s, start: 'top 62%', end: 'bottom 38%',
      toggleClass: { targets: s, className: 'is-active' },
    });
  });

  // Heading arrives on the ink curve.
  gsap.from(section.querySelector('[data-phil-title]'), {
    y: 28, opacity: 0, duration: 1.1, ease: 'expo.out',
    scrollTrigger: { trigger: section, start: 'top 80%' },
  });

  setKeys(-1);
}
