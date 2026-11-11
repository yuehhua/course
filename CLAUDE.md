# CLAUDE.md

Course site of 杜岳華 (TMU). Live at <https://yuehhua.github.io/course/> — GitHub Pages project page of **github.com/yuehhua/course**, deployed by `.github/workflows/deploy.yml` (GitHub Actions Pages; push to `main` → build → deploy).

Split out of the ISB Lab site (`../research-blog`, github.com/yuehhua/research, served at `/lab/`) on 2026-11-11; the lab site's old `/lab/lessons/*` URLs redirect here. Design system (sky × leaf palette, Bootstrap 5 CSS, scroll-snap deck, Slide.astro, global.css) is copied from that repo — read its CLAUDE.md for design constraints and known pitfalls (Astro scoping of slide-level styles, `min-width: 0` on grid images, etc.).

## Layout

- `Catalan-numbers/` — standalone static teaching site (no build step). `npm run build` copies it verbatim into `dist/`, so it stays at `/course/Catalan-numbers/`. Don't move it under `src/`.
- `src/data/lessons.ts` — all course content (bilingual `L<T>`); `src/data/content.ts` — site chrome strings.
- `src/components/Home.astro` — deck: cover + one slide per course (`lessonOrder`); footer lives inside the last slide.
- `src/components/LessonPage.astro` + `src/pages/{,en/}lessons/<slug>.astro` — per-course detail pages (`<html class="no-snap">`).
- Content policy: module overview + one featured clinical case per module (`case` optional); **no operational info** (textbook/hours/grading). Backgrounds `src/assets/*_Gemini.png` are user-made — don't regenerate. `smart-healthcare-big-data` has a slide but no detail page yet (awaiting the user's background).

## Commands

```bash
npm run dev       # serves under /course/ (Catalan-numbers is only in the built dist/)
npm run build     # astro build + copy Catalan-numbers → dist/
npm run preview -- --port 4322
node scripts/qa-geometry.mjs   # layout QA gate (needs preview on :4322); desktop 1920×1080 slides must fit one screen
```
