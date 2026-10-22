// Case study pages (other than Court House): the ink axonometric draws itself, the render develops out of the
// key idea, and the eye-level photo opens out from a narrow slot as you scroll on.
import { PROJECTS, build, drawTimeline } from './drawings.js';
const { gsap } = window;
const { reduce } = window.__page;

const fig = document.querySelector('[data-cp-drawing]');
const svg = fig.querySelector('[data-drawing]');
const render = fig.querySelector('[data-cp-render]');
const draw = drawTimeline(build(svg, PROJECTS[svg.dataset.drawing]));
const ground = document.querySelector('[data-cp-ground]');

if (reduce) {
  draw.progress(1);
  gsap.set(svg, { opacity: 0 });
} else {
  gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: fig, start: 'top 85%', end: 'bottom 75%', scrub: 0.4 } })
    .add(draw.paused(false), 0)
    .fromTo(render, { '--r': '0%', '--g': 1, scale: 1.06 }, { '--r': '170%', duration: 0.9, ease: 'power2.in' }, 1.02)
    .to(render, { '--g': 0, scale: 1, duration: 0.7, ease: 'power2.out' }, 1.35)
    .to(svg, { opacity: 0, duration: 0.45 }, 1.45);
  const frame = ground.querySelector('.cp-ground__frame');
  gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: ground, start: 'top 90%', end: 'center 50%', scrub: 0.5 } })
    .fromTo(frame, { clipPath: 'inset(0% 42% 0% 42%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1, ease: 'power2.inOut' })
    .fromTo(frame.querySelector('img'), { scale: 1.25 }, { scale: 1, duration: 1 }, 0);
}
