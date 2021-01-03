// rollup.config.js
import postcss from 'rollup-plugin-postcss'
import del from 'rollup-plugin-delete'
import { terser } from 'rollup-plugin-terser';

export default {
  input: 'src/main.ts',
  output: [{
    dir: 'dist/',
    format: "es",
    sourcemap: true,
    plugins: [terser()]
  }],
  plugins: [
    postcss(),
    del({ targets: 'dist/*' })
  ]
};