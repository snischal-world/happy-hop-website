// Builds the website into ./dist. No dependencies: only Node 20+.
//   npm run build
//
// Inputs
//   content/   site facts, destinations, FAQs, landing pages (JSON: the files you edit)
//   src/pages/ the main pages (HTML fragments with a small header block)
//   src/layouts/ page layouts and reusable parts (JavaScript template strings)
//   src/assets/ css, js, images, fonts   public/ files copied to the site root
// Outputs: dist/ (what Netlify publishes), including sitemap.xml, robots.txt and knowledge.json.

import {
  readFileSync, writeFileSync, mkdirSync, rmSync, cpSync, readdirSync, existsSync
} from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

import {
  esc, fill, siteHeader, legalHeader, landingHeader, siteFooter, legalFooter, landingFooter,
  destinationCards, destinationOptions, includesList, faqItems, trackingFields, leadForm,
  highlights, priceNote, offerBanner, WORDMARK
} from '../src/layouts/parts.mjs';
import { layouts } from '../src/layouts/landing.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'dist');
const p = (...a) => join(ROOT, ...a);
const readJson = (f) => JSON.parse(readFileSync(p(f), 'utf8'));
const write = (rel, text) => { const f = join(OUT, rel); mkdirSync(dirname(f), { recursive: true }); writeFileSync(f, text); };
const env = process.env;

// ------------------------------------------------------------------ load content
const site = readJson('content/site.json');
site.url = (env.SITE_URL || site.url || env.URL || 'http://localhost:8888').replace(/\/+$/, '');
const productionDeploy = !env.CONTEXT || env.CONTEXT === 'production';
const indexingOn = Boolean(site.launched) && productionDeploy;

const destinations = readdirSync(p('content/destinations')).filter((f) => f.endsWith('.json'))
  .map((f) => readJson('content/destinations/' + f)).sort((a, b) => a.order - b.order);
const faqFile = readJson('content/faqs.json');
const faqs = faqFile.faqs.filter((f) => f.status === 'approved');
const landings = existsSync(p('content/landing'))
  ? readdirSync(p('content/landing')).filter((f) => f.endsWith('.json')).map((f) => readJson('content/landing/' + f))
  : [];
const includeDrafts = env.INCLUDE_DRAFTS === '1';
const live = (x) => x.status === 'approved' || x.status === 'published' || includeDrafts;

// ------------------------------------------------------------------ prepare dist
rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
cpSync(p('src/assets'), join(OUT, 'assets'), { recursive: true });
if (existsSync(p('public'))) cpSync(p('public'), OUT, { recursive: true });

/** Adds ?v=<hash> to css/js so visitors always get the newest file after an edit. */
function asset(path) {
  const f = join(OUT, path);
  if (!existsSync(f)) throw new Error(`Missing asset ${path}`);
  return `${path}?v=${createHash('md5').update(readFileSync(f)).digest('hex').slice(0, 8)}`;
}

const FONTS = 'https://fonts.googleapis.com/css2?family=Chonburi&family=Poppins:wght@400;500;600&display=swap';
const abs = (path) => (/^https?:/.test(path) ? path : site.url + path);
const spriteMark = readFileSync(p('src/partials/sprite-mark.html'), 'utf8');
const spriteHead = readFileSync(p('src/partials/sprite-head.html'), 'utf8');
const footerTpl = readFileSync(p('src/partials/footer-site.html'), 'utf8');
const waTpl = readFileSync(p('src/partials/whatsapp.html'), 'utf8');

