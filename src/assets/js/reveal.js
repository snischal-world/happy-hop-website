(function(){var d=document.documentElement;if(!('IntersectionObserver' in window)||matchMedia('(prefers-reduced-motion:reduce)').matches)return;
d.classList.add('js');
var q=[].slice.call(document.querySelectorAll('.tile,.stat,.d2,.rev,.aud>*'));
q.forEach(function(e,i){e.classList.add('rv');e.style.setProperty('--d',(i%6)*0.06+'s')});
var io=new IntersectionObserver(function(es){es.forEach(function(x){if(x.isIntersecting){var t=x.target;t.classList.add('in');io.unobserve(t);setTimeout(function(){t.classList.remove('rv','in');t.style.removeProperty('--d')},1100)}})},{threshold:.12});
q.forEach(function(e){io.observe(e)});
setTimeout(function(){q.forEach(function(e){e.classList.remove('rv','in')})},5000);
})();
