const path = require('path');

const { DefinePlugin } = require('webpack');
const nodeExternals = require('webpack-node-externals');
const RunNodeWebpackPlugin = require('run-node-webpack-plugin');

const { getOptions: getHtmlOutputs } = require('./utils');
const config = require('./config');

const { entry } = getHtmlOutputs(true);

module.exports = {
  mode: "development",
  target: 'node',
  entry: {
    render: path.resolve(__dirname, './render'),
    ...entry
  },
  output: {
    path: path.resolve(__dirname, `../dist/ssr`),
    filename: '[name].js',
    libraryTarget: 'commonjs2' // 打包后的代码使用的模块方案
  },
  externals: [nodeExternals()],
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx']
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        options: {
          presets: [
            '@babel/preset-env',
            '@babel/preset-react'
          ]
        }
      },
      { test: /\.tsx?$/, loader: "ts-loader" }
    ]
  },
  plugins: [
    new RunNodeWebpackPlugin({ scriptToRun: 'render.js' }),
  ],
  devtool: 'source-map',
  node: {
    __dirname: true,
  },
}