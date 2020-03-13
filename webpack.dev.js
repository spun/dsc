const merge = require('webpack-merge'); // eslint-disable-line import/no-extraneous-dependencies
const webpack = require('webpack'); // eslint-disable-line import/no-extraneous-dependencies
const common = require('./webpack.common.js');

const DEV_SERVER_PORT = 9000;

module.exports = merge(common, {
  mode: 'development',
  devtool: 'inline-source-map',
  devServer: {
    contentBase: './dist',
    port: DEV_SERVER_PORT
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.APP_PATH': JSON.stringify(
        `http://localhost:${DEV_SERVER_PORT}/`
      )
    })
  ]
});