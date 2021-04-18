const path = require('path');
const { DefinePlugin } = require('webpack');
const config = require('./config');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const { buildPosts } = require('./utils');

const { entry, htmlPlugins } = buildPosts();
module.exports = {
  mode: "development",
  entry: {
    ...entry
  },
  output: {
    path: path.resolve(__dirname, `../dist`),
    filename: 'js/[name].js'
  },
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx']
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: "babel-loader",
        exclude: /node_modules/
      },
      {
        test: /\.md?$/,
        include: [config.postFolder],
        use: [
          { loader: "babel-loader", },
          {
            loader: path.resolve(__dirname, './loaders/post-loader.js'),
            options: {
            }
          }]
      },
    ]
  },
  plugins: [
    ...htmlPlugins,
  ],
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
  devtool: 'source-map'
}