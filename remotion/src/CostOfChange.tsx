import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { rng, window01, easeOut, easeInOut } from '../../site/js/house.js';

// "The same change, three prices." One house elevation through Concept, Design and Build.
// The same request each time: a bigger garden window. At concept it is erased, at design redrawn,
// on site demolished. No text is baked in: the site lays captions, ruler and chart over the clip.
//
// Shared timeline (progress p, 0..1). The site reads these same windows (see site/js/close.js).
export const CHANGE_T = {
  site: [0.0, 0.05],
  sketch: [0.05, 0.16], conceptCloud: [0.16, 0.2], erase: [0.2, 0.25], resketch: [0.25, 0.3],
  ink: [0.3, 0.38], designCloud: [0.4, 0.44], sheets: [0.42, 0.5], redraw: [0.44, 0.52],
  build: [0.55, 0.64], buildCloud: [0.66, 0.69], demolish: [0.69, 0.77], props: [0.7, 0.76], refit: [0.77, 0.86],
};

type ViewName = 'desktop' | 'mobile';
const VIEWS: Record<ViewName, { w: number; h: number; S: number; cx: number; gy: number; k: number }> = {
  desktop: { w: 1600, h: 1000, S: 58, cx: 700, gy: 790, k: 1 },
  mobile: { w: 1080, h: 1080, S: 74, cx: 540, gy: 900, k: 1.6 },
};

const INK = '#14120F';
const PENCIL = '#7D7462';
const ORANGE = '#FF5500';
const ORANGE_INK = '#A33500';

// House elevation in metres: x from the left corner, y up from the ground.
const W = 10, EAVE = 5.6, RIDGE = 8.6;
const DOOR = [1.2, 0, 2.3, 2.3];
const UPPER = [[1.4, 3.4, 3.0, 4.8], [6.6, 3.4, 8.4, 4.8]];
const SMALL = [5.3, 0.95, 6.9, 2.25];      // the garden window as first drawn
const BIG = [4.3, 0.25, 8.7, 2.55];        // the window they asked for

type V2 = [number, number];
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const lerpRect = (a: number[], b: number[], t: number) => a.map((v, i) => lerp(v, b[i], t));

