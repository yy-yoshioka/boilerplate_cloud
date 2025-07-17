import { ERROR, ErrorMessages } from '@boilerplate/shared-types';
import { TRPCError } from '@trpc/server';

// HTTP status mapping for TRPC errors
const httpStatusMap = {
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  INVALID_CREDENTIALS: 'UNAUTHORIZED',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  VALIDATION_ERROR: 'BAD_REQUEST',
  INTERNAL_ERROR: 'INTERNAL_SERVER_ERROR',
} as const;

// 2. Fallback メッセージ
const defaultMessage = ErrorMessages.INTERNAL_ERROR;

export const createStandardError = (code: keyof typeof ERROR): TRPCError => {
  return new TRPCError({
    code: httpStatusMap[code] as any,
    message: ErrorMessages[code] ?? defaultMessage,
  });
};
