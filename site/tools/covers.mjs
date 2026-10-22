// Drawn journal covers: one object per article in ink and bone on the orange plate, the same language as the
// team portraits (one colour, the backdrop). Stand-ins until the photographed covers (asset-prompts D1–D6) arrive.
// Stroked shapes carry pathLength="1" so journal.js can draw them in.
const L = (d) => `<path class="cv-ink" pathLength="1" d="${d}"/>`;
const F = (d, cls = 'cv-fill') => `<path class="${cls}" d="${d}"/>`;
const shape = (d, cls = 'cv-fill') => F(d, cls) + L(d);
const rect = (x, y, w, h) => `M${x} ${y}h${w}v${h}h${-w}Z`;
const ticks = (x0, x1, y, step, long = 5) => {
  let d = '';
  for (let x = x0, i = 0; x <= x1; x += step, i++) d += `M${x} ${y}v${i % 5 ? 3 : long}`;
  return d;
};

const DRAW = {
  // a tape measure, a pencil and a folded plan
  tape: () => [
    `<ellipse class="cv-shadow" cx="150" cy="158" rx="118" ry="9"/>`,
    shape(rect(36, 92, 136, 60)),
    L('M104 92v60 M48 104h40v36h-40z M88 118h16 M120 104h40v20h-40z M140 124v16'),
    shape('M88 118h84v12h-84z'),
    L(ticks(92, 168, 118, 6)),
    L('M88 114v20'),
    shape('M172 70h46a14 14 0 0 1 14 14v42a14 14 0 0 1-14 14h-46z'),
    L('M201 105m-15 0a15 15 0 1 0 30 0a15 15 0 1 0-30 0 M201 105m-5 0a5 5 0 1 0 10 0a5 5 0 1 0-10 0'),
    `<g transform="translate(196 160) rotate(-38)">${shape('M0 0h96v9H0z')}${shape('M96 0l14 4.5L96 9z', 'cv-ink-fill')}${L('M18 0v9')}</g>`,
  ].join(''),
  // a rolled drawing tied with string, and a rubber stamp
  roll: () => [
    `<ellipse class="cv-shadow" cx="150" cy="156" rx="120" ry="9"/>`,
    shape('M50 98h160a8 18 0 0 1 0 36H50a8 18 0 0 1 0-36z'),
    L('M50 98a8 18 0 0 0 0 36 M50 104a4 12 0 0 0 0 24'),
    L('M96 98v36 M170 98v36 M96 98c-8-14 10-18 6-4 M96 98c10-12 14 2 4 2 M170 98c-8-14 10-18 6-4 M170 98c10-12 14 2 4 2'),
    shape('M226 140h48v12h-48z'),
    shape('M241 112h18v28h-18z'),
    shape('M250 82a15 13 0 1 1 0 26a15 13 0 1 1 0-26z'),
    L('M232 146h36'),
  ].join(''),
  // a card model of a terraced house, and the extension about to be added
  model: () => [
    `<ellipse class="cv-shadow" cx="160" cy="154" rx="118" ry="9"/>`,
    shape('M170 82l36-14v68l-36 14z'),
    shape('M120 46l36-14 50 36-36 14z'),
    shape('M70 82l50-36 50 36v68H70z'),
    L('M86 100h20v22H86z M134 100h20v22h-20z M112 150v-26h16v26 M182 92l14-6v20l-14 6z'),
    shape('M222 112l18-8h34l-18 8z'),
    shape('M256 112l18-8v38l-18 8z'),
    shape('M222 112h34v38h-34z'),
    L('M206 131h12 M214 127l4 4-4 4'),
  ].join(''),
  // stacked samples: oak, lime plaster, slate and brick
  samples: () => {
    let dots = '';
    for (let i = 0; i < 34; i++) { const x = 120 + ((i * 37) % 60), y = 92 + ((i * 53) % 22); dots += `M${x} ${y}h0.1`; }
    return [
      `<ellipse class="cv-shadow" cx="150" cy="156" rx="96" ry="8"/>`,
      shape(rect(108, 128, 84, 24)),
      L('M108 140h84 M128 128v12 M152 128v12 M176 128v12 M118 140v12 M140 140v12 M164 140v12 M186 140v12'),
      shape(rect(102, 117, 96, 11)),
      shape(rect(114, 88, 72, 29)),
      `<path class="cv-dots" d="${dots}"/>`,
      shape(rect(106, 56, 88, 32)),
      L('M110 64c20-6 40 6 60-2s20 4 22 2 M110 72c18 4 38-6 58 2s22-2 24 0 M110 80c22-4 42 4 62-2'),
    ].join('');
  },
  // a thick wall with one window, and the patch of sun it throws on the floor
  window: () => [
    F('M150 150h50l74 22h-56z', 'cv-light'),
    L('M150 150h50l74 22h-56z'),
    L('M20 150h260'),
    shape(rect(52, 30, 148, 120)),
    F(rect(100, 56, 50, 58), 'cv-plate'),
    L(`${rect(100, 56, 50, 58)} M100 56l10 7h30l10-7 M110 63v44h30v-44 M100 114l10-7 M150 114l-10-7`),
    L('M112 18l-6-8 M140 18l6-8 M126 16v-10'),
  ].join(''),
  // a wall cut through: render, wood-fibre insulation, timber stud, board and plaster
  section: (u) => [
    `<defs><pattern id="hx${u}" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><path d="M0 0v7" class="cv-hatch"/></pattern></defs>`,
    shape(rect(92, 34, 10, 128)),
    `<path d="${rect(102, 34, 44, 128)}" fill="url(#hx${u})" class="cv-fill-h"/>`, L(rect(102, 34, 44, 128)),
    shape(rect(146, 34, 22, 128)),
    L('M150 40c4 30-4 60 2 90s-2 20 0 28 M160 38c-3 40 4 70-1 120'),
    shape(rect(168, 34, 6, 128)),
    shape(rect(174, 34, 8, 128)),
    L('M244 72c-26 0-40 10-56 26 M188 98l3-10 M188 98l10-2 M244 112c-24 0-38 8-54 22 M190 134l2-10 M190 134l10-1'),
    L('M60 34v128 M56 34h8 M56 162h8'),
  ].join(''),
};

let n = 0;
export function cover(kind, label) {
  const u = ++n;
  return `<svg class="cover" viewBox="0 0 300 200" role="img" aria-label="${label}" data-cover><rect class="cv-plate" width="300" height="200"/>${DRAW[kind](u)}</svg>`;
}
