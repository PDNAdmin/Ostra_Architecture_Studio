// Sustainability: the noon sun through the year, on a section of a south-facing room.
// Altitude = 90° − latitude + declination; declination runs from −23.44° (December) to +23.44° (June).
// Rays are traced in 2D against the overhang, the wall and the opening, so the light patch is real geometry.
const { gsap, ScrollTrigger } = window;
const { reduce, mobile } = window.__page;
const root = document.querySelector('[data-sun]');
const svg = root.querySelector('[data-sun-svg]');
const NS = 'http://www.w3.org/2000/svg';
const el = (tag, attrs, parent = svg) => {
  const e = document.createElementNS(NS, tag);
  for (const k in attrs) e.setAttribute(k, attrs[k]);
  parent.appendChild(e);
  return e;
};
if (mobile) svg.setAttribute('viewBox', '160 30 840 500');
const LAT = 51.5;
const MONTHS = ['December', 'January', 'February', 'March', 'April', 'May', 'June'];

// geometry, in view units; south is to the left
const G = 470;                 // ground and floor level
const W0 = 520, W1 = 560;      // south wall, outer and inner face
const HEAD = 260, SILL = 430;  // window opening
const OH = 400, OHY = 230;     // overhang tip x and underside
const N1 = 880;                // north wall inner face
const ROOF = 200;

// ---- static drawing
el('defs', {}).innerHTML = `<pattern id="sun-hatch" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><path d="M0 0v9" class="sn-hatch"/></pattern>
<pattern id="sun-mass" width="14" height="14" patternUnits="userSpaceOnUse"><circle cx="3" cy="3" r="1.3" class="sn-dot"/><circle cx="10" cy="10" r="1.3" class="sn-dot"/></pattern>`;
el('path', { class: 'sn-ground', d: `M0 ${G}H1000` });
for (let x = 10; x < 1000; x += 22) el('path', { class: 'sn-earth', d: `M${x} ${G + 4}l-10 12` });
const patch = el('path', { class: 'sn-patch' });
const wallPatch = el('path', { class: 'sn-patch' });
el('path', { class: 'sn-mass', d: `M${W1} ${G}H${N1}v22H${W1}z` });
el('path', { class: 'sn-line', d: `M${W1} ${G}H${N1}v22H${W1}z` });
// south wall with its opening, hatched as insulation
el('path', { class: 'sn-wall', d: `M${W0} ${OHY}H${W1}V${HEAD}H${W0}z M${W0} ${SILL}H${W1}V${G + 22}H${W0}z` });
el('path', { class: 'sn-glass', d: `M${(W0 + W1) / 2} ${HEAD}V${SILL}` });
// north wall and roof
el('path', { class: 'sn-wall', d: `M${N1} ${ROOF + 30}h40V${G + 22}h-40z` });
el('path', { class: 'sn-wall', d: `M${OH} ${ROOF}H${N1 + 60}v30H${OH}z` });
el('path', { class: 'sn-line', d: `M${OH} ${OHY}H${W0}` });
// labels
const label = (x, y, t, anchor = 'start') => { const e = el('text', { class: 'sn-label', x, y, 'text-anchor': anchor }); e.textContent = t; return e; };
label(OH, ROOF - 14, 'OVERHANG');
label(W1 + 14, G + 46, 'FLOOR STORES THE HEAT');
label(N1 - 10, ROOF + 56, 'NORTH', 'end');
label(30, G + 46, 'SOUTH');
// sun, its arc and the angle readout
const cx = (W0 + W1) / 2, cy = (HEAD + SILL) / 2, R = 330;
el('path', { class: 'sn-arc', d: `M${cx - R} ${cy}A${R} ${R} 0 0 1 ${cx} ${cy - R}` });
el('path', { class: 'sn-arc', d: `M${cx} ${cy}H${cx - R}` });
const angle = el('path', { class: 'sn-angle' });
const rays = el('g', { class: 'sn-rays' });
const sun = el('g', { class: 'sn-sun' });
el('circle', { r: 26, class: 'sn-sun__disc' }, sun);
for (let i = 0; i < 12; i++) {
  const a = (i / 12) * Math.PI * 2;
  el('path', { class: 'sn-sun__ray', d: `M${Math.cos(a) * 36} ${Math.sin(a) * 36}L${Math.cos(a) * 48} ${Math.sin(a) * 48}` }, sun);
}

