// Local preview server.   npm run dev   then open http://localhost:8888
//  - rebuilds automatically when you save a file in content/, src/ or public/
//  - shows draft pages too (INCLUDE_DRAFTS=1) so you can review them before publishing
//  - pretends to be Netlify Forms: a form submission is saved as a file in
//    .local-submissions/ (never uploaded, never committed) and you see the thank-you page.
import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync, readdirSync, mkdirSync, writeFileSync } from 'node:fs';
import { join, extname, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(ROOT, 'dist');
const PORT = Number(process.env.PORT || 8888);
const env = { ...process.env, INCLUDE_DRAFTS: process.env.INCLUDE_DRAFTS ?? '1', SITE_URL: process.env.SITE_URL ?? `http://localhost:${PORT}` };
const MIME = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.woff': 'font/woff', '.woff2': 'font/woff2', '.xml': 'application/xml', '.txt': 'text/plain' };

function newest(dir) {
  let t = 0;
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const f = join(dir, e.name);
    t = Math.max(t, e.isDirectory() ? newest(f) : statSync(f).mtimeMs);
  }
  return t;
}
const sources = () => Math.max(...['content', 'src', 'public', 'scripts'].map((d) => newest(join(ROOT, d))));
let built = 0;
function build() {
  const r = spawnSync(process.execPath, [join(ROOT, 'scripts/build.mjs')], { env, encoding: 'utf8' });
  built = Date.now();
  if (r.status !== 0) console.error('\nBUILD FAILED:\n' + (r.stderr || r.stdout));
  else console.log('Rebuilt.');
}
build();

createServer((req, res) => {
  const url = new URL(req.url, 'http://x');
  if (req.method === 'POST') {
    let body = '';
    req.on('data', (c) => { body += c; if (body.length > 200000) req.destroy(); });
    req.on('end', () => {
      const data = {};
      for (const [k, v] of new URLSearchParams(body)) data[k] = k in data ? [].concat(data[k], v) : v;
      const form = data['form-name'] || 'unknown';
      if (data.website) {
        console.log(`\n[form "${form}"] ignored: honeypot field was filled in (this is how spam is blocked).`);
      } else {
        const dir = join(ROOT, '.local-submissions');
        mkdirSync(dir, { recursive: true });
        const file = join(dir, `${new Date().toISOString().replace(/[:.]/g, '-')}-${form}.json`);
        writeFileSync(file, JSON.stringify({ received_at: new Date().toISOString(), ...data }, null, 2));
        console.log(`\n[form "${form}"] submission saved: ${file}`);
        for (const [k, v] of Object.entries(data)) if (v !== '' && k !== 'form-name') console.log(`   ${k}: ${Array.isArray(v) ? v.join(', ') : v}`);
      }
      res.writeHead(303, { Location: '/thanks/' }).end();
    });
    return;
  }
  if (url.pathname.endsWith('/') || url.pathname.endsWith('.html')) { if (sources() > built) build(); }
  let f = join(DIST, decodeURIComponent(url.pathname));
  if (!f.startsWith(DIST)) return res.writeHead(403).end();
  if (existsSync(f) && statSync(f).isDirectory()) f = join(f, 'index.html');
  if (!existsSync(f)) { f = join(DIST, '404.html'); res.statusCode = 404; }
  res.setHeader('Content-Type', MIME[extname(f)] || 'application/octet-stream');
  res.end(readFileSync(f));
}).listen(PORT, () => console.log(`\nPreview running at http://localhost:${PORT}   (press Ctrl+C to stop)\nDrafts are visible here. Form submissions are saved to .local-submissions/\n`));
