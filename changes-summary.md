# Boilerplate Cloud 共通ファイル追加差分

## ディレクトリ構成

```
boilerplate_cloud/
├── .eslint.functional.js         # [新規] 関数型プログラミング用ESLint設定
├── .hygen.js                     # [新規] Hygenコード生成ツール設定
├── CODEOWNERS                    # [新規] GitHubコード所有者設定
├── .husky/
│   └── pre-commit                # [更新] ファイル保護とTODOチェック追加
├── .github/
│   └── workflows/
│       └── check-scaffold.yml    # [新規] Scaffold検証CI/CD
├── apps/
│   └── api/
│       └── lib/
│           └── bootstrap.ts      # [新規] API初期化（DI設定）
├── docs/
│   └── CONTRIBUTING.md           # [新規] コントリビューションガイド
├── packages/
│   └── shared-types/
│       └── src/
│           ├── errors.ts         # [新規] 共通エラー定義（修正済み）
│           ├── validation.ts     # [新規] 共通バリデーション定数
│           └── logger-schema.ts  # [新規] ロガー用型定義
├── scripts/
│   └── verify-scaffold.ts        # [新規] TODO検証スクリプト（修正済み）
└── package.json                  # [更新] 依存関係追加
```

## 新規ファイル内容

### 1. .eslint.functional.js

```javascript
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
```

### 2. .hygen.js

```javascript
// Hygen configuration – 100% 関数ベース
/** @type {import('hygen').Config} */
module.exports = {
  helpers: {
    pascal: (str) => str.replace(/(^\w|-\w)/g, (c) => c.replace('-', '').toUpperCase()),
    camel: (str) => str.replace(/-./g, (c) => c[1].toUpperCase()),
  },
  templates: `${__dirname}/_templates`,
};
```

### 3. scripts/verify-scaffold.ts（修正済み）

```typescript
#!/usr/bin/env ts-node

import globby from 'globby'; // default importに修正
import { readFile } from 'fs/promises';

const main = async (): Promise<void> => {
  const files = await globby([
    'apps/api/lib/**/*.{ts,tsx}',
    '!**/*.{spec,test}.ts', // test.tsファイルも除外するよう修正
  ]);

  const offenders: string[] = [];

  for (const file of files) {
    const content = await readFile(file, 'utf8');
    if (content.includes('TODO:')) offenders.push(file);
  }

  if (offenders.length > 0) {
    console.error('⛔  残 TODO が存在します:');
    offenders.forEach((f) => console.error(`   • ${f}`));
    process.exit(1);
  }

  console.log('✅  Scaffold drift なし (TODO 0)');
};

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
```

### 4. docs/CONTRIBUTING.md

```markdown
# Contributing Guide (Boilerplate Cloud)

1. **2 コミットルール**
   1. `yarn gen:api <Model>` → `chore(scaffold): <model>` をコミット
   2. 実装・テストを緑にして `feat(api): <model>` を別コミットに。

2. **禁止事項**
   - `packages/shared-types/src/errors.ts` を直接編集しない
   - `class` / `extends` / `interface` の宣言は禁止
   - `TODO:` を残したまま PR を出さない

3. **CLI**
   - 新規エラーは `yarn gen:error CODE "Human readable message"`
   - スキーマ同期は `yarn gen:schema`
```

### 5. .github/workflows/check-scaffold.yml

```yaml
name: Scaffold Drift Check

on:
  pull_request:
    paths-ignore:
      - 'docs/**'
      - '**/*.md'

jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '18', cache: pnpm }
      - run: pnpm install --frozen-lockfile
      - run: pnpm exec eslint . --max-warnings=0
      - run: pnpm exec vitest run --run
      - run: pnpm ts-node scripts/verify-scaffold.ts
```

### 6. packages/shared-types/src/errors.ts（修正済み）

