/* 卡特蘭數十二題 — shared engine + the twelve example definitions.
 * Every example enumerates its objects by brute force (or direct construction),
 * and maps each object to a balanced-parentheses word (its "hidden code").
 * Pages: index.html (overview) and exNN-*.html (one example each, a step ladder). */
(function () {
'use strict';

/* ---------- small utilities ---------- */
const LET = 'abcdefghij';
function catalan(n) { let c = 1; for (let i = 0; i < n; i++) c = c * 2 * (2 * i + 1) / (i + 2); return Math.round(c); }
function binom(n, k) { let r = 1; for (let i = 1; i <= k; i++) r = r * (n - k + i) / i; return Math.round(r); }
function fact(n) { let r = 1; for (let i = 2; i <= n; i++) r *= i; return r; }
function isDyck(w) { let d = 0; for (const c of w) { d += c === '(' ? 1 : -1; if (d < 0) return false; } return d === 0; }
function hue(i) { return Math.round((i * 137.508 + 205) % 360); }
const R = x => Math.round(x * 10) / 10;

function h(tag, props, ...kids) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(props || {})) {
    if (k === 'class') e.className = v;
    else if (k === 'html') e.innerHTML = v;
    else if (k.startsWith('on')) e.addEventListener(k.slice(2), v);
    else if (v === true) e.setAttribute(k, '');
    else if (v !== false && v != null) e.setAttribute(k, v);
  }
  for (const c of kids.flat()) { if (c == null || c === false) continue; e.append(c instanceof Node ? c : document.createTextNode(c)); }
  return e;
}

/* all 0/1 sequences with n zeros and n ones */
function twoKinds(n) {
  const out = [], a = [];
  (function rec(z, o) {
    if (z === n && o === n) { out.push(a.slice()); return; }
    if (z < n) { a.push(0); rec(z + 1, o); a.pop(); }
    if (o < n) { a.push(1); rec(z, o + 1); a.pop(); }
  })(0, 0);
  return out;
}
function prefixOK(seq) { let d = 0; for (const s of seq) { d += s === 0 ? 1 : -1; if (d < 0) return false; } return true; }
function seqWord(seq) { return seq.map(s => s === 0 ? '(' : ')').join(''); }
function permutations(n) {
  const out = [], a = [], used = Array(n + 1).fill(false);
  (function rec() {
    if (a.length === n) { out.push(a.slice()); return; }
    for (let v = 1; v <= n; v++) if (!used[v]) { used[v] = true; a.push(v); rec(); a.pop(); used[v] = false; }
  })();
  return out;
}
function chordsCross(a, b, c, d) { // chords a<b and c<d on a circle
  return (a < c && c < b && b < d) || (c < a && a < d && d < b);
}

/* ---------- binary trees: null = leaf, {l, r} = internal node ---------- */
const treeMemo = {};
function allTrees(n) {
  if (n === 0) return [null];
  if (treeMemo[n]) return treeMemo[n];
  const out = [];
  for (let k = 0; k < n; k++) for (const l of allTrees(k)) for (const r of allTrees(n - 1 - k)) out.push({ l, r });
  return (treeMemo[n] = out);
}
function treeDyck(t) { return t ? '(' + treeDyck(t.l) + ')' + treeDyck(t.r) : ''; }

/* layouts return fresh records so shared subtrees are never mutated */
function btLayout(t) {
  let idx = 0, D = 0; const nodes = [], edges = [];
  (function go(t, d, parent) {
    if (!t) return;
    D = Math.max(D, d);
    const me = { d, t };
    go(t.l, d + 1, me); me.x = idx++; nodes.push(me); go(t.r, d + 1, me);
    if (parent) edges.push([parent, me]);
  })(t, 0, null);
  return { nodes, edges, W: Math.max(idx, 1), D };
}
function ptLayout(root) {
  let leaf = 0, D = 0; const nodes = [], edges = [];
  const go = (t, d) => {
    D = Math.max(D, d);
    const me = { d, t };
    const kids = t.c.map(c => go(c, d + 1));
    if (!kids.length) me.x = leaf++;
    else { me.x = (kids[0].x + kids[kids.length - 1].x) / 2; kids.forEach(k => edges.push([me, k])); }
    nodes.push(me); return me;
  };
  go(root, 0);
  return { nodes, edges, W: Math.max(leaf, 1), D };
}
function treeSVG(L, opt = {}) {
  const sx = opt.sx || 26, sy = opt.sy || 30, pad = opt.pad || 14, r = opt.r || 8;
  const W = (L.W - 1) * sx + 2 * pad, H = L.D * sy + 2 * pad;
  const X = m => R(pad + m.x * sx), Y = m => R(pad + m.d * sy);
  let s = '';
  for (const [a, b] of L.edges) s += `<line class="edge" x1="${X(a)}" y1="${Y(a)}" x2="${X(b)}" y2="${Y(b)}"/>`;
  for (const m of L.nodes) {
    const lab = opt.label ? opt.label(m) : '';
    const id = opt.id ? ` data-i="${opt.id(m)}" tabindex="0" role="button"` : '';
    s += `<g class="node ${m.d === 0 ? 'root' : ''}${opt.cls ? ' ' + opt.cls(m) : ''}"${id}><circle cx="${X(m)}" cy="${Y(m)}" r="${r}"/>${lab !== '' ? `<text x="${X(m)}" y="${Y(m) + 0.5}">${lab}</text>` : ''}</g>`;
  }
  return `<svg class="fig" viewBox="0 0 ${R(W)} ${R(H)}" style="max-width:${R(W * (opt.scale || 1.6))}px">${s}</svg>`;
}

/* ---------- the hidden code: parentheses + mountain ---------- */
function mountainSVG(w) {
  let y = 0, mx = 0; const pts = [[0, 0]];
  [...w].forEach((c, i) => { y += c === '(' ? 1 : -1; mx = Math.max(mx, y); pts.push([i + 1, y]); });
  const H = Math.max(mx, 1);
  return `<svg class="mtn" viewBox="-0.3 -0.3 ${w.length + 0.6} ${H + 0.6}" aria-hidden="true"><line class="sea" x1="0" y1="${H}" x2="${w.length}" y2="${H}"/><polyline points="${pts.map(([x, yy]) => `${x},${H - yy}`).join(' ')}"/></svg>`;
}
function codeHTML(w) { return `<code>${[...w].map(c => c === '(' ? '<i class="o">(</i>' : '<i class="c">)</i>').join('')}</code>`; }
function dyckHTML(w) { return codeHTML(w) + mountainSVG(w); }

/* ---------- example registry ---------- */
const EX = [];
const def = o => EX.push(Object.assign({ target: 3, extra: () => '' }, o));

/* ================= 01  售票口找零 (ballot / ticket) ================= */
function tokensSVG(seq, failAt = -1) {
  const w = 22; let s = '';
  seq.forEach((t, i) => {
    const cx = i * w + w / 2, bad = i === failAt ? ' bad' : '';
    s += t === 0
      ? `<g class="coin${bad}"><circle cx="${cx}" cy="13" r="9"/><text x="${cx}" y="13.5">50</text></g>`
      : `<g class="bill${bad}"><rect x="${cx - 10}" y="6" width="20" height="14" rx="2"/><text x="${cx}" y="13.5">100</text></g>`;
  });
  return `<svg class="fig" viewBox="0 0 ${Math.max(seq.length, 1) * w} 26" style="max-width:${Math.max(seq.length, 1) * 40}px">${s}</svg>`;
}
def({
  id: 'ticket', en: 'Ballot sequences', title: '電影院售票口的零錢',
  teaser: '一半的人拿 50 元、一半拿 100 元，售票口沒零錢。',
  question: '電影票一張 <b>50 元</b>。排隊的 6 個人裡，3 人拿 50 元硬幣、3 人拿 100 元鈔票；售票口開門時<b>一枚零錢都沒有</b>。只看「誰拿什麼錢」，有幾種排隊順序能讓每個拿 100 元的人都找得到零錢？',
  size: n => `${n} 人拿 50 元、${n} 人拿 100 元`,
  how: '用按鈕讓客人一個個排進隊伍（左邊先買）。拿 100 元的人來的時候，收銀機裡必須有 50 元可以找。',
  enumerate: n => twoKinds(n).filter(prefixOK),
  key: seq => seqWord(seq),
  draw: seq => tokensSVG(seq),
  extra: n => `（不管找不找得開，排法共有 C(${2 * n},${n}) = ${binom(2 * n, n)} 種，只有 1/${n + 1} 行得通）`,
  play(B, api, n) {
    let q = [];
    const fail = () => { let d = 0; for (let i = 0; i < q.length; i++) { d += q[i] === 0 ? 1 : -1; if (d < 0) return i; } return -1; };
    const add = t => {
      if (fail() >= 0) return;
      const c50 = q.filter(x => x === 0).length, c100 = q.length - c50;
      if (t === 0 && c50 >= n) return B.status(`拿 50 元的 ${n} 個人都已經排進來了。`, 'bad');
      if (t === 1 && c100 >= n) return B.status(`拿 100 元的 ${n} 個人都已經排進來了。`, 'bad');
      q.push(t); draw();
    };
    B.btn('+ 拿 50 元的人', () => add(0), 'primary');
    B.btn('+ 拿 100 元的人', () => add(1), 'primary');
    B.btn('上一步', () => { q.pop(); draw(); });
    B.btn('清空重來', () => { q = []; draw(); });
    function draw() {
      const f = fail();
      let drawer = 0; for (let i = 0; i < q.length && (f < 0 || i < f); i++) drawer += q[i] === 0 ? 1 : -1;
      B.stage.innerHTML = `<div class="ticket"><div class="booth">售票口</div><div class="queue">${q.length ? tokensSVG(q, f) : '<span class="muted">（還沒有人排隊）</span>'}</div></div>
        <p class="drawer">收銀機裡的 50 元硬幣：<b>${drawer}</b> 枚 ${'<span class="dot"></span>'.repeat(Math.max(drawer, 0))}</p>`;
      B.live(seqWord(q));
      if (f >= 0) B.status(`第 ${f + 1} 位拿 100 元，可是收銀機裡沒有 50 元能找！按「上一步」換個順序。`, 'bad');
      else if (q.length === 2 * n) api.done(B, n, seqWord(q));
      else B.status(`已排 ${q.length} / ${2 * n} 人。`);
    }
    draw();
  },
  why: `<p>把排隊順序想成一串「收 50、找 50」的帳。所有排法共有 C(2n, n) 種；壞的排法會在某一刻第一次欠錢。把那一刻<b>之後</b>的每個人手上的錢對調（50↔100），就得到一條「拿 50 的有 n−1 人、拿 100 的有 n+1 人」的隊伍，而且這個對應是一對一的（反射原理）。</p>
  <p>所以壞的排法有 C(2n, n+1) 種，好的排法有 C(2n, n) − C(2n, n+1) = <b>C(2n, n) / (n+1)</b>。這正是卡特蘭數的公式。</p>`,
  code: '拿 50 元寫 <code>(</code>，拿 100 元寫 <code>)</code>。「找得開零錢」就是「從左讀到右，<code>)</code> 永遠不比 <code>(</code> 多」——括號配得起來。'
});

