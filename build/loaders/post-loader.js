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
  const layouts = fs.readdirSync(config.layoutFolder);
  let file = layouts.find(fileName => ['.js', '.jsx', '.ts', '.tsx'].some(ext => fileName === layout + ext));
  if (!file) {
    throw new Error(`layout ${layout} is not found!`)
  }
  return path.resolve(config.layoutFolder, file);
};

module.exports = function (source) {
  let callback = this.async();
  let options = loaderUtils.getOptions(this);

  validate(schema, options, {
    name: 'post-loader',
    baseDataPath: 'options',
  });

  const fileData = matter(source);

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
      if (options.SSRScript) {
        content += `
          import path from 'path';
          import fs from 'fs-extra';
          import React from 'react';
          import ReactDomServer from 'react-dom/server';
          import Post from ${layoutUrl}
          
          let relativePath = path.relative(${JSON.stringify(config.postFolder)}, ${JSON.stringify(this.resourcePath)});

          // 获取对应 layout 组件，渲染react dom 
          const post = ${postStr};
          const dmoStr = ReactDomServer.renderToString(<Post {...post} />);
        
          // 替换根节点内容  
          const relativeHtmlPath = relativePath.replace(path.extname(relativePath), '.html');
          const htmlPath = path.resolve(${JSON.stringify(options.staticOutput)}, relativeHtmlPath);
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
          
          ${renderMethod}(<App {...post}/>, document.getElementById('app'));
        `;
      }
      callback(null, content);
    });
}