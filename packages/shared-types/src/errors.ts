/* ErrorCode & Message – 編集不可。yarn gen:error を使うこと */
export const ERROR = {
  // 認証
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  // バリデーション
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  CONFLICT: 'CONFLICT',
  NOT_FOUND: 'NOT_FOUND',
  // システム
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const;

type ErrorKey = keyof typeof ERROR;

export const ErrorMessages: Record<ErrorKey, string> = {
  UNAUTHORIZED: '認証が必要です',
  FORBIDDEN: '権限がありません',
  INVALID_CREDENTIALS: 'メールアドレスまたはパスワードが正しくありません',
  VALIDATION_ERROR: '入力値が不正です',
  CONFLICT: 'リソースが競合しています',
  NOT_FOUND: 'リソースが見つかりません',
  INTERNAL_ERROR: 'システムエラーが発生しました',
} as const;

export type AppErrorCode = (typeof ERROR)[keyof typeof ERROR];
