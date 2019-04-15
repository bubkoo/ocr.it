const webpack = require('webpack');
const merge = require('webpack-merge');
const baseConfig = require('./webpack.config.base');

const isDevelopment = process.env.NODE_ENV === 'development';
const config = {
  target: 'electron-main',
  entry: {
    main: './src/main.ts',
  },
  output: {
    filename: '[name].js',
  },
}

if (isDevelopment) {
  config.devtool = 'source-map';
}

module.exports = merge(baseConfig, config);
