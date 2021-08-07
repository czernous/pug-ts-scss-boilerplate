// TODO: Add eslint-loader

const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ESLintPlugin = require('eslint-webpack-plugin');
const StylelintPlugin = require('stylelint-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

function generateJadePlugins(templateDir) {
  const templateFiles = fs.readdirSync(path.resolve(__dirname, templateDir));
  return templateFiles.map((item) => {
    const parts = item.split('.');
    const name = parts[0];
    return new HtmlWebpackPlugin({
      filename: `${name}.html`,
      template: path.resolve(__dirname, `${templateDir}/${item}/${name}.pug`),
      inject: false,
    });
  });
}
const pugData = require('./src/utils/generatePugData');

const jadePlugins = generateJadePlugins('./src/pages');

module.exports = (env, { mode = 'development' }) => {
  const config = {
    mode,
    context: path.resolve(__dirname, 'src'),
    entry: {
      index: ['./pages/index/index.ts', './pages/index/index.scss'],
    },
    module: {
      rules: [
        {
          test: /\.(m?js|ts)$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env', '@babel/preset-typescript'],
              plugins: [
                '@babel/plugin-transform-runtime',
                '@babel/plugin-proposal-class-properties',
                '@babel/plugin-proposal-object-rest-spread',
              ],
            },
          },
        },
        {
          test: /\.s[ac]ss$/i,
          use: [
            process.env.NODE_ENV !== 'production'
              ? 'style-loader'
              : MiniCssExtractPlugin.loader,
            {
              loader: 'css-loader',
              options: {
                sourceMap: true,
              },
            },
            {
              loader: 'postcss-loader',
              options: {
                sourceMap: true,
              },
            },
            {
              loader: 'sass-loader',
              options: {
                sassOptions: {
                  sourceMap: true,
                },
              },
            },
          ],
        },
        {
          test: /\.pug$/,

          use: [
            {
              loader: 'pug-html-loader',
              options: {
                pretty: true,
                indent: 2,
                data: pugData,
              },
            },
          ],
          type: 'asset/source',
        },
        {
          test: /\.(jpg|jpeg|png|gif|mp3|svg)$/,
          use: ['file-loader?name=/img/[name].[ext]'],
        },
      ],
    },
    resolve: {
      extensions: ['.js', '.jsx', '.ts', '.tsx', '.css', '.scss', '.pug'],
    },
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: './js/[name].js',
    },
    optimization: {
      mangleWasmImports: true,
      mergeDuplicateChunks: true,
      minimize: true,
      nodeEnv: 'production',
    },
    plugins: [
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': '"production"',
      }),
      new webpack.HotModuleReplacementPlugin(),
    ],
  };
  /**
   * If in development mode adjust the config accordingly
   */
  if (mode === 'development') {
    config.devtool = 'source-map';
    config.module.rules.push({
      loader: 'source-map-loader',
      test: /\.js$/,
      exclude: /node_modules/,
      enforce: 'pre',
    });
    config.plugins = [
      new ESLintPlugin({
        emitError: true,
        extensions: ['js', 'ts'],
      }),

      new StylelintPlugin({
        emitError: true,
      }),

      new MiniCssExtractPlugin({
        filename: './css/[name].css',
      }),

      new webpack.DefinePlugin({
        'process.env.NODE_ENV': '"development"',
      }),

      new webpack.HotModuleReplacementPlugin(),
    ].concat(jadePlugins);
    config.devServer = {
      contentBase: path.resolve(__dirname, 'dist'),
      compress: true,
      port: 3000,
      publicPath: '/',
      hot: true,

      stats: {
        colors: true,
        hash: false,
        version: false,
        timings: true,
        assets: true,
        assetsSpace: 15,
        chunks: false,
        modules: false,
        reasons: false,
        children: false,
        source: false,
        errors: true,
        errorDetails: true,
        warnings: false,
        publicPath: false,
      },
    };
    config.optimization = {
      mangleWasmImports: true,
      mergeDuplicateChunks: true,
      minimize: false,
      nodeEnv: 'development',
    };
  }
  return config;
};
