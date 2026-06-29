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
    "(18,8,'웹캠',60000,'완료','2023-10-03');",
    "CREATE TABLE reviews (id INTEGER PRIMARY KEY, order_id INTEGER, rating INTEGER, content TEXT);",
    "INSERT INTO reviews VALUES",
    "(1,1,5,'타건감이 좋아요'),",
    "(2,2,4,'가볍고 편해요'),",
    "(3,3,5,'화면이 선명해요'),",
    "(4,5,3,'무난해요'),",
    "(5,6,4,'착용감이 좋아요'),",
    "(6,8,5,'화질이 만족스러워요'),",
    "(7,9,4,'포트가 넉넉해요'),",
    "(8,10,2,'생각보다 별로예요'),",
    "(9,12,4,'재구매 의사 있어요'),",
    "(10,13,5,'성능이 최고예요'),",
    "(11,15,3,'평범해요'),",
    "(12,18,4,'선명하고 좋아요');"
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
    },
    {
      id: "cancelled", title: "취소된 주문", level: "basic", ordered: false,
      prompt: "상태(status)가 '취소'인 주문의 product 와 amount 를 조회하세요.",
      hint: "WHERE status = '취소' 로 걸러요.",
      answer: "SELECT product, amount FROM orders WHERE status = '취소';"
    },
    {
      id: "recent-members", title: "최근 가입 회원", level: "basic", ordered: true,
      prompt: "회원을 가입일(joined) 최신순으로 정렬해 name 과 joined 를 조회하세요.",
      hint: "ORDER BY joined DESC 를 써요.",
      answer: "SELECT name, joined FROM members ORDER BY joined DESC;"
    },
    {
      id: "grade-count", title: "등급별 회원 수", level: "basic", ordered: false,
      prompt: "등급(grade)별 회원 수를 grade 와 회원 수 두 컬럼으로 조회하세요.",
      hint: "GROUP BY grade 와 COUNT(*) 를 써요.",
      answer: "SELECT grade, COUNT(*) AS cnt FROM members GROUP BY grade;"
    },
    {
      id: "product-sales", title: "제품별 판매액", level: "mid", ordered: true,
      prompt: "상태가 '완료'인 주문만으로 제품(product)별 총 판매액을 구하고, 판매액이 큰 순으로 product 와 합계를 조회하세요.",
      hint: "WHERE 로 완료만 거르고 GROUP BY product, SUM, ORDER BY 합계 DESC.",
      answer: "SELECT product, SUM(amount) AS total FROM orders WHERE status = '완료' GROUP BY product ORDER BY total DESC;"
    },
    {
      id: "distinct-buyers", title: "주문한 회원 이름", level: "mid", ordered: false,
      prompt: "한 번이라도 주문한 적이 있는 회원의 이름(name)을 중복 없이 조회하세요.",
      hint: "orders 와 JOIN 후 DISTINCT, 또는 id IN (SELECT member_id FROM orders) 를 써요.",
      answer: "SELECT DISTINCT m.name FROM members m JOIN orders o ON m.id = o.member_id;"
    },
    {
      id: "amount-band", title: "금액대별 주문 수", level: "mid", ordered: false,
      prompt: "각 주문을 금액(amount) 100000 이상이면 '고액', 그 미만이면 '일반' 으로 나눠, 구분별 주문 수를 구분과 개수 두 컬럼으로 조회하세요.",
      hint: "CASE WHEN amount >= 100000 THEN '고액' ELSE '일반' END 으로 묶어 GROUP BY 해요.",
      answer: "SELECT CASE WHEN amount >= 100000 THEN '고액' ELSE '일반' END AS band, COUNT(*) AS cnt FROM orders GROUP BY band;"
    },
    {
      id: "above-avg", title: "평균보다 비싼 주문", level: "hard", ordered: false,
      prompt: "전체 주문의 평균 금액보다 amount 가 큰 주문의 id 와 amount 를 조회하세요.",
      hint: "WHERE amount > (SELECT AVG(amount) FROM orders) 처럼 서브쿼리를 써요.",
      answer: "SELECT id, amount FROM orders WHERE amount > (SELECT AVG(amount) FROM orders);"
    },
    {
      id: "repeat-buyers", title: "완료 2건 이상 회원", level: "hard", ordered: false,
      prompt: "상태가 '완료'인 주문을 2건 이상 한 회원의 이름(name)을 조회하세요.",
      hint: "완료만 거른 뒤 GROUP BY 하고 HAVING COUNT(*) >= 2 로 걸러요.",
      answer: "SELECT m.name FROM members m JOIN orders o ON m.id = o.member_id WHERE o.status = '완료' GROUP BY m.id, m.name HAVING COUNT(*) >= 2;"
    },
    {
      id: "member-order-count", title: "회원별 주문 건수 (0건 포함)", level: "mid", ordered: true,
      prompt: "모든 회원에 대해 이름(name)과 주문 건수를 id 오름차순으로 조회하세요. 주문이 한 건도 없는 회원은 0으로 나와야 해요.",
      hint: "LEFT JOIN 으로 주문이 없는 회원도 남기고, COUNT 는 주문 컬럼(o.id)을 세요. COUNT(*) 는 0이 안 나와요.",
      answer: "SELECT m.name, COUNT(o.id) AS cnt FROM members m LEFT JOIN orders o ON m.id = o.member_id GROUP BY m.id, m.name ORDER BY m.id;"
    },
    {
      id: "sep-orders", title: "9월 주문 수", level: "basic", ordered: false,
      prompt: "2023년 9월에 주문된(ordered_at) 주문이 몇 건인지 한 개의 값으로 조회하세요.",
      hint: "날짜가 'YYYY-MM-DD' 문자열이라 LIKE '2023-09%' 로 거를 수 있어요.",
      answer: "SELECT COUNT(*) AS cnt FROM orders WHERE ordered_at LIKE '2023-09%';"
    },
    {
      id: "grade-avg", title: "등급별 완료 주문 평균액", level: "mid", ordered: false,
      prompt: "상태가 '완료'인 주문만으로 회원 등급(grade)별 평균 주문 금액을 grade 와 평균값 두 컬럼으로 조회하세요.",
      hint: "members 와 orders 를 JOIN 하고 완료만 거른 뒤 GROUP BY grade 로 AVG(amount) 를 구해요.",
      answer: "SELECT m.grade, AVG(o.amount) AS avg_amount FROM members m JOIN orders o ON m.id = o.member_id WHERE o.status = '완료' GROUP BY m.grade;"
    },
    {
      id: "city-sales", title: "도시별 완료 매출", level: "mid", ordered: true,
      prompt: "상태가 '완료'인 주문만으로 도시(city)별 매출 합계를 구하고, 합계가 큰 순으로 city 와 합계를 조회하세요.",
      hint: "JOIN 후 완료만 거르고 GROUP BY city, SUM(amount), ORDER BY 합계 DESC.",
      answer: "SELECT m.city, SUM(o.amount) AS total FROM members m JOIN orders o ON m.id = o.member_id WHERE o.status = '완료' GROUP BY m.city ORDER BY total DESC;"
    },
    {
      id: "mid-amount", title: "중간 금액대 주문", level: "basic", ordered: false,
      prompt: "주문 금액(amount)이 30000 이상 100000 이하인 주문의 product 와 amount 를 조회하세요.",
      hint: "BETWEEN 30000 AND 100000 을 WHERE 에 쓸 수 있어요.",
      answer: "SELECT product, amount FROM orders WHERE amount BETWEEN 30000 AND 100000;"
    },
    {
      id: "mouse-like", title: "마우스 종류 주문", level: "basic", ordered: false,
      prompt: "제품명(product)에 '마우스' 가 들어가는 주문의 id 와 product 를 조회하세요. (마우스, 마우스패드 등)",
      hint: "LIKE '%마우스%' 로 부분 일치를 검색해요.",
      answer: "SELECT id, product FROM orders WHERE product LIKE '%마우스%';"
    },
    {
      id: "distinct-products", title: "주문된 제품 가짓수", level: "basic", ordered: false,
      prompt: "주문된 서로 다른 제품(product)이 몇 가지인지 한 개의 값으로 조회하세요.",
      hint: "COUNT(DISTINCT product) 를 써요.",
      answer: "SELECT COUNT(DISTINCT product) AS cnt FROM orders;"
    },
    {
      id: "laptop-buyers", title: "노트북 구매 회원", level: "mid", ordered: false,
      prompt: "'노트북' 을 주문한 적이 있는 회원의 이름(name)을 조회하세요.",
      hint: "id IN (SELECT member_id FROM orders WHERE product = '노트북') 처럼 서브쿼리를 써요.",
      answer: "SELECT name FROM members WHERE id IN (SELECT member_id FROM orders WHERE product = '노트북');"
    },
    {
      id: "member-max", title: "회원별 최고 완료 주문액", level: "mid", ordered: false,
      prompt: "상태가 '완료'인 주문에 대해, 회원 이름(name)과 그 회원의 가장 비싼 주문 금액을 조회하세요. 완료 주문이 있는 회원만 나오면 돼요.",
      hint: "JOIN 후 완료만 거르고 GROUP BY 회원, MAX(amount) 를 구해요.",
      answer: "SELECT m.name, MAX(o.amount) AS max_amount FROM members m JOIN orders o ON m.id = o.member_id WHERE o.status = '완료' GROUP BY m.id, m.name;"
    },
    {
      id: "good-products", title: "평점 좋은 제품", level: "hard", ordered: false,
      prompt: "리뷰(reviews)의 평균 평점(rating)이 4 이상인 제품(product)을 조회하세요.",
      hint: "reviews 와 orders 를 JOIN 해 제품별로 GROUP BY 하고 HAVING AVG(rating) >= 4 로 걸러요.",
      answer: "SELECT o.product FROM reviews r JOIN orders o ON r.order_id = o.id GROUP BY o.product HAVING AVG(r.rating) >= 4;"
    },
    {
      id: "no-review", title: "리뷰 없는 완료 주문", level: "hard", ordered: false,
      prompt: "상태가 '완료'인데 리뷰(reviews)가 하나도 없는 주문의 id 와 product 를 조회하세요.",
      hint: "id NOT IN (SELECT order_id FROM reviews) 와 status 조건을 함께 써요.",
      answer: "SELECT id, product FROM orders WHERE status = '완료' AND id NOT IN (SELECT order_id FROM reviews);"
    },
    {
      id: "top-rated-member", title: "평균 평점 1위 회원", level: "hard", ordered: true,
      prompt: "받은 리뷰의 평균 평점이 가장 높은 회원 한 명의 이름(name)을 조회하세요.",
      hint: "members, orders, reviews 를 모두 JOIN 해 회원별 AVG(rating) 로 정렬하고 LIMIT 1 을 써요.",
      answer: "SELECT m.name FROM members m JOIN orders o ON m.id = o.member_id JOIN reviews r ON r.order_id = o.id GROUP BY m.id, m.name ORDER BY AVG(r.rating) DESC LIMIT 1;"
    }
  ]
};
