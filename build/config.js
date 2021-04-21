const path = require('path');

module.exports = {
  defaultLayout: 'Post',
  postDir: path.resolve(__dirname, '../posts'),
  layoutDir: path.resolve(__dirname, '../src/layouts'),
  pageDir: path.resolve(__dirname, '../src/pages'),
  htmlTemplate: path.resolve(__dirname, '../index.html'),
}