// Live ink axonometrics, shared by the home page (Recent work) and the Work page.
// build(svg, spec) draws one project; drawTimeline(g) returns a 0-to-1 GSAP timeline to scrub:
// site line, then each part (outline, then solid), trees, then the key idea in orange and its label.
import { BOXES as COURT_BOXES, TREES as COURT_TREES } from './house.js';

// ---------------------------------------------------------------- projects
// Units are metres; x east, y north, z up, seen from the south-west like the hero.
// Parts are listed back to front. `paint: true` marks the key idea; `idea` is where its label points.
export const PROJECTS = {
  cantilever: {
    parts: [
      { type: 'box', min: [0, 0, 0], max: [16, 6, 3.2] },
      { type: 'box', min: [6, -1.2, 3.2], max: [20.5, 5.2, 6.2], paint: true },
      { type: 'box', min: [1.6, 3.6, 3.2], max: [3.8, 6, 4.8] },
    ],
    windows: [
      { part: 0, face: 'south', u: [1.2, 5.2], v: [0, 2.5] },
      { part: 0, face: 'west', u: [1.8, 4.4], v: [0.9, 2.5] },
      { part: 1, face: 'south', u: [1, 13.5], v: [0.6, 2.6], ribbon: 1.8 },
      { part: 1, face: 'west', u: [1, 5.2], v: [0.6, 2.6] },
    ],
    trees: [{ at: [-3.2, 2.5], h: 4.2, r: 1.6 }, { at: [22, 9], h: 5, r: 2, back: true }],
    site: [[-5, -4], [24, 11]],
    idea: [16, 2, 6.2],
  },
  remodel: {
    parts: [
      { type: 'box', min: [10.4, 1, 0], max: [18, 8, 3.2], paint: true },
      { type: 'box', min: [13, 3.5, 3.2], max: [15.4, 5.5, 4.1], paint: true },
      { type: 'gable', min: [0, 1.5, 0], max: [10.4, 8, 5], ridge: 8.4 },
      { type: 'box', min: [2, 5.8, 6.2], max: [3, 6.8, 9.2] },
    ],
    windows: [
      { part: 2, face: 'south', u: [1.4, 3.2], v: [0.8, 2.6] },
      { part: 2, face: 'south', u: [4.4, 6], v: [0, 2.6] },
      { part: 2, face: 'south', u: [7.2, 9], v: [0.8, 2.6] },
      { part: 2, face: 'south', u: [1.4, 3.2], v: [3.2, 4.5] },
      { part: 2, face: 'south', u: [7.2, 9], v: [3.2, 4.5] },
      { part: 0, face: 'south', u: [0.6, 7], v: [0, 2.5], ribbon: 1.6 },
    ],
    trees: [{ at: [-3, 3], h: 5, r: 2 }, { at: [20.5, 11], h: 4.6, r: 1.8, back: true }],
    site: [[-5, -3], [21, 11]],
    idea: [17, 2.5, 3.2],
  },
  extension: {
    parts: [
      { type: 'gable', min: [12, 4, 0], max: [18, 13, 6], ridge: 9.2 },
      { type: 'gable', min: [6, 4, 0], max: [12, 13, 6], ridge: 9.2 },
      { type: 'gable', min: [0, 4, 0], max: [6, 13, 6], ridge: 9.2 },
      { type: 'box', min: [6.4, 0, 0], max: [11.6, 4, 3], paint: true, glass: true },
    ],
    windows: [
      { part: 0, face: 'south', u: [1.2, 4.8], v: [3.3, 4.8] },
      { part: 1, face: 'south', u: [1.2, 4.8], v: [3.3, 4.8] },
      { part: 2, face: 'south', u: [1.2, 4.8], v: [3.3, 4.8] },
      { part: 2, face: 'south', u: [1.2, 2.6], v: [0, 2.4] },
      { part: 2, face: 'south', u: [3.4, 4.8], v: [0.8, 2.4] },
      { part: 0, face: 'south', u: [1.2, 2.6], v: [0, 2.4] },
      { part: 0, face: 'south', u: [3.4, 4.8], v: [0.8, 2.4] },
    ],
    fences: [[[0, -3.5], [6, -3.5]], [[6, -3.5], [6, 4]], [[12, -3.5], [12, 4]], [[12, -3.5], [18, -3.5]]],
    trees: [{ at: [15, -1], h: 3.6, r: 1.4 }, { at: [2.5, -1.2], h: 3.2, r: 1.2 }],
    site: [[-3, -5], [21, 15]],
    idea: [11.6, 1, 3],
  },
  courtyard: {
    // The hero's house, finished, with the roof over the main wing as the key idea.
    parts: COURT_BOXES.map((b) => ({ type: 'box', min: b.min, max: b.max, paint: b.id === 'roof' })),
    windows: [
      { part: 2, face: 'south', u: [1, 10.6], v: [0, 2.8], ribbon: 1.6 },
      { part: 2, face: 'south', u: [1.6, 4.4], v: [3.7, 5.6] },
      { part: 2, face: 'south', u: [9.4, 12.6], v: [3.7, 5.6] },
      { part: 0, face: 'west', u: [6, 12.6], v: [0, 2.6], ribbon: 1.65 },
    ],
    trees: COURT_TREES.map((t) => ({ at: t.base, h: t.h, r: t.r, after: t.id === 't1' ? 2 : null })),
    site: [[-5, -4.5], [22, 16]],
    idea: [-0.8, 12.5, 6.5],
    ideaSide: 'left',
  },
};

