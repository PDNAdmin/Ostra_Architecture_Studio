// Home: "Step inside". The Court House walkthrough opens out of a door-sized slot, then scroll walks the camera
// up the path, through the oak door and into the court. Callouts are live text pinned to features in the film:
// each one has a position in the 1920×1080 source frame and a window of film time when it shows.
const { gsap, ScrollTrigger } = window;
gsap.registerPlugin(ScrollTrigger);
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const mobile = matchMedia('(max-width: 760px)').matches;

const root = document.querySelector('[data-walkin]');
if (root) {
  const film = root.querySelector('[data-walkin-film]');
  const video = film.querySelector('video');
  const still = film.querySelector('img');
  const notes = [...root.querySelectorAll('[data-note]')];
  const FILM = mobile ? 'assets/house-walk-mobile' : 'assets/house-walk';
  // the phone film is a centred square crop of the 1920×1080 source
  const SRC = mobile ? { w: 1080, h: 1080, x0: 420 } : { w: 1920, h: 1080, x0: 0 };
  still.src = `${FILM}-poster.jpg`;

  // where a source-frame point lands in the stage, with object-fit: cover
  function place() {
    const W = film.clientWidth, H = film.clientHeight;
    const s = Math.max(W / SRC.w, H / SRC.h);
    const ox = (W - SRC.w * s) / 2, oy = (H - SRC.h * s) / 2;
    notes.forEach((n) => {
      const [fx, fy] = n.dataset.note.split(',').map(Number);
      const x = (fx * 1920 - SRC.x0) * s + ox, y = fy * 1080 * s + oy;
      n.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
      n.classList.toggle('walkin__note--l', x > W * 0.62);
      n.hidden = x < 8 || x > W - 8 || y < 8 || y > H - 8;
    });
  }

  if (reduce) {
    root.classList.add('walkin--static');
  } else {
    video.src = `${FILM}.mp4`;
    video.load();
    let ready = false;
    const go = () => { ready = true; root.classList.add('is-ready'); };
    video.addEventListener('loadeddata', go);
    video.addEventListener('canplay', go);
    place();
    addEventListener('resize', place);

    const S = { s: 0, ss: 0 };
    ScrollTrigger.create({
      trigger: root, start: 'top top', end: () => `+=${Math.round(innerHeight * (mobile ? 3.6 : 4.4))}`,
      pin: root.querySelector('[data-walkin-pin]'), scrub: true, invalidateOnRefresh: true,
      onUpdate: (self) => { S.s = self.progress; },
      onRefresh: place,
    });
    const head = root.querySelector('.walkin__head');
    const side = root.querySelector('.walkin__side');
    gsap.ticker.add(() => {
      if (Math.abs(S.s - S.ss) < 0.0004 && S.ss !== 0) return;
      S.ss += (S.s - S.ss) * 0.16;
      const p = S.ss;
      // 0 to 0.22: the door opens to the full frame; the film starts walking at 0.06
      const o = gsap.utils.clamp(0, 1, p / 0.22);
      const eo = o * o * (3 - 2 * o);
      film.style.setProperty('--o', eo.toFixed(4));
      root.style.setProperty('--o', eo.toFixed(4));
      root.style.setProperty('--p', p.toFixed(4));
      head.style.opacity = String(1 - Math.min(1, eo * 1.6));
      if (side) side.style.opacity = String(1 - Math.min(1, eo * 1.6));
      const t = gsap.utils.clamp(0, 1, (p - 0.06) / 0.88);
      if (ready && video.duration) {
        const vt = Math.min(video.duration - 0.05, t * video.duration);
        if (!video.seeking && Math.abs(video.currentTime - vt) > 1 / 40) video.currentTime = vt;
      }
      notes.forEach((n) => {
        const on = eo > 0.9 && t >= +n.dataset.from && t < +n.dataset.to;
        n.classList.toggle('is-on', on);
      });
      root.classList.toggle('is-end', t > 0.93);
    });
  }
}
