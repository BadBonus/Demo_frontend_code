import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath } from 'node:url';
import { CLIENT_BUNDLE_ICONS } from './shared/constants/client-bundle-icons';

export default defineNuxtConfig({
  modules: ['@nuxt/ui', '@nuxt/fonts', '@nuxt/icon', '@nuxt/image', '@pinia/nuxt', '@vueuse/nuxt', 'nuxt-svgo'],
  components: [{ path: '~/components/globals' }, { path: '~/components/features' }, '~/components'],
  hooks: {
    ready(nuxt) {
      nuxt.options.build.transpile = nuxt.options.build.transpile.filter(
        (item) => item !== 'reka-ui' && !(item instanceof RegExp && item.test('reka-ui')),
      );
    },
  },
  devtools: { enabled: true },
  app: {
    baseURL: '/',
    buildAssetsDir: 'assets',
  },
  css: ['@/assets/css/main.css', '@splidejs/splide/dist/css/splide.min.css'],
  colorMode: {
    preference: 'dark',
  },
  runtimeConfig: {
    public: {
      apiBase: '',
      imgproxyUrl: '',
    },
  },
  srcDir: '.',
  alias: {
    '#types': fileURLToPath(new URL('./shared/types', import.meta.url)),
    '#consts': fileURLToPath(new URL('./shared/constants', import.meta.url)),
    '#openApi': fileURLToPath(new URL('./shared/open-api', import.meta.url)),
    '#components': fileURLToPath(new URL('./components', import.meta.url)),
    '#features': fileURLToPath(new URL('./components/features', import.meta.url)),
    '#globals': fileURLToPath(new URL('./components/globals', import.meta.url)),
    '#utils': fileURLToPath(new URL('./utils', import.meta.url)),
    '#composables': fileURLToPath(new URL('./composables', import.meta.url)),
    '#api': fileURLToPath(new URL('./shared/api', import.meta.url)),
  },
  routeRules: {
    '/': { prerender: false },
  },
  devServer: {
    port: 3010,
    host: '0.0.0.0',
  },
  compatibilityDate: '2025-01-15',
  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      include: ['zod', 'leaflet', 'reka-ui', '@splidejs/splide', 'uqr'],
    },
  },
  fonts: {
    providers: { npm: false },
    defaults: {
      weights: [400, 500, 600, 700],
      styles: ['normal', 'italic'],
      preload: true,
      fallbacks: {
        'sans-serif': ['Arial', 'Helvetica Neue'],
        serif: ['Times New Roman'],
        cursive: ['Comic Sans MS', 'Segoe Script'],
      },
    },
    families: [
      // Shantell Sans в исходнике может отсутствовать в public/fonts — fallback в theme.css
      { name: 'Caveat', provider: 'local', global: true, weights: [400, 500, 600, 700] },
      { name: 'Rubik', provider: 'local', global: true, weights: [400, 500, 600, 700] },
      { name: 'Rubik Doodle Shadow', provider: 'local', global: true, weights: [400], styles: ['normal'] },
      { name: 'Artist Nouveau', provider: 'local', global: true, weights: [400, 700], styles: ['normal'] },
      { name: 'Comforter Brush', provider: 'local', global: true, weights: [400], styles: ['normal'] },
    ],
  },
  icon: {
    serverBundle: 'local',
    clientBundle: {
      scan: true,
      sizeLimitKb: 256,
      icons: CLIENT_BUNDLE_ICONS,
    },
  },
  svgo: {
    defaultImport: 'component',
  },
});
