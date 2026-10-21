// Reusable building blocks. Every page and landing layout is assembled from these.
// Plain JavaScript template strings: no framework, no dependencies.

import { readFileSync } from 'node:fs';

export const esc = (s = '') =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Money, e.g. 420 -> "420" */
export const money = (n) => String(n);

export const WORDMARK = (big = false) =>
  `<span class="wm2${big ? ' big' : ''}"><b>H<i class="sa">a</i>PpY Ho<i>p</i></b><span>Holidays</span></span>`;

export const MARK = '<svg class="cl" viewBox="0 0 336 320" aria-hidden="true"><use href="#mark" width="100%" height="100%"/></svg>';

const ARROW = '<svg width="18" height="10" viewBox="0 0 26 12" aria-hidden="true"><path d="M0 6h24M19 1l5 5-5 5" stroke="#fff" fill="none" stroke-width="2.4"/></svg>';

// ---------------------------------------------------------------- navigation

export function navLinks(items, currentPath, { dataT = true } = {}) {
  return items
    .map((it) => {
      const cur = it.href === currentPath ? ' aria-current="page"' : '';
      return `<a href="${esc(it.href)}"${dataT ? ` data-t="${esc(it.label)}"` : ''}${cur}>${esc(it.label)}</a>`;
    })
    .join('');
}

export function siteHeader(site, currentPath) {
  return `<nav aria-label="Main">
<a class="logo" href="/" aria-label="${esc(site.name)} home">${MARK}${WORDMARK()}</a>
<div class="links">${navLinks(site.nav, currentPath)}<a class="btn" href="/#enquire">Enquire</a></div>
</nav>`;
}

export function legalHeader(site, currentPath) {
  return `<nav aria-label="Main">
<a class="logo" href="/" aria-label="${esc(site.name)} home">${MARK}${WORDMARK()}</a>
<div class="links">${navLinks(site.nav_legal, currentPath)}<a class="btn" href="/#enquire">Enquire</a></div>
</nav>`;
}

/** Slim header for campaign pages: logo, WhatsApp, one clear button. */
export function landingHeader(site, ctaLabel = 'Get a quote') {
  return `<nav class="lp-nav" aria-label="Main">
<a class="logo" href="/" aria-label="${esc(site.name)} home">${MARK}${WORDMARK()}</a>
<div class="links"><a class="lp-wa" href="${esc(site.whatsapp_url)}" target="_blank" rel="noopener noreferrer">WhatsApp us</a><a class="btn" href="#enquire">${esc(ctaLabel)}</a></div>
</nav>`;
}

// ---------------------------------------------------------------- footers

export function siteFooter(site, tpl) {
  const links = site.footer_links.map((l) => `<a href="${esc(l.href)}">${esc(l.label)}</a>`).join('');
  return fill(tpl, site, { footer_links: links, wordmark_big: WORDMARK(true), mark_svg: MARK });
}

export function legalFooter(site) {
  return `<footer><div class="wrap f-row"><div><a href="/">Home</a><a href="/privacy/">Privacy policy</a><a href="/terms/">Terms &amp; conditions</a><a href="/refer/">Refer a friend</a></div><span>&copy; ${esc(site.name)} &middot; ABN ${esc(site.abn)}</span></div></footer>`;
}

export function landingFooter(site) {
  return `<footer class="lp-foot"><div class="wrap f-row"><div><a href="/privacy/">Privacy policy</a><a href="/terms/">Terms &amp; conditions</a><a href="/">Visit our website</a></div><span>&copy; ${esc(site.name)} &middot; ABN ${esc(site.abn)} &middot; <a href="mailto:${esc(site.email)}">${esc(site.email)}</a></span></div></footer>`;
}

// ---------------------------------------------------------------- tokens

