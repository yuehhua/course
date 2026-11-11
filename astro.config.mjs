// @ts-check
import { defineConfig } from 'astro/config';

// TMU courses — deployed to GitHub Pages at https://yuehhua.github.io/course/
// (project page of the yuehhua/course repo). Catalan-numbers/ is a static
// teaching site copied verbatim into dist/ by the build script.
export default defineConfig({
  site: 'https://yuehhua.github.io',
  base: '/course',
  trailingSlash: 'ignore',
  i18n: {
    defaultLocale: 'zh',
    locales: ['zh', 'en'],
    routing: {
      prefixDefaultLocale: false,
    },
  },
});
