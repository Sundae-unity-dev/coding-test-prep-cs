/* 간격 반복(Leitner) 복습 큐.
   개념 퀴즈를 한 번이라도 푼 주제를 1일/3일/1주/2주/1달 간격으로 다시 꺼내요.
   복습을 마치면 다음 단계로 올라가 간격이 늘고, 정답률이 낮으면 처음 간격으로 되돌려요.
   저장 키 ct_srs_v1 = { tX: { box: 단계, last: 'YYYY-MM-DD' } } */
(function () {
  var KEY = 'ct_srs_v1';
  var INTERVALS = [1, 3, 7, 14, 30];
  var LABELS = ['1일', '3일', '1주', '2주', '1달'];

  function read() { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } }
  function write(v) { try { localStorage.setItem(KEY, JSON.stringify(v)); } catch (e) {} }
  function todayMid() { var d = new Date(); d.setHours(0, 0, 0, 0); return d; }
  function ymd(d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  function daysSince(dateStr) { return Math.round((todayMid() - new Date(dateStr + 'T00:00:00')) / 86400000); }
  function clampBox(b) { return Math.max(0, Math.min(b, INTERVALS.length - 1)); }

  // 퀴즈 기록 -> 주제별 정답률(있는 주제만). concepts: [{id:'tX', t:'이름'}]
  function topicStats(quiz, concepts) {
    var nameOf = {};
    (concepts || []).forEach(function (c) { nameOf[c.id] = c.t; });
    var by = {};
    Object.keys(quiz || {}).forEach(function (k) {
      var m = k.match(/^q(\d+)-/); if (!m) return;
      var tid = 't' + m[1]; if (!nameOf[tid]) return;
      var v = quiz[k], ok = (v === true || (v && v.correct));
      by[tid] = by[tid] || { c: 0, t: 0, name: nameOf[tid] };
      by[tid].t++; if (ok) by[tid].c++;
    });
    return by;
  }

  // 오늘 복습할 주제 목록(정답률 낮은 순)
  function due(quiz, concepts) {
    var by = topicStats(quiz, concepts), srs = read(), list = [];
    Object.keys(by).forEach(function (tid) {
      var s = by[tid], st = srs[tid];
      var isDue = !st || daysSince(st.last) >= INTERVALS[clampBox(st.box)];
      if (!isDue) return;
      list.push({ tid: tid, name: s.name, pct: Math.round(s.c * 100 / s.t), box: st ? clampBox(st.box) : -1 });
    });
    list.sort(function (a, b) { return a.pct - b.pct; });
    return list;
  }

  function complete(tid, pct) {
    var srs = read(), st = srs[tid] || { box: -1 };
    var nb = pct < 50 ? 0 : clampBox(st.box + 1);
    srs[tid] = { box: nb, last: ymd(todayMid()) };
    write(srs);
  }

  function render(el, quiz, concepts) {
    if (!el) return;
    var list = due(quiz, concepts);
    var sec = document.getElementById('srsSec');
    if (!list.length) { if (sec) sec.style.display = 'none'; return; }
    if (sec) sec.style.display = '';
    var cnt = document.getElementById('srsCount');
    if (cnt) cnt.textContent = list.length + '개';
    el.innerHTML = list.map(function (it) {
      var stage = it.box < 0 ? '처음' : (LABELS[it.box] + ' 간격');
      var weak = it.pct < 70 ? ' weak' : '';
      return '<div class="srs-row' + weak + '" data-tid="' + it.tid + '" data-pct="' + it.pct + '">'
        + '<div class="srs-meta"><b>' + String(it.name).replace(/[<>&]/g, '') + '</b>'
        + '<span class="srs-tag">정답률 ' + it.pct + '% · ' + stage + '</span></div>'
        + '<div class="srs-act"><a class="srs-go" href="concepts.html#' + it.tid + '">개념 보기 →</a>'
        + '<button type="button" class="srs-done">복습 완료</button></div></div>';
    }).join('');
    el.querySelectorAll('.srs-done').forEach(function (b) {
      b.addEventListener('click', function () {
        var row = b.closest('.srs-row');
        complete(row.getAttribute('data-tid'), Number(row.getAttribute('data-pct')));
        render(el, quiz, concepts);
      });
    });
  }

  window.ctSrs = { due: due, complete: complete, render: render, topicStats: topicStats };
})();
