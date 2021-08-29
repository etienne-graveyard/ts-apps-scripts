import path from 'path';

export function createPaths(root: string, project: string) {
  const buildPath = path.resolve(project, 'build');
  const srcPath = path.resolve(project, 'src');
  const buildMainPath = path.resolve(buildPath, 'main.js');
  const buildPkgPath = path.resolve(buildPath, 'package.json');
  const buildLockPath = path.resolve(buildPath, 'yarn.lock');
  const rootLockPath = path.resolve(root, 'yarn.lock');
  const buildNodeModulesPath = path.resolve(buildPath, 'node_modules');

  return {
    entryPath: path.resolve(project, 'src/index.ts'),
    buildPath,
    publicBuildPath: path.join(buildPath, 'public'),
    srcPath,
    buildMainPath,
    buildPkgPath,
    buildLockPath,
    rootLockPath,
    buildNodeModulesPath
  } as const;
}
