// Live light layer ("wash") and the annotation layer for the hero drawing.
// The wash sits under the ink video; the video is multiplied on top, so
// tone and shadow read like a watercolour wash under pen lines.
import {
  BOXES, TREES, makeProjector, boxAt, visibleFaces, faceShade,
  boxShadow, treeShadow, sunAt, sunPoint, window01, easeOut,
} from './house.js';

const NS = 'http://www.w3.org/2000/svg';
const el = (tag, attrs = {}, parent) => {
  const n = document.createElementNS(NS, tag);
  for (const k in attrs) n.setAttribute(k, attrs[k]);
  if (parent) parent.appendChild(n);
  return n;
};
const pts = (arr) => arr.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');

// Lit face colour (L2 card) to shaded face colour, both from the bone family.
const LIT = [247, 243, 234];
const SHADE = [205, 194, 172];
const lerp3 = (a, b, t) => a.map((c, i) => c + (b[i] - c) * t);
const rgb = (c) => `rgb(${c.map(Math.round).join(',')})`;

// Accent (design system signal orange), lit and in shade. Painted on in the final inking only.
const ACCENT_LIT = [255, 85, 0];     // --signal-400
const ACCENT_SHADE = [170, 54, 0];
const TREE_LIT = [255, 122, 61];     // --signal-300
const TREE_SHADE = [230, 77, 0];     // --signal-500
const PAINTED = { roof: [0.84, 0.96] }; // box id -> part of the ink timeline in which its paint goes on
const TREE_PAINT = [0.92, 1.0];
const SUN_PAINT = [0.76, 0.92];

// The sun's place on the sheet: an arc across the sky, morning right (east), evening left (west),
// which agrees with the shadow directions in this view. Shared by the big painted sun and the
// orange path on the notes layer. View pixels.
export function skyAt(hours, compact) {
  const sky = compact ? { cx: 575, base: 519, rx: 470, ry: 319 } : { cx: 1010, base: 545, rx: 570, ry: 330 };
  const t = (Math.max(6.5, Math.min(19, hours)) - 6.5) / 12.5;
  const th = Math.PI * (0.1 + 0.75 * t);
  return [sky.cx + sky.rx * Math.cos(th), sky.base - sky.ry * Math.sin(th)];
}

