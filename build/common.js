const path = require('path');
const fs = require('fs-extra');

const html = require('remark-html');
const matter = require('gray-matter');
const remark = require('remark');
const recommended = require('remark-preset-lint-recommended');

exports.getPosts = (folder) => {
  const mds = {};

  const _find = (p) => {
    const files = fs.readdirSync(p);
    files.forEach(file => {
      let fPath = path.join(p, file);
      let stat = fs.statSync(fPath);
      if (stat.isDirectory()) {
        _find(fPath);
      } else if (stat.isFile()) {
        let fileContent = fs.readFileSync(fPath);

        const fileData = matter(fileContent.toString());

        remark()
          .use(recommended)
          .use(html)
          .process(fileData.content, (err, file) => {
            mds[fPath] = {
              meta: fileData.data,
              content: file.contents,
            };
          })
      }
    })
  }
  _find(folder);

  return mds;
};
