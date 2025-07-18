// SPDX-License-Identifier: MIT
import { describe, expect, it, beforeEach } from 'vitest';
import { fooRouter } from '../lib/routers/foo.router';
import { createMockContext } from '../lib/test/helpers';
import { TRPCError } from '@trpc/server';

describe('Foo Router', () => {
  let ctx: ReturnType<typeof createMockContext>;
  let caller: ReturnType<typeof fooRouter.createCaller>;

  beforeEach(() => {
    ctx = createMockContext();

    caller = fooRouter.createCaller(ctx);
  });

  describe('list', () => {
    it('should list foos successfully', async () => {
      const mockItems = [
        { id: '1', name: 'Test 1', createdAt: new Date(), updatedAt: new Date() },
        { id: '2', name: 'Test 2', createdAt: new Date(), updatedAt: new Date() },
      ];

      (ctx.db.foo.findMany as any).mockResolvedValue(mockItems);
      (ctx.db.foo.count as any).mockResolvedValue(2);

      const result = await caller.list({});

      expect(result.items).toHaveLength(2);
      expect(result.pagination.total).toBe(2);
      expect(result.pagination.totalPages).toBe(1);
    });

    it('should handle pagination correctly', async () => {
      (ctx.db.foo.findMany as any).mockResolvedValue([]);
      (ctx.db.foo.count as any).mockResolvedValue(0);

      const result = await caller.list({ page: 2, limit: 10 });

      expect(ctx.db.foo.findMany).toHaveBeenCalledWith({
        where: expect.objectContaining({}),
        skip: 10,
        take: 10,
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('get', () => {
    it('should get foo by id', async () => {
      const mockItem = { id: '1', name: 'Test', createdAt: new Date(), updatedAt: new Date() };
      (ctx.db.foo.findFirst as any).mockResolvedValue(mockItem);

      const result = await caller.get({ id: '1' });

      expect(result).toEqual(mockItem);
    });

    it('should throw NOT_FOUND for non-existent foo', async () => {
      (ctx.db.foo.findFirst as any).mockResolvedValue(null);

      await expect(caller.get({ id: 'non-existent' })).rejects.toThrow(TRPCError);
    });
  });

  describe('create', () => {
    it('should create foo successfully', async () => {
      const input = { name: 'New Test' };
      const created = {
        id: '1',
        ...input,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (ctx.db.foo.create as any).mockResolvedValue(created);

      const result = await caller.create(input);

      expect(result).toEqual(created);
      expect(ctx.db.foo.create).toHaveBeenCalledWith({
        data: expect.objectContaining(input),
      });
    });

    it('should validate input data', async () => {
      const invalidInput = { name: '' }; // Empty name should fail validation

      await expect(caller.create(invalidInput)).rejects.toThrow();
    });
  });

  describe('update', () => {
    it('should update foo successfully', async () => {
      const existing = { id: '1', name: 'Original', createdAt: new Date(), updatedAt: new Date() };
      const updated = { ...existing, name: 'Updated' };

      (ctx.db.foo.findFirst as any).mockResolvedValue(existing);
      (ctx.db.foo.update as any).mockResolvedValue(updated);

      const result = await caller.update({ id: '1', data: { name: 'Updated' } });

      expect(result).toEqual(updated);
    });

    it('should throw NOT_FOUND for non-existent foo', async () => {
      (ctx.db.foo.findFirst as any).mockResolvedValue(null);

      await expect(
        caller.update({ id: 'non-existent', data: { name: 'Updated' } }),
      ).rejects.toThrow(TRPCError);
    });
  });

  describe('delete', () => {
    it('should hard delete foo successfully', async () => {
      const deleted = { id: '1', name: 'Test', createdAt: new Date(), updatedAt: new Date() };

      (ctx.db.foo.delete as any).mockResolvedValue(deleted);

      const result = await caller.delete({ id: '1' });

      expect(result).toEqual({ success: true, id: '1' });
      expect(ctx.db.foo.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });
  });

  describe('error handling', () => {
    it('should handle database errors gracefully', async () => {
      (ctx.db.foo.findMany as any).mockRejectedValue(new Error('Database error'));

      await expect(caller.list({})).rejects.toThrow(TRPCError);
    });

    it('should handle validation errors', async () => {
      await expect(caller.get({ id: 'invalid-id' })).rejects.toThrow();
    });
  });
});
