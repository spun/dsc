// rollup.config.js
import eslint from '@rollup/plugin-eslint';
import typescript from 'rollup-plugin-typescript2';
import postcss from 'rollup-plugin-postcss';
import del from 'rollup-plugin-delete';
import { terser } from 'rollup-plugin-terser';
import copy from 'rollup-plugin-copy';

export default {
  input: 'src-bookmarklet/main.ts',
  output: [{
    dir: 'public/dist/',
    format: 'es',
    sourcemap: true,
    plugins: [terser()],
  }],
  plugins: [
    eslint(),
    postcss(),
    typescript(),
    del({ targets: 'public/*' }),
    copy({
      targets: [
        { src: 'src-web/*', dest: 'public' },
      ],
    }),
  ],
};