/* ================= 02  計程車不過河 (lattice paths) ================= */
function taxiSVG(n, moves, big) {
  const S = big ? 300 : 100, s = S / n, m = big ? 22 : 8;
  let g = '';
  for (let i = 0; i <= n; i++) {
    g += `<line class="street" x1="${R(i * s)}" y1="0" x2="${R(i * s)}" y2="${S}"/><line class="street" x1="0" y1="${R(i * s)}" x2="${S}" y2="${R(i * s)}"/>`;
  }
  g += `<polygon class="bank" points="0,${S} ${S},0 0,0"/><line class="river" x1="0" y1="${S}" x2="${S}" y2="0"/>`;
  let x = 0, y = 0; const pts = [[0, S]];
  for (const c of moves) { if (c === 'E') x++; else y++; pts.push([R(x * s), R(S - y * s)]); }
  g += `<polyline class="route" points="${pts.map(p => p.join(',')).join(' ')}"/>`;
  g += `<circle class="cab" cx="${R(x * s)}" cy="${R(S - y * s)}" r="${big ? 8 : 4}"/>`;
  if (big) g += `<text class="lbl" x="-4" y="${S + 16}">出發</text><text class="lbl" x="${S + 4}" y="-8" text-anchor="end">目的地</text>`;
  return `<svg class="fig" viewBox="${-m} ${-m} ${S + 2 * m} ${S + 2 * m}" style="max-width:${big ? 380 : 160}px">${g}</svg>`;
}
def({
  id: 'taxi', en: 'Lattice paths', title: '計程車不能過河',
  teaser: '棋盤街道上只能往東或往北，河沿對角線流過。',
  question: '城市的街道是 3×3 的棋盤。計程車從西南角開到東北角，每一步只能<b>往東</b>或<b>往北</b>。一條河沿著對角線從西南流向東北，<b>沒有橋</b>：車可以貼著河岸開，但不能開到對岸。有幾條路線？',
  size: n => `${n}×${n} 的街區`,
  how: '按「往東」「往北」開車（也可以用方向鍵 → ↑）。車子必須留在河的東南岸。',
  enumerate: n => twoKinds(n).filter(prefixOK).map(seq => seq.map(s => s === 0 ? 'E' : 'N').join('')),
  key: m => m.replace(/E/g, '(').replace(/N/g, ')'),
  draw: (m, n) => taxiSVG(n, m, false),
  extra: n => `（沒有河的話，路線共有 C(${2 * n},${n}) = ${binom(2 * n, n)} 條）`,
  play(B, api, n) {
    let mv = '';
    const pos = () => { let x = 0, y = 0; for (const c of mv) c === 'E' ? x++ : y++; return [x, y]; };
    const go = d => {
      const [x, y] = pos(); if (x === n && y === n) return;
      const nx = x + (d === 'E'), ny = y + (d === 'N');
      if (nx > n || ny > n) return B.status('再走就出城了。', 'bad');
      if (ny > nx) return B.status('再往北就掉進河裡了！先往東開一點。', 'bad');
      mv += d; draw();
    };
    B.btn('往東 →', () => go('E'), 'primary');
    B.btn('往北 ↑', () => go('N'), 'primary');
    B.btn('上一步', () => { mv = mv.slice(0, -1); draw(); });
    B.btn('清空重來', () => { mv = ''; draw(); });
    B.stage.tabIndex = 0;
    B.stage.onkeydown = e => {
      if (e.key === 'ArrowRight') { e.preventDefault(); go('E'); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); go('N'); }
      else if (e.key === 'Backspace') { e.preventDefault(); mv = mv.slice(0, -1); draw(); }
    };
    function draw() {
      B.stage.innerHTML = taxiSVG(n, mv, true);
      B.live(mv.replace(/E/g, '(').replace(/N/g, ')'));
      const [x, y] = pos();
      if (x === n && y === n) api.done(B, n, mv.replace(/E/g, '(').replace(/N/g, ')'));
      else B.status(`已開 ${mv.length} / ${2 * n} 段路。`);
    }
    draw();
  },
  why: `<p>看車子<b>第一次回到河岸</b>的地方，假設是路口 (k+1, k+1)。在那之前，車一定先往東離岸，最後往北回岸，中間在一個 k×k 的小城裡做同樣的事（不碰到原本的河岸）；之後再從 (k+1, k+1) 走完剩下 (n−1−k)×(n−1−k) 的部分。</p>
  <p>所以 C<sub>n</sub> = Σ<sub>k</sub> C<sub>k</sub> · C<sub>n−1−k</sub>。</p>`,
  code: '往東寫 <code>(</code>，往北寫 <code>)</code>。「不過河」就是「任何時刻往北的次數不超過往東」。'
});

/* ================= 03  abcd 的括號 (parenthesizations) ================= */
function exprHTML(t, start = 0, outer = false) {
  let i = start;
  const p = (c, d) => `<span class="pr" style="--h:${hue(d)}">${c}</span>`;
  const go = (t, d, top) => {
    if (!t) return `<span class="lt">${LET[i++]}</span>`;
    const s = go(t.l, d + 1, false) + go(t.r, d + 1, false);
    return top && !outer ? s : p('(', d) + s + p(')', d);
  };
  return go(t, 0, true);
}
def({
  id: 'brackets', en: 'Parenthesizations', title: 'abcd 要先乘哪兩個？',
  teaser: '一次只能乘兩個數，加括號決定先後順序。',
  question: '計算 <b>a·b·c·d</b> 時，一次只能把<b>相鄰</b>的兩個東西相乘，括號決定先算哪一對，例如 ((ab)c)d 或 (ab)(cd)。字母順序不能改變。總共有幾種加括號的方式？',
  size: n => `${n + 1} 個字母 ${LET.slice(0, n + 1)}（${n} 次乘法）`,
  how: '點兩塊之間的 <b>×</b>，代表「下一步先把這兩塊乘起來」。乘到只剩一塊就完成。',
  enumerate: n => allTrees(n),
  key: t => treeDyck(t),
  draw: t => `<div class="expr">${exprHTML(t)}</div>`,
  play(B, api, n) {
    let blocks, hist;
    const init = () => { blocks = [...Array(n + 1)].map((_, i) => ({ t: null, start: i, size: 1 })); hist = []; };
    B.btn('上一步', () => { if (hist.length) { blocks = hist.pop(); draw(); } });
    B.btn('清空重來', () => { init(); draw(); });
    const merge = i => {
      hist.push(blocks.slice());
      const a = blocks[i], b = blocks[i + 1];
      blocks.splice(i, 2, { t: { l: a.t, r: b.t }, start: a.start, size: a.size + b.size });
      draw();
    };
    function draw() {
      B.stage.innerHTML = '';
      const row = h('div', { class: 'blocks' });
      blocks.forEach((b, i) => {
        row.append(h('span', { class: 'block', html: exprHTML(b.t, b.start, blocks.length > 1) }));
        if (i < blocks.length - 1) row.append(h('button', { class: 'mul', type: 'button', 'aria-label': `先算第 ${i + 1} 塊乘第 ${i + 2} 塊`, onclick: () => merge(i) }, '×'));
      });
      B.stage.append(row);
      if (blocks.length === 1) { B.live(treeDyck(blocks[0].t)); api.done(B, n, treeDyck(blocks[0].t)); }
      else { B.live(''); B.status(`還要乘 ${blocks.length - 1} 次。`); }
    }
    init(); draw();
  },
  why: `<p>看<b>最後一次</b>乘法：它把 n+1 個字母切成左右兩段，左段 k+1 個字母、右段 n−k 個字母（k = 0, 1, …, n−1）。兩段各自加括號、互不干擾，所以方法數相乘。</p>
  <p>於是 C<sub>n</sub> = C<sub>0</sub>C<sub>n−1</sub> + C<sub>1</sub>C<sub>n−2</sub> + … + C<sub>n−1</sub>C<sub>0</sub>。例如 C<sub>3</sub> = 1·2 + 1·1 + 2·1 = 5。</p>`,
  code: '把最後一次乘法寫成 <code>(</code> 左段的括號碼 <code>)</code> 右段的括號碼，再一路展開。n 次乘法就是 n 對括號。'
});

