// Closing call to action: "The same change, three prices."
// The section pins and scroll plays a Remotion film (remotion/src/CostOfChange.tsx) of one house elevation.
// The same request (a bigger garden window) is an eraser at concept, a redraw at design, a demolition on site.
// Captions, the stage ruler and the cost-of-change chart are live HTML/SVG kept in step with the film.
// After the build the film rewinds to a blank page and the call to action arrives, at "Consultation":
// the moment a change costs nothing.
const { gsap, ScrollTrigger } = window;
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const mobileMQ = matchMedia('(max-width: 760px)');

const section = document.querySelector('[data-close]');
const pinEl = section.querySelector('[data-close-pin]');
const video = section.querySelector('[data-change]');
const still = section.querySelector('[data-change-still]');
const caps = [...section.querySelectorAll('[data-cap]')];
const rulerItems = [...section.querySelectorAll('[data-ruler] li')];
const marker = section.querySelector('[data-marker]');
const chart = section.querySelector('[data-chart]');
const finalEl = section.querySelector('[data-final]');
const ticks = [...section.querySelectorAll('[data-ticks] path')];

const variant = mobileMQ.matches ? 'mobile' : 'desktop';
still.src = `assets/change-${variant}-poster.jpg`;

// Film timeline (fraction of the clip) where each stage begins. Matches CHANGE_T in CostOfChange.tsx:
// consultation 0, concept from the sketch, design from the ink, build from the brickwork, handover after the refit.
const STAGES = [0, 0.05, 0.3, 0.55, 0.86, 1];
const clamp01 = (v) => Math.max(0, Math.min(1, v));
const win = (v, a, b) => clamp01((v - a) / (b - a));
// Film progress to a position along the five stages, 0..5.
const stageU = (p) => {
  for (let i = 0; i < 5; i++) if (p < STAGES[i + 1] || i === 4) return i + clamp01((p - STAGES[i]) / (STAGES[i + 1] - STAGES[i]));
  return 5;
};

// ---------------------------------------------------------------- chart
const NS = 'http://www.w3.org/2000/svg';
const svg = chart.querySelector('svg');
const mk = (tag, attrs) => { const n = document.createElementNS(NS, tag); for (const k in attrs) n.setAttribute(k, attrs[k]); svg.appendChild(n); return n; };
const CX0 = 14, CX1 = 346, CY0 = 18, CY1 = 178;
const cx = (u) => CX0 + (u / 5) * (CX1 - CX0);
const costY = (u) => CY1 - (CY1 - CY0) * (0.04 + 0.96 * Math.pow(u / 5, 2.3));
const freeY = (u) => CY1 - (CY1 - CY0) * (1 - 0.92 * Math.pow(u / 5, 0.65));
const curve = (fy) => { let d = ''; for (let i = 0; i <= 60; i++) { const u = (i / 60) * 5; d += `${i ? 'L' : 'M'}${cx(u).toFixed(1)} ${fy(u).toFixed(1)}`; } return d; };
mk('path', { d: `M${CX0} ${CY0 - 6}V${CY1}H${CX1 + 6}`, class: 'ch-axis' });
for (let i = 0; i <= 5; i++) mk('line', { x1: cx(i), y1: CY1, x2: cx(i), y2: CY1 + 5, class: 'ch-tick' });
const tTime = mk('text', { x: CX1 + 6, y: CY1 + 20, 'text-anchor': 'end', class: 'ch-time' });
tTime.textContent = 'TIME →';
const now = mk('line', { x1: cx(0), y1: CY0, x2: cx(0), y2: CY1, class: 'ch-now' });
const free = mk('path', { d: curve(freeY), class: 'ch-free', pathLength: 1 });
const cost = mk('path', { d: curve(costY), class: 'ch-cost', pathLength: 1 });
const dot = mk('circle', { cx: cx(0), cy: costY(0), r: 5, class: 'ch-dot' });
// stroke draw by fraction of length; close enough to "up to this stage" for these smooth curves
[free, cost].forEach((c) => { c.style.strokeDasharray = '1 1'; });

function drawChart(u) {
  const f = u / 5;
  free.style.strokeDashoffset = String(1 - f);
  cost.style.strokeDashoffset = String(1 - f);
  dot.setAttribute('cx', cx(u).toFixed(1));
  dot.setAttribute('cy', costY(u).toFixed(1));
  now.setAttribute('x1', cx(u).toFixed(1));
  now.setAttribute('x2', cx(u).toFixed(1));
}

