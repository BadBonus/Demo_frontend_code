import { createRequire } from 'node:module';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const require = createRequire(import.meta.url);
const nuxtDir = dirname(require.resolve('nuxt/package.json'));
const vuePath = dirname(require.resolve('vue/package.json', { paths: [nuxtDir] }));

export default defineConfig({
  resolve: {
    alias: {
      '#openApi': fileURLToPath(new URL('./shared/open-api', import.meta.url)),
      '#api': fileURLToPath(new URL('./shared/api', import.meta.url)),
      '#utils': fileURLToPath(new URL('./utils', import.meta.url)),
      '#consts': fileURLToPath(new URL('./shared/constants', import.meta.url)),
      '@': fileURLToPath(new URL('./', import.meta.url)),
      '~': fileURLToPath(new URL('./', import.meta.url)),
      vue: vuePath,
    },
  },
  test: {
    environment: 'node',
    setupFiles: ['./vitest.setup.ts'],
  },
});
