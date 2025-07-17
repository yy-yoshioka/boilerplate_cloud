import { z } from 'zod';
import { publicProcedure, router } from '../trpc/server';
import { createProjectService } from '../services/Project.service';
import * as S from '../schemas/Project';
import { createStandardError } from '../utils/errors';

export const ProjectRouter = router({
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
