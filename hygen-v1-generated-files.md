# Hygen v1 生成ファイル一覧

このドキュメントは `feat/hygen-v1-implementation` ブランチで作成・変更されたファイルをまとめたものです。

## 目次

1. [Hygen設定ファイル](#hygen設定ファイル)
2. [Hygenテンプレート](#hygenテンプレート)
3. [ユーティリティファイル](#ユーティリティファイル)
4. [CLIスクリプト](#cliスクリプト)
5. [CI/CD設定](#cicd設定)
6. [サンプル生成ファイル](#サンプル生成ファイル)

## Hygen設定ファイル

### `/hygen.js`

```javascript
const changeCase = require('change-case');

module.exports = {
  helpers: {
    changeCase,
    // ショートハンド（後方互換性）
    pascal: (str) => changeCase.pascalCase(str),
    camel: (str) => changeCase.camelCase(str),
    kebab: (str) => changeCase.kebabCase(str),

    // プロジェクト設定
    config: {
      trpcPath: '@boilerplate/trpc',
      utilsPath: '@boilerplate/shared-utils',
      typesPath: '@boilerplate/shared-types',
    },
  },
};
```

## Hygenテンプレート

### `/_templates/api/new/prompt.js`

対話型・非対話型の両方に対応したプロンプト設定。

```javascript
const minimist = require('minimist');

module.exports = {
  prompt: ({ inquirer, args }) => {
    // Hygenのargs.rawを使用（process.argvの直接参照を避ける）
    const argv = minimist(args.raw || []);

    // CI/CD用: 必須引数チェック
    if (argv.model) {
      // withSoftDeleteは明示的な指定を要求
      if (argv.withSoftDelete === undefined) {
        throw new Error('--withSoftDelete true|false is required in non-interactive mode');
      }

      // 文字列と真偽値の両方に対応
      const withSoftDelete = argv.withSoftDelete === true || argv.withSoftDelete === 'true';

      return {
        model: argv.model,
        withSoftDelete,
        searchableFields: argv.searchableFields || 'name',
        access: argv.access || 'protected', // デフォルトはprotected
      };
    }

    // 対話モード
    return inquirer.prompt([
      {
        type: 'input',
        name: 'model',
        message: 'Model name (PascalCase, e.g., Project, OrganizationMember):',
        validate: (v) => {
          if (!v.length) return 'Model name is required';
          if (!/^[A-Z][a-zA-Z0-9]*$/.test(v)) {
            return 'Must be PascalCase (e.g., Project, OrganizationMember)';
          }
          return true;
        },
      },
      {
        type: 'list',
        name: 'access',
        message: 'Access level:',
        choices: ['public', 'protected', 'admin'],
        default: 'protected',
      },
      {
        type: 'confirm',
        name: 'withSoftDelete',
        message: 'Include soft delete functionality?',
        default: false, // デフォルトをfalseに変更（明示的な選択を促す）
      },
      {
        type: 'input',
        name: 'searchableFields',
        message: 'Searchable fields (comma-separated):',
        default: 'name',
      },
    ]);
  },
};
```

### `/_templates/api/new/router.ts.ejs`

tRPCルーターテンプレート。アクセス制御に対応。

```typescript
---
to: apps/api/lib/routers/<%= h.changeCase.camel(model) %>.router.ts
---
import { z } from 'zod';
<% if (access === 'public') { %>
import { publicProcedure, router } from '../trpc/server';
<% } else if (access === 'protected') { %>
import { protectedProcedure, router } from '../trpc/server';
<% } else if (access === 'admin') { %>
import { adminProcedure, router } from '../trpc/server';
<% } else { %>
// Fallback to protected for security
import { protectedProcedure, router } from '../trpc/server';
<% } %>
import { create<%= model %>Service } from '../services/<%= h.changeCase.camel(model) %>.service';
import * as S from '../schemas/<%= h.changeCase.camel(model) %>';
import { createStandardError } from '../utils/errors';

<%
const procedureName = access === 'public' ? 'publicProcedure' :
                     access === 'admin' ? 'adminProcedure' :
                     'protectedProcedure';
%>

export const <%= h.changeCase.camel(model) %>Router = router({
  list: <%= procedureName %>
    .input(S.<%= model %>ListInput)
    .output(S.<%= model %>ListOutput)
    .query(async ({ input, ctx }) => {
      const service = create<%= model %>Service(ctx);
      return service.list(input);
    }),

  get: <%= procedureName %>
    .input(S.<%= model %>GetInput)
    .output(S.<%= model %>)
    .query(async ({ input, ctx }) => {
      const service = create<%= model %>Service(ctx);
      const result = await service.get(input.id);
      if (!result) throw createStandardError('NOT_FOUND');
      return result;
    }),

  create: <%= procedureName %>
    .input(S.<%= model %>CreateInput)
    .output(S.<%= model %>)
    .mutation(async ({ input, ctx }) => {
      const service = create<%= model %>Service(ctx);
      return service.create(input);
    }),

  update: <%= procedureName %>
    .input(S.<%= model %>UpdateInput)
    .output(S.<%= model %>)
    .mutation(async ({ input, ctx }) => {
      const service = create<%= model %>Service(ctx);
      const result = await service.update(input.id, input.data);
      if (!result) throw createStandardError('NOT_FOUND');
      return result;
    }),
<% if (withSoftDelete) { %>

  delete: <%= procedureName %>
    .input(S.<%= model %>DeleteInput)
    .output(S.<%= model %>DeleteOutput)
    .mutation(async ({ input, ctx }) => {
      const service = create<%= model %>Service(ctx);
      await service.softDelete(input.id);
      return { success: true, id: input.id };
    }),

  // Restore typically requires admin access
  restore: <%= access === 'admin' ? 'adminProcedure' : procedureName %>
    .input(S.<%= model %>DeleteInput)
    .output(S.<%= model %>)
    .mutation(async ({ input, ctx }) => {
      const service = create<%= model %>Service(ctx);
      const result = await service.restore(input.id);
      if (!result) throw createStandardError('NOT_FOUND');
      return result;
    }),
<% } else { %>

  // Hard delete typically requires admin access
  delete: <%= access === 'admin' ? 'adminProcedure' : 'adminProcedure' %>
    .input(S.<%= model %>DeleteInput)
    .output(S.<%= model %>DeleteOutput)
    .mutation(async ({ input, ctx }) => {
      const service = create<%= model %>Service(ctx);
      await service.hardDelete(input.id);
      return { success: true, id: input.id };
    }),
<% } %>
});
```

### `/_templates/api/new/service.ts.ejs`

ビジネスロジックを実装するサービス層テンプレート。

```typescript
---
to: apps/api/lib/services/<%= h.changeCase.camel(model) %>.service.ts
---
import type { Context } from '../types/context';
import type * as S from '../schemas/<%= h.changeCase.camel(model) %>';
import { createStandardError } from '../utils/errors';

export const create<%= model %>Service = (ctx: Context) => {
  const { db, logger, userId } = ctx;

  // 型安全な検索フィールド定義
  const searchFields = [<%= searchableFields.split(',').map(f => `'${f.trim()}'`).join(', ') %>] as const;

  // 認証チェック
  const ensureAuthenticated = () => {
    if (!userId) {
      throw createStandardError('UNAUTHORIZED');
    }
  };

  return {
    async list(input: S.<%= model %>ListInput) {
      <% if (access !== 'public') { %>ensureAuthenticated();<% } %>

      const { page = 1, limit = 20, search } = input;

      // 入力値の検証
      if (page < 1) throw createStandardError('VALIDATION_ERROR');
      if (limit < 1 || limit > 100) throw createStandardError('VALIDATION_ERROR');

      const where = {
<% if (withSoftDelete) { %>        deletedAt: null,<% } %>
        <% if (access !== 'public') { %>// TODO: Add user/organization filtering based on your data model<% } %>
        ...(search && {
          OR: searchFields.map(field => ({
            [field]: { contains: search, mode: 'insensitive' as const }
          }))
        }),
      };

      try {
        const [items, total] = await Promise.all([
          db.<%= h.changeCase.camel(model) %>.findMany({
            where,
            skip: (page - 1) * limit,
            take: limit,
            orderBy: { createdAt: 'desc' },
          }),
          db.<%= h.changeCase.camel(model) %>.count({ where }),
        ]);

        return {
          items,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
        };
      } catch (error: any) {
        logger.error({ model: '<%= model %>', action: 'list', error: error.message });
        throw createStandardError('INTERNAL_ERROR');
      }
    },

    async get(id: string) {
      <% if (access !== 'public') { %>ensureAuthenticated();<% } %>

      if (!id) throw createStandardError('VALIDATION_ERROR');

      try {
        return await db.<%= h.changeCase.camel(model) %>.findFirst({
          where: { id<% if (withSoftDelete) { %>, deletedAt: null<% } %> },
        });
      } catch (error: any) {
        logger.error({ model: '<%= model %>', action: 'get', id, error: error.message });
        throw createStandardError('INTERNAL_ERROR');
      }
    },

    async create(data: S.<%= model %>CreateInput) {
      <% if (access !== 'public') { %>ensureAuthenticated();<% } %>

      logger.info({ model: '<%= model %>', action: 'create', userId });

      try {
        return await db.<%= h.changeCase.camel(model) %>.create({
          data: {
            ...data,
            <% if (access !== 'public') { %>// TODO: Add user/organization association<% } %>
          }
        });
      } catch (error: any) {
        logger.error({ model: '<%= model %>', action: 'create', error: error.message });

        // P2002: Unique constraint failed
        if (error?.code === 'P2002') {
          throw createStandardError('CONFLICT');
        }
        throw createStandardError('INTERNAL_ERROR');
      }
    },

    async update(id: string, data: S.<%= model %>UpdateData) {
      <% if (access !== 'public') { %>ensureAuthenticated();<% } %>

      if (!id) throw createStandardError('VALIDATION_ERROR');

      const existing = await this.get(id);
      if (!existing) throw createStandardError('NOT_FOUND');

      logger.info({ model: '<%= model %>', action: 'update', id, userId });

      try {
        // Prismaの@updatedAtに任せるため、updatedAtは渡さない
        const { updatedAt, ...updateData } = data as any;

        return await db.<%= h.changeCase.camel(model) %>.update({
          where: { id },
          data: updateData,
        });
      } catch (error: any) {
        logger.error({ model: '<%= model %>', action: 'update', id, error: error.message });
        throw createStandardError('INTERNAL_ERROR');
      }
    },
<% if (withSoftDelete) { %>

    async softDelete(id: string) {
      <% if (access !== 'public') { %>ensureAuthenticated();<% } %>

      if (!id) throw createStandardError('VALIDATION_ERROR');

      const existing = await this.get(id);
      if (!existing) throw createStandardError('NOT_FOUND');

      logger.info({ model: '<%= model %>', action: 'softDelete', id, userId });

      try {
        return await db.<%= h.changeCase.camel(model) %>.update({
          where: { id },
          data: { deletedAt: new Date() },
        });
      } catch (error: any) {
        logger.error({ model: '<%= model %>', action: 'softDelete', id, error: error.message });
        throw createStandardError('INTERNAL_ERROR');
      }
    },

    async restore(id: string) {
      <% if (access !== 'public') { %>ensureAuthenticated();<% } %>

      if (!id) throw createStandardError('VALIDATION_ERROR');

      logger.info({ model: '<%= model %>', action: 'restore', id, userId });

      try {
        return await db.<%= h.changeCase.camel(model) %>.update({
          where: { id },
          data: { deletedAt: null },
        });
      } catch (error: any) {
        logger.error({ model: '<%= model %>', action: 'restore', id, error: error.message });
        throw createStandardError('INTERNAL_ERROR');
      }
    },
<% } %>

    async hardDelete(id: string) {
      <% if (access !== 'public') { %>ensureAuthenticated();<% } %>

      if (!id) throw createStandardError('VALIDATION_ERROR');

      logger.warn({ model: '<%= model %>', action: 'hardDelete', id, userId });

      try {
        return await db.<%= h.changeCase.camel(model) %>.delete({ where: { id } });
      } catch (error: any) {
        logger.error({ model: '<%= model %>', action: 'hardDelete', id, error: error.message });

        // P2003: Foreign key constraint failed
        if (error?.code === 'P2003') {
          throw createStandardError('CONFLICT');
        }
        // P2025: Record not found
        if (error?.code === 'P2025') {
          throw createStandardError('NOT_FOUND');
        }
        throw createStandardError('INTERNAL_ERROR');
      }
    },
  };
};
```

### `/_templates/api/new/schema.ts.ejs`

Zodスキーマテンプレート。厳密な型定義とバリデーションを提供。

```typescript
---
to: apps/api/lib/schemas/<%= h.changeCase.camel(model) %>.ts
---
import { z } from 'zod';

// Common validation patterns
const IdSchema = z.string().cuid('Invalid ID format');
const EmailSchema = z.string().email('Invalid email format');
const NameSchema = z.string().min(1, 'Name is required').max(255, 'Name too long');
const SlugSchema = z.string().regex(/^[a-z0-9-]+$/, 'Invalid slug format');

// TODO: Prismaスキーマに合わせて調整
export const <%= model %> = z.object({
  id: IdSchema,
  // 以下はサンプル。実際のモデルに合わせて修正
  name: NameSchema,
  slug: SlugSchema.optional(),
  description: z.string().max(1000, 'Description too long').optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'DRAFT']).default('ACTIVE'),
  createdAt: z.date(),
  updatedAt: z.date(),
<% if (withSoftDelete) { %>  deletedAt: z.date().nullable(),<% } %>

  // TODO: Add user/organization relationships
  <% if (access !== 'public') { %>
  createdBy: IdSchema.optional(),
  organizationId: IdSchema.optional(),
  <% } %>
});

export type <%= model %> = z.infer<typeof <%= model %>>;

// Input/Output schemas with strict validation
export const <%= model %>ListInput = z.object({
  page: z.number().int().positive().max(1000).optional().default(1),
  limit: z.number().int().positive().max(100).optional().default(20),
  search: z.string().min(1).max(255).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'DRAFT']).optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'name']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

export const <%= model %>ListOutput = z.object({
  items: z.array(<%= model %>),
  pagination: z.object({
    page: z.number().int().positive(),
    limit: z.number().int().positive(),
    total: z.number().int().min(0),
    totalPages: z.number().int().min(0),
  }),
});

export const <%= model %>GetInput = z.object({
  id: IdSchema,
});

export const <%= model %>CreateInput = <%= model %>.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
<% if (withSoftDelete) { %>  deletedAt: true,<% } %>
  <% if (access !== 'public') { %>
  createdBy: true, // Will be set from context
  <% } %>
}).strict(); // Prevent unknown properties

export const <%= model %>UpdateInput = z.object({
  id: IdSchema,
  data: <%= model %>CreateInput.partial().strict(),
});

export const <%= model %>UpdateData = <%= model %>CreateInput.partial().strict();

export const <%= model %>DeleteInput = z.object({
  id: IdSchema,
});

export const <%= model %>DeleteOutput = z.object({
  success: z.boolean(),
  id: IdSchema,
});

// Additional validation helpers
export const validate<%= model %>Name = (name: string) => NameSchema.safeParse(name);
export const validate<%= model %>Id = (id: string) => IdSchema.safeParse(id);
```

### `/_templates/api/new/test.spec.ts.ejs`

包括的なテストテンプレート。

```typescript
---
to: apps/api/__tests__/<%= h.changeCase.camel(model) %>.spec.ts
---
import { describe, expect, it, beforeEach } from 'vitest';
import { <%= h.changeCase.camel(model) %>Router } from '../lib/routers/<%= h.changeCase.camel(model) %>.router';
import { createMockContext } from '../lib/test/helpers';
import { TRPCError } from '@trpc/server';

describe('<%= model %> Router', () => {
  let ctx: ReturnType<typeof createMockContext>;
  let caller: ReturnType<typeof <%= h.changeCase.camel(model) %>Router.createCaller>;

  beforeEach(() => {
    ctx = createMockContext();
    <% if (access !== 'public') { %>ctx.userId = 'test-user-id'; // Set authenticated user<% } %>
    caller = <%= h.changeCase.camel(model) %>Router.createCaller(ctx);
  });

  describe('list', () => {
    it('should list <%= h.changeCase.camel(model) %>s successfully', async () => {
      const mockItems = [
        { id: '1', name: 'Test 1', createdAt: new Date(), updatedAt: new Date() },
        { id: '2', name: 'Test 2', createdAt: new Date(), updatedAt: new Date() }
      ];

      ctx.db.<%= h.changeCase.camel(model) %>.findMany.mockResolvedValue(mockItems);
      ctx.db.<%= h.changeCase.camel(model) %>.count.mockResolvedValue(2);

      const result = await caller.list({});

      expect(result.items).toHaveLength(2);
      expect(result.pagination.total).toBe(2);
      expect(result.pagination.totalPages).toBe(1);
    });

    it('should handle pagination correctly', async () => {
      ctx.db.<%= h.changeCase.camel(model) %>.findMany.mockResolvedValue([]);
      ctx.db.<%= h.changeCase.camel(model) %>.count.mockResolvedValue(0);

      const result = await caller.list({ page: 2, limit: 10 });

      expect(ctx.db.<%= h.changeCase.camel(model) %>.findMany).toHaveBeenCalledWith({
        where: expect.objectContaining({}),
        skip: 10,
        take: 10,
        orderBy: { createdAt: 'desc' }
      });
    });

    <% if (access !== 'public') { %>
    it('should reject unauthenticated requests', async () => {
      ctx.userId = undefined;
      const unauthenticatedCaller = <%= h.changeCase.camel(model) %>Router.createCaller(ctx);

      await expect(unauthenticatedCaller.list({})).rejects.toThrow(TRPCError);
    });
    <% } %>
  });

  describe('get', () => {
    it('should get <%= h.changeCase.camel(model) %> by id', async () => {
      const mockItem = { id: '1', name: 'Test', createdAt: new Date(), updatedAt: new Date() };
      ctx.db.<%= h.changeCase.camel(model) %>.findFirst.mockResolvedValue(mockItem);

      const result = await caller.get({ id: '1' });

      expect(result).toEqual(mockItem);
    });

    it('should throw NOT_FOUND for non-existent <%= h.changeCase.camel(model) %>', async () => {
      ctx.db.<%= h.changeCase.camel(model) %>.findFirst.mockResolvedValue(null);

      await expect(caller.get({ id: 'non-existent' })).rejects.toThrow(TRPCError);
    });
  });

  describe('create', () => {
    it('should create <%= h.changeCase.camel(model) %> successfully', async () => {
      const input = { name: 'New Test' };
      const created = {
        id: '1',
        ...input,
        createdAt: new Date(),
        updatedAt: new Date()<% if (withSoftDelete) { %>,
        deletedAt: null<% } %>
      };

      ctx.db.<%= h.changeCase.camel(model) %>.create.mockResolvedValue(created);

      const result = await caller.create(input);

      expect(result).toEqual(created);
      expect(ctx.db.<%= h.changeCase.camel(model) %>.create).toHaveBeenCalledWith({
        data: expect.objectContaining(input)
      });
    });

    it('should validate input data', async () => {
      const invalidInput = { name: '' }; // Empty name should fail validation

      await expect(caller.create(invalidInput)).rejects.toThrow();
    });
  });

  describe('update', () => {
    it('should update <%= h.changeCase.camel(model) %> successfully', async () => {
      const existing = { id: '1', name: 'Original', createdAt: new Date(), updatedAt: new Date() };
      const updated = { ...existing, name: 'Updated' };

      ctx.db.<%= h.changeCase.camel(model) %>.findFirst.mockResolvedValue(existing);
      ctx.db.<%= h.changeCase.camel(model) %>.update.mockResolvedValue(updated);

      const result = await caller.update({ id: '1', data: { name: 'Updated' } });

      expect(result).toEqual(updated);
    });

    it('should throw NOT_FOUND for non-existent <%= h.changeCase.camel(model) %>', async () => {
      ctx.db.<%= h.changeCase.camel(model) %>.findFirst.mockResolvedValue(null);

      await expect(caller.update({ id: 'non-existent', data: { name: 'Updated' } }))
        .rejects.toThrow(TRPCError);
    });
  });

  describe('delete', () => {
    <% if (withSoftDelete) { %>
    it('should soft delete <%= h.changeCase.camel(model) %> successfully', async () => {
      const existing = { id: '1', name: 'Test', createdAt: new Date(), updatedAt: new Date() };
      const deleted = { ...existing, deletedAt: new Date() };

      ctx.db.<%= h.changeCase.camel(model) %>.findFirst.mockResolvedValue(existing);
      ctx.db.<%= h.changeCase.camel(model) %>.update.mockResolvedValue(deleted);

      const result = await caller.delete({ id: '1' });

      expect(result).toEqual({ success: true, id: '1' });
      expect(ctx.db.<%= h.changeCase.camel(model) %>.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { deletedAt: expect.any(Date) }
      });
    });

    it('should restore <%= h.changeCase.camel(model) %> successfully', async () => {
      const restored = { id: '1', name: 'Test', createdAt: new Date(), updatedAt: new Date(), deletedAt: null };

      ctx.db.<%= h.changeCase.camel(model) %>.update.mockResolvedValue(restored);

      const result = await caller.restore({ id: '1' });

      expect(result).toEqual(restored);
      expect(ctx.db.<%= h.changeCase.camel(model) %>.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { deletedAt: null }
      });
    });
    <% } else { %>
    it('should hard delete <%= h.changeCase.camel(model) %> successfully', async () => {
      const deleted = { id: '1', name: 'Test', createdAt: new Date(), updatedAt: new Date() };

      ctx.db.<%= h.changeCase.camel(model) %>.delete.mockResolvedValue(deleted);

      const result = await caller.delete({ id: '1' });

      expect(result).toEqual({ success: true, id: '1' });
      expect(ctx.db.<%= h.changeCase.camel(model) %>.delete).toHaveBeenCalledWith({
        where: { id: '1' }
      });
    });
    <% } %>
  });

  describe('error handling', () => {
    it('should handle database errors gracefully', async () => {
      ctx.db.<%= h.changeCase.camel(model) %>.findMany.mockRejectedValue(new Error('Database error'));

      await expect(caller.list({})).rejects.toThrow(TRPCError);
    });

    it('should handle validation errors', async () => {
      await expect(caller.get({ id: 'invalid-id' })).rejects.toThrow();
    });
  });
});
```

### `/_templates/README.md`

テンプレートの使用方法ドキュメント。

```markdown
# API Generator

## Quick Start

\`\`\`bash

# 対話型

yarn gen:api

# 非対話型（推奨）

yarn gen:api User
yarn gen:api Post --no-soft-delete
yarn gen:api Product --fields=name,sku,price
\`\`\`

## 生成ファイル

- \`routers/<model>.router.ts\` - tRPCルーター
- \`services/<model>.service.ts\` - ビジネスロジック
- \`schemas/<model>.ts\` - Zodスキーマ
- \`**tests**/<model>.spec.ts\` - テスト

## 生成後の手順

1. Prismaスキーマ更新
2. \`yarn prisma generate\`
3. schema.tsを実際のフィールドに修正
4. \`yarn test <model>\`
5. \`yarn lint:fix\`
```

## ユーティリティファイル

### `/apps/api/lib/types/context.ts`

Context型定義の拡張。

```typescript
// 既存の型定義に追加
// Hygen用Context型
import type { PrismaClient } from '@prisma/client';
import type { Logger } from 'pino';

export interface Context {
  db: PrismaClient;
  logger: Logger;
  userId?: string;
  organizationId?: string;
}
```

### `/apps/api/lib/utils/errors.ts`

標準エラー作成ユーティリティ。

```typescript
import { ERROR, ErrorMessages } from '@boilerplate/shared-types';
import { TRPCError } from '@trpc/server';

// HTTP status mapping for TRPC errors
const httpStatusMap = {
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  INVALID_CREDENTIALS: 'UNAUTHORIZED',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  VALIDATION_ERROR: 'BAD_REQUEST',
  INTERNAL_ERROR: 'INTERNAL_SERVER_ERROR',
} as const;

// 2. Fallback メッセージ
const defaultMessage = ErrorMessages.INTERNAL_ERROR;

export const createStandardError = (code: keyof typeof ERROR): TRPCError => {
  return new TRPCError({
    code: httpStatusMap[code] as any,
    message: ErrorMessages[code] ?? defaultMessage,
  });
};
```

### `/apps/api/lib/test/helpers.ts`

テスト用モックヘルパー関数。

```typescript
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
```

## CLIスクリプト

### `/scripts/gen-api.ts`

API生成CLIスクリプト。

```typescript
#!/usr/bin/env ts-node

import { execa } from 'execa';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import * as changeCase from 'change-case';

const checkPrismaModel = (modelName: string): boolean => {
  try {
    const schemaPath = join(process.cwd(), 'prisma', 'schema.prisma');
    const schema = readFileSync(schemaPath, 'utf-8');
    const modelRegex = new RegExp(\`model\\s+\${modelName}\\s*{\`, 'i');
    return modelRegex.test(schema);
  } catch {
    return false;
  }
};

const main = async () => {
  const [model, ...args] = process.argv.slice(2);

  if (!model || !/^[A-Z][a-zA-Z0-9]*$/.test(model)) {
    console.error('Usage: yarn gen:api <ModelName> [options]');
    console.error('Options:');
    console.error(
      '  --access=level       Set access level (public, protected, admin) [default: protected]',
    );
    console.error('  --no-soft-delete     Disable soft delete');
    console.error('  --fields=name,email  Specify searchable fields');
    console.error('  --no-verify          Skip git hooks (CI only)');
    process.exit(1);
  }

  const withSoftDelete = !args.includes('--no-soft-delete');
  const searchableFields = args.find((a) => a.startsWith('--fields='))?.split('=')[1] || 'name';
  const access = args.find((a) => a.startsWith('--access='))?.split('=')[1] || 'protected';
  const skipVerify = args.includes('--no-verify') && process.env.CI === 'true';

  // Access level validation
  if (!['public', 'protected', 'admin'].includes(access)) {
    console.error('❌ Invalid access level. Must be one of: public, protected, admin');
    process.exit(1);
  }

  // changeCase.camelCaseで統一
  const camelModel = changeCase.camelCase(model);

  console.log(\`🚀 Generating \${model} API\`);
  console.log(\`   Access level: \${access}\`);
  console.log(\`   Soft delete: \${withSoftDelete}\`);
  console.log(\`   Searchable: \${searchableFields}\`);

  // Prismaモデルチェック
  if (!checkPrismaModel(model)) {
    console.warn(\`⚠️  Warning: Model '\${model}' not found in schema.prisma\`);
    console.warn(\`   Please add the model to your Prisma schema before running migrations\`);
  }

  try {
    // Hygenを実行
    await execa(
      'yarn',
      [
        'hygen',
        'api',
        'new',
        '--model',
        model,
        '--withSoftDelete',
        String(withSoftDelete),
        '--searchableFields',
        searchableFields,
        '--access',
        access,
      ],
      { stdio: 'inherit' },
    );

    // 生成されたファイルパス（camelCaseで統一）
    const generatedFiles = [
      join('apps/api/lib/routers', \`\${camelModel}.router.ts\`),
      join('apps/api/lib/services', \`\${camelModel}.service.ts\`),
      join('apps/api/lib/schemas', \`\${camelModel}.ts\`),
      join('apps/api/__tests__', \`\${camelModel}.spec.ts\`),
    ];

    // ファイル確認
    const missingFiles = generatedFiles.filter((f) => !existsSync(f));
    if (missingFiles.length > 0) {
      throw new Error(\`Generation failed. Missing files: \${missingFiles.join(', ')}\`);
    }

    // Git add（生成ファイルのみ）
    await execa('git', ['add', ...generatedFiles]);

    // ESLint fix
    console.log('🔧 Running ESLint fix...');
    await execa('yarn', ['eslint', '--fix', ...generatedFiles], {
      stdio: 'inherit',
      reject: false, // ESLintエラーでもプロセスを続行
    });

    // Git commit
    const commitArgs = ['commit', '-m', \`scaffold(\${camelModel}): add \${model} api\`];

    if (skipVerify) {
      commitArgs.push('--no-verify');
    }

    await execa('git', commitArgs);

    console.log(\`
✅ Success! \${model} API scaffolded.

📝 Next steps:
   1. Update Prisma schema with \${model} model
   2. yarn prisma generate
   3. Update generated \${camelModel}.ts schema with actual fields
   4. Fix any remaining lint errors: yarn lint:fix
   5. Run tests: yarn test \${camelModel}
\`);
  } catch (error: any) {
    console.error('❌ Failed:', error.message);
    process.exit(1);
  }
};

main();
```

## CI/CD設定

### `/.github/workflows/scaffold-e2e.yml`

GitHub ActionsによるE2Eテスト。

```yaml
name: Scaffold E2E

on:
  pull_request:
    paths:
      - '_templates/**'
      - 'scripts/gen-api.ts'
      - 'hygen.js'

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'yarn'

      - run: yarn install --frozen-lockfile

      - name: Test generation
        run: |
          yarn gen:api TestModel --no-soft-delete --fields=name
          test -f apps/api/lib/routers/testModel.router.ts
          test -f apps/api/lib/services/testModel.service.ts
          test -f apps/api/lib/schemas/testModel.ts
          test -f apps/api/__tests__/testModel.spec.ts
```

## サンプル生成ファイル

### `/apps/api/lib/routers/project.router.ts`

生成されたProjectルーターの例。

```typescript
import { z } from 'zod';
import { publicProcedure, router } from '../trpc/server';
import { createProjectService } from '../services/project.service';
import * as S from '../schemas/project';
import { createStandardError } from '../utils/errors';

export const projectRouter = router({
  list: publicProcedure
    .input(S.ProjectListInput)
    .output(S.ProjectListOutput)
    .query(async ({ input, ctx }) => {
      const service = createProjectService(ctx);
      return service.list(input);
    }),

  get: publicProcedure
    .input(S.ProjectGetInput)
    .output(S.Project)
    .query(async ({ input, ctx }) => {
      const service = createProjectService(ctx);
      const result = await service.get(input.id);
      if (!result) throw createStandardError('NOT_FOUND');
      return result;
    }),

  create: publicProcedure
    .input(S.ProjectCreateInput)
    .output(S.Project)
    .mutation(async ({ input, ctx }) => {
      const service = createProjectService(ctx);
      return service.create(input);
    }),

  update: publicProcedure
    .input(S.ProjectUpdateInput)
    .output(S.Project)
    .mutation(async ({ input, ctx }) => {
      const service = createProjectService(ctx);
      const result = await service.update(input.id, input.data);
      if (!result) throw createStandardError('NOT_FOUND');
      return result;
    }),

  delete: publicProcedure
    .input(S.ProjectDeleteInput)
    .output(S.ProjectDeleteOutput)
    .mutation(async ({ input, ctx }) => {
      const service = createProjectService(ctx);
      await service.softDelete(input.id);
      return { success: true, id: input.id };
    }),
});
```

### 他の生成ファイル

- `/apps/api/lib/services/project.service.ts`
- `/apps/api/lib/schemas/project.ts`
- `/apps/api/__tests__/project.spec.ts`

## package.json の更新

新しいスクリプトと依存関係が追加されました：

```json
{
  "scripts": {
    "gen:api": "ts-node scripts/gen-api.ts",
    "lint:fix": "eslint . --fix",
    "prisma:format": "prisma format"
  },
  "devDependencies": {
    "@types/minimist": "^1.2.5",
    "change-case": "^5.4.4",
    "execa": "^9.6.0",
    "minimist": "^1.2.8"
  },
  "dependencies": {
    "@trpc/server": "^11.4.3"
  }
}
```

## 使用方法

### 対話型

```bash
yarn gen:api
```

### 非対話型（推奨）

```bash
# 基本的な使用法
yarn gen:api User

# アクセス制御とsoft delete無効化
yarn gen:api Post --access=admin --no-soft-delete

# 検索可能フィールドの指定
yarn gen:api Product --fields=name,sku,price --access=protected
```

### オプション

- `--access=level` - アクセスレベル設定 (public, protected, admin) [デフォルト: protected]
- `--no-soft-delete` - ソフトデリートを無効化
- `--fields=name,email` - 検索可能なフィールドを指定
- `--no-verify` - Gitフックをスキップ（CI環境用）

## 主な改善点

1. **セキュリティ強化**
   - アクセス制御レベルの導入（public, protected, admin）
   - 認証チェック機能
   - 厳密な入力値検証

2. **型安全性向上**
   - strict()モードによる未知プロパティの防止
   - 包括的な型定義
   - バリデーションヘルパー関数

3. **エラーハンドリング**
   - Prismaエラーコード対応
   - 詳細なログ出力
   - 適切なHTTPステータスマッピング

4. **テストカバレッジ**
   - 認証テスト
   - エラーハンドリングテスト
   - ページネーションテスト

5. **CI/CD対応**
   - 非対話型実行のサポート
   - GitHub Actions E2Eテスト
   - ESLint自動修正

このHygen v1実装により、一貫性のある、セキュアで保守しやすいAPIコードを素早く生成できるようになりました。
