import { defineConfig } from 'vite';
import postcssNesting from 'postcss-nesting';

export default defineConfig({
  base: '/code.wales/',
  css: {
    postcss: {
      plugins: [postcssNesting],
    },
  },
  build: {
    outDir: 'docs',
    rollupOptions: {
      input: 'index.html',
    },
  },
});