// ---------------------------------------------------------------- drawing
const NS = 'http://www.w3.org/2000/svg';
const el = (tag, attrs, parent) => {
  const n = document.createElementNS(NS, tag);
  for (const k in attrs) n.setAttribute(k, attrs[k]);
  parent.appendChild(n);
  return n;
};
const C30 = Math.cos(Math.PI / 6);
const raw = ([x, y, z]) => [(x - y) * C30, -(x + y) * 0.5 - z];
const W = 800, H = 520, PAD = 46;

function corners(min, max) {
  const out = [];
  for (const x of [min[0], max[0]]) for (const y of [min[1], max[1]]) for (const z of [min[2], max[2]]) out.push([x, y, z]);
  return out;
}

// Visible faces of a part, with a point-on-face helper for windows.
function faces(p) {
  const [x0, y0, z0] = p.min;
  const [x1, y1, z1] = p.max;
  if (p.type === 'gable') {
    const ym = (y0 + y1) / 2, zr = p.ridge;
    return [
      { id: 'north', tone: 'roofN', pts: [[x0, ym, zr], [x1, ym, zr], [x1, y1, z1], [x0, y1, z1]] },
      { id: 'roof', tone: 'roofS', pts: [[x0, y0, z1], [x1, y0, z1], [x1, ym, zr], [x0, ym, zr]] },
      { id: 'south', tone: 'south', pts: [[x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1]], at: (u, v) => [x0 + u, y0, z0 + v] },
      { id: 'west', tone: 'west', pts: [[x0, y1, z0], [x0, y0, z0], [x0, y0, z1], [x0, ym, zr], [x0, y1, z1]], at: (u, v) => [x0, y1 - u, z0 + v] },
    ];
  }
  return [
    { id: 'west', tone: 'west', pts: [[x0, y1, z0], [x0, y0, z0], [x0, y0, z1], [x0, y1, z1]], at: (u, v) => [x0, y1 - u, z0 + v] },
    { id: 'south', tone: 'south', pts: [[x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1]], at: (u, v) => [x0 + u, y0, z0 + v] },
    { id: 'top', tone: 'top', pts: [[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]] },
  ];
}

