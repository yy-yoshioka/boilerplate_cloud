# Hygen Templates for Boilerplate Cloud

## 🚀 Quick Start

### API生成（対話型）

```bash
yarn gen:api
```

### API生成（非対話型 - 推奨）

```bash
# 基本パターン
yarn gen:api <ModelName>

# アクセスレベル指定
yarn gen:api User --access=public
yarn gen:api Project --access=protected
yarn gen:api AdminLog --access=admin

# ソフトデリート無効
yarn gen:api Payment --no-soft-delete

# 検索可能フィールド指定
yarn gen:api Product --fields=name,sku,description

# 組み合わせ例
yarn gen:api BlogPost --access=public --fields=title,content,tags
yarn gen:api Invoice --access=protected --no-soft-delete --fields=invoiceNumber,customerName
```

## 📁 生成されるファイル

- `apps/api/lib/routers/<model>.router.ts` - tRPCルーター
- `apps/api/lib/services/<model>.service.ts` - ビジネスロジック
- `apps/api/lib/schemas/<model>.ts` - Zodスキーマ
- `apps/api/__tests__/<model>.spec.ts` - Vitestテスト

## 🧪 Smoke Test - 6パターン検証

テンプレートの健全性を確認するため、6つのパターンで自動生成・検証を実行：

```bash
yarn hygen-smoke
```

### テストパターン

| Model | Access Level | Soft Delete | 説明                   |
| ----- | ------------ | ----------- | ---------------------- |
| Foo   | public       | ❌          | 公開API・ハード削除    |
| Bar   | public       | ✅          | 公開API・ソフト削除    |
| Baz   | protected    | ❌          | 認証必須・ハード削除   |
| Qux   | protected    | ✅          | 認証必須・ソフト削除   |
| Quux  | admin        | ❌          | 管理者限定・ハード削除 |
| Quuz  | admin        | ✅          | 管理者限定・ソフト削除 |

### 検証内容

1. **TypeScript**: 生成ファイルの型チェック
2. **ESLint**: コーディング規約準拠
3. **Vitest**: 単体テスト実行

結果は `hygen-validation-REPORT.md` に出力されます。

## 📝 生成後の手順

1. **Prismaスキーマの更新**

   ```prisma
   model YourModel {
     id          String   @id @default(cuid())
     name        String
     slug        String?  @unique
     createdAt   DateTime @default(now())
     updatedAt   DateTime @updatedAt
     deletedAt   DateTime? // ソフトデリート有効時のみ
   }
   ```

2. **Prismaクライアントの再生成**

   ```bash
   yarn prisma generate
   ```

3. **生成されたschema.tsを実際のモデルに合わせて修正**

4. **テストの実行**
   ```bash
   yarn test <model>
   ```

## 🔧 トラブルシューティング

### import path エラー

- `apps/api/lib/trpc/server.ts` の実際のパスを確認
- `hygen.js` の `config.trpcPath` を調整

### Prisma型エラー

- `yarn prisma generate` を実行
- モデル名の大文字小文字を確認

### ESLintエラー

- `yarn lint:fix` で自動修正
- 生成後に手動で import 順序を調整

## 🛠️ カスタマイズ

テンプレートは `_templates/api/new/` にあります。
プロジェクトの要件に応じて自由にカスタマイズしてください。

### よく使うカスタマイズ

- デフォルトのアクセスレベル変更: `prompt.js` の `access` デフォルト値
- 検索フィールドのデフォルト: `prompt.js` の `searchableFields` デフォルト値
- 生成パスの変更: 各テンプレートの `to:` ディレクティブ
