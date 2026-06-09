/* Elice Coding Camp - 공유 스크립트 (다크 토글 / reveal / 맨위로 / 코드 복사 / 진행 집계) */
(function () {
  var LS_THEME = 'ctprep_theme';
  var root = document.documentElement;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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
  function initCopy() {
    document.querySelectorAll('pre').forEach(function (pre) {
      if (pre.closest('table') || pre.querySelector('.copy-btn')) return;
      var code = pre.textContent.trim();
      if (code.length < 20) return;
      pre.classList.add('has-copy');
      var b = document.createElement('button');
      b.className = 'copy-btn'; b.type = 'button'; b.textContent = '복사';
      b.addEventListener('click', function (ev) {
        ev.stopPropagation(); ev.preventDefault();
        navigator.clipboard.writeText(pre.textContent).then(function () {
          b.textContent = '복사됨'; setTimeout(function () { b.textContent = '복사'; }, 1500);
        }).catch(function () {});
      });
      pre.appendChild(b);
    });
  }

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

  function init() { buildControls(); initReveal(); initCopy(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