/* ================= 04  圓桌握手 (non-crossing matchings) ================= */
function ringPts(N, cx, cy, Rr) { return [...Array(N)].map((_, i) => { const a = -Math.PI / 2 + 2 * Math.PI * i / N; return [R(cx + Rr * Math.cos(a)), R(cy + Rr * Math.sin(a))]; }); }
function handsSVG(partner, big, sel = -1, bad = null) {
  const N = partner.length, S = big ? 360 : 100, c = S / 2, Rr = S * 0.4, P = ringPts(N, c, c, Rr), r = big ? 14 : 4.5;
  let g = `<circle class="table" cx="${c}" cy="${c}" r="${R(Rr * 0.82)}"/>`;
  partner.forEach((p, i) => { if (p > i) g += `<line class="hand" x1="${P[i][0]}" y1="${P[i][1]}" x2="${P[p][0]}" y2="${P[p][1]}"/>`; });
  if (bad) g += `<line class="hand bad" x1="${P[bad[0]][0]}" y1="${P[bad[0]][1]}" x2="${P[bad[1]][0]}" y2="${P[bad[1]][1]}"/>`;
  P.forEach(([x, y], i) => {
    g += `<g class="person${i === sel ? ' sel' : ''}${partner[i] >= 0 ? ' done' : ''}"${big ? ` data-i="${i}" tabindex="0" role="button" aria-label="${i + 1} 號"` : ''}><circle cx="${x}" cy="${y}" r="${r}"/>${big ? `<text x="${x}" y="${y + 0.5}">${i + 1}</text>` : ''}</g>`;
  });
  return `<svg class="fig" viewBox="0 0 ${S} ${S}" style="max-width:${big ? 380 : 150}px">${g}</svg>`;
}
function matchKey(p) { return p.map((q, i) => q > i ? '(' : ')').join(''); }
function crossesAny(p, a, b) {
  const [x, y] = a < b ? [a, b] : [b, a];
  for (let i = 0; i < p.length; i++) if (p[i] > i && chordsCross(x, y, i, p[i])) return true;
  return false;
}
def({
  id: 'handshake', en: 'Non-crossing handshakes', title: '圓桌握手不交叉',
  teaser: '圍著圓桌同時兩兩握手，手臂不能交叉。',
  question: '<b>6 個人</b>圍著圓桌坐，大家<b>同時</b>兩兩握手：每個人都恰好跟一個人握到手，而且任何兩條手臂都<b>不能交叉</b>。有幾種握法？',
  size: n => `${2 * n} 個人`,
  how: '點一個人，再點另一個人，他們就握手。點已經在握手的人可以讓他放手。',
  enumerate: n => {
    const N = 2 * n, out = [], p = Array(N).fill(-1);
    (function rec() {
      const i = p.indexOf(-1);
      if (i < 0) { out.push(p.slice()); return; }
      for (let j = i + 1; j < N; j++) if (p[j] < 0) { p[i] = j; p[j] = i; rec(); p[i] = p[j] = -1; }
    })();
    return out.filter(q => q.every((j, i) => j < i || !crossesAny(q.map((x, k) => (k === i || k === j) ? -1 : x), i, j)));
  },
  key: matchKey,
  draw: p => handsSVG(p, false),
  extra: n => `（允許交叉的話有 ${(2 * n - 1)}·${2 * n - 3 > 0 ? (2 * n - 3) + '·…' : ''} = ${fact(2 * n) / (fact(n) * 2 ** n)} 種）`,
  play(B, api, n) {
    const N = 2 * n; let p = Array(N).fill(-1), sel = -1, bad = null;
    B.btn('清空重來', () => { p = Array(N).fill(-1); sel = -1; draw(); });
    const pick = i => {
      bad = null;
      if (p[i] >= 0) { const j = p[i]; p[i] = p[j] = -1; sel = -1; return draw(); }
      if (sel < 0) { sel = i; return draw(); }
      if (sel === i) { sel = -1; return draw(); }
      if (crossesAny(p, sel, i)) { bad = [sel, i]; sel = -1; draw(); return B.status('這兩條手臂會交叉，不行！', 'bad'); }
      p[sel] = i; p[i] = sel; sel = -1; draw();
    };
    bindPick(B.stage, i => pick(+i));
    function draw() {
      B.stage.innerHTML = handsSVG(p, true, sel, bad);
      if (p.every(x => x >= 0)) { B.live(matchKey(p)); api.done(B, n, matchKey(p)); }
      else { B.live(''); if (!bad) B.status(sel >= 0 ? `${sel + 1} 號要跟誰握手？` : `已有 ${p.filter(x => x >= 0).length / 2} / ${n} 對握手。`); }
    }
    draw();
  },
  why: `<p>看 <b>1 號</b>跟誰握手。他的手臂把圓桌切成兩邊，兩邊的人只能跟同一邊的人握手（否則就交叉）。所以每一邊都要有偶數個人：一邊 2k 人、另一邊 2(n−1−k) 人。</p>
  <p>兩邊各自獨立，方法數相乘再加總：C<sub>n</sub> = Σ<sub>k</sub> C<sub>k</sub> · C<sub>n−1−k</sub>。</p>`,
  code: '從 1 號開始繞桌子一圈：遇到一對握手的<b>第一個人</b>寫 <code>(</code>、<b>第二個人</b>寫 <code>)</code>。手臂不交叉 ⇔ 括號配得起來。'
});

/* ================= 05  多邊形切三角形 (triangulations) ================= */
function polyPts(N, cx, cy, Rr) { return [...Array(N)].map((_, i) => { const a = Math.PI / 2 + Math.PI / N + 2 * Math.PI * i / N; return [R(cx + Rr * Math.cos(a)), R(cy + Rr * Math.sin(a))]; }); }
function triParse(N, diags) {
  const has = new Set(diags.map(([a, b]) => a + '-' + b));
  for (let i = 0; i < N - 1; i++) has.add(i + '-' + (i + 1));
  has.add('0-' + (N - 1));
  const tris = [];
  const rec = (i, j) => {
    if (j - i < 2) return null;
    for (let k = i + 1; k < j; k++) if (has.has(i + '-' + k) && has.has(k + '-' + j)) { tris.push([i, k, j]); return { l: rec(i, k), r: rec(k, j) }; }
    return null;
  };
  const tree = rec(0, N - 1);
  return { tree, tris };
}
function polySVG(N, diags, big, sel = -1, bad = null) {
  const S = big ? 360 : 100, P = polyPts(N, S / 2, S * 0.53, S * 0.42), r = big ? 11 : 0;
  let g = '';
  if (diags.length === N - 3) triParse(N, diags).tris.forEach((t, i) => { g += `<polygon class="hf" style="--h:${hue(i)}" points="${t.map(v => P[v].join(',')).join(' ')}"/>`; });
  g += `<polygon class="outline" points="${P.map(p => p.join(',')).join(' ')}"/>`;
  diags.forEach(([a, b]) => { g += `<line class="diag" x1="${P[a][0]}" y1="${P[a][1]}" x2="${P[b][0]}" y2="${P[b][1]}"/>`; });
  if (bad) g += `<line class="diag bad" x1="${P[bad[0]][0]}" y1="${P[bad[0]][1]}" x2="${P[bad[1]][0]}" y2="${P[bad[1]][1]}"/>`;
  if (big) P.forEach(([x, y], i) => { g += `<g class="vertex${i === sel ? ' sel' : ''}" data-i="${i}" tabindex="0" role="button" aria-label="頂點 ${i + 1}"><circle cx="${x}" cy="${y}" r="${r}"/></g>`; });
  return `<svg class="fig" viewBox="0 0 ${S} ${S}" style="max-width:${big ? 380 : 150}px">${g}</svg>`;
}
def({
  id: 'polygon', en: 'Polygon triangulations', title: '把多邊形切成三角形',
  teaser: '只用不交叉的對角線，把凸多邊形切成三角形。',
  question: '一個<b>凸五邊形</b>，只能畫<b>互不交叉的對角線</b>，把它整個切成三角形。有幾種切法？',
  size: n => `凸 ${n + 2} 邊形`,
  how: '點一個頂點，再點另一個頂點，就畫出一條對角線。切成三角形就完成。',
  enumerate: n => {
    const N = n + 2, D = [], out = [], cur = [];
    for (let i = 0; i < N; i++) for (let j = i + 2; j < N; j++) if (!(i === 0 && j === N - 1)) D.push([i, j]);
    (function rec(s) {
      if (cur.length === N - 3) { out.push(cur.slice()); return; }
      for (let t = s; t < D.length; t++) if (cur.every(d => !chordsCross(d[0], d[1], D[t][0], D[t][1]))) { cur.push(D[t]); rec(t + 1); cur.pop(); }
    })(0);
    return out;
  },
  key: (d, n) => treeDyck(triParse(n + 2, d).tree),
  draw: (d, n) => polySVG(n + 2, d, false),
  play(B, api, n) {
    const N = n + 2; let d = [], sel = -1, bad = null;
    B.btn('上一步', () => { d.pop(); bad = null; draw(); });
    B.btn('清空重來', () => { d = []; sel = -1; bad = null; draw(); });
    const pick = i => {
      bad = null;
      if (sel < 0) { sel = i; return draw(); }
      const a = Math.min(sel, i), b = Math.max(sel, i); sel = -1;
      if (a === b) return draw();
      if (b - a === 1 || (a === 0 && b === N - 1)) { draw(); return B.status('這兩點相鄰，連起來是邊，不是對角線。', 'bad'); }
      if (d.some(x => x[0] === a && x[1] === b)) { draw(); return B.status('這條對角線已經畫過了。', 'bad'); }
      if (d.some(x => chordsCross(a, b, x[0], x[1]))) { bad = [a, b]; draw(); return B.status('會和已經畫好的對角線交叉。', 'bad'); }
      d.push([a, b]); draw();
    };
    bindPick(B.stage, i => pick(+i));
    function draw() {
      B.stage.innerHTML = polySVG(N, d, true, sel, bad);
      if (d.length === N - 3) {
        const k = treeDyck(triParse(N, d).tree); B.live(k);
        if (n === 1) B.status('三角形本來就是三角形，一條線都不用畫。');
        api.done(B, n, k);
      } else { B.live(''); if (!bad) B.status(`已畫 ${d.length} / ${N - 3} 條對角線。`); }
    }
    draw();
  },
  why: `<p>看<b>底邊</b>：它一定屬於某個三角形，這個三角形的第三個頂點把剩下的部分切成左右兩個小多邊形（可能是空的）。左邊是 (k+2) 邊形、右邊是 (n+1−k) 邊形，各自獨立地切。</p>
  <p>所以 C<sub>n</sub> = Σ<sub>k</sub> C<sub>k</sub> · C<sub>n−1−k</sub>，其中 C<sub>n</sub> 是 (n+2) 邊形的切法數。這個問題是歐拉在 1751 年研究的，比卡特蘭本人還早一百年。</p>`,
  code: '每個三角形是一對括號：底邊上的三角形寫成 <code>(</code> 左邊小多邊形的碼 <code>)</code> 右邊小多邊形的碼。n 個三角形就是 n 對括號。'
});

