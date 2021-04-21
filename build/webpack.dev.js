const path = require('path');
const { merge } = require('webpack-merge');
const config = require('./config');
const webpackCommon = require('./webpack.common');
const { getBlog } = require('./utils');

const postLoader = path.resolve(__dirname, './loaders/post-loader.js');
const pageLoader = path.resolve(__dirname, './loaders/page-loader.js');

const blog = getBlog();

module.exports = merge(webpackCommon, {
  mode: "development",
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        include: [config.pageDir],
        use: [
          {
            loader: pageLoader,
            options: {
              blog
            }
          }
        ]
      },
      {
        test: /\.md?$/,
        include: [config.postDir],
        use: [
          { loader: "babel-loader" },
          {
            loader: postLoader, options: {
              blog
            }
          }
        ]
      },
    ]
  },
  optimization: {
    runtimeChunk: 'single',
    splitChunks: {
      cacheGroups: {
        common: {
          chunks: "initial",
          name: "common",
          minChunks: 2,
          priority: 0,
          reuseExistingChunk: true,
        },
      },
    },
  },
  devtool: 'source-map',
  devServer: {
    compress: true,
    port: 8000,
    hot: true,
  },
});
