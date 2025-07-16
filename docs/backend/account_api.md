# Account API 実装要件書 - 関数型アーキテクチャ版

## 🎯 概要

Boilerplate CloudのAccount API実装要件を定義します。Next.js App Router + tRPC + Prismaを使用した関数型アーキテクチャで、機能を細かく分離し、保守しやすい構成にします。

## 🏗️ 推奨アーキテクチャ構成

### **Next.js + tRPC + Prisma ベストプラクティス**

```
apps/web/
├── app/
│   └── api/
│       └── trpc/
│           └── [trpc]/
│               └── route.ts           # tRPCエンドポイント
├── lib/
│   ├── trpc/
│   │   ├── client.ts                  # tRPCクライアント設定
│   │   ├── server.ts                  # tRPCサーバー設定
│   │   └── routers/
│   │       ├── _app.ts                # ルーター統合
│   │       └── auth.ts                # 👈 認証ルーター（実装対象）
│   ├── db/
│   │   ├── prisma.ts                  # Prismaクライアント
│   │   └── queries/
│   │       └── auth/
│   │           ├── accounts.ts        # 👈 アカウントクエリ関数
│   │           ├── sessions.ts        # セッションクエリ関数
│   │           └── audit-logs.ts      # 監査ログクエリ関数
│   ├── auth/
│   │   ├── password.ts                # パスワード処理
│   │   ├── session.ts                 # セッション管理
│   │   ├── validation.ts              # バリデーション
│   │   └── middleware.ts              # 認証ミドルウェア
│   ├── utils/
│   │   ├── crypto.ts                  # 暗号化ユーティリティ
│   │   ├── logger.ts                  # ログ機能
│   │   └── errors.ts                  # エラーハンドリング
│   └── types/
│       ├── auth.ts                    # 認証型定義
│       └── api.ts                     # API型定義
```

## 💡 設計哲学

### **1. 関数型 > クラス型**

- 純粋関数中心の設計
- 副作用を明確に分離
- テストしやすい小さな関数

### **2. 単一責任原則**

- 1つの関数は1つの責任のみ
- ファイルサイズを小さく保つ
- 機能ごとに明確に分離

### **3. 依存性注入パターン**

- 関数の引数でDBクライアントを受け取る
- 外部依存を明示的に管理
- モックしやすい設計

---

## 🏗️ 実装詳細

### **1. Prismaクライアント設定**

**`apps/web/lib/db/prisma.ts`**

```typescript
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// DB接続テスト用関数
export async function testConnection() {
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
}
```

### **2. Account クエリ関数（データアクセス層）**

**`apps/web/lib/db/queries/auth/accounts.ts`**

