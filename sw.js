/* Simple PWA service worker */
const CACHE = 'yj-cache-v1';
const PRECACHE = [
  './',
  './index.html',        // 파일명이 다르면 실제 파일명으로
  './manifest.json',
  './youth_icon_192.png',
  './youth_icon_512.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(PRECACHE))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// 네트워크 우선(HTML), 정적파일은 캐시 우선
self.addEventListener('fetch', (e) => {
  const req = e.request;
  const url = new URL(req.url);

  if (req.mode === 'navigate') {
    // HTML은 네트워크 우선 + 실패 시 캐시 루트 문서
    e.respondWith(
      fetch(req).catch(() => caches.match('./'))
    );
    return;
  }

  // 정적 리소스 캐시-우선
  e.respondWith(
    caches.match(req).then(cached =>
      cached || fetch(req).then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req, copy));
        return res;
      })
    )
  );
});
