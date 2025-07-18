// SPDX-License-Identifier: MIT
import { describe, expect, it, beforeEach } from 'vitest';
import { bazRouter } from '../lib/routers/baz.router';
import { createMockContext } from '../lib/test/helpers';
import { TRPCError } from '@trpc/server';

describe('Baz Router', () => {
  let ctx: ReturnType<typeof createMockContext>;
  let caller: ReturnType<typeof bazRouter.createCaller>;

  beforeEach(() => {
    ctx = createMockContext();
    ctx.userId = 'test-user-id'; // Set authenticated user
    caller = bazRouter.createCaller(ctx);
  });

  describe('list', () => {
    it('should list bazs successfully', async () => {
      const mockItems = [
        { id: '1', name: 'Test 1', createdAt: new Date(), updatedAt: new Date() },
        { id: '2', name: 'Test 2', createdAt: new Date(), updatedAt: new Date() },
      ];

      (ctx.db.baz.findMany as any).mockResolvedValue(mockItems);
      (ctx.db.baz.count as any).mockResolvedValue(2);

      const result = await caller.list({});

      expect(result.items).toHaveLength(2);
      expect(result.pagination.total).toBe(2);
      expect(result.pagination.totalPages).toBe(1);
    });

    it('should handle pagination correctly', async () => {
      (ctx.db.baz.findMany as any).mockResolvedValue([]);
      (ctx.db.baz.count as any).mockResolvedValue(0);

      const result = await caller.list({ page: 2, limit: 10 });

      expect(ctx.db.baz.findMany).toHaveBeenCalledWith({
        where: expect.objectContaining({}),
        skip: 10,
        take: 10,
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should reject unauthenticated requests', async () => {
      ctx.userId = undefined;
      const unauthCaller = bazRouter.createCaller(ctx);

      await expect(unauthCaller.list({})).rejects.toMatchObject({
        code: 'UNAUTHORIZED',
      } as TRPCError);
    });
  });

  describe('get', () => {
    it('should get baz by id', async () => {
      const mockItem = { id: '1', name: 'Test', createdAt: new Date(), updatedAt: new Date() };
      (ctx.db.baz.findFirst as any).mockResolvedValue(mockItem);

      const result = await caller.get({ id: '1' });

      expect(result).toEqual(mockItem);
    });

    it('should throw NOT_FOUND for non-existent baz', async () => {
      (ctx.db.baz.findFirst as any).mockResolvedValue(null);

      await expect(caller.get({ id: 'non-existent' })).rejects.toThrow(TRPCError);
    });
  });

  describe('create', () => {
    it('should create baz successfully', async () => {
      const input = { name: 'New Test' };
      const created = {
        id: '1',
        ...input,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      (ctx.db.baz.create as any).mockResolvedValue(created);

      const result = await caller.create(input);

      expect(result).toEqual(created);
      expect(ctx.db.baz.create).toHaveBeenCalledWith({
        data: expect.objectContaining(input),
      });
    });

    it('should validate input data', async () => {
      const invalidInput = { name: '' }; // Empty name should fail validation

      await expect(caller.create(invalidInput)).rejects.toThrow();
    });
  });

  describe('update', () => {
    it('should update baz successfully', async () => {
      const existing = { id: '1', name: 'Original', createdAt: new Date(), updatedAt: new Date() };
      const updated = { ...existing, name: 'Updated' };

      (ctx.db.baz.findFirst as any).mockResolvedValue(existing);
      (ctx.db.baz.update as any).mockResolvedValue(updated);

      const result = await caller.update({ id: '1', data: { name: 'Updated' } });

      expect(result).toEqual(updated);
    });

    it('should throw NOT_FOUND for non-existent baz', async () => {
      (ctx.db.baz.findFirst as any).mockResolvedValue(null);

      await expect(
        caller.update({ id: 'non-existent', data: { name: 'Updated' } }),
      ).rejects.toThrow(TRPCError);
    });
  });

  describe('delete', () => {
    it('should soft delete baz successfully', async () => {
      const existing = { id: '1', name: 'Test', createdAt: new Date(), updatedAt: new Date() };
      const deleted = { ...existing, deletedAt: new Date() };

      (ctx.db.baz.findFirst as any).mockResolvedValue(existing);
      (ctx.db.baz.update as any).mockResolvedValue(deleted);

      const result = await caller.delete({ id: '1' });

      expect(result).toEqual({ success: true, id: '1' });
      expect(ctx.db.baz.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { deletedAt: expect.any(Date) },
      });
    });

    it('should restore baz successfully', async () => {
      const restored = {
        id: '1',
        name: 'Test',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      (ctx.db.baz.update as any).mockResolvedValue(restored);

      const result = await caller.restore({ id: '1' });

      expect(result).toEqual(restored);
      expect(ctx.db.baz.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { deletedAt: null },
      });
    });
  });

  describe('error handling', () => {
    it('should handle database errors gracefully', async () => {
      (ctx.db.baz.findMany as any).mockRejectedValue(new Error('Database error'));

      await expect(caller.list({})).rejects.toThrow(TRPCError);
    });

    it('should handle validation errors', async () => {
      await expect(caller.get({ id: 'invalid-id' })).rejects.toThrow();
    });
  });
});
