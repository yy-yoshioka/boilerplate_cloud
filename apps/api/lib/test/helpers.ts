import { vi } from 'vitest';
import type { Context } from '../types/context';

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

export const createMockContext = (modelName?: string): Context => {
  const mockDb = new Proxy({} as any, {
    get: (target, prop) => {
      if (typeof prop === 'string' && prop.startsWith('$')) {
        if (prop === '$transaction') return vi.fn((fn) => fn(mockDb));
        if (prop === '$connect' || prop === '$disconnect') return vi.fn();
      }
      
      if (!target[prop]) {
        target[prop] = createMockModel();
      }
      return target[prop];
    },
  });

  const mockLogger = {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
    child: vi.fn(() => mockLogger),
  };

  return {
    db: mockDb,
    logger: mockLogger as any,
  };
};