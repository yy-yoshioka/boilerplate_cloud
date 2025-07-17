# Prisma → Zod 自動変換システム構築 差分詳細

## 概要

Prismaモデルから自動的にZodスキーマを生成し、型安全なAPI開発環境を構築するための変更。

## 変更ファイル一覧

### 1. 設定ファイルの変更

#### **prisma/schema.prisma**

```diff
generator client {
  provider = "prisma-client-js"
-  output   = "../generated/prisma"
}

+generator zod {
+  provider                         = "prisma-zod-generator"
+  output                           = "../packages/zod-schemas/generated"
+  relationModel                    = true
+  modelCase                        = "PascalCase"
+  modelSuffix                      = "Schema"
+  createPartialTypes               = true
+  addInputTypeValidation           = false
+  createOptionalDefaultValuesTypes = true
+  createRelationValuesTypes        = true
+  prismaJsonNullability            = true
+}
```

- Prisma Clientの出力先をデフォルト（node_modules/@prisma/client）に戻す
- prisma-zod-generatorの設定を追加
- 追加オプション：PATCH/PARTIAL型の自動生成、リレーション型、JSON null対応

#### **package.json**

```diff
  "scripts": {
    // ... 既存のスクリプト ...
+    "postinstall": "prisma generate",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev",
    "prisma:studio": "prisma studio"
  },
  "devDependencies": {
    // ... 既存のdevDependencies ...
+    "prisma": "^6.11.1",
+    "prisma-zod-generator": "^0.8.13"
  },
  "dependencies": {
    "@prisma/client": "^6.11.1",
-    "prisma": "^6.11.1",
-    "prisma-zod-generator": "^0.8.13",
    "zod": "^3.23.8"
  }
```

- postinstallスクリプト追加（CI/CDでの自動生成対応）
- prismaとprisma-zod-generatorをdevDependenciesに移動（実行時不要）

#### **tsconfig.base.json**

```diff
  "compilerOptions": {
    // ... 既存の設定 ...
+    "paths": {
+      "@zod-schemas/*": ["./packages/zod-schemas/generated/*"],
+      "@shared-types/*": ["./packages/shared-types/src/*"]
+    }
  }
```

- パスエイリアスをルートで統一管理

#### **apps/web/tsconfig.json**

```diff
  "paths": {
    "@/*": ["./app/*"],
    "@/components/*": ["./components/*"],
    "@/lib/*": ["./lib/*"],
    "@/hooks/*": ["./hooks/*"]
-    "@zod-schemas/*": ["../../packages/zod-schemas/generated/*"],
-    "@shared-types/*": ["../../packages/shared-types/src/*"]
  }
```

- 重複パスエイリアスを削除（ルートのtsconfig.base.jsonから継承）

#### **.gitignore**

```diff
-/generated/prisma
+/generated/
 /packages/zod-schemas/generated/
```

- 旧生成ディレクトリを完全に無視

#### **.eslintignore** (新規作成)

```
packages/zod-schemas/generated/**
```

- 自動生成ファイルをESLintから除外

### 2. 新規作成されたパッケージ

#### **packages/zod-schemas/** (自動生成用)

```
packages/zod-schemas/
├── package.json
├── tsconfig.json
└── generated/              # gitignored
    └── schemas/
        ├── index.ts
        ├── enums/          # AccountStatus, PlatformRole等
        ├── objects/        # 入力/出力型定義
        └── ...             # CRUD操作用スキーマ
```

**package.json:**

```json
{
  "name": "@boilerplate/zod-schemas",
  "version": "1.0.0",
  "private": true,
  "main": "./generated/schemas/index.js",
  "types": "./generated/schemas/index.d.ts",
  "exports": {
    ".": "./generated/schemas/index.js",
    "./*": "./generated/*"
  },
  "scripts": {
    "clean": "rm -rf generated"
  },
  "dependencies": {
    "zod": "^3.23.8"
  },
  "devDependencies": {
    "@types/node": "^18.19.31",
    "typescript": "^5.4.5"
  }
}
```

