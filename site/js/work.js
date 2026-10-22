// Recent work: a horizontal pan of drawing sheets.
// Each sheet holds a live ink axonometric. Its drawing is tied to scroll and only completes
// once the whole sheet is on screen. The house's key idea is painted orange last and labelled.
import { PROJECTS, build, drawTimeline } from './drawings.js';

const { gsap, ScrollTrigger } = window;
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

const section = document.querySelector('[data-work]');
const pinEl = section.querySelector('[data-work-pin]');
const track = section.querySelector('[data-work-track]');


// ---------------------------------------------------------------- boot
const cards = [...track.querySelectorAll('[data-project]')];
const drawings = cards.map((card) => {
  const svg = card.querySelector('[data-drawing]');
  const draw = drawTimeline(build(svg, PROJECTS[card.dataset.project]));
  const render = card.querySelector('.sheet-card__render');
  if (!render) return { card, tl: draw };
  // ink first, then the house develops out of the key idea and the drawing gives way
  const tl = gsap.timeline({ paused: true, defaults: { ease: 'none' } }).add(draw.paused(false), 0)
    .fromTo(render, { '--r': '0%', '--g': 1 }, { '--r': '175%', duration: 0.9, ease: 'power2.in' }, 1.02)
    .to(render, { '--g': 0, duration: 0.7, ease: 'power2.out' }, 1.35)
    .to(svg, { opacity: 0, duration: 0.45 }, 1.45)
    .to({}, { duration: 0.05 }, 2.15);
  return { card, tl };
});

if (reduce) {
  drawings.forEach((d) => d.tl.progress(1));
} else {
  gsap.registerPlugin(ScrollTrigger);
  drawings.forEach((d) => d.tl.progress(0));
  const mm = gsap.matchMedia();

  // Wide screens: pin the section and pan the sheets sideways.
  mm.add('(min-width: 861px)', () => {
    const distance = () => Math.max(0, track.scrollWidth - track.parentElement.clientWidth);
    const pan = gsap.to(track, {
      x: () => -distance(),
      ease: 'none',
      scrollTrigger: {
        trigger: pinEl, start: 'top top', end: () => `+=${distance()}`,
        pin: true, scrub: 0.6, invalidateOnRefresh: true,
      },
    });
    const pinST = pan.scrollTrigger;
    const viewW = () => track.parentElement.clientWidth;

    drawings.forEach((d, i) => {
      const fullyVisibleAtStart = d.card.offsetLeft + d.card.offsetWidth <= viewW();
      if (fullyVisibleAtStart) {
        // On screen when the pan starts: draw while the section scrolls up into view,
        // finishing exactly as the section pins and the whole sheet is visible. Later sheets start a little later.
        ScrollTrigger.create({
          trigger: d.card,
          start: () => `top ${92 - i * 14}%`,
          end: () => pinST.start,
          animation: d.tl, scrub: 0.4, invalidateOnRefresh: true,
        });
      } else {
        // Arrives during the pan: starts once half of it has slid in, finishes as its right edge comes fully on screen.
        ScrollTrigger.create({
          trigger: d.card, containerAnimation: pan,
          start: 'center 100%', end: 'right 98%',
          animation: d.tl, scrub: 0.4,
        });
      }
    });
    return () => gsap.set(track, { x: 0 });
  });

  // Phones: a vertical stack; each drawing finishes as its card's drawing is fully on screen.
  mm.add('(max-width: 860px)', () => {
    drawings.forEach((d) => {
      ScrollTrigger.create({
        trigger: d.card.querySelector('[data-drawing]'),
        start: 'top 92%', end: 'bottom 70%',
        animation: d.tl, scrub: 0.4,
      });
    });
  });

  // Section heading arrives on the ink curve.
  gsap.from(section.querySelectorAll('.work__title, .work__intro, .work__all'), {
    y: 24, opacity: 0, duration: 1, ease: 'expo.out', stagger: 0.08,
    scrollTrigger: { trigger: section, start: 'top 75%' },
  });
}
