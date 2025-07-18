// SPDX-License-Identifier: MIT
import { z } from 'zod';

// Common validation patterns
const IdSchema = z.string().cuid('Invalid ID format');
const EmailSchema = z.string().email('Invalid email format');
const NameSchema = z.string().min(1, 'Name is required').max(255, 'Name too long');
const SlugSchema = z.string().regex(/^[a-z0-9-]+$/, 'Invalid slug format');

// Matches Prisma model - adjust as needed
export const Bar = z.object({
  id: IdSchema,
  name: NameSchema,
  description: z.string().max(1000, 'Description too long').nullable().optional(),
  email: EmailSchema.nullable().optional(),
  status: z.string().default('ACTIVE'),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable(),
});

export type Bar = z.infer<typeof Bar>;

// Input/Output schemas with strict validation
export const BarListInput = z.object({
  page: z.number().int().positive().max(1000).optional().default(1),
  limit: z.number().int().positive().max(100).optional().default(20),
  search: z.string().min(1).max(255).optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'name']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
}).strict();

export const BarListOutput = z.object({
  items: z.array(Bar),
  pagination: z.object({
    page: z.number().int().positive(),
    limit: z.number().int().positive(),
    total: z.number().int().min(0),
    totalPages: z.number().int().min(0),
  }),
});

export const BarGetInput = z.object({
  id: IdSchema,
});

export const BarCreateInput = Bar.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
}).strict(); // Prevent unknown properties

export const BarUpdateInput = z.object({
  id: IdSchema,
  data: BarCreateInput.partial().strict(),
});

export const BarUpdateData = BarCreateInput.partial().strict();

export const BarDeleteInput = z.object({
  id: IdSchema,
});

export const BarDeleteOutput = z.object({
  success: z.boolean(),
  id: IdSchema,
});

// Type exports
export type BarListInput = z.infer<typeof BarListInput>;
export type BarListOutput = z.infer<typeof BarListOutput>;
export type BarGetInput = z.infer<typeof BarGetInput>;
export type BarCreateInput = z.infer<typeof BarCreateInput>;
export type BarUpdateInput = z.infer<typeof BarUpdateInput>;
export type BarUpdateData = z.infer<typeof BarUpdateData>;
export type BarDeleteInput = z.infer<typeof BarDeleteInput>;
export type BarDeleteOutput = z.infer<typeof BarDeleteOutput>;

// Additional validation helpers
export const validateBarName = (name: string) => NameSchema.safeParse(name);
export const validateBarId = (id: string) => IdSchema.safeParse(id);