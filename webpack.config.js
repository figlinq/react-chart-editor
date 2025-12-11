const webpack = require('webpack');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');

module.exports = () => {
  const isDevelopment = process.env.NODE_ENV !== 'production';

  return {
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
      alias: {},
    },
    plugins: [
      new webpack.IgnorePlugin({resourceRegExp: /vertx/}),
      isDevelopment && new ReactRefreshWebpackPlugin(),
    ].filter(Boolean),
    devServer: {
      open: false,
      static: './dev',
      client: {overlay: {errors: true, warnings: false}},
      hot: true,
    },
    devtool: 'eval-source-map',
    target: 'browserslist',
  };
};