/* ================= 06  火車調度場 (stack-sortable) ================= */
function carsSVG(perm) {
  const w = 30; let s = '';
  perm.forEach((v, i) => { s += `<g class="car"><rect class="hf" style="--h:${hue(v)}" x="${i * w + 2}" y="3" width="${w - 4}" height="20" rx="3"/><text x="${i * w + w / 2}" y="13.5">${v}</text></g>`; });
  return `<svg class="fig" viewBox="0 0 ${perm.length * w} 26" style="max-width:${perm.length * 46}px">${s}</svg>`;
}
function stackOps(perm) { // returns op word if perm is realisable, else null
  const st = []; let next = 1, w = '';
  for (const p of perm) {
    while (st[st.length - 1] !== p) { if (next > perm.length) return null; st.push(next++); w += '('; }
    st.pop(); w += ')';
  }
  return w;
}
def({
  id: 'train', en: 'Stack permutations', title: '火車調度場',
  teaser: '車廂只能開進一條死巷側線，再倒出來。',
  question: '編號 1、2、3 的<b>3 節車廂</b>依序從右邊開來。中間有一條<b>死巷側線</b>：每節車廂都要先開進側線，之後只能從同一個口倒出來（後進去的先出來），然後往左開走。左邊出站的順序有幾種可能？',
  size: n => `${n} 節車廂`,
  how: '用「開進側線」「開出側線」兩個按鈕調度。全部車廂開到左邊就完成。',
  enumerate: n => permutations(n).filter(p => stackOps(p)),
  key: p => stackOps(p),
  draw: p => carsSVG(p),
  extra: n => `（${n} 節車廂的排列共有 ${n}! = ${fact(n)} 種，只有這些調度得出來）`,
  play(B, api, n) {
    let inq, st, out, ops;
    const init = () => { inq = [...Array(n)].map((_, i) => i + 1); st = []; out = []; ops = ''; };
    const push = () => { if (!inq.length) return B.status('右邊已經沒有車廂了。', 'bad'); st.push(inq.shift()); ops += '('; draw(); };
    const pop = () => { if (!st.length) return B.status('側線是空的。', 'bad'); out.push(st.pop()); ops += ')'; draw(); };
    B.btn('↓ 開進側線', push, 'primary');
    B.btn('← 開出側線', pop, 'primary');
    B.btn('清空重來', () => { init(); draw(); });
    const car = (v, x, y) => `<g class="car"><rect class="hf" style="--h:${hue(v)}" x="${x}" y="${y}" width="36" height="22" rx="4"/><text x="${x + 18}" y="${y + 11.5}">${v}</text></g>`;
    function draw() {
      let g = `<line class="rail" x1="8" y1="60" x2="632" y2="60"/><line class="rail" x1="320" y1="60" x2="320" y2="236"/>
        <text class="lbl" x="12" y="30">出站 ←</text><text class="lbl" x="628" y="30" text-anchor="end">← 進站</text><text class="lbl" x="336" y="230">死巷側線</text>`;
      out.forEach((v, i) => { g += car(v, 12 + i * 44, 49); });
      inq.forEach((v, i) => { g += car(v, 340 + i * 44, 49); });
      st.forEach((v, i) => { g += car(v, 302, 80 + (st.length - 1 - i) * 26); });
      B.stage.innerHTML = `<svg class="fig" viewBox="0 0 640 244" style="max-width:640px">${g}</svg>`;
      B.live(ops);
      if (out.length === n) api.done(B, n, ops);
      else B.status(`出站順序：${out.join(' ') || '（還沒有）'}`);
    }
    init(); draw();
  },
  why: `<p>看 <b>1 號車</b>：它最先開進側線。在它開出來之前，緊接著進來又出去的是 2, 3, …, k+1 號這 k 節（它們在 1 號上方完成一段完整的調度）；1 號出站後，剩下 n−1−k 節再自己調度。</p>
  <p>兩段各自獨立：C<sub>n</sub> = Σ<sub>k</sub> C<sub>k</sub> · C<sub>n−1−k</sub>。高德納 (Knuth) 在《電腦程式設計藝術》裡用這個「堆疊排序」問題介紹卡特蘭數。</p>`,
  code: '開進側線寫 <code>(</code>，開出側線寫 <code>)</code>。側線不能倒出空車 ⇔ 括號配得起來；而每種出站順序恰好對應一種操作序列。'
});

/* ================= 07  二元搜尋樹 (BST shapes) ================= */
function bstInsert(t, v) { if (!t) return { v, l: null, r: null }; if (v < t.v) t.l = bstInsert(t.l, v); else t.r = bstInsert(t.r, v); return t; }
def({
  id: 'bst', en: 'Binary search trees', title: '二元搜尋樹長什麼樣',
  teaser: '同一組數字換個插入順序，樹的形狀就不同。',
  question: '把 <b>1、2、3</b> 依某個順序一個一個插入二元搜尋樹：比節點小的往左走、大的往右走，走到空位就停下來。3! = 6 種插入順序，能長出幾種<b>不同形狀</b>的樹？',
  size: n => `數字 1 到 ${n}`,
  how: '依序點數字，把它插進樹裡。所有數字都插完就完成。',
  enumerate: n => {
    const m = new Map();
    for (const p of permutations(n)) {
      let t = null; for (const v of p) t = bstInsert(t, v);
      const k = treeDyck(t);
      if (m.has(k)) m.get(k).orders++; else m.set(k, { t, orders: 1, first: p });
    }
    return [...m.values()];
  },
  key: o => treeDyck(o.t),
  draw: o => treeSVG(btLayout(o.t), { label: m => m.t.v, scale: 1.4 }) + `<span class="note">${o.orders} 種順序</span>`,
  extra: n => `（${n}! = ${fact(n)} 種插入順序，長出的形狀只有這些）`,
  play(B, api, n) {
    let t = null, used = [];
    B.btn('清空重來', () => { t = null; used = []; draw(); });
    const pad = h('div', { class: 'numpad' });
    B.top.after(pad);
    function draw() {
      pad.innerHTML = '';
      for (let v = 1; v <= n; v++) pad.append(h('button', { type: 'button', class: 'btn num', disabled: used.includes(v), onclick: () => { t = bstInsert(t, v); used.push(v); draw(); } }, String(v)));
      B.stage.innerHTML = t ? treeSVG(btLayout(t), { label: m => m.t.v, scale: 2.2 }) : '<p class="muted">（樹還是空的）</p>';
      B.live(t ? treeDyck(t) : '');
      if (used.length === n) {
        const o = api.items(n).find(x => x.key === treeDyck(t));
        api.done(B, n, treeDyck(t), `插入順序 ${used.join('→')}；長成這個形狀的順序共有 ${o.o.orders} 種。`);
      } else B.status(`插入順序：${used.join(' → ') || '（還沒開始）'}`);
    }
    draw();
  },
  why: `<p>第一個插入的數字成為樹根，假設它是 k+1。比它小的 1…k 全部落在左子樹，比它大的 k+2…n 全部落在右子樹，兩邊的形狀各自獨立。</p>
  <p>所以 C<sub>n</sub> = Σ<sub>k</sub> C<sub>k</sub> · C<sub>n−1−k</sub>：有 n 個節點的二元樹形狀數，就是卡特蘭數。</p>`,
  code: '每個節點寫成 <code>(</code> 左子樹的碼 <code>)</code> 右子樹的碼。這和「abcd 的括號」用的是同一種二元樹。'
});

/* ================= 08  公司組織圖 (plane trees) ================= */
function allPlane(n) { return forests(n).map(f => ({ c: f })); }
function forests(n) {
  if (n === 0) return [[]];
  const out = [];
  for (let k = 0; k < n; k++) for (const t of allPlane(k)) for (const rest of forests(n - 1 - k)) out.push([t, ...rest]);
  return out;
}
function ptKey(t) { return t.c.map(c => '(' + ptKey(c) + ')').join(''); }
def({
  id: 'orgchart', en: 'Ordered trees', title: '公司組織圖',
  teaser: '一位老闆，其他人都有唯一的直屬主管。',
  question: '一家公司有 <b>4 個人</b>：一位老闆，其他每人都有<b>唯一</b>的直屬主管。畫組織圖時，同一主管底下的部屬<b>有左右順序</b>。不看名字只看形狀，能畫出幾種組織圖？',
  size: n => `${n + 1} 個人（老闆 + ${n} 位員工）`,
  how: '點組織圖裡的任何一個人，就幫他加一位新部屬（排在最右邊）。',
  enumerate: n => allPlane(n),
  key: ptKey,
  draw: t => treeSVG(ptLayout(t), { scale: 1.3 }),
  play(B, api, n) {
    let root, id, hist;
    const init = () => { root = { id: 0, c: [] }; id = 1; hist = []; };
    const find = (t, i) => { if (t.id === i) return t; for (const c of t.c) { const f = find(c, i); if (f) return f; } return null; };
    B.btn('上一步', () => { const p = hist.pop(); if (p) { p.c.pop(); id--; draw(); } });
    B.btn('清空重來', () => { init(); draw(); });
    bindPick(B.stage, i => {
      if (id - 1 >= n) return B.status(`已經有 ${n + 1} 個人了。`, 'bad');
      const p = find(root, +i); p.c.push({ id: id++, c: [] }); hist.push(p); draw();
    });
    function draw() {
      B.stage.innerHTML = treeSVG(ptLayout(root), { scale: 2.4, id: m => m.t.id, label: m => m.d === 0 ? '闆' : '' });
      B.live(ptKey(root));
      if (id - 1 === n) api.done(B, n, ptKey(root));
      else B.status(`公司現在有 ${id} / ${n + 1} 人。點一個人幫他加部屬。`);
    }
    init(); draw();
  },
  why: `<p>看老闆<b>最左邊</b>的那位部屬：他和他底下的整個部門共有 k+1 人，自己形成一張組織圖；把這個部門拿掉，剩下的公司（老闆加上其他部門）有 n−k 人，也是一張組織圖。</p>
  <p>反過來，任給這兩張圖都能拼回去，所以 C<sub>n</sub> = Σ<sub>k</sub> C<sub>k</sub> · C<sub>n−1−k</sub>。</p>`,
  code: '從老闆出發，沿著組織圖的外圍順時針繞一圈：<b>往下</b>走一條線寫 <code>(</code>，<b>走回上面</b>寫 <code>)</code>。每條線剛好走下去一次、回來一次。'
});