**tsconfig.json:**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "baseUrl": ".",
    "declaration": true,
    "declarationMap": true,
    "outDir": "./generated"
  },
  "include": ["generated/**/*"],
  "exclude": ["node_modules"]
}
```

#### **packages/shared-types/** (共有型定義)

```
packages/shared-types/
├── package.json
├── tsconfig.json
└── src/
    ├── index.ts
    └── entities/
        ├── index.ts
        └── account.ts     # PublicAccountSchema等
```

**package.json:**

```json
{
  "name": "@boilerplate/shared-types",
  "version": "1.0.0",
  "private": true,
  "main": "./src/index.js",
  "types": "./src/index.d.ts",
  "scripts": {
    "build": "tsc",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "zod": "^3.23.8"
  },
  "devDependencies": {
    "@types/node": "^18.19.31",
    "typescript": "^5.4.5"
  }
}
```

**tsconfig.json:**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@zod-schemas/*": ["../zod-schemas/generated/*"],
      "@shared-types/*": ["./src/*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
```

**src/entities/account.ts:**

```typescript
import { z } from 'zod';
import { PlatformRoleSchema } from '@zod-schemas/enums/PlatformRole.schema';

// Public Account Schema - センシティブな情報を除外
export const PublicAccountSchema = z.object({
  id: z.string().cuid(),
  email: z.string().email(),
  name: z.string().nullable(),
  avatarUrl: z.string().url().nullable(),
  role: PlatformRoleSchema,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  lastLoginAt: z.string().datetime().nullable(),
});

// 型エクスポート
export type PublicAccount = z.infer<typeof PublicAccountSchema>;

// Extended Account Schema with additional validation
export const ExtendedPublicAccountSchema = PublicAccountSchema.extend({
  // 追加のバリデーションルール
  email: z.string().email().toLowerCase().trim(),
  name: z.string().min(1).max(100).nullable(),
});

export type ExtendedPublicAccount = z.infer<typeof ExtendedPublicAccountSchema>;
```

### 3. APIスキーマ (apps/api/lib/schemas/)

#### **apps/api/lib/schemas/api/auth/**

```
auth/
├── index.ts       # 全エクスポート
├── input.ts       # API入力スキーマ
└── output.ts      # API出力スキーマ
```

**input.ts:**

```typescript
import { z } from 'zod';

// パスワードバリデーションルール
const passwordSchema = z
  .string()
  .min(8, 'パスワードは8文字以上で入力してください')
  .regex(/[a-zA-Z]/, 'パスワードには英字を含めてください')
  .regex(/[0-9]/, 'パスワードには数字を含めてください')
  .regex(/[^a-zA-Z0-9]/, 'パスワードには特殊文字を含めることを推奨します')
  .optional()
  .or(
    z
      .string()
      .min(8, 'パスワードは8文字以上で入力してください')
      .regex(/[a-zA-Z]/, 'パスワードには英字を含めてください')
      .regex(/[0-9]/, 'パスワードには数字を含めてください'),
  );

// メールバリデーションルール
const emailSchema = z.string().email('有効なメールアドレスを入力してください').toLowerCase().trim();

// 登録入力スキーマ
export const RegisterInputSchema = z.object({
  email: emailSchema,
  name: z
    .string()
    .min(1, '名前を入力してください')
    .max(100, '名前は100文字以内で入力してください')
    .trim(),
  password: z
    .string()
    .min(8, 'パスワードは8文字以上で入力してください')
    .regex(/[a-zA-Z]/, 'パスワードには英字を含めてください')
    .regex(/[0-9]/, 'パスワードには数字を含めてください'),
});

// ログイン入力スキーマ
export const LoginInputSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'パスワードを入力してください'),
});

// プロフィール更新スキーマ
export const UpdateProfileInputSchema = z.object({
  name: z
    .string()
    .min(1, '名前を入力してください')
    .max(100, '名前は100文字以内で入力してください')
    .trim()
    .optional(),
  avatarUrl: z.string().url('有効なURLを入力してください').optional().nullable(),
});

// パスワード変更スキーマ
export const ChangePasswordInputSchema = z.object({
  currentPassword: z.string().min(1, '現在のパスワードを入力してください'),
  newPassword: z
    .string()
    .min(8, '新しいパスワードは8文字以上で入力してください')
    .regex(/[a-zA-Z]/, '新しいパスワードには英字を含めてください')
    .regex(/[0-9]/, '新しいパスワードには数字を含めてください'),
});

// 型エクスポート
export type RegisterInput = z.infer<typeof RegisterInputSchema>;
export type LoginInput = z.infer<typeof LoginInputSchema>;
export type UpdateProfileInput = z.infer<typeof UpdateProfileInputSchema>;
export type ChangePasswordInput = z.infer<typeof ChangePasswordInputSchema>;
```

