import { PackageJson, readPackageJson } from '../utils/readPackageJson';
import { createPaths } from './createPaths';
import fse from 'fs-extra';
import { internalsFromPackageJson } from '../utils/internalsFromPackageJson';
import { createWebpackConfig } from './createWebpackConfig';
import { createBabelConfig } from './createBabelConfig';
import webpack from 'webpack';
import { builtinModules as builtin } from 'module';
import { runCommand } from '../utils/runCommand';
import { resolveProject } from '../utils/resolveProject';

export interface BuildNodeAppConfig {
  project?: string;
}

export async function BuildNodeApp(config: BuildNodeAppConfig = {}) {
  const { project, root } = await resolveProject(config.project);

  const {
    buildPath,
    entryPath,
    publicBuildPath,
    srcPath,
    buildPkgPath,
    rootLockPath,
    buildLockPath,
    buildNodeModulesPath
  } = createPaths(root, project);

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
    mode: 'production',
    babelOptions: createBabelConfig(),
    internals
  });

  const serverCompiler = webpack(serverConfig);

  serverCompiler.run(async (error, stats) => {
    if (error || stats.hasErrors()) {
      process.exitCode = 1;
      return;
    }
    // source-map-support is injected by the build system so it needs to be in dependency !
    const externals: Array<string> = ['source-map-support'];
    const externalReg = /^external "(.+)"$/;
    const modules = stats.toJson().modules || [];
    modules.forEach(mod => {
      const match = externalReg.exec(mod.identifier);
      if (match) {
        const modName = match[1];
        if (builtin.indexOf(modName) >= 0) {
          // builtin module
          return;
        }
        externals.push(modName);
      }
    });
    // create package.json
    const allDependencies = pkg.dependencies ?? {};
    const newPkg: PackageJson = {
      name: pkg.name,
      dependencies: externals.reduce<Record<string, string>>((acc, ext) => {
        const dep = allDependencies[ext];
        if (!dep) {
          throw new Error(`Missin dependencie ${ext} in package.json`);
        }
        acc[ext] = allDependencies[ext];
        return acc;
      }, {}),
      scripts: {
        start: 'NODE_ENV=production node ./main.js'
      }
    };
    fse.writeJSONSync(buildPkgPath, newPkg);
    // copy yarn.lock
    fse.copySync(rootLockPath, buildLockPath);
    // Copy env files ??
    // fse.copySync(path.resolve(root, '.env'), path.resolve(outputDir, '.env'));
    // if (fse.existsSync(path.resolve(root, '.env.production'))) {
    //   fse.copySync(
    //     path.resolve(root, '.env.production'),
    //     path.resolve(outputDir, '.env.production')
    //   );
    //   spinner.succeed('Copy .env.production');
    // }
    // run yarn to fix yarn.lock
    const result = runCommand('yarn', buildPath);
    console.log(result);
    // remove node_modules
    if (fse.existsSync(buildNodeModulesPath)) {
      await fse.remove(buildNodeModulesPath);
    }
  });
}
