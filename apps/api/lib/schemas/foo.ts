// SPDX-License-Identifier: MIT
import { z } from 'zod';

// Common validation patterns
const IdSchema = z.string().cuid('Invalid ID format');
const EmailSchema = z.string().email('Invalid email format');
const NameSchema = z.string().min(1, 'Name is required').max(255, 'Name too long');
const SlugSchema = z.string().regex(/^[a-z0-9-]+$/, 'Invalid slug format');

// Matches Prisma model - adjust as needed
export const Foo = z.object({
  id: IdSchema,
  name: NameSchema,
  description: z.string().max(1000, 'Description too long').nullable().optional(),
  email: EmailSchema.nullable().optional(),
  status: z.string().default('ACTIVE'),
  createdAt: z.date(),
  updatedAt: z.date(),

});

export type Foo = z.infer<typeof Foo>;

// Input/Output schemas with strict validation
export const FooListInput = z.object({
  page: z.number().int().positive().max(1000).optional().default(1),
  limit: z.number().int().positive().max(100).optional().default(20),
  search: z.string().min(1).max(255).optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'name']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
}).strict();

export const FooListOutput = z.object({
  items: z.array(Foo),
  pagination: z.object({
    page: z.number().int().positive(),
    limit: z.number().int().positive(),
    total: z.number().int().min(0),
    totalPages: z.number().int().min(0),
  }),
});

export const FooGetInput = z.object({
  id: IdSchema,
});

export const FooCreateInput = Foo.omit({
  id: true,
  createdAt: true,
  updatedAt: true,

}).strict(); // Prevent unknown properties

export const FooUpdateInput = z.object({
  id: IdSchema,
  data: FooCreateInput.partial().strict(),
});

export const FooUpdateData = FooCreateInput.partial().strict();

export const FooDeleteInput = z.object({
  id: IdSchema,
});

export const FooDeleteOutput = z.object({
  success: z.boolean(),
  id: IdSchema,
});

// Type exports
export type FooListInput = z.infer<typeof FooListInput>;
export type FooListOutput = z.infer<typeof FooListOutput>;
export type FooGetInput = z.infer<typeof FooGetInput>;
export type FooCreateInput = z.infer<typeof FooCreateInput>;
export type FooUpdateInput = z.infer<typeof FooUpdateInput>;
export type FooUpdateData = z.infer<typeof FooUpdateData>;
export type FooDeleteInput = z.infer<typeof FooDeleteInput>;
export type FooDeleteOutput = z.infer<typeof FooDeleteOutput>;

// Additional validation helpers
export const validateFooName = (name: string) => NameSchema.safeParse(name);
export const validateFooId = (id: string) => IdSchema.safeParse(id);