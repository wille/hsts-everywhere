const path = require('path');

module.exports = {
  mode: 'production',
  devtool: 'sourcemap',
  entry: {
    background: path.join(__dirname, 'src/background.js'),
    popup: path.join(__dirname, 'src/popup.js'),
  },
  output: {
    path: path.join(__dirname, 'dist')
  },
}