**output.ts:**

```typescript
import { z } from 'zod';
import { PublicAccountSchema } from '@shared-types/entities/account';

// セッション情報スキーマ
export const SessionInfoSchema = z.object({
  id: z.string().cuid(),
  token: z.string(),
  expiresAt: z.string().datetime(),
});

// 組織情報スキーマ（簡易版）
export const OrganizationSummarySchema = z.object({
  id: z.string().cuid(),
  name: z.string(),
  slug: z.string(),
  role: z.enum(['OWNER', 'ADMIN', 'MEMBER', 'VIEWER']),
});

// プロジェクト情報スキーマ（簡易版）
export const ProjectSummarySchema = z.object({
  id: z.string().cuid(),
  name: z.string(),
  slug: z.string(),
  status: z.enum(['CREATING', 'ACTIVE', 'FAILED', 'SUSPENDED', 'ARCHIVED']),
  organizationId: z.string().cuid().nullable(),
});

// ログインレスポンススキーマ
export const LoginResponseSchema = z.object({
  account: PublicAccountSchema,
  session: SessionInfoSchema,
  token: z.string(),
});

// 登録レスポンススキーマ
export const RegisterResponseSchema = z.object({
  account: PublicAccountSchema,
  session: SessionInfoSchema,
  token: z.string(),
});

// 自分の情報レスポンススキーマ
export const MeResponseSchema = z.object({
  account: PublicAccountSchema,
  organizations: z.array(OrganizationSummarySchema),
  projects: z.array(ProjectSummarySchema),
});

// 型エクスポート
export type SessionInfo = z.infer<typeof SessionInfoSchema>;
export type OrganizationSummary = z.infer<typeof OrganizationSummarySchema>;
export type ProjectSummary = z.infer<typeof ProjectSummarySchema>;
export type LoginResponse = z.infer<typeof LoginResponseSchema>;
export type RegisterResponse = z.infer<typeof RegisterResponseSchema>;
export type MeResponse = z.infer<typeof MeResponseSchema>;
```

#### **apps/api/lib/schemas/database/**

```
database/
├── index.ts
└── account.ts     # DB操作用スキーマ
```

**account.ts:**

