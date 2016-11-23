# shim-webpack-require-for-node-tests

This module shims node's `require` so it does not throw an error when loading some module types that webpack supports.
It can be to run tests in node for code that normally needs to be run through webpack before it will run. 
When the test code errors this gives a better developer experience because it logs the original filename and line number instead of a 
line number in the bundled file created by webpack.

## Supported file types.

- `css` Requiring a css file returns undefined.
- `scss` Requiring a scss file returns undefined.
- `sass` Requiring a sass file returns undefined.
- `less` Requiring a less file returns undefined.
- `svg` Requiring a svg file returns undefined.
- `html` Requiring a html file returns undefined.
- `png` Requiring a png file returns undefined.
- `jpg` Requiring a jpg file returns undefined.
- `gif` Requiring a gif file returns undefined.
- `bundle?` requiring a bundled file returns a function that will immediately invoke a callback with the original module

## Supported Webpack Resolve options
This module supports shimming webpack's [resolve.alias](https://webpack.github.io/docs/configuration.html#resolve-alias) configuration.

# Configuraion

Create a `shim-webpack-require.js` that imports the `shim-webpack-require-for-node-tests` method and calls it with your webpack 
config.

```js
var shimWebpackRequire = require('shim-webpack-require-for-node-tests')
var webpack = require('./webpack.conf.js')

// Simulates webpack's require inside node for fast and easy testing.
shimWebpackRequire(webpack);
```

When using `shim-webpack-require-for-node-tests` with mocha you should use the `--require` flag to import `shim-webpack-require.js` before the tests are run.

```bash
$ NODE_ENV=test mocha --compilers js:babel-core/register --require shim-webpack-require.js "tests/**/*test.js"
```

You can also set this up as your test script in your package.json

```json
{
  "name": "my-project",
  "scripts": {
    "test": "NODE_ENV=test mocha --colors --compilers js:babel-core/register --require shim-webpack-require.js \"tests/**/*test.js\"",
    "test:watch": "npm run test -- --watch",
    // ...
  },
  "devDependencies": {
    "jsdom": "^9.2.1",
    "mocha": "^2.4.5",
    "shim-webpack-require-for-node-tests": "^1.0.0",
    "webpack": "^1.12.9",
    // ...
  },
}
```

# Usage with jsdom
Its common to use this in combination with jsdom to test browser code in node. 
To add jsdom simply create a new `jsdom-setup.js` module

```js
var jsdom = require('jsdom').jsdom

var exposedProperties = ['window', 'navigator', 'document']

global.document = jsdom('')
global.window = document.defaultView
Object.keys(document.defaultView).forEach((property) => {
  if (typeof global[property] === 'undefined') {
    exposedProperties.push(property)
    global[property] = document.defaultView[property]
      
  }
  
})

global.navigator = {
  userAgent: 'node.js'
  
}

global.documentRef = document
```

and include that in your tests with an additional `--require` statement.

```bash
$ NODE_ENV=test mocha --compilers js:babel-core/register --require ./jsdom-setup.js --require ./shim-webpack-require.js "tests/**/*test.js"
```


## Also See
If you just want to use your normal webpack config to precompile your code before tests and
you are ok with the tradeoffs of errors being reported in a compiled test file in exchange for 
useing the real webpack requires that will run in your app code
be sure to check out the excellent [mocha-webpack](https://www.npmjs.com/package/mocha-webpack) 
project.


## Pull Requests Welcome
This module supports the minimal level of functionality needed to shim all of the 
common uses of webpack I've run into on many of my projects. It does not exhaustively support 
all of webpack's many options. If you run into an option that this module does not support pull 
requests are fixing gaps or improving features are more than welcome.