// ---- trace one ray from the sun toward a point on the outer wall plane
function trace(sx, sy, tan, ty) {
  // crosses the overhang underside first?
  if (ty > OHY) {
    const xAt = W0 - (ty - OHY) / tan;
    if (xAt >= OH && xAt <= W0) return [[sx, sy], [xAt, OHY]];
  }
  if (ty < HEAD || ty > SILL) return [[sx, sy], [W0, ty]];
  // through the opening: on to the floor, or the north wall
  const xFloor = W0 + (G - ty) / tan;
  if (xFloor <= N1) return [[sx, sy], [xFloor, G]];
  return [[sx, sy], [N1, ty + (N1 - W0) * tan]];
}

const monthEl = root.querySelector('[data-sun-month]');
const degEl = root.querySelector('[data-sun-deg]');
const tick = root.querySelector('[data-sun-tick]');
const caps = [...root.querySelectorAll('[data-sun-caps] li')];
let capOn = -1;

function draw(p) {
  const decl = -23.44 * Math.cos(Math.PI * p);
  const alt = 90 - LAT + decl;
  const a = (alt * Math.PI) / 180, tan = Math.tan(a);
  const sx = cx - R * Math.cos(a), sy = cy - R * Math.sin(a);
  sun.setAttribute('transform', `translate(${sx} ${sy})`);
  angle.setAttribute('d', `M${cx - 90} ${cy}A90 90 0 0 1 ${cx - 90 * Math.cos(a)} ${cy - 90 * Math.sin(a)}`);
  // rays: sunlight is parallel, so every ray starts on the line through the sun at right angles to it
  rays.innerHTML = '';
  const dx = Math.cos(a), dy = Math.sin(a);
  for (let i = 0; i < 7; i++) {
    const ty = OHY + 14 + i * ((SILL + 30 - OHY) / 6);
    const t = (W0 - sx) * dx + (ty - sy) * dy;
    const pts = trace(W0 - dx * t, ty - dy * t, tan, ty);
    const lit = pts[1][0] > W0;
    el('path', { class: lit ? 'sn-ray sn-ray--in' : 'sn-ray', d: `M${pts[0][0]} ${pts[0][1]}L${pts[1][0]} ${pts[1][1]}` }, rays);
  }
  // the lit patch: between the ray past the top limit and the ray past the sill (inner faces)
  const top = Math.max(HEAD + (W1 - W0) * tan, OHY + (W1 - OH) * tan);
  if (top >= SILL) { patch.setAttribute('d', ''); wallPatch.setAttribute('d', ''); }
  else {
    const x1 = W1 + (G - SILL) / tan;
    const xTop = W1 + (G - top) / tan;
    if (xTop <= N1) { patch.setAttribute('d', `M${x1} ${G}L${xTop} ${G}`); wallPatch.setAttribute('d', ''); }
    else {
      patch.setAttribute('d', `M${Math.min(x1, N1)} ${G}L${N1} ${G}`);
      const yTop = top + (N1 - W1) * tan;
      const yLow = Math.min(G, SILL + (N1 - W1) * tan);
      wallPatch.setAttribute('d', `M${N1} ${yTop}L${N1} ${yLow}`);
    }
  }
  // readouts
  const m = Math.round(p * 6);
  monthEl.textContent = MONTHS[m];
  degEl.textContent = Math.round(alt);
  tick.style.left = `${(p * 100).toFixed(2)}%`;
  const c = caps.findIndex((li) => p < +li.dataset.to);
  if (c !== capOn) { capOn = c; caps.forEach((li, j) => li.classList.toggle('is-on', j === c)); }
}

if (reduce) {
  draw(0);
  root.classList.add('sun--static');
  caps.forEach((li) => li.classList.add('is-on'));
} else {
  draw(0);
  const S = { s: 0, ss: 0 };
  ScrollTrigger.create({
    trigger: root, start: 'top top', end: () => `+=${Math.round(innerHeight * (mobile ? 2.2 : 2.6))}`,
    pin: root.querySelector('[data-sun-pin]'), scrub: true, invalidateOnRefresh: true,
    onUpdate: (self) => { S.s = self.progress; },
  });
  gsap.ticker.add(() => {
    if (Math.abs(S.s - S.ss) < 0.0005) return;
    S.ss += (S.s - S.ss) * 0.14;
    draw(S.ss);
  });
}
