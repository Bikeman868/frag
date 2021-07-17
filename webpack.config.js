const path = require('path');

var env = process.env.NODE_ENV || "development";

module.exports = {
  mode: env,
  entry: './src/index.js',
  output: {
    filename: 'frag.min.js',
    path: path.resolve(__dirname, env === 'development' ? 'samples' : 'dist')
  },
  devtool: env === 'development' ? false : 'source-map', 
  watchOptions: {
    ignored: '**/node_modules'
  }
};
