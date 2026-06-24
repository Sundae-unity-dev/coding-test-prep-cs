/* 학습 경로(path.html) - 듀오링고식 경로 + 개념 미니퀴즈.
   단계마다 개념 레슨(인라인 미니퀴즈로 이해도 확인) + 그 단계 문제를 한 줄에 섞어 배치.
   레슨 완료 = 그 주제 미니퀴즈를 모두 정답. ct_path_quiz_v1[tid-i]=true, ct_path_lessons_v1[tid]=true. */
(function () {
  function readObj(k) { try { return JSON.parse(localStorage.getItem(k)) || {}; } catch (e) { return {}; } }
  function write(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]; }); }
  var ALL = window.CT_PROBLEMS || [];
  var CONCEPTS = window.CT_CONCEPTS || [];
  var QUIZ = window.CT_CONCEPT_QUIZ || {};
  var TIERS = ['입문', '기초', '중급', '심화'];
  var examples = ALL.filter(function (p) { return !p.g; });
  var gichul = ALL.filter(function (p) { return p.g; });

  function qList(tid) { return QUIZ[tid] || []; }
  function correctCount(tid) {
    var pq = readObj('ct_path_quiz_v1'), n = 0, list = qList(tid);
    for (var i = 0; i < list.length; i++) if (pq[tid + '-' + i]) n++;
    return n;
  }
  function lessonDone(c) { return qList(c.id).length > 0 && readObj('ct_path_lessons_v1')[c.id] === true; }

  var gi = 0; // 굽이(winding) 인덱스. 모든 노드를 가로질러 연속으로 구불구불
  function wind() { var off = Math.round(Math.sin(gi * 0.8) * 70); gi++; return off; }
  var currentKey = null;

  function lessonNode(c) {
    var total = qList(c.id).length, got = correctCount(c.id), done = lessonDone(c);
    var cur = ('L:' + c.id) === currentKey;
    var cls = 'lesson ' + (done ? 'done' : (cur ? 'current' : 'todo'));
    var now = cur ? '<span class="pnow">지금 배우기</span>' : '';
    var open = total > 0 ? ' data-lesson="' + c.id + '"' : '';
    return '<div class="pnode ' + cls + '" style="transform:translateX(' + wind() + 'px)">' +
      '<a class="pcircle" href="concepts.html#' + c.id + '"' + open + ' title="개념 퀴즈: ' + esc(c.t) + '">' + (done ? '✓' : '📖') + '</a>' +
      '<span class="plabel">개념: ' + esc(c.t) + '</span><span class="pquiz">퀴즈 ' + got + '/' + total + '</span>' + now + '</div>';
  }
  function probNode(p, seq, solved) {
    var done = !!solved[p.id], cur = ('P:' + p.id) === currentKey;
    var cls = done ? 'done' : (cur ? 'current' : 'todo');
    var now = cur ? '<span class="pnow">지금 도전</span>' : '';
    return '<div class="pnode ' + cls + '" style="transform:translateX(' + wind() + 'px)">' +
      '<a class="pcircle" href="run/?problem=' + encodeURIComponent(p.id) + '" title="문제: ' + esc(p.t) + '">' + (done ? '✓' : seq) + '</a>' +
      '<span class="plabel">' + esc(p.t) + '</span>' + now + '</div>';
  }

  function build() {
    var solved = readObj('ct_practice_solved_v1');
    var seqNodes = [];
    TIERS.forEach(function (t) {
      CONCEPTS.filter(function (c) { return c.lv === t; }).forEach(function (c) { seqNodes.push({ k: 'L', c: c }); });
      examples.filter(function (p) { return p.lv === t; }).forEach(function (p) { seqNodes.push({ k: 'P', p: p }); });
    });
    gichul.forEach(function (p) { seqNodes.push({ k: 'P', p: p }); });
    currentKey = null;
    for (var i = 0; i < seqNodes.length; i++) {
      var nd = seqNodes[i], dn = nd.k === 'L' ? lessonDone(nd.c) : !!solved[nd.p.id];
      if (!dn) { currentKey = nd.k === 'L' ? 'L:' + nd.c.id : 'P:' + nd.p.id; break; }
    }
    gi = 0;
    var html = '', seq = 0;
    TIERS.forEach(function (t) {
      var cs = CONCEPTS.filter(function (c) { return c.lv === t; });
      var ps = examples.filter(function (p) { return p.lv === t; });
      if (!cs.length && !ps.length) return;
      var ld = cs.filter(lessonDone).length, pd = ps.filter(function (p) { return solved[p.id]; }).length;
      html += '<div class="pt-head"><span class="pt-name">' + t + '</span><span class="pt-prog">개념 ' + ld + '/' + cs.length + ', 문제 ' + pd + '/' + ps.length + '</span></div>';
      var nodes = cs.map(lessonNode).concat(ps.map(function (p) { seq++; return probNode(p, seq, solved); }));
      html += '<div class="ptrack">' + nodes.join('') + '</div>';
    });
    if (gichul.length) {
      var gdone = gichul.filter(function (p) { return solved[p.id]; }).length;
      html += '<div class="pt-head"><span class="pt-name">기출 변형</span><span class="pt-prog">문제 ' + gdone + '/' + gichul.length + '</span></div>';
      html += '<div class="ptrack">' + gichul.map(function (p) { seq++; return probNode(p, seq, solved); }).join('') + '</div>';
    }
    document.getElementById('pathRoot').innerHTML = html;

    var lTot = CONCEPTS.filter(function (c) { return qList(c.id).length; }).length;
    var lDone = CONCEPTS.filter(lessonDone).length;
    var pTot = examples.length, pDone = examples.filter(function (p) { return solved[p.id]; }).length;
    var totDone = lDone + pDone, tot = lTot + pTot, pct = tot ? Math.round(totDone * 100 / tot) : 0;
    document.getElementById('poverall').innerHTML =
      '<span>전체 진행</span><span class="pbar"><i style="width:' + pct + '%"></i></span><b>' + totDone + ' / ' + tot + '</b>';
  }

  // ===== 개념 미니퀴즈 모달 =====
  var ov = document.getElementById('qzOv'), boxEl = document.getElementById('qzBox'), openTid = null;
  function conceptOf(tid) { for (var i = 0; i < CONCEPTS.length; i++) if (CONCEPTS[i].id === tid) return CONCEPTS[i]; return null; }

  function openLesson(tid) {
    var list = qList(tid); if (!list.length) return;
    openTid = tid;
    var c = conceptOf(tid), pq = readObj('ct_path_quiz_v1');
    var head = '<div class="qz-h"><h2>📖 ' + esc(c ? c.t : tid) + '</h2><button class="qz-close" type="button" aria-label="닫기">×</button></div>' +
      '<div class="qz-sub">개념을 이해했는지 확인하는 문제예요. 다 맞히면 레슨이 완료돼요. <a href="concepts.html#' + tid + '">개념 자세히 보기 →</a></div>' +
      '<div class="qz-prog"><i id="qzBar"></i></div>';
    var qs = list.map(function (q, i) {
      var solvedQ = pq[tid + '-' + i] === true;
      var opts = q.o.map(function (o, oi) {
        var cls = solvedQ && oi === q.a ? ' class="correct"' : '';
        var dis = solvedQ ? ' disabled' : '';
        return '<button type="button" data-q="' + i + '" data-o="' + oi + '"' + cls + dis + '>' + esc(o) + '</button>';
      }).join('');
      var ex = '<div class="qz-ex' + (solvedQ ? ' show' : '') + '" id="qzEx-' + i + '"><b>정답</b> : ' + esc(q.e) + '</div>';
      return '<div class="qz-q" data-qi="' + i + '"><div class="qq"><span class="qn">Q' + (i + 1) + '.</span>' + esc(q.q) + '</div><div class="qz-opts">' + opts + '</div>' + ex + '</div>';
    }).join('');
    boxEl.innerHTML = head + qs + '<div id="qzDoneBox"></div>';
    ov.classList.add('on');
    updateBar();
    boxEl.querySelector('.qz-close').addEventListener('click', closeModal);
  }

  function updateBar() {
    if (!openTid) return;
    var total = qList(openTid).length, got = correctCount(openTid);
    var bar = document.getElementById('qzBar'); if (bar) bar.style.width = (total ? Math.round(got * 100 / total) : 0) + '%';
    if (got >= total && total > 0) {
      var lessons = readObj('ct_path_lessons_v1');
      if (lessons[openTid] !== true) {
        lessons[openTid] = true; write('ct_path_lessons_v1', lessons);
        if (window.ctStampActivity) window.ctStampActivity();
      }
      var db = document.getElementById('qzDoneBox');
      if (db && !db.innerHTML) db.innerHTML = '<div class="qz-done"><div class="big">🎉 레슨 완료!</div><div class="sm">개념을 잘 이해했어요. XP가 쌓였어요.</div></div>';
    }
  }

  // 옵션 클릭(이벤트 위임): 정답이면 잠그고 기록, 오답이면 표시 후 다시 풀기 허용
  document.getElementById('qzBox').addEventListener('click', function (e) {
    var btn = e.target.closest('.qz-opts button'); if (!btn || btn.disabled) return;
    var qi = +btn.getAttribute('data-q');
    var q = qList(openTid)[qi]; if (!q) return;
    var ex = document.getElementById('qzEx-' + qi);
    if (+btn.getAttribute('data-o') === q.a) {
      btn.classList.add('correct');
      [].slice.call(btn.closest('.qz-opts').querySelectorAll('button')).forEach(function (b) { b.disabled = true; });
      var pq = readObj('ct_path_quiz_v1'); pq[openTid + '-' + qi] = true; write('ct_path_quiz_v1', pq);
      if (ex) ex.classList.add('show');
      updateBar();
    } else {
      btn.classList.add('wrong'); btn.disabled = true;
      if (ex) ex.classList.add('show');
    }
  });

  function closeModal() { ov.classList.remove('on'); openTid = null; build(); }
  ov.addEventListener('click', function (e) { if (e.target === ov) closeModal(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && ov.classList.contains('on')) closeModal(); });

  document.getElementById('pathRoot').addEventListener('click', function (e) {
    var a = e.target.closest('.pcircle[data-lesson]'); if (!a) return;
    e.preventDefault(); openLesson(a.getAttribute('data-lesson'));
  });

  build();
})();