let lastCap = -2, lastStage = -2;
function setCaption(i) {
  if (i === lastCap) return;
  lastCap = i;
  caps.forEach((c, j) => c.classList.toggle('is-on', j === i));
}
function setStage(u, here) {
  const i = Math.min(4, Math.floor(u));
  if (i !== lastStage) { lastStage = i; rulerItems.forEach((r, j) => r.classList.toggle('is-on', j === i)); }
  // Travels along the ruler with the film; at the call to action it sits on "Consultation", where you are.
  const at = here ? 0.5 : Math.min(u, 4.98);
  marker.style.left = `${(at / 5) * 100}%`;
  marker.classList.toggle('is-here', here);
}

// ---------------------------------------------------------------- static (reduced motion, or no video)
function staticMode() {
  section.classList.remove('close--film');
  caps.forEach((c) => c.classList.add('is-on'));
  drawChart(5);
  gsap.set(ticks, { strokeDashoffset: 0 });
}

if (reduce) {
  staticMode();
} else {
  gsap.registerPlugin(ScrollTrigger);
  section.classList.add('close--film');
  video.src = `assets/change-${variant}.mp4`;
  video.load();
  let ready = false;
  const onReady = () => { ready = true; };
  video.addEventListener('loadeddata', onReady);
  video.addEventListener('canplay', onReady);

  // The call to action, scrubbed in at the end of the pin (and back out on the way up).
  gsap.set(ticks, { strokeDashoffset: 1 });
  const finalTl = gsap.timeline({ paused: true, defaults: { ease: 'none' } })
    .fromTo(finalEl, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.1 })
    .fromTo(finalEl.querySelectorAll('.close__title .line > span'), { yPercent: 108 }, { yPercent: 0, duration: 0.35, stagger: 0.08, ease: 'power3.out' }, 0)
    .fromTo(finalEl.querySelectorAll('.close__body p'), { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.3, stagger: 0.08 }, 0.25)
    .fromTo(finalEl.querySelector('[data-beam]'), { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.3 }, 0.35)
    .to(ticks, { strokeDashoffset: 0, duration: 0.15, stagger: 0.1 }, 0.6);

  const S = { s: 0, ss: 0 };
  const st = ScrollTrigger.create({
    trigger: section,
    start: 'top top',
    end: () => `+=${Math.round(innerHeight * 4.2)}`,
    pin: pinEl, // the inner canvas: pinning the section itself would carry its frame margins
    scrub: true,
    invalidateOnRefresh: true,
    onUpdate: (self) => { S.s = self.progress; },
  });

  // Scroll budget: film 0 to 72%, rewind 72 to 82%, call to action 84 to 97%.
  const FILM = 0.72, REWIND = 0.82, CTA0 = 0.84, CTA1 = 0.97;
  gsap.ticker.add(() => {
    S.ss += (S.s - S.ss) * 0.18;
    if (Math.abs(S.s - S.ss) < 0.0004) S.ss = S.s;
    const s = S.ss;
    const p = s < FILM ? s / FILM : s < REWIND ? 1 - (s - FILM) / (REWIND - FILM) : 0;

    if (ready && video.duration) {
      const t = Math.min(video.duration - 0.04, p * video.duration);
      if (!video.seeking && Math.abs(video.currentTime - t) > 1 / 45) video.currentTime = t;
    }

    const rewinding = s >= FILM;
    const u = stageU(p);
    if (!rewinding) {
      setCaption(p < STAGES[1] * 0.9 ? 0 : p > 0.9 ? 4 : Math.min(3, Math.floor(u)));
    } else {
      setCaption(-1);
    }
    drawChart(u);
    chart.style.opacity = String(1 - win(s, REWIND - 0.02, CTA0 + 0.02));
    setStage(u, s >= CTA0);

    const f = win(s, CTA0, CTA1);
    finalTl.progress(f);
    finalEl.classList.toggle('is-live', f > 0.6);
  });

  // No clip in time: fall back to the readable static version.
  video.addEventListener('error', () => { st.kill(true); staticMode(); ScrollTrigger.refresh(); });
}
