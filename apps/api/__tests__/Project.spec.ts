import { describe, expect, it, beforeEach } from 'vitest';
import { ProjectRouter } from '../lib/routers/Project.router';
import { createMockContext } from '../lib/test/helpers';

describe('Project Router', () => {
  let ctx: ReturnType<typeof createMockContext>;

  beforeEach(() => {
    ctx = createMockContext();
  });

  it('should list Projects', async () => {
    ctx.db.Project.findMany.mockResolvedValue([]);
    ctx.db.Project.count.mockResolvedValue(0);

    const caller = ProjectRouter.createCaller(ctx);
    const result = await caller.list({});

    expect(result.items).toEqual([]);
    expect(result.pagination.total).toBe(0);
  });

  it('should create Project', async () => {
    const input = { name: 'Test' };
    const created = { id: '1', ...input, createdAt: new Date(), updatedAt: new Date() };

    ctx.db.Project.create.mockResolvedValue(created);

    const caller = ProjectRouter.createCaller(ctx);
    const result = await caller.create(input);

    expect(result).toEqual(created);
  });
});
