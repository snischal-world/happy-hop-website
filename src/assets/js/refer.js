(function(){
var cd=document.getElementById('cd'),ms=document.getElementById('ms'),wa=document.getElementById('wa'),ok=document.getElementById('ok');
function msg(){var c=cd.value.trim()||'[your code]';return 'I travelled with Happy Hop Holidays and loved it. Use my code '+c+' when you enquire and you save on your first trip.'}
var edited=false;
function sync(){if(!edited)ms.value=msg();wa.href='https://api.whatsapp.com/send?text='+encodeURIComponent(ms.value)}
cd.addEventListener('input',sync);
ms.addEventListener('input',function(){edited=true;sync()});
document.getElementById('cp').addEventListener('click',function(){
var done=function(){ok.textContent='Message copied.'},fail=function(){ms.focus();ms.select();ok.textContent='Press Ctrl+C (or Cmd+C) to copy the selected message.'};
try{navigator.clipboard.writeText(ms.value).then(done,fail)}catch(e){fail()}
});
sync();
})();