/* ================= 09  疊硬幣 (coin stacks) ================= */
function coinRows(n) { // all stacks: list of [k,j] coins incl. bottom row
  const out = [];
  (function rec(k, prev, acc) {
    const slots = [];
    for (let j = 0; j + 1 < prev.length; j++) if (prev[j] && prev[j + 1]) slots.push(j);
    const m = slots.length;
    for (let mask = 0; mask < (1 << m); mask++) {
      const row = Array(Math.max(prev.length - 1, 0)).fill(false), add = [];
      slots.forEach((j, b) => { if (mask >> b & 1) { row[j] = true; add.push([k, j]); } });
      if (!add.length) out.push(acc.slice());
      else rec(k + 1, row, acc.concat(add));
    }
  })(1, Array(n).fill(true), [...Array(n)].map((_, j) => [0, j]));
  return out;
}
function coinKey(coins) {
  const n = coins.filter(c => c[0] === 0).length, H = Array(2 * n + 1).fill(0);
  for (const [k, j] of coins) { const x = 2 * j + 1 + k; H[x] = Math.max(H[x], k + 1); }
  let w = ''; for (let x = 0; x < 2 * n; x++) w += H[x + 1] > H[x] ? '(' : ')';
  return w;
}
const SQ3 = Math.sqrt(3);
function coinsSVG(n, coins, big, ghosts = []) {
  const r = 10, W = 2 * r * n, Ht = 2 * r + (n - 1) * r * SQ3, cx = (k, j) => R((2 * j + 1 + k) * r), cy = (k) => R(Ht - r - k * r * SQ3);
  let g = `<line class="tabletop" x1="-4" y1="${R(Ht)}" x2="${W + 4}" y2="${R(Ht)}"/>`;
  ghosts.forEach(([k, j]) => { g += `<g class="ghost" data-i="a${k},${j}" tabindex="0" role="button" aria-label="放一枚硬幣"><circle cx="${cx(k, j)}" cy="${cy(k)}" r="${r - 1}"/></g>`; });
  coins.forEach(([k, j]) => { g += `<g class="coinc"${big && k > 0 ? ` data-i="r${k},${j}" tabindex="0" role="button" aria-label="拿掉這枚硬幣"` : ''}><circle cx="${cx(k, j)}" cy="${cy(k)}" r="${r - 0.8}"/><circle class="rim" cx="${cx(k, j)}" cy="${cy(k)}" r="${r - 3.5}"/></g>`; });
  return `<svg class="fig" viewBox="-4 -4 ${W + 8} ${R(Ht + 8)}" style="max-width:${big ? Math.min(W * 4, 420) : 150}px">${g}</svg>`;
}
def({
  id: 'coins', en: 'Coin stacks', title: '疊硬幣',
  teaser: '每一枚硬幣都要卡在下面兩枚的凹槽裡。',
  question: '桌上有一排緊靠在一起的 <b>3 枚硬幣</b>。往上疊的每一枚硬幣，都必須卡在<b>下面兩枚相鄰硬幣</b>之間的凹槽裡。底排不動，上面可以疊任意多枚，也可以完全不疊。有幾種疊法？',
  size: n => `底排 ${n} 枚硬幣`,
  how: '點虛線圈放一枚硬幣；點上層的硬幣可以拿掉（上面沒壓著東西才行）。疊好之後按「記下這個疊法」。',
  enumerate: n => coinRows(n),
  key: coinKey,
  draw: (c, n) => coinsSVG(n, c, false),
  play(B, api, n) {
    let S;
    const init = () => { S = new Set([...Array(n)].map((_, j) => `0,${j}`)); };
    B.btn('記下這個疊法', () => api.done(B, n, coinKey(list())), 'primary');
    B.btn('清空重來', () => { init(); draw(); });
    const list = () => [...S].map(s => s.split(',').map(Number));
    bindPick(B.stage, id => {
      const [k, j] = id.slice(1).split(',').map(Number);
      if (id[0] === 'a') S.add(`${k},${j}`);
      else {
        if (S.has(`${k + 1},${j - 1}`) || S.has(`${k + 1},${j}`)) return B.status('上面還壓著硬幣，先拿掉上面那枚。', 'bad');
        S.delete(`${k},${j}`);
      }
      draw();
    });
    function draw() {
      const ghosts = [];
      for (let k = 1; k < n; k++) for (let j = 0; j + k < n; j++) if (!S.has(`${k},${j}`) && S.has(`${k - 1},${j}`) && S.has(`${k - 1},${j + 1}`)) ghosts.push([k, j]);
      B.stage.innerHTML = coinsSVG(n, list(), true, ghosts);
      B.live(coinKey(list()));
      B.status(n === 1 ? '只有一枚硬幣，上面沒有凹槽可以放。直接記下吧。' : `目前疊了 ${S.size - n} 枚。`);
    }
    init(); draw();
  },
  why: `<p>沿著硬幣堆的<b>外輪廓</b>從左下走到右下：每經過一枚「露在最上面」的硬幣就爬上它的頂、再下來。這條輪廓有 n 段上坡、n 段下坡，而且永遠不會低於桌面——它是一條「山脈」。</p>
  <p>反過來，任給一條這樣的山脈，把山脈底下塞滿硬幣就得到唯一的疊法。所以疊法數和山脈數一樣多，都是 C<sub>n</sub>。</p>`,
  code: '沿著外輪廓從左走到右：上坡寫 <code>(</code>、下坡寫 <code>)</code>。開關「隱藏的括號」下方的小山，就是硬幣堆的輪廓。'
});

/* ================= 10  兩排合照 (2×n standard Young tableaux) ================= */
function photoSVG(n, front, back) {
  const w = 20, top = 2, H = 84, bar = v => 8 + 30 * v / (2 * n);
  let g = '';
  const row = (arr, base, cls) => arr.forEach((v, i) => { const hh = bar(v); g += `<g class="kid ${cls}"><rect x="${i * w + 3}" y="${R(base - hh)}" width="${w - 6}" height="${R(hh)}" rx="3"/><text x="${i * w + w / 2}" y="${base + 7}">${v}</text></g>`; });
  row(back, 36, 'back'); row(front, 74, 'front');
  return `<svg class="fig" viewBox="0 ${top} ${n * w} ${H}" style="max-width:${n * 34}px">${g}</svg>`;
}
def({
  id: 'photo', en: 'Two-row tableaux', title: '兩排畢業合照',
  teaser: '每排由矮到高，後排要比正前方的人高。',
  question: '<b>6 位</b>身高都不同的同學（1 號最矮、6 號最高）拍合照，分<b>前後兩排各 3 人</b>。攝影師要求：每一排由左到右越來越高，而且後排每個人都要比他<b>正前方</b>的同學高。有幾種站法？',
  size: n => `${2 * n} 位同學，前後排各 ${n} 人`,
  how: '點一位同學，他會走到前排；再點一次換到後排；再點一次回到等候區。每排會自動由矮到高排好。',
  enumerate: n => twoKinds(n).filter(prefixOK),
  key: seq => seqWord(seq),
  draw: (seq, n) => { const f = [], b = []; seq.forEach((s, i) => (s === 0 ? f : b).push(i + 1)); return photoSVG(n, f, b); },
  extra: n => `（只要求每排由矮到高的話，有 C(${2 * n},${n}) = ${binom(2 * n, n)} 種）`,
  play(B, api, n) {
    let st;
    const init = () => { st = Array(2 * n + 1).fill(0); };
    B.btn('清空重來', () => { init(); draw(); });
    const rows = () => { const f = [], b = []; for (let v = 1; v <= 2 * n; v++) { if (st[v] === 1) f.push(v); if (st[v] === 2) b.push(v); } return [f, b]; };
    bindPick(B.stage, v => {
      v = +v; const [f, b] = rows();
      let s = st[v]; // cycle: waiting(0) → front(1) → back(2) → waiting, skipping a full row
      for (let t = 0; t < 3; t++) { s = (s + 1) % 3; if ((s === 1 && f.length >= n) || (s === 2 && b.length >= n)) continue; break; }
      st[v] = s; draw();
    });
    function draw() {
      const [f, b] = rows(), pool = [];
      for (let v = 1; v <= 2 * n; v++) if (st[v] === 0) pool.push(v);
      const bad = new Set(); b.forEach((v, i) => { if (f[i] !== undefined && v < f[i]) { bad.add(v); bad.add(f[i]); } });
      const kid = v => `<button type="button" class="kidbtn${bad.has(v) ? ' bad' : ''}" data-i="${v}" aria-label="${v} 號同學"><span class="bar" style="height:${12 + 52 * v / (2 * n)}px"></span><span class="num">${v}</span></button>`;
      const slot = (arr) => arr.map(kid).join('') + '<span class="slot"></span>'.repeat(n - arr.length);
      B.stage.innerHTML = `<div class="photo"><div class="prow"><span class="plabel">後排</span>${slot(b)}</div><div class="prow"><span class="plabel">前排</span>${slot(f)}</div><div class="prow pool"><span class="plabel">等候</span>${pool.map(kid).join('')}</div></div>`;
      const seq = []; for (let v = 1; v <= 2 * n; v++) if (st[v]) seq.push(st[v] === 1 ? 0 : 1);
      if (bad.size) B.status('紅色的同學：後排的人比他正前方的人矮，會被擋住。', 'bad');
      else if (f.length === n && b.length === n) { const w = seqWord(seq); B.live(w); api.done(B, n, w); }
      else { B.live(''); B.status(`前排 ${f.length} / ${n}，後排 ${b.length} / ${n}。`); }
    }
    init(); draw();
  },
  why: `<p>讓同學<b>從最矮到最高</b>依序入列，而且每排都從左邊往右補位。輪到某人站後排時，他正前方的位置必須<b>已經有人</b>，而且那人一定比他矮（因為先入列）。</p>
  <p>所以條件就是：任何時刻，後排人數都不能超過前排。這和「售票口找零」完全是同一件事，答案也是 C(2n, n)/(n+1)。</p>`,
  code: '從 1 號叫到最高的人：站前排寫 <code>(</code>，站後排寫 <code>)</code>。'
});

