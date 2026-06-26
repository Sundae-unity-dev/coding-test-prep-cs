/* SQL 연습 데이터 + 문제 (sql.html 에서 sql.js 로 실행/채점).
   schema = 브라우저 SQLite 에 올릴 CREATE/INSERT. problems[].answer 를 실행한 결과를 정답으로 삼아 비교해요. */
window.CT_SQL = {
  setup: [
    "CREATE TABLE members (id INTEGER PRIMARY KEY, name TEXT, grade TEXT, city TEXT, joined TEXT);",
    "INSERT INTO members VALUES",
    "(1,'김하늘','골드','서울','2023-01-05'),",
    "(2,'이준호','실버','부산','2023-03-12'),",
    "(3,'박서연','일반','서울','2023-05-20'),",
    "(4,'최민준','골드','대구','2022-11-02'),",
    "(5,'정유진','실버','서울','2023-07-15'),",
    "(6,'강도윤','일반','인천','2023-02-28'),",
    "(7,'윤서아','골드','부산','2022-09-10'),",
    "(8,'임지후','일반','대구','2023-08-01'),",
    "(9,'한예린','실버','서울','2023-04-22'),",
    "(10,'오시우','일반','인천','2023-06-30');",
    "CREATE TABLE orders (id INTEGER PRIMARY KEY, member_id INTEGER, product TEXT, amount INTEGER, status TEXT, ordered_at TEXT);",
    "INSERT INTO orders VALUES",
    "(1,1,'키보드',45000,'완료','2023-09-01'),",
    "(2,1,'마우스',25000,'완료','2023-09-15'),",
    "(3,2,'모니터',230000,'완료','2023-09-03'),",
    "(4,3,'노트북',980000,'배송중','2023-09-20'),",
    "(5,4,'키보드',45000,'완료','2023-09-05'),",
    "(6,4,'헤드셋',89000,'완료','2023-09-18'),",
    "(7,4,'마우스패드',15000,'취소','2023-09-22'),",
    "(8,5,'웹캠',60000,'완료','2023-09-08'),",
    "(9,6,'USB허브',32000,'완료','2023-09-11'),",
    "(10,7,'모니터',230000,'완료','2023-09-02'),",
    "(11,7,'키보드',45000,'취소','2023-09-25'),",
    "(12,2,'마우스',25000,'완료','2023-09-28'),",
    "(13,9,'노트북',1200000,'완료','2023-09-12'),",
    "(14,1,'헤드셋',89000,'배송중','2023-09-29'),",
    "(15,5,'키보드',45000,'완료','2023-09-30'),",
    "(16,4,'모니터',230000,'완료','2023-10-01'),",
    "(17,3,'마우스',25000,'완료','2023-10-02'),",
    "(18,8,'웹캠',60000,'완료','2023-10-03');"
  ].join("\n"),
  problems: [
    {
      id: "all-members", title: "전체 회원 조회", level: "intro", ordered: true,
      prompt: "members 테이블의 모든 회원을 id 오름차순으로 모든 컬럼을 조회하세요.",
      hint: "SELECT * 와 ORDER BY 를 사용해요.",
      answer: "SELECT * FROM members ORDER BY id;"
    },
    {
      id: "gold-names", title: "골드 회원 이름", level: "intro", ordered: false,
      prompt: "등급(grade)이 '골드'인 회원의 이름(name)만 조회하세요.",
      hint: "WHERE grade = '골드' 로 거르고 name 만 SELECT 해요.",
      answer: "SELECT name FROM members WHERE grade = '골드';"
    },
    {
      id: "big-orders", title: "고액 주문", level: "basic", ordered: false,
      prompt: "주문 금액(amount)이 30000 이상인 주문의 id 와 amount 를 조회하세요.",
      hint: "비교 연산자 >= 를 WHERE 에 사용해요.",
      answer: "SELECT id, amount FROM orders WHERE amount >= 30000;"
    },
    {
      id: "city-count", title: "도시별 회원 수", level: "basic", ordered: false,
      prompt: "도시(city)별 회원 수를 구하세요. 결과 컬럼은 city 와 회원 수 두 개예요.",
      hint: "GROUP BY city 와 COUNT(*) 를 써요.",
      answer: "SELECT city, COUNT(*) AS cnt FROM members GROUP BY city;"
    },
    {
      id: "member-total", title: "회원별 완료 주문 합계", level: "mid", ordered: false,
      prompt: "상태(status)가 '완료'인 주문만 합산해, 회원 이름(name)과 그 회원의 완료 주문 금액 합계를 조회하세요. 완료 주문이 있는 회원만 나오면 돼요.",
      hint: "members 와 orders 를 JOIN 하고, WHERE 로 완료만 거른 뒤 회원별로 GROUP BY 해서 SUM 해요.",
      answer: "SELECT m.name, SUM(o.amount) AS total FROM members m JOIN orders o ON m.id = o.member_id WHERE o.status = '완료' GROUP BY m.id, m.name;"
    },
    {
      id: "top-order", title: "가장 비싼 주문", level: "mid", ordered: true,
      prompt: "금액이 가장 큰 주문 1건에 대해, 주문한 회원의 이름(name)과 주문 금액(amount)을 조회하세요.",
      hint: "JOIN 후 ORDER BY amount DESC LIMIT 1 을 써요.",
      answer: "SELECT m.name, o.amount FROM members m JOIN orders o ON m.id = o.member_id ORDER BY o.amount DESC LIMIT 1;"
    },
    {
      id: "no-orders", title: "주문 없는 회원", level: "hard", ordered: false,
      prompt: "주문을 한 번도 하지 않은 회원의 이름(name)을 조회하세요.",
      hint: "orders 에 없는 member 를 NOT IN 또는 LEFT JOIN ... IS NULL 로 찾아요.",
      answer: "SELECT name FROM members WHERE id NOT IN (SELECT member_id FROM orders);"
    },
    {
      id: "vip", title: "완료 합계 5만 이상 회원", level: "hard", ordered: false,
      prompt: "상태가 '완료'인 주문 금액 합계가 50000 이상인 회원의 이름(name)을 조회하세요.",
      hint: "GROUP BY 뒤 HAVING SUM(amount) >= 50000 으로 그룹을 걸러요.",
      answer: "SELECT m.name FROM members m JOIN orders o ON m.id = o.member_id WHERE o.status = '완료' GROUP BY m.id, m.name HAVING SUM(o.amount) >= 50000;"
    }
  ]
};
