// 런박스 영구 캐시 서비스 워커.
// 런박스를 재빌드/배포할 때마다 아래 VERSION 을 반드시 바꿔주세요.
// (그래야 새 빌드가 캐시되고 옛 캐시가 삭제됩니다. 같은 VERSION 안에서는 자산이 한 빌드로 일관되게 유지돼 버전 섞임이 없어요.)
const VERSION = 'ctrun-cache-2026-07-01a';
// 배포 위치(서브경로/루트)에 상관없이 service-worker.js 위치에서 런박스 범위를 자동 감지
const SCOPE = self.location.pathname.replace(/service-worker\.js$/, '');
const INDEX = SCOPE + 'index.html';

self.addEventListener('install', function () { self.skipWaiting(); });

self.addEventListener('activate', function (e) {
  e.waitUntil((async function () {
    var keys = await caches.keys();
    await Promise.all(keys
      .filter(function (k) { return k.indexOf('ctrun-cache-') === 0 && k !== VERSION; })
      .map(function (k) { return caches.delete(k); }));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);
  if (url.pathname.indexOf(SCOPE) !== 0) return;            // 런박스(run/) 범위만 처리
  var navigate = req.mode === 'navigate';
  var key = navigate ? INDEX : url.pathname;                // ?problem= 네비게이션은 index.html 로 정규화

  e.respondWith((async function () {
    var cache = await caches.open(VERSION);

    // 페이지 진입(네비게이션)은 network-first: 온라인이면 항상 최신 index.html 을 받아
    // 옛 빌드(예: 지난 베타 화면)가 캐시에 남아 보이는 일을 막아요. 오프라인이면 캐시로 폴백.
    if (navigate) {
      try {
        var fresh = await fetch(INDEX, { cache: 'no-store' });
        if (fresh && fresh.ok) { cache.put(key, fresh.clone()); return fresh; }
      } catch (err) { }
      var cached = await cache.match(key);
      return cached || Response.error();
    }

    // 정적 자산(_framework 등, 빌드별 불변)은 cache-first 로 빠르게.
    var hit = await cache.match(key);
    if (hit) return hit;
    try {
      var resp = await fetch(req);
      if (resp && resp.ok) cache.put(key, resp.clone());
      return resp;
    } catch (err2) {
      var fb = await cache.match(key);
      return fb || Response.error();
    }
  })());
});
