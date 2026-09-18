/* Service worker do Leitor de Cartão-Resposta.
   Faz o app instalar e funcionar offline. Para forçar atualização dos ícones,
   troque o número da versão do cache abaixo (v1 -> v2). O index.html atualiza
   sozinho quando você está online (estratégia "rede primeiro"). */
const CACHE = 'leitor-v2';
const CORE = ['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./apple-touch-icon.png','./favicon-64.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return; // fontes e externos seguem normal
  const isHTML = req.mode === 'navigate' || (req.headers.get('accept') || '').includes('text/html');
  if (isHTML) {
    e.respondWith(
      fetch(req).then(r => { const cp = r.clone(); caches.open(CACHE).then(c => c.put('./index.html', cp)); return r; })
                .catch(() => caches.match('./index.html'))
    );
    return;
  }
  e.respondWith(
    caches.match(req).then(c => c || fetch(req).then(r => { const cp = r.clone(); caches.open(CACHE).then(cc => cc.put(req, cp)); return r; }))
  );
});
