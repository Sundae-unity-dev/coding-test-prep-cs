/* 상단 공용 네비게이션 (전 페이지 단일 소스).
   각 페이지는 <nav class="sitenav"> 안에 빈 <div class="nav-links"></div> 만 두고 이 스크립트를 nav 직후에 동기 로드하면,
   아래 CT_NAV 배열에서 링크를 그려요. 메뉴를 바꿀 때 이 파일 한 곳만 고치면 돼요.
   현재 페이지는 location 으로 판별해 .on 을 자동으로 붙여요(SQL 은 개념정리(QA) 활성). */
(function () {
  var CT_NAV = [
    { href: 'guide.html', label: '준비 가이드' },
    { href: 'concepts.html', label: '개념 정리' },
    { href: 'qa.html', label: '개념정리(QA)' },
    { href: 'path.html', label: '학습 경로' },
    { href: 'practice.html', label: '예시 문제' },
    { href: 'gichul.html', label: '기출 문제' },
    { href: 'sql.html', label: 'SQL' },
    { href: 'templates.html', label: '템플릿' },
    { href: 'run/?mode=exam', label: '모의고사' }
  ];
  var box = document.querySelector('.sitenav .nav-links');
  if (!box) return;
  var page = (location.pathname.split('/').pop() || 'index.html');
  var onHref = page;
  box.innerHTML = CT_NAV.map(function (it) {
    return '<a' + (it.href === onHref ? ' class="on"' : '') + ' href="' + it.href + '">' + it.label + '</a>';
  }).join('');
})();