export const CostOfChange: React.FC<{ view: ViewName }> = ({ view }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const p = frame / (durationInFrames - 1);
  const V = VIEWS[view];
  const k = V.k;
  const X = (x: number) => V.cx + (x - W / 2) * V.S;
  const Y = (y: number) => V.gy - y * V.S;
  const P = (x: number, y: number): V2 => [X(x), Y(y)];
  const T = CHANGE_T;
  const w = (key: keyof typeof CHANGE_T) => window01(p, T[key][0], T[key][1]);
  const els: React.ReactNode[] = [];
  let key = 0;
  const K = () => key++;

  // ---- strokes
  const wobble = (a: V2, b: V2, r: () => number, amp: number) => {
    const mx = (a[0] + b[0]) / 2 + (r() - 0.5) * amp, my = (a[1] + b[1]) / 2 + (r() - 0.5) * amp;
    return `M${a[0].toFixed(1)} ${a[1].toFixed(1)}Q${mx.toFixed(1)} ${my.toFixed(1)} ${b[0].toFixed(1)} ${b[1].toFixed(1)}`;
  };
  const stroke = (d: string, t: number, color: string, width: number, op = 1, dash?: string) => {
    if (t <= 0 || op <= 0) return;
    els.push(<path key={K()} d={d} pathLength={1} fill="none" stroke={color} strokeWidth={width * k} strokeOpacity={op}
      strokeLinecap="round" strokeLinejoin="round" strokeDasharray={dash || '1 1'} strokeDashoffset={dash ? 0 : 1 - Math.min(1, t)} />);
  };
  const pencilLine = (a: V2, b: V2, t: number, seed: number, op = 1) => {
    const r = rng(seed);
    stroke(wobble(a, b, r, 6 * k), t, PENCIL, 1.3, 0.75 * op);
    stroke(wobble([a[0] + 1, a[1] - 1], [b[0] - 1, b[1] + 1], r, 7 * k), t * 1.05 - 0.05, PENCIL, 0.8, 0.45 * op);
  };
  const inkLine = (a: V2, b: V2, t: number, width = 1.8, op = 1, seed = 1) => {
    const r = rng(seed);
    stroke(wobble(a, b, r, 1.2 * k), t, INK, width, op);
  };
  const rectPts = (rc: number[]): V2[] => [P(rc[0], rc[1]), P(rc[2], rc[1]), P(rc[2], rc[3]), P(rc[0], rc[3])];
  const outline = (rc: number[], t: number, fn: (a: V2, b: V2, t: number, s: number) => void, seed: number) => {
    const q = rectPts(rc);
    q.forEach((a, i) => fn(a, q[(i + 1) % 4], window01(t, i * 0.18, i * 0.18 + 0.4), seed + i));
  };

  // The house's main lines: ground, walls, roof.
  const houseLines = (): [V2, V2][] => [
    [P(0, 0), P(0, EAVE)], [P(W, 0), P(W, EAVE)], [P(0, EAVE), P(W, EAVE)],
    [P(-0.6, EAVE - 0.3), P(W / 2, RIDGE)], [P(W / 2, RIDGE), P(W + 0.6, EAVE - 0.3)],
    [P(0, 2.95), P(W, 2.95)], // first floor line
  ];

  // ---- stage weights
  const siteT = easeOut(w('site'));
  const sketchT = easeOut(w('sketch'));
  const inkT = easeInOut(w('ink'));
  const buildT = easeInOut(w('build'));
  const sketchFade = 1 - inkT; // the pencil sketch gives way to ink

  // Which window is in the drawing at this moment, and how far each change has gone.
  const eraseT = w('erase');
  const resketchT = easeOut(w('resketch'));
  const redrawT = easeInOut(w('redraw'));
  const demolishT = w('demolish');
  const refitT = easeOut(w('refit'));

  // ground and plot
  inkLine(P(-3.5, 0), P(W + 3.5, 0), siteT, 1.6, 0.9, 11);
  for (let i = 0; i < 26; i++) {
    const x = -3.4 + i * 0.66;
    stroke(`M${X(x)} ${Y(0) + 4 * k}l${-9 * k} ${12 * k}`, window01(siteT, i / 30, i / 30 + 0.3), PENCIL, 0.9, 0.5);
  }

  // ---- sheets re-issued at design stage: two drawings slide out from behind and settle back
  const sheetsT = w('sheets');
  if (sheetsT > 0 && sheetsT < 1) {
    const out = Math.sin(sheetsT * Math.PI);
    [[-1, 26], [1, 46]].forEach(([dir, off], i) => {
      const dx = dir * out * off * k, dy = -out * (14 + i * 10) * k;
      els.push(<rect key={K()} x={X(-1.6) + dx} y={Y(RIDGE + 0.9) + dy} width={(W + 3.2) * V.S} height={(RIDGE + 1.6) * V.S}
        fill="#fff" stroke={PENCIL} strokeOpacity={0.6} strokeWidth={1.2 * k} transform={`rotate(${dir * out * 2.2} ${V.cx} ${V.gy})`} />);
    });
    // the sheet on top that hides the drawing behind
    els.push(<rect key={K()} x={X(-1.6)} y={Y(RIDGE + 0.9)} width={(W + 3.2) * V.S} height={(RIDGE + 1.6) * V.S}
      fill="#fff" stroke={PENCIL} strokeOpacity={0.5 * out} strokeWidth={1.2 * k} />);
  }

  // ---- concept: pencil sketch
  if (sketchFade > 0) {
    houseLines().forEach(([a, b], i) => pencilLine(a, b, window01(sketchT, i * 0.1, i * 0.1 + 0.45), 100 + i, sketchFade));
    outline(DOOR, window01(sketchT, 0.55, 1), (a, b, t, s) => pencilLine(a, b, t, s, sketchFade), 200);
    UPPER.forEach((u, j) => outline(u, window01(sketchT, 0.6 + j * 0.1, 1), (a, b, t, s) => pencilLine(a, b, t, s, sketchFade), 220 + j * 10));
    // the first, small window, until it is erased
    const smallOp = sketchFade * (1 - Math.min(1, eraseT * 1.4));
    if (smallOp > 0) outline(SMALL, window01(sketchT, 0.75, 1), (a, b, t, s) => pencilLine(a, b, t, s, smallOp), 260);
    // eraser: a soft smudge and crumbs where it rubbed
    if (eraseT > 0) {
      const cx = X((SMALL[0] + SMALL[2]) / 2), cy = Y((SMALL[1] + SMALL[3]) / 2);
      const r = rng(31);
      const sm = Math.sin(Math.min(1, eraseT) * Math.PI) * 0.9 + (eraseT >= 1 ? 0.25 : 0);
      els.push(<ellipse key={K()} cx={cx} cy={cy} rx={1.15 * V.S} ry={0.75 * V.S} fill={PENCIL} fillOpacity={0.07 * sm} />);
      for (let i = 0; i < 14; i++) {
        const a = r() * Math.PI * 2, d = (0.6 + r()) * V.S;
        els.push(<circle key={K()} cx={cx + Math.cos(a) * d * eraseT} cy={cy + Math.sin(a) * d * 0.5 + eraseT * 18 * k} r={(1 + r() * 1.6) * k}
          fill={PENCIL} fillOpacity={0.4 * Math.min(1, eraseT * 2) * sketchFade} />);
      }
    }
    // the bigger window, sketched in
    if (resketchT > 0) outline(BIG, resketchT, (a, b, t, s) => pencilLine(a, b, t, s, sketchFade), 300);
  }

  // ---- design: crisp ink, dimensions, centre line
  if (inkT > 0) {
    const op = 1 - buildT * 0.15;
    houseLines().forEach(([a, b], i) => inkLine(a, b, window01(inkT, i * 0.08, i * 0.08 + 0.5), i < 3 ? 2.2 : 1.6, op, 400 + i));
    outline(DOOR, window01(inkT, 0.4, 0.9), (a, b, t, s) => inkLine(a, b, t, 1.6, op, s), 500);
    UPPER.forEach((u, j) => outline(u, window01(inkT, 0.45 + j * 0.1, 0.95), (a, b, t, s) => inkLine(a, b, t, 1.6, op, s), 520 + j * 10));
    // the garden window at design: drawn as the big one, then redrawn bigger still after the change
    const DESIGN_BIG = [4.3, 0.25, 8.7, 2.55];
    const DESIGN_FIRST = [4.8, 0.6, 8.2, 2.4];
    const shrinkGrow = redrawT > 0 ? lerpRect(DESIGN_FIRST, DESIGN_BIG, redrawT) : DESIGN_FIRST;
    const winRect = buildT > 0 ? DESIGN_BIG : shrinkGrow;
    if (demolishT <= 0 || refitT >= 1) {
      outline(winRect, window01(inkT, 0.55, 1), (a, b, t, s) => inkLine(a, b, t, 1.6, op, s), 560);
      // mullions and a reflection hatch, the way glazing is drawn
      const [x0, y0, x1, y1] = winRect;
      for (let m = 1; m < 3; m++) inkLine(P(lerp(x0, x1, m / 3), y0), P(lerp(x0, x1, m / 3), y1), window01(inkT, 0.75, 1), 1.1, op, 580 + m);
      for (let h = 0; h < 3; h++) {
        const hx = lerp(x0, x1, 0.15 + h * 0.08);
        stroke(`M${X(hx)} ${Y(y0 + 0.3)}L${X(hx + 0.45)} ${Y(y0 + 1.0)}`, window01(inkT, 0.85, 1), INK, 0.8, 0.4 * op);
      }
    }
    // dimension strings (lines and ticks only; no figures in the clip)
    const dimT = window01(inkT, 0.6, 1) * (1 - buildT);
    if (dimT > 0) {
      const dy = Y(-0.9);
      inkLine([X(0), dy], [X(W), dy], dimT, 1, 0.7, 600);
      [0, 4.3, 8.7, W].forEach((x, i) => stroke(`M${X(x) - 6 * k} ${dy + 6 * k}L${X(x) + 6 * k} ${dy - 6 * k}`, dimT, INK, 1.1, 0.7));
      const dx = X(W + 1.4);
      inkLine([dx, Y(0)], [dx, Y(RIDGE)], dimT, 1, 0.7, 610);
      [0, EAVE, RIDGE].forEach((y) => stroke(`M${dx - 6 * k} ${Y(y) + 6 * k}L${dx + 6 * k} ${Y(y) - 6 * k}`, dimT, INK, 1.1, 0.7));
      // centre line of the gable
      stroke(`M${X(W / 2)} ${Y(RIDGE + 0.7)}L${X(W / 2)} ${Y(-0.4)}`, 1, INK, 0.9, 0.35 * dimT, `${14 * k} ${5 * k} ${2 * k} ${5 * k}`);
    }
  }

  // ---- build: brick coursing, roof tiles, scaffolding
  if (buildT > 0) {
    const opening = demolishT > 0 && refitT < 1
      ? lerpRect([4.3, 0.25, 8.7, 2.55], [3.9, 0, 9.1, 2.9], easeOut(Math.min(1, demolishT * 1.3)))
      : null;
    const inWindow = (x: number, y: number) => {
      const rects = [DOOR, ...UPPER, opening || BIG];
      return rects.some((r) => x > r[0] - 0.05 && x < r[2] + 0.05 && y > r[1] - 0.05 && y < r[3] + 0.05);
    };
    // brick courses: horizontal lines with staggered perpends, broken around the openings
    let row = 0;
    for (let y = 0.25; y < EAVE - 0.05; y += 0.25, row++) {
      const tRow = window01(buildT, row / 26, row / 26 + 0.25);
      if (tRow <= 0) continue;
      let x = 0;
      while (x < W) {
        const x2 = Math.min(W, x + 0.5);
        if (!inWindow((x + x2) / 2, y - 0.12)) {
          stroke(`M${X(x)} ${Y(y)}L${X(x2)} ${Y(y)}`, tRow, INK, 0.7, 0.45);
          const px = x + (row % 2 ? 0.25 : 0.5);
          if (px < W - 0.05 && !inWindow(px, y - 0.12)) stroke(`M${X(px)} ${Y(y)}L${X(px)} ${Y(y - 0.25)}`, tRow, INK, 0.6, 0.35);
        }
        x = x2;
      }
    }
    // roof tiles: lines parallel to the eaves
    for (let i = 1; i < 12; i++) {
      const f = i / 12;
      const a = P(lerp(-0.6, W / 2, f), lerp(EAVE - 0.3, RIDGE, f));
      const b = P(lerp(W + 0.6, W / 2, f), lerp(EAVE - 0.3, RIDGE, f));
      stroke(`M${a[0]} ${a[1]}L${b[0]} ${b[1]}`, window01(buildT, 0.3 + f * 0.4, 0.5 + f * 0.4), INK, 0.7, 0.4);
    }
    // scaffolding, standing until the house is handed over
    const scaffT = window01(buildT, 0.1, 0.6) * (1 - window01(p, 0.9, 0.98));
    if (scaffT > 0) {
      [-0.7, 3.2, 6.9, W + 0.7].forEach((x, i) => stroke(`M${X(x)} ${Y(0)}L${X(x)} ${Y(6.6)}`, window01(scaffT, i * 0.1, i * 0.1 + 0.5), PENCIL, 1.3, 0.8));
      [2.0, 4.0, 6.0].forEach((y, i) => stroke(`M${X(-0.7)} ${Y(y)}L${X(W + 0.7)} ${Y(y)}`, window01(scaffT, 0.4 + i * 0.1, 0.8 + i * 0.1), PENCIL, 1.1, 0.7));
      stroke(`M${X(-0.7)} ${Y(0)}L${X(3.2)} ${Y(4)}`, window01(scaffT, 0.7, 1), PENCIL, 0.9, 0.5);
      stroke(`M${X(6.9)} ${Y(2)}L${X(W + 0.7)} ${Y(6)}`, window01(scaffT, 0.75, 1), PENCIL, 0.9, 0.5);
    }

    // demolition: bricks around the opening break away and fall
    if (demolishT > 0) {
      const r = rng(77);
      for (let i = 0; i < 46; i++) {
        const bx = lerp(3.9, 9.1, r()), by = lerp(0.2, 2.9, r());
        const start = r() * 0.5;
        const t = window01(demolishT, start, start + 0.45);
        if (t <= 0 || refitT >= 1) continue;
        const fall = t * t * (by + 0.3);
        const drift = (r() - 0.5) * 1.4 * t;
        const rot = (r() - 0.5) * 220 * t;
        const [x, y] = P(bx + drift, Math.max(0.04, by - fall));
        const bw = 0.42 * V.S, bh = 0.2 * V.S;
        els.push(<rect key={K()} x={-bw / 2} y={-bh / 2} width={bw} height={bh} fill="#fff" stroke={INK} strokeWidth={1 * k}
          transform={`translate(${x} ${y}) rotate(${rot})`} opacity={1 - window01(refitT, 0, 0.6)} />);
      }
      // dust
      for (let i = 0; i < 30; i++) {
        const a = r() * Math.PI * 2, d = r() * 2.6 * V.S * Math.min(1, demolishT * 1.5);
        const [cx, cy] = P(6.5, 1.3);
        els.push(<circle key={K()} cx={cx + Math.cos(a) * d} cy={cy + Math.sin(a) * d * 0.6} r={(1 + r() * 2) * k}
          fill={PENCIL} fillOpacity={0.35 * Math.sin(Math.min(1, demolishT) * Math.PI)} />);
      }
      // the opening, ragged while it is open
      if (opening && refitT < 1) {
        const q = rectPts(opening);
        q.forEach((a, i) => inkLine(a, q[(i + 1) % 4], 1, 1.4, 0.9, 700 + i));
      }
    }
    // props: two raking shores hold the wall above while it is open
    const propT = window01(p, T.props[0], T.props[1]) * (1 - window01(refitT, 0.6, 1));
    if (propT > 0) {
      [[3.6, 2.9, 1.8], [9.4, 2.9, 11.6]].forEach(([x, y, fx], i) => {
        inkLine(P(x, y), P(fx, 0), window01(propT, i * 0.2, i * 0.2 + 0.6), 2.4, 1, 720 + i);
        stroke(`M${X(fx) - 10 * k} ${Y(0)}L${X(fx) + 10 * k} ${Y(0)}`, propT, INK, 3, 1);
      });
    }
    // refit: a new steel lintel and the new window
    if (refitT > 0) {
      const L = [3.9, 2.55, 9.1, 2.9];
      const lt = window01(refitT, 0, 0.35);
      const lx = lerp(-4, 0, easeOut(lt));
      els.push(<rect key={K()} x={X(L[0] + lx)} y={Y(L[3])} width={(L[2] - L[0]) * V.S} height={(L[3] - L[1]) * V.S}
        fill={INK} fillOpacity={0.85} opacity={lt > 0 ? 1 : 0} />);
      outline(BIG, window01(refitT, 0.35, 0.9), (a, b, t, s) => inkLine(a, b, t, 1.8, 1, s), 740);
      for (let m = 1; m < 3; m++) inkLine(P(lerp(BIG[0], BIG[2], m / 3), BIG[1]), P(lerp(BIG[0], BIG[2], m / 3), BIG[3]), window01(refitT, 0.6, 1), 1.2, 1, 760 + m);
      // make good: courses either side are re-laid
      const mg = window01(refitT, 0.7, 1);
      for (let y = 0.25; y < 2.9; y += 0.25) {
        stroke(`M${X(3.9)} ${Y(y)}L${X(4.3)} ${Y(y)}`, mg, INK, 0.7, 0.45);
        stroke(`M${X(8.7)} ${Y(y)}L${X(9.1)} ${Y(y)}`, mg, INK, 0.7, 0.45);
      }
    }
  }

  // ---- revision clouds: the same change, marked heavier at each stage
  const cloud = (rc: number[], t: number, weight: number, color: string, seed: number, passes: number, fade = 1) => {
    if (t <= 0 || fade <= 0) return;
    const pad = 0.45;
    const x0 = X(rc[0] - pad), x1 = X(rc[2] + pad), y0 = Y(rc[3] + pad), y1 = Y(rc[1] - pad * 0.6);
    for (let pass = 0; pass < passes; pass++) {
      const r = rng(seed + pass * 17);
      const R = 15 * k;
      const pts: V2[] = [];
      const edge = (ax: number, ay: number, bx: number, by: number) => {
        const n = Math.max(2, Math.round(Math.hypot(bx - ax, by - ay) / (R * 1.6)));
        for (let i = 1; i <= n; i++) pts.push([lerp(ax, bx, i / n) + (r() - 0.5) * 3 * k, lerp(ay, by, i / n) + (r() - 0.5) * 3 * k]);
      };
      edge(x0, y0, x1, y0); edge(x1, y0, x1, y1); edge(x1, y1, x0, y1); edge(x0, y1, x0, y0);
      let d = `M${pts[pts.length - 1][0].toFixed(1)} ${pts[pts.length - 1][1].toFixed(1)}`;
      pts.forEach((q, i) => {
        const prev = pts[(i - 1 + pts.length) % pts.length];
        const seg = Math.hypot(q[0] - prev[0], q[1] - prev[1]);
        d += ` A ${(seg * 0.56).toFixed(1)} ${(seg * 0.56).toFixed(1)} 0 0 1 ${q[0].toFixed(1)} ${q[1].toFixed(1)}`;
      });
      stroke(d, t * (1 + pass * 0.08) - pass * 0.08, color, weight * (pass ? 0.6 : 1), fade * (pass ? 0.6 : 1));
    }
    // revision triangle on the cloud's corner
    const tt = window01(t, 0.85, 1);
    if (tt > 0) {
      const s = 13 * k * easeOut(tt);
      els.push(<polygon key={K()} points={`${x1},${y0 - s} ${x1 + s},${y0 + s * 0.7} ${x1 - s},${y0 + s * 0.7}`}
        fill="#fff" stroke={color} strokeWidth={weight * 0.8 * k} opacity={fade} />);
      els.push(<circle key={K()} cx={x1} cy={y0 + s * 0.2} r={2.2 * k * easeOut(tt)} fill={color} opacity={fade} />);
    }
  };
  // concept: a light pencil-orange cloud, gone once the window is re-sketched
  cloud(SMALL, w('conceptCloud'), 1.4, ORANGE, 900, 1, (1 - resketchT * 0.9) * sketchFade);
  // design: crisp, sharper
  cloud([4.8, 0.6, 8.2, 2.4], w('designCloud'), 2.2, ORANGE_INK, 910, 1, 1 - window01(redrawT, 0.6, 1));
  // site: heavy, doubled
  cloud(BIG, w('buildCloud'), 3.6, ORANGE, 920, 2, 1 - window01(refitT, 0.4, 0.9));

  return (
    <svg width={V.w} height={V.h} viewBox={`0 0 ${V.w} ${V.h}`} style={{ background: '#fff' }}>
      <rect width={V.w} height={V.h} fill="#fff" />
      {els}
    </svg>
  );
};
