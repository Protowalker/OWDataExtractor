"use strict";

var path = require('path');

module.exports = {
  entry: './out/overpy.js',
  output: {
    path: path.resolve(__dirname, '../'),
    filename: 'overpy.js',
    libraryTarget: 'var',
    library: 'overpy'
  },
  target: 'web',
  node: {
    fs: "empty",
    module: "empty",
    net: "empty"
  }
};