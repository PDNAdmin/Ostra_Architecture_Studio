// Contact: the form, with copy-deck validation, and the brief sheet that draws itself up as you type.
// Sending: a 1.25px orange line fills on the ink curve, turns cyan when done (design system inline loader).
// NOTE: not connected to email or a CRM yet. On success it goes to thank-you.html. Wire the POST in send().
import { PROJECTS, build, drawTimeline } from './drawings.js';

const { gsap, ScrollTrigger, Lenis } = window;
gsap.registerPlugin(ScrollTrigger);
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

if (!reduce) {
  const lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
  window.__lenis = lenis;
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  gsap.from('[data-ct-title] .line > span', { yPercent: 108, duration: 1.1, ease: 'expo.out', stagger: 0.09, delay: 0.1 });
  gsap.from('.ct-top__side > *, .brief', { opacity: 0, y: 14, duration: 0.9, ease: 'expo.out', stagger: 0.07, delay: 0.4 });
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

// ---------------------------------------------------------------- the brief sheet
const form = document.querySelector('[data-form]');
const out = Object.fromEntries([...document.querySelectorAll('[data-out]')].map((n) => [n.dataset.out, n]));
const svg = document.querySelector('[data-brief-drawing]');
const empty = document.querySelector('[data-brief-empty]');
const DRAWING = { 'new-build': 'courtyard', remodel: 'remodel', extension: 'extension', other: 'studio' };
let current = null;

function setOut(key, text) {
  const n = out[key];
  const value = text && text.trim() ? text.trim() : '—';
  if (n.textContent === value) return;
  n.textContent = value;
  n.classList.toggle('is-set', value !== '—');
  if (!reduce && value !== '—') gsap.fromTo(n, { opacity: 0.2, y: 4 }, { opacity: 1, y: 0, duration: 0.45, ease: 'expo.out' });
}
const labelOf = (name) => {
  const c = form.querySelector(`input[name="${name}"]:checked`);
  return c ? c.closest('label').textContent.trim() : '';
};

function drawType(type) {
  const key = DRAWING[type];
  if (!key || key === current) return;
  current = key;
  empty.hidden = true;
  const tl = drawTimeline(build(svg, PROJECTS[key]));
  if (reduce) tl.progress(1);
  else tl.progress(0).duration(2.2).play();
}

function refreshBrief() {
  setOut('client', form.name.value);
  setOut('site', form.location.value);
  setOut('type', labelOf('type'));
  setOut('budget', labelOf('budget'));
  setOut('timing', labelOf('timing'));
  const type = form.querySelector('input[name="type"]:checked');
  if (type) drawType(type.value);
  const required = ['name', 'email', 'location'].every((k) => form[k].value.trim()) && ['type', 'budget'].every((k) => labelOf(k));
  setOut('status', required ? 'Ready to send' : 'Drafting');
  out.status.classList.toggle('is-ready', required);
}
form.addEventListener('input', refreshBrief);
form.addEventListener('change', refreshBrief);

// ---------------------------------------------------------------- validation (copy deck messages)
const emailOk = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());
function check(id, show) {
  const f = form.querySelector(`[data-field="${id}"]`);
  const err = f && f.querySelector('.field__error');
  if (!err) return true;
  let ok = true;
  if (id === 'email') ok = emailOk(form.email.value);
  else if (id === 'type' || id === 'budget') ok = !!labelOf(id);
  else ok = !!form[id].value.trim();
  if (show || f.classList.contains('is-invalid')) {
    err.hidden = ok;
    f.classList.toggle('is-invalid', !ok);
    const input = f.querySelector('input, textarea');
    if (input && input.type !== 'radio') input.setAttribute('aria-invalid', String(!ok));
    if (input && input.type !== 'radio') input.setAttribute('aria-describedby', [`${id}-help`, ok ? '' : `${id}-error`].filter((x) => document.getElementById(x)).join(' '));
  }
  return ok;
}
['name', 'email', 'location'].forEach((id) => form[id].addEventListener('blur', () => { if (form[id].value) check(id, true); }));
form.addEventListener('change', (e) => { if (e.target.name === 'type' || e.target.name === 'budget') check(e.target.name, false); });
form.addEventListener('input', (e) => { if (['name', 'email', 'location'].includes(e.target.id)) check(e.target.id, false); });

// ---------------------------------------------------------------- sending
const btn = document.querySelector('[data-submit]');
const btnLabel = document.querySelector('[data-submit-label]');
const status = document.querySelector('[data-status]');
// the 'please check' message clears as soon as the visitor starts correcting
['input', 'change'].forEach((ev) => form.addEventListener(ev, () => { if (!btn.disabled) status.textContent = ''; }));

async function send(data) {
  // TODO: POST to the studio's inbox / CRM endpoint here and throw on failure.
  await new Promise((r) => setTimeout(r, reduce ? 300 : 1400));
  return data;
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const ids = ['name', 'email', 'type', 'location', 'budget'];
  const bad = ids.filter((id) => !check(id, true));
  if (bad.length) {
    status.textContent = `Please check ${bad.length === 1 ? 'one field' : `${bad.length} fields`} above.`;
    const first = form.querySelector(`[data-field="${bad[0]}"] input, [data-field="${bad[0]}"] textarea`);
    if (window.__lenis) window.__lenis.scrollTo(first.closest('.field'), { offset: -140 });
    first.focus({ preventScroll: !!window.__lenis });
    return;
  }
  btn.disabled = true;
  btn.classList.add('is-sending');
  btnLabel.textContent = 'Sending…';
  status.textContent = '';
  try {
    await send(new FormData(form));
    btn.classList.add('is-done');
    btnLabel.textContent = 'Sent';
    setOut('status', 'Received');
    const name = form.name.value.trim().split(/\s+/)[0];
    setTimeout(() => { location.href = `thank-you.html?n=${encodeURIComponent(name)}`; }, reduce ? 200 : 900);
  } catch {
    btn.disabled = false;
    btn.classList.remove('is-sending');
    btnLabel.textContent = 'Send my inquiry';
    status.textContent = "That didn't send. Try again, or email us at [address].";
  }
});

refreshBrief();
