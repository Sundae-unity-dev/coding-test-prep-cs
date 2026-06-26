/* 시험 D-day 목표 + 학습 페이스.
   목표일(ct_goal_v1)을 정하면 남은 날과 남은 문제로 "하루 N문제" 페이스를 보여줘요.
   index 와 progress 가 같은 ctGoal.render(el, solved, total) 를 호출해요(단일 소스). */
(function () {
  var KEY = 'ct_goal_v1';
  function read() { try { return JSON.parse(localStorage.getItem(KEY)) || null; } catch (e) { return null; } }
  function write(v) { try { localStorage.setItem(KEY, JSON.stringify(v)); } catch (e) {} }
  function todayMid() { var d = new Date(); d.setHours(0, 0, 0, 0); return d; }
  function ymd(d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }

  function daysLeft() {
    var g = read(); if (!g || !g.date) return null;
    var t = new Date(g.date + 'T00:00:00');
    return Math.round((t - todayMid()) / 86400000);
  }

  function render(el, solved, total) {
    if (!el) return;
    var g = read();
    var minDate = ymd(todayMid());

    if (!g || !g.date) {
      el.className = 'goalbar empty';
      el.innerHTML = '<span class="gb-msg">🎯 시험 목표일을 정하면 매일 풀어야 할 문제 수를 알려드려요.</span>'
        + '<span class="gb-edit-wrap"><input type="date" class="gb-date" min="' + minDate + '"><button type="button" class="gb-save">목표 설정</button></span>';
      wire(el, solved, total);
      return;
    }

    var dl = daysLeft();
    var remaining = Math.max(0, total - solved);
    var perday = dl > 0 ? Math.ceil(remaining / dl) : remaining;
    var ddText = dl > 0 ? ('D-' + dl) : (dl === 0 ? 'D-day' : ('D+' + (-dl)));
    var pace;
    if (remaining === 0) pace = '예시 문제를 모두 풀었어요. 기출과 모의고사로 마무리해요.';
    else if (dl > 0) pace = '남은 문제 ' + remaining + ' / ' + dl + '일 → 하루 ' + perday + '문제면 충분해요.';
    else if (dl === 0) pace = '오늘이 목표일이에요. 남은 ' + remaining + '문제, 마지막 점검해요.';
    else pace = '목표일이 지났어요. 새 목표일을 정하거나 계속 풀어요. (남은 ' + remaining + '문제)';

    el.className = 'goalbar' + (dl !== null && dl <= 3 && remaining > 0 ? ' urgent' : '');
    el.innerHTML = '<span class="gb-dday">' + ddText + '</span>'
      + '<span class="gb-info"><b>' + g.date + '</b> 목표 · ' + pace + '</span>'
      + '<span class="gb-actions"><button type="button" class="gb-edit">변경</button><button type="button" class="gb-clear">해제</button></span>'
      + '<span class="gb-edit-wrap" hidden><input type="date" class="gb-date" min="' + minDate + '" value="' + g.date + '"><button type="button" class="gb-save">저장</button></span>';
    wire(el, solved, total);
  }

  function wire(el, solved, total) {
    var save = el.querySelector('.gb-save'), dateIn = el.querySelector('.gb-date');
    var edit = el.querySelector('.gb-edit'), clear = el.querySelector('.gb-clear');
    var wrap = el.querySelector('.gb-edit-wrap');
    if (edit) edit.addEventListener('click', function () { if (wrap) wrap.hidden = false; if (dateIn) dateIn.focus(); });
    if (clear) clear.addEventListener('click', function () { try { localStorage.removeItem(KEY); } catch (e) {} render(el, solved, total); });
    if (save) save.addEventListener('click', function () {
      var v = dateIn && dateIn.value;
      if (!v) { if (dateIn) dateIn.focus(); return; }
      write({ date: v });
      render(el, solved, total);
    });
  }

  window.ctGoal = { get: read, set: function (d) { write({ date: d }); }, clear: function () { try { localStorage.removeItem(KEY); } catch (e) {} }, daysLeft: daysLeft, render: render };
})();
