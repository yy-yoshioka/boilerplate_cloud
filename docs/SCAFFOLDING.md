# スカフォールド生成ガイド

## 概要
Hygen v1を使用した高速・型安全なAPI生成システム

## Quick Start

```bash
# 対話モードで生成
yarn hygen api new

# フラグ指定で生成
yarn hygen api new --model User --access protected --withSoftDelete true --searchableFields name,email
```

## フラグ一覧

| フラグ | 説明 | 値 | 必須 |
|--------|------|-----|------|
| `--model` | モデル名（PascalCase） | `User`, `Project` など | ✅ |
| `--access` | アクセスレベル | `public`, `protected`, `admin` | ✅ |
| `--withSoftDelete` | 論理削除の有無 | `true`, `false` | ✅ |
| `--searchableFields` | 検索可能フィールド | `name,email` など（カンマ区切り） | ❌ |

## 生成されるファイル

- `apps/api/lib/routers/{model}.router.ts` - tRPCルーター
- `apps/api/lib/schemas/{model}.ts` - Zodスキーマ
- `apps/api/lib/services/{model}.service.ts` - ビジネスロジック
- `apps/api/__tests__/{model}.spec.ts` - テストファイル

## 検証

```bash
# ローカルでFail-fast検証（10秒以内）
yarn test:hygen

# 期待される出力
🎉 All checks passed!
⏱  Total time: 10s

Summary:
  ✅ Generated 12 files (3 models × 4 files)
  ✅ TypeScript: 0 errors
  ✅ ESLint: 0 errors
  ✅ Tests: All passed
  ✅ No HTML entities
  ⏱  Completed in 10s
```

## 生成後の手順

1. Prismaスキーマに対応するモデルを追加
2. `yarn prisma migrate dev` でマイグレーション実行
3. 必要に応じてサービスロジックをカスタマイズ