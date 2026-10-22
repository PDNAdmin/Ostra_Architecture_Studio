// Shared geometry for the Ostra hero.
// The Remotion ink render and the live light layer both import this file,
// so the pre-rendered linework and the live shadows use one projection.
//
// World units are metres. x = east, y = north, z = up.
// The viewer sits south-west and above, so south, west and top faces show.

export const VIEWS = {
  desktop: { w: 1600, h: 1000, S: 27.5, cx: 1010, cy: 470 },
  mobile: { w: 1080, h: 1200, S: 27.5, cx: 575, cy: 600 },
};

// Video timeline, as a fraction of the clip.
export const INTRO_END = 0.62; // plays on load: footprints, walls, openings
// 0.62 to 1.00 is scrubbed by scroll: material hatching, paving, trees.

// Painter order: back to front. `rise` is the window of the video timeline
// in which the box grows from its base to full height.
export const BOXES = [
  { id: 'east', min: [14, 0, 0], max: [20, 14, 3.6], rise: [0.14, 0.34], mat: 'timber' },
  { id: 'flue', min: [16.4, 10.2, 3.6], max: [17.6, 11.4, 5.0], rise: [0.33, 0.4], mat: 'plaster' },
  { id: 'north', min: [0, 9, 0], max: [14, 14, 6.2], rise: [0.18, 0.42], mat: 'earth' },
  { id: 'roof', min: [-0.8, 7.6, 6.2], max: [14.6, 14.4, 6.5], rise: [0.4, 0.47], mat: 'oak' },
  { id: 'wallW', min: [0, 0.35, 0], max: [0.35, 9, 1.4], rise: [0.1, 0.22], mat: 'earth' },
  { id: 'wallS1', min: [0, 0, 0], max: [5, 0.35, 1.4], rise: [0.1, 0.2], mat: 'earth' },
  { id: 'wallS2', min: [7, 0, 0], max: [14, 0.35, 1.4], rise: [0.12, 0.22], mat: 'earth' },
];

export const TREES = [
  { id: 't1', base: [10.4, 4.4], h: 4.6, r: 1.9, draw: [0.8, 0.95] },
  { id: 't2', base: [-3.2, 1.6], h: 5.2, r: 2.2, draw: [0.84, 1.0] },
];

export const SITE = { min: [-5, -4.5], max: [22, 16] };
export const COURT = { min: [0.35, 0.35], max: [14, 9] };

const C30 = Math.cos(Math.PI / 6);
const S30 = 0.5;

const clamp01 = (v) => Math.max(0, Math.min(1, v));
export const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
export const easeOut = (t) => 1 - Math.pow(1 - t, 3);
export const window01 = (p, a, b) => clamp01((p - a) / (b - a));

function rawProject([x, y, z], S) {
  return [(x - y) * C30 * S, -(x + y) * S30 * S - z * S];
}

// Returns project(point3) -> [X, Y] in view pixels, centred on the full building.
export function makeProjector(view) {
  const pts = [];
  for (const b of BOXES) for (const c of corners(b.min, b.max)) pts.push(rawProject(c, view.S));
  let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
  for (const [x, y] of pts) {
    x0 = Math.min(x0, x); x1 = Math.max(x1, x);
    y0 = Math.min(y0, y); y1 = Math.max(y1, y);
  }
  const ox = view.cx - (x0 + x1) / 2;
  const oy = view.cy - (y0 + y1) / 2;
  const project = (p) => {
    const [x, y] = rawProject(p, view.S);
    return [x + ox, y + oy];
  };
  project.S = view.S;
  project.sphereR = (r) => r * view.S * 1.2247; // a sphere in this drawing projects at 1/0.8165
  return project;
}

export function corners(min, max) {
  const out = [];
  for (const x of [min[0], max[0]]) for (const y of [min[1], max[1]]) for (const z of [min[2], max[2]]) out.push([x, y, z]);
  return out;
}

// How far a box has risen at video progress p (0..1).
export function riseAt(box, p) {
  return easeInOut(window01(p, box.rise[0], box.rise[1]));
}

// The box at video progress p, with its top lowered while it rises.
export function boxAt(box, p) {
  const r = riseAt(box, p);
  const h = (box.max[2] - box.min[2]) * r;
  return { ...box, r, min: box.min, max: [box.max[0], box.max[1], box.min[2] + h] };
}

