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
    .process(source, (err, file) => {
      if (err) {
        throw new Error(err);
      }

      const post = {
        meta: fileData.data,
        content: file.contents,
      };

      const layout = getLayoutFilePath(post.meta.layout)
      const layoutUrl = loaderUtils.stringifyRequest(this, layout);
      if (options.isSSR) {
        content = `
          import React from 'react';
          import Post from ${layoutUrl}
          export {
            Post,
            post: ${JSON.stringify(post)}
          } 
        `;
      } else {
        content = `
          import React from 'react';
          import { hydrate } from 'react-dom';
          import Post from ${layoutUrl}
          
          hydrate(<Post {...${JSON.stringify(post)}}/>, document.getElementById('app'));
        `;
      }

      callback(null, content);
    })


}