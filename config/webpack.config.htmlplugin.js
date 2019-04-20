const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = [
  new HtmlWebpackPlugin({
    inject: false,
    minify: true,
    template: './src/template.ejs',
    filename: 'result/index.html',
    title: 'Recognition Result',
    view: 'result',
  }),

  new HtmlWebpackPlugin({
    inject: false,
    minify: true,
    template: './src/template.ejs',
    filename: 'indicator/index.html',
    title: 'Indicator',
    view: 'indicator',
  }),

  new HtmlWebpackPlugin({
    inject: false,
    minify: true,
    template: './src/template.ejs',
    filename: 'preferences/index.html',
    title: 'Preferences',
    view: 'preferences',
  }),
];
