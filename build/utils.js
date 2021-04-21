const path = require('path');

const { getPosts, getPages } = require('./common');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const config = require('./config');

let blog = {};

exports.getBlog = (publicPath = '') => {
  blog.posts.forEach(post => {
    if (!post.link.startsWith(publicPath)) {
      post.link = publicPath + post.link;
    }
  });
  Object.keys(blog).forEach((key) => {
    if (typeof blog[key] === 'string' && path.parse(blog[key]).ext.toLowerCase() == '.html') {
      if (!blog[key].startsWith(publicPath)) {
        blog[key] = publicPath + blog[key];
      }
    }
  });
  return blog;
}

const buildPosts = () => {
  const postFiles = getPosts(config.postDir);
  const htmlPlugins = [];
  const entry = {};
  const posts = [];
  let tags = [];
  let categories = [];

  Object.keys(postFiles).forEach(fileName => {
    // 为每个 post 文件都添加一个 entry js 文件和 html 文件
    let relativePath = path.relative(config.postDir, fileName);
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
    // 注入 meta到 blog
    const { meta } = postFiles[fileName]
    posts.push({ link: ('post/' + htmlPath).replace(/\\/g, '/'), meta: meta });
    tags = Array.from(new Set([...tags, ...(meta.tags || [])]));
    categories = Array.from(new Set([...categories, ...(meta.category || [])]));
  });

  blog = {
    ...blog,
    posts,
    tags,
    categories,
  }

  return {
    entry,
    htmlPlugins,
  };
};



const buildPages = () => {
  const pages = getPages(config.pageDir);
  const htmlPlugins = [];
  const entry = {};

  pages.forEach(page => {
    // 为每个 post 文件都添加一个 entry js 文件和 html 文件
    let htmlPath = page.replace(path.extname(page), '.html');
    const pageName = path.basename(page, path.extname(page));
    // 生成 entry, 指向每个 post md 文件
    entry[pageName] = path.resolve(config.pageDir, page);
    // 配置 htmlPlugin
    htmlPlugins.push(new HtmlWebpackPlugin({
      // 按照 post 文件结构生成对应的 html 文件夹结构
      filename: htmlPath,
      template: config.htmlTemplate,
      chunks: [pageName]
    }));
    // 将 page 信息注入到 blog 对象中
    blog[pageName] = htmlPath
  });

  return {
    entry,
    htmlPlugins,
  };
}

exports.buildConfig = () => {
  const postConfig = buildPosts();
  const pageConfig = buildPages();

  return {
    entry: {
      ...postConfig.entry,
      ...pageConfig.entry,
    },
    htmlPlugins: [
      ...postConfig.htmlPlugins,
      ...pageConfig.htmlPlugins,
    ]
  }
}