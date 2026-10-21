/* Home page: quick finder + full enquiry form (Netlify form name: "enquiry"). */
(function () {
  var f = document.getElementById('f');
  if (!f) return;
  var E = f.elements, q = document.getElementById('finder'), note = document.getElementById('prefill'),
      box = document.getElementById('agesbox'), err = document.getElementById('err'),
      card = document.getElementById('card'), btn = f.querySelector('button[type=submit]'),
      pl = document.getElementById('plimit'), pt;

  HH.track(f);
  try { var r = new URLSearchParams(location.search).get('ref'); if (r) E.referral_code.value = r.slice(0, 40); } catch (x) {}

  function ages() {
    var n = parseInt(E.children.value, 10) || 0;
    box.hidden = n < 1;
    for (var i = 1; i <= 4; i++) E['child_age_' + i].parentNode.hidden = i > n;
  }
  function other() { document.getElementById('otherbox').hidden = E.dest.value !== 'Other'; }

  /* At most 3 "what are you planning" choices; a note appears only if a 4th is tried. */
  f.addEventListener('change', function (e) {
    var t = e.target;
    if (t.name === 'planning' && t.checked && f.querySelectorAll('input[name=planning]:checked').length > 3) {
      t.checked = false; pl.hidden = false; clearTimeout(pt);
      pt = setTimeout(function () { pl.hidden = true; }, 5000);
    }
  });
  E.dest.addEventListener('change', other);
  E.other_destination.addEventListener('input', function () { HH.cleanOther(E.other_destination); });
  E.children.addEventListener('input', ages);
  E.children.addEventListener('change', ages);

  function fail(msg, el) { err.textContent = msg; if (el) el.focus(); }

  f.addEventListener('submit', function (e) {
    e.preventDefault();
    if (E.website.value) { card.classList.add('sent'); return; } /* honeypot: bots only */
    if (!f.querySelector('input[name=who]:checked')) return fail('Please choose who you are.');
    if (E.dest.value === 'Other' && !E.other_destination.value.replace(/[ ,]/g, '')) return fail('Please tell us which destination you have in mind.', E.other_destination);
    if (!E.name.value.trim()) return fail('Please enter your name.', E.name);
    if (!HH.validEmail(E.email.value)) return fail('Please enter a valid email address.', E.email);
    if (!E.consent.checked) return fail('Please tick the box so we can contact you about your enquiry.', E.consent);
    err.textContent = '';
    HH.consentText(f);
    btn.disabled = true; btn.textContent = 'Sending...';
    HH.post(f).then(function () {
      card.classList.add('sent');
      card.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }).catch(function () {
      err.textContent = 'Sorry, that did not send. Please try again, or message us on WhatsApp.';
      btn.disabled = false; btn.textContent = 'Send enquiry';
    });
  });

  /* The quick finder under the hero copies its answers into the form below. */
  q.addEventListener('submit', function (e) {
    e.preventDefault();
    E.dest.value = q.fd.value; E.travel_month.value = q.fw.value;
    E.adults.value = q.fa.value; E.children.value = q.fc.value;
    ages(); other();
    note.hidden = !(q.fd.value || q.fw.value);
    document.getElementById('enquire').scrollIntoView({ behavior: 'smooth' });
    if (q.fd.value === 'Other') setTimeout(function () { try { E.other_destination.focus({ preventScroll: true }); } catch (x) {} }, 700);
  });

  other(); ages();
})();
