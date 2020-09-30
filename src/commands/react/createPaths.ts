import path from 'path';

export function createPaths(root: string, project: string) {
  const buildPath = path.resolve(project, 'build');
  const srcPath = path.resolve(project, 'src');

  return {
    buildPath,
    srcPath,
    entryPath: path.resolve(project, 'src/index.ts'),
    publicBuildPath: path.join(buildPath, 'public')
  } as const;
}
