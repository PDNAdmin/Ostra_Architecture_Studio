// Shared behaviour for the content pages: smooth scroll, the menu, title arrivals, reveals and magnetic buttons.
// Page scripts load after this and read window.__lenis and the flags on window.__page.
const { gsap, ScrollTrigger, Lenis } = window;
gsap.registerPlugin(ScrollTrigger);
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
window.__page = { reduce, fine, mobile: matchMedia('(max-width: 760px)').matches };

if (!reduce) {
  const lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
  window.__lenis = lenis;
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  document.querySelectorAll('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => {
    const id = a.getAttribute('href');
    if (id.length < 2 || !document.querySelector(id)) return;
    e.preventDefault();
    lenis.scrollTo(id, { offset: -90, duration: 1.4 });
  }));
}

// menu
const menu = document.querySelector('[data-menu]');
const openBtn = document.querySelector('[data-menu-open]');
const closeBtn = document.querySelector('[data-menu-close]');
function setMenu(open) {
  menu.hidden = !open;
  openBtn.setAttribute('aria-expanded', String(open));
  document.documentElement.style.overflow = open ? 'hidden' : '';
  if (window.__lenis) open ? window.__lenis.stop() : window.__lenis.start();
  (open ? menu.querySelector('a') : openBtn).focus();
}
if (menu && openBtn && closeBtn) {
  openBtn.addEventListener('click', () => setMenu(true));
  closeBtn.addEventListener('click', () => setMenu(false));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !menu.hidden) setMenu(false); });
}

if (!reduce) {
  gsap.from('[data-pg-title] .line > span', { yPercent: 108, duration: 1.1, ease: 'expo.out', stagger: 0.09, delay: 0.1 });
  gsap.from('[data-pg-side] > *', { opacity: 0, y: 14, duration: 0.9, ease: 'expo.out', stagger: 0.07, delay: 0.45 });
  gsap.utils.toArray('[data-reveal]').forEach((el) => {
    gsap.from(el, { opacity: 0, y: 24, duration: 0.9, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
  });
  if (fine) {
    document.querySelectorAll('[data-magnetic]').forEach((btn) => {
      const qx = gsap.quickTo(btn, 'x', { duration: 0.5, ease: 'power3.out' });
      const qy = gsap.quickTo(btn, 'y', { duration: 0.5, ease: 'power3.out' });
      window.addEventListener('pointermove', (e) => {
        const r = btn.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
        if (Math.hypot(dx, dy) < Math.max(r.width, r.height) / 2 + 90) { qx(dx * 0.18); qy(dy * 0.18); } else { qx(0); qy(0); }
      }, { passive: true });
    });
  }
}

