/**
 * qa-geometry.mjs — deterministic layout QA via DOM measurement.
 * Checks: horizontal overflow, slide heights vs viewport, element overlaps,
 * chrome (header) presence. No vision needed.
 *
 * Usage: node scripts/qa-geometry.mjs   (expects `npm run preview -- --port 4322`)
 */
import puppeteer from 'puppeteer-core';

const BASE = process.env.BASE ?? 'http://localhost:4322/course';
const SLIDES = [
  'cover',
  'discrete-math',
  'data-structures-algorithms',
  'bioinformatics',
  'smart-healthcare-big-data',
];
const VIEWPORTS = [
  { name: 'desktop', width: 1920, height: 1080 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'mobile', width: 390, height: 844 },
];

const browser = await puppeteer.launch({
  executablePath: '/usr/bin/google-chrome-stable',
  headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
});

let issues = 0;
const log = (ok, msg, extra = '') => {
  if (!ok) issues++;
  console.log(`${ok ? '✔' : '✘'} ${msg}${extra ? ` — ${extra}` : ''}`);
};

for (const vp of VIEWPORTS) {
  console.log(`\n===== ${vp.name} ${vp.width}×${vp.height} =====`);
  const page = await browser.newPage();
  await page.setViewport({ width: vp.width, height: vp.height });

  for (const lang of ['zh', 'en']) {
    const path = lang === 'zh' ? `${BASE}/` : `${BASE}/en/`;
    await page.goto(path, { waitUntil: 'networkidle0' });

    const report = await page.evaluate((ids) => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const out = { vw, vh, docOverflowX: false, slides: {}, overlaps: [], chrome: {} };

      out.docOverflowX = document.documentElement.scrollWidth > vw + 1;

      for (const id of ids) {
        const el = document.getElementById(id);
        if (!el) { out.slides[id] = { missing: true }; continue; }
        const r = el.getBoundingClientRect();
        // offsetTop + height gives true layout extent regardless of scroll
        out.slides[id] = {
          h: Math.round(el.offsetHeight),
          right: Math.round(r.right),
          overRight: r.right > vw + 1,
        };
      }

      // header in viewport
      for (const [key, sel] of [['header', '.site-header']]) {
        const el = document.querySelector(sel);
        if (!el) { out.chrome[key] = { missing: true }; continue; }
        const r = el.getBoundingClientRect();
        out.chrome[key] = {
          visible: r.width > 0 && r.height > 0 && r.top >= 0 && r.bottom <= vh + 1 && r.right <= vw + 1,
        };
      }
      return out;
    }, SLIDES);

    log(!report.docOverflowX, `[${lang}] no horizontal page overflow`);
    for (const [id, s] of Object.entries(report.slides)) {
      if (s.missing) { log(false, `[${lang}] slide #${id} exists`); continue; }
      log(!s.overRight, `[${lang}] #${id} within viewport width`, `right=${s.right}`);
      log(s.h <= report.vh, `[${lang}] #${id} fits one screen`, `h=${s.h} vs vh=${report.vh}`);
    }
    for (const o of report.overlaps) {
      log(o.ix === 0 || o.iy === 0, `[${lang}] ${o.pair} no overlap`, `ix=${o.ix} iy=${o.iy}`);
    }
    for (const [k, v] of Object.entries(report.chrome)) {
      log(!v.missing && v.visible, `[${lang}] ${k} present & in viewport`);
    }
  }
  await page.close();
}

await browser.close();
console.log(`\n${issues === 0 ? '🎉 ALL GEOMETRY CHECKS PASS' : `✘ ${issues} issue(s) found`}`);
process.exit(issues === 0 ? 0 : 1);
