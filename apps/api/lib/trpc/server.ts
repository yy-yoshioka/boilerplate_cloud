import { initTRPC } from '@trpc/server';
import type { Context } from '../types/context';

const t = initTRPC.context<Context>().create();

export const router = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use((opts) => {
  if (!opts.ctx.userId) {
    throw new Error('UNAUTHORIZED');
  }
  return opts.next();
});
export const adminProcedure = t.procedure.use((opts) => {
  // Admin check logic should be implemented based on your authorization system
  if (!opts.ctx.userId) {
    throw new Error('UNAUTHORIZED');
  }
  return opts.next();
});
