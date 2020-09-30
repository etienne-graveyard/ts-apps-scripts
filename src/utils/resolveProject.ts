import path from 'path';
import { isDirectory } from './index';

export async function resolveProject(project?: string) {
  const root = process.cwd();
  const projectResolved = path.resolve(root, project ?? root);
  // make sure the folder exists
  const projectIsDir = await isDirectory(projectResolved);
  if (!projectIsDir) {
    throw new Error(`Project is not a directory (${projectResolved})`);
  }
  return {
    root,
    project: projectResolved
  };
}
