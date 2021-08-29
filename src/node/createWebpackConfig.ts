import webpack from 'webpack';
import FriendlyErrorsWebpackPlugin from 'friendly-errors-webpack-plugin';
import WebpackModules from 'webpack-modules';
import { BabelConfig } from './createBabelConfig';

export interface CreateWebpackConfigOptions {
  mode: 'development' | 'production';
  context: string;
  entryPath: string;
  buildPath: string;
  srcPath: string;
  publicBuildPath: string;
  babelOptions: BabelConfig;
  internals: Array<string>;
}

// This is the Webpack configuration.
// It is focused on developer experience and fast rebuilds.
export function createWebpackConfig(options: CreateWebpackConfigOptions): webpack.Configuration {
  // const mainBabelOptions = {
  //   babelrc: true,
  //   cacheDirectory: true,
  //   ...createBabelConfig(),
  // };

  return {
    context: options.context,
    mode: options.mode,
    target: 'node',
    devtool: 'source-map',

    externals: [
      (_context, request, callback) => {
        const isEntry = request === options.entryPath;
        const isRelative = request[0] === '.';
        const isInternal = options.internals.some(
          internal => request === internal || request.startsWith(internal + '/')
        );
        const isSrcAlias = request.startsWith('src/');
        if (isEntry || isRelative || isInternal || isSrcAlias) {
          // console.log(`internal ${request}`);
          callback();
        } else {
          // external
          // console.log(`external ${request}`);
          callback(null, `commonjs ${request}`);
        }
      }
    ],
    // Since we are not targeting a browser, bundle size is not relevant.
    // Additionally, the performance hints clutter up our nice error messages.
    performance: {
      hints: false
    },
    // Since we are wrapping our own webpack config, we need to properly resolve
    // Backpack's and the given user's node_modules without conflict.
    resolve: {
      extensions: ['.js', '.ts', '.json'],
      alias: {
        src: options.srcPath
      }
    },
    resolveLoader: {},
    node: {
      __filename: true,
      __dirname: true
    },
    entry: {
      main: [options.entryPath]
    },
    // This sets the default output file path, name, and compile target
    // module type. Since we are focused on Node.js, the libraryTarget
    // is set to CommonJS2
    output: {
      path: options.buildPath,
      filename: '[name].js',
      sourceMapFilename: '[name].map',
      publicPath: options.publicBuildPath,
      libraryTarget: 'commonjs2'
    },
    // Define a few default Webpack loaders. Notice the use of the new
    // Webpack 2 configuration: module.rules instead of module.loaders
    module: {
      rules: [
        // Process JS with Babel (transpiles ES6 code into ES5 code).
        {
          test: /\.(js|ts|jsx)$/,
          loader: require.resolve('babel-loader'),
          exclude: [/node_modules/, options.buildPath],
          options: options.babelOptions
        }
      ]
    },
    // A few commonly used plugins have been removed from Webpack v4.
    // Now instead, these plugins are avaliable as "optimizations".
    // @see https://webpack.js.org/configuration/optimization/
    optimization: {
      // optimization.noEmitOnErrors prevents Webpack
      // The NoEmitOnErrorsPlugin plugin prevents Webpack
      // from printing out compile time stats to the console.
      noEmitOnErrors: true
    },
    plugins: [
      new WebpackModules(),
      // We define some sensible Webpack flags. One for the Node environment,
      // and one for dev / production. These become global variables. Note if
      // you use something like eslint or standard in your editor, you will
      // want to configure __DEV__ as a global variable accordingly.
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(options.mode),
        __DEV__: options.mode === 'development'
      }),
      // In order to provide sourcemaps, we automagically insert this at the
      // top of each file using the BannerPlugin.
      new webpack.BannerPlugin({
        raw: true,
        entryOnly: false,
        banner: `require('source-map-support/register');`
      }),
      // The FriendlyErrorsWebpackPlugin (when combined with source-maps)
      // gives Backpack its human-readable error messages.
      new FriendlyErrorsWebpackPlugin({
        clearConsole: options.mode === 'development'
      })
    ]
  };
}
