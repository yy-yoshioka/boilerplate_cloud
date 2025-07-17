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
