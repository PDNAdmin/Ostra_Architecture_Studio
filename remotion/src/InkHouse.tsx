import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
// Shared with the site's live light layer: same boxes, same projection.
import {
  BOXES, TREES, SITE, COURT, VIEWS, makeProjector, boxAt, visibleFaces,
  window01, easeOut, rng,
} from '../../site/js/house.js';

type V3 = [number, number, number];
type V2 = [number, number];
type ViewName = keyof typeof VIEWS;

const INK = '#14120F';

const STROKE: Record<ViewName, number> = { desktop: 1.4, mobile: 2.7 };

// One hand-drawn line: slight overshoot, a gentle bow, doubled.
function sketch(a: V2, b: V2, rand: () => number, amp: number, over = 0.6): string {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len, uy = dy / len;
  const o = over * amp * (0.6 + rand());
  const a2: V2 = [a[0] - ux * o, a[1] - uy * o];
  const b2: V2 = [b[0] + ux * o * 0.7, b[1] + uy * o * 0.7];
  const bow = (rand() - 0.5) * amp * Math.min(1, len / 120);
  const mx = (a2[0] + b2[0]) / 2 - uy * bow;
  const my = (a2[1] + b2[1]) / 2 + ux * bow;
  return `M${a2[0].toFixed(1)} ${a2[1].toFixed(1)}Q${mx.toFixed(1)} ${my.toFixed(1)} ${b2[0].toFixed(1)} ${b2[1].toFixed(1)}`;
}

const Stroke: React.FC<{ d: string; t: number; w: number; o?: number }> = ({ d, t, w, o = 1 }) => {
  if (t <= 0) return null;
  return (
    <path d={d} pathLength={1} fill="none" stroke={INK} strokeWidth={w} strokeOpacity={o}
      strokeLinecap="round" strokeLinejoin="round"
      strokeDasharray="1 1" strokeDashoffset={1 - Math.min(1, t)} />
  );
};

const poly = (pts: V2[]) => pts.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');

// Openings in face coordinates: [u0, v0, u1, v1, kind, mullion spacing]
type Opening = [number, number, number, number, 'glass' | 'door' | 'window', number?];
const OPENINGS: Record<string, Opening[]> = {
  'north:south': [
    [1.0, 0, 10.6, 2.8, 'glass', 1.6],
    [11.4, 0, 12.8, 2.4, 'door'],
    [1.6, 3.7, 4.4, 5.6, 'window', 1.4],
    [6.4, 3.7, 7.0, 5.6, 'window'],
    [9.4, 3.7, 12.6, 5.6, 'window', 1.6],
  ],
  'north:west': [[2.1, 0.6, 2.7, 5.7, 'window']],
  'east:west': [[6.0, 0, 12.6, 2.6, 'glass', 1.65]],
  'east:south': [[1.0, 0.9, 5.0, 2.5, 'window', 2.0]],
};

