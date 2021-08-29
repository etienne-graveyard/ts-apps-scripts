import path from 'path';

export interface BabelConfig {
  presets: Array<string | [string] | [string, {}]>;
  plugins: Array<string | [string] | [string, {}]>;
}

export function createBabelConfig(): BabelConfig {
  return {
    presets: [
      [
        require.resolve('@babel/preset-env'),
        {
          targets: { node: 'current' },
          // Webpack takes care of modules, so we don't have to.
          modules: false
        }
      ],
      [require.resolve('@babel/preset-typescript')]
    ],
    plugins: [
      // class { handleThing = () => { } }
      require.resolve('@babel/plugin-proposal-class-properties'),

      // The following two plugins use Object.assign directly, instead of Babel's
      // extends helper. Note that this assumes `Object.assign` is available.
      // { ...todo, completed: true }
      [
        require.resolve('@babel/plugin-proposal-object-rest-spread'),
        {
          useBuiltIns: true
        }
      ],

      [
        require.resolve('@babel/plugin-transform-regenerator'),
        {
          // Async functions are converted to generators by babel-preset-env (which
          // is based on babel-preset-latest)
          async: false
        }
      ],

      [
        require.resolve('@babel/plugin-transform-runtime'),
        {
          helpers: false,
          regenerator: true,
          // Resolve the Babel runtime relative to the config.
          absoluteRuntime: path.dirname(require.resolve('@babel/runtime/package'))
        }
      ]
    ]
  };
}
