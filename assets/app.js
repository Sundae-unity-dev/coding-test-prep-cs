/* Elice Coding Camp - 공유 스크립트 (다크 토글 / reveal / 맨위로 / 코드 복사 / 진행 집계) */
(function () {
  var LS_THEME = 'ctprep_theme';
  var root = document.documentElement;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 사이트 셸 서비스 워커 등록(설치/오프라인). 런박스(/run/)는 자체 SW를 쓰므로 제외.
  if ('serviceWorker' in navigator && location.pathname.indexOf('/run/') < 0) {
    window.addEventListener('load', function () { navigator.serviceWorker.register('/coding-test-prep-cs/sw.js').catch(function () {}); });
  }

  function curTheme() { return root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light'; }
  function setTheme(t) {
    root.setAttribute('data-theme', t);
    try { localStorage.setItem(LS_THEME, t); } catch (e) {}
    if (window.ctEditor && window.ctEditor.setTheme) window.ctEditor.setTheme(t === 'dark' ? 'vs-dark' : 'vs');
  }
  window.ctSetTheme = setTheme;

  // 떠있는 컨트롤: 다크 토글 + 맨 위로
  function buildControls() {
    var wrap = document.createElement('div');
    wrap.className = 'float-ctrl';

    var tbtn = document.createElement('button');
    tbtn.className = 'fc-btn theme'; tbtn.type = 'button';
    tbtn.setAttribute('aria-label', '다크 모드 전환'); tbtn.title = '다크 모드 전환';
    function icon() { tbtn.textContent = curTheme() === 'dark' ? '☀️' : '🌙'; }
    icon();
    tbtn.addEventListener('click', function () { setTheme(curTheme() === 'dark' ? 'light' : 'dark'); icon(); });

    var top = document.createElement('button');
    top.className = 'fc-btn to-top'; top.type = 'button';
    top.setAttribute('aria-label', '맨 위로'); top.title = '맨 위로'; top.textContent = '↑';
    top.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });

    // 런박스 페이지에서만: 에디터 폰트 크기 조절 버튼
    if (window.ctEditor && window.ctEditor.setFontSize) {
      var fUp = document.createElement('button');
      fUp.className = 'fc-btn'; fUp.type = 'button'; fUp.textContent = 'A+';
      fUp.style.fontSize = '15px'; fUp.style.fontWeight = '800';
      fUp.setAttribute('aria-label', '글자 크게'); fUp.title = '에디터 글자 크게';
      fUp.addEventListener('click', function () { window.ctEditor.setFontSize(1); });
      var fDn = document.createElement('button');
      fDn.className = 'fc-btn'; fDn.type = 'button'; fDn.textContent = 'A-';
      fDn.style.fontSize = '13px'; fDn.style.fontWeight = '800';
      fDn.setAttribute('aria-label', '글자 작게'); fDn.title = '에디터 글자 작게';
      fDn.addEventListener('click', function () { window.ctEditor.setFontSize(-1); });
      wrap.appendChild(fUp); wrap.appendChild(fDn);
    }

    // 사이트 전역 글자 크기(런박스 제외 - 런박스는 에디터 전용 A+/A- 사용). body zoom 으로 화면 전체 확대.
    if (location.pathname.indexOf('/run/') < 0) {
      var scale = parseFloat(localStorage.getItem('ct_font_scale')) || 1;
      var applyScale = function () { document.body.style.zoom = scale; };
      applyScale();
      var sUp = document.createElement('button');
      sUp.className = 'fc-btn'; sUp.type = 'button'; sUp.textContent = 'A+'; sUp.style.fontSize = '15px'; sUp.style.fontWeight = '800';
      sUp.setAttribute('aria-label', '글자 크게'); sUp.title = '글자 크게';
      sUp.addEventListener('click', function () { scale = Math.min(1.3, Math.round((scale + 0.1) * 10) / 10); try { localStorage.setItem('ct_font_scale', scale); } catch (e) {} applyScale(); });
      var sDn = document.createElement('button');
      sDn.className = 'fc-btn'; sDn.type = 'button'; sDn.textContent = 'A-'; sDn.style.fontSize = '13px'; sDn.style.fontWeight = '800';
      sDn.setAttribute('aria-label', '글자 작게'); sDn.title = '글자 작게';
      sDn.addEventListener('click', function () { scale = Math.max(0.9, Math.round((scale - 0.1) * 10) / 10); try { localStorage.setItem('ct_font_scale', scale); } catch (e) {} applyScale(); });
      wrap.appendChild(sUp); wrap.appendChild(sDn);
    }

    wrap.appendChild(tbtn); wrap.appendChild(top);
    document.body.appendChild(wrap);

    var onScroll = function () { top.classList.toggle('show', window.scrollY > 300); };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // 스크롤 진입 reveal. 스크롤 기반이라 앵커 점프로 건너뛴 요소도 숨지 않음.
  function initReveal() {
    var list = [].slice.call(document.querySelectorAll('.reveal'));
    if (reduce) { list.forEach(function (el) { el.classList.remove('reveal'); }); return; }
    function check() {
      for (var i = list.length - 1; i >= 0; i--) {
        var el = list[i];
        var r = el.getBoundingClientRect();
        if (r.top <= 0) {
          // 이미 위로 지나친 요소(점프 등): 애니메이션 없이 즉시 표시
          el.classList.remove('reveal'); list.splice(i, 1);
        } else if (r.top < window.innerHeight * 0.92 && r.bottom > 0) {
          // 아래에서 뷰포트로 들어옴: 스태거 등장 후 클래스 제거(hover/flash 보존)
          (function (el) {
            var d = parseInt(el.getAttribute('data-reveal-delay') || '0', 10);
            setTimeout(function () {
              el.classList.add('shown');
              setTimeout(function () { el.classList.remove('reveal', 'shown'); }, 650);
            }, d);
          })(el);
          list.splice(i, 1);
        }
      }
    }
    window.addEventListener('scroll', check, { passive: true });
    window.addEventListener('resize', check, { passive: true });
    check();
  }
  window.ctReveal = initReveal;

  // 코드 블록 복사 버튼 (토큰 span 은 textContent 로 순수 코드 추출). 표 안의 작은 pre 는 제외.
  // root 아래의 pre 에만 붙여요. 동적으로 그려진 코드에도 다시 호출할 수 있게 window.ctAddCopy 로 노출해요.
  function addCopy(root) {
    (root || document).querySelectorAll('pre').forEach(function (pre) {
      if (pre.closest('table') || pre.querySelector('.copy-btn')) return;
      var codeText = pre.textContent;          // 버튼을 붙이기 전 순수 코드를 잡아둬요
      if (codeText.trim().length < 20) return;
      pre.classList.add('has-copy');
      var b = document.createElement('button');
      b.className = 'copy-btn'; b.type = 'button'; b.textContent = '복사';
      b.addEventListener('click', function (ev) {
        ev.stopPropagation(); ev.preventDefault();
        navigator.clipboard.writeText(codeText).then(function () {
          b.textContent = '복사됨'; setTimeout(function () { b.textContent = '복사'; }, 1500);
        }).catch(function () {});
      });
      pre.appendChild(b);
    });
  }
  function initCopy() { addCopy(document); }
  window.ctAddCopy = addCopy;

  // 진행 집계 헬퍼 (localStorage 읽기) - 대시보드에서 사용
  window.ctProgress = function () {
    function readObj(k) { try { return JSON.parse(localStorage.getItem(k)) || {}; } catch (e) { return {}; } }
    var quiz = readObj('ct_concepts_quiz_v1');
    var solved = readObj('ct_practice_solved_v1');
    var chk = readObj('ct_guide_checklist_v1');
    return {
      quizDone: Object.keys(quiz).length,
      solvedDone: Object.keys(solved).filter(function (k) { return solved[k]; }).length,
      chkDone: Object.keys(chk).filter(function (k) { return chk[k]; }).length
    };
  };

  // 학습 활동(스트릭) 기록. 로컬 날짜 기준이라 런박스/개념/홈이 같은 함수를 써서 일자가 일관돼요.
  function ymd(d) { d = d || new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  window.ctToday = function () { return ymd(); };
  window.ctStampActivity = function () {
    try { var k = 'ct_activity_v1', o = JSON.parse(localStorage.getItem(k) || '{}'), t = ymd(); o[t] = (o[t] || 0) + 1; localStorage.setItem(k, JSON.stringify(o)); } catch (e) {}
  };

  // 주간 리더보드 로더 (공개 board 엔드포인트 JSONP, 5분 캐시). progress/index 공용.
  // opts.limit = 표시 개수(기본 20). 방문자 이름이 있고 그 순위가 표시 범위 밖이면 내 순위를 한 줄 덧붙임.
  window.ctLeaderboard = function (box, opts) {
    if (!box) return;
    opts = opts || {};
    var limit = opts.limit || 20;
    function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]; }); }
    function row(r, rk, meName) {
      var medal = rk === 1 ? '🥇' : rk === 2 ? '🥈' : rk === 3 ? '🥉' : rk;
      var meCls = (meName && r.name === meName) ? ' lb-me' : '';
      return '<div class="lb-row' + meCls + '"><span class="lb-rank' + (rk <= 3 ? ' top' : '') + '">' + medal + '</span><span class="lb-name">' + esc(r.name) + '</span><span class="lb-xp">' + (r.weekXp || 0) + ' XP</span></div>';
    }
    var EP = (window.CT_ENDPOINT || '').trim();
    if (!EP) { box.innerHTML = '<div class="lb-empty">리더보드는 학습 추적이 설정된 환경에서 표시돼요.</div>'; return; }
    var wk = (window.ctGamify && window.ctGamify.isoWeek) ? window.ctGamify.isoWeek() : '';
    var me = ''; try { me = (JSON.parse(localStorage.getItem('ct_visitor_v1')) || {}).name || ''; } catch (e) {}
    function render(list) {
      if (!list || !list.length) { box.innerHTML = '<div class="lb-empty">이번 주 기록이 아직 없어요. 문제를 풀어 XP를 쌓아 보세요.</div>'; return; }
      var html = list.slice(0, limit).map(function (r, i) { return row(r, i + 1, me); }).join('');
      if (me) { // 내가 표시 범위 밖이면 내 순위를 한 줄 덧붙여 동기 부여
        var myIdx = -1; for (var j = 0; j < list.length; j++) { if (list[j].name === me) { myIdx = j; break; } }
        if (myIdx >= limit) html += row(list[myIdx], myIdx + 1, me);
      }
      box.innerHTML = html;
    }
    var cache; try { cache = JSON.parse(localStorage.getItem('ct_board_cache_v1')); } catch (e) {}
    if (!opts.force && cache && cache.wk === wk && (Date.now() - cache.at) < 300000) { render(cache.data); return; }
    box.innerHTML = '<div class="lb-empty">리더보드 불러오는 중...</div>';
    var done = false;
    window.ctBoardCb = function (res) {
      done = true;
      if (res && res.board) { try { localStorage.setItem('ct_board_cache_v1', JSON.stringify({ at: Date.now(), wk: wk, data: res.board })); } catch (e) {} render(res.board); }
      else { box.innerHTML = '<div class="lb-empty">리더보드는 곧 열려요. (서버 업데이트가 필요할 수 있어요)</div>'; }
    };
    var s = document.createElement('script');
    s.src = EP + (EP.indexOf('?') >= 0 ? '&' : '?') + 'board=week&wk=' + encodeURIComponent(wk) + '&callback=ctBoardCb';
    s.onerror = function () { if (!done) box.innerHTML = '<div class="lb-empty">리더보드를 불러오지 못했어요.</div>'; };
    document.body.appendChild(s);
    setTimeout(function () { if (!done) box.innerHTML = '<div class="lb-empty">리더보드 응답이 늦어요. 잠시 후 다시 열어 주세요.</div>'; }, 8000);
  };

  // 문제별 커뮤니티 정답률 로더 (공개 ?stats=problems JSONP, 5분 캐시). cb(map) 로 {pid:{triers,solvers,rate}} 전달, 없으면 cb(null).
  window.ctProblemStats = function (cb) {
    var EP = (window.CT_ENDPOINT || '').trim();
    if (!EP) { cb(null); return; }
    var cache; try { cache = JSON.parse(localStorage.getItem('ct_pstats_cache_v1')); } catch (e) {}
    if (cache && cache.data && (Date.now() - cache.at) < 300000) { cb(cache.data); return; }
    var done = false;
    window.ctPStatsCb = function (res) {
      done = true;
      if (res && res.problems) {
        var map = {};
        res.problems.forEach(function (p) { var tr = p.triers || 0, sv = p.solvers || 0; map[p.pid] = { triers: tr, solvers: sv, rate: tr ? Math.round(sv * 100 / tr) : null }; });
        try { localStorage.setItem('ct_pstats_cache_v1', JSON.stringify({ at: Date.now(), data: map })); } catch (e) {}
        cb(map);
      } else { cb(null); }
    };
    var s = document.createElement('script');
    s.src = EP + (EP.indexOf('?') >= 0 ? '&' : '?') + 'stats=problems&callback=ctPStatsCb';
    s.onerror = function () { if (!done) cb(null); };
    document.body.appendChild(s);
    setTimeout(function () { if (!done) cb(null); }, 8000);
  };

  // 전역 검색: 상단 네비에 검색 버튼 + 오버레이를 주입해 개념과 예시 문제를 어느 페이지서나 검색.
  // CT_PROBLEMS/CT_CONCEPTS 가 로드된 페이지에서만 동작(없으면 조용히 생략).
  function initSearch() {
    var nav = document.querySelector('.sitenav .nav-links');
    if (!nav || !window.CT_PROBLEMS) return;
    function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]; }); }
    var items = [];
    (window.CT_CONCEPTS || []).forEach(function (c) { items.push({ t: c.t, sub: '개념 ' + (c.n || ''), href: 'concepts.html#' + c.id, kind: '개념' }); });
    (window.CT_PROBLEMS || []).filter(function (p) { return !p.g; }).forEach(function (p) { items.push({ t: p.t, sub: (p.tags && p.tags.length ? p.tags.join(', ') : '예시 문제'), href: 'practice.html#p-' + p.id, kind: '문제', tags: p.tags || [] }); });

    // 템플릿/QA/SQL 은 데이터가 각 페이지에서만 로드돼요. 전역 검색에 노출하려고 가벼운 색인을 여기 둬요.
    // (제목은 templates-data.js / qa-data.js 와 맞춰 주세요.)
    [
      ['빠른 입출력', 'io', '기본', ['io', 'input', '입력', '출력']],
      ['정렬과 커스텀 비교', 'sort', '기본', ['sort', '정렬', '비교']],
      ['이분 탐색 (lower / upper bound)', 'bsearch', '탐색', ['binary search', '이진탐색', 'lowerbound', 'upperbound']],
      ['BFS (최단 거리)', 'bfs', '그래프', ['bfs', '너비우선', '최단거리', '격자']],
      ['DFS (재귀)', 'dfs', '그래프', ['dfs', '깊이우선', '재귀']],
      ['다익스트라 (최단 경로)', 'dijkstra', '그래프', ['dijkstra', '최단경로', '우선순위큐']],
      ['동적 계획법 골격', 'dp', 'DP', ['dp', '동적계획법', '점화식', '메모이제이션']],
      ['유니온 파인드 (분리 집합)', 'dsu', '그래프', ['union find', '유니온파인드', '분리집합', 'dsu']],
      ['에라토스테네스의 체', 'sieve', '수학', ['sieve', '소수', '에라토스테네스']],
      ['최대공약수와 최소공배수', 'gcd', '수학', ['gcd', 'lcm', '유클리드', '최대공약수', '최소공배수']],
      ['순열 / 조합 / 백트래킹', 'backtrack', '탐색', ['permutation', 'combination', '백트래킹', '순열', '조합']],
      ['투 포인터 / 슬라이딩 윈도우', 'twopointer', '배열', ['two pointer', '투포인터', '슬라이딩윈도우']],
      ['누적 합', 'prefix', '배열', ['prefix sum', '누적합', '구간합']],
      ['위상 정렬 (Kahn)', 'toposort', '그래프', ['topological sort', '위상정렬', 'kahn']]
    ].forEach(function (e) { items.push({ t: e[0], sub: '템플릿 / ' + e[2], href: 'templates.html#tpl-' + e[1], kind: '템플릿', tags: e[3] }); });
    [
      ['QA 직무와 채용', 's-jobs', ['qa', '직무', '채용']],
      ['QA 테스트 기법', 's-theory', ['qa', '경계값', '동등분할', '테스트 기법']],
      ['좋은 버그 리포트', 's-bug', ['qa', '버그', '리포트', 'bug report']],
      ['QA 면접 대비', 's-interview', ['qa', '면접', 'interview']],
      ['QA 기초 CS', 's-cs', ['qa', 'cs', '네트워크', '데이터베이스']]
    ].forEach(function (e) { items.push({ t: e[0], sub: '개념정리(QA)', href: 'qa.html#' + e[1], kind: 'QA', tags: e[2] }); });
    items.push({ t: 'SQL 연습', sub: '브라우저 SQLite 채점', href: 'sql.html', kind: 'SQL', tags: ['sql', 'query', '쿼리', 'select', 'join'] });
    // 확장 개념(CT_CONCEPTS 미등록분)도 검색에 노출해요. 제목은 concepts.html 사이드바와 맞춰 주세요.
    [
      ['트리 기본과 순회', 't22', ['tree', '트리', '이진트리', '순회', '전위', '중위', '후위']],
      ['DP 핵심 유형 (LIS / LCS / 배낭)', 't23', ['dp', 'lis', 'lcs', '배낭', 'knapsack', '최장 증가', '최장 공통']],
      ['최소 신장 트리 (크루스칼 / 프림)', 't24', ['mst', '크루스칼', 'kruskal', '프림', 'prim', '신장 트리']],
      ['플로이드-워셜', 't25', ['floyd', 'warshall', '플로이드', '워셜', '전체 쌍 최단경로']],
      ['벨만-포드', 't26', ['bellman', 'ford', '벨만', '포드', '음수 간선', '음수 사이클']],
      ['문자열 매칭 (KMP / 라빈-카프)', 't27', ['kmp', 'rabin karp', '라빈카프', '문자열 매칭', '패턴', '실패 함수']],
      ['트라이 (Trie)', 't28', ['trie', '트라이', '접두사', 'prefix', '자동완성']],
      ['세그먼트 트리와 펜윅 트리', 't29', ['segment tree', '세그먼트', 'fenwick', '펜윅', 'bit', '구간 합', '구간 질의']],
      ['분할 정복', 't30', ['divide and conquer', '분할 정복', '병합 정렬', '빠른 거듭제곱', 'fast power']],
      ['DP 심화 (트리 / 구간 / 비트마스크)', 't31', ['트리 dp', '구간 dp', '비트마스크 dp', 'tsp', '외판원', 'tree dp']],
      ['조합론', 't32', ['조합론', '순열', '조합', 'combination', '파스칼', '모듈러', '역원', '페르마']],
      ['모듈러 연산', 't33', ['모듈러', 'modular', '나머지', 'mod', '역원', '페르마', '큰 수']],
      ['좌표 압축', 't34', ['좌표 압축', 'coordinate compression', '순위', 'rank', '압축']],
      ['스위핑 (라인 스윕)', 't35', ['스위핑', 'sweeping', 'line sweep', '구간 겹침', '이벤트']],
      ['최소 공통 조상 (LCA)', 't36', ['lca', '최소 공통 조상', 'lowest common ancestor', '트리', '조상']],
      ['기하 기초 (CCW)', 't37', ['기하', 'ccw', '외적', 'cross product', '선분 교차', '볼록 껍질']]
    ].forEach(function (e) { items.push({ t: e[0], sub: '개념', href: 'concepts.html#' + e[1], kind: '개념', tags: e[2] }); });

    var btn = document.createElement('button');
    btn.type = 'button'; btn.className = 'gs-trigger'; btn.setAttribute('aria-label', '검색'); btn.title = '검색 (단축키 /)';
    btn.textContent = '🔍';
    nav.appendChild(btn);

    var ov = document.createElement('div');
    ov.className = 'gs-ov'; ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-label', '사이트 검색'); ov.hidden = true;
    ov.innerHTML = '<div class="gs-box"><div class="gs-head"><input type="text" class="gs-input" placeholder="개념이나 문제를 검색해 보세요" aria-label="검색어"><button type="button" class="gs-close" aria-label="검색 닫기" title="닫기">×</button></div><div class="gs-results" id="gsResults" role="listbox"></div></div>';
    document.body.appendChild(ov);
    var input = ov.querySelector('.gs-input');
    var results = ov.querySelector('.gs-results');

    function render(q) {
      q = q.trim().toLowerCase();
      // 검색어가 없으면 전체 목록을 보여줘 결과 영역 안에서 둘러볼 수 있게 해요.
      var list = q ? items.filter(function (it) { return it.t.toLowerCase().indexOf(q) >= 0 || (it.tags || []).some(function (tg) { return tg.toLowerCase().indexOf(q) >= 0; }); }).slice(0, 40) : items.slice();
      if (!list.length) { results.innerHTML = '<div class="gs-empty">검색 결과가 없어요.</div>'; return; }
      results.innerHTML = list.map(function (it) {
        return '<a class="gs-item" role="option" href="' + it.href + '"><span class="gs-kind">' + it.kind + '</span><span class="gs-t">' + esc(it.t) + '</span><span class="gs-sub">' + esc(it.sub) + '</span></a>';
      }).join('');
      results.scrollTop = 0;
    }
    function open() { ov.hidden = false; ov.classList.add('on'); document.body.classList.add('gs-lock'); input.value = ''; render(''); setTimeout(function () { input.focus(); }, 30); }
    function close() { ov.classList.remove('on'); ov.hidden = true; document.body.classList.remove('gs-lock'); }
    btn.addEventListener('click', open);
    ov.querySelector('.gs-close').addEventListener('click', close);
    ov.addEventListener('click', function (e) { if (e.target === ov) close(); });
    input.addEventListener('input', function () { render(input.value); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && ov.classList.contains('on')) { close(); return; }
      if (e.key === '/' && !ov.classList.contains('on')) {
        var ae = document.activeElement, tag = (ae && ae.tagName) || '';
        if ((tag === 'INPUT' || tag === 'TEXTAREA' || (ae && ae.isContentEditable)) && ae.offsetParent !== null) return;
        e.preventDefault(); open();
      }
      if (e.key === 'Enter' && ov.classList.contains('on')) { var f = results.querySelector('.gs-item'); if (f) f.click(); }
    });
  }

  // 단축키 도움말 모달 (? 키)
  function initHelp() {
    var ov = document.createElement('div');
    ov.className = 'help-ov'; ov.hidden = true; ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-label', '단축키 도움말');
    ov.innerHTML = '<div class="help-box"><div class="help-head"><b>단축키</b><button class="help-close" type="button" aria-label="닫기">×</button></div>' +
      '<ul class="help-list"><li><kbd>/</kbd> 검색 열기</li><li><kbd>?</kbd> 이 도움말</li><li><kbd>Esc</kbd> 닫기</li>' +
      '<li>우하단 <b>A+ / A-</b> 글자 크기</li><li>우하단 <b>달 / 해</b> 다크 모드</li></ul></div>';
    document.body.appendChild(ov);
    function close() { ov.classList.remove('on'); ov.hidden = true; }
    function open() { ov.hidden = false; ov.classList.add('on'); }
    ov.querySelector('.help-close').addEventListener('click', close);
    ov.addEventListener('click', function (e) { if (e.target === ov) close(); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && ov.classList.contains('on')) { close(); return; }
      if (e.key === '?') {
        var ae = document.activeElement, tag = (ae && ae.tagName) || '';
        if ((tag === 'INPUT' || tag === 'TEXTAREA' || (ae && ae.isContentEditable)) && ae.offsetParent !== null) return;
        e.preventDefault(); if (ov.classList.contains('on')) close(); else open();
      }
    });
  }

  function init() { buildControls(); initReveal(); initCopy(); initSearch(); initHelp(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
