const path = require('path');
const { merge } = require('webpack-merge');
const nodeExternals = require('webpack-node-externals');
const PostRunnerPlugin = require('./plugins/PostRunnerPlugin');

const webpackCommon = require('./webpack.common');
const postLoader = path.resolve(__dirname, './loaders/post-loader.js');

module.exports = merge(webpackCommon, {
  mode: "production",
  target: 'node',
  output: {
    path: path.resolve(__dirname, `../.ssrscripts`),
    publicPath: 'https://www.betterliyu.site/',
    libraryTarget: 'commonjs2' // 打包后的代码使用的模块方案
  },
  externals: [nodeExternals()],
  module: {
    rules: [
      {
        test: /\.md?$/,
        include: [config.postFolder],
        use: [
          { loader: "babel-loader", },
          {
            loader: postLoader,
            options: {
              SSRScript: true,
              staticOutput: path.resolve(__dirname, `../dist/post`)
            }
          }]
      },
    ]
  },
  plugins: [
    new PostRunnerPlugin(),
  ],
});