```typescript
import { PrismaClient, Account, AccountStatus, PlatformRole } from '@prisma/client';

// アカウント作成データ型
export interface CreateAccountInput {
  email: string;
  name: string | null;
  passwordEnc: string;
  status?: AccountStatus;
  role?: PlatformRole;
}

// アカウント更新データ型
export interface UpdateAccountInput {
  name?: string;
  avatarUrl?: string;
  lastLoginAt?: Date;
}

// メールでアカウント検索
export async function findAccountByEmail(
  prisma: PrismaClient,
  email: string,
): Promise<Account | null> {
  return await prisma.account.findUnique({
    where: { email: email.toLowerCase() },
  });
}

// IDでアカウント検索
export async function findAccountById(prisma: PrismaClient, id: string): Promise<Account | null> {
  return await prisma.account.findUnique({
    where: { id },
  });
}

// リレーション込みでアカウント検索
export async function findAccountWithRelations(prisma: PrismaClient, id: string) {
  return await prisma.account.findUnique({
    where: { id },
    include: {
      organizations: {
        include: {
          organization: {
            select: {
              id: true,
              name: true,
              plan: true,
              slug: true,
            },
          },
        },
      },
      projects: {
        where: { deletedAt: null },
        select: {
          id: true,
          name: true,
          status: true,
          slug: true,
          createdAt: true,
        },
      },
    },
  });
}

// アカウント作成
export async function createAccount(
  prisma: PrismaClient,
  data: CreateAccountInput,
): Promise<Account> {
  return await prisma.account.create({
    data: {
      email: data.email.toLowerCase(),
      name: data.name,
      passwordEnc: data.passwordEnc,
      status: data.status ?? 'ACTIVE',
      role: data.role ?? 'USER',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });
}

// アカウント更新
export async function updateAccount(
  prisma: PrismaClient,
  id: string,
  data: UpdateAccountInput,
): Promise<Account> {
  return await prisma.account.update({
    where: { id },
    data: {
      ...data,
      updatedAt: new Date(),
    },
  });
}

// パスワード更新
export async function updateAccountPassword(
  prisma: PrismaClient,
  id: string,
  passwordEnc: string,
): Promise<void> {
  await prisma.account.update({
    where: { id },
    data: {
      passwordEnc,
      updatedAt: new Date(),
    },
  });
}

// ソフトデリート
export async function softDeleteAccount(prisma: PrismaClient, id: string): Promise<void> {
  await prisma.account.update({
    where: { id },
    data: {
      status: 'DELETED',
      updatedAt: new Date(),
    },
  });
}

// 所有している組織を取得
export async function findOwnedOrganizations(prisma: PrismaClient, accountId: string) {
  return await prisma.organization.findMany({
    where: {
      members: {
        some: {
          accountId,
          role: 'OWNER',
        },
      },
    },
    select: {
      id: true,
      name: true,
      slug: true,
    },
  });
}

// 管理者用：統計情報込みでアカウント取得
export async function findAccountWithStats(prisma: PrismaClient, id: string) {
  return await prisma.account.findUnique({
    where: { id },
    include: {
      organizations: {
        include: {
          organization: {
            select: {
              id: true,
              name: true,
              plan: true,
              createdAt: true,
            },
          },
        },
      },
      projects: {
        where: { deletedAt: null },
        select: {
          id: true,
          name: true,
          status: true,
          createdAt: true,
        },
      },
      _count: {
        select: {
          organizations: true,
          projects: true,
          auditLogs: true,
        },
      },
    },
  });
}
```

### **3. セッション管理関数**

**`apps/web/lib/db/queries/auth/sessions.ts`**

```typescript
import { PrismaClient, Session } from '@prisma/client';
import { randomBytes } from 'crypto';

const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7日間

export interface CreateSessionInput {
  accountId: string;
  ipAddress?: string;
  userAgent?: string;
}

// セッション作成
export async function createSession(
  prisma: PrismaClient,
  data: CreateSessionInput,
): Promise<Session> {
  const token = randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + SESSION_DURATION);

  return await prisma.session.create({
    data: {
      accountId: data.accountId,
      token,
      expiresAt,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
    },
  });
}

// セッション検証
export async function findSessionByToken(prisma: PrismaClient, token: string) {
  return await prisma.session.findUnique({
    where: { token },
    include: {
      account: {
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          status: true,
        },
      },
    },
  });
}

// セッション無効化
export async function invalidateSession(prisma: PrismaClient, token: string): Promise<void> {
  await prisma.session.delete({
    where: { token },
  });
}

// ユーザーの他のセッションを無効化
export async function invalidateOtherSessions(
  prisma: PrismaClient,
  accountId: string,
  currentSessionId: string,
): Promise<void> {
  await prisma.session.deleteMany({
    where: {
      accountId,
      id: { not: currentSessionId },
    },
  });
}

// ユーザーの全セッション無効化
export async function invalidateAllUserSessions(
  prisma: PrismaClient,
  accountId: string,
): Promise<void> {
  await prisma.session.deleteMany({
    where: { accountId },
  });
}

// 期限切れセッション削除（クリーンアップ用）
export async function cleanupExpiredSessions(prisma: PrismaClient): Promise<number> {
  const result = await prisma.session.deleteMany({
    where: {
      expiresAt: { lt: new Date() },
    },
  });
  return result.count;
}

// ユーザーのアクティブセッション一覧
export async function findActiveSessionsByUser(prisma: PrismaClient, accountId: string) {
  return await prisma.session.findMany({
    where: {
      accountId,
      expiresAt: { gt: new Date() },
    },
    select: {
      id: true,
      ipAddress: true,
      userAgent: true,
      expiresAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}
```

