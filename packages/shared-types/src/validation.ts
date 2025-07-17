/** 共通バリデーション定数 – 編集は lead のみ */
export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/;

export const SLUG_REGEX = /^[a-z0-9-]{3,50}$/;

export const MAX_EMAIL_LENGTH = 255;
export const MAX_NAME_LENGTH = 100;
