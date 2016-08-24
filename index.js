var resolve = require('path').resolve;
var Module = require('module');

Function.prototype.ensure = ( arr, func ) => func();

module.exports = function(webpackResolve) {
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
        var bundled = Module._load(path, context)
        cb(bundled)
      };
    }

    // Shim out aliased modules
    var alias = webpackResolve.alias
    Object.keys(alias).forEach(function(key) {
      if (path.search(new RegExp('^' + key)) !== -1) {
        path = resolve(alias[key]) + path.slice(key.length)
      }
    });

    return Module._load(path, this);
  };
}
