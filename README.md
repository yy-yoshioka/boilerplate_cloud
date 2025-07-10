# Boilerplate Cloud

エンタープライズ対応のSaaS構築プラットフォーム

## 🚀 特徴

- **認証・認可**: NextAuth.js + 多要素認証対応
- **RBAC**: 柔軟な権限管理システム
- **課金**: Stripe統合
- **AIコード生成**: Live Coding Copilot
- **モノレポ**: Turborepo + Yarn Workspaces

## 📋 必要条件

- Node.js >= 20.0.0
- Yarn >= 1.22.0
- Docker & Docker Compose
- PostgreSQL (Dockerで提供)
- Redis (Dockerで提供)

## 🛠️ セットアップ

1. **リポジトリのクローン**

   ```bash
   git clone https://github.com/your-org/boilerplate-cloud.git
   cd boilerplate-cloud
   ```

2. **依存関係のインストール**

   ```bash
   yarn install
   ```

3. **環境変数の設定**

   ```bash
   cp .env.example .env
   # .envファイルを編集して必要な値を設定
   ```

4. **データベースの起動**

   ```bash
   yarn docker:dev
   ```

5. **開発サーバーの起動**
   ```bash
   yarn dev
   ```

## 📁 プロジェクト構造

```
boilerplate-cloud/
├── apps/
│   └── web/              # Next.js メインアプリケーション
├── packages/             # 共有パッケージ
├── docker-compose.yml    # Docker設定
├── turbo.json           # Turborepo設定
└── package.json         # ルートパッケージ
```

## 🔧 利用可能なコマンド

```bash
# 開発
yarn dev              # 開発サーバー起動
yarn build            # プロダクションビルド
yarn start            # プロダクションサーバー起動

# テスト・品質
yarn test             # テスト実行
yarn lint             # リント実行
yarn type-check       # 型チェック
yarn format           # コードフォーマット

# Docker
yarn docker:dev       # Docker環境起動
yarn docker:down      # Docker環境停止
yarn docker:logs      # ログ表示

# その他
yarn clean            # キャッシュクリア
```

## 🔀 Git ワークフロー

1. `main` - プロダクション環境
2. `develop` - 開発環境
3. `feature/*` - 機能開発
4. `hotfix/*` - 緊急修正

## 🤝 コントリビューション

1. Issueを作成
2. フィーチャーブランチを作成
3. コミット（Conventional Commitsに従う）
4. プルリクエストを作成

## 📄 ライセンス

MIT License
