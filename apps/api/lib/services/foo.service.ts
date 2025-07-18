// SPDX-License-Identifier: MIT
import type { Context } from '../types/context';
import type * as S from '../schemas/foo';
import { createStandardError, ERROR_CODES } from '../utils/errors';
import { Prisma } from '@prisma/client';

export const createFooService = (ctx: Context) => {
  const { db, logger, userId } = ctx;
  
  // 型安全な検索フィールド定義
  const searchFields = ['name'] as const;

  // 認証チェック
  const ensureAuthenticated = () => {
    if (!userId) {
      throw createStandardError(ERROR_CODES.UNAUTHORIZED);
    }
  };

  return {
    async list(input: S.FooListInput) {
      
      
      const { page = 1, limit = 20, search } = input;
      
      // 入力値の検証
      if (page < 1) throw createStandardError(ERROR_CODES.VALIDATION_ERROR);
      if (limit < 1 || limit > 100) throw createStandardError(ERROR_CODES.VALIDATION_ERROR);
      
      const where = {

        
        ...(search?.trim() && {
          OR: searchFields.map(field => ({
            [field]: { contains: search, mode: 'insensitive' as const }
          }))
        }),
      };

      try {
        const [items, total] = await Promise.all([
          db.foo.findMany({
            where,
            skip: (page - 1) * limit,
            take: limit,
            orderBy: { createdAt: 'desc' },
          }),
          db.foo.count({ where }),
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
        logger.error({ model: 'Foo', action: 'list', error: error.message });
        throw createStandardError(ERROR_CODES.INTERNAL_ERROR);
      }
    },

    async get(id: string) {
      
      
      if (!id) throw createStandardError(ERROR_CODES.VALIDATION_ERROR);
      
      try {
        return await db.foo.findFirst({
          where: { id },
        });
      } catch (error: any) {
        logger.error({ model: 'Foo', action: 'get', id, error: error.message });
        throw createStandardError(ERROR_CODES.INTERNAL_ERROR);
      }
    },

    async create(data: S.FooCreateInput) {
      
      
      logger.info({ model: 'Foo', action: 'create', userId });
      
      try {
        return await db.foo.create({ 
          data: {
            ...data,
            
          } as any // Type assertion needed due to Prisma's strict typing
        });
      } catch (error: unknown) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          if (error.code === 'P2002') throw createStandardError(ERROR_CODES.CONFLICT);
          if (error.code === 'P2003') throw createStandardError(ERROR_CODES.CONFLICT);
          if (error.code === 'P2025') throw createStandardError(ERROR_CODES.NOT_FOUND);
        }
        logger.error({ model: 'Foo', action: 'create', error: error instanceof Error ? error.message : 'Unknown error' });
        throw createStandardError(ERROR_CODES.INTERNAL_ERROR);
      }
    },

    async update(id: string, data: S.FooUpdateData) {
      
      
      if (!id) throw createStandardError(ERROR_CODES.VALIDATION_ERROR);
      
      const existing = await this.get(id);
      if (!existing) throw createStandardError(ERROR_CODES.NOT_FOUND);
      
      logger.info({ model: 'Foo', action: 'update', id, userId });
      
      try {
        // Prismaの@updatedAtに任せるため、updatedAtは渡さない
        const { updatedAt, ...updateData } = data as any;
        
        return await db.foo.update({
          where: { id },
          data: updateData,
        });
      } catch (error: any) {
        logger.error({ model: 'Foo', action: 'update', id, error: error.message });
        throw createStandardError(ERROR_CODES.INTERNAL_ERROR);
      }
    },


    async hardDelete(id: string) {
      
      
      if (!id) throw createStandardError(ERROR_CODES.VALIDATION_ERROR);
      
      logger.warn({ model: 'Foo', action: 'hardDelete', id, userId });
      
      try {
        return await db.foo.delete({ where: { id } });
      } catch (error: unknown) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          if (error.code === 'P2003') throw createStandardError(ERROR_CODES.CONFLICT);
          if (error.code === 'P2025') throw createStandardError(ERROR_CODES.NOT_FOUND);
        }
        logger.error({ model: 'Foo', action: 'hardDelete', id, error: error instanceof Error ? error.message : 'Unknown error' });
        throw createStandardError(ERROR_CODES.INTERNAL_ERROR);
      }
    },
  };
};