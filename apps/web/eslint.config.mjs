// eslint.config.mjs – Flat config with Next.js + TypeScript strict
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';
import tseslint from 'typescript-eslint';
import eslintPluginImport from 'eslint-plugin-import';
import eslintUnusedImports from 'eslint-plugin-unused-imports';

const __dirname = dirname(fileURLToPath(import.meta.url));
const compat = new FlatCompat({ baseDirectory: __dirname });

const eslintConfig = [
  /* 無視するパス */
  { ignores: ['.next/**', 'node_modules/**'] },

  /* Next.js 推奨ルール（core-web-vitals） */
  ...compat.extends('next/core-web-vitals'),

  /* TypeScript + 独自ルールは TS ファイルのみに適用 */
  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      import: eslintPluginImport,
      'unused-imports': eslintUnusedImports,
    },
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: ['./tsconfig.json'],
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    rules: {
      /* typescript-eslint strict 推奨 */
      ...tseslint.configs.strictTypeChecked[1].rules,

      // 追加カスタムルール
      'no-console': 'error',
      'no-process-env': 'error',
      'spaced-comment': ['error', 'always', { markers: ['/'] }],

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

      'unused-imports/no-unused-imports': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },

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
];

export default eslintConfig;
