/**
 * Build config, adapted from Elegant Themes' d5-extension-example-modules.
 *
 * Output (all in build/):
 * - bundle.js             Visual Builder script (registers the modules).
 * - frontend.js           Front-end script (click, tap and flip button triggers).
 * - bundle.css            Front-end + builder styles, from every `module.scss`.
 * - vb-bundle.css         Builder-only styles, from every `style.scss`.
 * - modules-json/<name>/  Copies of `module.json`, read by PHP to register the modules.
 */
const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  devtool: process.env.NODE_ENV === 'production' ? false : 'source-map',

  entry: {
    bundle:   './src/index.ts',
    frontend: './src/frontend/index.ts',
  },

  // The Visual Builder already loads these, so they must not be bundled.
  externals: {
    jquery: 'jQuery',
    underscore: '_',
    lodash: 'lodash',
    react: ['vendor', 'React'],
    'react-dom': ['vendor', 'ReactDOM'],

    '@wordpress/i18n': ['vendor', 'wp', 'i18n'],
    '@wordpress/hooks': ['vendor', 'wp', 'hooks'],

    '@divi/rest': ['divi', 'rest'],
    '@divi/data': ['divi', 'data'],
    '@divi/module': ['divi', 'module'],
    '@divi/module-utils': ['divi', 'moduleUtils'],
    '@divi/modal': ['divi', 'modal'],
    '@divi/field-library': ['divi', 'fieldLibrary'],
    '@divi/icon-library': ['divi', 'iconLibrary'],
    '@divi/module-library': ['divi', 'moduleLibrary'],
    '@divi/style-library': ['divi', 'styleLibrary'],
  },

  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: {
          loader: 'ts-loader',
          options: {
            // Type errors are reported by `npm run typecheck` instead of failing the build.
            transpileOnly: true,
          },
        },
        exclude: /node_modules/,
      },
      {
        test: /\.s?css$/i,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              url: false,
              importLoaders: 1,
            },
          },
          {
            loader: 'sass-loader',
            options: {
              api: 'modern-compiler',
            },
          },
        ],
      },
    ],
  },

  optimization: {
    // Put `style.scss` files into their own builder-only stylesheet.
    splitChunks: {
      cacheGroups: {
        vb: {
          type: 'css/mini-extract',
          test: /[\\/]style\.s?css$/,
          chunks: 'all',
          enforce: true,
          name(_, chunks, cacheGroupKey) {
            return `${cacheGroupKey}-${chunks[0].name}`;
          },
        },
        default: false,
      },
    },
  },

  plugins: [
    new MiniCssExtractPlugin({
      filename: '[name].css',
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: '**/module.json',
          context: 'src/components',
          to: path.resolve(__dirname, 'build/modules-json'),
        },
      ],
    }),
  ],

  resolve: {
    extensions: ['.js', '.jsx', '.tsx', '.ts', '.json'],
  },

  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'build'),
    clean: true,
  },

  stats: {
    errorDetails: true,
  },
};
