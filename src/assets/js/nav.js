/* Highlights the nav link for the section you are reading. Works on any page whose nav links point at #ids on that page. */
(function () {
  var path = location.pathname.replace(/index\.html$/, '');
  var L = [].slice.call(document.querySelectorAll('.links a[data-t]'));
  var S = L.map(function (a) {
    var m = (a.getAttribute('href') || '').match(/^([^#]*)#([\w-]+)$/);
    if (!m || (m[1] && m[1] !== path)) return null;
    return document.getElementById(m[2]);
  });
  if (!S.some(Boolean)) return;
  var ticking = false;
  function update() {
    ticking = false;
    var cur = -1;
    for (var i = 0; i < S.length; i++) {
      if (!S[i]) continue;
      var r = S[i].getBoundingClientRect();
      if (r.top <= 130 && r.bottom > 130) cur = i;
    }
    L.forEach(function (a, i) {
      if (i === cur) a.setAttribute('aria-current', 'location');
      else if (a.getAttribute('aria-current') === 'location') a.removeAttribute('aria-current');
    });
  }
  addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  addEventListener('resize', update);
  update();
})();
