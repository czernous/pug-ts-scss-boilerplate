/* eslint-disable import/no-extraneous-dependencies */

import * as webpack from 'webpack';
import { Configuration as WebpackConfiguration } from 'webpack';
import { Configuration as WebpackDevServerConfiguration } from 'webpack-dev-server';
import fs from 'fs';
import path from 'path';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import ESLintPlugin from 'eslint-webpack-plugin';
import CopyPlugin from 'copy-webpack-plugin';
import StylelintPlugin from 'stylelint-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import chokidar from 'chokidar';
import pugData from './src/utils/generatePugData';

interface Configuration extends WebpackConfiguration {
  devServer?: WebpackDevServerConfiguration;
}

function generateJadePlugins(templateDir: string) {
  const templateFiles = fs.readdirSync(path.resolve(__dirname, templateDir));
  return templateFiles.map((item: string) => {
    const parts = item.split('.');
    const name = parts[0];
    return new HtmlWebpackPlugin({
      filename: `${name}.html`,
      template: path.resolve(__dirname, `${templateDir}/${item}/${name}.pug`),
      inject: false,
    });
  });
}

const jadePlugins = generateJadePlugins('./src/pages');

const createConfig = (env: any, { mode = 'development' }): Configuration => {
  const config: Configuration = {
    target: 'web',
    // @ts-ignore
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
          type: 'asset/source',
          use: [
            {
              loader: 'pug-html-loader',
              options: {
                pretty: true,
                indent: 2,
                data: { ...pugData },
              },
            },
          ],
        },
        {
          test: /\.(jpg|jpeg|png|gif|mp3|svg)$/,
          type: 'asset/resource',
          generator: {
            filename: '/img/[name].[ext]',
          },
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
    config!.module!.rules!.push({
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

      new CopyPlugin({
        patterns: [
          { from: './img', to: 'img' },
          { from: './common/sprite.svg', to: 'svg' },
          { from: './video', to: 'video' },
          { from: './favicon', to: 'favicon' },
          { from: './json', to: 'json' },
        ],
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
      hotOnly: true,
      open: true,
      overlay: {
        warnings: false,
        errors: true,
      },
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
      before(app, server) {
        chokidar.watch(['./src/pages/**/*.pug']).on('all', () => {
          server.sockWrite(server.sockets, 'content-changed');
        });
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

export default createConfig;
