/* 개념 예제 코드의 Python / JavaScript 버전 (C#는 concepts.html 원본 사용).
   키 = 주제id-순번(퀴즈 밖 pre 순서). concept-ml.js 가 읽어 탭 토글로 렌더한다.
   ※ 빌드 스크립트(scratchpad)에서 cc-A.json + cc-B.json 병합 생성. */
window.CT_CONCEPT_CODE = {
  "t1-0": {
    "py": "# v in list는 내부에서 N번 비교해요 (O(N))\n# 이걸 반복문 안에서 쓰면 전체가 O(N * N)이 돼요\nfor v in queries:\n    if v in lst:\n        count += 1   # 위험!\n\n# set의 in은 평균 O(1)이라 전체가 O(N)으로 끝나요\ns = set(lst)\nfor v in queries:\n    if v in s:\n        count += 1   # 안전!",
    "js": "// arr.includes는 내부에서 N번 비교해요 (O(N))\n// 이걸 반복문 안에서 쓰면 전체가 O(N * N)이 돼요\nfor (const v of queries) {\n  if (arr.includes(v)) count++;   // 위험!\n}\n\n// Set.has는 평균 O(1)이라 전체가 O(N)으로 끝나요\nconst set = new Set(arr);\nfor (const v of queries) {\n  if (set.has(v)) count++;    // 안전!\n}"
  },
  "t2-0": {
    "py": "# 느려요 : 반복마다 전체 복사가 일어나요\ns = \"\"\nfor i in range(n):\n    s += str(i)\n\n# 빨라요 : 리스트에 모았다가 한 번에 합쳐요\nparts = []\nfor i in range(n):\n    parts.append(str(i))\nresult = \"\".join(parts)",
    "js": "// 느려요 : 반복마다 전체 복사가 일어나요\nlet s = \"\";\nfor (let i = 0; i < n; i++) s += i;\n\n// 빨라요 : 배열에 모았다가 한 번에 합쳐요\nconst parts = [];\nfor (let i = 0; i < n; i++) parts.push(i);\nconst result = parts.join(\"\");"
  },
  "t2-1": {
    "py": "s = \"hello world\"\n\ns.split(\" \")              # 공백 기준으로 쪼개기 -> [\"hello\", \"world\"]\ns[0:5]                    # 0번째부터 5글자 -> \"hello\"\ns.find(\"world\")           # 위치 찾기 -> 6 (없으면 -1)\ns.replace(\"l\", \"L\")       # 치환 -> \"heLLo worLd\"\ns.upper()                 # 대문자로\ns.strip()                 # 양쪽 공백 제거\ns[0].isdigit()            # 숫자인지 판별\ns[::-1]                   # 뒤집기",
    "js": "let s = \"hello world\";\n\ns.split(\" \");             // 공백 기준으로 쪼개기 -> [\"hello\", \"world\"]\ns.substring(0, 5);        // 0번째부터 5글자 -> \"hello\"\ns.indexOf(\"world\");       // 위치 찾기 -> 6 (없으면 -1)\ns.replaceAll(\"l\", \"L\");   // 치환 -> \"heLLo worLd\"\ns.toUpperCase();          // 대문자로\ns.trim();                 // 양쪽 공백 제거\n/[0-9]/.test(s[0]);       // 숫자인지 판별\ns.split(\"\").reverse().join(\"\");  // 뒤집기"
  },
  "t2-2": {
    "py": "def is_anagram(a, b):\n    # 길이가 다르면 바로 탈락이에요\n    if len(a) != len(b):\n        return False\n\n    # 두 문자열을 글자 단위로 정렬해서 같은지 비교해요\n    sa = sorted(a)\n    sb = sorted(b)\n    return sa == sb",
    "js": "function isAnagram(a, b) {\n  // 길이가 다르면 바로 탈락이에요\n  if (a.length !== b.length) return false;\n\n  // 두 문자열을 글자 단위로 정렬해서 같은지 비교해요\n  const sa = a.split(\"\").sort().join(\"\");\n  const sb = b.split(\"\").sort().join(\"\");\n  return sa === sb;\n}"
  },
  "t3-0": {
    "py": "def is_valid(s):\n    stack = []\n    for c in s:\n        if c == \"(\":\n            stack.append(c)          # 여는 괄호는 일단 쌓아둬요\n        else:  # 닫는 괄호일 때\n            # 짝이 될 여는 괄호가 없으면 잘못된 문자열이에요\n            if len(stack) == 0:\n                return False\n            stack.pop()              # 짝을 맞췄으니 하나 제거해요\n    # 다 돌고 나서 스택이 비어 있어야 모든 짝이 맞은 거예요\n    return len(stack) == 0",
    "js": "function isValid(s) {\n  const stack = [];\n  for (const c of s) {\n    if (c === \"(\") {\n      stack.push(c);            // 여는 괄호는 일단 쌓아둬요\n    } else { // 닫는 괄호일 때\n      // 짝이 될 여는 괄호가 없으면 잘못된 문자열이에요\n      if (stack.length === 0) return false;\n      stack.pop();              // 짝을 맞췄으니 하나 제거해요\n    }\n  }\n  // 다 돌고 나서 스택이 비어 있어야 모든 짝이 맞은 거예요\n  return stack.length === 0;\n}"
  },
  "t4-0": {
    "py": "count = {}\nfor word in words:\n    # get은 키가 없을 때 예외 대신 기본값을 줘요\n    count[word] = count.get(word, 0) + 1\n\n# 가장 많이 나온 단어 찾기\nbest = max(count.items(), key=lambda kv: kv[1])[0]",
    "js": "const count = new Map();\nfor (const word of words) {\n  // get은 키가 없으면 undefined를 주니 0으로 보정해요\n  count.set(word, (count.get(word) ?? 0) + 1);\n}\n\n// 가장 많이 나온 단어 찾기\nconst best = [...count.entries()].sort((a, b) => b[1] - a[1])[0][0];"
  },
  "t4-1": {
    "py": "# 중복 제거 : 배열을 넣기만 하면 끝나요\nunique = set(arr)\n\n# \"두 수의 합이 target이 되는 쌍이 있는가?\" - 해시의 대표 활용이에요\ndef has_pair_sum(arr, target):\n    seen = set()\n    for v in arr:\n        # 지금 값의 짝(target - v)을 이전에 본 적 있는지 O(1)로 확인해요\n        if (target - v) in seen:\n            return True\n        seen.add(v)\n    return False",
    "js": "// 중복 제거 : 배열을 넣기만 하면 끝나요\nconst unique = new Set(arr);\n\n// \"두 수의 합이 target이 되는 쌍이 있는가?\" - 해시의 대표 활용이에요\nfunction hasPairSum(arr, target) {\n  const seen = new Set();\n  for (const v of arr) {\n    // 지금 값의 짝(target - v)을 이전에 본 적 있는지 O(1)로 확인해요\n    if (seen.has(target - v)) return true;\n    seen.add(v);\n  }\n  return false;\n}"
  },
  "t5-0": {
    "py": "arr = [5, 2, 8, 1]\n\narr.sort()                  # 오름차순 : 1 2 5 8\narr.sort(reverse=True)      # 내림차순 : 8 5 2 1\n\nlst = [5, 2, 8]\nlst.sort()                  # 리스트도 같은 방식이에요",
    "js": "let arr = [5, 2, 8, 1];\n\narr.sort((a, b) => a - b);   // 오름차순 : 1 2 5 8\narr.sort((a, b) => b - a);   // 내림차순 : 8 5 2 1\n\nconst list = [5, 2, 8];\nlist.sort((a, b) => a - b);  // 배열도 같은 방식이에요"
  },
  "t5-1": {
    "py": "students = [\n    (\"kim\", 90), (\"lee\", 85), (\"park\", 90)\n]\n\n# 1순위 : 점수 내림차순, 2순위 : 이름 오름차순\n# 점수에 음수를 붙이면 내림차순이 되고, 이름은 그대로 두면 오름차순이에요\nstudents.sort(key=lambda s: (-s[1], s[0]))\n# 결과 : kim(90), park(90), lee(85)",
    "js": "const students = [\n  [\"kim\", 90], [\"lee\", 85], [\"park\", 90]\n];\n\nstudents.sort((a, b) => {\n  // 1순위 : 점수 내림차순 (b가 먼저 오도록 b - a)\n  if (a[1] !== b[1]) return b[1] - a[1];\n  // 2순위 : 이름 오름차순\n  return a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0;\n});\n// 결과 : kim(90), park(90), lee(85)"
  },
  "t5-2": {
    "py": "# 점수 내림차순 + 이름 오름차순을 한 key로 묶어 표현해요\nsorted_students = sorted(\n    students,\n    key=lambda s: (-s.score, s.name)\n)",
    "js": "// 점수 내림차순 + 이름 오름차순을 비교 함수 하나로 이어요\nconst sorted = [...students].sort((a, b) => {\n  if (a.score !== b.score) return b.score - a.score;\n  return a.name < b.name ? -1 : a.name > b.name ? 1 : 0;\n});"
  },
  "t6-0": {
    "py": "# 정렬된 배열에서 target의 위치를 찾아요. 없으면 -1을 반환해요\ndef binary_search(arr, target):\n    lo, hi = 0, len(arr) - 1\n    while lo <= hi:\n        # 파이썬은 오버플로가 없지만 형태를 통일해 이렇게 써요\n        mid = lo + (hi - lo) // 2\n\n        if arr[mid] == target:\n            return mid\n        elif arr[mid] < target:\n            lo = mid + 1   # 오른쪽 절반으로\n        else:\n            hi = mid - 1   # 왼쪽 절반으로\n    return -1",
    "js": "// 정렬된 배열에서 target의 위치를 찾아요. 없으면 -1을 반환해요\nfunction binarySearch(arr, target) {\n  let lo = 0, hi = arr.length - 1;\n  while (lo <= hi) {\n    // (lo + hi) / 2는 두 값이 크면 오버플로될 수 있어 이렇게 써요\n    const mid = lo + Math.floor((hi - lo) / 2);\n\n    if (arr[mid] === target) return mid;\n    else if (arr[mid] < target) lo = mid + 1;  // 오른쪽 절반으로\n    else hi = mid - 1;                          // 왼쪽 절반으로\n  }\n  return -1;\n}"
  },
  "t6-1": {
    "py": "# 예 : 장비 N개로 M명을 심사하는 데 필요한 최소 시간\n# \"시간 t 안에 M명 이상 심사 가능한가?\"를 판정하며 t를 좁혀요\nlo, hi = 1, 1_000_000_000_000\nwhile lo < hi:\n    mid = lo + (hi - lo) // 2\n    if can_finish(mid):\n        hi = mid       # 가능하면 더 짧은 시간 도전\n    else:\n        lo = mid + 1   # 불가능하면 시간을 늘려요\n# 종료 시 lo가 조건을 만족하는 최소값이에요",
    "js": "// 예 : 장비 N개로 M명을 심사하는 데 필요한 최소 시간\n// \"시간 t 안에 M명 이상 심사 가능한가?\"를 판정하며 t를 좁혀요\nlet lo = 1n, hi = 1000000000000n;\nwhile (lo < hi) {\n  const mid = lo + (hi - lo) / 2n;\n  if (canFinish(mid)) hi = mid;      // 가능하면 더 짧은 시간 도전\n  else lo = mid + 1n;                // 불가능하면 시간을 늘려요\n}\n// 종료 시 lo가 조건을 만족하는 최소값이에요"
  },
  "t7-0": {
    "py": "arr = [1, 2, 3]\nused = [False] * 3\ncurrent = []\n\ndef permute():\n    # 다 골랐으면 하나의 순열이 완성된 거예요\n    if len(current) == len(arr):\n        print(\" \".join(map(str, current)))\n        return\n    for i in range(len(arr)):\n        if used[i]:\n            continue   # 이미 쓴 숫자는 건너뛰어요\n\n        used[i] = True          # 1. 선택하고\n        current.append(arr[i])\n        permute()               # 2. 다음 자리로 들어갔다가\n        current.pop()\n        used[i] = False         # 3. 돌아와서 선택을 되돌려요 (백트래킹)",
    "js": "const arr = [1, 2, 3];\nconst used = [false, false, false];\nconst current = [];\n\nfunction permute() {\n  // 다 골랐으면 하나의 순열이 완성된 거예요\n  if (current.length === arr.length) {\n    console.log(current.join(\" \"));\n    return;\n  }\n  for (let i = 0; i < arr.length; i++) {\n    if (used[i]) continue;   // 이미 쓴 숫자는 건너뛰어요\n\n    used[i] = true;          // 1. 선택하고\n    current.push(arr[i]);\n    permute();               // 2. 다음 자리로 들어갔다가\n    current.pop();\n    used[i] = false;         // 3. 돌아와서 선택을 되돌려요 (백트래킹)\n  }\n}"
  },
  "t7-1": {
    "py": "def combine(start, pick):\n    if pick == 0:\n        process(current)\n        return\n    for i in range(start, len(arr)):\n        current.append(arr[i])\n        combine(i + 1, pick - 1)   # i보다 뒤에서만 고르게 해요\n        current.pop()",
    "js": "function combine(start, pick) {\n  if (pick === 0) { process(current); return; }\n  for (let i = start; i < arr.length; i++) {\n    current.push(arr[i]);\n    combine(i + 1, pick - 1);   // i보다 뒤에서만 고르게 해요\n    current.pop();\n  }\n}"
  },
  "t8-0": {
    "py": "grid = []          # 1 = 땅, 0 = 바다\nvisited = []\nn, m = 0, 0\ndx = [-1, 1, 0, 0]\ndy = [0, 0, -1, 1]\n\ndef dfs(x, y):\n    visited[x][y] = True\n    for d in range(4):\n        nx, ny = x + dx[d], y + dy[d]\n        # 격자 밖, 바다, 방문한 곳은 건너뛰어요\n        if nx < 0 or nx >= n or ny < 0 or ny >= m:\n            continue\n        if grid[nx][ny] == 0 or visited[nx][ny]:\n            continue\n        dfs(nx, ny)\n\n# 모든 칸을 돌며 새 땅을 만날 때마다 섬이 하나 늘어요\nislands = 0\nfor i in range(n):\n    for j in range(m):\n        if grid[i][j] == 1 and not visited[i][j]:\n            islands += 1\n            dfs(i, j)   # 이 섬 전체를 방문 처리해요",
    "js": "let grid;          // 1 = 땅, 0 = 바다\nlet visited;\nlet n, m;\nconst dx = [-1, 1, 0, 0];\nconst dy = [0, 0, -1, 1];\n\nfunction dfs(x, y) {\n  visited[x][y] = true;\n  for (let d = 0; d < 4; d++) {\n    const nx = x + dx[d], ny = y + dy[d];\n    // 격자 밖, 바다, 방문한 곳은 건너뛰어요\n    if (nx < 0 || nx >= n || ny < 0 || ny >= m) continue;\n    if (grid[nx][ny] === 0 || visited[nx][ny]) continue;\n    dfs(nx, ny);\n  }\n}\n\n// 모든 칸을 돌며 새 땅을 만날 때마다 섬이 하나 늘어요\nlet islands = 0;\nfor (let i = 0; i < n; i++)\n  for (let j = 0; j < m; j++)\n    if (grid[i][j] === 1 && !visited[i][j]) {\n      islands++;\n      dfs(i, j);   // 이 섬 전체를 방문 처리해요\n    }"
  },
  "t8-1": {
    "py": "from collections import deque\n\ndef bfs(sx, sy):\n    queue = deque()\n    dist = [[0] * m for _ in range(n)]   # 0이면 미방문으로 써요\n\n    queue.append((sx, sy))\n    dist[sx][sy] = 1                     # 시작 칸 포함 거리 1\n\n    while queue:\n        x, y = queue.popleft()\n        for d in range(4):\n            nx, ny = x + dx[d], y + dy[d]\n            if nx < 0 or nx >= n or ny < 0 or ny >= m:\n                continue\n            if grid[nx][ny] == 0 or dist[nx][ny] != 0:\n                continue\n\n            dist[nx][ny] = dist[x][y] + 1   # 한 칸 멀어진 거리예요\n            queue.append((nx, ny))\n    # 도착 못 하면 -1 (게임 맵 최단거리 유형)\n    return -1 if dist[n - 1][m - 1] == 0 else dist[n - 1][m - 1]",
    "js": "function bfs(sx, sy) {\n  const queue = [];   // [x, y] 들을 담아요\n  let head = 0;\n  const dist = Array.from({ length: n }, () => new Array(m).fill(0));  // 0이면 미방문으로 써요\n\n  queue.push([sx, sy]);\n  dist[sx][sy] = 1;                // 시작 칸 포함 거리 1\n\n  while (head < queue.length) {\n    const [x, y] = queue[head++];\n    for (let d = 0; d < 4; d++) {\n      const nx = x + dx[d], ny = y + dy[d];\n      if (nx < 0 || nx >= n || ny < 0 || ny >= m) continue;\n      if (grid[nx][ny] === 0 || dist[nx][ny] !== 0) continue;\n\n      dist[nx][ny] = dist[x][y] + 1;   // 한 칸 멀어진 거리예요\n      queue.push([nx, ny]);\n    }\n  }\n  // 도착 못 하면 -1 (게임 맵 최단거리 유형)\n  return dist[n - 1][m - 1] === 0 ? -1 : dist[n - 1][m - 1];\n}"
  },
  "t9-0": {
    "py": "# meetings : (시작, 끝) 목록\n# 1순위 : 끝나는 시간 빠른 순, 같으면 시작 시간 빠른 순\nmeetings.sort(key=lambda mtg: (mtg[1], mtg[0]))\n\ncount = 0\nlast_end = float(\"-inf\")\nfor m in meetings:\n    # 직전 회의가 끝난 뒤에 시작하는 회의만 담아요\n    if m[0] >= last_end:\n        count += 1\n        last_end = m[1]",
    "js": "// meetings : [시작, 끝] 목록\nmeetings.sort((a, b) =>\n  a[1] !== b[1]\n    ? a[1] - b[1]        // 1순위 : 끝나는 시간 빠른 순\n    : a[0] - b[0]);      // 같으면 시작 시간 빠른 순\n\nlet count = 0, lastEnd = -Infinity;\nfor (const m of meetings) {\n  // 직전 회의가 끝난 뒤에 시작하는 회의만 담아요\n  if (m[0] >= lastEnd) {\n    count++;\n    lastEnd = m[1];\n  }\n}"
  },
  "t10-0": {
    "py": "# 방법 1 : 메모이제이션 (재귀 + 저장)\nmemo = [0] * 100   # n 최대치+1 크기로 잡아요 (파이썬 정수는 자릿수 제한이 없어요)\ndef fib(n):\n    if n <= 1:\n        return n\n    if memo[n] != 0:\n        return memo[n]   # 이미 구했으면 재사용 (0이 정답일 수 있는 문제에선 별도 표시로 구분)\n    memo[n] = fib(n - 1) + fib(n - 2)\n    return memo[n]\n\n# 방법 2 : 테이블 채우기 (반복문, 보통 이쪽을 권해요)\ndp = [0] * (n + 1)\ndp[0] = 0\ndp[1] = 1\nfor i in range(2, n + 1):\n    dp[i] = dp[i - 1] + dp[i - 2]",
    "js": "// 방법 1 : 메모이제이션 (재귀 + 저장)\nconst memo = new Array(100).fill(0);   // n 최대치+1 크기로 잡아요 (큰 값은 BigInt 권장)\nfunction fib(n) {\n  if (n <= 1) return n;\n  if (memo[n] !== 0) return memo[n];   // 이미 구했으면 재사용 (0이 정답일 수 있는 문제에선 별도 표시로 구분)\n  return memo[n] = fib(n - 1) + fib(n - 2);\n}\n\n// 방법 2 : 테이블 채우기 (반복문, 보통 이쪽을 권해요)\nconst dp = new Array(n + 1).fill(0);\ndp[0] = 0; dp[1] = 1;\nfor (let i = 2; i <= n; i++)\n  dp[i] = dp[i - 1] + dp[i - 2];"
  },
  "t10-1": {
    "py": "dp = [0] * (n + 1)\ndp[1] = 1\nif n >= 2:\n    dp[2] = 2\nfor i in range(3, n + 1):\n    dp[i] = dp[i - 1] + dp[i - 2]   # 피보나치와 같은 구조예요",
    "js": "const dp = new Array(n + 1).fill(0);\ndp[1] = 1;\nif (n >= 2) dp[2] = 2;\nfor (let i = 3; i <= n; i++)\n  dp[i] = dp[i - 1] + dp[i - 2];   // 피보나치와 같은 구조예요"
  },
  "t11-0": {
    "py": "import heapq\n\n# heapq는 (우선순위, 요소) 튜플을 넣어요\n# 우선순위가 작을수록 먼저 나와요 (최소 힙)\npq = []\n\nheapq.heappush(pq, (3, \"세 번째\"))\nheapq.heappush(pq, (1, \"첫 번째\"))\nheapq.heappush(pq, (2, \"두 번째\"))\n\nwhile pq:\n    print(heapq.heappop(pq)[1])   # 첫 번째, 두 번째, 세 번째 순으로 나와요\n\n# 최대 힙이 필요하면 우선순위에 부호를 뒤집어 넣는 게 가장 간단해요\nheapq.heappush(max_pq, (-value, value))",
    "js": "// JS에는 내장 우선순위 큐가 없어요. 작은 입력은 배열에 넣고 매번 정렬해 흉내내요\n// 우선순위가 작을수록 먼저 나와요 (최소 힙)\nconst pq = [];\n\npq.push([3, \"세 번째\"]);\npq.push([1, \"첫 번째\"]);\npq.push([2, \"두 번째\"]);\n\nwhile (pq.length > 0) {\n  pq.sort((a, b) => a[0] - b[0]);   // 우선순위 오름차순 정렬\n  const [, item] = pq.shift();\n  console.log(item);                // 첫 번째, 두 번째, 세 번째 순으로 나와요\n}\n\n// 최대 힙이 필요하면 우선순위에 부호를 뒤집어 넣는 게 가장 간단해요\nmaxPq.push([-value, value]);"
  },
  "t11-1": {
    "py": "import heapq\n\npq = []\nfor v in potions:\n    heapq.heappush(pq, v)\n\nmix_count = 0\nwhile pq and pq[0] < K:\n    # 남은 게 하나뿐인데 아직 K 미만이면 실패예요\n    if len(pq) < 2:\n        return -1\n\n    a = heapq.heappop(pq)\n    b = heapq.heappop(pq)\n    mixed = a + b\n    heapq.heappush(pq, mixed)\n    mix_count += 1",
    "js": "// 작은 입력 가정, 배열을 최소 힙처럼 매번 정렬해 사용해요\nconst pq = [];\nfor (const v of potions) pq.push(v);\npq.sort((a, b) => a - b);\n\nlet mixCount = 0;\nwhile (pq[0] < K) {\n  // 남은 게 하나뿐인데 아직 K 미만이면 실패예요\n  if (pq.length < 2) return -1;\n\n  const a = pq.shift();\n  const b = pq.shift();\n  const mixed = a + b;\n  pq.push(mixed);\n  pq.sort((a, b) => a - b);   // 다시 정렬해 최소값을 앞으로\n  mixCount++;\n}"
  },
  "t12-0": {
    "py": "# prefix[i] = arr[0]부터 arr[i-1]까지의 합\nprefix = [0] * (n + 1)\nfor i in range(n):\n    prefix[i + 1] = prefix[i] + arr[i]\n\n# 구간 [l, r]의 합 (0-based, 양 끝 포함)\nrange_sum = prefix[r + 1] - prefix[l]",
    "js": "// prefix[i] = arr[0]부터 arr[i-1]까지의 합\nconst prefix = new Array(n + 1).fill(0);\nfor (let i = 0; i < n; i++) {\n  prefix[i + 1] = prefix[i] + arr[i];\n}\n\n// 구간 [l, r]의 합 (0-based, 양 끝 포함)\nconst rangeSum = prefix[r + 1] - prefix[l];"
  },
  "t12-1": {
    "py": "# 정렬된 배열에서 합이 target인 쌍이 있는지 확인해요\nleft, right = 0, len(arr) - 1\nwhile left < right:\n    total = arr[left] + arr[right]\n    if total == target:\n        return True\n    elif total < target:\n        left += 1    # 합을 키워야 하니 왼쪽 전진\n    else:\n        right -= 1   # 합을 줄여야 하니 오른쪽 후퇴\nreturn False",
    "js": "// 정렬된 배열에서 합이 target인 쌍이 있는지 확인해요\nlet left = 0, right = arr.length - 1;\nwhile (left < right) {\n  const sum = arr[left] + arr[right];\n  if (sum === target) return true;\n  else if (sum < target) left++;    // 합을 키워야 하니 왼쪽 전진\n  else right--;                     // 합을 줄여야 하니 오른쪽 후퇴\n}\nreturn false;"
  },
  "t12-2": {
    "py": "start = 0\nbest = float('inf')\nwindow_sum = 0\n\nfor end in range(n):\n    window_sum += arr[end]               # 창을 오른쪽으로 한 칸 넓혀요\n\n    # 조건을 만족하는 동안 왼쪽을 최대한 좁혀 최소 길이를 갱신해요\n    while window_sum >= S:\n        best = min(best, end - start + 1)\n        window_sum -= arr[start]\n        start += 1",
    "js": "let start = 0;\nlet best = Infinity;\nlet windowSum = 0;\n\nfor (let end = 0; end < n; end++) {\n  windowSum += arr[end];               // 창을 오른쪽으로 한 칸 넓혀요\n\n  // 조건을 만족하는 동안 왼쪽을 최대한 좁혀 최소 길이를 갱신해요\n  while (windowSum >= S) {\n    best = Math.min(best, end - start + 1);\n    windowSum -= arr[start];\n    start++;\n  }\n}"
  },
  "t13-0": {
    "py": "import heapq\n\n# graph[u] = (도착 정점 v, 가중치 w) 목록, 인접 리스트예요\ngraph = [[] for _ in range(n + 1)]\n\ndist = [float('inf')] * (n + 1)   # 처음엔 모두 무한대로 둬요\n\npq = []   # (그 정점까지 거리, 정점)\ndist[start] = 0\nheapq.heappush(pq, (0, start))\n\nwhile pq:\n    d, u = heapq.heappop(pq)\n    # 이미 더 짧게 확정된 정점이면 건너뛰어요. 중복으로 넣어도 이 검사가 걸러줘서 decrease-key가 필요 없어요\n    if d > dist[u]:\n        continue\n\n    for v, w in graph[u]:\n        # u를 거쳐 가는 게 더 짧으면 거리를 갱신해요 (이완, relaxation)\n        if dist[u] + w < dist[v]:\n            dist[v] = dist[u] + w\n            heapq.heappush(pq, (dist[v], v))",
    "js": "// graph[u] = [도착 정점 v, 가중치 w] 목록, 인접 리스트예요\nconst graph = Array.from({ length: n + 1 }, () => []);\n\nconst dist = new Array(n + 1).fill(Infinity);   // 처음엔 모두 무한대로 둬요\n\n// 작은 입력 가정, 배열을 최소 힙처럼 매번 정렬해 사용해요. 원소는 [거리, 정점]\nconst pq = [];\ndist[start] = 0;\npq.push([0, start]);\n\nwhile (pq.length > 0) {\n  pq.sort((a, b) => a[0] - b[0]);   // 거리 오름차순\n  const [d, u] = pq.shift();\n  // 이미 더 짧게 확정된 정점이면 건너뛰어요. 중복으로 넣어도 이 검사가 걸러줘서 decrease-key가 필요 없어요\n  if (d > dist[u]) continue;\n\n  for (const [v, w] of graph[u]) {\n    // u를 거쳐 가는 게 더 짧으면 거리를 갱신해요 (이완, relaxation)\n    if (dist[u] + w < dist[v]) {\n      dist[v] = dist[u] + w;\n      pq.push([dist[v], v]);\n    }\n  }\n}"
  },
  "t14-0": {
    "py": "# 초기화 : 처음엔 모두 자기 자신이 대표예요\nparent = list(range(n + 1))\n\ndef find(x):\n    if parent[x] == x:\n        return x\n    # 경로 압축 : 찾은 루트를 곧장 부모로 바꿔 다음 탐색을 빠르게 해요\n    parent[x] = find(parent[x])\n    return parent[x]\n\ndef union(a, b):\n    ra, rb = find(a), find(b)\n    if ra != rb:\n        parent[ra] = rb   # 한쪽 루트를 다른 쪽에 붙여요",
    "js": "// 초기화 : 처음엔 모두 자기 자신이 대표예요\nconst parent = new Array(n + 1);\nfor (let i = 1; i <= n; i++) parent[i] = i;\n\nfunction find(x) {\n  if (parent[x] === x) return x;\n  // 경로 압축 : 찾은 루트를 곧장 부모로 바꿔 다음 탐색을 빠르게 해요\n  parent[x] = find(parent[x]);\n  return parent[x];\n}\n\nfunction union(a, b) {\n  const ra = find(a), rb = find(b);\n  if (ra !== rb) parent[ra] = rb;   // 한쪽 루트를 다른 쪽에 붙여요\n}"
  },
  "t15-0": {
    "py": "state = 0   # 0b0000, 아무것도 안 켜진 상태\n\nstate |= (1 << i)              # i번째 비트 켜기 (포함시키기)\nstate &= ~(1 << i)             # i번째 비트 끄기 (제외하기)\nstate ^= (1 << i)             # i번째 비트 토글 (반전)\non = (state & (1 << i)) != 0   # i번째가 켜져 있는지 확인",
    "js": "let state = 0;   // 0b0000, 아무것도 안 켜진 상태\n\nstate |= (1 << i);                    // i번째 비트 켜기 (포함시키기)\nstate &= ~(1 << i);                   // i번째 비트 끄기 (제외하기)\nstate ^= (1 << i);                    // i번째 비트 토글 (반전)\nconst on = (state & (1 << i)) !== 0;  // i번째가 켜져 있는지 확인"
  },
  "t15-1": {
    "py": "for s in range(1 << n):   # 2^n개의 모든 상태\n    for i in range(n):\n        if (s & (1 << i)) != 0:   # i번째 원소가 이 부분집합에 포함됐다면\n            use(arr[i])\n\n# 켜진 비트(원소) 개수는 이렇게 한 번에 셀 수 있어요\ncnt = bin(s).count('1')",
    "js": "for (let s = 0; s < (1 << n); s++) {   // 2^n개의 모든 상태\n  for (let i = 0; i < n; i++) {\n    if ((s & (1 << i)) !== 0) {   // i번째 원소가 이 부분집합에 포함됐다면\n      use(arr[i]);\n    }\n  }\n}\n\n// 켜진 비트(원소) 개수는 이렇게 한 번에 셀 수 있어요\nconst cnt = s.toString(2).split('').filter((b) => b === '1').length;"
  },
  "t16-0": {
    "py": "# 북, 동, 남, 서를 시계 방향 순서로 둬요\ndx = [-1, 0, 1, 0]\ndy = [0, 1, 0, -1]\ndir = 0   # 현재 북쪽을 보고 있어요\n\ndir = (dir + 1) % 4   # 우회전 (시계 방향 한 칸)\ndir = (dir + 3) % 4   # 좌회전 (-1 대신 +3을 더해 음수를 피해요)",
    "js": "// 북, 동, 남, 서를 시계 방향 순서로 둬요\nconst dx = [-1, 0, 1, 0];\nconst dy = [0, 1, 0, -1];\nlet dir = 0;   // 현재 북쪽을 보고 있어요\n\ndir = (dir + 1) % 4;   // 우회전 (시계 방향 한 칸)\ndir = (dir + 3) % 4;   // 좌회전 (-1 대신 +3을 더해 음수를 피해요)"
  },
  "t18-0": {
    "py": "import heapq\n\n# grid : 0 = 길, 1 = 벽. (0,0)에서 (n-1, m-1)까지 최소 칸 수를 구해요\ndef a_star(grid, n, m):\n    dx = [-1, 1, 0, 0]\n    dy = [0, 0, -1, 1]\n\n    # 휴리스틱 : 목표까지 맨해튼 거리 (상하좌우만 이동하므로 과대평가가 없어요)\n    def h(x, y):\n        return abs(x - (n - 1)) + abs(y - (m - 1))\n\n    g = [[float('inf')] * m for _ in range(n)]   # g[x][y] = 시작부터 실제 비용\n\n    pq = []   # 우선순위 = f = g + h, 원소는 (f, x, y)\n    g[0][0] = 0\n    heapq.heappush(pq, (h(0, 0), 0, 0))\n\n    while pq:\n        _, x, y = heapq.heappop(pq)\n        # 목표를 처음 꺼낸 순간이 최단이에요 (허용 가능한 휴리스틱 덕분)\n        if x == n - 1 and y == m - 1:\n            return g[x][y] + 1   # 칸 수로 환산\n\n        for d in range(4):\n            nx, ny = x + dx[d], y + dy[d]\n            if nx < 0 or nx >= n or ny < 0 or ny >= m:\n                continue   # 격자 밖\n            if grid[nx][ny] == 1:\n                continue   # 벽\n\n            ng = g[x][y] + 1   # 한 칸 이동 비용 1\n            if ng < g[nx][ny]:\n                g[nx][ny] = ng\n                heapq.heappush(pq, (ng + h(nx, ny), nx, ny))   # f = g + h 로 우선순위 부여\n\n    return -1   # 도달 불가",
    "js": "// grid : 0 = 길, 1 = 벽. (0,0)에서 (n-1, m-1)까지 최소 칸 수를 구해요\nfunction aStar(grid, n, m) {\n  const dx = [-1, 1, 0, 0];\n  const dy = [0, 0, -1, 1];\n\n  // 휴리스틱 : 목표까지 맨해튼 거리 (상하좌우만 이동하므로 과대평가가 없어요)\n  const h = (x, y) => Math.abs(x - (n - 1)) + Math.abs(y - (m - 1));\n\n  // g[x][y] = 시작부터 실제 비용\n  const g = Array.from({ length: n }, () => new Array(m).fill(Infinity));\n\n  // 작은 입력 가정, 배열을 최소 힙처럼 매번 정렬해 사용해요. 원소는 [f, x, y], f = g + h\n  const pq = [];\n  g[0][0] = 0;\n  pq.push([h(0, 0), 0, 0]);\n\n  while (pq.length > 0) {\n    pq.sort((a, b) => a[0] - b[0]);   // f 오름차순\n    const [, x, y] = pq.shift();\n    // 목표를 처음 꺼낸 순간이 최단이에요 (허용 가능한 휴리스틱 덕분)\n    if (x === n - 1 && y === m - 1) return g[x][y] + 1;   // 칸 수로 환산\n\n    for (let d = 0; d < 4; d++) {\n      const nx = x + dx[d], ny = y + dy[d];\n      if (nx < 0 || nx >= n || ny < 0 || ny >= m) continue;   // 격자 밖\n      if (grid[nx][ny] === 1) continue;                       // 벽\n\n      const ng = g[x][y] + 1;   // 한 칸 이동 비용 1\n      if (ng < g[nx][ny]) {\n        g[nx][ny] = ng;\n        pq.push([ng + h(nx, ny), nx, ny]);   // f = g + h 로 우선순위 부여\n      }\n    }\n  }\n  return -1;   // 도달 불가\n}"
  },
  "t19-0": {
    "py": "from collections import deque\n\n# graph[u] = u 다음에 올 수 있는 정점 목록, indeg[v] = v로 들어오는 간선 수\nqueue = deque()\nfor i in range(1, n + 1):\n    if indeg[i] == 0:\n        queue.append(i)   # 시작점 : 선행 작업이 없는 정점\n\norder = []\nwhile queue:\n    u = queue.popleft()\n    order.append(u)\n    for v in graph[u]:\n        indeg[v] -= 1\n        if indeg[v] == 0:\n            queue.append(v)   # 선행이 모두 끝났으면 큐에 넣어요",
    "js": "// graph[u] = u 다음에 올 수 있는 정점 목록, indeg[v] = v로 들어오는 간선 수\nconst queue = [];\nfor (let i = 1; i <= n; i++) {\n  if (indeg[i] === 0) queue.push(i);   // 시작점 : 선행 작업이 없는 정점\n}\n\nconst order = [];\nlet head = 0;\nwhile (head < queue.length) {\n  const u = queue[head++];\n  order.push(u);\n  for (const v of graph[u]) {\n    if (--indeg[v] === 0) queue.push(v);   // 선행이 모두 끝났으면 큐에 넣어요\n  }\n}"
  },
  "t20-0": {
    "py": "def is_prime(x):\n    if x < 2:\n        return False\n    i = 2\n    while i * i <= x:   # i*i가 x를 넘기 전까지만\n        if x % i == 0:\n            return False   # 약수를 찾으면 소수가 아니에요\n        i += 1\n    return True",
    "js": "function isPrime(x) {\n  if (x < 2) return false;\n  for (let i = 2; i * i <= x; i++) {   // i*i가 x를 넘기 전까지만\n    if (x % i === 0) return false;     // 약수를 찾으면 소수가 아니에요\n  }\n  return true;\n}"
  },
  "t20-1": {
    "py": "not_prime = [False] * (n + 1)   # not_prime[k] = k가 소수가 아니면 True\ni = 2\nwhile i * i <= n:\n    if not not_prime[i]:                 # 이미 지워졌으면 그 배수도 이미 지워졌어요\n        for j in range(i * i, n + 1, i):   # i*i부터 시작 (그 앞 배수는 이미 지워짐)\n            not_prime[j] = True\n    i += 1\n# k >= 2 이고 not_prime[k] == False 이면 소수예요",
    "js": "const notPrime = new Array(n + 1).fill(false);   // notPrime[k] = k가 소수가 아니면 true\nfor (let i = 2; i * i <= n; i++) {\n  if (notPrime[i]) continue;                       // 이미 지워졌으면 그 배수도 이미 지워졌어요\n  for (let j = i * i; j <= n; j += i) {            // i*i부터 시작 (그 앞 배수는 이미 지워짐)\n    notPrime[j] = true;\n  }\n}\n// k >= 2 이고 notPrime[k] === false 이면 소수예요"
  },
  "t21-0": {
    "py": "def gcd(a, b):\n    while b != 0:\n        t = a % b\n        a = b\n        b = t\n    return a          # b가 0이 된 순간의 a가 최대공약수예요\n\n# 최소공배수 = 두 수의 곱 / 최대공약수\ndef lcm(a, b):\n    return a // gcd(a, b) * b   # 곱하기 전에 나눠 오버플로를 피해요",
    "js": "function gcd(a, b) {\n  while (b !== 0) {\n    const t = a % b;\n    a = b;\n    b = t;\n  }\n  return a;          // b가 0이 된 순간의 a가 최대공약수예요\n}\n\n// 최소공배수 = 두 수의 곱 / 최대공약수\nfunction lcm(a, b) {\n  return Math.floor(a / gcd(a, b)) * b;   // 곱하기 전에 나눠 오버플로를 피해요\n}"
  }
};