export class Wash {
  constructor(svg, view, { compact = false } = {}) {
    this.svg = svg;
    this.view = view;
    this.compact = compact;
    this.P = makeProjector(view);
    svg.setAttribute('viewBox', `0 0 ${view.w} ${view.h}`);
    svg.innerHTML = '';
    const defs = el('defs', {}, svg);
    const sh = el('pattern', { id: 'wash-shadow', width: 7, height: 7, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(45)' }, defs);
    el('rect', { width: 7, height: 7, fill: '#D6CCB8' }, sh);
    el('line', { x1: 0, y1: 0, x2: 0, y2: 7, stroke: '#6A6352', 'stroke-width': 1.1, 'stroke-opacity': 0.55 }, sh);
    const fh = el('pattern', { id: 'wash-face', width: 5, height: 5, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(-30)' }, defs);
    el('line', { x1: 0, y1: 0, x2: 0, y2: 5, stroke: '#6A6352', 'stroke-width': 0.9, 'stroke-opacity': 0.5 }, fh);

    // The big sun, behind everything: the house passes in front of it.
    this.sun = el('circle', { r: 0, fill: rgb(ACCENT_LIT) }, svg);
    this.sunR = compact ? 120 : 140;

    // Ground shadows: opaque inside the group, so overlaps do not double up.
    this.gShadow = el('g', { fill: 'url(#wash-shadow)' }, svg);
    this.boxShadows = BOXES.map(() => el('polygon', {}, this.gShadow));
    this.treeShadows = TREES.map(() => el('polygon', {}, this.gShadow));

    // Faces, back to front. Opaque fills hide the shadows behind them.
    this.faces = BOXES.map((b) => {
      const g = el('g', {}, svg);
      return ['west', 'south', 'top'].map(() => ({
        fill: el('polygon', {}, g),
        hatch: el('polygon', { fill: 'url(#wash-face)' }, g),
      }));
    });

    // Painted tree canopies, in front of the house. Each has a shade side, clipped to the canopy.
    this.trees = TREES.map((t, i) => {
      const clip = el('clipPath', { id: `wash-tree-${i}` }, defs);
      const cc = el('circle', {}, clip);
      const g = el('g', {}, svg);
      const base = el('circle', { fill: rgb(TREE_LIT) }, g);
      const shade = el('circle', { fill: rgb(TREE_SHADE), 'clip-path': `url(#wash-tree-${i})` }, g);
      return { g, cc, base, shade };
    });
    this.last = '';
  }

  // prog: ink video progress 0..1. hours: time of day. light: 0..1 fade of tone.
  render(prog, hours, light) {
    const key = `${prog.toFixed(4)}|${hours.toFixed(3)}|${light.toFixed(3)}`;
    if (key === this.last) return;
    this.last = key;
    const sun = sunAt(hours);
    const P = this.P;
    this.gShadow.setAttribute('opacity', (0.78 * light).toFixed(3));

    BOXES.forEach((box, i) => {
      const b = boxAt(box, prog);
      const poly = b.r > 0 ? boxShadow(b, sun) : null;
      this.boxShadows[i].setAttribute('points', poly ? pts(poly.map(P)) : '');
      const faces = visibleFaces(b);
      faces.forEach((f, j) => {
        const slot = this.faces[i][j];
        if (b.r <= 0) {
          slot.fill.setAttribute('points', '');
          slot.hatch.setAttribute('points', '');
          return;
        }
        const p2 = pts(f.pts.map(P));
        let s = faceShade(f, sun);
        if (f.id === 'top') s *= 0.45;
        s *= light;
        slot.fill.setAttribute('points', p2);
        const tone = lerp3(LIT, SHADE, Math.pow(s, 1.4));
        const win = PAINTED[box.id];
        const paint = win ? easeOut(window01(prog, win[0], win[1])) : 0;
        const accent = lerp3(ACCENT_LIT, ACCENT_SHADE, Math.pow(s, 1.2));
        slot.fill.setAttribute('fill', rgb(paint > 0 ? lerp3(tone, accent, paint) : tone));
        slot.hatch.setAttribute('points', s > 0.55 && paint < 1 ? p2 : '');
        slot.hatch.setAttribute('opacity', Math.max(0, (s - 0.55) * 1.8).toFixed(3));
      });
    });

    TREES.forEach((t, i) => {
      const grow = easeOut(window01(prog, t.draw[0], t.draw[1]));
      if (grow <= 0) { this.treeShadows[i].setAttribute('points', ''); return; }
      const s = treeShadow(t, sun, grow);
      this.treeShadows[i].setAttribute('points', pts(s.ellipse.map(P)));
    });

    // Final inking: the accent goes on last.
    const sc = skyAt(hours, this.compact);
    const sp = easeOut(window01(prog, SUN_PAINT[0], SUN_PAINT[1]));
    this.sun.setAttribute('cx', sc[0].toFixed(1));
    this.sun.setAttribute('cy', sc[1].toFixed(1));
    this.sun.setAttribute('r', (this.sunR * sp).toFixed(1));

    const tp = easeOut(window01(prog, TREE_PAINT[0], TREE_PAINT[1]));
    // Each canopy's shade sits on the side away from the sun, in screen space.
    const away = [this.view.cx - sc[0], this.view.cy - sc[1]];
    const al = Math.hypot(away[0], away[1]) || 1;
    TREES.forEach((t, i) => {
      const tr = this.trees[i];
      const C = P([t.base[0], t.base[1], t.h]);
      const R = P.sphereR(t.r) * 0.93 * (0.6 + 0.4 * tp);
      tr.g.setAttribute('opacity', tp.toFixed(3));
      for (const c of [tr.base, tr.cc]) {
        c.setAttribute('cx', C[0].toFixed(1));
        c.setAttribute('cy', C[1].toFixed(1));
        c.setAttribute('r', R.toFixed(1));
      }
      tr.shade.setAttribute('cx', (C[0] + (away[0] / al) * R * 0.55).toFixed(1));
      tr.shade.setAttribute('cy', (C[1] + (away[1] / al) * R * 0.55).toFixed(1));
      tr.shade.setAttribute('r', (R * 0.85).toFixed(1));
    });
  }
}

// The orange sun path, the sun itself, leaders and a chain dimension.
// Lives on the foreground plane, so it moves at 1.15x.
export class Annotations {
  constructor(svg, view, { compact = false } = {}) {
    this.svg = svg;
    this.P = makeProjector(view);
    this.compact = compact;
    svg.setAttribute('viewBox', `0 0 ${view.w} ${view.h}`);
    svg.innerHTML = '';
    const P = this.P;

    // Sun path: a clean arc across the sky of the sheet. Morning sits right (east), evening left (west),
    // which agrees with the shadow directions in this view. Values are in view pixels.
    this.sky = (h) => skyAt(h, compact);
    const arc = [];
    for (let h = 6.5; h <= 19.001; h += 0.25) arc.push(this.sky(h));
    this.arcAll = el('polyline', { class: 'an-arc an-arc--ghost', points: pts(arc) }, svg);
    this.arcDone = el('polyline', { class: 'an-arc' }, svg);
    this.ray = el('line', { class: 'an-ray' }, svg);
    this.sunG = el('g', { class: 'an-sun' }, svg);
    el('circle', { r: 15, class: 'an-sun__halo' }, this.sunG);
    el('circle', { r: 7, class: 'an-sun__dot' }, this.sunG);
    this.land = el('circle', { r: 4, class: 'an-land' }, svg);

    // Leaders: anchor in 3D, label offset in view pixels.
    const leaders = compact
      ? [
          { at: [2.5, 0, 0.9], dx: -40, dy: 120, text: 'Rammed earth walls' },
        ]
      : [
          { at: [2.5, 0, 0.9], dx: -50, dy: 120, text: 'Rammed earth walls' },
          { at: [6, 7.6, 6.5], dx: -40, dy: -130, text: 'Oak roof, deep eave' },
          { at: [20, 3.5, 2.2], dx: -10, dy: 150, text: 'Larch cladding' },
          { at: [7.5, 6.5, 0], dx: 40, dy: -60, text: 'Planted court' },
        ];
    this.leaders = leaders.map((l) => {
      const g = el('g', { class: 'an-leader' }, svg);
      const a = P(l.at);
      const b = [a[0] + l.dx, a[1] + l.dy];
      const elbow = [b[0] + (l.dx < 0 ? 0 : 0), b[1]];
      el('circle', { cx: a[0], cy: a[1], r: 3.2, class: 'an-node' }, g);
      el('polyline', { points: pts([a, [a[0] + l.dx * 0.6, b[1]], elbow]), class: 'an-line' }, g);
      const t = el('text', { x: b[0] + (l.dx < 0 ? -8 : 8), y: b[1] + 4, 'text-anchor': l.dx < 0 ? 'end' : 'start', class: 'an-text' }, g);
      t.textContent = l.text.toUpperCase();
      return g;
    });

    // Chain dimension along the south front, in millimetres.
    const dimY = -3.4;
    const dimG = el('g', { class: 'an-dim' }, svg);
    const xs = [0, 14, 20];
    const d = xs.map((x) => P([x, dimY, 0]));
    el('polyline', { points: pts(d), class: 'an-line' }, dimG);
    xs.forEach((x, i) => {
      const top = P([x, dimY + 0.7, 0]);
      el('line', { x1: d[i][0], y1: d[i][1], x2: top[0], y2: top[1], class: 'an-line' }, dimG);
      el('line', { x1: d[i][0] - 5, y1: d[i][1] + 5, x2: d[i][0] + 5, y2: d[i][1] - 5, class: 'an-line an-line--tick' }, dimG);
    });
    [[0, 14, '14 000'], [14, 20, '6 000']].forEach(([a, b, s]) => {
      const m = P([(a + b) / 2, dimY - 0.55, 0]);
      const ang = (Math.atan2(d[1][1] - d[0][1], d[1][0] - d[0][0]) * 180) / Math.PI;
      const t = el('text', { x: m[0], y: m[1], 'text-anchor': 'middle', class: 'an-text an-text--dim', transform: `rotate(${ang.toFixed(2)} ${m[0].toFixed(1)} ${m[1].toFixed(1)})` }, dimG);
      t.textContent = s;
    });
    this.dim = dimG;
    this.lastKey = '';
  }

  // reveal: 0..1 entrance of leaders. hours: time of day.
  render(hours, reveal, flow) {
    const key = `${hours.toFixed(3)}|${reveal.toFixed(3)}|${flow.toFixed(1)}`;
    if (key === this.lastKey) return;
    this.lastKey = key;
    const P = this.P;
    const sun = sunAt(hours);
    const done = [];
    for (let h = 6.5; h < hours; h += 0.25) done.push(this.sky(h));
    const s = this.sky(hours);
    done.push(s);
    this.arcDone.setAttribute('points', pts(done));
    this.arcDone.style.strokeDashoffset = (-flow).toFixed(1);
    this.sunG.setAttribute('transform', `translate(${s[0].toFixed(1)} ${s[1].toFixed(1)})`);
    // Where the light lands: a point in the court, lit through the gap in the wall.
    const land = P([6.2, 4.2, 0]);
    this.ray.setAttribute('x1', s[0]); this.ray.setAttribute('y1', s[1]);
    this.ray.setAttribute('x2', land[0]); this.ray.setAttribute('y2', land[1]);
    this.land.setAttribute('cx', land[0]); this.land.setAttribute('cy', land[1]);

    const arcOn = window01(reveal, 0, 0.5);
    this.arcAll.style.opacity = arcOn;
    this.arcDone.style.opacity = arcOn;
    this.sunG.style.opacity = arcOn;
    this.ray.style.opacity = arcOn * 0.9;
    this.land.style.opacity = arcOn;
    this.leaders.forEach((g, i) => {
      const t = easeOut(window01(reveal, 0.15 + i * 0.12, 0.55 + i * 0.12));
      g.style.opacity = t;
      g.style.transform = `translateY(${((1 - t) * 8).toFixed(2)}px)`;
    });
    this.dim.style.opacity = easeOut(window01(reveal, 0.4, 0.9));
  }
}
