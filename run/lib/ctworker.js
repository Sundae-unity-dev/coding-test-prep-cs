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
  return loadPyodide({ indexURL: PYODIDE_BASE }).then(function (p) { PY = p; });
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

function ensure(lang) {
  if (lang === 'python') return ensurePython();
  return Promise.reject(new Error('아직 준비되지 않은 언어예요: ' + lang));
}

self.onmessage = function (e) {
  var m = e.data, id = m.id;
  ensure(m.lang).then(function () {
    if (m.type === 'ensure') {
      self.postMessage({ id: id, ok: true });
    } else if (m.type === 'run') {
      if (m.lang === 'python') {
        var r = runPython(m.code, m.stdin);
        self.postMessage({ id: id, output: r.output, error: r.error });
      }
    } else if (m.type === 'judge') {
      if (m.lang === 'python') {
        self.postMessage({ id: id, result: judgePython(m.code, m.tests) });
      }
    }
  }).catch(function (err) {
    self.postMessage({ id: id, error: String((err && err.message) || err) });
  });
};
