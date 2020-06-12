module.exports = {
  env: {
    es2020: true,
    node: true,
  },
  extends: [
    'airbnb-base',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
    'prettier/@typescript-eslint',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 11,
    sourceType: 'module',
    project: './tsconfig.json',
  },
  plugins: ['@typescript-eslint', 'prettier'],
  rules: {
    'import/extensions': [
      'error',
      'ignorePackages',
      {
        ts: 'never',
      },
    ],
    'import/prefer-default-export': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/ban-ts-comment': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
    camelcase: 'off',
    'class-methods-use-this': 'off',
    'no-param-reassign': 'off',
    'no-eval': 'off',
    'max-classes-per-file': ['error', 2],
    'no-unused-vars': 'off',
    'no-console': 'off',
  },
  settings: {
    'import/resolver': {
      typescript: {},
    },
  },
};
