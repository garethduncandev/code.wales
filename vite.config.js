import { defineConfig } from 'vite';
import postcssNesting from 'postcss-nesting';

export default defineConfig({
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
