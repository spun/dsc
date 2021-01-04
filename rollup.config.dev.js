// rollup.config.dev.js
import eslint from '@rollup/plugin-eslint';
import typescript from 'rollup-plugin-typescript2';
import postcss from 'rollup-plugin-postcss';
import del from 'rollup-plugin-delete';
import serve from 'rollup-plugin-serve';

export default {
  input: 'src/main.ts',
  output: [{
    dir: 'dist/',
    format: 'es',
  }],
  plugins: [
    eslint(),
    postcss(),
    typescript(),
    del({ targets: 'dist/*' }),
    serve({
      contentBase: ['dist'],
      port: 9000,
      // set headers
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    }),
  ],
};
