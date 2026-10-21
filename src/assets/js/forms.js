/* Shared helpers for every enquiry form (home page and landing pages).
   Forms are handled by Netlify Forms: the HTML form is detected at deploy time,
   and this script sends the same fields with fetch() so the page does not reload. */
(function () {
  var HH = (window.HH = window.HH || {});
  var TRACK = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];

  /* "Other destination" box: letters, spaces, commas only, at most 3 places. */
  HH.cleanOther = function (input) {
    var v = input.value.replace(/[^A-Za-zÀ-ɏ ,'.\-]/g, '');
    var p = v.split(',');
    if (p.length > 3) v = p.slice(0, 3).join(',');
    if (v !== input.value) input.value = v;
  };

  /* Fills hidden fields: the page address and any ?utm_ campaign tags. */
  HH.track = function (form) {
    var q;
    try { q = new URLSearchParams(location.search); } catch (e) { return; }
    TRACK.forEach(function (k) {
      var el = form.elements[k];
      if (el && q.get(k)) el.value = q.get(k).slice(0, 100);
    });
    if (form.elements.page_url) form.elements.page_url.value = location.origin + location.pathname;
  };

  /* Saves the exact consent wording the visitor agreed to alongside the lead. */
  HH.consentText = function (form) {
    var s = form.querySelector('.consent span');
    if (s && form.elements.consent_text) form.elements.consent_text.value = s.textContent.replace(/\s+/g, ' ').trim();
  };

  HH.validEmail = function (v) { return /^\S+@\S+\.\S+$/.test(String(v).trim()); };

  /* POSTs the form to Netlify. Resolves on success, rejects on any failure. */
  HH.post = function (form) {
    var body = new URLSearchParams();
    new FormData(form).forEach(function (v, k) { if (typeof v === 'string') body.append(k, v); });
    var ctl = 'AbortController' in window ? new AbortController() : null;
    var t = ctl && setTimeout(function () { ctl.abort(); }, 20000);
    return fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
      signal: ctl ? ctl.signal : undefined
    }).then(function (r) {
      if (t) clearTimeout(t);
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r;
    });
  };
})();
