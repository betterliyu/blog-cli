const path = require('path');
const { merge } = require('webpack-merge');
const config = require('./config');
const { getBlog } = require('./utils');
const webpackCommon = require('./webpack.common');

const postLoader = path.resolve(__dirname, './loaders/post-loader.js');
const pageLoader = path.resolve(__dirname, './loaders/page-loader.js');

let publicPath = '';
publicPath = 'https://www.betterliyu.site/';
publicPath = 'http://127.0.0.1:5500/dist/';

const blog = getBlog(publicPath);

module.exports = merge(webpackCommon, {
  mode: 'production',
  output: {
    publicPath: publicPath
  },
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
          { loader: "babel-loader", },
          {
            loader: postLoader,
            options: {
              blog
            }
          }
        ]
      }
    ]
  },
  optimization: {
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
});
