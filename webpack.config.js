
const path = require('path');
const webpack = require('webpack');
const WebpackConcatPlugin = require('webpack-concat-files-plugin');

const isDev = process.env.NODE_ENV !== 'production';
const config = {
  entry: './src/index.ts',
  devtool: 'inline-source-map',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    mainFiles: ['index'],
  },
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'lib'),
    publicPath: '/',
  },
  plugins: [
    new WebpackConcatPlugin({
      bundles: [
        {
          dest: './lib/src/types.d.ts',
          src: './src/**/*.d.ts',
        },
      ],
    }),
  ],
  optimization: {
    moduleIds: 'named',
  },
};
if (isDev) {
  config.mode = 'development';
} else {
  config.mode = 'production';
}
module.exports = config;