/* ================= 11  圍圈拉繩 (non-crossing partitions) ================= */
function ncOK(lab) {
  const n = lab.length;
  for (let a = 0; a < n; a++) for (let b = a + 1; b < n; b++) if (lab[a] !== lab[b])
    for (let c = b + 1; c < n; c++) if (lab[c] === lab[a]) for (let d = c + 1; d < n; d++) if (lab[d] === lab[b]) return false;
  return true;
}
function blocksOf(lab) { const m = new Map(); lab.forEach((l, i) => { if (!m.has(l)) m.set(l, []); m.get(l).push(i); }); return [...m.values()]; }
function ropeKey(lab) {
  const bl = blocksOf(lab), maxOf = new Map(); bl.forEach(b => maxOf.set(b[b.length - 1], b.length));
  let w = ''; for (let i = 0; i < lab.length; i++) { w += '('; if (maxOf.has(i)) w += ')'.repeat(maxOf.get(i)); }
  return w;
}
function setPartitions(n) {
  const out = [], a = [];
  (function rec(i, mx) { if (i === n) { out.push(a.slice()); return; } for (let v = 0; v <= mx + 1; v++) { a.push(v); rec(i + 1, Math.max(mx, v)); a.pop(); } })(0, -1);
  return out;
}
function ropesSVG(lab, big, sel = -1) {
  const n = lab.length, S = big ? 360 : 100, c = S / 2, P = ringPts(n, c, c, S * 0.38), r = big ? 15 : 5;
  let g = `<circle class="table" cx="${c}" cy="${c}" r="${R(S * 0.38)}"/>`;
  blocksOf(lab).forEach(b => {
    const h0 = hue(b[0]);
    if (b.length === 2) g += `<line class="rope" style="--h:${h0}" x1="${P[b[0]][0]}" y1="${P[b[0]][1]}" x2="${P[b[1]][0]}" y2="${P[b[1]][1]}"/>`;
    else if (b.length > 2) g += `<polygon class="hf rope" style="--h:${h0}" points="${b.map(i => P[i].join(',')).join(' ')}"/>`;
  });
  P.forEach(([x, y], i) => {
    const b = blocksOf(lab).find(bb => bb.includes(i));
    g += `<g class="person grp${i === sel ? ' sel' : ''}" style="--h:${hue(b[0])}"${big ? ` data-i="${i}" tabindex="0" role="button" aria-label="${i + 1} 號"` : ''}><circle cx="${x}" cy="${y}" r="${r}"/>${big ? `<text x="${x}" y="${y + 0.5}">${i + 1}</text>` : ''}</g>`;
  });
  return `<svg class="fig" viewBox="0 0 ${S} ${S}" style="max-width:${big ? 380 : 150}px">${g}</svg>`;
}
def({
  id: 'ropes', en: 'Non-crossing partitions', title: '圍成一圈分組拉繩子', target: 4,
  teaser: '分組後每組拉一條繩子圍起來，繩子不能交叉。',
  question: '<b>4 個人</b>站成一圈，要分成幾個小組（一個人也可以自成一組）。每一組拉一條繩子把組員圍起來，繩子拉直貼在地上，<b>不同組的繩子不能交叉</b>。有幾種分組方法？',
  size: n => `${n} 個人`,
  how: '點一個人、再點另一個人，就把兩人所在的組合併成一組。點同一個人兩次，他就退出原本的組。分好之後按「就這樣分」。',
  enumerate: n => setPartitions(n).filter(ncOK),
  key: ropeKey,
  draw: lab => ropesSVG(lab, false),
  extra: n => `（不管繩子交不交叉，分組方法共有 ${setPartitions(n).length} 種；交叉從 4 人才開始出現）`,
  play(B, api, n) {
    let lab, sel = -1, nextL;
    const init = () => { lab = [...Array(n)].map((_, i) => i); nextL = n; sel = -1; };
    B.btn('就這樣分', () => api.done(B, n, ropeKey(lab)), 'primary');
    B.btn('清空重來', () => { init(); draw(); });
    bindPick(B.stage, i => {
      i = +i;
      if (sel < 0) { sel = i; return draw(); }
      if (sel === i) { lab[i] = nextL++; sel = -1; return draw(); }
      const a = lab[sel], b = lab[i], L2 = lab.map(x => x === b ? a : x); sel = -1;
      if (!ncOK(L2)) { draw(); return B.status('這樣合併，繩子會和別組交叉。', 'bad'); }
      lab = L2; draw();
    });
    function draw() {
      B.stage.innerHTML = ropesSVG(lab, true, sel);
      B.live(ropeKey(lab));
      B.status(sel >= 0 ? `${sel + 1} 號要和誰同一組？（再點他自己就是退出原組）` : `目前分成 ${blocksOf(lab).length} 組。`);
    }
    init(); draw();
  },
  why: `<p>把每個人拆成相鄰的「左手」和「右手」兩個點，圓上就有 2n 個點。同一組的人，手牽手沿著繩子連起來：每個人的右手牽下一位組員的左手，最後一位組員的右手牽回第一位的左手。</p>
  <p>繩子不交叉 ⇔ 這 2n 個點的牽手也不交叉。所以分組方法數，等於 2n 人圍桌握手不交叉的方法數：C<sub>n</sub>。</p>`,
  code: '依 1, 2, …, n 走一遍：每走到一個人寫一個 <code>(</code>；如果他是自己組裡<b>編號最大</b>的，就再寫上和組員人數一樣多的 <code>)</code>。'
});

/* ================= 12  階梯鋪磚 (staircase tilings) ================= */
function stairTilings(n) {
  const inS = (x, y) => x >= 0 && y >= 0 && x + y <= n - 1;
  const cov = new Set(), out = [], cur = [];
  const isCorner = (x, y) => x + y === n - 1;
  let cornersLeft = n;
  (function rec() {
    if (cur.length + cornersLeft > n) return;
    let fx = -1, fy = -1;
    outer: for (let y = 0; y < n; y++) for (let x = 0; x + y < n; x++) if (!cov.has(x + ',' + y)) { fx = x; fy = y; break outer; }
    if (fx < 0) { if (cur.length === n) out.push(cur.slice()); return; }
    for (let w = 1; inS(fx + w - 1, fy) && !cov.has((fx + w - 1) + ',' + fy); w++) {
      for (let hh = 1; ; hh++) {
        const y = fy + hh - 1; let ok = true;
        for (let x = fx; x < fx + w; x++) if (!inS(x, y) || cov.has(x + ',' + y)) { ok = false; break; }
        if (!ok) break;
        const cells = []; let cc = 0;
        for (let yy = fy; yy <= y; yy++) for (let x = fx; x < fx + w; x++) { cells.push(x + ',' + yy); if (isCorner(x, yy)) cc++; }
        cells.forEach(c => cov.add(c)); cornersLeft -= cc; cur.push([fx, fy, fx + w - 1, y]);
        rec();
        cur.pop(); cornersLeft += cc; cells.forEach(c => cov.delete(c));
      }
    }
  })();
  return out;
}
function stairKey(rects, n) {
  const go = (ox, oy, m) => {
    if (m === 0) return '';
    const r = rects.find(([x0, y0]) => x0 === ox && y0 === oy);
    const k = r[2] - ox;
    return '(' + go(ox, oy + m - k, k) + ')' + go(ox + k + 1, oy, m - 1 - k);
  };
  return go(0, 0, n);
}
function stairSVG(n, rects, big, pick = null) {
  const S = big ? 320 : 100, s = S / n, X = x => R(x * s), Y = y => R((n - 1 - y) * s);
  let g = '';
  for (let y = 0; y < n; y++) for (let x = 0; x + y < n; x++) g += `<rect class="cell${pick && pick[0] === x && pick[1] === y ? ' sel' : ''}"${big ? ` data-i="${x},${y}" tabindex="0" role="button" aria-label="格子 ${x + 1},${y + 1}"` : ''} x="${X(x)}" y="${Y(y)}" width="${R(s)}" height="${R(s)}"/>`;
  rects.forEach(([x0, y0, x1, y1], i) => { g += `<rect class="hf tile" style="--h:${hue(i)}" x="${X(x0) + 1.5}" y="${Y(y1) + 1.5}" width="${R((x1 - x0 + 1) * s) - 3}" height="${R((y1 - y0 + 1) * s) - 3}" rx="${big ? 4 : 2}"/>`; });
  return `<svg class="fig" viewBox="-2 -2 ${S + 4} ${S + 4}" style="max-width:${big ? 360 : 140}px">${g}</svg>`;
}
def({
  id: 'staircase', en: 'Staircase tilings', title: '用 n 塊磚鋪階梯',
  teaser: '階梯形的地板，用剛好 n 塊長方形磚鋪滿。',
  question: '一塊 <b>3 階</b>的階梯形地板：最下面一列 3 格、中間 2 格、最上面 1 格，左邊對齊。要用<b>剛好 3 塊</b>長方形磚把它鋪滿，磚不能重疊、不能超出地板。有幾種鋪法？',
  size: n => `${n} 階的階梯，${n} 塊磚`,
  how: '點一格當作磚的一個角，再點另一格當作對角（同一格點兩下就是 1×1 的磚）。點已經鋪好的磚可以拿掉。',
  enumerate: n => stairTilings(n),
  key: stairKey,
  draw: (r, n) => stairSVG(n, r, false),
  play(B, api, n) {
    let rects = [], pick = null;
    const total = n * (n + 1) / 2;
    const owner = (x, y) => rects.findIndex(([x0, y0, x1, y1]) => x >= x0 && x <= x1 && y >= y0 && y <= y1);
    B.btn('清空重來', () => { rects = []; pick = null; draw(); });
    bindPick(B.stage, id => {
      const [x, y] = id.split(',').map(Number);
      if (!pick) {
        const o = owner(x, y);
        if (o >= 0) { rects.splice(o, 1); return draw(); }
        pick = [x, y]; return draw();
      }
      const x0 = Math.min(x, pick[0]), x1 = Math.max(x, pick[0]), y0 = Math.min(y, pick[1]), y1 = Math.max(y, pick[1]);
      pick = null;
      for (let yy = y0; yy <= y1; yy++) for (let xx = x0; xx <= x1; xx++) {
        if (xx + yy > n - 1) { draw(); return B.status('這塊磚會超出階梯。', 'bad'); }
        if (owner(xx, yy) >= 0) { draw(); return B.status('這塊磚會壓到已經鋪好的磚。', 'bad'); }
      }
      rects.push([x0, y0, x1, y1]); draw();
    });
    function draw() {
      B.stage.innerHTML = stairSVG(n, rects, true, pick);
      const covered = rects.reduce((s, [x0, y0, x1, y1]) => s + (x1 - x0 + 1) * (y1 - y0 + 1), 0);
      if (covered === total && rects.length === n) { const k = stairKey(rects, n); B.live(k); api.done(B, n, k); return; }
      B.live('');
      if (covered === total) B.status(`鋪滿了，但用了 ${rects.length} 塊。題目要求剛好 ${n} 塊。`, 'bad');
      else if (rects.length >= n) B.status(`${n} 塊磚用完了，還有空格。拿掉一塊試試更大的磚。`, 'bad');
      else B.status(pick ? '再點一格當作對角。' : `已鋪 ${rects.length} / ${n} 塊，蓋住 ${covered} / ${total} 格。`);
    }
    draw();
  },
  why: `<p>階梯外緣有 n 個「凸角」格（每一列最右邊那格）。一塊長方形磚最多只能包含其中一個凸角，所以剛好 n 塊磚時，每塊磚各分到一個凸角。</p>
  <p>看蓋住<b>左下角</b>那一格的磚：它一路延伸到某個凸角，把剩下的地板切成上方一個 k 階、右方一個 n−1−k 階的小階梯。於是 C<sub>n</sub> = Σ<sub>k</sub> C<sub>k</sub> · C<sub>n−1−k</sub>。</p>`,
  code: '左下角那塊磚寫成 <code>(</code> 上方小階梯的碼 <code>)</code> 右方小階梯的碼，再遞迴展開。'
});