```typescript
/* ErrorCode & Message – 編集不可。yarn gen:error を使うこと */
export const ERROR = {
  // 認証
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  // バリデーション
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  CONFLICT: 'CONFLICT',
  NOT_FOUND: 'NOT_FOUND',
  // システム
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const;

type ErrorKey = keyof typeof ERROR;

export const ErrorMessages: Record<ErrorKey, string> = {
  UNAUTHORIZED: '認証が必要です',
  FORBIDDEN: '権限がありません',
  INVALID_CREDENTIALS: 'メールアドレスまたはパスワードが正しくありません',
  VALIDATION_ERROR: '入力値が不正です',
  CONFLICT: 'リソースが競合しています',
  NOT_FOUND: 'リソースが見つかりません',
  INTERNAL_ERROR: 'システムエラーが発生しました',
} as const;

export type AppErrorCode = (typeof ERROR)[keyof typeof ERROR]; // 型定義を修正
```

### 7. packages/shared-types/src/validation.ts

```typescript
/** 共通バリデーション定数 – 編集は lead のみ */
export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/;

export const SLUG_REGEX = /^[a-z0-9-]{3,50}$/;

export const MAX_EMAIL_LENGTH = 255;
export const MAX_NAME_LENGTH = 100;
```

### 8. packages/shared-types/src/logger-schema.ts

```typescript
/** Winston child‑logger が持つ共通キー定義 */
export interface LogContext {
  requestId: string;
  userId?: string;
}
```

### 9. apps/api/lib/bootstrap.ts

```typescript
import { PrismaClient } from '@prisma/client';
import pino from 'pino';
import type { LogContext } from '@shared-types/logger-schema';

const prisma = new PrismaClient();

/** 関数ベース DI – class 禁止 */
export const createContext = (ctx: LogContext) => ({
  db: prisma,
  logger: pino().child(ctx),
});
```

### 10. CODEOWNERS

```
# protect shared types
/packages/shared-types/** @core-leads
/scripts/verify-scaffold.ts @core-leads
```

## package.json 変更差分

### 追加したdevDependencies

```json
"eslint-plugin-functional": "^6.0.0",
"hygen": "^6.2.11",
"globby": "^14.0.0",
"ts-node": "^10.9.2"
```

### 追加したdependencies

```json
"pino": "^8.17.2"
```

### 11. .husky/pre-commit（更新）

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# ==== Write-protect shared errors ====
CHANGED=$(git diff --cached --name-only -- packages/shared-types/src/errors.ts packages/shared-types/src/validation.ts)
if [ -n "$CHANGED" ]; then
  echo "⛔ errors.ts / validation.ts は直接編集禁止。yarn gen:error を使って下さい。" >&2
  exit 1
fi

# ==== TODO検査 ====
git diff --cached | grep -q "TODO:" && echo "❌ TODOが残っています" && exit 1

echo "🔍 Running pre-commit checks..."

# lint-stagedを実行（変更されたファイルのみチェック）
npx lint-staged

# lint-stagedが失敗した場合
if [ $? -ne 0 ]; then
  echo "❌ Lint-staged failed. Please fix the issues before committing."
  exit 1
fi

echo "✅ Pre-commit checks passed!"
```

## package.json 変更差分

### 追加したdevDependencies

```json
"eslint-plugin-functional": "^6.0.0",
"hygen": "^6.2.11",
"globby": "^14.0.0",
"ts-node": "^10.9.2"
```

### 追加したdependencies

```json
"pino": "^8.17.2"
```

## 実行権限設定

- `scripts/verify-scaffold.ts` に実行権限（+x）を付与済み

## フィードバック対応による修正内容

### 1. verify-scaffold.tsの修正

- globパターンを `'!**/*.spec.ts'` から `'!**/*.{spec,test}.ts'` に変更
- import文を `import globby from 'globby';` に修正（default import）

### 2. errors.tsの型定義修正

- `AppErrorCode` の型定義を `(typeof ERROR)[keyof typeof ERROR]` に修正

### 3. Huskyプリコミットフックの強化

- errors.ts と validation.ts の直接編集を防ぐチェックを追加
- TODO残存チェックを追加
- 既存のlint-stagedチェックは維持
