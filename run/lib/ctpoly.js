// 런박스 다국어 실행 코디네이터 (메인 스레드).
// C# 은 Blazor 안의 Roslyn 으로 실행하고, 그 밖의 언어(Python 등)는 이 모듈이
// 워커(ctworker.js)에 위임한다. 무한 루프가 나면 워커를 terminate 해서 시간 초과로 돌려준다.
// Blazor 에서 JS interop 으로 호출한다: ctPoly.ensure / ctPoly.run / ctPoly.judge.
window.ctPoly = {
  _worker: null,
  _seq: 0,

  _ensureWorker: function () {
    if (!this._worker) {
      // base href 가 .../run/ 이므로 lib/ctworker.js 로 잡힌다.
      this._worker = new Worker('lib/ctworker.js');
    }
    return this._worker;
  },

  // 워커에 메시지를 보내고 응답(같은 id)을 기다린다. timeoutMs 안에 안 오면 워커를 죽이고 timeout 표시.
  _call: function (msg, timeoutMs) {
    var self = this;
    return new Promise(function (resolve) {
      var w = self._ensureWorker();
      var done = false;
      var to = setTimeout(function () {
        if (done) return;
        done = true;
        try { w.terminate(); } catch (e) {}
        self._worker = null; // 다음 호출 때 새 워커(런타임 재로딩 필요)
        resolve({ timeout: true });
      }, timeoutMs);
      var onMsg = function (e) {
        if (!e.data || e.data.id !== msg.id) return;
        done = true;
        clearTimeout(to);
        w.removeEventListener('message', onMsg);
        resolve(e.data);
      };
      w.addEventListener('message', onMsg);
      w.postMessage(msg);
    });
  },

  // 런타임 미리 로딩(첫 전환 시 수 MB 다운로드). 성공하면 true.
  ensure: async function (lang) {
    var r = await this._call({ id: ++this._seq, type: 'ensure', lang: lang }, 90000);
    return !r.timeout && !!r.ok;
  },

  // 백그라운드 예열: 페이지가 뜨면 미리 받아 둬서, 언어를 바꿀 때 기다리지 않게 한다.
  // C# 사용에는 영향을 주지 않도록 결과를 기다리지 않는다(워커가 별도 스레드).
  _warmed: {},
  warm: function (lang) {
    if (this._warmed[lang]) return;
    this._warmed[lang] = true;
    try { this.ensure(lang); } catch (e) {}
  },

  // 자유/직접 실행: { output, error } 를 JSON 문자열로 돌려준다.
  run: async function (lang, code, stdin) {
    var r = await this._call({ id: ++this._seq, type: 'run', lang: lang, code: code, stdin: stdin || '' }, 12000);
    if (r.timeout) return JSON.stringify({ output: '', error: '시간 초과예요. 무한 루프가 없는지 확인해 주세요.' });
    return JSON.stringify({ output: r.output || '', error: r.error || null });
  },

  // 채점: 테스트(JSON 문자열)로 전 케이스를 돌려 JudgeResult 모양의 JSON 문자열을 돌려준다.
  judge: async function (lang, code, testsJson) {
    var tests = JSON.parse(testsJson);
    var r = await this._call({ id: ++this._seq, type: 'judge', lang: lang, code: code, tests: tests }, 25000);
    if (r.timeout) {
      return JSON.stringify({ allPassed: false, passed: 0, total: tests.length, cases: [], compileError: '시간 초과예요. 무한 루프이거나 너무 오래 걸리는 풀이일 수 있어요.' });
    }
    if (r.error) {
      return JSON.stringify({ allPassed: false, passed: 0, total: tests.length, cases: [], compileError: r.error });
    }
    return JSON.stringify(r.result);
  }
};