/* ---------- enumeration cache (sorted by hidden code so #k matches across pages) ---------- */
const cache = new Map();
function items(ex, n) {
  const id = ex.id + ':' + n;
  if (!cache.has(id)) {
    const list = ex.enumerate(n).map(o => ({ o, key: ex.key(o, n) }));
    list.sort((a, b) => a.key < b.key ? -1 : a.key > b.key ? 1 : 0);
    cache.set(id, list);
  }
  return cache.get(id);
}
function verify(ex, n) {
  const L = items(ex, n), keys = L.map(x => x.key);
  return { count: L.length, ok: L.length === catalan(n) && keys.every(k => k.length === 2 * n && isDyck(k)) && new Set(keys).size === keys.length };
}

/* ---------- pointer + keyboard picking inside an SVG stage ---------- */
function bindPick(stage, fn) {
  stage.addEventListener('click', e => { const t = e.target.closest('[data-i]'); if (t && stage.contains(t)) fn(t.dataset.i); });
  stage.addEventListener('keydown', e => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const t = e.target.closest('[data-i]'); if (!t) return;
    e.preventDefault(); const idx = t.dataset.i; fn(idx);
    requestAnimationFrame(() => { const again = stage.querySelector(`[data-i="${CSS.escape(idx)}"]`); if (again) again.focus(); });
  });
}

/* ---------- persistence (per viewer, optional) ---------- */
function load(id) { try { return JSON.parse(localStorage.getItem('catalan:' + id)) || null; } catch (e) { return null; } }
function save(id, v) { try { localStorage.setItem('catalan:' + id, JSON.stringify(v)); } catch (e) { /* storage unavailable: progress lasts for this visit */ } }

/* ---------- page: one example as a step ladder ---------- */
const SUB = ['₀', '₁', '₂', '₃', '₄', '₅', '₆', '₇', '₈', '₉'];
const Cn = n => 'C' + String(n).split('').map(d => SUB[d]).join('');
function fileOf(ex) { return `ex${String(EX.indexOf(ex) + 1).padStart(2, '0')}-${ex.id}.html`; }

function mountPage(id) {
  const i = EX.findIndex(e => e.id === id), ex = EX[i], T = ex.target;
  const prev = EX[i - 1], next = EX[i + 1];
  const st = Object.assign({ found: {}, guessed: false, unlockAll: false }, load(id) || {});
  for (let n = 1; n <= T; n++) st.found[n] = (st.found[n] || []).filter(k => items(ex, n).some(x => x.key === k));
  const levelDone = n => st.found[n].length === catalan(n);
  const solved = () => levelDone(T);
  const open = s => st.unlockAll || (s === 'guess' ? solved() : solved() && st.guessed);
  const persist = () => save(id, st);

  const app = document.getElementById('app');
  app.innerHTML = `
  <nav class="top"><a class="back" href="index.html">← 卡特蘭數十二題</a><span class="crumb">第 ${String(i + 1).padStart(2, '0')} / 12 題 · ${ex.en}</span></nav>
  <header class="puzzle">
    <h1>${ex.title}</h1>
    <p class="lead">${ex.question}</p>
  </header>
  <ol class="steps" id="steps"></ol>
  <section class="panel" id="s-play">
    <div class="sec-head"><h2><span class="sn">1</span>從最簡單的開始</h2><p class="muted">先把 n 縮到最小，自己動手找出<b>所有</b>可能；找齊了就升級，一路做到本題。</p></div>
    <div class="levels" id="levels" role="tablist" aria-label="關卡"></div>
    <p class="levelnote" id="levelnote"></p>
    <div class="bench" id="bench"></div>
    <div class="collect">
      <div class="collect-head"><h3 id="col-title">你找到的</h3><div class="collect-actions"><button type="button" class="btn small" id="check">我找齊了嗎？</button><button type="button" class="btn small primary" id="nextlv" hidden>下一關 →</button></div></div>
      <p class="checkmsg" id="checkmsg" aria-live="polite"></p>
      <div class="grid" id="mine"></div>
    </div>
  </section>
  <section class="panel" id="s-guess">
    <div class="sec-head"><h2><span class="sn">2</span>找規律：猜下一個</h2></div>
    <div class="lock" id="lock-guess">先解出本題（n = ${T}），這一步才會打開。</div>
    <div id="guess" hidden></div>
  </section>
  <section class="panel" id="s-all">
    <div class="sec-head"><h2><span class="sn">3</span>交給電腦：全部列出來</h2></div>
    <div class="lock" id="lock-all">先完成「猜下一個」，這一步才會打開。</div>
    <div id="all" hidden>
      <div class="gal-controls"><div class="chips" id="chips" role="group" aria-label="選 n"></div><label class="switch"><input type="checkbox" id="reveal"><span>顯示隱藏的括號</span></label></div>
      <p class="tally" id="tally"></p>
      <div class="grid" id="grid"></div>
    </div>
  </section>
  <section class="panel" id="s-why">
    <div class="sec-head"><h2><span class="sn">4</span>為什麼是卡特蘭數？</h2></div>
    <div class="lock" id="lock-why">先完成「猜下一個」，這一步才會打開。</div>
    <div class="why" id="why" hidden>
      <div><h3>拆成兩塊</h3>${ex.why}</div>
      <div><h3>隱藏的括號</h3><p>${ex.code}</p><p>打開上面的「顯示隱藏的括號」開關，每張圖下方都會出現它的括號碼和對應的山脈。圖依括號碼排序，所以<b>每一題的第 k 號都對應同一串括號</b>。</p></div>
    </div>
  </section>
  <nav class="pager">
    ${prev ? `<a href="${fileOf(prev)}"><span class="muted">← 上一題</span><b>${prev.title}</b></a>` : '<span></span>'}
    ${next ? `<a class="nx" href="${fileOf(next)}"><span class="muted">下一題 →</span><b>${next.title}</b></a>` : `<a class="nx" href="index.html#finale"><span class="muted">最後 →</span><b>回首頁對答案</b></a>`}
  </nav>
  <p class="teacher"><button type="button" class="linkbtn" id="unlock">老師模式：全部解鎖</button> · <button type="button" class="linkbtn" id="resetall">清除這一題的進度</button></p>`;

  const $ = s => app.querySelector(s);
  let level = 1;
  for (let n = 1; n <= T; n++) if (n === 1 || levelDone(n - 1) || st.unlockAll) level = n;
  if (solved()) level = T;

  /* step tracker */
  function renderSteps() {
    const steps = [
      ...[...Array(T)].map((_, k) => ({ t: k + 1 === T ? `n = ${T}（本題）` : `n = ${k + 1}`, done: levelDone(k + 1), href: '#s-play' })),
      { t: `猜 ${Cn(T + 1)}`, done: st.guessed, href: '#s-guess' },
      { t: '全部列出', done: open('all') && st.guessed, href: '#s-all' },
      { t: '為什麼', done: false, href: '#s-why' }];
    $('#steps').innerHTML = steps.map(s => `<li class="${s.done ? 'done' : ''}"><a href="${s.href}">${s.t}</a></li>`).join('');
  }

  /* level tabs */
  const notes = {
    1: '熱身：最小的情況。可能只有一種，也可能讓你意外。',
    2: '大一號：多試幾種做法，把所有可能都找出來。',
    3: '再大一號。每找到一種新的，它就會出現在下方的收藏裡。'
  };
  function renderLevels() {
    $('#levels').innerHTML = '';
    for (let n = 1; n <= T; n++) {
      const unlocked = n === 1 || levelDone(n - 1) || st.unlockAll;
      $('#levels').append(h('button', { type: 'button', role: 'tab', class: 'lv' + (levelDone(n) ? ' done' : ''), 'aria-selected': String(n === level), disabled: !unlocked,
        onclick: () => { level = n; startLevel(); } }, `n = ${n}${n === T ? '（本題）' : ''}`, h('small', {}, levelDone(n) ? `${catalan(n)} 種 ✓` : unlocked ? `已找到 ${st.found[n].length}` : '未解鎖')));
    }
    $('#levelnote').innerHTML = `<b>${ex.size(level)}</b>　${level === T ? '這就是本題的大小。' : (notes[level] || '')}　${ex.how}`;
  }

  function renderMine() {
    const L = items(ex, level), mine = st.found[level];
    $('#col-title').textContent = `你找到的（n = ${level}）：${mine.length} 種`;
    $('#mine').innerHTML = mine.length ? mine.map((k, j) => { const it = L.find(x => x.key === k); return card(it, j + 1, ''); }).join('') : '<p class="muted empty">還沒有。在上面完成一個，就會收進這裡。</p>';
    $('#nextlv').hidden = !levelDone(level);
    $('#nextlv').textContent = level < T ? `下一關：n = ${level + 1} →` : '本題解完！去找規律 ↓';
  }
  const card = (it, num, cls) => `<figure class="spec ${cls}" data-key="${it.key}"><span class="idx">${num}</span><div class="art">${ex.draw(it.o, it.key.length / 2)}</div><figcaption class="dyck">${dyckHTML(it.key)}</figcaption></figure>`;

  $('#check').onclick = () => {
    const miss = catalan(level) - st.found[level].length;
    $('#checkmsg').className = 'checkmsg ' + (miss ? 'bad' : 'ok');
    $('#checkmsg').textContent = miss ? `還沒——還有 ${miss} 種沒找到。` : `找齊了！n = ${level} 一共 ${catalan(level)} 種。`;
  };
  $('#nextlv').onclick = () => {
    if (level < T) { level++; startLevel(); $('#s-play').scrollIntoView({ block: 'start' }); }
    else $('#s-guess').scrollIntoView({ block: 'start' });
  };

  const api = {
    items: n => items(ex, n),
    done(B, n, key, extra = '') {
      B.live(key);
      const mine = st.found[n], k = mine.indexOf(key);
      if (k >= 0) { B.status(`完成！不過這種你已經找過了（收藏裡第 ${k + 1} 個）。${extra} 按「清空重來」換個做法。`, ''); flash(key); return; }
      mine.push(key); persist();
      const all = mine.length === catalan(n);
      B.status(all ? `新的一種！n = ${n} 的 ${catalan(n)} 種全部找齊了。${extra}` : `新的一種！收進第 ${mine.length} 個。${extra} 按「清空重來」再找一種。`, 'ok');
      renderMine(); renderLevels(); renderSteps(); flash(key); refreshLocks();
      $('#checkmsg').textContent = '';
    }
  };
  function flash(key) { const c = $('#mine').querySelector(`[data-key="${key}"]`); if (c) { c.classList.remove('hit'); void c.offsetWidth; c.classList.add('hit'); } }

  function startLevel() { renderLevels(); renderMine(); ex.play(makeBench($('#bench')), api, level); $('#checkmsg').textContent = ''; }

  /* step 2: guess */
  function renderGuess() {
    const g = $('#guess'), Tn = T + 1;
    const rows = [...Array(T)].map((_, k) => `<tr><td>${k + 1}</td><td>${catalan(k + 1)}</td></tr>`).join('');
    g.innerHTML = `
      <div class="guess-grid">
        <table class="mini"><thead><tr><th>n</th><th>你找到的種數</th></tr></thead><tbody>${rows}<tr class="q"><td>${Tn}</td><td>？</td></tr></tbody></table>
        <div>
          <p>你手上的數列是 ${[...Array(T)].map((_, k) => catalan(k + 1)).join(', ')}。下一個（n = ${Tn}）會是多少？用「拆成兩塊」的想法：把問題切成左右兩個<b>更小、互不干擾</b>的同類問題，兩邊方法數相乘，再把所有切法加起來。</p>
          <form class="guessform" id="gform"><label for="gin">n = ${Tn} 時有幾種？</label><input id="gin" inputmode="numeric" autocomplete="off" placeholder="輸入數字"><button class="btn primary" type="submit">對答案</button></form>
          <p class="checkmsg" id="gmsg" aria-live="polite"></p>
          <details class="hint"><summary>提示</summary><p>約定 C₀ = 1（空的問題只有一種做法：什麼都不做）。那麼 ${Cn(Tn)} = ${[...Array(Tn)].map((_, k) => `${Cn(k)}·${Cn(Tn - 1 - k)}`).join(' + ')}。</p></details>
        </div>
      </div>`;
    if (st.guessed) $('#gmsg').innerHTML = `答對了：${Cn(Tn)} = ${catalan(Tn)}。`, $('#gmsg').className = 'checkmsg ok';
    $('#gform').onsubmit = e => {
      e.preventDefault();
      const v = parseInt($('#gin').value, 10), m = $('#gmsg');
      if (v === catalan(Tn)) {
        m.className = 'checkmsg ok';
        m.innerHTML = `答對了！${Cn(Tn)} = ${[...Array(Tn)].map((_, k) => `${catalan(k)}·${catalan(Tn - 1 - k)}`).join(' + ')} = <b>${catalan(Tn)}</b>。往下讓電腦全部列出來驗證。`;
        st.guessed = true; persist(); refreshLocks(); renderSteps();
      } else if (Number.isNaN(v)) { m.className = 'checkmsg bad'; m.textContent = '請輸入一個整數。'; }
      else { m.className = 'checkmsg bad'; m.textContent = `${v} 不對。${v < catalan(Tn) ? '比答案小。' : '比答案大。'}打開下面的提示，把每一種「切法」的方法數算出來再加總。`; }
    };
  }

  /* step 3: computer gallery */
  let gN = Math.min(T + 1, 6);
  function renderChips() {
    $('#chips').innerHTML = '';
    for (let n = 1; n <= 6; n++) $('#chips').append(h('button', { type: 'button', class: 'chip', 'aria-pressed': String(n === gN), onclick: () => { gN = n; renderChips(); renderGallery(); } }, `n = ${n}`));
  }
  function renderGallery() {
    const L = items(ex, gN), ok = verify(ex, gN).ok;
    $('#tally').innerHTML = `<b>${ex.size(gN)}</b>：電腦逐一列舉，共 <span class="big">${L.length}</span> 種 <span class="badge ${ok ? 'ok' : 'bad'}">${Cn(gN)} = ${catalan(gN)} ${ok ? '✓' : '✗'}</span> <span class="muted">${ex.extra(gN)}</span>`;
    $('#grid').innerHTML = L.map((it, j) => card(it, j + 1, '')).join('');
  }
  const rv = $('#reveal');
  rv.checked = !!(load('reveal'));
  const applyReveal = () => document.body.classList.toggle('reveal', rv.checked);
  rv.onchange = () => { save('reveal', rv.checked); applyReveal(); };
  applyReveal();

  function refreshLocks() {
    $('#lock-guess').hidden = open('guess'); $('#guess').hidden = !open('guess');
    for (const s of ['all', 'why']) { $('#lock-' + s).hidden = open(s); $('#' + s).hidden = !open(s); }
  }
  $('#unlock').onclick = () => { st.unlockAll = true; persist(); renderLevels(); refreshLocks(); renderSteps(); };
  $('#resetall').onclick = () => { st.found = {}; for (let n = 1; n <= T; n++) st.found[n] = []; st.guessed = false; st.unlockAll = false; persist(); level = 1; startLevel(); renderGuess(); refreshLocks(); renderSteps(); };

  renderSteps(); startLevel(); renderGuess(); renderChips(); renderGallery(); refreshLocks();
}

