# 卡特蘭數 · Catalan numbers

十二個看似毫不相干的互動計數問題，答案都是卡特蘭數 1, 1, 2, 5, 14, 42, 132, …

Live site: https://yuehhua.github.io/course/Catalan-numbers/

Each problem page is a step ladder: solve n = 1, 2, … by hand up to the stated problem, guess the next term,
let the computer enumerate n ≤ 6, then reveal the hidden balanced-parentheses code behind every object.

Teaching material for the Discrete Mathematics course at Taipei Medical University.

## Files

- `index.html` — overview and the live verification table
- `exNN-*.html` — one page per problem (generated from the same template; content lives in `catalan.js`)
- `catalan.js` — enumeration engine and the twelve problem definitions
- `catalan.css` — styles (light and dark themes)

No build step: static files, open `index.html` directly or serve the folder.
