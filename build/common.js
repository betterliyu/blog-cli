const path = require('path');
const fs = require('fs-extra');

const matter = require('gray-matter');

exports.getPosts = (folder) => {
  const mds = {};

  const _find = (p) => {
    const files = fs.readdirSync(p);
    files.forEach(file => {
      let fPath = path.join(p, file);
      let stat = fs.statSync(fPath);
      if (stat.isDirectory()) {
        _find(fPath);
      } else if (stat.isFile() && path.extname(file) == '.md') {
        let fileContent = fs.readFileSync(fPath);

        const fileData = matter(fileContent.toString());
        if (typeof fileData.tags === 'string') {
          fileData.tags = [fileData.tags];
        }
        if (typeof fileData.categories === 'string') {
          fileData.categories = [fileData.categories];
        }
        mds[fPath] = {
          meta: fileData.data,
          content: fileData.content
        };
      }
    })
  }
  _find(folder);

  return mds;
};

exports.getPages = (folder) => {
  const files = fs.readdirSync(folder);
  return files.filter(file => ['.jsx', '.tsx', '.js', '.ts'].includes(path.extname(file)))
};
