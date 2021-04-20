const path = require('path');

class PostRunnerPlugin {
  apply(compiler) {
    compiler.hooks.done.tapAsync("PostRunnerPlugin", (stats) => {
      Object.keys(stats.compilation.assets).forEach((file) => {
        if (path.extname(file) === '.js') {
          require(path.resolve(stats.compilation.outputOptions.path, file));
        }
      })
    });
  }
}

module.exports = PostRunnerPlugin;