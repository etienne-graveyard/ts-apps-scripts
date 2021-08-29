import { resolveProject } from '../utils/resolveProject';
import { createWebpackConfig } from './createWebpackConfig';
import { createCompiler, prepareUrls } from 'react-dev-utils/WebpackDevServerUtils';
import { createWebpackDevServerConfig } from './createWebpackDevServerConfig';
import { createPaths } from './createPaths';
import WebpackDevServer from 'webpack-dev-server';
import clearConsole from 'react-dev-utils/clearConsole';
import chalk from 'chalk';
import webpack from 'webpack';
import openBrowser from 'react-dev-utils/openBrowser';

export interface StartReactAppConfig {
  appName: string;
  port?: number;
  project?: string;
  publicUrlOrPath?: string;
}

export async function StartReactApp(config: StartReactAppConfig) {
  const { project, root } = await resolveProject(config.project);
  const { publicUrlOrPath = '/', port = 3000 } = config;

  const isInteractive = process.stdout.isTTY;

  const env = process.env;

  env.BABEL_ENV = 'development';
  env.NODE_ENV = 'development';

  const { buildPath, entryPath, srcPath, appPublicPath } = createPaths(root, project);

  const webpackConfig = createWebpackConfig({
    mode: 'development',
    buildPath,
    entryPath,
    srcPath,
    publicUrlOrPath
  });

  const host = '0.0.0.0';

  const urls = prepareUrls('http', host, port);

  const compiler = createCompiler({
    appName: config.appName,
    config: webpackConfig,
    devSocket: {
      warnings: (warnings: any) => {
        return devServer.sockWrite(devServer.sockets, 'warnings', warnings);
      },
      errors: (errors: any) => {
        return devServer.sockWrite(devServer.sockets, 'errors', errors);
      }
    } as any,
    urls,
    useYarn: true,
    useTypeScript: true,
    // tscCompileOnError: false,
    webpack
  });

  const serverConfig = createWebpackDevServerConfig({
    appPublicPath,
    publicUrlOrPath,
    host
  });
  const devServer = new WebpackDevServer(compiler, serverConfig);

  // Launch WebpackDevServer.
  devServer.listen(port, host, err => {
    if (err) {
      return console.log(err);
    }
    if (isInteractive) {
      clearConsole();
    }

    // We used to support resolving modules according to `NODE_PATH`.
    // This now has been deprecated in favor of jsconfig/tsconfig.json
    // This lets you use absolute paths in imports inside large monorepos:
    if (process.env.NODE_PATH) {
      console.log(
        chalk.yellow(
          'Setting NODE_PATH to resolve modules absolutely has been deprecated in favor of setting baseUrl in jsconfig.json (or tsconfig.json if you are using TypeScript) and will be removed in a future major release of create-react-app.'
        )
      );
      console.log();
    }

    console.log(chalk.cyan('Starting the development server...\n'));
    openBrowser(urls.localUrlForBrowser);
  });

  ['SIGINT', 'SIGTERM'].forEach(sig => {
    process.on(sig, () => {
      devServer.close();
      process.exit();
    });
  });

  if (isInteractive || process.env.CI !== 'true') {
    // Gracefully exit when stdin ends
    process.stdin.on('end', () => {
      devServer.close();
      process.exit();
    });
    process.stdin.resume();
  }
}
