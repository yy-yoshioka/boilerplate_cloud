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
