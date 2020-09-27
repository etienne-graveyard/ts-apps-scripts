import { once } from '../../../utils/index';
import webpack from 'webpack';
import nodemon from 'nodemon';
import fse from 'fs-extra';
import { createWebpackConfig } from '../createWebpackConfig';
import { createPaths } from '../createPaths';
import { createBabelConfig } from '../createBabelConfig';
import { readPackageJson } from '../../../utils/readPackageJson';
import { internalsFromPackageJson } from '../../../utils/internalsFromPackageJson';

// const nodeExternals = require('webpack-node-externals');
// const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin');
// const config = require('./paths');
// const path = require('path');
// const babelPreset = require('../babel');

export async function nodeStart(root: string, project: string) {
  const { buildPath, entryPath, publicBuildPath, srcPath, buildMainPath } = createPaths(root, project);

  const pkg = await readPackageJson(root);
  const internals = internalsFromPackageJson(pkg);

  if (fse.existsSync(buildPath)) {
    await fse.emptyDir(buildPath);
  }

  const serverConfig = createWebpackConfig({
    context: root,
    srcPath,
    entryPath,
    buildPath,
    publicBuildPath,
    mode: 'development',
    babelOptions: createBabelConfig(),
    internals
  });

  const serverCompiler = webpack(serverConfig);

  const startServerOnce = once<webpack.ICompiler.Handler>((err, stats) => {
    if (err) {
      return;
    }
    nodemon({ script: buildMainPath, watch: [buildPath] }).on('quit', process.exit);
  });

  process.on('SIGINT', process.exit);
  serverCompiler.watch(serverConfig.watchOptions || {}, startServerOnce);
}
