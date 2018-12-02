const merge = require('webpack-merge');
const webpack = require('webpack');
const common = require('./webpack.common.js');

module.exports = merge(common, {
  mode: 'production',
  plugins: [
    new webpack.DefinePlugin({
      'process.env.APP_PATH': JSON.stringify('https://spun.github.io/dsc/'),
    }),
  ],
});
