// 사이트 셸 서비스 워커. 설치(PWA) + 오프라인. 정적 페이지/자산을 stale-while-revalidate로 캐시.
// 런박스(/run/)는 자체 SW(service-worker.js)가 더 구체적 스코프로 담당하므로 여기선 건드리지 않아요.
// 배포 위치(GitHub Pages 서브경로 /coding-test-prep-cs/ 또는 GitLab Pages 루트 /)를 sw.js 위치에서 자동 감지
var BASE = self.location.pathname.replace(/sw\.js$/, '');
var CACHE = 'ctcamp-shell-v80';
var SHELL = [
  BASE, BASE + 'index.html', BASE + 'guide.html', BASE + 'concepts.html', BASE + 'practice.html', BASE + 'gichul.html', BASE + 'progress.html', BASE + 'path.html', BASE + 'sql.html', BASE + 'qa.html', BASE + 'templates.html',
  BASE + 'assets/app.css', BASE + 'assets/app.js', BASE + 'assets/nav.js', BASE + 'assets/config.js', BASE + 'assets/util.js', BASE + 'assets/tracker.js', BASE + 'assets/problems.js', BASE + 'assets/gamify.js',
  BASE + 'assets/concept-code.js', BASE + 'assets/concept-ml.js', BASE + 'assets/concept-confuse.js', BASE + 'assets/concept-quiz.js', BASE + 'assets/path-app.js',
  BASE + 'assets/qa-data.js', BASE + 'assets/sql-problems.js', BASE + 'assets/sql-wasm.js', BASE + 'assets/templates-data.js',
  BASE + 'assets/goal.js', BASE + 'assets/srs.js', BASE + 'assets/focus.js',
  BASE + 'assets/elicetrack.png',
  BASE + 'manifest.webmanifest', BASE + 'icon.svg'
];

self.addEventListener('install', function (e) {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(SHELL).catch(function () {}); }));
});

self.addEventListener('activate', function (e) {
  e.waitUntil((async function () {
    var ks = await caches.keys();
    await Promise.all(ks.filter(function (k) { return k.indexOf('ctcamp-shell-') === 0 && k !== CACHE; }).map(function (k) { return caches.delete(k); }));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);
  if (url.origin !== self.location.origin) return;            // 외부(CDN 등) 패스
  if (url.pathname.indexOf(BASE) !== 0) return;               // 우리 사이트만
  if (url.pathname.indexOf(BASE + 'run/') === 0) return;      // 런박스는 자기 SW
  // stale-while-revalidate: 캐시 즉시 반환 + 백그라운드 갱신. 버전 키 불필요(자가 갱신).
  e.respondWith((async function () {
    var cache = await caches.open(CACHE);
    var cached = await cache.match(req, { ignoreSearch: true });
    var net = fetch(req).then(function (r) { if (r && r.ok) cache.put(req, r.clone()); return r; }).catch(function () { return cached; });
    return cached || net;
  })());
});
