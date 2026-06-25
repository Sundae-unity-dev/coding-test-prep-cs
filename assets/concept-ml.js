/* 개념 예제 코드 다국어 토글 (C# / Python / JavaScript) - concepts.html 전용.
   블록 키 = 주제id-순번(퀴즈 밖 pre 순서). C#는 기존 하이라이트를 그대로 쓰고,
   py/js 는 concept-code.js 의 평문을 같은 색 클래스(.cm/.kw/.st/.nm)로 런타임 하이라이트.
   선택 언어는 localStorage(ct_concept_lang_v1)에 기억. */
(function () {
  var CODE = window.CT_CONCEPT_CODE || {};
  var LK = 'ct_concept_lang_v1';
  var cur = 'cs'; try { cur = localStorage.getItem(LK) || 'cs'; } catch (e) {}
  var LANGS = [['cs', 'C#'], ['py', 'Python'], ['js', 'JavaScript']];
  var blocks = [];
  function esc(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  var KW = {
    py: /\b(def|return|for|while|if|elif|else|in|not|and|or|import|from|as|class|lambda|with|try|except|finally|raise|yield|pass|break|continue|global|nonlocal|True|False|None|is|print|range|len|enumerate|sorted|set|dict|list|tuple)\b/g,
    js: /\b(function|return|for|while|if|else|in|of|new|class|const|let|var|do|switch|case|default|break|continue|try|catch|finally|throw|typeof|instanceof|this|true|false|null|undefined|console|Math|Array|Map|Set|parseInt|parseFloat)\b/g
  };
  // 주석/문자열을 먼저 표식으로 떼어 보호 -> 키워드/숫자 칠하기 -> 등장 순서대로 복원.
  // 표식 MARK 는 단어/숫자 경계가 아니라 키워드/숫자 정규식에 걸리지 않는다.
  var MARK = String.fromCharCode(1);
  function hl(code, lang) {
    var holds = [];
    function hold(cls, txt) { holds.push('<span class="' + cls + '">' + esc(txt) + '</span>'); return MARK; }
    var s = code;
    if (lang === 'py') {
      s = s.replace(/#[^\n]*/g, function (m) { return hold('cm', m); });
    } else {
      s = s.replace(/\/\/[^\n]*/g, function (m) { return hold('cm', m); })
           .replace(/\/\*[\s\S]*?\*\//g, function (m) { return hold('cm', m); });
    }
    s = s.replace(/"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`/g, function (m) { return hold('st', m); });
    s = esc(s);
    s = s.replace(KW[lang], '<span class="kw">$1</span>');
    s = s.replace(/\b\d+(?:\.\d+)?\b/g, '<span class="nm">$&</span>');
    var k = 0;
    return s.replace(new RegExp(MARK, 'g'), function () { return holds[k++]; });
  }
  document.querySelectorAll('.topic').forEach(function (t) {
    var pres = [].slice.call(t.querySelectorAll('pre')).filter(function (p) { return !p.closest('.quiz'); });
    pres.forEach(function (pre, i) {
      var d = CODE[t.id + '-' + i];
      if (!d || (!d.py && !d.js)) return;
      var clone = pre.cloneNode(true);
      [].slice.call(clone.querySelectorAll('.copy-btn')).forEach(function (b) { b.remove(); });
      var html = { cs: clone.innerHTML };
      if (d.py) html.py = hl(d.py, 'py');
      if (d.js) html.js = hl(d.js, 'js');
      var wrap = document.createElement('div'); wrap.className = 'mlcode';
      var tabs = document.createElement('div'); tabs.className = 'ml-tabs';
      var btns = {};
      LANGS.filter(function (L) { return html[L[0]]; }).forEach(function (L) {
        var b = document.createElement('button'); b.type = 'button'; b.textContent = L[1]; b.setAttribute('data-l', L[0]);
        b.addEventListener('click', function () { setLang(L[0]); });
        tabs.appendChild(b); btns[L[0]] = b;
      });
      var np = document.createElement('pre'); np.className = 'ml-pre';
      wrap.appendChild(tabs); wrap.appendChild(np);
      // 이미 '정답 코드 보기'(.codesol) 토글 안에 있는 코드는 또 접지 않고 다국어 탭만 보여줌.
      if (pre.closest('.codesol')) {
        pre.parentNode.replaceChild(wrap, pre);
      } else {
        // 그 외 예시 코드는 노션 토글처럼 접어 두고, 눌러서 펼친다
        var det = document.createElement('details'); det.className = 'ex-toggle';
        var sum = document.createElement('summary'); sum.innerHTML = '<span class="ex-ic">💻</span> 예시 코드 보기';
        det.appendChild(sum); det.appendChild(wrap);
        pre.parentNode.replaceChild(det, pre);
      }
      blocks.push({ pre: np, html: html, btns: btns });
    });
  });
  function setLang(l) {
    cur = l; try { localStorage.setItem(LK, l); } catch (e) {}
    blocks.forEach(function (bk) {
      var use = bk.html[l] ? l : 'cs';
      bk.pre.innerHTML = bk.html[use];
      Object.keys(bk.btns).forEach(function (k) { bk.btns[k].classList.toggle('on', k === use); });
    });
  }
  if (blocks.length) setLang(cur);
})();
