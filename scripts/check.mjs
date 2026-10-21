// Safety net: checks the built site (./dist) for the mistakes that cost leads or rankings.
//   npm run check        (run "npm run build" first, or just use "npm test")
// Errors stop a bad deploy. Warnings are advice.

import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, dirname, extname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(ROOT, 'dist');
if (!existsSync(DIST)) { console.error('No dist/ folder. Run "npm run build" first.'); process.exit(1); }

const errors = [], warnings = [];
const err = (page, msg) => errors.push(`${page}: ${msg}`);
const warn = (page, msg) => warnings.push(`${page}: ${msg}`);

const walk = (dir) => readdirSync(dir, { withFileTypes: true }).flatMap((e) => e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)]);
const files = walk(DIST);
const htmlFiles = files.filter((f) => f.endsWith('.html'));
const rel = (f) => '/' + relative(DIST, f).replace(/index\.html$/, '').replace(/\\/g, '/');
const attr = (tag, name) => (tag.match(new RegExp(`\\s${name}="([^"]*)"`)) || [])[1];

// ---- per-page checks -------------------------------------------------------------------------
const idsByPage = {};
for (const f of htmlFiles) idsByPage[rel(f)] = new Set([...readFileSync(f, 'utf8').matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
const exists = (p) => existsSync(join(DIST, p)) || existsSync(join(DIST, p, 'index.html')) || existsSync(join(DIST, p + '.html'));

for (const f of htmlFiles) {
  const page = rel(f), html = readFileSync(f, 'utf8');
  const isHidden = /<meta name="robots" content="noindex/.test(html);

  // SEO and sharing
  const title = (html.match(/<title>([^<]*)<\/title>/) || [])[1];
  if (!title) err(page, 'missing <title>');
  else if (title.length > 70) warn(page, `title is ${title.length} characters (aim for under 60)`);
  const desc = (html.match(/<meta name="description" content="([^"]*)"/) || [])[1];
  if (!desc) err(page, 'missing meta description');
  else if (desc.length < 70 || desc.length > 175) warn(page, `description is ${desc.length} characters (aim for 70 to 160)`);
  if (!/<link rel="canonical" href="https?:\/\//.test(html)) err(page, 'missing canonical link');
  for (const p of ['og:title', 'og:description', 'og:image', 'og:url']) if (!html.includes(`property="${p}"`)) err(page, `missing ${p}`);
  if (!html.includes('name="twitter:card"')) err(page, 'missing twitter:card');
  if (!/<html lang="en">/.test(html)) err(page, 'missing <html lang>');
  const h1 = (html.match(/<h1[\s>]/g) || []).length;
  if (h1 !== 1) err(page, `needs exactly one <h1> (found ${h1})`);
  if (!/<main[\s>]/.test(html)) err(page, 'missing <main> landmark');
  if (!html.includes('class="skip"')) err(page, 'missing skip link');

  // Accessibility basics
  for (const m of html.matchAll(/<img\b[^>]*>/g)) {
    const t = m[0];
    if (attr(t, 'alt') === undefined) err(page, `image without alt text: ${attr(t, 'src')}`);
    if (!attr(t, 'width') || !attr(t, 'height')) warn(page, `image without width/height (causes layout shift): ${attr(t, 'src')}`);
  }
  const formHtml = [...html.matchAll(/<form\b[\s\S]*?<\/form>/g)].map((m) => m[0]).join('\n');
  for (const m of formHtml.matchAll(/<(input|select|textarea)\b[^>]*>/g)) {
    const t = m[0], type = attr(t, 'type');
    if (type === 'hidden' || type === 'submit') continue;
    const name = attr(t, 'name');
    if (!name) { err(page, `form control without a name: ${t.slice(0, 60)}`); }
  }
  if (!/name="viewport"/.test(html)) err(page, 'missing viewport meta (mobile layout)');

  // Links
  for (const m of html.matchAll(/<(?:a|link)\b[^>]*?\shref="([^"]*)"/g)) {
    const href = m[1];
    if (/^(https?:|mailto:|tel:|data:)/.test(href) || href === '') continue;
    const [pathPart, hash] = href.split('#');
    const target = pathPart ? pathPart.split('?')[0] : page;
    if (pathPart && !exists(target)) err(page, `broken link: ${href}`);
    if (hash && pathPart !== undefined && !hash.startsWith('!')) {
      const key = target.endsWith('/') || target.endsWith('.html') ? target : target + '/';
      const ids = idsByPage[key] || idsByPage[target];
      if (ids && !ids.has(hash)) err(page, `link to a section that does not exist: ${href}`);
    }
  }
  for (const m of html.matchAll(/\s(?:src|href)="(\/assets\/[^"?]*)(?:\?[^"]*)?"/g)) if (!exists(m[1])) err(page, `missing file: ${m[1]}`);

  // Forms (Netlify Forms)
  for (const m of html.matchAll(/<form\b[^>]*>/g)) {
    const t = m[0];
    if (!/data-netlify="true"/.test(t)) continue;
    const name = attr(t, 'name');
    const body = html.slice(m.index, html.indexOf('</form>', m.index));
    if (!name) err(page, 'Netlify form has no name');
    if (!new RegExp(`name="form-name" value="${name}"`).test(body)) err(page, `form "${name}" needs <input type="hidden" name="form-name" value="${name}">`);
    if (!/netlify-honeypot="website"/.test(t) || !/name="website"/.test(body)) err(page, `form "${name}" has no spam honeypot`);
    if (attr(t, 'method')?.toUpperCase() !== 'POST') err(page, `form "${name}" must use method="POST"`);
    if (!/type="checkbox" name="consent"[^>]*required/.test(body)) err(page, `form "${name}" needs a required consent checkbox`);
    if (name === 'lead') for (const need of ['name', 'email', 'travel_interest', 'approx_dates', 'party_size', 'consent', 'campaign', 'landing_page']) {
      if (!new RegExp(`name="${need}"`).test(body)) err(page, `lead form is missing the "${need}" field`);
    }
    if (name === 'enquiry') for (const need of ['name', 'email', 'dest', 'travel_month', 'adults', 'children', 'consent']) {
      if (!new RegExp(`name="${need}"`).test(body)) err(page, `enquiry form is missing the "${need}" field`);
    }
  }
  void isHidden;
}

// ---- site-wide files ---------------------------------------------------------------------------
for (const need of ['sitemap.xml', 'robots.txt', 'knowledge.json', 'favicon.svg', 'favicon-32.png', 'apple-touch-icon.png', 'og-default.jpg', '404.html', 'thanks/index.html']) {
  if (!existsSync(join(DIST, need))) err('site', `missing /${need}`);
}
if (existsSync(join(DIST, 'sitemap.xml'))) {
  const sm = readFileSync(join(DIST, 'sitemap.xml'), 'utf8');
  const locs = [...sm.matchAll(/<loc>([^<]*)<\/loc>/g)].map((m) => m[1]);
  for (const l of locs) { const p = new URL(l).pathname; if (!exists(p)) err('sitemap.xml', `lists a page that does not exist: ${p}`); }
  if (locs.length === 0) warn('sitemap.xml', 'is empty because the site is not launched yet ("launched": false in content/site.json). This is expected before go-live.');
  if (locs.some((l) => l.includes('localhost')) && process.env.CONTEXT === 'production') err('sitemap.xml', 'contains localhost URLs. Set "url" in content/site.json');
}
if (existsSync(join(DIST, 'knowledge.json'))) {
  try { JSON.parse(readFileSync(join(DIST, 'knowledge.json'), 'utf8')); } catch { err('knowledge.json', 'is not valid JSON'); }
}
const site = JSON.parse(readFileSync(join(ROOT, 'content/site.json'), 'utf8'));
if (site.launched && !site.url && !process.env.URL) warn('content/site.json', '"launched" is true but "url" is empty. Add your real domain.');

// ---- secrets and customer data must never be in the repository ---------------------------------
const SECRET = [
  [/-----BEGIN [A-Z ]*PRIVATE KEY-----/, 'a private key'],
  [/AKIA[0-9A-Z]{16}/, 'an AWS access key'],
  [/sk_live_[0-9a-zA-Z]{10,}/, 'a Stripe live key'],
  [/xox[abp]-[0-9A-Za-z-]{10,}/, 'a Slack token'],
  [/ghp_[0-9A-Za-z]{30,}/, 'a GitHub token'],
  [/(api[_-]?key|secret|password|token)\s*["']?\s*[:=]\s*["'][^"']{12,}["']/i, 'something that looks like a secret'],
  [/AIza[0-9A-Za-z_-]{35}/, 'a Google API key']
];
const SKIP_DIR = new Set(['node_modules', 'dist', '.git', '.local-submissions']);
const scan = (dir) => {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIR.has(e.name)) continue;
    const f = join(dir, e.name);
    if (e.isDirectory()) { scan(f); continue; }
    if (!/\.(html|css|js|mjs|json|md|toml|txt|svg|xml)$/.test(f) || e.name === 'check.mjs') continue;
    if (statSync(f).size > 2_000_000) continue;
    const text = readFileSync(f, 'utf8');
    for (const [re, what] of SECRET) if (re.test(text)) err(relative(ROOT, f), `contains ${what}. Remove it and use a Netlify environment variable instead.`);
  }
};
scan(ROOT);
if (existsSync(join(ROOT, '.env'))) warn('.env', 'exists locally. It is ignored by Git, but double check it is not committed.');
if (existsSync(join(ROOT, '.local-submissions'))) warn('.local-submissions', 'holds test leads. It is ignored by Git. Delete it when you finish testing.');

// ---- report ---------------------------------------------------------------------------------------
console.log(`Checked ${htmlFiles.length} pages.`);
if (warnings.length) console.log(`\nWarnings (${warnings.length}):\n  - ` + warnings.join('\n  - '));
if (errors.length) { console.error(`\nERRORS (${errors.length}):\n  - ` + errors.join('\n  - ')); process.exit(1); }
console.log('\nAll checks passed.');
