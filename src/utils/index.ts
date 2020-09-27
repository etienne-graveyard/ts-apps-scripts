import fse from 'fs-extra';

export function once<Fn extends Function>(fn: Fn): Fn {
  let called = false;
  let result: any;
  return ((...args: Array<any>) => {
    if (!called) {
      called = true;
      result = fn(...args);
    }
    return result;
  }) as any;
}

export async function isDirectory(path: string) {
  try {
    const projectStat = await fse.stat(path);
    return projectStat.isDirectory();
  } catch (error) {
    return false;
  }
}