```typescript
import { z } from 'zod';
// Note: @zod-schemas will be available after prisma generate
// import { AccountSchema } from '@zod-schemas/models/AccountSchema';

// アカウント作成スキーマ（id, createdAt, updatedAt を除外）
export const CreateAccountSchema = z.object({
  email: z.string().email().toLowerCase().trim(),
  name: z.string().min(1).max(100).nullable().optional(),
  avatarUrl: z.string().url().nullable().optional(),
  passwordEnc: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED', 'DELETED']).default('ACTIVE'),
  role: z.enum(['SUPER_ADMIN', 'ADMIN', 'USER']).default('USER'),
  lastLoginAt: z.date().nullable().optional(),
});

// アカウント更新スキーマ（部分的更新）
export const UpdateAccountSchema = z
  .object({
    email: z.string().email().toLowerCase().trim().optional(),
    name: z.string().min(1).max(100).nullable().optional(),
    avatarUrl: z.string().url().nullable().optional(),
    passwordEnc: z.string().optional(),
    status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED', 'DELETED']).optional(),
    role: z.enum(['SUPER_ADMIN', 'ADMIN', 'USER']).optional(),
    lastLoginAt: z.date().nullable().optional(),
  })
  .partial();

// アカウント検索条件スキーマ
export const FindAccountSchema = z.object({
  id: z.string().cuid().optional(),
  email: z.string().email().toLowerCase().trim().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED', 'DELETED']).optional(),
  role: z.enum(['SUPER_ADMIN', 'ADMIN', 'USER']).optional(),
});

// アカウントフィルタースキーマ（複数条件）
export const AccountFilterSchema = z.object({
  ids: z.array(z.string().cuid()).optional(),
  email: z.string().optional(),
  emailContains: z.string().optional(),
  name: z.string().optional(),
  nameContains: z.string().optional(),
  status: z.array(z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED', 'DELETED'])).optional(),
  role: z.array(z.enum(['SUPER_ADMIN', 'ADMIN', 'USER'])).optional(),
  createdAfter: z.date().optional(),
  createdBefore: z.date().optional(),
  lastLoginAfter: z.date().optional(),
  lastLoginBefore: z.date().optional(),
});

// ページネーションスキーマ
export const PaginationSchema = z.object({
  skip: z.number().int().min(0).default(0),
  take: z.number().int().min(1).max(100).default(20),
  orderBy: z.enum(['createdAt', 'updatedAt', 'email', 'name', 'lastLoginAt']).default('createdAt'),
  orderDirection: z.enum(['asc', 'desc']).default('desc'),
});

// 型エクスポート
export type CreateAccount = z.infer<typeof CreateAccountSchema>;
export type UpdateAccount = z.infer<typeof UpdateAccountSchema>;
export type FindAccount = z.infer<typeof FindAccountSchema>;
export type AccountFilter = z.infer<typeof AccountFilterSchema>;
export type Pagination = z.infer<typeof PaginationSchema>;
```

### 4. 型定義ファイル

#### **apps/api/lib/types/**

```
types/
├── index.ts
└── context.ts     # tRPCコンテキスト型
```

**context.ts:**

```typescript
// 認証済みユーザー情報
export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string | null;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'USER';
}

// セッション情報
export interface SessionInfo {
  id: string;
  accountId: string;
  token: string;
  expiresAt: Date;
  ipAddress: string | null;
  userAgent: string | null;
}

// tRPCコンテキスト
export interface TRPCContext {
  session: SessionInfo | null;
  user: AuthenticatedUser | null;
  req: Request;
  headers: Headers;
}

// 認証済みコンテキスト
export interface AuthenticatedContext extends TRPCContext {
  session: SessionInfo;
  user: AuthenticatedUser;
}

// API エラー型
export interface APIError {
  code: string;
  message: string;
  statusCode: number;
  details?: unknown;
}

// ページネーション結果型
export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}
```

### 5. フロントエンドスキーマ

#### **apps/web/lib/schemas/forms/**

```
forms/
├── index.ts
└── auth-forms.ts  # フォーム用スキーマ
```

**auth-forms.ts:**