/** Replaces {{site.email}}-style tokens. Unknown tokens stop the build so typos are never published. */
export function fill(text, site, extra = {}) {
  return text.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (m, key) => {
    if (key in extra) return extra[key];
    let v = key.startsWith('site.') ? site : null;
    if (!v) throw new Error(`Unknown token ${m}`);
    for (const part of key.split('.').slice(1)) v = v?.[part];
    if (v === undefined || v === null || typeof v === 'object') throw new Error(`Token ${m} has no value in content/site.json`);
    return esc(v);
  });
}

// ---------------------------------------------------------------- destinations

export function destinationCards(dests) {
  const cards = dests
    .map((d) => {
      const p = d.price;
      const href = d.status === 'approved' ? `/destinations/${d.slug}/` : '#enquire';
      return `<a class="d2" href="${href}"><div class="ph"><img decoding="async" src="${esc(d.image.src)}" alt="${esc(d.image.alt)}" loading="lazy" width="${d.image.width}" height="${d.image.height}"><span class="off">50% off</span><h3>${esc(d.name)}</h3></div><div class="info"><div><span class="tg">${esc(d.tagline)}</span><div class="price"><span class="pf">From</span><s class="was" aria-hidden="true">${p.currency} ${money(p.was)}</s><span class="now"><small>${p.currency}</small> ${money(p.from_now)}</span></div><span class="pp">per ${esc(p.per)}<span class="sr">. Was ${p.currency} ${money(p.was)}, now ${p.currency} ${money(p.from_now)}, 50 percent off.</span></span></div><span class="go2">${ARROW}</span></div></a>`;
    })
    .join('');
  return `<div class="dest2">${cards}</div>`;
}

export const destinationOptions = (dests, { first = 'Choose a destination', other = 'Other destination' } = {}) =>
  `<option value="">${esc(first)}</option>` +
  dests.map((d) => `<option>${esc(d.name)}</option>`).join('') +
  `<option value="Other">${esc(other)}</option>`;

export const includesList = (list) => list.map((t) => `<span><i></i>${esc(t)}</span>`).join('');

// ---------------------------------------------------------------- FAQ

export function faqItems(faqs, { openFirst = true } = {}) {
  return faqs
    .map((f, i) => `<details class="faq"${openFirst && i === 0 ? ' open' : ''}><summary><span>${esc(f.question)}</span><span class="pm"></span></summary><div class="ans">${f.answer_html}</div></details>`)
    .join('');
}

export function faqBlock(faqs, { openFirst = true, heading = 'Common Questions', kicker = 'Good to know' } = {}) {
  return `<section id="faq" style="padding-top:24px"><div class="wrap faqs">
<p class="kick">${esc(kicker)}</p><h2 style="margin-bottom:36px;text-align:center">${esc(heading)}</h2>
${faqItems(faqs, { openFirst })}
</div></section>`;
}

export const trackingFields = () =>
  '<input type="hidden" name="page_url" value=""><input type="hidden" name="consent_text" value="">' +
  ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'].map((n) => `<input type="hidden" name="${n}" value="">`).join('');

// ---------------------------------------------------------------- lead form

/**
 * The lead form used on every landing page. Netlify Forms form name: "lead".
 * Fields: name, email, travel interest, approximate dates, party size, consent.
 * Hidden fields record which campaign and page the lead came from.
 */
