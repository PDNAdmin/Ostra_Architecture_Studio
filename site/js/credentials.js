// Request credentials: copy-deck validation, and the transmittal slip that lists each document as it is ticked.
const { gsap } = window;
const { reduce } = window.__page;
const form = document.querySelector('[data-cred]');
const slip = document.querySelector('[data-slip]');
const status = document.querySelector('[data-cred-status]');
const emailOk = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());

// a transmittal reference: OS-T, the date and a short serial
const d = new Date();
slip.querySelector('[data-slip-ref]').textContent = `Ref OS-T-${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate() * 37 + d.getHours()).padStart(3, '0')}`;

function out(key, v) { slip.querySelector(`[data-slip-out="${key}"]`).textContent = v.trim() || '—'; }
function refresh() {
  out('name', form.name.value);
  out('org', form.org.value);
  form.querySelectorAll('input[name="need"]').forEach((c) => {
    const row = slip.querySelector(`[data-slip-doc="${c.value}"]`);
    const was = row.classList.contains('is-on');
    row.classList.toggle('is-on', c.checked);
    if (c.checked && !was && !reduce) gsap.fromTo(row.querySelector('.slip__tick'), { scale: 1.8, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.35, ease: 'back.out(2)' });
  });
}
form.addEventListener('input', refresh);
form.addEventListener('change', refresh);

function check(id) {
  const f = form.querySelector(`[data-field="${id}"]`);
  let ok;
  if (id === 'email') ok = emailOk(form.email.value);
  else if (id === 'need') ok = !!form.querySelector('input[name="need"]:checked');
  else ok = !!form[id].value.trim();
  f.classList.toggle('is-invalid', !ok);
  f.querySelector('.field__error').hidden = ok;
  const input = f.querySelector('input');
  if (input && id !== 'need') input.setAttribute('aria-invalid', String(!ok));
  return ok;
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const bad = ['name', 'org', 'email', 'need'].filter((id) => !check(id));
  if (bad.length) {
    status.textContent = 'Please check the highlighted fields.';
    form.querySelector(`[data-field="${bad[0]}"] input`).focus();
    return;
  }
  // No form service is connected yet; the request is shown as sent on the page.
  slip.classList.add('is-sent');
  if (!reduce) gsap.fromTo(slip.querySelector('[data-slip-stamp]'), { scale: 2.2, opacity: 0, rotation: -18 }, { scale: 1, opacity: 1, rotation: -8, duration: 0.45, ease: 'back.out(1.8)' });
  status.textContent = `Thanks, ${form.name.value.trim().split(/\s+/)[0]}. We'll send these to ${form.email.value.trim()}.`;
  form.querySelector('button[type="submit"]').disabled = true;
});
