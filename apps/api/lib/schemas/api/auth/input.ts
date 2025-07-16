import { z } from 'zod';

// パスワードバリデーションルール
const passwordSchema = z
  .string()
  .min(8, 'パスワードは8文字以上で入力してください')
  .regex(/[a-zA-Z]/, 'パスワードには英字を含めてください')
  .regex(/[0-9]/, 'パスワードには数字を含めてください')
  .regex(/[^a-zA-Z0-9]/, 'パスワードには特殊文字を含めることを推奨します')
  .optional()
  .or(
    z
      .string()
      .min(8, 'パスワードは8文字以上で入力してください')
      .regex(/[a-zA-Z]/, 'パスワードには英字を含めてください')
      .regex(/[0-9]/, 'パスワードには数字を含めてください'),
  );

// メールバリデーションルール
const emailSchema = z.string().email('有効なメールアドレスを入力してください').toLowerCase().trim();

// 登録入力スキーマ
export const RegisterInputSchema = z.object({
  email: emailSchema,
  name: z
    .string()
    .min(1, '名前を入力してください')
    .max(100, '名前は100文字以内で入力してください')
    .trim(),
  password: z
    .string()
    .min(8, 'パスワードは8文字以上で入力してください')
    .regex(/[a-zA-Z]/, 'パスワードには英字を含めてください')
    .regex(/[0-9]/, 'パスワードには数字を含めてください'),
});

// ログイン入力スキーマ
export const LoginInputSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'パスワードを入力してください'),
});

// プロフィール更新スキーマ
export const UpdateProfileInputSchema = z.object({
  name: z
    .string()
    .min(1, '名前を入力してください')
    .max(100, '名前は100文字以内で入力してください')
    .trim()
    .optional(),
  avatarUrl: z.string().url('有効なURLを入力してください').optional().nullable(),
});

// パスワード変更スキーマ
export const ChangePasswordInputSchema = z.object({
  currentPassword: z.string().min(1, '現在のパスワードを入力してください'),
  newPassword: z
    .string()
    .min(8, '新しいパスワードは8文字以上で入力してください')
    .regex(/[a-zA-Z]/, '新しいパスワードには英字を含めてください')
    .regex(/[0-9]/, '新しいパスワードには数字を含めてください'),
});

// 型エクスポート
export type RegisterInput = z.infer<typeof RegisterInputSchema>;
export type LoginInput = z.infer<typeof LoginInputSchema>;
export type UpdateProfileInput = z.infer<typeof UpdateProfileInputSchema>;
export type ChangePasswordInput = z.infer<typeof ChangePasswordInputSchema>;
