import webpack from 'webpack';
import path from 'path';
import TerserPlugin from 'terser-webpack-plugin';

export interface CreateWebpackConfigOptions {
  mode: 'development' | 'production';
  context: string;
  entryPath: string;
  buildPath: string;
  publicUrlOrPath: string;
  srcPath: string;
}

const imageInlineSizeLimit = 10000;

export function createWebpackConfig(options: CreateWebpackConfigOptions): webpack.Configuration {
  const isProduction = options.mode === 'production';
  const isDevelopment = !isProduction;

  return {
    mode: options.mode,
    bail: isProduction,
    devtool: isProduction ? 'source-map' : 'cheap-module-source-map',
    entry: isDevelopment
      ? [require.resolve('react-dev-utils/webpackHotDevClient'), options.entryPath]
      : [options.entryPath],
    output: {
      path: isProduction ? options.buildPath : undefined,
      pathinfo: isDevelopment,
      filename: isProduction ? 'static/js/[name].[contenthash:8].js' : 'static/js/bundle.js',
      // TODO: remove this when upgrading to webpack 5
      futureEmitAssets: true,
      chunkFilename: isProduction
        ? 'static/js/[name].[contenthash:8].chunk.js'
        : 'static/js/[name].chunk.js',
      publicPath: options.publicUrlOrPath,
      devtoolModuleFilenameTemplate: isProduction
        ? info => path.relative(options.srcPath, info.absoluteResourcePath).replace(/\\/g, '/')
        : info => path.resolve(info.absoluteResourcePath).replace(/\\/g, '/'),
      // jsonpFunction: `webpackJsonp${appPackageJson.name}`,
      globalObject: 'this'
    },
    optimization: {
      minimize: isProduction,
      minimizer: [
        // This is only used in production mode
        new TerserPlugin({
          terserOptions: {
            parse: { ecma: 8 },
            compress: { ecma: 5, warnings: false, comparisons: false, inline: 2 },
            mangle: { safari10: true },
            keep_classnames: false,
            keep_fnames: false,
            output: { ecma: 5, comments: false, ascii_only: true }
          },
          sourceMap: true
        })
      ],
      splitChunks: {
        chunks: 'all',
        name: false
      },
      runtimeChunk: {
        name: entrypoint => `runtime-${entrypoint.name}`
      }
    },
    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
      alias: {
        src: options.srcPath
      }
    },
    plugins: [],
    module: {
      strictExportPresence: true,
      rules: [
        { parser: { requireEnsure: false } },
        {
          test: /\.(js|mjs|jsx|ts|tsx)$/,
          enforce: 'pre',
          use: [
            {
              options: {
                cache: true,
                formatter: require.resolve('react-dev-utils/eslintFormatter'),
                eslintPath: require.resolve('eslint'),
                resolvePluginsRelativeTo: __dirname
              },
              loader: require.resolve('eslint-loader')
            }
          ],
          include: options.srcPath
        },
        {
          oneOf: [
            {
              test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
              loader: require.resolve('url-loader'),
              options: {
                limit: imageInlineSizeLimit,
                name: 'static/media/[name].[hash:8].[ext]'
              }
            },
            {
              test: /\.(js|mjs|jsx|ts|tsx)$/,
              include: options.srcPath,
              loader: require.resolve('babel-loader'),
              options: {
                customize: require.resolve('babel-preset-react-app/webpack-overrides'),
                plugins: [
                  [
                    require.resolve('babel-plugin-named-asset-import'),
                    {
                      loaderMap: {
                        svg: {
                          ReactComponent: '@svgr/webpack?-svgo,+titleProp,+ref![path]'
                        }
                      }
                    }
                  ]
                ],
                cacheDirectory: true,
                cacheCompression: false,
                compact: isProduction
              }
            },
            {
              test: /\.(js|mjs)$/,
              exclude: /@babel(?:\/|\\{1,2})runtime/,
              loader: require.resolve('babel-loader'),
              options: {
                babelrc: false,
                configFile: false,
                compact: false,
                presets: [
                  [require.resolve('babel-preset-react-app/dependencies'), { helpers: true }]
                ],
                cacheDirectory: true,
                cacheCompression: false,
                sourceMaps: true,
                inputSourceMap: true
              }
            },
            {
              loader: require.resolve('file-loader'),
              exclude: [/\.(js|mjs|jsx|ts|tsx)$/, /\.html$/, /\.json$/],
              options: {
                name: 'static/media/[name].[hash:8].[ext]'
              }
            }
          ]
        }
      ]
    }
  };
}
