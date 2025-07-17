import { PrismaClient } from '@prisma/client';
import pino from 'pino';
import type { LogContext } from '@boilerplate/shared-types';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: process.env.NODE_ENV === 'development' ? { target: 'pino-pretty' } : undefined,
});

const prisma = new PrismaClient({
  log: [
    { emit: 'event', level: 'error' },
    { emit: 'event', level: 'warn' },
    { emit: 'event', level: 'info' },
  ],
});

// Prismaエラーイベントのハンドリング
prisma.$on('error', (e) => {
  logger.error({ err: e }, 'Prisma error occurred');
});

prisma.$on('warn', (e) => {
  logger.warn({ warning: e }, 'Prisma warning');
});

prisma.$on('info', (e) => {
  logger.info({ info: e }, 'Prisma info');
});

// クエリロギングミドルウェア
prisma.$use(async (params, next) => {
  const before = Date.now();
  const result = await next(params);
  const after = Date.now();

  logger.debug(
    {
      model: params.model,
      action: params.action,
      duration: after - before,
    },
    'Prisma query executed',
  );

  return result;
});

/** 関数ベース DI – class 禁止 */
export const createContext = (ctx: LogContext) => ({
  db: prisma,
  logger: logger.child(ctx),
});

// グレースフルシャットダウン
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});
