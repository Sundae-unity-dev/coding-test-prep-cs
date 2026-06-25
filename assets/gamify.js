/* Elice Coding Camp - 게이미피케이션 엔진 (XP / 레벨 / 일일 목표 / 배지 / 스트릭 프리즈 / 토스트)
   설계: 기존 localStorage 기록(푼 문제/퀴즈/모의고사/활동)에서 결정적으로 계산(소급 적용).
   서버 불필요. 어느 페이지든 로드 시 1회 reconcile 후 window.ctGamify 로 요약 제공. */
(function () {
  'use strict';

  // ===== XP 규칙(튜닝 가능) =====
  var TIER_XP = { '입문': 10, '기초': 15, '중급': 25, '심화': 40 };
  var DEFAULT_TIER_XP = 10;   // 난이도 정보 없을 때
  var QUIZ_XP = 5;            // 개념 퀴즈 정답 1개
  var EXAM_BASE = 20;         // 모의고사 1회
  var EXAM_PER_CORRECT = 2;   // 모의고사 정답 1개당
  var FREEZE_CAP = 3;         // 스트릭 프리즈 최대 보유

  // ===== 유틸 =====
  function readObj(k) { try { return JSON.parse(localStorage.getItem(k)) || {}; } catch (e) { return {}; } }
  function readArr(k) { try { var v = JSON.parse(localStorage.getItem(k)); return Array.isArray(v) ? v : []; } catch (e) { return []; } }
  function write(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function ymd(d) { d = d || new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  function today() { return (window.ctToday ? window.ctToday() : ymd()); }
  function problemsMap() { var m = {}; (window.CT_PROBLEMS || []).forEach(function (p) { m[p.id] = p; }); return m; }

  // ===== 정준 기록 소스 =====
  function solvedIds() { var s = readObj('ct_practice_solved_v1'); return Object.keys(s).filter(function (k) { return s[k]; }); }
  function quizCorrectIds() {
    // 개념정리 퀴즈(qN-M) + 학습경로 미니퀴즈(tN-i). 키 패턴이 달라 충돌하지 않는다.
    var ids = [];
    var q = readObj('ct_concepts_quiz_v1');
    Object.keys(q).forEach(function (k) { var v = q[k]; if (v === true || (v && v.correct)) ids.push(k); });
    var p = readObj('ct_path_quiz_v1');
    Object.keys(p).forEach(function (k) { var v = p[k]; if (v === true || (v && v.correct)) ids.push(k); });
    return ids;
  }
  function exams() { return readArr('ct_exam_history_v1'); }
  function activity() { return readObj('ct_activity_v1'); }

  // ===== 누적 XP(결정적) =====
  function lifetimeXp() {
    var pm = problemsMap(), xp = 0;
    solvedIds().forEach(function (id) { var p = pm[id]; xp += (p && TIER_XP[p.lv]) || DEFAULT_TIER_XP; });
    xp += quizCorrectIds().length * QUIZ_XP;
    exams().forEach(function (e) { xp += EXAM_BASE + (e.P || 0) * EXAM_PER_CORRECT; });
    return xp;
  }

  // ===== 레벨/칭호 =====
  function levelInfo(xp) {
    var lv = Math.floor(Math.sqrt(xp / 50)) + 1;
    var base = 50 * (lv - 1) * (lv - 1);
    var next = 50 * lv * lv;
    var title = lv <= 1 ? '코딩 새내기'
      : lv <= 3 ? '루키'
      : lv <= 5 ? '챌린저'
      : lv <= 7 ? '에이스'
      : lv <= 9 ? '마스터' : '그랜드마스터';
    var span = next - base;
    return { level: lv, title: title, xpInLevel: xp - base, xpForNext: span, levelPct: span ? Math.round((xp - base) / span * 100) : 0 };
  }

  // ===== 스트릭(+프리즈) =====
  // 하루 공백을 보유 프리즈로 메워 연속을 잇는다. 소비한 날짜는 기록해 중복 차감 방지.
  function computeStreak() {
    var act = activity();
    var fz = readObj('ct_streak_freeze_v1');
    var used = Array.isArray(fz.used) ? fz.used.slice() : [];
    var prevUsedN = used.length;
    var usedSet = {}; used.forEach(function (x) { usedSet[x] = 1; });

    // 프리즈 없이 본 연속(적립 기준)
    function rawFrom() {
      var d = new Date(); if (!act[ymd(d)]) d.setDate(d.getDate() - 1);
      var s = 0; while (act[ymd(d)]) { s++; d.setDate(d.getDate() - 1); } return s;
    }
    var raw = rawFrom();
    var prevMax = fz.max || 0;
    var newMax = Math.max(prevMax, raw);
    var earned = Math.min(FREEZE_CAP, Math.floor(newMax / 7));
    var avail = Math.max(0, earned - used.length);

    // 프리즈로 단일 공백을 메우며 다시 스캔
    var d = new Date(); if (!act[ymd(d)]) d.setDate(d.getDate() - 1);
    var s = 0;
    while (true) {
      var key = ymd(d);
      if (act[key]) { s++; d.setDate(d.getDate() - 1); continue; }
      if (usedSet[key]) { s++; d.setDate(d.getDate() - 1); continue; } // 이미 메운 날
      var prev = new Date(d); prev.setDate(prev.getDate() - 1);
      if (avail > 0 && act[ymd(prev)]) { // 공백 다음(과거)에 활동이 있으면 메움
        avail--; used.push(key); usedSet[key] = 1; s++; d.setDate(d.getDate() - 1); continue;
      }
      break;
    }
    newMax = Math.max(newMax, s);
    // 값이 실제로 바뀐 경우에만 기록(읽기성 summary 가 호출마다 디스크에 쓰지 않도록)
    if (newMax !== prevMax || used.length !== prevUsedN) write('ct_streak_freeze_v1', { max: newMax, used: used });
    var freezesLeft = Math.max(0, Math.min(FREEZE_CAP, Math.floor(newMax / 7)) - used.length);
    return { streak: s, freezes: freezesLeft };
  }

  // ===== 오늘 XP 원장(일일 목표용) =====
  // 정준 기록과 스냅샷을 diff 해 새로 완료된 항목 XP를 오늘에 가산.
  // 최초 실행은 스냅샷만 시드(과거분을 오늘로 몰지 않음). 누적 XP는 별도 결정적 계산이라 손실 없음.
  function reconcile() {
    var seen = readObj('ct_xp_seen_v1');
    var curSolved = solvedIds(), curQuiz = quizCorrectIds(), curExams = exams().length;
    if (!seen.init) {
      write('ct_xp_seen_v1', { init: true, solved: curSolved, quiz: curQuiz, exams: curExams });
      return;
    }
    var pm = problemsMap(), add = 0, newSolved = 0, newQuiz = 0;
    var ps = {}; (seen.solved || []).forEach(function (x) { ps[x] = 1; });
    curSolved.forEach(function (id) { if (!ps[id]) { var p = pm[id]; add += (p && TIER_XP[p.lv]) || DEFAULT_TIER_XP; newSolved++; } });
    var pq = {}; (seen.quiz || []).forEach(function (x) { pq[x] = 1; });
    curQuiz.forEach(function (id) { if (!pq[id]) { add += QUIZ_XP; newQuiz++; } });
    if (curExams > (seen.exams || 0)) add += (curExams - (seen.exams || 0)) * EXAM_BASE;
    var t = today();
    if (add > 0) { var log = readObj('ct_xp_log_v1'); log[t] = (log[t] || 0) + add; write('ct_xp_log_v1', log); }
    // 오늘의 퀘스트용: 새로 완료된 문제/퀴즈 수를 날짜별로 적립(날짜 키라 자동으로 매일 리셋)
    if (newSolved > 0 || newQuiz > 0) {
      var ql = readObj('ct_quest_log_v1'), q = ql[t] || { solved: 0, quiz: 0 };
      q.solved += newSolved; q.quiz += newQuiz; ql[t] = q; write('ct_quest_log_v1', ql);
    }
    write('ct_xp_seen_v1', { init: true, solved: curSolved, quiz: curQuiz, exams: curExams });
  }

  // ===== 배지 =====
  function context() {
    var pm = problemsMap();
    var tierTotal = { '입문': 0, '기초': 0, '중급': 0, '심화': 0 }, tierSolved = { '입문': 0, '기초': 0, '중급': 0, '심화': 0 };
    var nonGTotal = 0;
    (window.CT_PROBLEMS || []).forEach(function (p) { if (!p.g) { nonGTotal++; if (tierTotal[p.lv] !== undefined) tierTotal[p.lv]++; } });
    var sm = {}; solvedIds().forEach(function (id) { sm[id] = 1; });
    var nonGSolved = 0;
    (window.CT_PROBLEMS || []).forEach(function (p) { if (!p.g && sm[p.id]) { nonGSolved++; if (tierSolved[p.lv] !== undefined) tierSolved[p.lv]++; } });
    var exs = exams();
    return {
      tierTotal: tierTotal, tierSolved: tierSolved,
      totalSolved: solvedIds().length, nonGSolved: nonGSolved, nonGTotal: nonGTotal,
      quizCorrect: quizCorrectIds().length, examCount: exs.length,
      examPerfect: exs.some(function (e) { return e.N > 0 && e.P === e.N; }),
      streak: computeStreak().streak
    };
  }

  var BADGES = [
    { id: 'first', e: '🎯', t: '첫 문제 해결', d: '첫 문제를 풀었어요', test: function (c) { return c.totalSolved >= 1; } },
    { id: 'intro', e: '🌱', t: '입문 마스터', d: '입문 문제를 모두 풀었어요', test: function (c) { return c.tierTotal['입문'] > 0 && c.tierSolved['입문'] >= c.tierTotal['입문']; } },
    { id: 'basic', e: '🪴', t: '기초 마스터', d: '기초 문제를 모두 풀었어요', test: function (c) { return c.tierTotal['기초'] > 0 && c.tierSolved['기초'] >= c.tierTotal['기초']; } },
    { id: 'mid', e: '🌳', t: '중급 마스터', d: '중급 문제를 모두 풀었어요', test: function (c) { return c.tierTotal['중급'] > 0 && c.tierSolved['중급'] >= c.tierTotal['중급']; } },
    { id: 'hard', e: '🏔️', t: '심화 마스터', d: '심화 문제를 모두 풀었어요', test: function (c) { return c.tierTotal['심화'] > 0 && c.tierSolved['심화'] >= c.tierTotal['심화']; } },
    { id: 'streak3', e: '🔥', t: '3일 연속', d: '3일 연속 학습', test: function (c) { return c.streak >= 3; } },
    { id: 'streak7', e: '🔥', t: '7일 연속', d: '일주일 연속 학습', test: function (c) { return c.streak >= 7; } },
    { id: 'streak14', e: '⚡', t: '14일 연속', d: '2주 연속 학습', test: function (c) { return c.streak >= 14; } },
    { id: 'streak30', e: '👑', t: '30일 연속', d: '한 달 연속 학습', test: function (c) { return c.streak >= 30; } },
    { id: 'quiz10', e: '📘', t: '퀴즈 10개', d: '개념 퀴즈 10개 정답', test: function (c) { return c.quizCorrect >= 10; } },
    { id: 'quiz30', e: '📚', t: '퀴즈 30개', d: '개념 퀴즈 30개 정답', test: function (c) { return c.quizCorrect >= 30; } },
    { id: 'exam1', e: '📝', t: '첫 모의고사', d: '모의고사에 처음 응시', test: function (c) { return c.examCount >= 1; } },
    { id: 'examperfect', e: '💯', t: '모의고사 만점', d: '모의고사에서 만점', test: function (c) { return c.examPerfect; } },
    { id: 'solve25', e: '⭐', t: '25문제 해결', d: '문제 25개 해결', test: function (c) { return c.totalSolved >= 25; } },
    { id: 'solveall', e: '🏆', t: '올 클리어', d: '예시 문제를 모두 해결', test: function (c) { return c.nonGTotal > 0 && c.nonGSolved >= c.nonGTotal; } }
  ];

  // ===== 토스트 =====
  function toast(emoji, title, desc) {
    if (!document.body) return;
    var host = document.getElementById('ctToastHost');
    if (!host) { host = document.createElement('div'); host.id = 'ctToastHost'; host.className = 'ct-toasts'; document.body.appendChild(host); }
    var el = document.createElement('div');
    el.className = 'ct-toast';
    el.innerHTML = '<span class="ct-toast-e">' + emoji + '</span><span class="ct-toast-tx"><b></b><span></span></span>';
    el.querySelector('b').textContent = title;
    el.querySelector('.ct-toast-tx span').textContent = desc || '';
    host.appendChild(el);
    requestAnimationFrame(function () { el.classList.add('in'); });
    setTimeout(function () { el.classList.remove('in'); setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 400); }, 4200);
  }

  // ===== 요약 =====
  function summary() {
    var xp = lifetimeXp(), li = levelInfo(xp), st = computeStreak();
    var log = readObj('ct_xp_log_v1'), todayXp = log[today()] || 0;
    var ql = readObj('ct_quest_log_v1'), qToday = ql[today()] || { solved: 0, quiz: 0 };
    var goal = parseInt(localStorage.getItem('ct_daily_goal_v1') || '20', 10) || 20;
    var earned = readObj('ct_badges_v1');
    var badges = BADGES.map(function (b) { return { id: b.id, e: b.e, t: b.t, d: b.d, earned: earned[b.id] || null }; });
    return {
      xp: xp, level: li.level, levelTitle: li.title, xpInLevel: li.xpInLevel, xpForNext: li.xpForNext, levelPct: li.levelPct,
      streak: st.streak, freezes: st.freezes, todayXp: todayXp, dailyGoal: goal, goalMet: todayXp >= goal,
      todaySolved: qToday.solved || 0, todayQuiz: qToday.quiz || 0,
      badges: badges, earnedCount: badges.filter(function (b) { return b.earned; }).length, totalBadges: BADGES.length
    };
  }

  function setDailyGoal(n) { n = Math.max(5, Math.min(200, parseInt(n, 10) || 20)); try { localStorage.setItem('ct_daily_goal_v1', String(n)); } catch (e) {} return n; }

  // 주간 XP(공개 리더보드용). ISO 주 단위.
  function isoWeek(d) {
    d = d || new Date();
    var t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    var day = t.getUTCDay() || 7;
    t.setUTCDate(t.getUTCDate() + 4 - day);
    var ys = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
    var wk = Math.ceil((((t - ys) / 86400000) + 1) / 7);
    return t.getUTCFullYear() + '-W' + String(wk).padStart(2, '0');
  }
  function weekly() {
    var log = readObj('ct_xp_log_v1'), wk = isoWeek(), sum = 0;
    Object.keys(log).forEach(function (d) {
      var p = d.split('-');
      if (p.length === 3 && isoWeek(new Date(+p[0], +p[1] - 1, +p[2])) === wk) sum += log[d];
    });
    return { weekKey: wk, weekXp: sum, totalXp: lifetimeXp() };
  }

  // ===== 로드 시 1회 실행: reconcile + 배지 평가 + 토스트 알림(중복 방지) =====
  function run() {
    reconcile();
    var ctx = context();
    var earned = readObj('ct_badges_v1'), newly = [];
    BADGES.forEach(function (b) { if (!earned[b.id] && b.test(ctx)) { earned[b.id] = new Date().toISOString(); newly.push(b); } });
    if (newly.length) write('ct_badges_v1', earned);

    var ann = readObj('ct_gamify_announce_v1');
    newly.forEach(function (b) { toast(b.e, '배지 획득: ' + b.t, b.d); });
    var s = summary();
    if (s.goalMet && ann.goalDay !== today()) { toast('✅', '오늘 목표 달성!', '잘하고 있어요'); ann.goalDay = today(); }
    var ms = [3, 7, 14, 30].filter(function (m) { return s.streak >= m; }).pop() || 0;
    if (ms > (ann.streakMs || 0)) { toast('🔥', ms + '일 연속 학습!', '불꽃을 이어가요'); ann.streakMs = ms; }
    write('ct_gamify_announce_v1', ann);
  }

  window.ctGamify = { summary: summary, setDailyGoal: setDailyGoal, computeStreak: computeStreak, lifetimeXp: lifetimeXp, weekly: weekly, isoWeek: isoWeek, BADGES: BADGES, _run: run };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
  else run();
})();
