module.exports = {
  env: {
    es2021: true,
    node: true,
  },
  extends: ['airbnb', 'plugin:prettier/recommended'],
  overrides: [
    {
      env: {
        node: true,
      },
      files: ['.eslintrc.{js,cjs}'],
      parserOptions: {
        sourceType: 'script',
      },
    },
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    'prettier/prettier': 'off',
    'react/jsx-filename-extension': 'off',
    'import/prefer-default-export': 'off',
    'no-use-before-define': 'off',
    'react/prop-types': 'off',
    'react/destructuring-assignment': 'off',
  },
};
