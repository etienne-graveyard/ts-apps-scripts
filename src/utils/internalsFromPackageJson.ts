import { PackageJson } from './readPackageJson';

export function internalsFromPackageJson(pkg: PackageJson) {
  const symlinksObject = pkg.symlinks || {};
  const internals = Object.keys(symlinksObject);
  return internals;
}