### **4. 監査ログ関数**

**`apps/web/lib/db/queries/auth/audit-logs.ts`**

```typescript
import { PrismaClient } from '@prisma/client';

export interface CreateAuditLogInput {
  accountId: string;
  organizationId?: string;
  projectId?: string;
  action: string;
  resource: string;
  resourceId: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

// 監査ログ作成
export async function createAuditLog(
  prisma: PrismaClient,
  data: CreateAuditLogInput,
): Promise<void> {
  await prisma.auditLog.create({
    data: {
      ...data,
      createdAt: new Date(),
    },
  });
}

// プロジェクト別監査ログ取得
export async function findAuditLogsByProject(
  prisma: PrismaClient,
  projectId: string,
  options: {
    page?: number;
    limit?: number;
    action?: string;
    startDate?: Date;
    endDate?: Date;
  } = {},
) {
  const { page = 1, limit = 50, action, startDate, endDate } = options;
  const skip = (page - 1) * limit;

  const where = {
    projectId,
    ...(action && { action }),
    ...((startDate || endDate) && {
      createdAt: {
        ...(startDate && { gte: startDate }),
        ...(endDate && { lte: endDate }),
      },
    }),
  };

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        account: {
          select: { id: true, email: true, name: true },
        },
      },
    }),
    prisma.auditLog.count({ where }),
  ]);

  return {
    logs,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

// 組織別監査ログ取得
export async function findAuditLogsByOrganization(
  prisma: PrismaClient,
  organizationId: string,
  options: {
    page?: number;
    limit?: number;
    action?: string;
    startDate?: Date;
    endDate?: Date;
  } = {},
) {
  const { page = 1, limit = 50, action, startDate, endDate } = options;
  const skip = (page - 1) * limit;

  const where = {
    organizationId,
    ...(action && { action }),
    ...((startDate || endDate) && {
      createdAt: {
        ...(startDate && { gte: startDate }),
        ...(endDate && { lte: endDate }),
      },
    }),
  };

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        account: {
          select: { id: true, email: true, name: true },
        },
      },
    }),
    prisma.auditLog.count({ where }),
  ]);

  return {
    logs,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}
```

### **5. 認証ユーティリティ関数**

**`apps/web/lib/auth/password.ts`**

```typescript
import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 12;

// パスワードハッシュ化
export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, SALT_ROUNDS);
}

// パスワード検証
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

// パスワード強度チェック
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('パスワードは8文字以上である必要があります');
  }

  if (!/[a-zA-Z]/.test(password)) {
    errors.push('パスワードには英字を含める必要があります');
  }

  if (!/\d/.test(password)) {
    errors.push('パスワードには数字を含める必要があります');
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('パスワードには特殊文字を含めることを推奨します');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
```

**`apps/web/lib/auth/validation.ts`**

```typescript
import { z } from 'zod';

// 共通バリデーションルール
const emailSchema = z
  .string()
  .email('有効なメールアドレスを入力してください')
  .max(254, 'メールアドレスが長すぎます');

const passwordSchema = z
  .string()
  .min(8, 'パスワードは8文字以上である必要があります')
  .regex(/[a-zA-Z]/, 'パスワードには英字を含める必要があります')
  .regex(/\d/, 'パスワードには数字を含める必要があります');

const nameSchema = z.string().max(100, '名前は100文字以内で入力してください').optional();

// 新規登録バリデーション
export const registerSchema = z.object({
  email: emailSchema,
  name: nameSchema,
  password: passwordSchema,
});

// ログインバリデーション
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'パスワードを入力してください'),
});

// プロフィール更新バリデーション
export const updateProfileSchema = z.object({
  name: nameSchema,
  avatarUrl: z.string().url('有効なURLを入力してください').optional(),
});

// パスワード変更バリデーション
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, '現在のパスワードを入力してください'),
  newPassword: passwordSchema,
});

// バリデーション実行ヘルパー
export function validateInput<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
): { success: true; data: T } | { success: false; errors: string[] } {
  try {
    const validData = schema.parse(data);
    return { success: true, data: validData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.errors.map((e) => e.message),
      };
    }
    return {
      success: false,
      errors: ['バリデーションエラーが発生しました'],
    };
  }
}
```

