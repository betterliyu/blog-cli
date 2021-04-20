const path = require('path');

module.exports = {
  defaultLayout: 'Post',
  postFolder: path.resolve(__dirname, '../src/posts'),
  layoutFolder: path.resolve(__dirname, '../src/layout'),
  htmlTemplate: path.resolve(__dirname, '../index.html'),
}