/** @type {import("eslint").Linter.Config} */
const config = {
    env: {
        browser: true,
        node: true,
        jest: true,
      },
      extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/eslint-recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:o1js/recommended',
      ],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        ecmaVersion: 'latest',
      },
      plugins: ['@typescript-eslint', 'o1js'],
      rules: {
        'no-constant-condition': 'off',
        'prefer-const': 'off',
      },
  };
  
  module.exports = config;
  