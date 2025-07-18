// SPDX-License-Identifier: MIT
import { z } from 'zod';

import { publicProcedure, router } from '../trpc/server';

import { createFooService } from '../services/foo.service';
import * as S from '../schemas/foo';
import { createStandardError, ERROR_CODES } from '../utils/errors';

export const fooRouter = router({
  list: publicProcedure
    .input(S.FooListInput)
    .output(S.FooListOutput)
    .query(async ({ input, ctx }) => {
      const service = createFooService(ctx);
      return service.list(input);
    }),

  get: publicProcedure
    .input(S.FooGetInput)
    .output(S.Foo)
    .query(async ({ input, ctx }) => {
      const service = createFooService(ctx);
      const result = await service.get(input.id);
      if (!result) throw createStandardError(ERROR_CODES.NOT_FOUND);
      return result;
    }),

  create: publicProcedure
    .input(S.FooCreateInput)
    .output(S.Foo)
    .mutation(async ({ input, ctx }) => {
      const service = createFooService(ctx);
      return service.create(input);
    }),

  update: publicProcedure
    .input(S.FooUpdateInput)
    .output(S.Foo)
    .mutation(async ({ input, ctx }) => {
      const service = createFooService(ctx);
      const result = await service.update(input.id, input.data);
      if (!result) throw createStandardError(ERROR_CODES.NOT_FOUND);
      return result;
    }),

  // Hard delete typically requires admin access
  delete: publicProcedure
    .input(S.FooDeleteInput)
    .output(S.FooDeleteOutput)
    .mutation(async ({ input, ctx }) => {
      const service = createFooService(ctx);
      await service.hardDelete(input.id);
      return { success: true, id: input.id };
    }),
});
