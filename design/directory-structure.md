boilerplate-cloud/
├── apps/
│ ├── web/ # メインのNext.js Webアプリケーション
│ │ ├── app/ # Next.js App Router
│ │ │ ├── (auth)/ # 認証が必要なルートグループ
│ │ │ │ ├── dashboard/
│ │ │ │ │ ├── page.tsx
│ │ │ │ │ └── loading.tsx
│ │ │ │ ├── settings/
│ │ │ │ │ ├── profile/
│ │ │ │ │ │ └── page.tsx
│ │ │ │ │ ├── billing/
│ │ │ │ │ │ └── page.tsx
│ │ │ │ │ ├── team/
│ │ │ │ │ │ └── page.tsx
│ │ │ │ │ └── layout.tsx
│ │ │ │ ├── copilot/ # AI Copilot機能
│ │ │ │ │ ├── page.tsx
│ │ │ │ │ ├── wizard/
│ │ │ │ │ │ └── page.tsx
│ │ │ │ │ └── history/
│ │ │ │ │ └── page.tsx
│ │ │ │ └── layout.tsx
│ │ │ ├── (marketing)/ # 公開ページ（認証不要）
│ │ │ │ ├── page.tsx # ランディングページ
│ │ │ │ ├── pricing/
│ │ │ │ │ └── page.tsx
│ │ │ │ ├── about/
│ │ │ │ │ └── page.tsx
│ │ │ │ └── blog/
│ │ │ │ ├── page.tsx
│ │ │ │ └── [slug]/
│ │ │ │ └── page.tsx
│ │ │ ├── api/
│ │ │ │ ├── auth/
│ │ │ │ │ ├── [...nextauth]/
│ │ │ │ │ │ └── route.ts
│ │ │ │ │ └── webhook/
│ │ │ │ │ └── route.ts
│ │ │ │ ├── stripe/
│ │ │ │ │ ├── webhook/
│ │ │ │ │ │ └── route.ts
│ │ │ │ │ ├── checkout/
│ │ │ │ │ │ └── route.ts
│ │ │ │ │ └── portal/
│ │ │ │ │ └── route.ts
│ │ │ │ ├── copilot/
│ │ │ │ │ ├── generate/
│ │ │ │ │ │ └── route.ts
│ │ │ │ │ ├── validate/
│ │ │ │ │ │ └── route.ts
│ │ │ │ │ └── github/
│ │ │ │ │ └── pr/
│ │ │ │ │ └── route.ts
│ │ │ │ └── trpc/
│ │ │ │ └── [trpc]/
│ │ │ │ └── route.ts
│ │ │ ├── auth/
│ │ │ │ ├── signin/
│ │ │ │ │ └── page.tsx
│ │ │ │ ├── signup/
│ │ │ │ │ └── page.tsx
│ │ │ │ └── error/
│ │ │ │ └── page.tsx
│ │ │ ├── globals.css
│ │ │ ├── layout.tsx
│ │ │ ├── error.tsx
│ │ │ ├── not-found.tsx
│ │ │ └── favicon.ico
│ │ ├── components/
│ │ │ ├── ui/ # 基本UIコンポーネント（shadcn/ui）
│ │ │ │ ├── button.tsx
│ │ │ │ ├── card.tsx
│ │ │ │ ├── dialog.tsx
│ │ │ │ ├── dropdown-menu.tsx
│ │ │ │ ├── form.tsx
│ │ │ │ ├── input.tsx
│ │ │ │ ├── label.tsx
│ │ │ │ ├── select.tsx
│ │ │ │ ├── toast.tsx
│ │ │ │ └── ...
│ │ │ ├── auth/
│ │ │ │ ├── login-form.tsx
│ │ │ │ ├── signup-form.tsx
│ │ │ │ ├── user-menu.tsx
│ │ │ │ └── auth-guard.tsx
│ │ │ ├── billing/
│ │ │ │ ├── pricing-table.tsx
│ │ │ │ ├── subscription-manager.tsx
│ │ │ │ └── usage-meter.tsx
│ │ │ ├── copilot/
│ │ │ │ ├── wizard-container.tsx
│ │ │ │ ├── wizard-step.tsx
│ │ │ │ ├── code-preview.tsx
│ │ │ │ ├── diff-viewer.tsx
│ │ │ │ └── pr-status.tsx
│ │ │ ├── dashboard/
│ │ │ │ ├── stats-card.tsx
│ │ │ │ ├── activity-feed.tsx
│ │ │ │ └── quick-actions.tsx
│ │ │ └── shared/
│ │ │ ├── header.tsx
│ │ │ ├── footer.tsx
│ │ │ ├── sidebar.tsx
│ │ │ └── theme-toggle.tsx
│ │ ├── lib/
│ │ │ ├── auth/
│ │ │ │ ├── auth.config.ts
│ │ │ │ ├── auth.ts
│ │ │ │ └── middleware.ts
│ │ │ ├── db/
│ │ │ │ ├── client.ts
│ │ │ │ └── queries.ts
│ │ │ ├── stripe/
│ │ │ │ ├── client.ts
│ │ │ │ ├── plans.ts
│ │ │ │ └── webhooks.ts
│ │ │ ├── ai/
│ │ │ │ ├── openai.ts
│ │ │ │ ├── anthropic.ts
│ │ │ │ └── prompts.ts
│ │ │ ├── github/
│ │ │ │ ├── client.ts
│ │ │ │ └── pr-builder.ts
│ │ │ ├── email/
│ │ │ │ ├── client.ts
│ │ │ │ └── templates.ts
│ │ │ ├── utils/
│ │ │ │ ├── cn.ts
│ │ │ │ ├── format.ts
│ │ │ │ └── validation.ts
│ │ │ └── constants.ts
│ │ ├── hooks/
│ │ │ ├── use-auth.ts
│ │ │ ├── use-subscription.ts
│ │ │ ├── use-copilot.ts
│ │ │ ├── use-toast.ts
│ │ │ └── use-theme.ts
│ │ ├── server/
│ │ │ ├── routers/
│ │ │ │ ├── auth.ts
│ │ │ │ ├── user.ts
│ │ │ │ ├── billing.ts
│ │ │ │ └── copilot.ts
│ │ │ └── trpc.ts
│ │ ├── types/
│ │ │ ├── next-auth.d.ts
│ │ │ ├── global.d.ts
│ │ │ └── api.ts
│ │ ├── public/
│ │ │ ├── images/
│ │ │ │ ├── logo.svg
│ │ │ │ └── hero.png
│ │ │ ├── fonts/
│ │ │ └── robots.txt
│ │ ├── **tests**/
│ │ │ ├── unit/
│ │ │ │ ├── components/
│ │ │ │ └── lib/
│ │ │ ├── integration/
│ │ │ │ └── api/
│ │ │ └── e2e/
│ │ │ ├── auth.spec.ts
│ │ │ └── billing.spec.ts
│ │ ├── .env.local
│ │ ├── .eslintrc.js
│ │ ├── Dockerfile
│ │ ├── jest.config.mjs
│ │ ├── jest.setup.js
│ │ ├── middleware.ts
│ │ ├── next-env.d.ts
│ │ ├── next.config.js
│ │ ├── package.json
│ │ ├── postcss.config.mjs
│ │ ├── tailwind.config.js
│ │ └── tsconfig.json
│ │
│ ├── admin/ # 管理者ダッシュボード（Phase 2）
│ │ └── [将来実装]
│ │
│ ├── worker/ # バックグラウンドジョブワーカー
│ │ ├── src/
│ │ │ ├── jobs/
│ │ │ │ ├── code-generation.job.ts
│ │ │ │ ├── github-pr.job.ts
│ │ │ │ ├── email.job.ts
│ │ │ │ └── analytics.job.ts
│ │ │ ├── queues/
│ │ │ │ ├── copilot.queue.ts
│ │ │ │ ├── email.queue.ts
│ │ │ │ └── index.ts
│ │ │ ├── lib/
│ │ │ │ ├── redis.ts
│ │ │ │ └── logger.ts
│ │ │ └── index.ts
│ │ ├── Dockerfile
│ │ ├── package.json
│ │ └── tsconfig.json
│ │
│ └── docs/ # ドキュメントサイト（Phase 3）
│ └── [将来実装]
│
├── packages/ # 共有パッケージ
│ ├── @boilerplate-cloud/auth/ # 認証ロジック
│ │ ├── src/
│ │ │ ├── providers/
│ │ │ │ ├── credentials.ts
│ │ │ │ ├── github.ts
│ │ │ │ ├── google.ts
│ │ │ │ └── saml.ts
│ │ │ ├── rbac/
│ │ │ │ ├── roles.ts
│ │ │ │ ├── permissions.ts
│ │ │ │ └── guards.ts
│ │ │ └── index.ts
│ │ ├── package.json
│ │ └── tsconfig.json
│ │
│ ├── @boilerplate-cloud/db/ # Prismaクライアントと型
│ │ ├── prisma/
│ │ │ ├── schema.prisma
│ │ │ ├── migrations/
│ │ │ │ └── [migration files]
│ │ │ └── seed.ts
│ │ ├── src/
│ │ │ ├── client.ts
│ │ │ └── types.ts
│ │ ├── package.json
│ │ └── tsconfig.json
│ │
│ ├── @boilerplate-cloud/ui/ # 共通UIコンポーネント
│ │ ├── src/
│ │ │ ├── components/
│ │ │ ├── hooks/
│ │ │ └── utils/
│ │ ├── package.json
│ │ ├── tailwind.config.js
│ │ └── tsconfig.json
│ │
│ ├── @boilerplate-cloud/billing/ # Stripe統合
│ │ ├── src/
│ │ │ ├── client.ts
│ │ │ ├── products.ts
│ │ │ ├── subscriptions.ts
│ │ │ └── webhooks.ts
│ │ ├── package.json
│ │ └── tsconfig.json
│ │
│ ├── @boilerplate-cloud/ai/ # AI統合
│ │ ├── src/
│ │ │ ├── providers/
│ │ │ │ ├── openai.ts
│ │ │ │ └── anthropic.ts
│ │ │ ├── code-generation/
│ │ │ ├── validation/
│ │ │ └── index.ts
│ │ ├── package.json
│ │ └── tsconfig.json
│ │
│ ├── @boilerplate-cloud/config/ # 共通設定
│ │ ├── src/
│ │ │ ├── env.ts
│ │ │ └── constants.ts
│ │ ├── package.json
│ │ └── tsconfig.json
│ │
│ └── @boilerplate-cloud/types/ # 共有型定義
│ ├── src/
│ │ ├── api.ts
│ │ ├── models.ts
│ │ └── index.ts
│ ├── package.json
│ └── tsconfig.json
│
├── infra/ # インフラストラクチャ設定
│ ├── docker/
│ │ ├── development/
│ │ │ └── docker-compose.yml
│ │ └── production/
│ │ └── docker-compose.yml
│ ├── terraform/ # IaC（将来実装）
│ │ ├── environments/
│ │ │ ├── dev/
│ │ │ ├── staging/
│ │ │ └── production/
│ │ └── modules/
│ └── k8s/ # Kubernetes（将来実装）
│ ├── base/
│ └── overlays/
│
├── scripts/ # ユーティリティスクリプト
│ ├── setup.sh # 初期セットアップ
│ ├── dev.sh # 開発環境起動
│ ├── build.sh # ビルドスクリプト
│ ├── test.sh # テスト実行
│ └── deploy.sh # デプロイスクリプト
│
├── docs/ # プロジェクトドキュメント
│ ├── api/ # API仕様書
│ ├── architecture/ # アーキテクチャ設計書
│ ├── deployment/ # デプロイメント手順
│ └── development.md # 開発ガイド
│
├── .github/ # GitHub設定
│ ├── workflows/
│ │ ├── ci.yml # CI/CDパイプライン
│ │ ├── codeql.yml # セキュリティスキャン
│ │ └── release.yml # リリースワークフロー
│ ├── dependabot.yml # 依存関係の自動更新
│ ├── CODEOWNERS # コードオーナー設定
│ └── pull_request_template.md # PRテンプレート
│
├── .husky/ # Git hooks
│ ├── pre-commit # コミット前チェック
│ └── pre-push # プッシュ前チェック
│
├── .vscode/ # VS Code設定
│ ├── settings.json
│ ├── extensions.json
│ └── launch.json
│
├── .dockerignore # Docker除外設定
├── .env.example # 環境変数テンプレート
├── .eslintrc.js # ESLint設定
├── .gitignore # Git除外設定
├── .nvmrc # Node.jsバージョン指定
├── .prettierignore # Prettier除外設定
├── .prettierrc.json # Prettier設定
├── docker-compose.yml # 本番用Docker Compose
├── docker-compose.dev.yml # 開発用Docker Compose
├── jest.config.base.js # Jest共通設定
├── LICENSE # ライセンスファイル
├── package.json # ルートパッケージ設定
├── README.md # プロジェクト説明
├── tsconfig.base.json # TypeScript共通設定
├── turbo.json # Turborepo設定
└── yarn.lock # 依存関係ロックファイル
