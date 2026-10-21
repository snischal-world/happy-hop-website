// Landing-page layouts. Each layout takes a content file from content/landing/*.json
// and returns the <main> HTML. The build adds the page <head>, header and footer.
//
//   layout "offer"       a promotion: hero + form, why book, destinations, how it works, FAQ
//   layout "destination" one destination: hero + form, highlights, itinerary, price, FAQ
//   layout "event"       weddings and corporate events: event types, process, FAQ
//
// To add a fourth layout, copy one of the functions below and register it at the bottom.

import {
  esc, leadForm, highlights, steps, heroImage, offerBanner, priceNote,
  faqBlock, destinationCards, includesList
} from './parts.mjs';

const em = (headline, emphasis) =>
  emphasis ? esc(headline).replace(esc(emphasis), `<em>${esc(emphasis)}</em>`) : esc(headline);

function hero(lp, ctx, extra = '') {
  const h = lp.hero;
  const bullets = (h.bullets || []).length
    ? `<ul class="lp-bullets">${h.bullets.map((b) => `<li>${esc(b)}</li>`).join('')}</ul>`
    : '';
  return `<header class="lp-hero" id="top">
<div class="blob g2" style="width:520px;height:520px;left:-220px;top:-200px"></div><div class="blob g1" style="width:380px;height:380px;right:-150px;top:-60px;opacity:.6"></div>
<div class="wrap lp-hero-grid">
<div>
<p class="eyebrow">${esc(h.eyebrow || '')}</p>
<h1>${em(h.headline, h.headline_emphasis)}</h1>
<p class="sub">${esc(h.subhead)}</p>
${h.show_offer ? offerBanner(ctx.site) : ''}
${bullets}
${heroImage(h.image)}
${extra}
</div>
${leadForm(ctx.site, ctx.destinations, lp)}
</div>
</header>`;
}

function section(title, lead, body, cls = '') {
  return `<section class="lp-sec ${cls}"><div class="wrap">${title ? `<h2>${esc(title)}</h2>` : ''}${lead ? `<p class="lead">${esc(lead)}</p>` : ''}${body}</div></section>`;
}

function chosen(lp, ctx) {
  const slugs = lp.destinations || [];
  return slugs.map((s) => {
    const d = ctx.destinations.find((x) => x.slug === s);
    if (!d) throw new Error(`Landing page "${lp.slug}" lists destination "${s}" which does not exist in content/destinations/`);
    return d;
  });
}

function faqs(lp, ctx) {
  const ids = lp.faqs || [];
  if (!ids.length) return '';
  const list = ids.map((id) => {
    const f = ctx.faqs.find((x) => x.id === id);
    if (!f) throw new Error(`Landing page "${lp.slug}" lists FAQ "${id}" which does not exist in content/faqs.json`);
    return f;
  });
  return faqBlock(list, { openFirst: false });
}

function closing(lp, ctx) {
  const c = lp.closing || {};
  return `<section class="lp-sec"><div class="wrap"><div class="lp-band"><div><h2>${esc(c.heading || 'Ready when you are')}</h2><p>${esc(c.text || 'Tell us your plans and we will come back with options and rates.')}</p></div><a class="btn" href="#enquire">${esc(c.button || lp.hero.cta || 'Get my free quote')}</a></div>${priceNote(ctx.site)}</div></section>`;
}

// ------------------------------------------------------------------ offer
function offer(lp, ctx) {
  const dests = chosen(lp, ctx);
  return [
    hero(lp, ctx),
    lp.highlights ? section(lp.highlights_heading || 'Why book with us', '', highlights(lp.highlights)) : '',
    dests.length ? section(lp.destinations_heading || 'Where would you like to go?', lp.destinations_lead || 'Pick a destination and we plan the rest.', destinationCards(dests) + `<div class="how"><b>Every package includes</b>${includesList(ctx.site.includes)}</div>`) : '',
    lp.steps ? section(lp.steps_heading || 'How it works', '', steps(lp.steps)) : '',
    faqs(lp, ctx),
    closing(lp, ctx)
  ].join('\n');
}

// ------------------------------------------------------------ destination
function destination(lp, ctx) {
  const d = ctx.destinations.find((x) => x.slug === lp.destination);
  if (!d) throw new Error(`Landing page "${lp.slug}" needs "destination" set to a file in content/destinations/`);
  const facts = `<dl class="lp-facts">${d.best_time ? `<div><dt>Best time to go</dt><dd>${esc(d.best_time)}</dd></div>` : ''}${d.good_for?.length ? `<div><dt>Great for</dt><dd>${esc(d.good_for.join(', '))}</dd></div>` : ''}<div><dt>Prices from</dt><dd><s>${d.price.currency} ${d.price.was}</s> <b>${d.price.currency} ${d.price.from_now}</b> per ${esc(d.price.per)}</dd></div></dl>`;
  const days = (lp.itinerary || []).length
    ? `<ol class="lp-itin">${lp.itinerary.map((it) => `<li><span class="day">${esc(it.day)}</span><div><h3>${esc(it.title)}</h3><p>${esc(it.text)}</p></div></li>`).join('')}</ol><p class="lp-fine" style="text-align:left">Sample outline only. We tailor every trip to your dates, hotels and interests.</p>`
    : '';
  return [
    hero(lp, ctx, facts),
    d.highlights?.length ? section(`Highlights of ${d.name}`, '', highlights(d.highlights.map((t) => ({ title: t })))) : '',
    lp.highlights ? section(lp.highlights_heading || 'Why book with us', '', highlights(lp.highlights)) : '',
    days ? section(lp.itinerary_heading || 'A sample trip', '', days) : '',
    faqs(lp, ctx),
    closing(lp, ctx)
  ].join('\n');
}

// ------------------------------------------------------------------ event
function event(lp, ctx) {
  const types = (lp.event_types || [])
    .map((t) => `<div class="tile">${t.image ? `<div class="art"><img class="kimg mult" src="${esc(t.image.src)}" alt="${esc(t.image.alt)}" width="${t.image.width}" height="${t.image.height}" loading="lazy" decoding="async"></div>` : ''}<h3>${esc(t.title)}</h3><p>${esc(t.text)}</p></div>`)
    .join('');
  return [
    hero(lp, ctx),
    types ? section(lp.types_heading || 'What we plan', lp.types_lead || '', `<div class="lp-grid">${types}</div>`) : '',
    lp.highlights ? section(lp.highlights_heading || 'Why teams choose us', '', highlights(lp.highlights)) : '',
    lp.steps ? section(lp.steps_heading || 'How it works', '', steps(lp.steps)) : '',
    faqs(lp, ctx),
    closing(lp, ctx)
  ].join('\n');
}

export const layouts = { offer, destination, event };
