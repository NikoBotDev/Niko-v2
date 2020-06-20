module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          node: 'current',
        },
      },
    ],
    '@babel/preset-typescript',
  ],
  plugins: [
    ['@babel/plugin-proposal-decorators', { legacy: true }],
    'transform-class-properties',
    [
      'module-resolver',
      {
        alias: {
          '~': './src',
          '@entities': './src/database/entities',
        },
      },
    ],
  ],
  ignore: ['src/@types'],
};