// ------------------------------------------------------------------ document wrapper
function document_(page, { header, main, footer, whatsapp = true, sprites = 'mark' }) {
  const title = page.title.includes(site.name) ? page.title : `${page.title} | ${site.name}`;
  const desc = page.description || site.default_description;
  const url = abs(page.path.endsWith('.html') ? page.path : page.path);
  const img = abs(page.ogImage || site.og_image);
  const robots = page.indexable && indexingOn ? '' : '<meta name="robots" content="noindex, nofollow">\n';
  const css = page.css.map((c) => `<link rel="stylesheet" href="${asset('/assets/css/' + c)}">`).join('\n');
  const js = page.scripts.map((s) => `<script src="${asset('/assets/js/' + s)}" defer></script>`).join('\n');
  const ld = (page.jsonld || []).map((o) => `<script type="application/ld+json">${JSON.stringify(o)}</script>`).join('\n');
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
${robots}<link rel="canonical" href="${esc(url)}">
<meta name="theme-color" content="#ffffff">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${esc(site.name)}">
<meta property="og:locale" content="${esc(site.locale)}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${esc(url)}">
<meta property="og:image" content="${esc(img)}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${esc(page.ogImageAlt || site.og_image_alt)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(desc)}">
<meta name="twitter:image" content="${esc(img)}">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="icon" href="/favicon-32.png" sizes="32x32" type="image/png">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preload" href="/assets/fonts/murillino-logo.woff" as="font" type="font/woff" crossorigin>
<link rel="stylesheet" href="${FONTS}">
${css}
${ld}
</head>
<body>
<a class="skip" href="#main">Skip to main content</a>
${sprites === 'head' ? spriteHead : ''}${spriteMark}
${header}
${main}
${footer}
${whatsapp ? fill(waTpl, site) : ''}
${js}
</body>
</html>
`;
}

// ------------------------------------------------------------------ page front matter
function parsePage(file) {
  const raw = readFileSync(file, 'utf8');
  const m = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!m) throw new Error(`${file} needs a --- header block at the top`);
  const meta = {};
  for (const line of m[1].split('\n')) {
    const i = line.indexOf(':');
    if (i > 0) meta[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
  return { meta, body: m[2] };
}

const orgJsonLd = () => ({
  '@context': 'https://schema.org',
  '@type': 'TravelAgency',
  '@id': `${site.url}/#business`,
  name: site.name,
  url: site.url + '/',
  description: site.default_description,
  email: site.email,
  telephone: site.phone_e164,
  logo: `${site.url}/apple-touch-icon.png`,
  image: abs(site.og_image),
  areaServed: destinations.map((d) => d.name),
  sameAs: Object.values(site.social)
});

const pages = []; // { path, indexable } for the sitemap and checks

function emit(page, html) {
  const dest = page.path.endsWith('.html') ? page.path.slice(1) : join(page.path.slice(1), 'index.html');
  write(dest, html);
  pages.push({ path: page.path, indexable: page.indexable && indexingOn, title: page.title });
}

// ------------------------------------------------------------------ main pages (src/pages)
for (const f of readdirSync(p('src/pages')).filter((x) => x.endsWith('.html'))) {
  const { meta, body } = parsePage(p('src/pages', f));
  const page = {
    title: meta.title, description: meta.description, path: meta.path,
    indexable: meta.indexable !== 'false',
    css: [], scripts: [], jsonld: []
  };
  const layout = meta.layout || 'site';
  const extraCss = meta.css ? meta.css.split(/\s+/) : [];
  const extraJs = meta.scripts ? meta.scripts.split(/\s+/) : [];

  let html = body
    .replace('<!--destination-cards-->', destinationCards(destinations))
    .replaceAll('<!--destination-options-->', destinationOptions(destinations))
    .replace('<!--faqs-->', faqItems(faqs.filter((x) => x.show_on_home)))
    .replace('<!--includes-->', includesList(site.includes))
    .replace('<!--places-->', destinations.map((d) => `<span>${esc(d.name)}</span>`).join(''))
    .replace('<!--tracking-fields-->', trackingFields());
  html = fill(html, site);

  if (layout === 'site') {
    page.css = ['site.css', ...extraCss];
    page.scripts = ['nav.js', ...extraJs];
    if (page.path === '/') page.jsonld = [orgJsonLd()];
    emit(page, document_(page, {
      header: siteHeader(site, page.path),
      main: `<main id="main">${html}</main>`,
      footer: siteFooter(site, footerTpl),
      sprites: meta.sprite === 'head' ? 'head' : 'mark'
    }));
  } else if (layout === 'legal') {
    page.css = ['legal.css', ...extraCss];
    page.scripts = extraJs;
    emit(page, document_(page, {
      header: legalHeader(site, page.path),
      main: html.replace('<main>', '<main id="main">'),
      footer: legalFooter(site),
      whatsapp: false
    }));
  } else throw new Error(`Unknown layout "${layout}" in ${f}`);
}

// ------------------------------------------------------------------ landing pages
const landingSummary = [];
for (const lp of landings) {
  if (!live(lp)) { landingSummary.push(`  skipped (draft): ${lp.slug}`); continue; }
  const render = layouts[lp.layout];
  if (!render) throw new Error(`Landing page "${lp.slug}": unknown layout "${lp.layout}". Use one of: ${Object.keys(layouts).join(', ')}`);
  const ctx = { site, destinations, faqs };
  const page = {
    title: lp.seo.title, description: lp.seo.description, path: `/lp/${lp.slug}/`,
    indexable: lp.indexable === true,
    ogImage: lp.seo.image, ogImageAlt: lp.seo.image_alt,
    css: ['site.css', 'landing.css'], scripts: ['forms.js', 'lead.js'], jsonld: []
  };
  emit(page, document_(page, {
    header: landingHeader(site, lp.hero.nav_cta),
    main: `<main id="main">${render(lp, ctx)}</main>`,
    footer: landingFooter(site)
  }));
  landingSummary.push(`  built: /lp/${lp.slug}/ (${lp.layout}, ${page.indexable && indexingOn ? 'in sitemap' : 'hidden from search'})`);
}