export function leadForm(site, dests, lp) {
  const f = lp.form || {};
  const interest = f.interest_default || '';
  const options =
    `<option value=""${interest ? '' : ' selected'}>Choose one</option>` +
    (f.interest_options || dests.map((d) => d.name))
      .map((n) => `<option${n === interest ? ' selected' : ''}>${esc(n)}</option>`)
      .join('') +
    `<option value="Other">Another destination</option><option value="Not sure yet">Not sure yet, help me choose</option>`;
  const datesReq = f.require_dates ? ' required' : '';
  return `<div class="formcard lead-card" id="enquire">
<div class="intro"><h2>${esc(f.heading || 'Get your free quote')}</h2>
<p class="lead">${esc(f.intro || 'Tell us a little about your trip and our team will reply with options and rates.')}</p></div>
<form class="leadform" name="lead" method="POST" action="/thanks/" data-netlify="true" netlify-honeypot="website" data-redirect="/thanks/" novalidate>
<input type="hidden" name="form-name" value="lead">
<input type="hidden" name="campaign" value="${esc(lp.campaign || lp.slug)}">
<input type="hidden" name="landing_page" value="${esc(lp.slug)}">
<input type="hidden" name="page_url" value="">
<input type="hidden" name="consent_text" value="">
<input type="hidden" name="utm_source" value=""><input type="hidden" name="utm_medium" value=""><input type="hidden" name="utm_campaign" value=""><input type="hidden" name="utm_content" value=""><input type="hidden" name="utm_term" value="">
<label class="f">Full name<input type="text" name="name" autocomplete="name" required></label>
<label class="f">Email<input type="email" name="email" autocomplete="email" required></label>
<label class="f">Travel interest<select name="travel_interest" class="sel" required>${options}</select></label>
<div data-other hidden><label class="f" style="margin-bottom:6px">Which destination?<input type="text" name="other_destination" maxlength="60" autocomplete="off" placeholder="For example: Japan, Maldives"></label><p class="hint">Up to three places, separated by commas.</p></div>
<div class="row">
<label class="f">Approximate travel dates<input type="text" name="approx_dates" maxlength="80" placeholder="e.g. mid-March 2027"${datesReq}></label>
<label class="f">Number of travellers<input type="number" name="party_size" min="1" max="50" value="2" required></label>
</div>
<div aria-hidden="true" style="position:absolute;left:-9999px;top:auto;width:1px;height:1px;overflow:hidden"><label>Leave this empty<input type="text" name="website" tabindex="-1" autocomplete="off"></label></div>
<label class="consent"><input type="checkbox" name="consent" value="yes" required><span>${esc(site.consent_text)} I have read the <a href="/privacy/">privacy policy</a> and <a href="/terms/">terms</a>.</span></label>
<p class="errmsg" role="alert"></p>
<button class="btn submit" type="submit">${esc(f.button || 'Get my free quote')}</button>
<p class="hint" style="text-align:center;margin:12px 0 0;font-size:.86rem">Prefer to chat? <a href="${esc(site.whatsapp_url)}" target="_blank" rel="noopener noreferrer" style="font-weight:600">Message us on WhatsApp</a> or call ${esc(site.phone_display)}.</p>
</form>
</div>`;
}

// ---------------------------------------------------------------- small blocks

export const priceNote = (site) =>
  `<p class="lp-fine">${esc(site.price_note)} (<a href="/terms/#s4">see our terms</a>).</p>`;

export function highlights(items) {
  return `<div class="lp-grid">${items
    .map((h) => `<div class="tile"><h3>${esc(h.title)}</h3>${h.text ? `<p>${esc(h.text)}</p>` : ''}</div>`)
    .join('')}</div>`;
}

export function steps(items) {
  return `<ol class="lp-steps">${items
    .map((s, i) => `<li><span class="n">${i + 1}</span><div><h3>${esc(s.title)}</h3><p>${esc(s.text)}</p></div></li>`)
    .join('')}</ol>`;
}

export function heroImage(img) {
  if (!img) return '';
  return `<img class="lp-hero-img" src="${esc(img.src)}" alt="${esc(img.alt)}" width="${img.width}" height="${img.height}" decoding="async" fetchpriority="high"${img.mult ? ' style="mix-blend-mode:multiply"' : ''}>`;
}

export function offerBanner(site) {
  return `<div class="sale"><span class="chip"><i></i>Limited time</span><b>${esc(site.offer.label)}</b><span class="t">${esc(site.offer.detail)}</span></div>`;
}

export function whatsappFloat(site, tpl) {
  return fill(tpl, site);
}

export const readText = (p) => readFileSync(p, 'utf8');