### **6. tRPC認証ルーター**

**`apps/web/lib/trpc/routers/auth.ts`**

```typescript
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { createTRPCRouter, publicProcedure, protectedProcedure } from '../server';
import { prisma } from '../../db/prisma';

// クエリ関数のインポート
import {
  findAccountByEmail,
  createAccount,
  updateAccount,
  findAccountWithRelations,
  updateAccountPassword,
  softDeleteAccount,
  findOwnedOrganizations,
  findAccountWithStats,
} from '../../db/queries/auth/accounts';

import {
  createSession,
  findSessionByToken,
  invalidateSession,
  invalidateOtherSessions,
  invalidateAllUserSessions,
  findActiveSessionsByUser,
} from '../../db/queries/auth/sessions';

import { createAuditLog } from '../../db/queries/auth/audit-logs';

// ユーティリティ関数のインポート
import { hashPassword, verifyPassword } from '../../auth/password';
import {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  changePasswordSchema,
  validateInput,
} from '../../auth/validation';

export const authRouter = createTRPCRouter({
  // 1. アカウント登録
  register: publicProcedure.input(registerSchema).mutation(async ({ input, ctx }) => {
    const { email, name, password } = input;

    // メール重複チェック
    const existingAccount = await findAccountByEmail(prisma, email);
    if (existingAccount) {
      throw new TRPCError({
        code: 'CONFLICT',
        message: 'このメールアドレスは既に登録されています',
      });
    }

    // パスワードハッシュ化
    const passwordEnc = await hashPassword(password);

    // アカウント作成
    const account = await createAccount(prisma, {
      email,
      name: name || null,
      passwordEnc,
    });

    // セッション作成
    const session = await createSession(prisma, {
      accountId: account.id,
      ipAddress: ctx.req?.ip,
      userAgent: ctx.req?.headers['user-agent'],
    });

    // 監査ログ
    await createAuditLog(prisma, {
      accountId: account.id,
      action: 'ACCOUNT_CREATED',
      resource: 'ACCOUNT',
      resourceId: account.id,
      ipAddress: ctx.req?.ip,
      userAgent: ctx.req?.headers['user-agent'],
    });

    return {
      account: {
        id: account.id,
        email: account.email,
        name: account.name,
        avatarUrl: account.avatarUrl,
        status: account.status,
        role: account.role,
        createdAt: account.createdAt,
      },
      session: {
        token: session.token,
        expiresAt: session.expiresAt,
      },
    };
  }),

  // 2. ログイン
  login: publicProcedure.input(loginSchema).mutation(async ({ input, ctx }) => {
    const { email, password } = input;

    // アカウント取得
    const account = await findAccountByEmail(prisma, email);
    if (!account) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'メールアドレスまたはパスワードが正しくありません',
      });
    }

    // ステータス確認
    if (account.status !== 'ACTIVE') {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'アカウントが無効です',
      });
    }

    // パスワード検証
    const isValidPassword = await verifyPassword(password, account.passwordEnc!);
    if (!isValidPassword) {
      // 失敗ログ
      await createAuditLog(prisma, {
        accountId: account.id,
        action: 'LOGIN_FAILED',
        resource: 'ACCOUNT',
        resourceId: account.id,
        metadata: { reason: 'INVALID_PASSWORD' },
        ipAddress: ctx.req?.ip,
        userAgent: ctx.req?.headers['user-agent'],
      });

      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'メールアドレスまたはパスワードが正しくありません',
      });
    }

    // 最終ログイン時刻更新
    await updateAccount(prisma, account.id, {
      lastLoginAt: new Date(),
    });

    // セッション作成
    const session = await createSession(prisma, {
      accountId: account.id,
      ipAddress: ctx.req?.ip,
      userAgent: ctx.req?.headers['user-agent'],
    });

    // 成功ログ
    await createAuditLog(prisma, {
      accountId: account.id,
      action: 'LOGIN_SUCCESS',
      resource: 'ACCOUNT',
      resourceId: account.id,
      ipAddress: ctx.req?.ip,
      userAgent: ctx.req?.headers['user-agent'],
    });

    return {
      account: {
        id: account.id,
        email: account.email,
        name: account.name,
        avatarUrl: account.avatarUrl,
        status: account.status,
        role: account.role,
        lastLoginAt: account.lastLoginAt,
      },
      session: {
        token: session.token,
        expiresAt: session.expiresAt,
      },
    };
  }),

  // 3. 現在のユーザー情報取得
  me: protectedProcedure.query(async ({ ctx }) => {
    const account = await findAccountWithRelations(prisma, ctx.user.id);
    if (!account) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'アカウントが見つかりません',
      });
    }

    return {
      account: {
        id: account.id,
        email: account.email,
        name: account.name,
        avatarUrl: account.avatarUrl,
        status: account.status,
        role: account.role,
        createdAt: account.createdAt,
        lastLoginAt: account.lastLoginAt,
      },
      organizations: account.organizations.map((member) => ({
        id: member.organization.id,
        name: member.organization.name,
        slug: member.organization.slug,
        plan: member.organization.plan,
        role: member.role,
        joinedAt: member.acceptedAt,
      })),
      projects: account.projects.map((project) => ({
        id: project.id,
        name: project.name,
        slug: project.slug,
        status: project.status,
        createdAt: project.createdAt,
      })),
    };
  }),

  // 4. プロフィール更新
  updateProfile: protectedProcedure.input(updateProfileSchema).mutation(async ({ input, ctx }) => {
    const updatedAccount = await updateAccount(prisma, ctx.user.id, input);

    await createAuditLog(prisma, {
      accountId: ctx.user.id,
      action: 'PROFILE_UPDATED',
      resource: 'ACCOUNT',
      resourceId: ctx.user.id,
      metadata: input,
    });

    return {
      account: {
        id: updatedAccount.id,
        email: updatedAccount.email,
        name: updatedAccount.name,
        avatarUrl: updatedAccount.avatarUrl,
        updatedAt: updatedAccount.updatedAt,
      },
    };
  }),

  // 5. ログアウト
  logout: protectedProcedure.mutation(async ({ ctx }) => {
    if (ctx.sessionToken) {
      await invalidateSession(prisma, ctx.sessionToken);
    }

    await createAuditLog(prisma, {
      accountId: ctx.user.id,
      action: 'LOGOUT',
      resource: 'ACCOUNT',
      resourceId: ctx.user.id,
    });

    return { message: 'ログアウトしました' };
  }),

  // 6. アカウント削除
  deleteAccount: protectedProcedure.mutation(async ({ ctx }) => {
    // 組織オーナーチェック
    const ownedOrganizations = await findOwnedOrganizations(prisma, ctx.user.id);
    if (ownedOrganizations.length > 0) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: '組織のオーナー権限を移譲してからアカウントを削除してください',
        cause: { organizations: ownedOrganizations },
      });
    }

    // ソフトデリート
    await softDeleteAccount(prisma, ctx.user.id);

    // 全セッション無効化
    await invalidateAllUserSessions(prisma, ctx.user.id);

    await createAuditLog(prisma, {
      accountId: ctx.user.id,
      action: 'ACCOUNT_DELETED',
      resource: 'ACCOUNT',
      resourceId: ctx.user.id,
    });

    return { message: 'アカウントを削除しました' };
  }),

  // 7. パスワード変更
  changePassword: protectedProcedure
    .input(changePasswordSchema)
    .mutation(async ({ input, ctx }) => {
      const { currentPassword, newPassword } = input;

      // 現在のアカウント取得
      const account = await findAccountByEmail(prisma, ctx.user.email);
      if (!account) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'アカウントが見つかりません',
        });
      }

      // 現在のパスワード確認
      const isCurrentPasswordValid = await verifyPassword(currentPassword, account.passwordEnc!);
      if (!isCurrentPasswordValid) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: '現在のパスワードが正しくありません',
        });
      }

      // 新パスワードハッシュ化
      const hashedNewPassword = await hashPassword(newPassword);

      // パスワード更新
      await updateAccountPassword(prisma, ctx.user.id, hashedNewPassword);

      // 他のセッション無効化（セキュリティ）
      await invalidateOtherSessions(prisma, ctx.user.id, ctx.sessionId);

      await createAuditLog(prisma, {
        accountId: ctx.user.id,
        action: 'PASSWORD_CHANGED',
        resource: 'ACCOUNT',
        resourceId: ctx.user.id,
      });

      return { message: 'パスワードを変更しました' };
    }),

  // 8. アカウント詳細取得（管理者用）
  getAccountById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      // 管理者権限チェック
      if (ctx.user.role !== 'ADMIN' && ctx.user.role !== 'SUPER_ADMIN') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: '管理者権限が必要です',
        });
      }

      const account = await findAccountWithStats(prisma, input.id);
      if (!account) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'アカウントが見つかりません',
        });
      }

      // 監査ログ記録
      await createAuditLog(prisma, {
        accountId: ctx.user.id,
        action: 'ADMIN_ACCOUNT_VIEW',
        resource: 'ACCOUNT',
        resourceId: input.id,
        metadata: { viewerRole: ctx.user.role },
      });

      return {
        account: {
          id: account.id,
          email: account.email,
          name: account.name,
          avatarUrl: account.avatarUrl,
          status: account.status,
          role: account.role,
          createdAt: account.createdAt,
          lastLoginAt: account.lastLoginAt,
          stats: {
            organizationsCount: account._count.organizations,
            projectsCount: account._count.projects,
            auditLogsCount: account._count.auditLogs,
          },
        },
        organizations: account.organizations.map((member) => ({
          id: member.organization.id,
          name: member.organization.name,
          plan: member.organization.plan,
          role: member.role,
          createdAt: member.organization.createdAt,
        })),
        projects: account.projects,
      };
    }),

  // アクティブセッション一覧
  getSessions: protectedProcedure.query(async ({ ctx }) => {
    const sessions = await findActiveSessionsByUser(prisma, ctx.user.id);
    return { sessions };
  }),

  // 特定セッション削除
  deleteSession: protectedProcedure
    .input(z.object({ sessionId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      // セッション所有者確認は実際の実装では必要
      await invalidateSession(prisma, input.sessionId);

      await createAuditLog(prisma, {
        accountId: ctx.user.id,
        action: 'SESSION_DELETED',
        resource: 'SESSION',
        resourceId: input.sessionId,
      });

      return { message: 'セッションを削除しました' };
    }),
});
```

