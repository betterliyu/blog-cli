const path = require('path');
const { buildPosts } = require('./utils');
const { entry, htmlPlugins } = buildPosts();

module.exports = {
  entry: {
    ...entry
  },
  output: {
    path: path.resolve(__dirname, `../dist`),
    filename: 'scripts/[name].js',
    clean: true,
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
        test: /\.png$/,
        type: 'asset',
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ]
  },
  plugins: [
    ...htmlPlugins
  ]
};
