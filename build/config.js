const path = require('path');

module.exports = {
  defaultLayout: 'Post',
  postFolder: path.resolve(__dirname, '../posts'),
  layoutFolder: path.resolve(__dirname, '../src/layout'),
  htmlTemplate: path.resolve(__dirname, '../index.html'),
}