// rollup.config.js
import eslint from '@rollup/plugin-eslint';
import typescript from 'rollup-plugin-typescript2';
import postcss from 'rollup-plugin-postcss';
import del from 'rollup-plugin-delete';
import { terser } from 'rollup-plugin-terser';

export default {
  input: 'src/main.ts',
  output: [{
    dir: 'dist/',
    format: 'es',
    sourcemap: true,
    plugins: [terser()],
  }],
  plugins: [
    eslint(),
    postcss(),
    typescript(),
    del({ targets: 'dist/*' }),
  ],
};