export function build(svg, spec) {
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.innerHTML = '';
  svg.classList.toggle('is-progress', !!spec.progress); // still on site: drawn as construction lines
  // Fit everything (parts, trees, site) into the sheet.
  const pts = [];
  spec.parts.forEach((p) => pts.push(...corners(p.min, [p.max[0], p.max[1], p.type === 'gable' ? p.ridge : p.max[2]])));
  const [s0, s1] = spec.site;
  pts.push([s0[0], s0[1], 0], [s1[0], s0[1], 0], [s1[0], s1[1], 0], [s0[0], s1[1], 0]);
  (spec.trees || []).forEach((t) => pts.push([t.at[0], t.at[1], t.h + t.r]));
  const r2 = pts.map(raw);
  const xs = r2.map((p) => p[0]), ys = r2.map((p) => p[1]);
  const bw = Math.max(...xs) - Math.min(...xs), bh = Math.max(...ys) - Math.min(...ys);
  const S = Math.min((W - PAD * 2) / bw, (H - PAD * 2) / bh);
  const ox = W / 2 - ((Math.max(...xs) + Math.min(...xs)) / 2) * S;
  const oy = H / 2 - ((Math.max(...ys) + Math.min(...ys)) / 2) * S + 14;
  const P = (q) => { const [x, y] = raw(q); return [x * S + ox, y * S + oy]; };
  const poly = (arr) => arr.map((q) => P(q).map((v) => v.toFixed(1)).join(',')).join(' ');

  const g = { site: [], parts: [], trees: [], paints: [], idea: null };

  // site boundary and fences
  const site = [[s0[0], s0[1], 0], [s1[0], s0[1], 0], [s1[0], s1[1], 0], [s0[0], s1[1], 0]];
  g.site.push(el('polygon', { points: poly(site), class: 'wk-site', pathLength: 1 }, svg));
  (spec.fences || []).forEach(([a, b]) => {
    const A = P([a[0], a[1], 0]), B = P([b[0], b[1], 0]);
    g.site.push(el('line', { x1: A[0], y1: A[1], x2: B[0], y2: B[1], class: 'wk-fence', pathLength: 1 }, svg));
  });

  const tree = (t) => {
    const tg = el('g', { class: 'wk-tree' }, svg);
    const base = P([t.at[0], t.at[1], 0]);
    const top = P([t.at[0], t.at[1], t.h]);
    el('line', { x1: base[0], y1: base[1], x2: top[0], y2: top[1] + S * t.r * 0.4, class: 'wk-trunk' }, tg);
    el('circle', { cx: top[0], cy: top[1], r: (S * t.r * 1.22).toFixed(1), class: 'wk-canopy' }, tg);
    g.trees.push(tg);
  };
  (spec.trees || []).filter((t) => t.back).forEach(tree);

  // Each part: its faces (solid), windows, then its edges. Later parts sit in front of earlier ones.
  spec.parts.forEach((p, pi) => {
    const pg = el('g', { class: 'wk-part' }, svg);
    const part = { fills: [], edges: [] };
    faces(p).forEach((f) => {
      part.fills.push(el('polygon', { points: poly(f.pts), class: `wk-face wk-face--${f.tone}${p.glass ? ' wk-face--glass' : ''}` }, pg));
      if (p.paint) g.paints.push(el('polygon', { points: poly(f.pts), class: `wk-paint wk-paint--${f.tone}${p.glass ? ' wk-paint--glass' : ''}` }, pg));
      (spec.windows || []).filter((w) => w.part === pi && w.face === f.id).forEach((w) => {
        const q = [f.at(w.u[0], w.v[0]), f.at(w.u[1], w.v[0]), f.at(w.u[1], w.v[1]), f.at(w.u[0], w.v[1])];
        part.fills.push(el('polygon', { points: poly(q), class: 'wk-window' }, pg));
        if (w.ribbon) {
          for (let u = w.u[0] + w.ribbon; u < w.u[1] - 0.2; u += w.ribbon) {
            const a = P(f.at(u, w.v[0])), b = P(f.at(u, w.v[1]));
            part.fills.push(el('line', { x1: a[0], y1: a[1], x2: b[0], y2: b[1], class: 'wk-mullion' }, pg));
          }
        }
      });
      f.pts.forEach((a, i) => {
        const A = P(a), B = P(f.pts[(i + 1) % f.pts.length]);
        part.edges.push(el('line', { x1: A[0].toFixed(1), y1: A[1].toFixed(1), x2: B[0].toFixed(1), y2: B[1].toFixed(1), class: 'wk-edge', pathLength: 1 }, pg));
      });
    });
    g.parts.push(part);
    (spec.trees || []).filter((t) => t.after === pi).forEach(tree);
  });
  (spec.trees || []).filter((t) => !t.back && t.after == null).forEach(tree);

  // "Key idea" label: a leader from the orange part up to a mono tag, like a note on a drawing.
  if (spec.idea) {
    const a = P(spec.idea);
    const dir = spec.ideaSide === 'left' ? -1 : 1; // which side of the anchor the label sits
    const lx = a[0] + 46 * dir, ly = Math.max(26, a[1] - 64);
    const ig = el('g', { class: 'wk-idea' }, svg);
    el('circle', { cx: a[0], cy: a[1], r: 4, class: 'wk-idea__node' }, ig);
    el('polyline', { points: `${a[0]},${a[1]} ${lx - 6 * dir},${ly} ${lx + 4 * dir},${ly}`, class: 'wk-idea__leader' }, ig);
    const t = el('text', { x: lx + 10 * dir, y: ly + 4, class: 'wk-idea__text', 'text-anchor': dir < 0 ? 'end' : 'start' }, ig);
    t.textContent = 'KEY IDEA';
    g.idea = ig;
  }

  const fit = () => {
    const k = Math.min(svg.clientWidth / W, svg.clientHeight / H) || 1;
    svg.style.setProperty('--k', k.toFixed(3));
  };
  fit();
  new ResizeObserver(fit).observe(svg);
  return g;
}