```typescript
import { z } from 'zod';

// ログインフォームスキーマ
export const LoginFormSchema = z.object({
  email: z
    .string()
    .min(1, 'メールアドレスを入力してください')
    .email('有効なメールアドレスを入力してください')
    .toLowerCase()
    .trim(),
  password: z.string().min(1, 'パスワードを入力してください'),
  rememberMe: z.boolean().default(false),
});

// 登録フォームスキーマ
export const RegisterFormSchema = z
  .object({
    email: z
      .string()
      .min(1, 'メールアドレスを入力してください')
      .email('有効なメールアドレスを入力してください')
      .toLowerCase()
      .trim(),
    name: z
      .string()
      .min(1, '名前を入力してください')
      .max(100, '名前は100文字以内で入力してください')
      .trim(),
    password: z
      .string()
      .min(8, 'パスワードは8文字以上で入力してください')
      .regex(/^(?=.*[a-zA-Z])(?=.*[0-9])/, 'パスワードには英字と数字を含めてください'),
    confirmPassword: z.string().min(1, 'パスワードを再入力してください'),
    acceptTerms: z.boolean().refine((val) => val === true, {
      message: '利用規約に同意してください',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'パスワードが一致しません',
    path: ['confirmPassword'],
  });

// パスワードリセット要求フォームスキーマ
export const PasswordResetRequestFormSchema = z.object({
  email: z
    .string()
    .min(1, 'メールアドレスを入力してください')
    .email('有効なメールアドレスを入力してください')
    .toLowerCase()
    .trim(),
});

// パスワードリセットフォームスキーマ
export const PasswordResetFormSchema = z
  .object({
    token: z.string().min(1),
    password: z
      .string()
      .min(8, '新しいパスワードは8文字以上で入力してください')
      .regex(/^(?=.*[a-zA-Z])(?=.*[0-9])/, 'パスワードには英字と数字を含めてください'),
    confirmPassword: z.string().min(1, 'パスワードを再入力してください'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'パスワードが一致しません',
    path: ['confirmPassword'],
  });

// 型エクスポート
export type LoginFormData = z.infer<typeof LoginFormSchema>;
export type RegisterFormData = z.infer<typeof RegisterFormSchema>;
export type PasswordResetRequestFormData = z.infer<typeof PasswordResetRequestFormSchema>;
export type PasswordResetFormData = z.infer<typeof PasswordResetFormSchema>;
```

#### **apps/web/lib/types/**

```
types/
├── index.ts
└── ui.ts          # UI状態管理型
```

**ui.ts:**

```typescript
import type { PublicAccount } from '@shared-types/entities/account';

// 認証状態
export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: PublicAccount | null;
  error: string | null;
}

// フォーム状態
export interface FormState<T = unknown> {
  isSubmitting: boolean;
  isValid: boolean;
  errors: Record<string, string[]>;
  values: T;
  touchedFields: Set<string>;
}

// UI状態
export interface UIState {
  theme: 'light' | 'dark' | 'system';
  sidebarOpen: boolean;
  modalOpen: boolean;
  notifications: Notification[];
}

// 通知
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  timestamp: Date;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// ローディング状態
export interface LoadingState {
  isLoading: boolean;
  progress?: number;
  message?: string;
}

// エラー状態
export interface ErrorState {
  hasError: boolean;
  error: Error | null;
  message?: string;
  retry?: () => void;
}

// ページネーション状態
export interface PaginationState {
  currentPage: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

// フィルター状態
export interface FilterState {
  searchQuery: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  filters: Record<string, unknown>;
}
```

### 6. 削除されたディレクトリ

- `/generated/` - 旧Prisma Client生成先

## 主な変更点のまとめ

1. **Prisma Client生成先の正規化**
   - カスタムパスから標準パス（node_modules/@prisma/client）に変更
   - CI/CDでの互換性向上

2. **依存関係の適切な分離**
   - 実行時依存（dependencies）: @prisma/client, zod
   - 開発時依存（devDependencies）: prisma, prisma-zod-generator
   - 本番バンドルサイズの削減

3. **自動生成の強化**
   - postinstallスクリプトによるcold build対応
   - Zod generatorオプション追加による型生成の充実

4. **型安全性の向上**
   - フロントエンド・バックエンドで適切に分離された型定義
   - 生成スキーマを基にした用途別スキーマの作成
   - 日本語エラーメッセージによるUX向上

5. **開発効率の改善**
   - ESLintによる生成ファイルの除外
   - パスエイリアスの一元管理
   - yarn workspacesによる依存関係の整理
