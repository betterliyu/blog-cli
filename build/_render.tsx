const fs = require('fs-extra')
import path from 'path';
import React from 'react';
import ReactDomServer from 'react-dom/server';
import { getPosts } from './common';
import config from './config';

// 导入对应 layout 的 react 组件,
const requireComponent = (layout: string) => {
  // 文件夹必须是字符串字面量，否则 webpack 不会解析
  return require(`../.staging/component/` + layout + '.tsx');
};

const posts = getPosts(config.postFolder);

Object.keys(posts).forEach(fileName => {
  let relativePath = path.relative(config.postFolder, fileName);

  // 获取对应 layout 组件，渲染react dom 
  const tsxFileName = relativePath.replace(path.extname(relativePath), '').replace(/\\/, '_');
  const Post = requireComponent(tsxFileName)['Post'];
  const dmoStr = ReactDomServer.renderToString(<Post {...posts[fileName]} />);

  // 替换根节点内容  
  const relativeHtmlPath = relativePath.replace(path.extname(relativePath), '.html');
  const htmlPath = path.resolve(__dirname, '../.staging/static/post', relativeHtmlPath);
  let html = fs.readFileSync(htmlPath).toString();
  html = html.replace('{{BLOG_CONTENT}}', dmoStr);

  fs.outputFileSync(htmlPath, html)
});

// 将static 内容输出到 dist 下面
try {
  fs.removeSync(path.resolve(__dirname, '../dist'));
  fs.moveSync(path.resolve(__dirname, '../.staging/static'), path.resolve(__dirname, '../dist'));
  console.log('success!')
} catch (err) {
  console.error(err)
}

fs.removeSync(path.resolve(__dirname, '../.staging'));
