export type Command = 'start' | 'build';

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
