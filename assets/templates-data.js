/* 알고리즘 템플릿 단일 소스.
   templates.html 이 이 배열을 읽어 카테고리별 카드 + 언어 탭(C#/Python/JS) + 복사 버튼으로 그려요.
   템플릿을 추가하려면 이 파일에 항목 하나만 더 넣으면 돼요.
   각 항목: { id, cat, title, note, code:{ cs, py, js } }  (없는 언어는 생략 가능) */
window.CT_TEMPLATES = [
  {
    id: 'io', cat: '기본', title: '빠른 입출력',
    note: '입력이 많으면 기본 입력 함수가 느려요. 한 번에 읽고 한 번에 출력하는 골격이에요.',
    code: {
      cs: `using System;
using System.IO;
using System.Text;

class Program {
    static void Main() {
        var br = new StreamReader(Console.OpenStandardInput());
        var bw = new StreamWriter(Console.OpenStandardOutput());

        int n = int.Parse(br.ReadLine());
        int[] a = Array.ConvertAll(br.ReadLine().Split(' '), int.Parse);

        var sb = new StringBuilder();
        sb.Append(string.Join(" ", a));
        bw.WriteLine(sb);

        bw.Flush();
    }
}`,
      py: `import sys
input = sys.stdin.readline

n = int(input())
a = list(map(int, input().split()))

print(*a)`,
      js: `const lines = require('fs').readFileSync(0, 'utf8').split('\\n');
let p = 0;
const next = () => lines[p++];

const n = Number(next());
const a = next().split(' ').map(Number);

console.log(a.join(' '));`
    }
  },
  {
    id: 'sort', cat: '기본', title: '정렬과 커스텀 비교',
    note: '값 기준 오름차순이 기본이고, 여러 키로 정렬할 때는 비교 함수를 넘겨요.',
    code: {
      cs: `int[] a = { 3, 1, 2 };
Array.Sort(a);                       // 오름차순
Array.Sort(a, (x, y) => y - x);      // 내림차순

// 다중 키: 점수 내림차순, 같으면 이름 오름차순
var people = new List<(int score, string name)>();
people.Sort((x, y) =>
    x.score != y.score ? y.score - x.score
                       : string.Compare(x.name, y.name));`,
      py: `a = [3, 1, 2]
a.sort()                 # 오름차순
a.sort(reverse=True)     # 내림차순

# 다중 키: 점수 내림차순, 같으면 이름 오름차순
people = [(90, "b"), (90, "a")]
people.sort(key=lambda p: (-p[0], p[1]))`,
      js: `const a = [3, 1, 2];
a.sort((x, y) => x - y);   // 오름차순 (숫자는 비교 함수 필수)
a.sort((x, y) => y - x);   // 내림차순

// 다중 키: 점수 내림차순, 같으면 이름 오름차순
const people = [[90, "b"], [90, "a"]];
people.sort((x, y) => y[0] - x[0] || x[1].localeCompare(y[1]));`
    }
  },
  {
    id: 'bsearch', cat: '탐색', title: '이분 탐색 (lower / upper bound)',
    note: '정렬된 배열에서 처음 등장 위치(lower)와 처음으로 큰 위치(upper)를 찾아요. 개수 = upper - lower.',
    code: {
      cs: `// a 는 오름차순. x 이상이 처음 나오는 인덱스
static int LowerBound(int[] a, int x) {
    int lo = 0, hi = a.Length;
    while (lo < hi) {
        int mid = (lo + hi) / 2;
        if (a[mid] < x) lo = mid + 1;
        else hi = mid;
    }
    return lo;
}
// x 보다 처음 커지는 인덱스
static int UpperBound(int[] a, int x) {
    int lo = 0, hi = a.Length;
    while (lo < hi) {
        int mid = (lo + hi) / 2;
        if (a[mid] <= x) lo = mid + 1;
        else hi = mid;
    }
    return lo;
}`,
      py: `from bisect import bisect_left, bisect_right

a = [1, 2, 2, 2, 5]
lo = bisect_left(a, 2)    # 2 가 처음 나오는 위치 -> 1
hi = bisect_right(a, 2)   # 2 다음 위치 -> 4
count = hi - lo           # 2 의 개수 -> 3`,
      js: `function lowerBound(a, x) {
  let lo = 0, hi = a.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (a[mid] < x) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}
function upperBound(a, x) {
  let lo = 0, hi = a.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (a[mid] <= x) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}`
    }
  },
  {
    id: 'bfs', cat: '그래프', title: 'BFS (최단 거리)',
    note: '가중치가 모두 1인 그래프나 격자에서 최단 거리를 구해요. 큐에서 꺼낸 순간이 곧 최단이에요.',
    code: {
      cs: `// 격자에서 (0,0) 부터의 최단 거리
int[] dr = { -1, 1, 0, 0 };
int[] dc = { 0, 0, -1, 1 };
int R = grid.Length, C = grid[0].Length;
var dist = new int[R, C];
for (int i = 0; i < R; i++) for (int j = 0; j < C; j++) dist[i, j] = -1;

var q = new Queue<(int, int)>();
q.Enqueue((0, 0));
dist[0, 0] = 0;
while (q.Count > 0) {
    var (r, c) = q.Dequeue();
    for (int d = 0; d < 4; d++) {
        int nr = r + dr[d], nc = c + dc[d];
        if (nr < 0 || nc < 0 || nr >= R || nc >= C) continue;
        if (grid[nr][nc] == 1 || dist[nr, nc] != -1) continue;  // 벽이거나 방문함
        dist[nr, nc] = dist[r, c] + 1;
        q.Enqueue((nr, nc));
    }
}`,
      py: `from collections import deque

dr = (-1, 1, 0, 0)
dc = (0, 0, -1, 1)
R, C = len(grid), len(grid[0])
dist = [[-1] * C for _ in range(R)]

q = deque([(0, 0)])
dist[0][0] = 0
while q:
    r, c = q.popleft()
    for d in range(4):
        nr, nc = r + dr[d], c + dc[d]
        if 0 <= nr < R and 0 <= nc < C and dist[nr][nc] == -1 and grid[nr][nc] == 0:
            dist[nr][nc] = dist[r][c] + 1
            q.append((nr, nc))`,
      js: `const dr = [-1, 1, 0, 0], dc = [0, 0, -1, 1];
const R = grid.length, C = grid[0].length;
const dist = Array.from({ length: R }, () => Array(C).fill(-1));

const q = [[0, 0]];
dist[0][0] = 0;
for (let head = 0; head < q.length; head++) {
  const [r, c] = q[head];
  for (let d = 0; d < 4; d++) {
    const nr = r + dr[d], nc = c + dc[d];
    if (nr < 0 || nc < 0 || nr >= R || nc >= C) continue;
    if (grid[nr][nc] === 1 || dist[nr][nc] !== -1) continue;
    dist[nr][nc] = dist[r][c] + 1;
    q.push([nr, nc]);
  }
}`
    }
  },
  {
    id: 'dfs', cat: '그래프', title: 'DFS (재귀)',
    note: '한 방향으로 끝까지 들어갔다가 되돌아와요. 연결 요소 세기, 경로 탐색에 써요. 깊으면 스택 버전을 쓰세요.',
    code: {
      cs: `bool[] visited;
List<int>[] adj;   // 인접 리스트

void Dfs(int u) {
    visited[u] = true;
    foreach (int v in adj[u]) {
        if (!visited[v]) Dfs(v);
    }
}

// 스택 버전 (재귀가 너무 깊을 때)
void DfsStack(int start) {
    var st = new Stack<int>();
    st.Push(start);
    while (st.Count > 0) {
        int u = st.Pop();
        if (visited[u]) continue;
        visited[u] = true;
        foreach (int v in adj[u]) if (!visited[v]) st.Push(v);
    }
}`,
      py: `import sys
sys.setrecursionlimit(10 ** 6)   # 깊은 재귀 대비

visited = [False] * n
def dfs(u):
    visited[u] = True
    for v in adj[u]:
        if not visited[v]:
            dfs(v)

# 스택 버전
def dfs_stack(start):
    st = [start]
    while st:
        u = st.pop()
        if visited[u]:
            continue
        visited[u] = True
        for v in adj[u]:
            if not visited[v]:
                st.append(v)`,
      js: `const visited = new Array(n).fill(false);

function dfs(u) {
  visited[u] = true;
  for (const v of adj[u]) {
    if (!visited[v]) dfs(v);
  }
}

// 스택 버전 (깊은 그래프는 이 쪽이 안전해요)
function dfsStack(start) {
  const st = [start];
  while (st.length) {
    const u = st.pop();
    if (visited[u]) continue;
    visited[u] = true;
    for (const v of adj[u]) if (!visited[v]) st.push(v);
  }
}`
    }
  },
  {
    id: 'dijkstra', cat: '그래프', title: '다익스트라 (최단 경로)',
    note: '음수 가중치가 없을 때 한 점에서 모든 점까지 최단 거리를 구해요. 우선순위 큐로 가장 가까운 점부터 확정해요.',
    code: {
      cs: `// adj[u] = (v, w) 목록. 가중치 w >= 0
var dist = new int[n];
Array.Fill(dist, int.MaxValue);
dist[start] = 0;

var pq = new PriorityQueue<int, int>();   // (노드, 거리)
pq.Enqueue(start, 0);
while (pq.Count > 0) {
    pq.TryDequeue(out int u, out int d);
    if (d > dist[u]) continue;             // 낡은 항목은 건너뛰기
    foreach (var (v, w) in adj[u]) {
        if (dist[u] + w < dist[v]) {
            dist[v] = dist[u] + w;
            pq.Enqueue(v, dist[v]);
        }
    }
}`,
      py: `import heapq

dist = [float('inf')] * n
dist[start] = 0
pq = [(0, start)]   # (거리, 노드)

while pq:
    d, u = heapq.heappop(pq)
    if d > dist[u]:
        continue
    for v, w in adj[u]:
        if dist[u] + w < dist[v]:
            dist[v] = dist[u] + w
            heapq.heappush(pq, (dist[v], v))`,
      js: `// 간단한 이진 힙 대신 정렬 배열로도 되지만, 큰 입력은 힙을 권장해요.
const dist = new Array(n).fill(Infinity);
dist[start] = 0;
const pq = [[0, start]];   // [거리, 노드]

while (pq.length) {
  pq.sort((a, b) => a[0] - b[0]);   // 작은 입력용. 큰 입력은 진짜 힙으로.
  const [d, u] = pq.shift();
  if (d > dist[u]) continue;
  for (const [v, w] of adj[u]) {
    if (dist[u] + w < dist[v]) {
      dist[v] = dist[u] + w;
      pq.push([dist[v], v]);
    }
  }
}`
    }
  },
  {
    id: 'dp', cat: 'DP', title: '동적 계획법 골격',
    note: '작은 문제의 답을 표에 적어두고 큰 문제에 재사용해요. 점화식과 초기값만 정하면 돼요.',
    code: {
      cs: `// 1차원: 계단 오르기 (1칸 또는 2칸)
int[] dp = new int[n + 1];
dp[0] = 1;
dp[1] = 1;
for (int i = 2; i <= n; i++)
    dp[i] = dp[i - 1] + dp[i - 2];

// 2차원: 최장 공통 부분 수열 길이
int[,] L = new int[a.Length + 1, b.Length + 1];
for (int i = 1; i <= a.Length; i++)
    for (int j = 1; j <= b.Length; j++)
        L[i, j] = (a[i - 1] == b[j - 1])
            ? L[i - 1, j - 1] + 1
            : Math.Max(L[i - 1, j], L[i, j - 1]);`,
      py: `# 1차원: 계단 오르기
dp = [0] * (n + 1)
dp[0] = dp[1] = 1
for i in range(2, n + 1):
    dp[i] = dp[i - 1] + dp[i - 2]

# 2차원: 최장 공통 부분 수열
L = [[0] * (len(b) + 1) for _ in range(len(a) + 1)]
for i in range(1, len(a) + 1):
    for j in range(1, len(b) + 1):
        if a[i - 1] == b[j - 1]:
            L[i][j] = L[i - 1][j - 1] + 1
        else:
            L[i][j] = max(L[i - 1][j], L[i][j - 1])`,
      js: `// 1차원: 계단 오르기
const dp = new Array(n + 1).fill(0);
dp[0] = dp[1] = 1;
for (let i = 2; i <= n; i++) dp[i] = dp[i - 1] + dp[i - 2];

// 2차원: 최장 공통 부분 수열
const L = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(0));
for (let i = 1; i <= a.length; i++)
  for (let j = 1; j <= b.length; j++)
    L[i][j] = a[i - 1] === b[j - 1]
      ? L[i - 1][j - 1] + 1
      : Math.max(L[i - 1][j], L[i][j - 1]);`
    }
  },
  {
    id: 'dsu', cat: '그래프', title: '유니온 파인드 (분리 집합)',
    note: '여러 원소가 같은 그룹인지 빠르게 묶고 확인해요. 경로 압축으로 거의 상수 시간이에요.',
    code: {
      cs: `int[] parent;
void Init(int n) {
    parent = new int[n];
    for (int i = 0; i < n; i++) parent[i] = i;
}
int Find(int x) {
    if (parent[x] == x) return x;
    return parent[x] = Find(parent[x]);   // 경로 압축
}
void Union(int a, int b) {
    int ra = Find(a), rb = Find(b);
    if (ra != rb) parent[ra] = rb;
}
bool Same(int a, int b) => Find(a) == Find(b);`,
      py: `parent = list(range(n))

def find(x):
    if parent[x] != x:
        parent[x] = find(parent[x])   # 경로 압축
    return parent[x]

def union(a, b):
    ra, rb = find(a), find(b)
    if ra != rb:
        parent[ra] = rb

def same(a, b):
    return find(a) == find(b)`,
      js: `const parent = Array.from({ length: n }, (_, i) => i);

function find(x) {
  while (parent[x] !== x) {
    parent[x] = parent[parent[x]];   // 경로 절반 압축
    x = parent[x];
  }
  return x;
}
function union(a, b) {
  const ra = find(a), rb = find(b);
  if (ra !== rb) parent[ra] = rb;
}
const same = (a, b) => find(a) === find(b);`
    }
  },
  {
    id: 'sieve', cat: '수학', title: '에라토스테네스의 체',
    note: 'n 이하 소수를 한 번에 모두 걸러내요. 작은 수의 배수를 지워 나가요.',
    code: {
      cs: `bool[] isPrime = new bool[n + 1];
Array.Fill(isPrime, true);
isPrime[0] = isPrime[1] = false;
for (int i = 2; (long)i * i <= n; i++) {
    if (!isPrime[i]) continue;
    for (int j = i * i; j <= n; j += i)
        isPrime[j] = false;
}
// isPrime[k] 가 true 이면 k 는 소수예요.`,
      py: `is_prime = [True] * (n + 1)
is_prime[0] = is_prime[1] = False
for i in range(2, int(n ** 0.5) + 1):
    if is_prime[i]:
        for j in range(i * i, n + 1, i):
            is_prime[j] = False

primes = [k for k in range(2, n + 1) if is_prime[k]]`,
      js: `const isPrime = new Array(n + 1).fill(true);
isPrime[0] = isPrime[1] = false;
for (let i = 2; i * i <= n; i++) {
  if (!isPrime[i]) continue;
  for (let j = i * i; j <= n; j += i) isPrime[j] = false;
}`
    }
  },
  {
    id: 'gcd', cat: '수학', title: '최대공약수와 최소공배수',
    note: '유클리드 호제법으로 GCD 를 구하고, 곱을 GCD 로 나눠 LCM 을 구해요.',
    code: {
      cs: `static long Gcd(long a, long b) => b == 0 ? a : Gcd(b, a % b);
static long Lcm(long a, long b) => a / Gcd(a, b) * b;   // 오버플로 방지로 먼저 나눠요`,
      py: `from math import gcd

g = gcd(a, b)
l = a // g * b   # 최소공배수`,
      js: `function gcd(a, b) { return b === 0 ? a : gcd(b, a % b); }
function lcm(a, b) { return a / gcd(a, b) * b; }`
    }
  },
  {
    id: 'backtrack', cat: '탐색', title: '순열 / 조합 / 백트래킹',
    note: '가능한 경우를 하나씩 만들어 보고, 막히면 되돌아와요. 조합은 시작 인덱스로 중복을 막아요.',
    code: {
      cs: `// nCk 조합 만들기
var pick = new List<int>();
void Combo(int start, int k) {
    if (pick.Count == k) {
        // pick 사용
        return;
    }
    for (int i = start; i < n; i++) {
        pick.Add(a[i]);
        Combo(i + 1, k);   // 다음은 i+1 부터 -> 중복 없음
        pick.RemoveAt(pick.Count - 1);   // 되돌리기
    }
}`,
      py: `# 표준 라이브러리
from itertools import permutations, combinations
for p in permutations(a, k): ...
for c in combinations(a, k): ...

# 직접 백트래킹 (조합)
pick = []
def combo(start, k):
    if len(pick) == k:
        # pick 사용
        return
    for i in range(start, len(a)):
        pick.append(a[i])
        combo(i + 1, k)
        pick.pop()   # 되돌리기`,
      js: `const pick = [];
function combo(start, k) {
  if (pick.length === k) {
    // pick 사용
    return;
  }
  for (let i = start; i < a.length; i++) {
    pick.push(a[i]);
    combo(i + 1, k);
    pick.pop();   // 되돌리기
  }
}`
    }
  },
  {
    id: 'twopointer', cat: '배열', title: '투 포인터 / 슬라이딩 윈도우',
    note: '두 포인터로 구간을 늘이고 줄이며 훑어요. 합이 조건을 넘으면 왼쪽을 당겨 O(n) 으로 풀어요.',
    code: {
      cs: `// 합이 target 이상인 가장 짧은 구간 길이
int left = 0, sum = 0, best = int.MaxValue;
for (int right = 0; right < n; right++) {
    sum += a[right];
    while (sum >= target) {
        best = Math.Min(best, right - left + 1);
        sum -= a[left++];
    }
}`,
      py: `left = 0
total = 0
best = float('inf')
for right in range(n):
    total += a[right]
    while total >= target:
        best = min(best, right - left + 1)
        total -= a[left]
        left += 1`,
      js: `let left = 0, sum = 0, best = Infinity;
for (let right = 0; right < n; right++) {
  sum += a[right];
  while (sum >= target) {
    best = Math.min(best, right - left + 1);
    sum -= a[left++];
  }
}`
    }
  },
  {
    id: 'prefix', cat: '배열', title: '누적 합',
    note: '미리 합을 쌓아두면 임의 구간 합을 상수 시간에 구해요. 구간 질의가 많을 때 써요.',
    code: {
      cs: `// 1차원: a[l..r] 합 = pre[r+1] - pre[l]
int[] pre = new int[n + 1];
for (int i = 0; i < n; i++) pre[i + 1] = pre[i] + a[i];
int sum = pre[r + 1] - pre[l];

// 2차원: (r1,c1)~(r2,c2) 직사각형 합
int[,] P = new int[R + 1, C + 1];
for (int i = 0; i < R; i++)
    for (int j = 0; j < C; j++)
        P[i + 1, j + 1] = g[i][j] + P[i, j + 1] + P[i + 1, j] - P[i, j];`,
      py: `# 1차원
pre = [0] * (n + 1)
for i in range(n):
    pre[i + 1] = pre[i] + a[i]
seg = pre[r + 1] - pre[l]

# 2차원
P = [[0] * (C + 1) for _ in range(R + 1)]
for i in range(R):
    for j in range(C):
        P[i + 1][j + 1] = g[i][j] + P[i][j + 1] + P[i + 1][j] - P[i][j]`,
      js: `// 1차원
const pre = new Array(n + 1).fill(0);
for (let i = 0; i < n; i++) pre[i + 1] = pre[i] + a[i];
const sum = pre[r + 1] - pre[l];`
    }
  },
  {
    id: 'toposort', cat: '그래프', title: '위상 정렬 (Kahn)',
    note: '선후 관계가 있는 작업의 처리 순서를 정해요. 진입 차수가 0 인 것부터 큐로 빼내요. 사이클이 있으면 일부가 남아요.',
    code: {
      cs: `var indeg = new int[n];
foreach (var (u, v) in edges) indeg[v]++;   // u -> v

var q = new Queue<int>();
for (int i = 0; i < n; i++) if (indeg[i] == 0) q.Enqueue(i);

var order = new List<int>();
while (q.Count > 0) {
    int u = q.Dequeue();
    order.Add(u);
    foreach (int v in adj[u]) {
        if (--indeg[v] == 0) q.Enqueue(v);
    }
}
// order.Count < n 이면 사이클이 있어요.`,
      py: `from collections import deque

indeg = [0] * n
for u, v in edges:   # u -> v
    indeg[v] += 1

q = deque(i for i in range(n) if indeg[i] == 0)
order = []
while q:
    u = q.popleft()
    order.append(u)
    for v in adj[u]:
        indeg[v] -= 1
        if indeg[v] == 0:
            q.append(v)
# len(order) < n 이면 사이클이 있어요.`,
      js: `const indeg = new Array(n).fill(0);
for (const [u, v] of edges) indeg[v]++;   // u -> v

const q = [];
for (let i = 0; i < n; i++) if (indeg[i] === 0) q.push(i);

const order = [];
for (let head = 0; head < q.length; head++) {
  const u = q[head];
  order.push(u);
  for (const v of adj[u]) {
    if (--indeg[v] === 0) q.push(v);
  }
}
// order.length < n 이면 사이클이 있어요.`
    }
  }
];
