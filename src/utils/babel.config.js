module.exports = {
  sourceType: 'unambiguous',
  presets: ['@babel/preset-env', '@babel/preset-typescript'],
  plugins: [
    [
      '@babel/plugin-transform-runtime',
      {
        corejs: 3,
      },
    ],
    '@babel/plugin-proposal-class-properties',
    '@babel/plugin-proposal-object-rest-spread',
  ],
};
