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

// Hygen用Context型
import type { PrismaClient } from '@prisma/client';
import type { Logger } from 'pino';

export interface Context {
  db: PrismaClient;
  logger: Logger;
  userId?: string;
  organizationId?: string;
}
