// rollup.config.dev.js
import eslint from '@rollup/plugin-eslint';
import typescript from 'rollup-plugin-typescript2';
import postcss from 'rollup-plugin-postcss';
import del from 'rollup-plugin-delete';
import serve from 'rollup-plugin-serve';

// Plugins that all inputs should run
const commonPlugins = [
  eslint(),
  postcss(),
  typescript(),
];

// Plugins that should only run once
const runOnStartPlugins = [
  del({ targets: 'public/dist/*' }),
  serve({
    contentBase: ['public/dist'],
    port: 9000,
    // set headers
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  }),
];

export default [{
  input: 'src-bookmarklet/main.ts',
  output: [{
    dir: 'public/dist/',
    format: 'es',
  }],
  plugins: [...commonPlugins, ...runOnStartPlugins],
},
{
  input: 'src-bookmarklet/main-bundle.ts',
  output: {
    file: 'public/dist/main-bundle.js',
    format: 'es',
  },
  plugins: commonPlugins,
}];
