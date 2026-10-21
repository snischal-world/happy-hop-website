/* Landing-page lead form (Netlify form name: "lead"). Works for every landing layout. */
(function () {
  [].slice.call(document.querySelectorAll('form.leadform')).forEach(function (f) {
    var E = f.elements, err = f.querySelector('.errmsg'), btn = f.querySelector('button[type=submit]'),
        box = f.querySelector('[data-other]'), label = btn.textContent;
    HH.track(f);
    function other() { if (box) box.hidden = E.travel_interest.value !== 'Other'; }
    E.travel_interest.addEventListener('change', other); other();
    E.other_destination && E.other_destination.addEventListener('input', function () { HH.cleanOther(E.other_destination); });
    function fail(msg, el) { err.textContent = msg; if (el) el.focus(); }
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      if (E.website.value) { location.assign(f.dataset.redirect || '/thanks/'); return; } /* honeypot: bots only */
      if (!E.name.value.trim()) return fail('Please enter your name.', E.name);
      if (!HH.validEmail(E.email.value)) return fail('Please enter a valid email address.', E.email);
      if (!E.travel_interest.value) return fail('Please choose what you are interested in.', E.travel_interest);
      if (E.travel_interest.value === 'Other' && !E.other_destination.value.replace(/[ ,]/g, '')) return fail('Please tell us which destination you have in mind.', E.other_destination);
      var ps = parseInt(E.party_size.value, 10);
      if (!(ps >= 1 && ps <= 50)) return fail('Please enter how many people are travelling (1 to 50).', E.party_size);
      if (E.approx_dates.required && !E.approx_dates.value.trim()) return fail('Please give us rough dates. "Not sure yet" is fine.', E.approx_dates);
      if (!E.consent.checked) return fail('Please tick the box so we can contact you.', E.consent);
      err.textContent = '';
      HH.consentText(f);
      btn.disabled = true; btn.textContent = 'Sending...';
      HH.post(f).then(function () {
        /* A separate thank-you page makes campaign conversions easy to count. */
        location.assign(f.dataset.redirect || '/thanks/');
      }).catch(function () {
        err.textContent = 'Sorry, that did not send. Please try again, or message us on WhatsApp.';
        btn.disabled = false; btn.textContent = label;
      });
    });
  });
})();
