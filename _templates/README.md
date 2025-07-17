# API Generator

## Quick Start

```bash
# 対話型
yarn gen:api

# 非対話型（推奨）
yarn gen:api User
yarn gen:api Post --no-soft-delete
yarn gen:api Product --fields=name,sku,price
```

## 生成ファイル

- `routers/<model>.router.ts` - tRPCルーター
- `services/<model>.service.ts` - ビジネスロジック  
- `schemas/<model>.ts` - Zodスキーマ
- `__tests__/<model>.spec.ts` - テスト

## 生成後の手順

1. Prismaスキーマ更新
2. `yarn prisma generate`
3. schema.tsを実際のフィールドに修正
4. `yarn test <model>`
5. `yarn lint:fix`