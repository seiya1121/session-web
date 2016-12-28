const webpack = require('webpack');
const path = require('path');
const NodeTargetPlugin = require('webpack/lib/node/NodeTargetPlugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const DEBUG = !process.argv.includes('--release');
const distPath = (assetType) => path.resolve(__dirname, `app/dist/${assetType}`);

const Scripts = [
  { key: 'index', file: './index.jsx' },
];

const Styles = [
  { key: 'base', file: './base.css' },
  { key: 'normalize', file: './normalize.css' },
  { key: 'test', file: './test.scss' },
];

const entryForScripts = {};
const entryForStyles = {};

Scripts.forEach(script => Object.assign(entryForScripts, { [script.key]: [script.file] }));
Styles.forEach(style => Object.assign(entryForStyles, { [style.key]: [style.file] }));

const config = [
  // jsx関連
  {
    cache: DEBUG,
    context: `${__dirname}/app/scripts/components`,
    entry: entryForScripts,
    output: {
      path: distPath('scripts'),
      filename: '[name].bundle.js',
      sourceMapFilename: '[name].map',
    },
    target: 'web',
    resolve: {
      extensions: ['', '.js', '.jsx', '.json'],
      root: [
        `${__dirname}/node_modules`,
        path.resolve('./app'),
      ],
    },

    module: {
      preLoaders: [
        {
          test: /\.jsx$|\.js$/,
          loader: 'eslint-loader',
          exclude: /node_modules/,
        },
      ],
      loaders: [
        {
          test: /\.jsx$|\.js$/,
          loader: 'babel-loader',
          exclude: /node_modules/,
          query: {
            presets: ['es2015', 'react'],
          },
        },
        {
          test: /\.json$/,
          loader: 'json-loader',
        },
      ],
    },

    plugins: [
      new webpack.NoErrorsPlugin(),
      new NodeTargetPlugin(),
    ],
    eslint: {
      configFile: './.eslintrc.json',
      fix: DEBUG,
    },
    watch: DEBUG,
  },
  // Style関連
  {
    cache: DEBUG,
    context: `${__dirname}/app/styles`,
    entry: entryForStyles,
    output: {
      path: distPath('styles'),
      filename: '[name].bundle.js',
    },
    module: {
      loaders: [
        {
          test: /\.css$/,
          loader: ExtractTextPlugin.extract('style-loader', 'css-loader'),
        },
        {
          test: /\.scss$/,
          loader: ExtractTextPlugin.extract('style-loader', 'css-loader!sass-loader'),
        },
      ],
    },
    plugins: [
      new ExtractTextPlugin('css/[name].css'),
    ],
    watch: DEBUG,
  },
];

module.exports = config;
