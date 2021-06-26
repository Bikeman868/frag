const path = require('path');

module.exports = {
  mode: 'production',
  entry: './src/index.js',
  output: {
    filename: 'frag.min.js',
    path: path.resolve(__dirname, 'dist')
  },
  devtool: 'source-map',
  watchOptions: {
    ignored: '**/node_modules'
  }
};