export const InkHouse: React.FC<{ view: ViewName }> = ({ view }) => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();
  const p = frame / (durationInFrames - 1);
  const V = VIEWS[view];
  const P = makeProjector(V) as ((q: V3) => V2) & { S: number; sphereR: (r: number) => number };
  const w = STROKE[view];
  const amp = V.S * 0.09;
  const els: React.ReactNode[] = [];
  let key = 0;
  const k = () => key++;

  const line3 = (a: V3, b: V3, t: number, seed: number, weight = w, op = 1) => {
    const r = rng(seed);
    const A = P(a), B = P(b);
    els.push(<Stroke key={k()} d={sketch(A, B, r, amp)} t={t} w={weight} o={op} />);
    // the second, lighter pass that makes it read as pen
    els.push(<Stroke key={k()} d={sketch(A, B, r, amp * 0.8, 0.3)} t={t * 1.04 - 0.04} w={weight * 0.55} o={op * 0.5} />);
  };

  // 1. Site boundary, drawn first, long-dash plot line.
  const s0 = SITE.min, s1 = SITE.max;
  const site: V3[] = [[s0[0], s0[1], 0], [s1[0], s0[1], 0], [s1[0], s1[1], 0], [s0[0], s1[1], 0]];
  site.forEach((a, i) => {
    const b = site[(i + 1) % 4];
    const t = easeOut(window01(p, i * 0.025, i * 0.025 + 0.06));
    if (t > 0) {
      const A = P(a), B = P(b);
      els.push(<path key={k()} d={`M${A[0]} ${A[1]}L${A[0] + (B[0] - A[0]) * t} ${A[1] + (B[1] - A[1]) * t}`}
        stroke={INK} strokeOpacity={0.45} strokeWidth={w * 0.7} strokeDasharray={`${14 * w} ${5 * w} ${2 * w} ${5 * w}`} fill="none" />);
    }
  });

  // 2. Footprints on the ground.
  BOXES.filter((b) => b.min[2] === 0).forEach((b, bi) => {
    const [x0, y0] = b.min, [x1, y1] = b.max;
    const fp: V3[] = [[x0, y0, 0], [x1, y0, 0], [x1, y1, 0], [x0, y1, 0]];
    const st = 0.03 + bi * 0.012;
    fp.forEach((a, i) => line3(a, fp[(i + 1) % 4], easeOut(window01(p, st + i * 0.008, st + i * 0.008 + 0.05)), 100 + bi * 10 + i, w * 0.8, 0.8));
  });

  // 3. Court paving and the stepping-stone path (late, scrubbed by scroll).
  {
    const [cx0, cy0] = COURT.min, [cx1, cy1] = COURT.max;
    let i = 0;
    for (let x = cx0 + 1.4; x < cx1 - 0.2; x += 1.4, i++) {
      line3([x, cy0, 0], [x, cy1, 0], easeOut(window01(p, 0.8 + i * 0.006, 0.86 + i * 0.006)), 300 + i, w * 0.5, 0.45);
    }
    for (let y = cy0 + 1.4; y < cy1 - 0.2; y += 1.4, i++) {
      line3([cx0, y, 0], [cx1, y, 0], easeOut(window01(p, 0.82 + i * 0.005, 0.88 + i * 0.005)), 300 + i, w * 0.5, 0.45);
    }
    [-0.7, -1.5].forEach((y, j) => {
      const t = easeOut(window01(p, 0.9 + j * 0.02, 0.96 + j * 0.02));
      const q: V3[] = [[5.3, y, 0], [6.7, y, 0], [6.7, y - 0.5, 0], [5.3, y - 0.5, 0]];
      q.forEach((a, n) => line3(a, q[(n + 1) % 4], t, 400 + j * 8 + n, w * 0.7, 0.7));
    });
  }

  // 4. Trees, drawn in painter order between the boxes.
  const drawTree = (tree: typeof TREES[number], idx: number) => {
    const t = window01(p, tree.draw[0], tree.draw[1]);
    if (t <= 0) return;
    const [bx, by] = tree.base;
    const r = rng(900 + idx * 31);
    const C = P([bx, by, tree.h]);
    const R = P.sphereR(tree.r);
    // knock back the lines behind the canopy
    els.push(<circle key={k()} cx={C[0]} cy={C[1]} r={R * 0.96 * easeOut(Math.min(1, t * 1.6))} fill="#fff" fillOpacity={0.82} />);
    const base = P([bx, by, 0]);
    const top = P([bx, by, tree.h - tree.r * 0.4]);
    const tt = easeOut(Math.min(1, t * 2));
    els.push(<Stroke key={k()} d={`M${base[0] - w} ${base[1]}L${top[0] - w * 0.6} ${top[1]}`} t={tt} w={w} />);
    els.push(<Stroke key={k()} d={`M${base[0] + w * 1.6} ${base[1]}L${top[0] + w * 0.8} ${top[1]}`} t={tt} w={w * 0.7} />);
    for (let b = 0; b < 4; b++) {
      const a = -Math.PI / 2 + (r() - 0.5) * 2.2;
      const sy = top[1] + (r() * 0.5 + 0.2) * (base[1] - top[1]) * 0.25;
      const L = R * (0.35 + r() * 0.35);
      els.push(<Stroke key={k()} d={`M${top[0]} ${sy}Q${top[0] + Math.cos(a) * L * 0.4} ${sy + Math.sin(a) * L * 0.6} ${top[0] + Math.cos(a) * L} ${sy + Math.sin(a) * L}`}
        t={easeOut(window01(t, 0.2 + b * 0.08, 0.5 + b * 0.08))} w={w * 0.6} />);
    }
    // canopy: several loose loops of the pen
    for (let loop = 0; loop < 4; loop++) {
      const pts: V2[] = [];
      const n = 30;
      const rr = R * (0.78 + loop * 0.07);
      const ph = r() * Math.PI * 2;
      for (let i = 0; i <= n; i++) {
        const a = ph + (i / n) * Math.PI * 2.08;
        const j = 1 + (r() - 0.5) * 0.16 + Math.sin(a * 5 + loop) * 0.04;
        pts.push([C[0] + Math.cos(a) * rr * j, C[1] + Math.sin(a) * rr * j * 0.94]);
      }
      const d = 'M' + pts.map((q) => `${q[0].toFixed(1)} ${q[1].toFixed(1)}`).join('L');
      els.push(<Stroke key={k()} d={d} t={easeOut(window01(t, 0.15 + loop * 0.15, 0.55 + loop * 0.12))} w={w * (loop === 3 ? 1 : 0.6)} o={loop === 3 ? 0.9 : 0.55} />);
    }
    // leaf texture: short ticks inside the canopy
    for (let i = 0; i < 26; i++) {
      const a = r() * Math.PI * 2;
      const d0 = Math.sqrt(r()) * R * 0.75;
      const x = C[0] + Math.cos(a) * d0, y = C[1] + Math.sin(a) * d0;
      const L = R * 0.12;
      const th = r() * Math.PI;
      els.push(<Stroke key={k()} d={`M${x} ${y}q${Math.cos(th) * L} ${Math.sin(th) * L * 0.4} ${Math.cos(th) * L * 1.6} ${Math.sin(th) * L}`}
        t={window01(t, 0.55 + (i / 26) * 0.35, 0.65 + (i / 26) * 0.35)} w={w * 0.5} o={0.6} />);
    }
  };

  // t1 sits in the court, after the roof; t2 stands in front of the court wall, drawn last.
  const treeAfter: Record<string, number[]> = { roof: [0], wallS2: [1] };

  // 5. Boxes, back to front, with white faces for hidden-line removal.
  BOXES.forEach((box, bi) => {
    const b = boxAt(box, p) as typeof box & { r: number };
    if (b.r > 0) {
      const faces = visibleFaces(b);
      faces.forEach((f, fi) => {
        if (f.w < 0.01 || f.h < 0.01) return;
        const pts2 = f.pts.map((q: V3) => P(q));
        const clipId = `c-${box.id}-${f.id}`;
        els.push(
          <g key={k()}>
            <defs><clipPath id={clipId}><polygon points={poly(pts2)} /></clipPath></defs>
            <polygon points={poly(pts2)} fill="#fff" />
            <g clipPath={`url(#${clipId})`}>{hatch(box, f, p, P, w, bi * 7 + fi)}{openings(box, f, p, P, w, amp)}</g>
          </g>,
        );
        const e = f.pts as V3[];
        e.forEach((a, i) => line3(a, e[(i + 1) % 4], 1, 2000 + bi * 40 + fi * 8 + i));
      });
      // parapet on the east wing roof
      if (box.id === 'east' && b.r >= 1) {
        const t = easeOut(window01(p, 0.5, 0.58));
        const z = b.max[2], i0 = 0.3;
        const q: V3[] = [[b.min[0] + i0, b.min[1] + i0, z], [b.max[0] - i0, b.min[1] + i0, z], [b.max[0] - i0, b.max[1] - i0, z], [b.min[0] + i0, b.max[1] - i0, z]];
        q.forEach((a, n) => line3(a, q[(n + 1) % 4], t, 2600 + n, w * 0.6, 0.6));
      }
    }
    (treeAfter[box.id] || []).forEach((ti) => drawTree(TREES[ti], ti));
  });

  return (
    <svg width={width} height={height} viewBox={`0 0 ${V.w} ${V.h}`} style={{ background: '#fff' }}>
      <rect width={V.w} height={V.h} fill="#fff" />
      {els}
    </svg>
  );
};