### **7. tRPCミドルウェア設定**

**`apps/web/lib/trpc/server.ts`**

```typescript
import { TRPCError, initTRPC } from '@trpc/server';
import { NextRequest } from 'next/server';
import { prisma } from '../db/prisma';
import { findSessionByToken } from '../db/queries/auth/sessions';

// コンテキスト型定義
interface CreateContextOptions {
  req?: NextRequest;
  sessionToken?: string;
  user?: {
    id: string;
    email: string;
    role: string;
  };
  sessionId?: string;
}

// コンテキスト作成
export async function createTRPCContext(opts: CreateContextOptions) {
  return {
    prisma,
    req: opts.req,
    sessionToken: opts.sessionToken,
    user: opts.user,
    sessionId: opts.sessionId,
  };
}

// tRPC初期化
const t = initTRPC.context<typeof createTRPCContext>().create();

// 基本プロシージャ
export const publicProcedure = t.procedure;

// 認証ミドルウェア
const authMiddleware = t.middleware(async ({ ctx, next }) => {
  // セッショントークン取得
  const token =
    ctx.req?.headers.get('authorization')?.replace('Bearer ', '') ||
    ctx.req?.cookies.get('sessionToken')?.value;

  if (!token) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: '認証が必要です',
    });
  }

  // セッション検証
  const session = await findSessionByToken(prisma, token);
  if (!session) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'セッションが無効です',
    });
  }

  // セッション期限チェック
  if (session.expiresAt < new Date()) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'セッションが期限切れです',
    });
  }

  // アカウントステータス確認
  if (session.account.status !== 'ACTIVE') {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'アカウントが無効です',
    });
  }

  return next({
    ctx: {
      ...ctx,
      sessionToken: token,
      user: {
        id: session.account.id,
        email: session.account.email,
        role: session.account.role,
      },
      sessionId: session.id,
    },
  });
});

// 認証必須プロシージャ
export const protectedProcedure = publicProcedure.use(authMiddleware);

// ルーター作成
export const createTRPCRouter = t.router;
```

