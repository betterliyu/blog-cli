const path = require('path');
const { merge } = require('webpack-merge');
const config = require('./config');
const webpackCommon = require('./webpack.common');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const postLoader = path.resolve(__dirname, './loaders/post-loader.js');

module.exports = merge(webpackCommon, {
  mode: "development",
  entry: {
    index: path.resolve(__dirname, '../src/index.tsx')
  },
  module: {
    rules: [
      {
        test: /\.md?$/,
        include: [config.postFolder],
        use: [
          { loader: "babel-loader" },
          { loader: postLoader }
        ]
      },
    ]
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        common: {
          chunks: "initial",
          name: "common",
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
  plugins: [
    new HtmlWebpackPlugin({
      // 按照 post 文件结构生成对应的 html 文件夹结构
      filename: 'index.html',
      template: config.htmlTemplate,
      chunks: ['index']
    })
  ]
});