// Material hatching, clipped to the face. Appears between 0.62 and 0.86.
function hatch(box: typeof BOXES[number], f: any, p: number, P: (q: V3) => V2, w: number, seed: number) {
  if (boxAt(box, p).r < 1) return null;
  const out: React.ReactNode[] = [];
  const r = rng(5000 + seed);
  const start = 0.62 + (seed % 5) * 0.025;
  const L = (a: V3, b: V3, t: number, weight: number, op: number, key: string) => {
    if (t <= 0) return;
    const A = P(a), B = P(b);
    out.push(<Stroke key={key} d={sketch(A, B, r, P.S * 0.05, 0.1)} t={t} w={weight} o={op} />);
  };
  if (box.mat === 'earth' && f.id !== 'top') {
    // rammed earth: uneven horizontal strata
    let v = 0.18, i = 0;
    while (v < f.h - 0.08) {
      const t = easeOut(window01(p, start + i * 0.004, start + i * 0.004 + 0.07));
      L(f.at(0, v), f.at(f.w, v + (r() - 0.5) * 0.04), t, w * (r() < 0.2 ? 0.75 : 0.45), r() < 0.2 ? 0.75 : 0.5, `h${i}`);
      v += 0.2 + r() * 0.16; i++;
    }
  } else if (box.mat === 'timber' && f.id !== 'top') {
    let u = 0.24, i = 0;
    while (u < f.w - 0.05) {
      const t = easeOut(window01(p, start + i * 0.0025, start + i * 0.0025 + 0.06));
      L(f.at(u, 0), f.at(u, f.h), t, w * 0.45, 0.55, `t${i}`);
      u += 0.24; i++;
    }
  } else if (box.mat === 'oak') {
    if (f.id === 'top') {
      let u = 0.8, i = 0;
      while (u < f.w - 0.2) {
        const t = easeOut(window01(p, start + i * 0.005, start + i * 0.005 + 0.06));
        L(f.at(u, 0), f.at(u, f.h), t, w * 0.45, 0.45, `o${i}`);
        u += 0.8; i++;
      }
    } else {
      L(f.at(0, f.h * 0.5), f.at(f.w, f.h * 0.5), easeOut(window01(p, start, start + 0.08)), w * 0.5, 0.6, 'om');
    }
  } else if (box.mat === 'plaster' && f.id !== 'top') {
    for (let i = 0; i < 18; i++) {
      const t = window01(p, start + i * 0.004, start + i * 0.004 + 0.02);
      if (t <= 0) continue;
      const q = P(f.at(r() * f.w, r() * f.h));
      out.push(<circle key={`s${i}`} cx={q[0]} cy={q[1]} r={w * 0.5} fill={INK} fillOpacity={0.5 * t} />);
    }
  }
  return out;
}

