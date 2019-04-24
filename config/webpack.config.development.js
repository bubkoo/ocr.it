const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const merge = require('webpack-merge');
const baseConfig = require('./webpack.config.base');
const htmlplugins = require('./webpack.config.htmlplugin');

const port = process.env.PORT || 3000;
const config = {
  devtool: 'inline-source-map',
  target: 'electron-renderer',
  entry:
  {
    result: [
      'react-hot-loader/patch',
      `webpack-hot-middleware/client?path=http://localhost:${port}/__webpack_hmr&reload=true`,
      './src/result/index.tsx',
    ],
    history: [
      'react-hot-loader/patch',
      `webpack-hot-middleware/client?path=http://localhost:${port}/__webpack_hmr&reload=true`,
      './src/history/index.tsx',
    ],
    indicator: [
      'react-hot-loader/patch',
      `webpack-hot-middleware/client?path=http://localhost:${port}/__webpack_hmr&reload=true`,
      './src/indicator/index.tsx',
    ],
    preferences: [
      'react-hot-loader/patch',
      `webpack-hot-middleware/client?path=http://localhost:${port}/__webpack_hmr&reload=true`,
      './src/preferences/index.tsx',
    ],
  },
  output: {
    filename: '[name]/index.js',
    publicPath: `http://localhost:${port}/dist/`
  },
  module: {
    rules: [
      {
        test: /\.less$/,
        use: ['style-loader', 'css-loader', 'less-loader'],
      },
    ],
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('development')
    }),
    new webpack.LoaderOptionsPlugin({
      debug: true
    }),
  ],
};

htmlplugins.forEach(plugin => { config.plugins.push(plugin) })

module.exports = merge(baseConfig, config);
