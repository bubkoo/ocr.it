const path = require('path');

module.exports = {
  mode: process.env.NODE_ENV || 'development',

  output: {
    path: path.resolve(__dirname, '../dist'),
  },

  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: [
          /node_modules/,
        ]
      }
    ]
  },

  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.json']
  },

  node: {
    __dirname: false,
    __filename: false
  },
}
