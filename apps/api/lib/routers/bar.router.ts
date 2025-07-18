// SPDX-License-Identifier: MIT
import { z } from 'zod';

import { protectedProcedure, router } from '../trpc/server';

import { createBarService } from '../services/bar.service';
import * as S from '../schemas/bar';
import { createStandardError, ERROR_CODES } from '../utils/errors';



export const barRouter = router({
  list: protectedProcedure
    .input(S.BarListInput)
    .output(S.BarListOutput)
    .query(async ({ input, ctx }) => {
      const service = createBarService(ctx);
      return service.list(input);
    }),

  get: protectedProcedure
    .input(S.BarGetInput)
    .output(S.Bar)
    .query(async ({ input, ctx }) => {
      const service = createBarService(ctx);
      const result = await service.get(input.id);
      if (!result) throw createStandardError(ERROR_CODES.NOT_FOUND);
      return result;
    }),

  create: protectedProcedure
    .input(S.BarCreateInput)
    .output(S.Bar)
    .mutation(async ({ input, ctx }) => {
      const service = createBarService(ctx);
      return service.create(input);
    }),

  update: protectedProcedure
    .input(S.BarUpdateInput)
    .output(S.Bar)
    .mutation(async ({ input, ctx }) => {
      const service = createBarService(ctx);
      const result = await service.update(input.id, input.data);
      if (!result) throw createStandardError(ERROR_CODES.NOT_FOUND);
      return result;
    }),


  delete: protectedProcedure
    .input(S.BarDeleteInput)
    .output(S.BarDeleteOutput)
    .mutation(async ({ input, ctx }) => {
      const service = createBarService(ctx);
      await service.softDelete(input.id);
      return { success: true, id: input.id };
    }),

  // Restore typically requires admin access
  restore: protectedProcedure
    .input(S.BarDeleteInput)
    .output(S.Bar)
    .mutation(async ({ input, ctx }) => {
      const service = createBarService(ctx);
      const result = await service.restore(input.id);
      if (!result) throw createStandardError(ERROR_CODES.NOT_FOUND);
      return result;
    }),

});