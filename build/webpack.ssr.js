const path = require('path');
const { merge } = require('webpack-merge');
const nodeExternals = require('webpack-node-externals');
const config = require('./config');
const PostRunnerPlugin = require('./plugins/PostRunnerPlugin');
const { getBlog } = require('./utils');

const webpackCommon = require('./webpack.common');
const postLoader = path.resolve(__dirname, './loaders/post-loader.js');
const pageLoader = path.resolve(__dirname, './loaders/page-loader.js');

let publicPath = '';
publicPath = 'https://www.betterliyu.site/';
// publicPath = 'http://127.0.0.1:5500/dist/';

const blog = getBlog(publicPath);

const webpackConfig = merge(webpackCommon, {
  mode: "production",
  target: 'node',
  output: {
    path: path.resolve(__dirname, `../.ssrscripts`),
    publicPath: publicPath,
    libraryTarget: 'commonjs2' // 打包后的代码使用的模块方案
  },
  externals: [nodeExternals()],
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        include: [config.pageDir],
        use: [
          {
            loader: pageLoader,
            options: {
              blog,
              SSRScript: true,
              staticOutput: path.resolve(__dirname, `../dist`)
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
              blog,
              SSRScript: true,
              staticOutput: path.resolve(__dirname, `../dist/post`)
            }
          }]
      },
    ]
  },
});

webpackConfig.plugins = [
  new PostRunnerPlugin()
];
module.exports = webpackConfig;
