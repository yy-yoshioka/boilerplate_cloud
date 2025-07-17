import { z } from 'zod';

// ログインフォームスキーマ
export const LoginFormSchema = z.object({
  email: z
    .string()
    .min(1, 'メールアドレスを入力してください')
    .email('有効なメールアドレスを入力してください')
    .toLowerCase()
    .trim(),
  password: z.string().min(1, 'パスワードを入力してください'),
  rememberMe: z.boolean().default(false),
});

// 登録フォームスキーマ
export const RegisterFormSchema = z
  .object({
    email: z
      .string()
      .min(1, 'メールアドレスを入力してください')
      .email('有効なメールアドレスを入力してください')
      .toLowerCase()
      .trim(),
    name: z
      .string()
      .min(1, '名前を入力してください')
      .max(100, '名前は100文字以内で入力してください')
      .trim(),
    password: z
      .string()
      .min(8, 'パスワードは8文字以上で入力してください')
      .regex(/^(?=.*[a-zA-Z])(?=.*[0-9])/, 'パスワードには英字と数字を含めてください'),
    confirmPassword: z.string().min(1, 'パスワードを再入力してください'),
    acceptTerms: z.boolean().refine((val) => val === true, {
      message: '利用規約に同意してください',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'パスワードが一致しません',
    path: ['confirmPassword'],
  });

// パスワードリセット要求フォームスキーマ
export const PasswordResetRequestFormSchema = z.object({
  email: z
    .string()
    .min(1, 'メールアドレスを入力してください')
    .email('有効なメールアドレスを入力してください')
    .toLowerCase()
    .trim(),
});

// パスワードリセットフォームスキーマ
export const PasswordResetFormSchema = z
  .object({
    token: z.string().min(1),
    password: z
      .string()
      .min(8, '新しいパスワードは8文字以上で入力してください')
      .regex(/^(?=.*[a-zA-Z])(?=.*[0-9])/, 'パスワードには英字と数字を含めてください'),
    confirmPassword: z.string().min(1, 'パスワードを再入力してください'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'パスワードが一致しません',
    path: ['confirmPassword'],
  });

// 型エクスポート
export type LoginFormData = z.infer<typeof LoginFormSchema>;
export type RegisterFormData = z.infer<typeof RegisterFormSchema>;
export type PasswordResetRequestFormData = z.infer<typeof PasswordResetRequestFormSchema>;
export type PasswordResetFormData = z.infer<typeof PasswordResetFormSchema>;
