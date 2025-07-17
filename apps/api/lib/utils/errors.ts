import { ERROR, ErrorMessages } from '@shared-types/errors';
import { TRPCError } from '@trpc/server';

const httpStatusMap = {
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  VALIDATION_ERROR: 'BAD_REQUEST',
  INTERNAL_ERROR: 'INTERNAL_SERVER_ERROR',
} as const;

export const createStandardError = (code: keyof typeof ERROR): TRPCError => 
  new TRPCError({
    code: httpStatusMap[code] || 'INTERNAL_SERVER_ERROR',
    message: ErrorMessages[code],
  });