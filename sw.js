// خدمة العمل دون إنترنت: تخزّن الملفات عند أول زيارة، وتحدّثها في الخلفية عند كل زيارة.
const V = 'manhaj-v28';
const CORE = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png'];
const EXT = ['cdn.tailwindcss.com', 'fonts.googleapis.com', 'fonts.gstatic.com', 'www.gstatic.com'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(V).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET') return;
  const u = new URL(r.url);
  const same = u.origin === location.origin;
  if (!same && !EXT.includes(u.hostname)) return;
  // الصفحات (HTML): من الإنترنت أولاً حتى تصل التحديثات فوراً، والمخزّن فقط عند انقطاع الإنترنت.
  if (same && (r.mode === 'navigate' || u.pathname.endsWith('.html') || u.pathname.endsWith('/'))) {
    e.respondWith(fetch(r, {cache: 'no-store'}).then(res => {
      if (res && res.ok) { const cp = res.clone(); caches.open(V).then(c => c.put(r, cp)); }
      return res;
    }).catch(() => caches.match(r, {ignoreSearch: true}).then(hit => hit || caches.match('./index.html'))));
    return;
  }
  e.respondWith(caches.match(r, {ignoreSearch: same}).then(hit => {
    const net = fetch(r).then(res => {
      if (res && (res.ok || res.type === 'opaque')) { const cp = res.clone(); caches.open(V).then(c => c.put(r, cp)); }
      return res;
    }).catch(() => hit || (r.mode === 'navigate' ? caches.match('./index.html') : undefined));
    return hit || net;
  }));
});
