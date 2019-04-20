const webpack = require('webpack');
const merge = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const baseConfig = require('./webpack.config.base');
const htmlplugins = require('./webpack.config.htmlplugin');

const port = process.env.PORT || 3000;
const config = {
  target: 'electron-renderer',
  entry: {
    result: './src/result/index.tsx',
    indicator: './src/indicator/index.tsx',
    preferences: './src/preferences/index.tsx',
  },
  output: {
    filename: '[name]/index.js',
  },
  module: {
    rules: [
      {
        test: /\.less$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: ['css-loader', 'less-loader']
        })
      },
    ],
  },
  plugins: [
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production')
    }),
    new ExtractTextPlugin('[name]/index.css'),
  ],
};

htmlplugins.forEach(plugin => { config.plugins.push(plugin) })

module.exports = merge(baseConfig, config);
