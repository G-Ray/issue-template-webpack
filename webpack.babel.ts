import path from 'path';
import webpack from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import { ProvidePlugin } from 'webpack';

export const shouldExclude = (filePath: string, projectRoot: string) => {
  if (
    (filePath.includes(projectRoot) && filePath.endsWith('sx')) ||
    isTamaguiDistJSX(filePath)
  ) {
    return false
  }

  return true
}

function isTamaguiDistJSX(filePath: string) {
  return filePath.includes('/dist/jsx/'.replace(/\//g, path.sep))
}

const CONTEXT = __dirname;
const DEV = process.env.NODE_ENV !== 'production';
const NODE_ENV = process.env.NODE_ENV || 'development';
const TARGET = process.env.TARGET || 'web';

const tamaguiOptions = {
  config: './tamagui.config.ts',
  components: ['tamagui'],
  importsWhitelist: ['color.ts', 'space.ts', 'radius.ts'],
  disableExtraction: process.env.DISABLE_EXTRACTION === 'true' ?? DEV,
};

module.exports = /** @type { import('webpack').Configuration } */ {
  context: CONTEXT,
  mode: DEV ? 'development' : 'production',
  output: {
    publicPath: "/",
  },
  entry: [
    'core-js/stable',
    'regenerator-runtime/runtime',
    './src/client.tsx',
  ],
  devtool: 'source-map',
  resolve: {
    modules: [
      path.resolve(CONTEXT, 'node_modules'),
      path.resolve(CONTEXT, '../../node_modules'),
      'node_modules',
    ],
    extensions: [`reanimated.ts`, `reanimated.tsx`, '.web.js', '.ts', '.tsx', '.js', '.mjs', '.json'],
    alias: {
      'react-native$': 'react-native-web',
      'react-native-reanimated': require.resolve('react-native-reanimated'),
      'react-native-reanimated$': require.resolve('react-native-reanimated'),
      'react-native-svg': 'react-native-svg-web',
    },
  },
  devServer: {
    client: {
      overlay: false,
    },
    hot: true,
    allowedHosts: 'all',
    static: {
      directory: path.join(__dirname, 'public'),
    },
    headers: { 'Access-Control-Allow-Origin': '*' },
    compress: true,
    port: 3000,
    historyApiFallback: true,
  },
  module: {
    rules: [
      {
        oneOf: [{
          test: /\.mjs$/,
          include: /node_modules/,
          type: 'javascript/auto',
          resolve: {
            fullySpecified: false,
          }
        },
          {
            test: /(react-native-reanimated|gorhom\/portal).*\.[tj]sx?$/,
            use: [
              {
                loader: 'babel-loader',
                options: {
                  presets: [['@babel/preset-react', {
                    runtime: 'automatic',
                  }]],
                  plugins: [
                    ["react-native-web", { commonjs: true }],
                  ],
                },
              },
            ],
          },
          {
            test: /(bottom-sheet).*\.[tj]sx?$/,
            use: [
              {
                loader: 'babel-loader',
                options: {
                  presets: [['@babel/preset-react', {
                    runtime: 'automatic',
                  }]],
                  plugins: [
                    ["react-native-web", { commonjs: true }],
                    'react-native-reanimated/plugin',
                    '@babel/plugin-proposal-class-properties',
                  ],
                },
              },
            ],
          },
          {
            test: /\.[jt]sx?$/,
            rules: [{
              loader: 'babel-loader',
              options: {
                presets: [
                  ['@babel/preset-env', {
                    useBuiltIns: 'entry',
                    corejs: 3,
                  }],
                  '@babel/preset-typescript',
                  ['@babel/preset-react', {
                    runtime: 'automatic',
                  }],
                ],
                plugins: [
                  ["react-native-web", { commonjs: true }],
                  'macros',
                  '@babel/plugin-proposal-class-properties',
                  "@babel/plugin-transform-flow-strip-types",
                ],
              },
            }, {
              loader: 'tamagui-loader',
              exclude: (path) => shouldExclude(path, CONTEXT, tamaguiOptions),
              options: tamaguiOptions,
            }],
          },
          {
            test: /\.css$/,
            use: ['style-loader', 'css-loader'],
          },
          {
            test: /\.(png|jpg|gif)$/i,
            type: 'asset/resource',
            generator: {
              filename: "images/[name].[hash][ext]",
            },
          },
          {
            test: /\.(woff|woff2|eot|ttf|otf)$/i,
            type: 'asset/resource',
            generator: {
              filename: 'fonts/[name].[hash][ext]',
            }
          },
        ],
      },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      process: {
        env: {
          __DEV__: NODE_ENV === 'development' ? 'true' : 'false',
          IS_STATIC: '""',
          NODE_ENV: JSON.stringify(NODE_ENV),
          TAMAGUI_TARGET: JSON.stringify('web'),
          DEBUG: JSON.stringify(process.env.DEBUG || ''),
          BROWSER: JSON.stringify(TARGET !== 'node'),
        },
      },
    }),
    new HtmlWebpackPlugin({
      template: `./public/index.html`,
    }),
    new ProvidePlugin({
			React: 'react',
		}),
  ].filter(Boolean),
}
