// apps/api/__tests__/setup.ts
import { vi } from 'vitest';

// enum モック
vi.mock('@zod-schemas/enums/PlatformRole.schema', () => ({
  PlatformRoleSchema: {
    enum: { USER: 'USER', ADMIN: 'ADMIN', SUPER_ADMIN: 'SUPER_ADMIN' },
  },
}));

// Account エンティティの簡易モック
vi.mock('@shared-types/entities/account', () => ({
  Account: { id: 'mock', email: 'mock@example.com' },
}));
