import { PrismaClient } from '@prisma/client';
import pino from 'pino';
import type { LogContext } from '@boilerplate/shared-types';

const prisma = new PrismaClient();

/** 関数ベース DI – class 禁止 */
export const createContext = (ctx: LogContext) => ({
  db: prisma,
  logger: pino().child(ctx),
  // テスト用コメント追加
});
