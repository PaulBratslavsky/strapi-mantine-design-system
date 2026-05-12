import react from '@vitejs/plugin-react-swc';
import { resolve } from 'path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import { externalizeDeps } from 'vite-plugin-externalize-deps';
import { libInjectCss } from 'vite-plugin-lib-inject-css';

// eslint-disable-next-line import/no-default-export
export default defineConfig({
  plugins: [
    react(),
    dts({
      tsconfigPath: './tsconfig.json',
      exclude: ['**/*.config.ts', '**/*.config.mjs', 'test/**/*'],
      outDir: 'dist',
      entryRoot: 'src',
    }),
    externalizeDeps(),
    // Auto-injects a side-effect import for the emitted CSS into the JS bundle,
    // so consumers (Strapi admin) get tokens/layers automatically by importing
    // anything from @strapi/design-system. Without this, dist/style.css ships
    // but nobody imports it.
    libInjectCss(),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      formats: ['es', 'cjs'],
      fileName: (format) => (format === 'es' ? 'index.mjs' : 'index.js'),
    },
  },
});
