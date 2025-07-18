// SPDX-License-Identifier: MIT
import { z } from 'zod';

// Common validation patterns
const IdSchema = z.string().cuid('Invalid ID format');
const EmailSchema = z.string().email('Invalid email format');
const NameSchema = z.string().min(1, 'Name is required').max(255, 'Name too long');
const SlugSchema = z.string().regex(/^[a-z0-9-]+$/, 'Invalid slug format');

// Matches Prisma model - adjust as needed
export const Baz = z.object({
  id: IdSchema,
  name: NameSchema,
  description: z.string().max(1000, 'Description too long').nullable().optional(),
  email: EmailSchema.nullable().optional(),
  status: z.string().default('ACTIVE'),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable(),
});

export type Baz = z.infer<typeof Baz>;

// Input/Output schemas with strict validation
export const BazListInput = z.object({
  page: z.number().int().positive().max(1000).optional().default(1),
  limit: z.number().int().positive().max(100).optional().default(20),
  search: z.string().min(1).max(255).optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'name']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
}).strict();

export const BazListOutput = z.object({
  items: z.array(Baz),
  pagination: z.object({
    page: z.number().int().positive(),
    limit: z.number().int().positive(),
    total: z.number().int().min(0),
    totalPages: z.number().int().min(0),
  }),
});

export const BazGetInput = z.object({
  id: IdSchema,
});

export const BazCreateInput = Baz.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
}).strict(); // Prevent unknown properties

export const BazUpdateInput = z.object({
  id: IdSchema,
  data: BazCreateInput.partial().strict(),
});

export const BazUpdateData = BazCreateInput.partial().strict();

export const BazDeleteInput = z.object({
  id: IdSchema,
});

export const BazDeleteOutput = z.object({
  success: z.boolean(),
  id: IdSchema,
});

// Type exports
export type BazListInput = z.infer<typeof BazListInput>;
export type BazListOutput = z.infer<typeof BazListOutput>;
export type BazGetInput = z.infer<typeof BazGetInput>;
export type BazCreateInput = z.infer<typeof BazCreateInput>;
export type BazUpdateInput = z.infer<typeof BazUpdateInput>;
export type BazUpdateData = z.infer<typeof BazUpdateData>;
export type BazDeleteInput = z.infer<typeof BazDeleteInput>;
export type BazDeleteOutput = z.infer<typeof BazDeleteOutput>;

// Additional validation helpers
export const validateBazName = (name: string) => NameSchema.safeParse(name);
export const validateBazId = (id: string) => IdSchema.safeParse(id);