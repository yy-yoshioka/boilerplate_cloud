import type { Context } from '../types/context';
import type * as S from '../schemas/Project';
import { createStandardError } from '../utils/errors';

export const createProjectService = (ctx: Context) => {
  const { db, logger } = ctx;
  const searchFields = 'name,description'.split(',').map(f => f.trim());

  return {
    async list(input: S.ProjectListInput) {
      const { page = 1, limit = 20, search } = input;
      const where = {
        deletedAt: null,
        ...(search && {
          OR: searchFields.map(field => ({
            [field]: { contains: search, mode: 'insensitive' as const }
          }))
        }),
      };

      const [items, total] = await Promise.all([
        db.Project.findMany({
          where,
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        db.Project.count({ where }),
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
    },

    async get(id: string) {
      return db.Project.findFirst({
        where: { id, deletedAt: null },
      });
    },

    async create(data: S.ProjectCreateInput) {
      logger.info({ model: 'Project', action: 'create' });
      return db.Project.create({ data });
    },

    async update(id: string, data: S.ProjectUpdateData) {
      const existing = await this.get(id);
      if (!existing) throw createStandardError('NOT_FOUND');
      
      logger.info({ model: 'Project', action: 'update', id });
      return db.Project.update({
        where: { id },
        data,
      });
    },

    async softDelete(id: string) {
      const existing = await this.get(id);
      if (!existing) throw createStandardError('NOT_FOUND');
      
      logger.info({ model: 'Project', action: 'softDelete', id });
      return db.Project.update({
        where: { id },
        data: { deletedAt: new Date() },
      });
    },

    async hardDelete(id: string) {
      logger.warn({ model: 'Project', action: 'hardDelete', id });
      return db.Project.delete({ where: { id } });
    },
  };
};