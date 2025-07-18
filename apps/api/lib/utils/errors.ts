import { ERROR, ErrorMessages } from '@boilerplate/shared-types';
import { TRPCError } from '@trpc/server';

// Export ERROR_CODES for use in templates
export const ERROR_CODES = ERROR;

// HTTP status mapping for TRPC errors
const httpStatusMap: Record<keyof typeof ERROR, string> = {
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  INVALID_CREDENTIALS: 'UNAUTHORIZED',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  VALIDATION_ERROR: 'BAD_REQUEST',
  INTERNAL_ERROR: 'INTERNAL_SERVER_ERROR',
};

// 2. Fallback メッセージ
const defaultMessage = ErrorMessages.INTERNAL_ERROR;

export const createStandardError = (code: keyof typeof ERROR): TRPCError => {
  return new TRPCError({
    code: httpStatusMap[code] as any,
    message: ErrorMessages[code] ?? defaultMessage,
  });
};