// ------------------------------------------------------------------ destination pages (only when status = approved)
const destSummary = [];
for (const d of destinations) {
  if (!live(d)) { destSummary.push(`  skipped (draft): ${d.slug}`); continue; }
  const lp = {
    slug: `destination-${d.slug}`, campaign: `destination-${d.slug}`,
    hero: { eyebrow: d.region, headline: `Holidays in ${d.name}`, headline_emphasis: d.name, subhead: d.overview || d.tagline, cta: 'Get my free quote', show_offer: true },
    form: { heading: `Plan your ${d.name} holiday`, interest_default: d.name, intro: 'Tell us a little about your trip and our team will reply with options and rates.' },
    destination: d.slug
  };
  const ctx = { site, destinations, faqs };
  const page = {
    title: d.seo.title, description: d.seo.description, path: `/destinations/${d.slug}/`,
    indexable: true, ogImage: d.image.src, ogImageAlt: d.image.alt,
    css: ['site.css', 'landing.css'], scripts: ['nav.js', 'forms.js', 'lead.js'],
    jsonld: [{ '@context': 'https://schema.org', '@type': 'TouristDestination', name: d.name, description: d.overview || d.tagline, touristType: d.good_for, url: `${site.url}/destinations/${d.slug}/` }]
  };
  const dFaqs = (d.faqs || []).map((q, i) => ({ id: `${d.slug}-${i}`, question: q.question, answer_html: esc(q.answer) }));
  lp.faqs = [];
  let main = layouts.destination(lp, ctx);
  if (dFaqs.length) main = main.replace(/<section class="lp-sec"><div class="wrap"><div class="lp-band">/, `${`<section id="faq" style="padding-top:24px"><div class="wrap faqs"><h2 style="margin-bottom:36px;text-align:center">${esc(d.name)} questions</h2>${faqItems(dFaqs, { openFirst: false })}</div></section>`}$&`);
  emit(page, document_(page, { header: siteHeader(site, page.path), main: `<main id="main">${main}</main>`, footer: siteFooter(site, footerTpl) }));
  destSummary.push(`  built: /destinations/${d.slug}/`);
}

// ------------------------------------------------------------------ sitemap, robots, knowledge file
const urls = pages.filter((x) => x.indexable).map((x) => `  <url><loc>${esc(site.url + x.path)}</loc></url>`).join('\n');
write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`);
write('robots.txt', indexingOn
  ? `User-agent: *\nAllow: /\nDisallow: /thanks/\n\nSitemap: ${site.url}/sitemap.xml\n`
  : `# Site not launched yet (or this is a preview): please do not index.\nUser-agent: *\nDisallow: /\n`);

// A single file of approved public information, ready for a future chatbot. See docs/CHATBOT_READY.md.
const knowledge = {
  _notice: 'Approved public information about Happy Hop Holidays. A chatbot must answer only from this file, must not invent prices, dates or inclusions, and should hand over to the enquiry form or WhatsApp for anything else.',
  generated_at: new Date().toISOString(),
  business: { name: site.name, abn: site.abn, email: site.email, phone: site.phone_display, whatsapp: site.whatsapp_url, website: site.url, social: site.social },
  offer: site.offer,
  package_includes: site.includes,
  price_note: site.price_note + ' (see /terms/#s4)',
  destinations: destinations.map((d) => ({
    slug: d.slug, name: d.name, tagline: d.tagline,
    price: { currency: d.price.currency, from_per_person_now: d.price.from_now, was: d.price.was, note: 'Estimate. Confirmed in the written quote.' },
    ...(d.status === 'approved'
      ? { overview: d.overview, best_time: d.best_time, highlights: d.highlights, good_for: d.good_for, faqs: d.faqs, page: `/destinations/${d.slug}/` }
      : { details: 'Not yet approved for chatbot use. Refer the visitor to the enquiry form.' })
  })),
  faqs: faqs.map((f) => ({ id: f.id, question: f.question, answer: f.answer_html.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&') })),
  policies: { privacy: '/privacy/', terms: '/terms/', referral_terms: '/refer/#terms' },
  handover: { enquiry_form: '/#enquire', whatsapp: site.whatsapp_url, email: site.email }
};
write('knowledge.json', JSON.stringify(knowledge, null, 2) + '\n');

// ------------------------------------------------------------------ report
console.log(`Built ${pages.length} pages into dist/  (site url: ${site.url})`);
console.log(`Search engines: ${indexingOn ? 'ALLOWED (launched)' : 'BLOCKED (set "launched": true in content/site.json when the real domain is live)'}`);
console.log('Destinations:\n' + destSummary.join('\n'));
console.log('Landing pages:\n' + (landingSummary.join('\n') || '  none'));
