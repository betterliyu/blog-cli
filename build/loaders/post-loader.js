const fs = require('fs-extra');
const path = require('path');

const loaderUtils = require('loader-utils');
const { validate } = require('schema-utils');
const html = require('remark-html');
const matter = require('gray-matter');
const remark = require('remark');
const recommended = require('remark-preset-lint-recommended');

const config = require('../config');
const schema = require('./post-loader-schema.json');

const srcReg = /(<img.*?src=\\")(.*?)(\\")/;

const getLayoutFilePath = (layout = config.defaultLayout) => {
  const layouts = fs.readdirSync(config.layoutDir);
  let file = layouts.find(fileName => ['.js', '.jsx', '.ts', '.tsx'].some(ext => fileName === layout + ext));
  if (!file) {
    throw new Error(`layout ${layout} is not found!`)
  }
  return path.resolve(config.layoutDir, file);
};

module.exports = function (source) {
  let callback = this.async();
  let options = loaderUtils.getOptions(this);

  validate(schema, options, {
    name: 'post-loader',
    baseDataPath: 'options',
  });

  const fileData = matter(source);
  const { blog, SSRScript, staticOutput } = options;

  remark()
    .use(recommended)
    .use(html)
    .process(fileData.content, (err, file) => {
      if (err) {
        throw new Error(err);
      }

      const post = {
        meta: fileData.data,
        content: file.contents,
      };

      const layout = getLayoutFilePath(post.meta.layout)
      const layoutUrl = loaderUtils.stringifyRequest(this, layout);
      let postStr = JSON.stringify(post);
      let blogStr = JSON.stringify(blog);
      const matches = postStr.matchAll(RegExp(srcReg, 'g'));
      let importCode = [];
      let srcIndex = 0;
      for (match of matches) {
        if (loaderUtils.isUrlRequest(match[2])) {
          const from = match.index;
          const request = loaderUtils.urlToRequest(match[2]);
          importCode.push(`import IMPORT_SRC_REPLACEMENT_INDEX_${srcIndex} from '${request}';`);
          postStr = postStr.slice(0, from) + postStr.slice(from).replace(srcReg, `$1"+IMPORT_SRC_REPLACEMENT_INDEX_${srcIndex}+"$3`);
          srcIndex++;
        }
      }
      let content = [...importCode].join('\n');
      if (SSRScript) {
        const relativePath = path.relative(config.postDir, this.resourcePath);
        let htmlPath = relativePath.replace(path.extname(relativePath), '.html');
        htmlPath = path.resolve(staticOutput, htmlPath);
        content += `
          import path from 'path';
          import fs from 'fs-extra';
          import React from 'react';
          import ReactDomServer from 'react-dom/server';
          import Post from ${layoutUrl}
          
          // 获取对应 layout 组件，渲染react dom 
          const post = ${postStr};
          const blog = ${blogStr};
          const dmoStr = ReactDomServer.renderToString(<Post post={post} blog={blog}/>);
        
          // 替换根节点内容  
          const htmlPath = ${JSON.stringify(htmlPath)};
          let html = fs.readFileSync(htmlPath).toString();
          html = html.replace('{{BLOG_CONTENT}}', dmoStr);
        
          fs.outputFileSync(htmlPath, html);
        `;
      } else {
        const renderMethod = this.mode === 'development' ? 'render' : 'hydrate';
        content += `
          ${this.hot ? `import { hot } from 'react-hot-loader/root';` : ''}
          import React from 'react';
          import { ${renderMethod} } from 'react-dom';
          import Post from ${layoutUrl}

          const App = ${this.hot ? `hot(Post)` : `Post`};
          const post = ${postStr};
          const blog = ${blogStr};
          
          ${renderMethod}(<App post={post} blog={blog}/>, document.getElementById('app'));
        `;
      }
      callback(null, content);
    });
}