// A drawing's timeline, 0 to 1, meant to be scrubbed by scroll:
// site line, then each part (outline, then solid), trees, then the key idea in orange and its label.
export function drawTimeline(g) {
  const { gsap } = window;
  const tl = gsap.timeline({ paused: true, defaults: { ease: 'none' } });
  tl.fromTo(g.site, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.12 }, 0);
  const n = g.parts.length;
  const span = 0.55; // parts share 0.08 to 0.63
  g.parts.forEach((part, i) => {
    const t0 = 0.08 + (span / n) * i;
    const d = span / n;
    tl.fromTo(part.edges, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: d * 0.7 }, t0)
      .fromTo(part.fills, { opacity: 0 }, { opacity: 1, duration: d * 0.45 }, t0 + d * 0.5);
  });
  tl.fromTo(g.trees, { opacity: 0, scale: 0.85, transformOrigin: '50% 100%' }, { opacity: 1, scale: 1, duration: 0.12 }, 0.62)
    .fromTo(g.paints, { opacity: 0 }, { opacity: 1, duration: 0.16 }, 0.72);
  if (g.idea) tl.fromTo(g.idea, { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.1 }, 0.88);
  tl.to({}, { duration: 0.02 }, 0.98);
  return tl;
}

// Projects added for the Work page.
Object.assign(PROJECTS, {
  barn: {
    parts: [
      { type: 'gable', min: [0, 2, 0], max: [20, 9, 4.2], ridge: 8 },
      { type: 'box', min: [8, 1.2, 0], max: [12, 2, 4], paint: true, glass: true },
    ],
    windows: [
      { part: 0, face: 'south', u: [2, 2.6], v: [1, 3] }, { part: 0, face: 'south', u: [4.5, 5.1], v: [1, 3] },
      { part: 0, face: 'south', u: [15, 15.6], v: [1, 3] }, { part: 0, face: 'south', u: [17.4, 18], v: [1, 3] },
      { part: 0, face: 'west', u: [2.5, 4.5], v: [0, 2.6] },
    ],
    trees: [{ at: [-3, 6], h: 5.6, r: 2.3 }, { at: [23, 11], h: 5, r: 2, back: true }, { at: [16, -2.5], h: 3.4, r: 1.3 }],
    site: [[-6, -4], [24, 13]],
    idea: [12, 1.6, 4],
  },
  slope: {
    parts: [
      { type: 'box', min: [-4, 7, 0], max: [18, 16, 1.6] },
      { type: 'box', min: [2, 8, 1.6], max: [15, 13.5, 5] },
      { type: 'box', min: [0, 0, 0], max: [10, 7, 3], paint: true },
    ],
    windows: [
      { part: 1, face: 'south', u: [8.5, 12.5], v: [0.4, 2.8], ribbon: 1.33 },
      { part: 2, face: 'south', u: [1, 8.6], v: [0, 2.6], ribbon: 1.9 },
      { part: 2, face: 'west', u: [1.5, 4.5], v: [0.8, 2.6] },
    ],
    trees: [{ at: [16, 12], h: 4.6, r: 1.9, back: true }, { at: [-2.5, 3], h: 4.2, r: 1.7 }],
    site: [[-5, -4], [19, 17]],
    idea: [10, 3, 3],
  },
  studio: {
    parts: [
      { type: 'box', min: [0, 0, 0], max: [6, 4.5, 2.8] },
      { type: 'box', min: [0.5, 2.6, 2.8], max: [5.5, 4.3, 3.7], paint: true, glass: true },
    ],
    windows: [{ part: 0, face: 'south', u: [0.8, 4.2], v: [0, 2.3], ribbon: 1.7 }, { part: 0, face: 'west', u: [1, 2.4], v: [0.9, 2] }],
    fences: [[[-5, -5], [11, -5]], [[-5, -5], [-5, 9]]],
    trees: [{ at: [9, 7], h: 4.4, r: 1.8, back: true }, { at: [-2.5, -2.2], h: 3.6, r: 1.4 }],
    site: [[-5, -5], [11, 9]],
    idea: [5.5, 3.4, 3.7],
  },
  twin: {
    progress: true,
    parts: [
      { type: 'gable', min: [9, 4, 0], max: [15, 13, 5], ridge: 8 },
      { type: 'box', min: [6, 6, 0], max: [9, 10, 3], paint: true, glass: true },
      { type: 'gable', min: [0, 4, 0], max: [6, 13, 5], ridge: 8 },
    ],
    windows: [
      { part: 0, face: 'south', u: [1, 5], v: [0, 2.6], ribbon: 2 },
      { part: 2, face: 'south', u: [1, 5], v: [0, 2.6], ribbon: 2 },
      { part: 2, face: 'south', u: [2, 4], v: [3.2, 4.6] },
    ],
    trees: [{ at: [17.5, 2], h: 3.6, r: 1.4 }],
    site: [[-3, -2], [19, 15]],
    idea: [7.5, 6, 3],
  },
});
