// Promises: one fixed canvas. The section pins, and the three promises take turns:
// each fades in faint, its words darken in reading order, its supporting line appears,
// then it lifts away as the next arrives. After the last one, the link fades in, and the page moves on.
const { gsap, ScrollTrigger } = window;
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const section = document.querySelector('[data-promises]');

if (!reduce) {
  gsap.registerPlugin(ScrollTrigger);
  section.classList.add('promises--stage'); // stacked, single-canvas layout (see promises.css)

  const items = [...section.querySelectorAll('.promise')];
  const link = section.querySelector('.promises__link');

  // Split each line into word spans. The text is unchanged, so it still reads as one sentence.
  items.forEach((item) => {
    const line = item.querySelector('[data-read]');
    const words = line.textContent.trim().split(/\s+/);
    line.textContent = '';
    words.forEach((w, i) => {
      const s = document.createElement('span');
      s.className = 'w';
      s.textContent = i < words.length - 1 ? `${w} ` : w;
      line.appendChild(s);
    });
  });

  gsap.set(items, { autoAlpha: 0, y: 28 });
  gsap.set(link, { autoAlpha: 0, y: 12 });

  const tl = gsap.timeline({ defaults: { ease: 'none' } });
  items.forEach((item, i) => {
    const words = item.querySelectorAll('.w');
    const proof = item.querySelector('[data-proof]');
    const last = i === items.length - 1;
    tl.addLabel(`p${i}`)
      // arrive, faint
      .fromTo(words, { opacity: 0.12 }, { opacity: 0.12, duration: 0.01 })
      .fromTo(proof, { opacity: 0, y: 12 }, { opacity: 0, y: 12, duration: 0.01 }, '<')
      .to(item, { autoAlpha: 1, y: 0, duration: 0.35, ease: 'power2.out' })
      // read: words darken one by one, then the supporting line
      .to(words, { opacity: 1, duration: 0.25, stagger: 0.12 })
      .to(proof, { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' })
      // hold so it can be read
      .to({}, { duration: 0.5 });
    if (!last) tl.to(item, { autoAlpha: 0, y: -28, duration: 0.35, ease: 'power2.in' });
  });
  tl.to(link, { autoAlpha: 1, y: 0, duration: 0.3, ease: 'power2.out' }).to({}, { duration: 0.6 });

  ScrollTrigger.create({
    trigger: section,
    start: 'top top',
    end: () => `+=${Math.round(innerHeight * 3.4)}`,
    // Pin the inner canvas, not the section: the section carries the frame margins,
    // and pinning an element with margins makes it wider than the window.
    pin: section.querySelector('.promises__inner'),
    scrub: 0.5,
    animation: tl,
    invalidateOnRefresh: true,
  });

  gsap.from(section.querySelector('.promises__title'), {
    opacity: 0, y: 12, duration: 0.9, ease: 'expo.out',
    scrollTrigger: { trigger: section, start: 'top 75%' },
  });
}
