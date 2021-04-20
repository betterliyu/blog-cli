const path = require('path');
const { merge } = require('webpack-merge');
const config = require('./config');
const webpackCommon = require('./webpack.common');

const postLoader = path.resolve(__dirname, './loaders/post-loader.js');

module.exports = merge(webpackCommon, {
  mode: 'production',
  output: {
    publicPath: 'https://www.betterliyu/'
  },
  module: {
    rules: [
      {
        test: /\.md?$/,
        include: [config.postFolder],
        use: [
          { loader: "babel-loader", },
          { loader: postLoader }
        ]
      }
    ]
  },
});
