/* eslint-disable global-require */
/* eslint-disable import/no-extraneous-dependencies */
import * as webpack from 'webpack';
import { Configuration as WebpackConfiguration } from 'webpack';
import { Configuration as WebpackDevServerConfiguration } from 'webpack-dev-server';
import fs from 'fs';
import path from 'path';
import babelLoaderExcludeNodeModulesExcept from 'babel-loader-exclude-node-modules-except';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import ESLintPlugin from 'eslint-webpack-plugin';
import CopyPlugin from 'copy-webpack-plugin';
import StylelintPlugin from 'stylelint-webpack-plugin';
import CompressionPlugin from 'compression-webpack-plugin';
import chokidar from 'chokidar';

import pugData from './src/utils/generatePugData';

interface Configuration extends WebpackConfiguration {
  devServer?: WebpackDevServerConfiguration;
}
// const smp = new SpeedMeasurePlugin();

const mode = process.env.NODE_ENV || 'development';
const dist = './dist';

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

const createConfig = (env: any, options: any): Configuration => {
  const config: Configuration = {
    // target: 'web',
    // name: 'browser',
    // @ts-ignore
    mode,
    context: path.resolve(__dirname, 'src'),
    entry: {
      index: ['./pages/index/index.ts', './pages/index/index.scss'],
    },
    module: {
      rules: [
        {
          test: /\.(m?js|ts|tsx)$/,
          exclude: babelLoaderExcludeNodeModulesExcept([
            // es6 modules from node_modules/
            'swiper',
            'dom7',
          ]),
          use: {
            loader: 'babel-loader',
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
        // img
        {
          test: /\.(jpe?g|png|gif|svg)$/,
          type: 'asset/resource',
          generator: {
            filename: '[path][name].[ext]',
            publicPath: '../',
          },
        },

        // fonts
        {
          test: /\.(woff|woff2|eot|ttf)$/,
          type: 'asset/resource',
          generator: {
            filename: '[path][name].[ext]',
            publicPath: '../',
          },
        },
      ],
    },
    resolve: {
      extensions: ['.js', '.jsx', '.ts', '.tsx', '.pug'],
      alias: {
        vue: 'vue/dist/vue.esm-bundler.js',
        blocks: path.resolve(__dirname, './blocks'),
      },
    },
    output: {
      path: path.resolve(__dirname, dist),
      filename: './js/[name].js',
    },
    optimization: {
      mangleWasmImports: true,
      mergeDuplicateChunks: true,
      minimize: true,
      minimizer: [
        (compiler) => ({
          sourceMap: true,
          parallel: true,
          cache: true,
          extractComments: true,
          terserOptions: {
            ecma: 5,
            ie8: false,
            compress: true,
            warnings: true,
          },
        }),
      ],

      moduleIds: 'deterministic',
      nodeEnv: 'production',
    },

    plugins: [
      new ESLintPlugin({
        emitError: true,
        extensions: ['js', 'ts'],
      }),

      new CopyPlugin({
        patterns: [
          { from: './img', to: 'img' },
          { from: './common/sprite.svg', to: 'icons' },
          { from: './video', to: 'video' },
          { from: './favicon', to: 'favicon' },
          { from: './json', to: 'json' },
        ],
      }),

      new StylelintPlugin({
        emitError: true,
        threads: true,
        lintDirtyModulesOnly: true,
        exclude: './src/scss',
      }),

      new MiniCssExtractPlugin({
        filename: './css/[name].css',
      }),
    ].concat(jadePlugins),
  };

  if (mode === 'production') {
    config!.plugins!.push(
      new CompressionPlugin({
        filename: '[path][name].br[query]',
        algorithm: 'brotliCompress',
        test: /\.(js|ts|vue)$/,
        compressionOptions: { level: 11 },
        threshold: 10240,
        minRatio: 0.8,
        deleteOriginalAssets: false,
      })
    );
    config!.stats = {
      preset: 'detailed',
      modules: false,
      orphanModules: false,
      entrypoints: false,
      children: true,
    };
  }

  if (mode === 'development') {
    config.devtool = 'source-map';
    config!.module!.rules!.push({
      loader: 'source-map-loader',
      test: /\.js$/,
      exclude: /node_modules/,
      enforce: 'pre',
    });

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
        children: true,
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
      minimize: true,
      nodeEnv: 'development',
    };
  }

  return config;
};

export default createConfig;
