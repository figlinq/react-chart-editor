const webpack = require('webpack');
const path = require('path');

module.exports = (env, argv) => ({
  entry: ['./dev/index.js'],
  output: {
    filename: 'bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.js?$/,
        use: 'babel-loader',
        exclude: [/node_modules/],
      },
      {
        test: /\.(css|scss)?$/,
        use: ['style-loader', 'css-loader', 'sass-loader'],
      },
    ],
  },
  resolve: {
    modules: ['node_modules', path.resolve(__dirname, '../../node_modules')],
  },
  plugins: [new webpack.IgnorePlugin({resourceRegExp: /vertx/})],
  devServer: {
    open: false,
    static: './dev',
    client: {overlay: {errors: true, warnings: false}},
    hot: true,
  },
  devtool: 'eval-source-map',
  target: 'browserslist',
});
