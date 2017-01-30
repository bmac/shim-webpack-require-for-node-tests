var resolve = require('path').resolve;
var Module = require('module');

Function.prototype.ensure = function( arr, func ) {
  return func();
}

var resolveAliased = function(alias, path) {
  alias = alias || {}
  var newPath = path
  Object.keys(alias).forEach(function(key) {
    if (path.search(new RegExp('^' + key)) !== -1) {
      newPath = resolve(alias[key]) + path.slice(key.length)
    }
  });
  return newPath
}

module.exports = function(webpack) {
  var webpackResolve = webpack.resolve || {}
  var alias = webpackResolve.alias || {}

  /**
   * Ship native require to support webpack like require paths when
   * running tests in mocha. We do this by ignoring filetypes node
   * doesn't understand and simulating webpack's alias function.
   */
  Module.prototype.require = function(path) {
    const types = /\.(s?css|sass|less|svg|html|png|jpe?g|gif)$/;
    if (path.search(types) !== -1) {
      return;
    }

    // Shim out the bundler loader
    if (path.search(/^bundle\?lazy\!/) !== -1) {
      path = path.slice(12)
      var context = this
      return function(cb) {
        var bundled = Module._load(resolveAliased(alias, path), context)
        cb(bundled)
      };
    }

    if (path.search(/^script!/) !== -1) {
      return ''
    }

    return Module._load(resolveAliased(alias, path), this);
  };
}
