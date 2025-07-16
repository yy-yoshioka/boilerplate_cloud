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
