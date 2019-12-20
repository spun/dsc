const merge = require('webpack-merge'); // eslint-disable-line import/no-extraneous-dependencies
const webpack = require('webpack'); // eslint-disable-line import/no-extraneous-dependencies
const common = require('./webpack.common.js');

module.exports = merge(common, {
  mode: 'production',
  plugins: [
    new webpack.DefinePlugin({
      'process.env.APP_PATH': JSON.stringify('https://spun.github.io/dsc/dist/')
    })
  ],
  optimization: { namedChunks: true }
});
