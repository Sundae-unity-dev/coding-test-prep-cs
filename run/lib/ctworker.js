// 런박스 다국어 실행 워커.
// 메인 스레드(ctpoly.js)가 보낸 사용자 코드를 받아 격리된 워커 안에서 실행한다.
// 무한 루프가 나면 메인 스레드가 이 워커를 terminate 해서 탭이 멈추지 않게 한다.
// 현재 지원: Python(Pyodide). JavaScript/Java 는 추후 분기 추가.

var PY = null;
var PYODIDE_VERSION = 'v0.27.2';
var PYODIDE_BASE = 'https://cdn.jsdelivr.net/pyodide/' + PYODIDE_VERSION + '/full/';

function ensurePython() {
  if (PY) return Promise.resolve();
  importScripts(PYODIDE_BASE + 'pyodide.js');
  return loadPyodide({ indexURL: PYODIDE_BASE }).then(function (p) {
    PY = p;
    // 워밍업: 자주 쓰는 표준 라이브러리와 실행 경로를 한 번 미리 돌려 둔다.
    // 이렇게 해두면 첫 채점에서 추가 로딩 없이 곧바로 실행된다(한 번 받으면 바로 진행).
    try {
      PY.runPython('import sys, io, heapq, math, collections, bisect, itertools, functools, re');
      runPython('print(1)', '');
    } catch (e) {}
  });
}

// 사용자 Python 코드를 새 네임스페이스에서 실행한다.
// stdin 은 주입하고 stdout 은 캡처한다. 예외 메시지는 따로 돌려준다.
var PY_HARNESS = [
  "import sys, io",
  "__buf = io.StringIO()",
  "__old_out = sys.stdout",
  "__old_in = sys.stdin",
  "sys.stdout = __buf",
  "sys.stdin = io.StringIO(__stdin)",
  "__err = None",
  "try:",
  "    __ns = {'__name__': '__main__'}",
  "    exec(__code, __ns)",
  "except SystemExit:",
  "    pass",
  "except BaseException as e:",
  "    import traceback",
  "    __err = (''.join(traceback.format_exception_only(type(e), e))).strip()",
  "finally:",
  "    sys.stdout = __old_out",
  "    sys.stdin = __old_in",
  "__out = __buf.getvalue()"
].join("\n");

function runPython(code, stdin) {
  PY.globals.set('__code', code);
  PY.globals.set('__stdin', stdin || '');
  PY.runPython(PY_HARNESS);
  var out = PY.globals.get('__out');
  var err = PY.globals.get('__err');
  return {
    output: out == null ? '' : String(out),
    error: err == null ? null : String(err)
  };
}

// 채점/비교 정규화: 각 줄 끝 공백 제거 후 전체 trim (C# CodeRunner.Normalize 와 동일).
function norm(s) {
  s = (s == null ? '' : String(s)).replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  return s.split('\n').map(function (l) { return l.replace(/\s+$/, ''); }).join('\n').trim();
}

function isSyntaxErr(msg) {
  return !!msg && /SyntaxError|IndentationError|TabError/.test(msg);
}

function judgePython(code, tests) {
  var cases = [], passed = 0;
  for (var i = 0; i < tests.length; i++) {
    var t = tests[i];
    var r = runPython(code, t.input);
    // 문법 오류면 전체를 컴파일 오류로 처리(케이스별 표시 대신 한 번에 안내)
    if (i === 0 && isSyntaxErr(r.error)) {
      return { allPassed: false, passed: 0, total: tests.length, cases: [], compileError: r.error };
    }
    var ok = !r.error && norm(r.output) === norm(t.expected);
    if (ok) passed++;
    cases.push({
      index: i + 1, passed: ok, sample: !!t.sample,
      input: t.input, expected: t.expected,
      actual: r.output || '', error: r.error
    });
  }
  return { allPassed: passed === tests.length, passed: passed, total: tests.length, cases: cases, compileError: null };
}

// ===== JavaScript =====
// node 환경을 흉내낸다: require('fs').readFileSync(0,'utf8') 로 stdin, console.log 로 출력.
// 이렇게 해야 사이트에서의 실행과 로컬 node 검증이 같은 코드로 동작한다.
function runJs(code, stdin) {
  var out = [];
  function emit(args) {
    var parts = [];
    for (var i = 0; i < args.length; i++) parts.push(String(args[i]));
    out.push(parts.join(' ') + '\n');
  }
  var fakeConsole = {
    log: function () { emit(arguments); },
    error: function () {}, warn: function () {}, info: function () {}, debug: function () {}
  };
  var fakeProcess = {
    stdout: { write: function (s) { out.push(String(s)); } },
    stderr: { write: function () {} },
    argv: ['node', 'main.js'], env: {}, exit: function () {}
  };
  function fakeRequire(m) {
    if (m === 'fs') return { readFileSync: function () { return stdin || ''; } };
    throw new Error("이 실행기는 require('" + m + "') 를 지원하지 않아요. 입력은 require('fs').readFileSync(0, 'utf8') 로 받으세요.");
  }
  // require/console/process 만 주입한다. input/print 같은 흔한 변수명을 매개변수로 넣으면
  // 사용자 코드의 `const input = ...` 선언과 충돌(strict 모드 SyntaxError)하므로 넣지 않는다.
  try {
    var fn = new Function('require', 'console', 'process', '"use strict";\n' + code);
    fn(fakeRequire, fakeConsole, fakeProcess);
  } catch (e) {
    return { output: out.join(''), error: (e && e.message) ? e.message : String(e) };
  }
  return { output: out.join(''), error: null };
}

function judgeJs(code, tests) {
  // 문법 오류는 전체 컴파일 오류로 한 번에 안내
  try { new Function('"use strict";\n' + code); }
  catch (e) { if (e instanceof SyntaxError) return { allPassed: false, passed: 0, total: tests.length, cases: [], compileError: e.message }; }
  var cases = [], passed = 0;
  for (var i = 0; i < tests.length; i++) {
    var t = tests[i];
    var r = runJs(code, t.input);
    var ok = !r.error && norm(r.output) === norm(t.expected);
    if (ok) passed++;
    cases.push({ index: i + 1, passed: ok, sample: !!t.sample, input: t.input, expected: t.expected, actual: r.output || '', error: r.error });
  }
  return { allPassed: passed === tests.length, passed: passed, total: tests.length, cases: cases, compileError: null };
}

function ensure(lang) {
  if (lang === 'python') return ensurePython();
  if (lang === 'javascript') return Promise.resolve();  // 브라우저 내장이라 받을 게 없음
  return Promise.reject(new Error('아직 준비되지 않은 언어예요: ' + lang));
}

self.onmessage = function (e) {
  var m = e.data, id = m.id;
  ensure(m.lang).then(function () {
    if (m.type === 'ensure') {
      self.postMessage({ id: id, ok: true });
    } else if (m.type === 'run') {
      var r = m.lang === 'python' ? runPython(m.code, m.stdin) : runJs(m.code, m.stdin);
      self.postMessage({ id: id, output: r.output, error: r.error });
    } else if (m.type === 'judge') {
      var result = m.lang === 'python' ? judgePython(m.code, m.tests) : judgeJs(m.code, m.tests);
      self.postMessage({ id: id, result: result });
    }
  }).catch(function (err) {
    self.postMessage({ id: id, error: String((err && err.message) || err) });
  });
};
