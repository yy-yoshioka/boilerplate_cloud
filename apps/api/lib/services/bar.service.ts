// SPDX-License-Identifier: MIT
import type { Context } from '../types/context';
import type * as S from '../schemas/bar';
import { createStandardError, ERROR_CODES } from '../utils/errors';
import { Prisma } from '@prisma/client';

export const createBarService = (ctx: Context) => {
  const { db, logger, userId } = ctx;
  
  // 型安全な検索フィールド定義
  const searchFields = ['name', 'description'] as const;

  // 認証チェック
  const ensureAuthenticated = () => {
    if (!userId) {
      throw createStandardError(ERROR_CODES.UNAUTHORIZED);
    }
  };

  return {
    async list(input: S.BarListInput) {
      ensureAuthenticated();
      
      const { page = 1, limit = 20, search } = input;
      
      // 入力値の検証
      if (page < 1) throw createStandardError(ERROR_CODES.VALIDATION_ERROR);
      if (limit < 1 || limit > 100) throw createStandardError(ERROR_CODES.VALIDATION_ERROR);
      
      const where = {
        deletedAt: null,
        // Add user/organization filtering based on your data model
        ...(search?.trim() && {
          OR: searchFields.map(field => ({
            [field]: { contains: search, mode: 'insensitive' as const }
          }))
        }),
      };

      try {
        const [items, total] = await Promise.all([
          db.bar.findMany({
            where,
            skip: (page - 1) * limit,
            take: limit,
            orderBy: { createdAt: 'desc' },
          }),
          db.bar.count({ where }),
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
      } catch (error: any) {
        logger.error({ model: 'Bar', action: 'list', error: error.message });
        throw createStandardError(ERROR_CODES.INTERNAL_ERROR);
      }
    },

    async get(id: string) {
      ensureAuthenticated();
      
      if (!id) throw createStandardError(ERROR_CODES.VALIDATION_ERROR);
      
      try {
        return await db.bar.findFirst({
          where: { id, deletedAt: null },
        });
      } catch (error: any) {
        logger.error({ model: 'Bar', action: 'get', id, error: error.message });
        throw createStandardError(ERROR_CODES.INTERNAL_ERROR);
      }
    },

    async create(data: S.BarCreateInput) {
      ensureAuthenticated();
      
      logger.info({ model: 'Bar', action: 'create', userId });
      
      try {
        return await db.bar.create({ 
          data: {
            ...data,
            // Add user/organization association
          } as any // Type assertion needed due to Prisma's strict typing
        });
      } catch (error: unknown) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          if (error.code === 'P2002') throw createStandardError(ERROR_CODES.CONFLICT);
          if (error.code === 'P2003') throw createStandardError(ERROR_CODES.CONFLICT);
          if (error.code === 'P2025') throw createStandardError(ERROR_CODES.NOT_FOUND);
        }
        logger.error({ model: 'Bar', action: 'create', error: error instanceof Error ? error.message : 'Unknown error' });
        throw createStandardError(ERROR_CODES.INTERNAL_ERROR);
      }
    },

    async update(id: string, data: S.BarUpdateData) {
      ensureAuthenticated();
      
      if (!id) throw createStandardError(ERROR_CODES.VALIDATION_ERROR);
      
      const existing = await this.get(id);
      if (!existing) throw createStandardError(ERROR_CODES.NOT_FOUND);
      
      logger.info({ model: 'Bar', action: 'update', id, userId });
      
      try {
        // Prismaの@updatedAtに任せるため、updatedAtは渡さない
        const { updatedAt, ...updateData } = data as any;
        
        return await db.bar.update({
          where: { id },
          data: updateData,
        });
      } catch (error: any) {
        logger.error({ model: 'Bar', action: 'update', id, error: error.message });
        throw createStandardError(ERROR_CODES.INTERNAL_ERROR);
      }
    },


    async softDelete(id: string) {
      ensureAuthenticated();
      
      if (!id) throw createStandardError(ERROR_CODES.VALIDATION_ERROR);
      
      const existing = await this.get(id);
      if (!existing) throw createStandardError(ERROR_CODES.NOT_FOUND);
      
      logger.info({ model: 'Bar', action: 'softDelete', id, userId });
      
      try {
        return await db.bar.update({
          where: { id },
          data: { deletedAt: new Date() },
        });
      } catch (error: any) {
        logger.error({ model: 'Bar', action: 'softDelete', id, error: error.message });
        throw createStandardError(ERROR_CODES.INTERNAL_ERROR);
      }
    },

    async restore(id: string) {
      ensureAuthenticated();
      
      if (!id) throw createStandardError(ERROR_CODES.VALIDATION_ERROR);
      
      logger.info({ model: 'Bar', action: 'restore', id, userId });
      
      try {
        return await db.bar.update({
          where: { id },
          data: { deletedAt: null },
        });
      } catch (error: any) {
        logger.error({ model: 'Bar', action: 'restore', id, error: error.message });
        throw createStandardError(ERROR_CODES.INTERNAL_ERROR);
      }
    },


    async hardDelete(id: string) {
      ensureAuthenticated();
      
      if (!id) throw createStandardError(ERROR_CODES.VALIDATION_ERROR);
      
      logger.warn({ model: 'Bar', action: 'hardDelete', id, userId });
      
      try {
        return await db.bar.delete({ where: { id } });
      } catch (error: unknown) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          if (error.code === 'P2003') throw createStandardError(ERROR_CODES.CONFLICT);
          if (error.code === 'P2025') throw createStandardError(ERROR_CODES.NOT_FOUND);
        }
        logger.error({ model: 'Bar', action: 'hardDelete', id, error: error instanceof Error ? error.message : 'Unknown error' });
        throw createStandardError(ERROR_CODES.INTERNAL_ERROR);
      }
    },
  };
};