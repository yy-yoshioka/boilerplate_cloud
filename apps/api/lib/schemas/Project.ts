import { z } from 'zod';

// TODO: Prismaスキーマに合わせて調整
export const Project = z.object({
  id: z.string().cuid(),
  // 以下はサンプル。実際のモデルに合わせて修正
  name: z.string().min(1).max(255),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable(),
});

export type Project = z.infer<typeof Project>;

// Input/Output schemas
export const ProjectListInput = z.object({
  page: z.number().int().positive().optional().default(1),
  limit: z.number().int().positive().max(100).optional().default(20),
  search: z.string().optional(),
});

export const ProjectListOutput = z.object({
  items: z.array(Project),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
});

export const ProjectGetInput = z.object({
  id: z.string().cuid(),
});

export const ProjectCreateInput = Project.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
});

export const ProjectUpdateInput = z.object({
  id: z.string().cuid(),
  data: ProjectCreateInput.partial(),
});

export const ProjectUpdateData = ProjectCreateInput.partial();

export const ProjectDeleteInput = z.object({
  id: z.string().cuid(),
});

export const ProjectDeleteOutput = z.object({
  success: z.boolean(),
  id: z.string().cuid(),
});
