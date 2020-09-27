import path from 'path';
import { isDirectory } from './utils';

import { nodeBuild } from './commands/node/build';
import { nodeStart } from './commands/node/start';
import { reactBuild } from './commands/react/build';
import { reactStart } from './commands/react/start';

export type AppType = 'node' | 'react';

export type Command = 'start' | 'build';

export interface Config {
  type: AppType;
  project: string;
  command: Command;
}

const commands = {
  node: {
    start: nodeStart,
    build: nodeBuild
  },
  react: {
    start: reactStart,
    build: reactBuild
  }
} as const;

export async function TsAppsScripts(config: Config) {
  const { type, command } = config;
  const root = process.cwd();
  const project = path.resolve(root, config.project ?? root);
  // make sure the folder exists
  const projectIsDir = await isDirectory(project);
  if (!projectIsDir) {
    throw new Error(`Project is not a directory (${project})`);
  }
  const runner = commands[type][command];
  await runner(root, project);
}

export function commandFromArgv(argv: Array<string>): Command {
  const last = argv[argv.length - 1];
  if (last === 'start') {
    return 'start';
  }
  if (last === 'build') {
    return 'build';
  }
  throw new Error(`Cannot extract command from argv`);
}
