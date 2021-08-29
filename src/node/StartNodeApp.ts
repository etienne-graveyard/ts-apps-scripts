import { once } from '../utils/index';
import webpack from 'webpack';
import nodemon from 'nodemon';
import fse from 'fs-extra';
import { createWebpackConfig } from './createWebpackConfig';
import { createPaths } from './createPaths';
import { createBabelConfig } from './createBabelConfig';
import { readPackageJson } from '../utils/readPackageJson';
import { internalsFromPackageJson } from '../utils/internalsFromPackageJson';
import { resolveProject } from '../utils/resolveProject';

export interface StartNodeAppConfig {
  project?: string;
}

export async function StartNodeApp(config: StartNodeAppConfig = {}) {
  const { project, root } = await resolveProject(config.project);

  const { buildPath, entryPath, publicBuildPath, srcPath, buildMainPath } = createPaths(
    root,
    project
  );

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
