import React from 'react';
import { AbsoluteFill, continueRender, delayRender, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { rng, window01, easeOut, easeInOut } from '../../site/js/house.js';

// "The desk": the studio's five stages as layers landing on a drafting table, seen from above.
// Notepad (consultation), yellow trace (concept), white trace (design), a site photo (build), the keys (handover).
// No text is baked in; the site lays the stage captions over the film.
// Stage windows (fraction of the clip). Mirrored by STAGES in site/js/studio.js.
export const DESK_T = {
  consult: [0.02, 0.2], concept: [0.2, 0.4], design: [0.4, 0.6], build: [0.6, 0.8], hand: [0.8, 0.96],
};

const W = 1600, H = 1000;
const INK = '#14120F';
const PENCIL = '#6F6656';
const ORANGE = '#FF5500';
const ORANGE_INK = '#A33500';

type V2 = [number, number];
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// A sheet sliding onto the stack: from an offset and rotation, easing to rest with a tiny settle.
function land(t: number, from: V2, rot0: number, rot1: number) {
  const e = easeOut(Math.min(1, t * 1.15));
  const settle = t > 0.85 ? Math.sin((t - 0.85) / 0.15 * Math.PI) * 0.15 : 0;
  return { x: lerp(from[0], 0, e), y: lerp(from[1], 0, e), r: lerp(rot0, rot1, e) + settle, o: Math.min(1, t * 4) };
}

const Stroke: React.FC<{ d: string; t: number; c?: string; w?: number; o?: number }> = ({ d, t, c = INK, w = 2, o = 1 }) =>
  t <= 0 ? null : (
    <path d={d} pathLength={1} fill="none" stroke={c} strokeWidth={w} strokeOpacity={o} strokeLinecap="round" strokeLinejoin="round"
      strokeDasharray="1 1" strokeDashoffset={1 - Math.min(1, t)} />
  );

// hand-drawn line with a little wobble
function wob(a: V2, b: V2, r: () => number, amp = 3) {
  const mx = (a[0] + b[0]) / 2 + (r() - 0.5) * amp, my = (a[1] + b[1]) / 2 + (r() - 0.5) * amp;
  return `M${a[0].toFixed(1)} ${a[1].toFixed(1)}Q${mx.toFixed(1)} ${my.toFixed(1)} ${b[0].toFixed(1)} ${b[1].toFixed(1)}`;
}
const rect = (x: number, y: number, w: number, h: number): V2[] => [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];

// The plan, in sheet units (sheet is 900 x 620). Rooms around a court, like Court House.
const PLAN = {
  outline: [140, 120, 620, 400],
  rooms: [
    [140, 120, 620, 150], // north wing
    [520, 270, 240, 250], // east wing
  ],
  court: [140, 270, 380, 250],
  walls: [[140, 270, 140, 520], [140, 520, 330, 520], [410, 520, 520, 520]], // garden wall with the gap
  parts: [[300, 120, 300, 270], [440, 120, 440, 270], [520, 380, 760, 380]],
};

const PHOTO = staticFile('court-house.jpg');

export const Desk: React.FC = () => {
  // hold every frame until the site photo has loaded
  const [handle] = React.useState(() => delayRender('site photo'));
  React.useEffect(() => {
    const im = new Image();
    im.onload = () => continueRender(handle);
    im.onerror = () => continueRender(handle);
    im.src = PHOTO;
  }, [handle]);
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const p = frame / (durationInFrames - 1);
  const T = DESK_T;
  const w = (k: keyof typeof DESK_T) => window01(p, T[k][0], T[k][1]);
  const push = 1 + 0.05 * easeInOut(p); // a slow push-in across the whole film

  // ---------------------------------------------------------------- notepad (consultation)
  const cT = w('consult');
  const pad = land(window01(cT, 0, 0.3), [-900, 60], -14, -5);
  const padLines: React.ReactNode[] = [];
  {
    const r = rng(11);
    for (let i = 0; i < 7; i++) {
      const y = 120 + i * 46;
      const len = 260 + r() * 180;
      let d = `M60 ${y}`;
      for (let x = 60; x < 60 + len; x += 18) d += `L${x + 9} ${y - 5 - r() * 6}L${x + 18} ${y}`;
      padLines.push(<Stroke key={`n${i}`} d={d} t={window01(cT, 0.3 + i * 0.06, 0.42 + i * 0.06)} c={PENCIL} w={2.2} o={0.85} />);
    }
    // three items, ticked: brief, budget, site
    [0, 1, 2].forEach((i) => {
      const y = 470 + i * 46;
      padLines.push(<rect key={`b${i}`} x={60} y={y - 16} width={22} height={22} fill="none" stroke={INK} strokeWidth={2} opacity={window01(cT, 0.55, 0.6)} />);
      padLines.push(<Stroke key={`t${i}`} d={`M64 ${y - 4}l6 7l12 -16`} t={window01(cT, 0.62 + i * 0.08, 0.68 + i * 0.08)} c={ORANGE_INK} w={3} />);
      padLines.push(<Stroke key={`l${i}`} d={`M100 ${y - 5}l${120 + i * 30} 0`} t={window01(cT, 0.6 + i * 0.08, 0.7 + i * 0.08)} c={PENCIL} w={2.2} o={0.8} />);
    });
    // site sketch: plot, north arrow, sun arc
    padLines.push(<Stroke key="plot" d="M420 420 L560 400 L590 560 L440 590 Z" t={window01(cT, 0.5, 0.7)} c={INK} w={2} />);
    padLines.push(<Stroke key="north" d="M520 300 l0 -60 M508 256 l12 -16 l12 16" t={window01(cT, 0.7, 0.8)} c={INK} w={2} />);
    padLines.push(<Stroke key="sun" d="M400 380 Q500 260 610 370" t={window01(cT, 0.75, 0.92)} c={ORANGE} w={2.4} />);
  }

  // ---------------------------------------------------------------- yellow trace (concept)
  const kT = w('concept');
  const trace1 = land(window01(kT, 0, 0.3), [80, -900], 9, 1.5);
  const sketch: React.ReactNode[] = [];
  {
    const r = rng(23);
    const box = (b: number[], t0: number, t1: number, key: string) => {
      rect(b[0], b[1], b[2], b[3]).forEach((a, i, arr) => {
        const b2 = arr[(i + 1) % 4];
        sketch.push(<Stroke key={`${key}${i}`} d={wob([a[0] - 6, a[1]], [b2[0] + 6, b2[1]], r, 9)} t={window01(kT, t0 + i * 0.03, t1 + i * 0.03)} c={PENCIL} w={2.6} o={0.9} />);
        sketch.push(<Stroke key={`${key}${i}b`} d={wob(a, b2, r, 12)} t={window01(kT, t0 + 0.05 + i * 0.03, t1 + 0.05 + i * 0.03)} c={PENCIL} w={1.4} o={0.5} />);
      });
    };
    box(PLAN.rooms[0], 0.3, 0.45, 'r0');
    box(PLAN.rooms[1], 0.42, 0.57, 'r1');
    // the court: loose circles of the pen, and a tree
    sketch.push(<Stroke key="court" d="M230 330 C 290 300, 420 310, 450 360 S 400 480, 300 470 S 200 400, 230 330" t={window01(kT, 0.55, 0.75)} c={ORANGE} w={3} o={0.85} />);
    sketch.push(<Stroke key="tree" d="M330 395 m-28 0 a28 28 0 1 0 56 0 a28 28 0 1 0 -56 0" t={window01(kT, 0.7, 0.85)} c={PENCIL} w={2} />);
    // arrows: light in, the way in
    sketch.push(<Stroke key="ar1" d="M330 600 L330 530 M318 548 L330 530 L342 548" t={window01(kT, 0.78, 0.9)} c={PENCIL} w={2.2} />);
    sketch.push(<Stroke key="ar2" d="M60 560 Q120 470 210 440 M190 432 L210 440 L198 458" t={window01(kT, 0.82, 0.95)} c={ORANGE} w={2.4} />);
  }

  // ---------------------------------------------------------------- white trace (design)
  const dT = w('design');
  const trace2 = land(window01(dT, 0, 0.28), [900, 40], -7, 0);
  const plan: React.ReactNode[] = [];
  {
    const line = (x1: number, y1: number, x2: number, y2: number, t: number, wd = 2.2, key = '') =>
      plan.push(<Stroke key={key || `${x1}-${y1}-${x2}-${y2}`} d={`M${x1} ${y1}L${x2} ${y2}`} t={t} c={INK} w={wd} />);
    // thick walls: double lines around the wings
    const [ox, oy, ow, oh] = PLAN.outline;
    const t0 = 0.28;
    rect(ox, oy, ow, 150).forEach((a, i, arr) => line(a[0], a[1], arr[(i + 1) % 4][0], arr[(i + 1) % 4][1], window01(dT, t0 + i * 0.03, t0 + 0.1 + i * 0.03), 3.4, `wn${i}`));
    rect(520, 270, 240, 250).forEach((a, i, arr) => line(a[0], a[1], arr[(i + 1) % 4][0], arr[(i + 1) % 4][1], window01(dT, t0 + 0.08 + i * 0.03, t0 + 0.18 + i * 0.03), 3.4, `we${i}`));
    PLAN.walls.forEach((wl, i) => line(wl[0], wl[1], wl[2], wl[3], window01(dT, 0.42 + i * 0.03, 0.52 + i * 0.03), 3.4, `gw${i}`));
    PLAN.parts.forEach((wl, i) => line(wl[0], wl[1], wl[2], wl[3], window01(dT, 0.48 + i * 0.03, 0.58 + i * 0.03), 1.6, `pt${i}`));
    // glazing to the court: thin double line
    line(160, 268, 500, 268, window01(dT, 0.55, 0.65), 1.2, 'g1');
    line(160, 274, 500, 274, window01(dT, 0.55, 0.65), 1.2, 'g2');
    // door swings
    const swing = window01(dT, 0.6, 0.7);
    plan.push(<Stroke key="sw1" d="M330 520 A80 80 0 0 0 410 440" t={swing} c={INK} w={1.2} o={0.7} />);
    // court paving grid, faint
    for (let i = 1; i < 6; i++) line(140 + i * 63, 280, 140 + i * 63, 510, window01(dT, 0.62 + i * 0.01, 0.7 + i * 0.01), 0.8, `cx${i}`);
    for (let i = 1; i < 4; i++) line(150, 270 + i * 62, 510, 270 + i * 62, window01(dT, 0.64 + i * 0.01, 0.72 + i * 0.01), 0.8, `cy${i}`);
    // dimension strings
    const dm = window01(dT, 0.7, 0.85);
    line(140, 80, 760, 80, dm, 1.2, 'd1');
    [140, 300, 440, 520, 760].forEach((x, i) => line(x - 6, 86, x + 6, 74, dm, 1.4, `dt${i}`));
    line(100, 120, 100, 520, dm, 1.2, 'd2');
    [120, 270, 520].forEach((y, i) => line(94, y + 6, 106, y - 6, dm, 1.4, `dv${i}`));
    // the key idea: the court, washed orange
    const wash = window01(dT, 0.85, 0.98);
    plan.push(<rect key="wash" x={146} y={278} width={368} height={238} fill={ORANGE} opacity={0.16 * wash} />);
  }

  // ---------------------------------------------------------------- site photo (build)
  const bT = w('build');
  const photo = land(window01(bT, 0, 0.3), [-200, 900], 18, 6);
  const clip = window01(bT, 0.3, 0.45);
  const note: React.ReactNode[] = [];
  {
    const r = rng(41);
    for (let i = 0; i < 3; i++) {
      let d = `M24 ${40 + i * 30}`;
      for (let x = 24; x < 190; x += 16) d += `L${x + 8} ${36 + i * 30 - r() * 6}L${x + 16} ${40 + i * 30}`;
      note.push(<Stroke key={`sn${i}`} d={d} t={window01(bT, 0.5 + i * 0.08, 0.62 + i * 0.08)} c={PENCIL} w={2} />);
    }
  }
  const noteLand = land(window01(bT, 0.35, 0.6), [600, 300], -20, -8);

  // ---------------------------------------------------------------- keys (handover)
  const hT = w('hand');
  const guide = land(window01(hT, 0, 0.35), [700, -400], 30, 12);
  const keys = land(window01(hT, 0.25, 0.65), [500, 700], -60, -18);

  // drop shadow grows with height as a sheet lands
  const sh = (o: number) => ({ filter: `drop-shadow(0 ${6 + 18 * (1 - o)}px ${10 + 20 * (1 - o)}px rgba(60,48,30,${0.22 + 0.1 * (1 - o)}))` });

  return (
    <AbsoluteFill style={{ background: '#E6DFD0' }}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ transform: `scale(${push})`, transformOrigin: '52% 50%' }}>
        <defs>
          <pattern id="grain" width="400" height="12" patternUnits="userSpaceOnUse">
            <path d="M0 6 Q100 3 200 7 T400 5" fill="none" stroke="#D6CCB8" strokeWidth="1" />
          </pattern>
          <pattern id="cut" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M40 0H0V40" fill="none" stroke="#CBBFA8" strokeWidth="1" />
          </pattern>
          <pattern id="lined" width="10" height="46" patternUnits="userSpaceOnUse" y="128">
            <path d="M0 0H10" stroke="#C9D7DA" strokeWidth="1.2" />
          </pattern>
        </defs>
        {/* desk and cutting mat */}
        <rect width={W} height={H} fill="#E6DFD0" />
        <rect width={W} height={H} fill="url(#grain)" opacity={0.7} />
        <rect x={250} y={110} width={1180} height={800} fill="#DCD3C1" />
        <rect x={250} y={110} width={1180} height={800} fill="url(#cut)" />
        {/* tools: scale rule, pencil, eraser */}
        <g transform="translate(1180 860) rotate(-8)" style={sh(1)}>
          <rect width={380} height={34} fill="#F3EEE3" stroke="#B9AE98" />
          {Array.from({ length: 38 }, (_, i) => <line key={i} x1={10 + i * 10} y1={0} x2={10 + i * 10} y2={i % 5 ? 8 : 14} stroke={INK} strokeWidth={1} />)}
        </g>
        <g transform="translate(140 820) rotate(-32)" style={sh(1)}>
          <rect width={300} height={16} rx={2} fill="#2A2622" />
          <polygon points="300,0 336,8 300,16" fill="#E2C9A0" />
          <polygon points="326,5 336,8 326,11" fill={INK} />
        </g>
        <g transform="translate(1420 160) rotate(14)" style={sh(1)}>
          <rect width={90} height={44} rx={6} fill="#F2E6E0" />
          <rect width={30} height={44} rx={6} fill="#5C7A86" />
        </g>

        {/* 1 consultation: notepad */}
        {cT > 0 && (
          <g transform={`translate(${300 + pad.x} ${150 + pad.y}) rotate(${pad.r} 340 360)`} opacity={pad.o} style={sh(window01(cT, 0, 0.3))}>
            <rect width={680} height={720} fill="#FBFAF5" />
            <rect width={680} height={720} fill="url(#lined)" />
            <rect width={680} height={26} fill="#2A2622" />
            <line x1={40} y1={26} x2={40} y2={720} stroke="#E9B4A4" strokeWidth={1.5} />
            <g transform="translate(0 20)">{padLines}</g>
          </g>
        )}

        {/* 2 concept: yellow trace, semi-transparent so the notes show through */}
        {kT > 0 && (
          <g transform={`translate(${380 + trace1.x} ${170 + trace1.y}) rotate(${trace1.r} 450 310)`} opacity={trace1.o} style={sh(window01(kT, 0, 0.3))}>
            <rect width={900} height={620} fill="#F6E7A8" opacity={0.62} />
            <g>{sketch}</g>
          </g>
        )}

        {/* 3 design: white trace, aligned over the sketch */}
        {dT > 0 && (
          <g transform={`translate(${380 + trace2.x} ${170 + trace2.y}) rotate(${trace2.r} 450 310)`} opacity={trace2.o} style={sh(window01(dT, 0, 0.28))}>
            <rect width={900} height={620} fill="#FFFFFF" opacity={0.6} />
            <g>{plan}</g>
            {/* title block corner */}
            <g opacity={window01(dT, 0.8, 0.95)}>
              <rect x={680} y={540} width={200} height={60} fill="none" stroke={INK} strokeWidth={1.4} />
              <line x1={680} y1={570} x2={880} y2={570} stroke={INK} strokeWidth={1} />
              <line x1={780} y1={540} x2={780} y2={600} stroke={INK} strokeWidth={1} />
            </g>
          </g>
        )}

        {/* 4 build: site photo with a bulldog clip, and a site note */}
        {bT > 0 && (
          <g transform={`translate(${860 + photo.x} ${380 + photo.y}) rotate(${photo.r} 260 200)`} opacity={photo.o} style={sh(window01(bT, 0, 0.3))}>
            <rect x={-16} y={-16} width={552} height={432} fill="#FFFFFF" />
            <image href={PHOTO} width={520} height={390} preserveAspectRatio="xMidYMid slice" />
            <g opacity={clip} transform={`translate(230 ${-34 + (1 - clip) * -30})`}>
              <rect width={60} height={30} rx={3} fill="#3A342D" />
              <path d="M8 30 L8 54 M52 30 L52 54" stroke="#3A342D" strokeWidth={4} />
            </g>
          </g>
        )}
        {bT > 0.35 && (
          <g transform={`translate(${540 + noteLand.x} ${640 + noteLand.y}) rotate(${noteLand.r} 110 70)`} opacity={noteLand.o} style={sh(window01(bT, 0.35, 0.6))}>
            <rect width={230} height={150} fill="#FFF7C9" />
            <g>{note}</g>
          </g>
        )}

        {/* 5 handover: the house guide and the keys */}
        {hT > 0 && (
          <g transform={`translate(${1130 + guide.x} ${170 + guide.y}) rotate(${guide.r} 130 170)`} opacity={guide.o} style={sh(window01(hT, 0, 0.35))}>
            <rect width={260} height={340} fill="#F4EFE5" stroke="#CFC4AE" />
            <rect x={0} y={0} width={14} height={340} fill="#2A2622" />
            <path d="M70 200 L130 150 L190 200 L190 260 L70 260 Z" fill="none" stroke={INK} strokeWidth={2.4} />
            <rect x={110} y={220} width={40} height={40} fill={ORANGE} opacity={0.85} />
            <line x1={60} y1={300} x2={200} y2={300} stroke={INK} strokeWidth={1.5} />
          </g>
        )}
        {hT > 0.25 && (
          <g transform={`translate(${1010 + keys.x} ${700 + keys.y}) rotate(${keys.r} 60 40) scale(1.7)`} opacity={keys.o} style={sh(window01(hT, 0.25, 0.65))}>
            {/* tag */}
            <path d="M-110 20 L-30 0 L-14 30 L-94 50 Z" fill={ORANGE} />
            <circle cx={-28} cy={16} r={5} fill="#E6DFD0" />
            <path d="M-28 16 Q0 10 20 30" fill="none" stroke="#8C7A55" strokeWidth={2} />
            {/* ring and two keys */}
            <circle cx={36} cy={36} r={26} fill="none" stroke="#B89B5E" strokeWidth={5} />
            <g transform="translate(52 50) rotate(28)">
              <circle r={22} fill="#C9A866" /><circle r={7} fill="#E6DFD0" />
              <rect x={18} y={-6} width={110} height={12} fill="#C9A866" />
              <path d="M100 6 l0 12 l10 0 l0 -6 l8 0 l0 -6" fill="#C9A866" />
            </g>
            <g transform="translate(40 60) rotate(70)">
              <circle r={18} fill="#9E9A92" /><circle r={6} fill="#E6DFD0" />
              <rect x={14} y={-5} width={90} height={10} fill="#9E9A92" />
            </g>
          </g>
        )}
      </svg>
    </AbsoluteFill>
  );
};
