/* Install and update controls; no telemetry or remote dependencies. */
(() => {
  'use strict';
  const install = document.getElementById('pwaInstall');
  const update = document.getElementById('pwaUpdate');
  const status = document.getElementById('pwaStatus');
  const help = document.getElementById('pwaHelp');
  const standalone = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  let promptEvent = null, registration = null, updating = false;
  function display() {
    install.hidden = standalone() || !promptEvent;
    help.hidden = standalone() || !!promptEvent;
    status.textContent = (standalone() ? 'Installed app' : 'Web app') + (navigator.onLine ? ' • Online' : ' • Offline') + (navigator.serviceWorker && navigator.serviceWorker.controller ? ' • Core cached' : ' • Offline setup pending');
  }
  addEventListener('beforeinstallprompt', e => { e.preventDefault(); promptEvent=e; display(); });
  addEventListener('appinstalled', () => { promptEvent=null; display(); });
  addEventListener('online', display); addEventListener('offline', display);
  install.addEventListener('click', async () => { if (!promptEvent) return; const e=promptEvent; promptEvent=null; try { await e.prompt(); await e.userChoice; } catch(err) { console.warn('Install prompt unavailable',err); } display(); });
  help.addEventListener('click', () => alert('Android/desktop: browser menu → Install app or Add to Home screen. iPhone/iPad: Safari Share → Add to Home Screen. Installation availability varies by browser.'));
  update.addEventListener('click', () => { if(registration && registration.waiting) { updating=true; update.disabled=true; registration.waiting.postMessage('ACTIVATE_UPDATE'); } });
  display();
  if (!('serviceWorker' in navigator) || !isSecureContext) { status.textContent='PWA requires HTTPS or localhost. Standalone guide remains usable.'; return; }
  navigator.serviceWorker.addEventListener('controllerchange', () => { if (updating) location.reload(); else display(); });
  navigator.serviceWorker.register('./sw.js',{scope:'./',updateViaCache:'none'}).then(reg => {
    registration=reg;
    const notice=() => { if(reg.waiting && navigator.serviceWorker.controller) update.hidden=false; };
    notice();
    reg.addEventListener('updatefound', () => { const w=reg.installing; if(w) w.addEventListener('statechange', notice); });
    navigator.serviceWorker.ready.then(display);
    addEventListener('focus', () => { if(navigator.onLine) reg.update().catch(()=>{}); });
  }).catch(err => { status.textContent='Offline setup failed; guide is still available online.'; console.warn(err); });
})();