### **8. エラーハンドリング**

**`apps/web/lib/utils/errors.ts`**

```typescript
import { TRPCError } from '@trpc/server';

export class AppError extends Error {
  constructor(
    public code: string,
    public message: string,
    public statusCode: number = 500,
    public cause?: any,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

// 共通エラー定義
export const Errors = {
  // 認証エラー
  UNAUTHORIZED: (message = '認証が必要です') => new TRPCError({ code: 'UNAUTHORIZED', message }),

  INVALID_CREDENTIALS: (message = 'メールアドレスまたはパスワードが正しくありません') =>
    new TRPCError({ code: 'UNAUTHORIZED', message }),

  SESSION_EXPIRED: (message = 'セッションが期限切れです') =>
    new TRPCError({ code: 'UNAUTHORIZED', message }),

  // 権限エラー
  FORBIDDEN: (message = 'アクセス権限がありません') =>
    new TRPCError({ code: 'FORBIDDEN', message }),

  // データエラー
  NOT_FOUND: (message = 'データが見つかりません') => new TRPCError({ code: 'NOT_FOUND', message }),

  CONFLICT: (message = 'データが重複しています') => new TRPCError({ code: 'CONFLICT', message }),

  // バリデーションエラー
  VALIDATION_ERROR: (message = '入力データが正しくありません') =>
    new TRPCError({ code: 'BAD_REQUEST', message }),

  // サーバーエラー
  INTERNAL_ERROR: (message = 'サーバーエラーが発生しました') =>
    new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message }),
};

// エラーレスポンス整形
export function formatErrorResponse(error: any) {
  console.error('API Error:', error);

  if (error instanceof TRPCError) {
    return {
      error: error.code,
      message: error.message,
      ...(error.cause && { details: error.cause }),
    };
  }

  return {
    error: 'INTERNAL_SERVER_ERROR',
    message: '予期しないエラーが発生しました',
  };
}
```

