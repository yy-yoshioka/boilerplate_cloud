import { jest } from '@jest/globals';
import type { Context } from '../types/context';
import type { PrismaClient } from '@prisma/client';

const createMockModel = () => ({
  findMany: jest.fn(),
  findFirst: jest.fn(),
  findUnique: jest.fn(),
  findUniqueOrThrow: jest.fn(),
  create: jest.fn(),
  createMany: jest.fn(),
  update: jest.fn(),
  updateMany: jest.fn(),
  upsert: jest.fn(),
  delete: jest.fn(),
  deleteMany: jest.fn(),
  count: jest.fn(),
  aggregate: jest.fn(),
  groupBy: jest.fn(),
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
    $transaction: jest.fn((fn: any) => {
      if (typeof fn === 'function') {
        return fn(mockDb);
      }
      return Promise.all(fn as any[]);
    }),
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    $executeRaw: jest.fn(),
    $queryRaw: jest.fn(),
  } as unknown as PrismaClient;

  const mockLogger = {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    fatal: jest.fn(),
    trace: jest.fn(),
    child: jest.fn(() => mockLogger),
  };

  return {
    db: mockDb,
    logger: mockLogger as any,
  };
};

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
