/* 학습 경로(path.html) - 왼쪽 경로 + 오른쪽 큰 풀이 패널.
   왼쪽 길에서 개념 노드를 고르면 오른쪽 패널에서 그 개념의 미니퀴즈(객관식 + 빈칸 채우기)를
   한 문제씩 풀어요. 모두 정답이면 레슨 완료. 문제 노드는 런박스로 연결.
   저장: ct_path_quiz_v1[tid-i]=true(정답), ct_path_lessons_v1[tid]=true(완료, 활동 스탬프용). */
(function () {
  function readObj(k) { try { return JSON.parse(localStorage.getItem(k)) || {}; } catch (e) { return {}; } }
  function write(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]; }); }
  function norm(s) { return String(s).toLowerCase().replace(/\s+/g, ''); }

  var ALL = window.CT_PROBLEMS || [];
  var CONCEPTS = window.CT_CONCEPTS || [];
  var QUIZ = window.CT_CONCEPT_QUIZ || {};
  var TIERS = ['입문', '기초', '중급', '심화'];
  var examples = ALL.filter(function (p) { return !p.g; });
  var gichul = ALL.filter(function (p) { return p.g; });
  var orderedLessons = [];
  TIERS.forEach(function (t) { CONCEPTS.filter(function (c) { return c.lv === t; }).forEach(function (c) { orderedLessons.push(c); }); });

  var pathRoot = document.getElementById('pathRoot');
  var panel = document.getElementById('lessonPanel');
  var activeTid = null, curIdx = 0;

  function qList(tid) { return QUIZ[tid] || []; }
  function pq() { return readObj('ct_path_quiz_v1'); }
  function isCorrect(tid, i) { return pq()[tid + '-' + i] === true; }
  function correctCount(tid) { var p = pq(), n = 0, L = qList(tid); for (var i = 0; i < L.length; i++) if (p[tid + '-' + i]) n++; return n; }
  function lessonDone(c) { var t = qList(c.id).length; return t > 0 && correctCount(c.id) >= t; }
  function conceptOf(tid) { for (var i = 0; i < CONCEPTS.length; i++) if (CONCEPTS[i].id === tid) return CONCEPTS[i]; return null; }
  function firstIncompleteLesson() { for (var i = 0; i < orderedLessons.length; i++) if (!lessonDone(orderedLessons[i])) return orderedLessons[i]; return null; }
  function nextIncompleteLessonAfter(tid) {
    var idx = -1; for (var i = 0; i < orderedLessons.length; i++) if (orderedLessons[i].id === tid) { idx = i; break; }
    for (var j = idx + 1; j < orderedLessons.length; j++) if (!lessonDone(orderedLessons[j])) return orderedLessons[j];
    for (var k = 0; k < orderedLessons.length; k++) if (!lessonDone(orderedLessons[k])) return orderedLessons[k];
    return null;
  }

  // ===== 왼쪽 경로 =====
  var gi = 0;
  function wind() { var off = Math.round(Math.sin(gi * 0.8) * 30); gi++; return off; }
  var currentKey = null;

  function lessonNode(c) {
    var total = qList(c.id).length, got = correctCount(c.id), done = lessonDone(c);
    var cur = ('L:' + c.id) === currentKey, act = activeTid === c.id;
    var cls = 'lesson ' + (done ? 'done' : (cur ? 'current' : 'todo')) + (act ? ' active' : '');
    var now = cur ? '<span class="pnow">지금 할 차례</span>' : '';
    return '<div class="pnode ' + cls + '" style="transform:translateX(' + wind() + 'px)">' +
      '<a class="pcircle" href="concepts.html#' + c.id + '" data-lesson="' + c.id + '" title="개념 퀴즈: ' + esc(c.t) + '">' + (done ? '✓' : '📖') + '</a>' +
      '<span class="plabel">' + esc(c.t) + '</span><span class="pquiz">퀴즈 ' + got + '/' + total + '</span>' + now + '</div>';
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
    pathRoot.innerHTML = html;

    var lTot = CONCEPTS.filter(function (c) { return qList(c.id).length; }).length;
    var lDone = CONCEPTS.filter(lessonDone).length;
    var pDone = examples.filter(function (p) { return solved[p.id]; }).length;
    var totDone = lDone + pDone, tot = lTot + examples.length, pct = tot ? Math.round(totDone * 100 / tot) : 0;
    document.getElementById('poverall').innerHTML =
      '<span>전체 진행</span><span class="pbar"><i style="width:' + pct + '%"></i></span><b>' + totDone + ' / ' + tot + '</b>';
  }

  // ===== 오른쪽 풀이 패널 =====
  function renderEmpty() {
    var nx = firstIncompleteLesson();
    var cta = nx ? '<button class="start" data-open="' + nx.id + '">지금 할 차례: ' + esc(nx.t) + ' 시작하기</button>'
                 : '<div style="margin-top:14px;font-weight:800;color:var(--purple-dark);">모든 개념 레슨을 끝냈어요! 🎉</div>';
    panel.innerHTML = '<div class="lp-empty"><span class="big">👈</span>왼쪽 길에서 <b>개념(📖)</b>을 골라<br>그 개념을 이해했는지 확인하는 문제를 풀어요.<br>' + cta + '</div>';
  }

  function blankify(text) {
    // 빈칸(___)을 강조 표시로
    return esc(text).replace(/_{2,}/g, '<span class="blank">&nbsp;</span>');
  }

  function renderPanel() {
    var c = conceptOf(activeTid), L = qList(activeTid);
    if (!c || !L.length) { renderEmpty(); return; }
    var total = L.length, got = correctCount(activeTid);
    if (curIdx < 0) curIdx = 0; if (curIdx > total - 1) curIdx = total - 1;
    var q = L[curIdx], stored = isCorrect(activeTid, curIdx);
    var pct = Math.round(got * 100 / total);

    var body;
    if (q.type === 'fill') {
      var val = stored ? esc((q.answer && q.answer[0]) || '') : '';
      body = '<div class="qz-fill">' +
        '<input id="lpInput" type="text" autocomplete="off" placeholder="정답을 입력하세요" value="' + val + '"' + (stored ? ' disabled class="correct"' : '') + '>' +
        '<button class="chk" id="lpChk"' + (stored ? ' disabled' : '') + '>확인</button></div>';
    } else {
      body = '<div class="qz-opts">' + q.o.map(function (o, oi) {
        var cls = stored && oi === q.a ? ' class="correct"' : '';
        return '<button data-o="' + oi + '"' + cls + (stored ? ' disabled' : '') + '>' + esc(o) + '</button>';
      }).join('') + '</div>';
    }

    panel.innerHTML =
      '<div class="lp-head"><h2>📖 ' + esc(c.t) + '</h2><button class="lp-close" id="lpClose" aria-label="닫기">×</button></div>' +
      '<div class="lp-sub">개념을 이해했는지 확인하는 문제예요. 다 맞히면 레슨이 완료돼요. <a href="concepts.html#' + activeTid + '">개념 자세히 보기 →</a></div>' +
      '<div class="lp-prog"><span class="bar"><i style="width:' + pct + '%"></i></span><span class="n">' + got + ' / ' + total + ' 정답</span></div>' +
      '<div class="qz-q"><div class="qq"><span class="qn">Q' + (curIdx + 1) + '.</span>' + blankify(q.q) + '</div>' + body +
      '<div class="qz-ex' + (stored ? ' show' : '') + '" id="lpEx"><b>정답</b> : ' + esc(q.e) + '</div></div>' +
      '<div class="lp-nav"><button id="lpPrev"' + (curIdx === 0 ? ' disabled' : '') + '>← 이전</button>' +
      '<button class="next" id="lpNext"' + (curIdx === total - 1 ? ' disabled' : '') + '>다음 →</button></div>' +
      '<div id="lpDone"></div>';

    document.getElementById('lpClose').onclick = closePanel;
    document.getElementById('lpPrev').onclick = function () { if (curIdx > 0) { curIdx--; renderPanel(); } };
    document.getElementById('lpNext').onclick = function () { if (curIdx < total - 1) { curIdx++; renderPanel(); } };
    if (q.type === 'fill') {
      var inp = document.getElementById('lpInput'), chk = document.getElementById('lpChk');
      if (chk) chk.onclick = function () { gradeFill(inp); };
      if (inp && !stored) inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') gradeFill(inp); });
    } else if (!stored) {
      [].slice.call(panel.querySelectorAll('.qz-opts button')).forEach(function (b) {
        b.onclick = function () { gradeMc(b, q, +b.getAttribute('data-o')); };
      });
    }
    maybeDone();
  }

  function afterCorrect() {
    var L = qList(activeTid), total = L.length, got = correctCount(activeTid);
    var bar = panel.querySelector('.lp-prog .bar i'); if (bar) bar.style.width = Math.round(got * 100 / total) + '%';
    var n = panel.querySelector('.lp-prog .n'); if (n) n.textContent = got + ' / ' + total + ' 정답';
    build(); // 왼쪽 노드 배지/완료 갱신
    maybeDone();
  }

  function maybeDone() {
    var L = qList(activeTid), total = L.length, got = correctCount(activeTid);
    var box = document.getElementById('lpDone'); if (!box) return;
    if (got >= total && total > 0) {
      var lessons = readObj('ct_path_lessons_v1');
      if (lessons[activeTid] !== true) { lessons[activeTid] = true; write('ct_path_lessons_v1', lessons); if (window.ctStampActivity) window.ctStampActivity(); }
      var nx = nextIncompleteLessonAfter(activeTid);
      box.innerHTML = '<div class="qz-done"><div class="big">🎉 레슨 완료!</div><div class="sm">개념을 잘 이해했어요. XP가 쌓였어요.</div>' +
        (nx ? '<button class="nextlesson" data-open="' + nx.id + '">다음 개념: ' + esc(nx.t) + ' →</button>' : '') + '</div>';
    } else { box.innerHTML = ''; }
  }

  function gradeMc(btn, q, oi) {
    var ex = document.getElementById('lpEx');
    if (oi === q.a) {
      btn.classList.add('correct');
      [].slice.call(panel.querySelectorAll('.qz-opts button')).forEach(function (b) { b.disabled = true; });
      var p = pq(); p[activeTid + '-' + curIdx] = true; write('ct_path_quiz_v1', p);
      if (ex) ex.classList.add('show');
      afterCorrect();
    } else {
      btn.classList.add('wrong'); btn.disabled = true;
      if (ex) ex.classList.add('show');
    }
  }
  function gradeFill(inp) {
    if (!inp) return;
    var q = qList(activeTid)[curIdx], ex = document.getElementById('lpEx');
    var ok = (q.answer || []).some(function (a) { return norm(a) === norm(inp.value); });
    if (ok) {
      inp.classList.remove('wrong'); inp.classList.add('correct'); inp.disabled = true;
      var chk = document.getElementById('lpChk'); if (chk) chk.disabled = true;
      var p = pq(); p[activeTid + '-' + curIdx] = true; write('ct_path_quiz_v1', p);
      if (ex) ex.classList.add('show');
      afterCorrect();
    } else {
      inp.classList.add('wrong');
      if (ex) ex.classList.add('show');
    }
  }

  function openLesson(tid) {
    if (!qList(tid).length) return;
    activeTid = tid;
    var L = qList(tid); curIdx = 0;
    for (var i = 0; i < L.length; i++) { if (!isCorrect(tid, i)) { curIdx = i; break; } }
    build(); renderPanel();
    if (window.matchMedia && window.matchMedia('(max-width:860px)').matches) panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  function closePanel() { activeTid = null; build(); renderEmpty(); }

  // 왼쪽 경로의 개념 노드 클릭 -> 패널 열기 (JS 없으면 concepts 로 이동)
  pathRoot.addEventListener('click', function (e) {
    var a = e.target.closest('.pcircle[data-lesson]'); if (!a) return;
    e.preventDefault(); openLesson(a.getAttribute('data-lesson'));
  });
  // 시작/다음 개념 버튼 (패널 내)
  panel.addEventListener('click', function (e) {
    var b = e.target.closest('[data-open]'); if (!b) return;
    openLesson(b.getAttribute('data-open'));
  });

  build();
  renderEmpty();
})();
