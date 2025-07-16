import type { PublicAccount } from '@shared-types/entities/account';

// 認証状態
export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: PublicAccount | null;
  error: string | null;
}

// フォーム状態
export interface FormState<T = unknown> {
  isSubmitting: boolean;
  isValid: boolean;
  errors: Record<string, string[]>;
  values: T;
  touchedFields: Set<string>;
}

// UI状態
export interface UIState {
  theme: 'light' | 'dark' | 'system';
  sidebarOpen: boolean;
  modalOpen: boolean;
  notifications: Notification[];
}

// 通知
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  timestamp: Date;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// ローディング状態
export interface LoadingState {
  isLoading: boolean;
  progress?: number;
  message?: string;
}

// エラー状態
export interface ErrorState {
  hasError: boolean;
  error: Error | null;
  message?: string;
  retry?: () => void;
}

// ページネーション状態
export interface PaginationState {
  currentPage: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

// フィルター状態
export interface FilterState {
  searchQuery: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  filters: Record<string, unknown>;
}
