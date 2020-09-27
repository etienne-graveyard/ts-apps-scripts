import fse from 'fs-extra';
import path from 'path';
import * as z from 'zod';

const PackageSchema = z
  .object({
    name: z.string(),
    symlinks: z.record(z.string()).optional(),
    scripts: z.record(z.string()).optional(),
    dependencies: z.record(z.string()).optional()
  })
  .nonstrict();

export type PackageJson = z.infer<typeof PackageSchema>;

export async function readPackageJson(dir: string): Promise<PackageJson> {
  const file = path.join(dir, 'package.json');
  if (fse.existsSync(file)) {
    const pkg = await fse.readJSON(file);
    return PackageSchema.parse(pkg);
  }
  throw new Error(`Cannot find package.json in ${dir}`);
}
