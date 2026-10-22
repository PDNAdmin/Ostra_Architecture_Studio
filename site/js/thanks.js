// Thank you: a received stamp lands, with today's date, and the visitor's first name if we have it.
const { gsap } = window;
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const name = new URLSearchParams(location.search).get('n');
if (name) document.querySelector('[data-ty-name]').textContent = `${name.slice(0, 40)}, `;
document.querySelector('[data-ty-date]').textContent = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

const menu = document.querySelector('[data-menu]');
const openBtn = document.querySelector('[data-menu-open]');
const closeBtn = document.querySelector('[data-menu-close]');
openBtn.addEventListener('click', () => { menu.hidden = false; openBtn.setAttribute('aria-expanded', 'true'); menu.querySelector('a').focus(); });
closeBtn.addEventListener('click', () => { menu.hidden = true; openBtn.setAttribute('aria-expanded', 'false'); openBtn.focus(); });

if (!reduce) {
  gsap.from('[data-ct-title] .line > span', { yPercent: 108, duration: 1.1, ease: 'expo.out', stagger: 0.09, delay: 0.3 });
  gsap.fromTo('[data-ty-stamp]', { scale: 1.5, rotate: -8, opacity: 0 }, { scale: 1, rotate: -3, opacity: 1, duration: 0.55, ease: 'back.out(2)', delay: 0.9 });
  gsap.from('.ty__body, .ty .link-arrow', { opacity: 0, y: 14, duration: 0.9, ease: 'expo.out', stagger: 0.08, delay: 0.6 });
}
