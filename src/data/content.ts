/**
 * content.ts — site-wide copy for the courses site (both languages).
 * Course content itself lives in lessons.ts.
 */

export type Lang = 'zh' | 'en';

export interface L<T> {
  zh: T;
  en: T;
}

/** The ISB Lab site (separate deploy at /lab/). Root-absolute on purpose. */
export const labUrl = 'https://yuehhua.github.io/lab/';

export const ui = {
  /* Every lesson slide shares one nav label — the active one glows. */
  lessonNav: { zh: '課程', en: 'Lesson' },
  labNav: { zh: 'ISB Lab', en: 'ISB Lab' },
  coverEyebrow: { zh: '課程', en: 'COURSES' },
  scrollHint: { zh: '捲動或按 ↓ 換頁', en: 'Scroll or press ↓' },
  langToggle: { zh: 'EN', en: '中文' },
} as const;

export const profile = {
  labShort: 'ISB Lab',
  name: { zh: '杜岳華', en: 'Yueh-Hua Tu' },
  degree: 'PhD',
  title: { zh: '助理教授', en: 'Assistant Professor' },
  affiliation: {
    zh: '臺北醫學大學 跨領域學院 智慧醫療跨領域學士學位學程',
    en: 'Interdisciplinary Undergraduate Program in Intelligent Healthcare, College of Interdisciplinary Studies, Taipei Medical University',
  },
  email: 'yuehhua.tu@tmu.edu.tw',
};

export const cover = {
  kicker: { zh: 'TMU COURSES', en: 'TMU COURSES' },
  title: { zh: '課程', en: 'Courses' },
  sub: {
    zh: '從邏輯、演算法到生物資訊與醫療大數據——每門課都銜接真實的生醫問題。',
    en: 'From logic and algorithms to bioinformatics and healthcare big data—every course connects to real biomedical problems.',
  },
};

export const footer = {
  copyright: { zh: '© 2026 杜岳華 · 臺北醫學大學', en: '© 2026 Yueh-Hua Tu · Taipei Medical University' },
};
