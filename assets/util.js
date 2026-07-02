/* 공용 유틸리티 (모든 페이지 공통).
   여러 파일에 복붙돼 있던 소형 헬퍼(ymd/todayMid/esc/localStorage)를 한 곳에 모았어요.
   각 파일은 로컬 이름을 이 함수들에 별칭으로 연결해 씁니다 (예: var ymd = ctUtil.ymd;).
   의존성이 없고 크기가 작아, 모든 소비 스크립트보다 먼저 <head> 에서 로드해요. */
(function () {
  function pad2(n) { return String(n).padStart(2, '0'); }
  window.ctUtil = {
    // 로컬 시간 기준 YYYY-MM-DD (인자 없으면 오늘)
    ymd: function (d) { d = d || new Date(); return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()); },
    // 오늘 자정(0시) Date
    todayMid: function () { var d = new Date(); d.setHours(0, 0, 0, 0); return d; },
    // HTML 이스케이프 (& < > " ' 상위집합 - 텍스트/속성 양쪽에서 안전)
    esc: function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]; }); },
    // JSON localStorage 읽기(없거나 실패 시 fallback) / 쓰기
    lsGet: function (key, fallback) { try { var v = localStorage.getItem(key); return v == null ? fallback : JSON.parse(v); } catch (e) { return fallback; } },
    lsSet: function (key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) {} }
  };
})();
