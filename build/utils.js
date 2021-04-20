const path = require('path');
const fs = require('fs-extra');

const { getPosts } = require('./common');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const config = require('./config');

exports.buildPosts = () => {
  const posts = getPosts(config.postFolder);
  const htmlPlugins = [];
  const entry = {};
  const outputFiles = [];

  Object.keys(posts).forEach(fileName => {
    // 为每个 post 文件都添加一个 entry js 文件和 html 文件
    let relativePath = path.relative(config.postFolder, fileName);
    let htmlPath = relativePath.replace(path.extname(relativePath), '.html');
    const chunkName = path.basename(relativePath.replace(/[\\/]/, '_'), '.md');
    // 生成 entry, 指向每个 post md 文件
    entry[chunkName] = fileName;
    // 配置 htmlPlugin
    htmlPlugins.push(new HtmlWebpackPlugin({
      // 按照 post 文件结构生成对应的 html 文件夹结构
      filename: 'post/' + htmlPath,
      template: config.htmlTemplate,
      chunks: [chunkName]
    }));
    outputFiles.push(`post/${relativePath.replace(path.extname(relativePath), '.js')}`);
  });

  return {
    entry,
    htmlPlugins,
    outputFiles,
  };
};

exports.buildSSRScript = () => {
  const posts = getPosts(config.postFolder);
}