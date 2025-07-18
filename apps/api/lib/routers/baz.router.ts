// SPDX-License-Identifier: MIT
import { z } from 'zod';

import { adminProcedure, router } from '../trpc/server';

import { createBazService } from '../services/baz.service';
import * as S from '../schemas/baz';
import { createStandardError, ERROR_CODES } from '../utils/errors';



export const bazRouter = router({
  list: adminProcedure
    .input(S.BazListInput)
    .output(S.BazListOutput)
    .query(async ({ input, ctx }) => {
      const service = createBazService(ctx);
      return service.list(input);
    }),

  get: adminProcedure
    .input(S.BazGetInput)
    .output(S.Baz)
    .query(async ({ input, ctx }) => {
      const service = createBazService(ctx);
      const result = await service.get(input.id);
      if (!result) throw createStandardError(ERROR_CODES.NOT_FOUND);
      return result;
    }),

  create: adminProcedure
    .input(S.BazCreateInput)
    .output(S.Baz)
    .mutation(async ({ input, ctx }) => {
      const service = createBazService(ctx);
      return service.create(input);
    }),

  update: adminProcedure
    .input(S.BazUpdateInput)
    .output(S.Baz)
    .mutation(async ({ input, ctx }) => {
      const service = createBazService(ctx);
      const result = await service.update(input.id, input.data);
      if (!result) throw createStandardError(ERROR_CODES.NOT_FOUND);
      return result;
    }),


  delete: adminProcedure
    .input(S.BazDeleteInput)
    .output(S.BazDeleteOutput)
    .mutation(async ({ input, ctx }) => {
      const service = createBazService(ctx);
      await service.softDelete(input.id);
      return { success: true, id: input.id };
    }),

  // Restore typically requires admin access
  restore: adminProcedure
    .input(S.BazDeleteInput)
    .output(S.Baz)
    .mutation(async ({ input, ctx }) => {
      const service = createBazService(ctx);
      const result = await service.restore(input.id);
      if (!result) throw createStandardError(ERROR_CODES.NOT_FOUND);
      return result;
    }),

});