/* eslint-env node */
module.exports = {
  root: true,
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:functional/recommended',
    // 追加ポリシー：副作用禁止・class禁止
    'plugin:functional/external-recommended',
  ],
  plugins: ['functional'],
  parser: '@typescript-eslint/parser',
  parserOptions: { project: './tsconfig.base.json' },
  rules: {
    // 例外的に許したいルールはここで上書き
    'functional/no-return-void': 'off',
    'functional/immutable-data': ['error', { ignoreAccessorPattern: '^module\\.exports' }],
  },
  ignorePatterns: ['*.js', 'node_modules/', 'dist/', 'build/', '.next/'],
};
