const path = require('path');

module.exports = {
  mode: 'development',
  entry: './src/index.js',
  output: {
    filename: 'frag.js',
    path: path.resolve(__dirname, 'dist')
  },
  devtool: 'source-map',
  watchOptions: {
    ignored: '**/node_modules'
  }
};
