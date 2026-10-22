// Shared parts for the page builders: the masthead and footer come from index.html, so every page stays in step.
import fs from 'node:fs';

const idx = fs.readFileSync('index.html', 'utf8');
const cut = (a, b) => {
  const i = idx.indexOf(a), j = idx.indexOf(b, i);
  if (i < 0 || j < 0) throw new Error('anchor ' + a);
  return idx.slice(i, j);
};
export const header = cut('  <a class="skip"', '  <main id="main">');
export const footer = cut('  <!-- Footer: the site', '  <script src="vendor/gsap.min.js"></script>');
const icon = (idx.match(/<link rel="icon"[^>]*>/) || [''])[0];

// Text in [brackets] is a placeholder fact (copy deck rule), shown with the dashed underline.
export const ph = (s) => s.replace(/\[([^\]]+)\]/g, '<span class="ph">[$1]</span>');
export const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export const head = ({ title, desc, css = [], noindex = false }) => `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>${title}</title>
  <meta name="description" content="${esc(desc)}">
${noindex ? '  <meta name="robots" content="noindex">\n' : ''}  <meta name="theme-color" content="#EFE9DD">
  ${icon}
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600&family=Geist+Mono:wght@400;500&family=Space+Grotesk:wght@500;700&display=swap">
  <link rel="stylesheet" href="vendor/lenis.css">
  <link rel="stylesheet" href="css/tokens.css">
  <link rel="stylesheet" href="css/hero.css">
  <link rel="stylesheet" href="css/foot.css">
  <link rel="stylesheet" href="css/page.css">
${css.map((c) => `  <link rel="stylesheet" href="${c}">`).join('\n')}
</head>
<body>
`;

export const tail = (scripts = []) => `${footer}  <script src="vendor/gsap.min.js"></script>
  <script src="vendor/ScrollTrigger.min.js"></script>
  <script src="vendor/lenis.min.js"></script>
  <script type="module" src="js/page.js"></script>
${scripts.map((s) => `  <script type="module" src="${s}"></script>`).join('\n')}
  <script type="module" src="js/foot.js"></script>
</body>
</html>
`;

export const crumbs = (trail) => `<nav class="crumbs" aria-label="Breadcrumb"><ol>${trail.map(([label, href], i) =>
  i === trail.length - 1 ? `<li aria-current="page">${label}</li>` : `<li><a href="${href}">${label}</a></li>`).join('')}</ol></nav>`;

// The big page title, one masked line per row so it can rise into place.
export const title = (id, lines, cls = 'pg-title') =>
  `<h1 id="${id}" class="${cls}" data-pg-title>${lines.map((l) => `<span class="line"><span>${l}</span></span>`).join('')}</h1>`;

export const arrow = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M2 8h11M9 4l4 4-4 4" /></svg>';

// The closing call to action used across the site.
export const cta = (heading, body, label = 'Book a consultation', href = 'contact.html') => `    <section class="pg-cta" aria-labelledby="pg-cta-title">
      <div class="pg-cta__inner" data-reveal>
        <h2 id="pg-cta-title" class="pg-cta__title">${heading}</h2>
        <p>${ph(body)}</p>
        <a class="btn btn-primary" href="${href}" data-magnetic>${label}</a>
      </div>
    </section>
`;

export const write = (file, html) => { fs.writeFileSync(file, html); console.log('wrote', file); };
