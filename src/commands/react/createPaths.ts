import path from 'path';

export function createPaths(root: string, project: string) {
  const buildPath = path.resolve(project, 'build');
  const srcPath = path.resolve(project, 'src');
  const appPublicPath = path.resolve(project, 'public');

  return {
    buildPath,
    srcPath,
    appPublicPath,
    entryPath: path.resolve(project, 'src/index.tsx'),
    publicBuildPath: path.join(buildPath, 'public')
  } as const;
}
