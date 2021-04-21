const path = require('path');

const loaderUtils = require('loader-utils');
const { validate } = require('schema-utils');

const schema = require('./page-loader-schema.json');

module.exports = function (source) {
  let callback = this.async();
  let options = loaderUtils.getOptions(this);

  validate(schema, options, {
    name: 'page-loader',
    baseDataPath: 'options',
  });

  let blog = JSON.stringify(options.blog);
  let content = '';
  if (options.SSRScript) {
    let fileName = path.basename(this.resourcePath, path.extname(this.resourcePath));
    htmlName = fileName + '.html';
    htmlName = path.resolve(options.staticOutput, htmlName);
    content += `
          import path from 'path';
          import fs from 'fs-extra';
          import ReactDomServer from 'react-dom/server';
          ${source}

          // 获取对应 layout 组件，渲染react dom 
          const blog = ${blog};
          const dmoStr = ReactDomServer.renderToString(<Page blog={blog}/>);
        
          // 替换根节点内容  
          const htmlPath = ${JSON.stringify(htmlName)};
          let html = fs.readFileSync(htmlPath).toString();
          html = html.replace('{{BLOG_CONTENT}}', dmoStr);
        
          fs.outputFileSync(htmlPath, html);
        `;
  } else {
    const renderMethod = this.mode === 'development' ? 'render' : 'hydrate';
    content += `
      ${this.hot ? `import { hot } from 'react-hot-loader/root';` : ''}
      import { ${renderMethod} } from 'react-dom';
      ${source}
      const App = ${this.hot ? `hot(Page)` : `Page`};
      const blog = ${blog};
      
      ${renderMethod}(<App blog={blog}/>, document.getElementById('app'));
    `;
  }
  callback(null, content);
}