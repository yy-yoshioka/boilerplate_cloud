// eslint.config.mjs
import tseslint from 'typescript-eslint'
import eslintPluginImport from 'eslint-plugin-import'
import eslintUnusedImports from 'eslint-plugin-unused-imports'

const config = [
  tseslint.configs.strictTypeChecked, // typescript-eslint 推奨 + strict
  {
    plugins: {
      import: eslintPluginImport,
      'unused-imports': eslintUnusedImports,
    },
    rules: {
      /* コーディング規約 */
      'no-console': 'error',
      'no-process-env': 'error',
      'spaced-comment': ['error', 'always', { markers: ['/'] }],

      /* import 整理 & 制限 */
      'import/order': [
        'error',
        {
          groups: [['builtin', 'external'], ['internal'], ['parent', 'sibling', 'index']],
          alphabetize: { order: 'asc' },
        },
      ],
      'no-restricted-imports': [
        'error',
        {
          paths: [{ name: 'zod', message: 'Use generated schemas or packages/db/** only.' }],
        },
      ],

      /* 未使用コード */
      'unused-imports/no-unused-imports': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
    settings: {
      /* エイリアス解決 */
      'import/resolver': {
        typescript: {
          project: ['tsconfig.base.json'],
        },
      },
    },
    overrides: [
      /* DB & server 層は Zod import 許可 */
      {
        files: ['packages/db/**', 'apps/**/server/**'],
        rules: { 'no-restricted-imports': 'off' },
      },
      /* テストでは console OK */
      {
        files: ['**/*.test.ts?(x)'],
        rules: { 'no-console': 'off' },
      },
    ],
  },
]

export default config;