---

## 🔧 実装手順

### **Phase 1: 基盤構築（1-2週間）**

1. **ディレクトリ構造作成**
2. **Prismaクライアント設定**
3. **基本的なクエリ関数実装**
4. **バリデーション関数作成**

### **Phase 2: 認証基盤（1-2週間）**

1. **パスワード・セッション管理関数**
2. **tRPCサーバー設定**
3. **認証ミドルウェア実装**

### **Phase 3: 基本API（2週間）**

1. **register, login**
2. **me, updateProfile**
3. **logout, deleteAccount**

### **Phase 4: 高度な機能（1週間）**

1. **パスワード変更**
2. **セッション管理**
3. **管理者機能**

### **Phase 5: テスト・最適化（1週間）**

1. **単体テスト**
2. **統合テスト**
3. **パフォーマンス最適化**

---

## 💡 ベストプラクティス

### **1. 関数型設計原則**

- **純粋関数優先**: 副作用を明確に分離
- **小さな関数**: 1つの責任のみ持つ
- **依存性注入**: テストしやすい設計
- **型安全性**: TypeScriptを最大限活用

### **2. ファイル分割戦略**

- **単一責任**: 1つのファイルは1つの機能
- **レイヤー分離**: データアクセス・ビジネスロジック・API
- **共通化**: 再利用可能なユーティリティ
- **テスタブル**: モックしやすい構造

### **3. エラーハンドリング**

- **明確なエラー**: 適切なステータスコード
- **ログ記録**: デバッグしやすい情報
- **ユーザビリティ**: 分かりやすいメッセージ
- **セキュリティ**: 内部情報の漏洩防止

### **4. セキュリティ要件**

- **パスワード**: bcrypt + salt rounds 12
- **セッション**: トークンベース + 有効期限
- **監査ログ**: 全ての重要操作を記録
- **入力検証**: フロント・バック両方で実施

この関数型アーキテクチャにより、保守しやすく、テストしやすく、拡張しやすいAccount API実装が可能になります。
