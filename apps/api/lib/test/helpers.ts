import { vi } from 'vitest';
import type { Context } from '../types/context';
import type { PrismaClient } from '@prisma/client';
import { Prisma } from '@prisma/client';

type MockDelegate<T> = {
  [K in keyof T]: T[K] extends (...args: any[]) => any ? ReturnType<typeof vi.fn> : never;
};

const createMockModel = <T>(): MockDelegate<T> =>
  ({
    findMany: vi.fn() as any,
    findFirst: vi.fn() as any,
    findUnique: vi.fn() as any,
    findUniqueOrThrow: vi.fn() as any,
    create: vi.fn() as any,
    createMany: vi.fn() as any,
    update: vi.fn() as any,
    updateMany: vi.fn() as any,
    upsert: vi.fn() as any,
    delete: vi.fn() as any,
    deleteMany: vi.fn() as any,
    count: vi.fn() as any,
    aggregate: vi.fn() as any,
    groupBy: vi.fn() as any,
  }) as any;

export const createMockContext = (focusModel?: string): Context => {
  // Prisma.dmmf からモデル一覧を動的に取得
  const modelNames = Object.keys(Prisma.ModelName)
    .map((key) => Prisma.ModelName[key as keyof typeof Prisma.ModelName])
    .map((name) => name.charAt(0).toLowerCase() + name.slice(1));

  // 全モデルのモックを動的生成
  const models = modelNames.reduce(
    (acc, modelName) => {
      acc[modelName] = createMockModel();
      return acc;
    },
    {} as Record<string, any>,
  );

  const mockDb = {
    ...models,
    $transaction: vi.fn((fn: any) => {
      if (typeof fn === 'function') {
        return fn(mockDb);
      }
      return Promise.all(fn as any[]);
    }),
    $connect: vi.fn(),
    $disconnect: vi.fn(),
    $executeRaw: vi.fn(),
    $queryRaw: vi.fn(),
  } as unknown as PrismaClient;

  const mockLogger = {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
    fatal: vi.fn(),
    trace: vi.fn(),
    child: vi.fn(() => mockLogger),
  };

  return {
    db: mockDb,
    logger: mockLogger as any,
  };
};

/**
 * 型安全にモックモデルを取得するユーティリティ。
 *   const projectModel = getMockModel(ctx, 'project');
 *   projectModel.findMany.mockResolvedValue([...]);
 */
export const getMockModel = <M extends keyof PrismaClient, K extends keyof PrismaClient[M]>(
  ctx: Context,
  modelName: M,
): MockDelegate<PrismaClient[M]> => {
  return (ctx.db as any)[modelName];
};

// ------------------------- 以下はダミーデータ生成 -------------------------
// 特定のモデルに対するモックデータ生成ヘルパー
export const createMockData = {
  account: (override = {}) => ({
    id: 'test-account-id',
    email: 'test@example.com',
    name: 'Test User',
    status: 'ACTIVE',
    role: 'USER',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...override,
  }),

  project: (override = {}) => ({
    id: 'test-project-id',
    name: 'Test Project',
    slug: 'test-project',
    status: 'ACTIVE',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    ...override,
  }),

  // 他のモデルも必要に応じて追加
};
