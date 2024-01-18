// rollup.config.js
import eslint from '@rollup/plugin-eslint';
import typescript from '@rollup/plugin-typescript';
import postcss from 'rollup-plugin-postcss';
import del from 'rollup-plugin-delete';
import terser from '@rollup/plugin-terser';
import copy from 'rollup-plugin-copy';

// Plugins that all inputs should run
const commonPlugins = [
  eslint(),
  postcss(),
  typescript(),
];

// Plugins that should only run on buildStart (only once)
const runOnStartPlugins = [
  del({ targets: 'public/*' }),
];

// Plugins that should only run on buildEnd (only once)
const runOnEndPlugins = [
  copy({
    targets: [
      { src: 'src-web/*', dest: 'public' },
    ],
  }),
];

export default [{
  input: 'src-bookmarklet/main.ts',
  output: [{
    dir: 'public/dist/',
    format: 'es',
    sourcemap: true,
    plugins: [terser()],
  }],
  plugins: [...commonPlugins, ...runOnStartPlugins],
},
{
  input: 'src-bookmarklet/main-bundle.ts',
  output: {
    file: 'public/dist/main-bundle.js',
    format: 'es',
    sourcemap: true,
    plugins: [terser()],
  },
  plugins: [...commonPlugins, ...runOnEndPlugins],
}];
