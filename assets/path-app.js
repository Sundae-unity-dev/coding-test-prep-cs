/* 학습 경로(path.html) - 왼쪽 경로 + 오른쪽 큰 풀이 패널.
   왼쪽 길에서 개념 노드를 고르면 오른쪽 패널에서 그 개념의 미니퀴즈(객관식 + 빈칸 채우기)를
   한 문제씩 풀어요. 모두 정답이면 레슨 완료. 문제 노드는 런박스로 연결.
   저장: ct_path_quiz_v1[tid-i]=true(정답), ct_path_lessons_v1[tid]=true(완료, 활동 스탬프용). */
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
  var orderedLessons = [];
  TIERS.forEach(function (t) { CONCEPTS.filter(function (c) { return c.lv === t; }).forEach(function (c) { orderedLessons.push(c); }); });

  var pathRoot = document.getElementById('pathRoot');
  var ov = document.getElementById('qzOv');
  var panel = document.getElementById('qzBox');
  var activeTid = null, curIdx = 0;
  var WEEKS = { '입문': '1~4주차', '기초': '5~8주차', '중급': '9~12주차', '심화': '13~16주차' };
  var orderState = {};   // 순서 맞추기: 문제별 표시 순서(셔플)를 세션 동안 고정
  var dispCache = {};    // 객관식/복수정답: 보기 표시 순서 셔플(암기 방지)을 세션 동안 고정
  function dispOrder(key, n) { if (!dispCache[key]) dispCache[key] = shuffleIdx(n); return dispCache[key]; }
  var animatedOnce = false;
  function shuffleIdx(n) {
    var a = []; for (var i = 0; i < n; i++) a.push(i);
    for (var i = n - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; }
    if (a.every(function (v, i) { return v === i; }) && n > 1) a.push(a.shift());
    return a;
  }

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
  function wind() { var off = Math.round(Math.sin(gi * 0.8) * 60); gi++; return off; }
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
      html += '<div class="pt-head"><span class="pt-name">' + t + '</span>' + (WEEKS[t] ? '<span class="pt-week">' + WEEKS[t] + '</span>' : '') + '<span class="pt-prog">개념 ' + ld + '/' + cs.length + ', 문제 ' + pd + '/' + ps.length + '</span></div>';
      var nodes = cs.map(lessonNode).concat(ps.map(function (p) { seq++; return probNode(p, seq, solved); }));
      html += '<div class="ptrack">' + nodes.join('') + '</div>';
    });
    if (gichul.length) {
      var gdone = gichul.filter(function (p) { return solved[p.id]; }).length;
      html += '<div class="pt-head"><span class="pt-name">기출 변형</span><span class="pt-prog">문제 ' + gdone + '/' + gichul.length + '</span></div>';
      html += '<div class="ptrack">' + gichul.map(function (p) { seq++; return probNode(p, seq, solved); }).join('') + '</div>';
    }
    pathRoot.innerHTML = html;
    if (!animatedOnce) { // 최초 1회만 노드 stagger 페이드 인(이후 재빌드는 깜빡임 방지로 미적용)
      animatedOnce = true;
      [].slice.call(pathRoot.querySelectorAll('.pnode')).forEach(function (n, i) { n.style.animationDelay = (Math.min(i, 36) * 0.028) + 's'; n.classList.add('pop'); });
    }

    var lTot = CONCEPTS.filter(function (c) { return qList(c.id).length; }).length;
    var lDone = CONCEPTS.filter(lessonDone).length;
    var pDone = examples.filter(function (p) { return solved[p.id]; }).length;
    var totDone = lDone + pDone, tot = lTot + examples.length, pct = tot ? Math.round(totDone * 100 / tot) : 0;
    document.getElementById('poverall').innerHTML =
      '<span>전체 진행</span><span class="pbar"><i style="width:' + pct + '%"></i></span><b>' + totDone + ' / ' + tot + '</b>';
  }

  // ===== 문제 풀이 모달(창) =====
  function blankify(text, slotId) {
    // 빈칸(___)을 강조 표시(slotId 가 있으면 칩을 넣는 슬롯)로
    return esc(text).replace(/_{2,}/g, function () {
      return '<span class="blank' + (slotId ? ' slot' : '') + '"' + (slotId ? ' id="' + slotId + '"' : '') + '>&nbsp;</span>';
    });
  }

  function markCorrect() { var p = pq(); p[activeTid + '-' + curIdx] = true; write('ct_path_quiz_v1', p); showEx(); afterCorrect(); }
  function showEx() { var ex = document.getElementById('lpEx'); if (ex) ex.classList.add('show'); }

  function renderPanel() {
    var c = conceptOf(activeTid), L = qList(activeTid);
    if (!c || !L.length) { closePanel(); return; }
    var total = L.length, got = correctCount(activeTid);
    if (curIdx < 0) curIdx = 0; if (curIdx > total - 1) curIdx = total - 1;
    var q = L[curIdx], stored = isCorrect(activeTid, curIdx), t = q.type || 'mc';
    var pct = Math.round(got * 100 / total), key = activeTid + '-' + curIdx;
    var tag = { fill: '빈칸 채우기', ox: '참 / 거짓', multi: '복수 정답', order: '순서 맞추기' }[t] || '객관식';

    var body;
    if (t === 'fill') {
      body = '<div class="qz-fill-hint">보기를 빈칸에 끌어다 놓거나, 눌러서 넣어 보세요.</div>' +
        '<div class="qz-chips" id="lpChips">' + q.o.map(function (o, oi) {
          return '<button class="chip" type="button" data-o="' + oi + '" draggable="true">' + esc(o) + '</button>';
        }).join('') + '</div>';
    } else if (t === 'ox') {
      body = '<div class="qz-opts ox">' +
        '<button data-o="0"' + (stored ? ' disabled' : '') + (stored && q.a === 0 ? ' class="correct"' : '') + '><b>O</b><span>참</span></button>' +
        '<button data-o="1"' + (stored ? ' disabled' : '') + (stored && q.a === 1 ? ' class="correct"' : '') + '><b>X</b><span>거짓</span></button></div>';
    } else if (t === 'multi') {
      body = '<div class="qz-fill-hint">맞는 것을 모두 고른 뒤 확인을 눌러요.</div>' +
        '<div class="qz-multi" id="lpMulti">' + dispOrder(key, q.o.length).map(function (oi) {
          var sel = stored && q.a.indexOf(oi) >= 0 ? ' sel correct' : '';
          return '<button class="mopt' + sel + '" type="button" data-o="' + oi + '"' + (stored ? ' disabled' : '') + '>' + esc(q.o[oi]) + '</button>';
        }).join('') + '</div><div class="qz-actions"><button class="chk" id="lpMultiChk"' + (stored ? ' disabled' : '') + '>확인</button></div>';
    } else if (t === 'order') {
      if (!orderState[key]) orderState[key] = shuffleIdx(q.o.length);
      var disp = stored ? q.o.map(function (_, i) { return i; }) : orderState[key];
      body = '<div class="qz-fill-hint">↑ ↓ 로 올바른 순서를 맞춘 뒤 확인을 눌러요.</div>' +
        '<div class="qz-order' + (stored ? ' done' : '') + '" id="lpOrder">' + disp.map(function (oi, pos) {
          return '<div class="oitem" data-oi="' + oi + '"><span class="onum">' + (pos + 1) + '</span><span class="otx">' + esc(q.o[oi]) + '</span>' +
            '<span class="obtns"><button class="oup" type="button"' + (pos === 0 || stored ? ' disabled' : '') + '>↑</button>' +
            '<button class="odn" type="button"' + (pos === disp.length - 1 || stored ? ' disabled' : '') + '>↓</button></span></div>';
        }).join('') + '</div><div class="qz-actions"><button class="chk" id="lpOrderChk"' + (stored ? ' disabled' : '') + '>확인</button></div>';
    } else {
      body = '<div class="qz-opts">' + dispOrder(key, q.o.length).map(function (oi) {
        var cls = stored && oi === q.a ? ' class="correct"' : '';
        return '<button data-o="' + oi + '"' + cls + (stored ? ' disabled' : '') + '>' + esc(q.o[oi]) + '</button>';
      }).join('') + '</div>';
    }

    panel.innerHTML =
      '<div class="lp-head"><h2>📖 ' + esc(c.t) + '</h2><button class="lp-close" id="lpClose" aria-label="닫기">×</button></div>' +
      '<div class="lp-sub">개념을 이해했는지 확인하는 문제예요. 다 맞히면 레슨이 완료돼요. <a href="concepts.html#' + activeTid + '">개념 자세히 보기 →</a></div>' +
      '<div class="lp-prog"><span class="bar"><i style="width:' + pct + '%"></i></span><span class="n">' + got + ' / ' + total + ' 정답</span></div>' +
      '<div class="qz-q"><div class="qq"><span class="qn">Q' + (curIdx + 1) + '.</span><span class="qtag">' + tag + '</span>' + blankify(q.q, t === 'fill' ? 'lpBlank' : null) + '</div>' + body +
      '<div class="qz-ex' + (stored ? ' show' : '') + '" id="lpEx"><b>정답</b> : ' + esc(q.e) + '</div></div>' +
      '<div class="lp-nav"><button id="lpPrev"' + (curIdx === 0 ? ' disabled' : '') + '>← 이전</button>' +
      '<button class="next" id="lpNext"' + (curIdx === total - 1 ? ' disabled' : '') + '>다음 →</button></div>' +
      '<div id="lpDone"></div>';

    document.getElementById('lpClose').onclick = closePanel;
    document.getElementById('lpPrev').onclick = function () { if (curIdx > 0) { curIdx--; renderPanel(); } };
    document.getElementById('lpNext').onclick = function () { if (curIdx < total - 1) { curIdx++; renderPanel(); } };

    if (stored) { maybeDone(); return; }

    if (t === 'fill') wireFill(q);
    else if (t === 'multi') wireMulti(q, key);
    else if (t === 'order') wireOrder(q, key);
    else { // mc, ox
      [].slice.call(panel.querySelectorAll('.qz-opts button')).forEach(function (b) {
        b.onclick = function () { gradeMc(b, q, +b.getAttribute('data-o')); };
      });
    }
    maybeDone();
  }

  function wireFill(q) {
    var blank = document.getElementById('lpBlank');
    var chips = [].slice.call(panel.querySelectorAll('.chip'));
    var placeFill = function (oi) {
      if (isNaN(oi) || !q.o[oi] || (chips[oi] && chips[oi].disabled)) return;
      if (blank) { blank.textContent = q.o[oi]; blank.classList.add('filled'); }
      showEx();
      if (oi === q.a) { if (blank) { blank.classList.remove('wrong'); blank.classList.add('correct'); } chips.forEach(function (c) { c.disabled = true; }); markCorrect(); }
      else { if (blank) blank.classList.add('wrong'); if (chips[oi]) { chips[oi].disabled = true; chips[oi].classList.add('used'); } }
    };
    chips.forEach(function (c) {
      var oi = +c.getAttribute('data-o');
      c.onclick = function () { placeFill(oi); };
      c.addEventListener('dragstart', function (e) { e.dataTransfer.setData('text/plain', String(oi)); });
    });
    if (blank) {
      blank.addEventListener('dragover', function (e) { e.preventDefault(); blank.classList.add('drop'); });
      blank.addEventListener('dragleave', function () { blank.classList.remove('drop'); });
      blank.addEventListener('drop', function (e) { e.preventDefault(); blank.classList.remove('drop'); placeFill(parseInt(e.dataTransfer.getData('text/plain'), 10)); });
    }
  }

  function wireMulti(q, key) {
    var sel = {};
    var opts = [].slice.call(panel.querySelectorAll('.mopt'));
    opts.forEach(function (b) {
      var oi = +b.getAttribute('data-o');
      b.onclick = function () { if (sel[oi]) { delete sel[oi]; b.classList.remove('sel'); } else { sel[oi] = 1; b.classList.add('sel'); } b.classList.remove('wrong'); };
    });
    document.getElementById('lpMultiChk').onclick = function () {
      var chosen = Object.keys(sel).map(Number).sort(function (a, b) { return a - b; });
      var ans = q.a.slice().sort(function (a, b) { return a - b; });
      showEx();
      if (chosen.length === ans.length && chosen.every(function (v, i) { return v === ans[i]; })) {
        opts.forEach(function (b) { b.disabled = true; if (q.a.indexOf(+b.getAttribute('data-o')) >= 0) b.classList.add('correct'); });
        document.getElementById('lpMultiChk').disabled = true; markCorrect();
      } else {
        opts.forEach(function (b) { if (sel[+b.getAttribute('data-o')] && q.a.indexOf(+b.getAttribute('data-o')) < 0) b.classList.add('wrong'); });
      }
    };
  }

  function wireOrder(q, key) {
    var el = document.getElementById('lpOrder');
    function refresh() { var items = [].slice.call(el.children); items.forEach(function (it, i) { it.querySelector('.onum').textContent = i + 1; it.querySelector('.oup').disabled = (i === 0); it.querySelector('.odn').disabled = (i === items.length - 1); }); }
    el.addEventListener('click', function (e) {
      var up = e.target.closest('.oup'), dn = e.target.closest('.odn'); if (!up && !dn) return;
      var it = e.target.closest('.oitem');
      if (up && it.previousElementSibling) el.insertBefore(it, it.previousElementSibling);
      else if (dn && it.nextElementSibling) el.insertBefore(it.nextElementSibling, it);
      refresh();
    });
    document.getElementById('lpOrderChk').onclick = function () {
      var cur = [].slice.call(el.children).map(function (it) { return +it.getAttribute('data-oi'); });
      showEx();
      if (cur.every(function (v, i) { return v === i; })) {
        el.classList.add('done'); [].slice.call(el.querySelectorAll('button')).forEach(function (b) { b.disabled = true; });
        document.getElementById('lpOrderChk').disabled = true; markCorrect();
      } else { el.classList.add('shake'); setTimeout(function () { el.classList.remove('shake'); }, 400); }
    };
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
  function openLesson(tid) {
    if (!qList(tid).length) return;
    activeTid = tid;
    var L = qList(tid); curIdx = 0;
    for (var i = 0; i < L.length; i++) { if (!isCorrect(tid, i)) { curIdx = i; break; } }
    ov.classList.add('on');
    build(); renderPanel();
  }
  function closePanel() { ov.classList.remove('on'); activeTid = null; build(); }

  // 경로의 개념 노드 클릭 -> 풀이 창 열기 (JS 없으면 concepts 로 이동)
  pathRoot.addEventListener('click', function (e) {
    var a = e.target.closest('.pcircle[data-lesson]'); if (!a) return;
    e.preventDefault(); openLesson(a.getAttribute('data-lesson'));
  });
  // 다음 개념 버튼 (창 내)
  panel.addEventListener('click', function (e) {
    var b = e.target.closest('[data-open]'); if (!b) return;
    openLesson(b.getAttribute('data-open'));
  });
  // 배경 클릭 / Esc 로 창 닫기
  ov.addEventListener('click', function (e) { if (e.target === ov) closePanel(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && ov.classList.contains('on')) closePanel(); });

  build();
})();