// The three faces the viewer can see, in 3D, plus outward normals.
export function visibleFaces(b) {
  const [x0, y0, z0] = b.min;
  const [x1, y1, z1] = b.max;
  return [
    { id: 'west', n: [-1, 0, 0], w: y1 - y0, h: z1 - z0,
      pts: [[x0, y1, z0], [x0, y0, z0], [x0, y0, z1], [x0, y1, z1]],
      at: (u, v) => [x0, y1 - u, z0 + v] },
    { id: 'south', n: [0, -1, 0], w: x1 - x0, h: z1 - z0,
      pts: [[x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1]],
      at: (u, v) => [x0 + u, y0, z0 + v] },
    { id: 'top', n: [0, 0, 1], w: x1 - x0, h: y1 - y0,
      pts: [[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]],
      at: (u, v) => [x0 + u, y0 + v, z1] },
  ];
}

// A simple, deliberately generic sun: rises east-north-east, peaks due south.
// hours: 6.5 to 19. Returns azimuth (deg from north, clockwise), altitude (deg)
// and a unit vector pointing toward the sun.
export function sunAt(hours) {
  const t = Math.max(6.5, Math.min(19, hours));
  const az = 180 + ((t - 12.75) / 6.25) * 105;
  const alt = 9 + 51 * Math.sin((Math.PI * (t - 6.5)) / 12.5);
  const a = (az * Math.PI) / 180;
  const e = (alt * Math.PI) / 180;
  return { hours: t, az, alt, dir: [Math.sin(a) * Math.cos(e), Math.cos(a) * Math.cos(e), Math.sin(e)] };
}

const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

// 0 when a face points straight at the sun, 1 when it faces away.
export function faceShade(face, sun) {
  return 1 - Math.max(0, dot(face.n, sun.dir));
}

function toGround(p, dir) {
  const k = p[2] / dir[2];
  return [p[0] - dir[0] * k, p[1] - dir[1] * k, 0];
}

// Convex hull, Andrew's monotone chain.
function hull(points) {
  const p = points.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lower = [];
  for (const q of p) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], q) <= 0) lower.pop();
    lower.push(q);
  }
  const upper = [];
  for (let i = p.length - 1; i >= 0; i--) {
    const q = p[i];
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], q) <= 0) upper.pop();
    upper.push(q);
  }
  upper.pop(); lower.pop();
  return lower.concat(upper);
}

// Ground shadow of a box: the hull of its corners pushed onto z = 0.
export function boxShadow(b, sun) {
  if (b.max[2] - b.min[2] < 0.01) return null;
  const g = corners(b.min, b.max).map((c) => toGround(c, sun.dir));
  return hull(g.map(([x, y]) => [x, y])).map(([x, y]) => [x, y, 0]);
}

// Ground shadow of a tree canopy (a sphere) as an ellipse, plus the trunk line.
export function treeShadow(tree, sun, grow = 1) {
  const [bx, by] = tree.base;
  const r = tree.r * grow;
  const c = toGround([bx, by, tree.h], sun.dir);
  const hl = Math.hypot(sun.dir[0], sun.dir[1]) || 1;
  const u = [-sun.dir[0] / hl, -sun.dir[1] / hl];
  const v = [-u[1], u[0]];
  const major = r / Math.sin((sun.alt * Math.PI) / 180);
  const ellipse = [];
  for (let i = 0; i < 28; i++) {
    const t = (i / 28) * Math.PI * 2;
    ellipse.push([c[0] + u[0] * major * Math.cos(t) + v[0] * r * Math.sin(t), c[1] + u[1] * major * Math.cos(t) + v[1] * r * Math.sin(t), 0]);
  }
  const trunkTop = toGround([bx, by, tree.h - r * 0.8], sun.dir);
  return { ellipse, trunk: [[bx, by, 0], trunkTop] };
}

// A point on the sun's path around the house, for the orange data path.
export function sunPoint(sun, radius = 9, centre = [9, 7, 3]) {
  return [centre[0] + sun.dir[0] * radius, centre[1] + sun.dir[1] * radius, centre[2] + sun.dir[2] * radius];
}

export function formatClock(hours) {
  const h = Math.floor(hours);
  const m = Math.floor((hours - h) * 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

// Seeded random for deterministic sketch wobble.
export function rng(seed) {
  let s = seed >>> 0 || 1;
  return () => {
    s ^= s << 13; s >>>= 0;
    s ^= s >> 17;
    s ^= s << 5; s >>>= 0;
    return s / 4294967296;
  };
}
