import { vi } from 'vitest';
import type { Context } from '../types/context';
import type { PrismaClient } from '@prisma/client';

const createMockModel = () => ({
  findMany: vi.fn(),
  findFirst: vi.fn(),
  findUnique: vi.fn(),
  findUniqueOrThrow: vi.fn(),
  create: vi.fn(),
  createMany: vi.fn(),
  update: vi.fn(),
  updateMany: vi.fn(),
  upsert: vi.fn(),
  delete: vi.fn(),
  deleteMany: vi.fn(),
  count: vi.fn(),
  aggregate: vi.fn(),
  groupBy: vi.fn(),
});

// Prismaの全モデルリスト（実際のschema.prismaに合わせて更新）
const PRISMA_MODELS = [
  'account',
  'authAccount',
  'session',
  'organization',
  'organizationMember',
  'project',
  'environment',
  'environmentVariable',
  'build',
  'deployment',
  'apiKey',
  'secret',
  'auditLog',
  'subscription',
  'invoice',
  'tokenUsage',
  'customization',
  'featureFlag',
  'template',
  'webhookEvent',
  'usage',
];

export const createMockContext = (focusModel?: string): Context => {
  // 全モデルのモックを事前生成
  const models = PRISMA_MODELS.reduce(
    (acc, modelName) => {
      acc[modelName] = createMockModel();
      return acc;
    },
    {} as Record<string, ReturnType<typeof createMockModel>>,
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
export const getMockModel = <K extends keyof PrismaClient>(ctx: Context, modelName: K) => {
  return (ctx.db as PrismaClient)[modelName];
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
