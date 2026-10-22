// Links with a photo that opens from its centre and trails the pointer, leaning with its speed (desktop only).
// Used by the Studio "more" links and the press list: <a data-more><img class="more__img"> ...</a>.
const { gsap } = window;
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
if (fine && !reduce) {
  document.querySelectorAll('[data-more]').forEach((a) => {
    const img = a.querySelector('.more__img');
    const S = { x: 0, y: 0, tx: 0, ty: 0, live: false };
    a.addEventListener('pointerenter', (e) => {
      const r = a.getBoundingClientRect();
      S.tx = S.x = e.clientX - r.left - 150; S.ty = S.y = e.clientY - r.top - 100; S.live = true;
    });
    a.addEventListener('pointermove', (e) => {
      const r = a.getBoundingClientRect();
      S.tx = e.clientX - r.left - 150; S.ty = e.clientY - r.top - 100;
    });
    a.addEventListener('pointerleave', () => { S.live = false; });
    gsap.ticker.add(() => {
      if (!S.live && Math.abs(S.tx - S.x) < 0.5) return;
      const dx = (S.tx - S.x) * 0.14;
      S.x += dx; S.y += (S.ty - S.y) * 0.14;
      img.style.setProperty('--mx', S.x.toFixed(1) + 'px');
      img.style.setProperty('--my', S.y.toFixed(1) + 'px');
      img.style.setProperty('--tilt', Math.max(-8, Math.min(8, dx * 0.5)).toFixed(2) + 'deg');
    });
  });
}
