// Studio page: redline principles, the desk film (scrubbed), reveals.
const { gsap, ScrollTrigger, Lenis } = window;
gsap.registerPlugin(ScrollTrigger);
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
const mobile = matchMedia('(max-width: 960px)').matches;

if (!reduce) {
  const lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
  window.__lenis = lenis;
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  document.querySelectorAll('.st-index a').forEach((a) => a.addEventListener('click', (e) => {
    e.preventDefault();
    lenis.scrollTo(a.getAttribute('href'), { offset: -80, duration: 1.6 });
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
openBtn.addEventListener('click', () => setMenu(true));
closeBtn.addEventListener('click', () => setMenu(false));
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !menu.hidden) setMenu(false); });

// ---------------------------------------------------------------- arrivals and reveals
if (!reduce) {
  gsap.from('[data-st-title] .line > span', { yPercent: 108, duration: 1.1, ease: 'expo.out', stagger: 0.09, delay: 0.1 });
  gsap.from('.st-top__side > *', { opacity: 0, y: 14, duration: 0.9, ease: 'expo.out', stagger: 0.07, delay: 0.45 });
  gsap.utils.toArray('[data-reveal]').forEach((el) => {
    gsap.from(el, { opacity: 0, y: 24, duration: 0.9, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 85%', once: true } });
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

// ---------------------------------------------------------------- team
// Scrubbed by scroll: the orange plate inks up the sheet, and the portrait develops from a pale trace as it rises into place.
// On hover the plate and the portrait drift against each other with the pointer.
const mates = [...document.querySelectorAll('[data-mate]')];
if (!reduce) {
  gsap.from('[data-team-title] .line > span', { yPercent: 108, duration: 1.1, ease: 'expo.out', stagger: 0.09, scrollTrigger: { trigger: '[data-team-title]', start: 'top 80%', once: true } });
  mates.forEach((m, i) => {
    const sheet = m.querySelector('.mate__sheet');
    const cut = m.querySelector('[data-cut]');
    gsap.timeline({
      scrollTrigger: { trigger: m, start: 'top 92%', end: 'top 38%', scrub: 0.6 },
      defaults: { ease: 'none' },
    })
      .fromTo(sheet, { '--plate': '100%' }, { '--plate': '0%', duration: 0.6, ease: 'power2.inOut' }, (i % 3) * 0.06)
      .fromTo(cut, { yPercent: 9, filter: 'brightness(1.7) contrast(0.45) drop-shadow(0 0 0 rgba(20,18,15,0))' },
        { yPercent: 0, filter: 'brightness(1) contrast(1) drop-shadow(0 14px 18px rgba(20,18,15,0.22))', duration: 0.7 }, 0.15)
      .from(m.querySelector('.mate__block'), { opacity: 0, y: 16, duration: 0.3 }, 0.55);
    if (fine) {
      sheet.addEventListener('pointermove', (e) => {
        const r = sheet.getBoundingClientRect();
        sheet.style.setProperty('--mx', (((e.clientX - r.left) / r.width) * 2 - 1).toFixed(3));
        sheet.style.setProperty('--my', (((e.clientY - r.top) / r.height) * 2 - 1).toFixed(3));
      });
      sheet.addEventListener('pointerleave', () => { sheet.style.setProperty('--mx', 0); sheet.style.setProperty('--my', 0); });
    }
  });
}

// ---------------------------------------------------------------- redlines
// Each habit is struck through in red ink, then the rule writes in letter by letter, then the proof line.
document.querySelectorAll('[data-rule]').forEach((rule) => {
  const strike = rule.querySelector('[data-strike]');
  const fix = rule.querySelector('[data-fix]');
  const proof = rule.querySelector('[data-proof]');
  if (reduce) { rule.classList.add('is-done'); return; }
  const text = fix.textContent;
  fix.setAttribute('aria-label', text);
  fix.textContent = '';
  const chars = [...text].map((ch) => {
    const s = document.createElement('span');
    s.className = 'ch';
    s.setAttribute('aria-hidden', 'true');
    s.textContent = ch;
    fix.appendChild(s);
    return s;
  });
  gsap.timeline({
    scrollTrigger: { trigger: rule, start: 'top 78%', end: 'top 30%', scrub: 0.5 },
    defaults: { ease: 'none' },
  })
    .fromTo(strike, { '--s': 0 }, { '--s': 1, duration: 0.35 })
    .to(strike, { color: 'var(--ink-500)', duration: 0.15 }, '<0.2')
    .fromTo(chars, { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.05, stagger: 0.012 }, '>-0.02')
    .fromTo(proof, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.2 }, '>-0.05');
});

// ---------------------------------------------------------------- the desk
const desk = document.querySelector('[data-desk]');
const video = desk.querySelector('[data-desk-video]');
const stages = [...desk.querySelectorAll('[data-stage]')];
// stage start points as a fraction of the film (DESK_T in remotion/src/Desk.tsx)
const STAGES = [0, 0.2, 0.4, 0.6, 0.8];

function setStage(i) {
  stages.forEach((s, j) => {
    s.classList.toggle('is-on', j === i);
    s.classList.toggle('is-past', j < i);
  });
}

if (reduce) {
  desk.classList.add('desk--static');
  stages.forEach((s) => s.classList.add('is-on'));
} else {
  video.src = 'assets/desk.mp4';
  video.load();
  let ready = false;
  video.addEventListener('loadeddata', () => { ready = true; desk.classList.add('is-ready'); });
  const S = { s: 0, ss: 0, i: -1 };
  const st = ScrollTrigger.create({
    trigger: desk, start: 'top top', end: () => `+=${Math.round(innerHeight * (mobile ? 4 : 5))}`,
    pin: desk.querySelector('[data-desk-pin]'), scrub: true, invalidateOnRefresh: true,
    onUpdate: (self) => { S.s = self.progress; },
  });
  gsap.ticker.add(() => {
    S.ss += (S.s - S.ss) * 0.16;
    if (Math.abs(S.s - S.ss) < 0.0004) S.ss = S.s;
    const p = S.ss;
    if (ready && video.duration) {
      const t = Math.min(video.duration - 0.04, p * video.duration);
      if (!video.seeking && Math.abs(video.currentTime - t) > 1 / 45) video.currentTime = t;
    }
    let i = 0;
    while (i < 4 && p >= STAGES[i + 1]) i++;
    if (i !== S.i) { S.i = i; setStage(i); }
  });
  video.addEventListener('error', () => { st.kill(true); desk.classList.add('desk--static'); stages.forEach((s) => s.classList.add('is-on')); ScrollTrigger.refresh(); });
}