function makeBench(el) {
  el.innerHTML = '';
  const top = h('div', { class: 'bench-top' });
  const stage = h('div', { class: 'stage' });
  const status = h('p', { class: 'status', 'aria-live': 'polite' });
  const live = h('p', { class: 'live dyck' });
  el.append(top, stage, status, live);
  return {
    top, stage,
    btn(label, fn, cls = '') { const b = h('button', { type: 'button', class: 'btn ' + cls, onclick: fn }, label); top.append(b); return b; },
    status(msg, kind = '') { status.innerHTML = msg; status.className = 'status ' + kind; },
    live(w) { live.innerHTML = w ? `隱藏的括號：${codeHTML(w)}` : ''; }
  };
}

/* ---------- index page ---------- */
function mountIndex() {
  const app = document.getElementById('app');
  const seq = [...Array(11)].map((_, n) => catalan(n));
  app.innerHTML = `
  <header class="hero">
    <p class="eyebrow">離散數學 · 組合計數</p>
    <h1>卡特蘭數</h1>
    <p class="subtitle">十二種樣貌，同一個結構</p>
    <p class="lead">乘法順序、圓桌握手、售票口找零、火車調度、疊硬幣……下面十二個問題看起來毫不相干，每一題都在問「有幾種」。每一題都從最小的 n = 1 開始，自己動手找出所有可能，再一步步推到題目要的大小。</p>
    <div class="seqline" aria-label="卡特蘭數前幾項">${seq.map((c, n) => `<span class="term"><small>${Cn(n)}</small><b>${c}</b></span>`).join('')}<span class="term more">…</span></div>
  </header>
  <section>
    <div class="sec-head"><h2>十二個問題</h2><p class="muted">由淺入深排列。前幾題的動作最單純，越後面的題目越難看出它和括號的關係。</p></div>
    <div class="cards" id="cards"></div>
  </section>
  <section id="finale">
    <div class="sec-head"><h2>對答案</h2><p class="muted">下表每一格都是電腦當場逐一列舉、數出來的個數，不是抄公式。最後一欄檢查每個物件都翻得成一串合法括號，而且不同物件的括號都不同（一一對應）。</p></div>
    <div class="tablewrap"><table class="verify" id="verify"></table></div>
  </section>
  <section class="why">
    <div><h3>同一個遞迴</h3><p>每一題都能「拆成兩塊」：找到一個特別的部分（最後一次乘法、1 號握手的對象、第一次回到河岸……），它把問題切成左右兩個更小、互不干擾的同類問題。所以</p>
      <p class="formula">C<sub>0</sub> = 1，　C<sub>n</sub> = C<sub>0</sub>C<sub>n−1</sub> + C<sub>1</sub>C<sub>n−2</sub> + … + C<sub>n−1</sub>C<sub>0</sub></p>
      <p>同一個遞迴、同一個起點，就得到同一串數。解開遞迴得到 C<sub>n</sub> = <span class="frac"><span>1</span><span>n+1</span></span>·C(2n, n)。</p></div>
    <div><h3>同一串括號</h3><p>每一頁的最後都會揭曉一套翻譯規則，把那一題的每個答案翻成 n 對配好的括號。翻譯是一對一的，所以每一題的個數都等於「n 對括號有幾種配法」。</p>
      <p>名稱來自比利時數學家 Eugène Catalan（1838）；歐拉在 1751 年數多邊形切法時已經遇到它。延伸閱讀：<a href="https://en.wikipedia.org/wiki/Catalan_number" target="_blank" rel="noopener">Wikipedia: Catalan number</a>。</p></div>
  </section>`;
  const cards = app.querySelector('#cards');
  EX.forEach((ex, i) => {
    const L = items(ex, ex.target), sample = L[Math.min(1, L.length - 1)];
    const prog = load(ex.id), got = prog && prog.found ? Object.keys(prog.found).filter(n => prog.found[n].length === catalan(+n)).length : 0;
    cards.append(h('a', { class: 'excard', href: fileOf(ex) },
      h('span', { class: 'no' }, String(i + 1).padStart(2, '0')),
      h('div', { class: 'art', html: ex.draw(sample.o, ex.target) }),
      h('h3', {}, ex.title),
      h('p', {}, ex.teaser),
      h('span', { class: 'prog' + (got ? ' started' : '') }, got ? `已完成 ${got} / ${ex.target} 關` : `從 n = 1 開始 · 本題 n = ${ex.target}`)));
  });
  const ns = [1, 2, 3, 4, 5, 6];
  let t = `<thead><tr><th>問題</th>${ns.map(n => `<th>n = ${n}</th>`).join('')}<th>一一對應</th></tr></thead><tbody>`;
  EX.forEach((ex, i) => {
    const v = ns.map(n => verify(ex, n));
    t += `<tr><td><a href="${fileOf(ex)}">${String(i + 1).padStart(2, '0')} ${ex.title}</a></td>${v.map(x => `<td class="${x.ok ? '' : 'bad'}">${x.count}</td>`).join('')}<td class="${v.every(x => x.ok) ? 'ok' : 'bad'}">${v.every(x => x.ok) ? '✓' : '✗'}</td></tr>`;
  });
  t += `</tbody><tfoot><tr><td>卡特蘭數 C<sub>n</sub></td>${ns.map(n => `<td>${catalan(n)}</td>`).join('')}<td></td></tr></tfoot>`;
  app.querySelector('#verify').innerHTML = t;
}

const api = { EX, catalan, items, verify, isDyck, mountPage, mountIndex, fileOf };
if (typeof module !== 'undefined' && module.exports) module.exports = api; else window.Catalan = api;
})();
