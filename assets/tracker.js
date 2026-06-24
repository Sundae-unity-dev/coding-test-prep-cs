/* Elice Coding Camp - 학습 진행 추적 (방문자 -> 구글 시트)
 *
 * - 입장 시 이름/닉네임을 한 번 받아 기록에 붙입니다.
 * - 방문/학습시간/개념 열람/문제 풀이/작성 코드를 Apps Script 웹앱으로 보냅니다.
 * - CT_ENDPOINT(assets/config.js)가 비어 있으면 아무 것도 하지 않습니다(완전 무동작).
 * - 주인용 집계는 admin.html(비밀번호) 에서만 봅니다.
 */
(function () {
  // ctTrack 은 항상 정의해 둡니다(런박스 Blazor가 호출해도 안전하도록). 꺼져 있으면 빈 함수.
  window.ctTrack = function () {};

  var ENDPOINT = (window.CT_ENDPOINT || '').trim();
  if (!ENDPOINT) return;                       // 미설정이면 추적 비활성
  if (/admin\.html$/i.test(location.pathname)) return; // 관리자 페이지는 추적 안 함

  var VKEY = 'ct_visitor_v1';

  function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }
  function getVisitor() { try { return JSON.parse(localStorage.getItem(VKEY)); } catch (e) { return null; } }
  function setVisitor(v) { try { localStorage.setItem(VKEY, JSON.stringify(v)); } catch (e) {} }

  function pageName() {
    var p = location.pathname;
    if (p.indexOf('/run/') >= 0) return '런박스';
    var f = p.split('/').pop() || 'index.html';
    var map = { 'index.html': '홈', '': '홈', 'guide.html': '가이드', 'concepts.html': '개념', 'practice.html': '문제' };
    return map[f] || f;
  }

  function send(payload) {
    try {
      payload.t = Date.now();
      var v = getVisitor();
      if (v) { payload.vid = v.id; payload.name = v.name; }
      var body = JSON.stringify(payload);
      if (navigator.sendBeacon) {
        navigator.sendBeacon(ENDPOINT, new Blob([body], { type: 'text/plain;charset=UTF-8' }));
      } else {
        fetch(ENDPOINT, { method: 'POST', mode: 'no-cors', keepalive: true,
          headers: { 'Content-Type': 'text/plain;charset=UTF-8' }, body: body });
      }
    } catch (e) {}
  }

  // 실제 추적 함수로 교체
  window.ctTrack = function (type, detail) { send({ type: type, detail: detail || {} }); };

  // 이름 입력 모달 (앱 토큰/테마 변수 그대로 사용)
  function showNameModal(cb) {
    var ov = document.createElement('div');
    ov.setAttribute('style', 'position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;background:rgba(20,16,40,0.55);backdrop-filter:blur(2px);');
    var box = document.createElement('div');
    box.setAttribute('style', 'width:min(92vw,380px);background:var(--card,#fff);color:var(--ink,#1F2230);border:1px solid var(--line,#E5E2F0);border-radius:16px;padding:24px 22px;box-shadow:0 18px 50px var(--shadow,rgba(60,30,130,0.25));font-family:Pretendard,-apple-system,"Malgun Gothic",sans-serif;');
    var h = document.createElement('div');
    h.textContent = '환영합니다';
    h.setAttribute('style', 'font-size:19px;font-weight:800;margin-bottom:6px;');
    var p = document.createElement('div');
    p.textContent = '학습 진행도 저장을 위해 별명(닉네임)을 적어 주세요. 실명은 권장하지 않아요.';
    p.setAttribute('style', 'font-size:13.5px;color:var(--ink-soft,#555B6E);line-height:1.55;margin-bottom:16px;');
    var inp = document.createElement('input');
    inp.type = 'text'; inp.maxLength = 24; inp.placeholder = '예: 코딩왕, 별명';
    inp.setAttribute('style', 'width:100%;box-sizing:border-box;padding:11px 13px;font-size:15px;border:1px solid var(--line,#E5E2F0);border-radius:10px;background:var(--bg,#FAFAFD);color:var(--ink,#1F2230);outline:none;margin-bottom:14px;');
    var btn = document.createElement('button');
    btn.textContent = '시작하기';
    btn.setAttribute('style', 'width:100%;padding:12px;font-size:15px;font-weight:800;color:#fff;background:var(--purple,#8843FF);border:none;border-radius:10px;cursor:pointer;');
    var note = document.createElement('div');
    note.textContent = '진행도 구분 용도로만 쓰여요. 실명 대신 별명을 권장해요.';
    note.setAttribute('style', 'font-size:11.5px;color:var(--ink-soft,#888);text-align:center;margin-top:10px;');
    function done() {
      var name = (inp.value || '').trim();
      if (!name) { inp.focus(); inp.style.borderColor = '#E5484D'; return; }
      document.body.removeChild(ov);
      cb(name);
    }
    btn.addEventListener('click', done);
    inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') done(); });
    box.appendChild(h); box.appendChild(p); box.appendChild(inp); box.appendChild(btn); box.appendChild(note);
    ov.appendChild(box);
    document.body.appendChild(ov);
    setTimeout(function () { inp.focus(); }, 50);
  }

  function ensureVisitor(cb) {
    var v = getVisitor();
    if (v && v.name) { cb(v); return; }
    showNameModal(function (name) {
      var nv = { id: uid(), name: name };
      setVisitor(nv);
      send({ type: 'join', detail: {} });
      cb(nv);
    });
  }

  // 개념 열람 추적: concepts 페이지의 각 주제(.topic[id])가 화면에 들어오면 1회 기록
  function startConceptObserver() {
    var topics = document.querySelectorAll('.topic[id]');
    if (!topics.length || !('IntersectionObserver' in window)) return;
    var seen = {};
    var io = new IntersectionObserver(function (ents) {
      ents.forEach(function (en) {
        if (!en.isIntersecting) return;
        var id = en.target.id;
        if (seen[id]) return;
        seen[id] = 1;
        var t = en.target.querySelector('h2');
        window.ctTrack('concept', { topic: id, title: t ? t.textContent.trim() : id });
      });
    }, { threshold: 0.4 });
    topics.forEach(function (el) { io.observe(el); });
  }

  // 학습 시간(활성 상태에서만 누적) + 주기적/이탈 시 전송
  function startHeartbeat() {
    var pending = 0;
    setInterval(function () { if (document.visibilityState === 'visible') pending += 15; }, 15000);
    function flush() { if (pending > 0) { window.ctTrack('time', { sec: pending, page: pageName() }); pending = 0; } }
    setInterval(flush, 30000);
    document.addEventListener('visibilitychange', function () { if (document.hidden) flush(); });
    window.addEventListener('pagehide', flush);
  }

  // 주간 XP 전송(공개 리더보드용). gamify.js 준비 후 1회 + 이탈 시.
  function sendXp() {
    try {
      if (!window.ctGamify || !window.ctGamify.weekly) return;
      var w = window.ctGamify.weekly();
      window.ctTrack('xp', { week: w.weekKey, weekXp: w.weekXp, totalXp: w.totalXp });
    } catch (e) {}
  }

  function init() {
    ensureVisitor(function () {
      window.ctTrack('visit', { page: pageName() });
      startConceptObserver();
      startHeartbeat();
      setTimeout(sendXp, 2000);                 // gamify 준비될 시간을 주고 전송
      window.addEventListener('pagehide', sendXp);
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
