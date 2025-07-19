// Mock missing dependencies for smoke tests
import { vi } from 'vitest';

// Mock PlatformRole schema
vi.mock('@zod-schemas/enums/PlatformRole.schema', () => ({
  PlatformRoleSchema: {
    enum: {
      USER: 'USER',
      ADMIN: 'ADMIN',
      SUPER_ADMIN: 'SUPER_ADMIN',
    },
  },
}));

// Mock account type
vi.mock('@shared-types/entities/account', () => ({
  Account: {},
}));
