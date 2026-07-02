/* 집중 학습 타이머 (포모도로식).
   25분/50분 집중 세션을 재고, 끝내면 오늘 누적 집중 시간(ct_studytime_v1)과
   학습 활동(ct_activity_v1)에 기록해 스트릭/히트맵에 반영해요.
   진행 중 상태(ct_focus_v1)는 저장돼 페이지를 옮겨도 이어져요. */
(function () {
  var SKEY = 'ct_focus_v1';      // { duration(min), endsAt(ms) | remainingMs(ms), paused }
  var LKEY = 'ct_studytime_v1';  // { 'YYYY-MM-DD': minutes }
  var AKEY = 'ct_activity_v1';   // 학습 활동(스트릭/히트맵 공용)

  function read(k) { try { return JSON.parse(localStorage.getItem(k)) || null; } catch (e) { return null; } }
  function obj(k) { try { return JSON.parse(localStorage.getItem(k)) || {}; } catch (e) { return {}; } }
  var write = ctUtil.lsSet;
  function del(k) { try { localStorage.removeItem(k); } catch (e) {} }
  function now() { return new Date().getTime(); }
  var ymd = ctUtil.ymd;
  function todayKey() { return ymd(new Date()); }

  function todayMinutes() { var l = obj(LKEY); return l[todayKey()] || 0; }
  function credit(min) {
    var l = obj(LKEY); l[todayKey()] = (l[todayKey()] || 0) + min; write(LKEY, l);
    var a = obj(AKEY); a[todayKey()] = true; write(AKEY, a);
  }

  var timer = null;

  function render(el) {
    if (!el) return;
    var st = read(SKEY);
    // 자리를 비운 사이 끝났으면 그 세션을 인정하고 비워요.
    if (st && !st.paused && st.endsAt && now() >= st.endsAt) { credit(st.duration); del(SKEY); st = null; }

    var phase = !st ? 'idle' : (st.paused ? 'paused' : 'running');
    var remainMs = !st ? 0 : (st.paused ? st.remainingMs : Math.max(0, st.endsAt - now()));

    el.innerHTML =
      '<div class="ft-presets">' +
        '<button type="button" class="ft-set" data-min="25"' + (phase !== 'idle' ? ' disabled' : '') + '>25분</button>' +
        '<button type="button" class="ft-set" data-min="50"' + (phase !== 'idle' ? ' disabled' : '') + '>50분</button>' +
      '</div>' +
      '<div class="ft-clock" id="ftClock">' + fmt(phase === 'idle' ? 25 * 60000 : remainMs) + '</div>' +
      '<div class="ft-ctrl">' +
        (phase === 'idle'
          ? '<button type="button" class="ft-main" data-act="start" data-min="25">25분 시작</button>'
          : '<button type="button" class="ft-main" data-act="toggle">' + (phase === 'paused' ? '이어서' : '일시정지') + '</button>'
            + '<button type="button" class="ft-reset" data-act="reset">초기화</button>') +
      '</div>' +
      '<div class="ft-today">오늘 집중 <b>' + todayMinutes() + '분</b></div>';

    wire(el);
    manageTick(el);
  }

  function fmt(ms) {
    var s = Math.max(0, Math.round(ms / 1000));
    var m = Math.floor(s / 60), ss = s % 60;
    return String(m).padStart(2, '0') + ':' + String(ss).padStart(2, '0');
  }

  function start(min) { write(SKEY, { duration: min, endsAt: now() + min * 60000, paused: false }); }
  function toggle() {
    var st = read(SKEY); if (!st) return;
    if (st.paused) { st.endsAt = now() + st.remainingMs; st.paused = false; delete st.remainingMs; }
    else { st.remainingMs = Math.max(0, st.endsAt - now()); st.paused = true; delete st.endsAt; }
    write(SKEY, st);
  }
  function reset() { del(SKEY); }

  function wire(el) {
    el.querySelectorAll('.ft-set').forEach(function (b) {
      b.addEventListener('click', function () { start(Number(b.getAttribute('data-min'))); render(el); });
    });
    var main = el.querySelector('.ft-main');
    if (main) main.addEventListener('click', function () {
      var act = main.getAttribute('data-act');
      if (act === 'start') start(Number(main.getAttribute('data-min')));
      else toggle();
      render(el);
    });
    var rs = el.querySelector('.ft-reset');
    if (rs) rs.addEventListener('click', function () { reset(); render(el); });
  }

  // 1초마다 시계 갱신. 끝나면 인정하고 다시 그려요.
  function manageTick(el) {
    if (timer) { clearInterval(timer); timer = null; }
    var st = read(SKEY);
    if (!st || st.paused) return;
    timer = setInterval(function () {
      var s = read(SKEY);
      if (!s || s.paused) { clearInterval(timer); timer = null; return; }
      var left = s.endsAt - now();
      var clock = document.getElementById('ftClock');
      if (left <= 0) {
        clearInterval(timer); timer = null;
        credit(s.duration); del(SKEY);
        render(el);
        if (window.__ctRefreshGami) window.__ctRefreshGami();
        return;
      }
      if (clock) clock.textContent = fmt(left);
    }, 1000);
  }

  window.ctFocus = { render: render, todayMinutes: todayMinutes };
})();