// Glazing, doors and windows. White fill knocks out the hatch behind.
function openings(box: typeof BOXES[number], f: any, p: number, P: (q: V3) => V2, w: number, amp: number) {
  const list = OPENINGS[`${box.id}:${f.id}`];
  if (!list || boxAt(box, p).r < 1) return null;
  const out: React.ReactNode[] = [];
  list.forEach((o, i) => {
    const [u0, v0, u1, v1, kind, mull] = o;
    const t = easeOut(window01(p, 0.46 + i * 0.022, 0.55 + i * 0.022));
    if (t <= 0) return;
    const r = rng(7000 + i * 13 + box.id.length);
    const q = [f.at(u0, v0), f.at(u1, v0), f.at(u1, v1), f.at(u0, v1)].map((x: V3) => P(x));
    out.push(<polygon key={`f${i}`} points={poly(q)} fill="#fff" fillOpacity={Math.min(1, t * 1.5)} />);
    q.forEach((a: V2, n: number) => out.push(<Stroke key={`e${i}-${n}`} d={sketch(a, q[(n + 1) % 4], r, amp * 0.6, 0.3)} t={t} w={w * 0.9} />));
    if (mull) {
      let n = 0;
      for (let u = u0 + mull; u < u1 - 0.2; u += mull, n++) {
        out.push(<Stroke key={`m${i}-${n}`} d={sketch(P(f.at(u, v0)), P(f.at(u, v1)), r, amp * 0.3, 0.1)} t={t} w={w * 0.7} />);
      }
    }
    if (kind === 'glass' || kind === 'window') {
      // reflection strokes
      const span = u1 - u0;
      for (let n = 0; n < Math.max(1, Math.round(span / 2.2)); n++) {
        const uu = u0 + (n + 0.3 + r() * 0.3) * (span / Math.max(1, Math.round(span / 2.2)));
        const vv = v0 + (v1 - v0) * (0.25 + r() * 0.3);
        const a = P(f.at(uu, vv)), b = P(f.at(uu + 0.5, vv + (v1 - v0) * 0.35));
        out.push(<Stroke key={`r${i}-${n}`} d={`M${a[0]} ${a[1]}L${b[0]} ${b[1]}`} t={window01(t, 0.6, 1)} w={w * 0.45} o={0.45} />);
      }
    }
    if (kind === 'door') {
      const a = P(f.at(u1 - 0.25, 1.0)), b = P(f.at(u1 - 0.25, 1.3));
      out.push(<Stroke key={`d${i}`} d={`M${a[0]} ${a[1]}L${b[0]} ${b[1]}`} t={t} w={w} />);
    }
  });
  return out;
}
