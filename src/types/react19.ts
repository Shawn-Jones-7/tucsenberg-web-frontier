/**
 * React 19 Hook类型定义
 * 提供React 19新增Hook的完整类型支持
 *
 * @see https://react.dev/reference/react/hooks
 * @see https://react.dev/reference/react-dom/hooks
 */

import type { Context, ReactNode, TransitionFunction } from 'react';

// ============================================================================
// useActionState Hook Types
// ============================================================================

/**
 * useActionState Hook的状态类型
 */
export type ActionState<TData = unknown> = {
  /** 操作是否正在进行中 */
  isPending: boolean;
  /** 操作的数据结果 */
  data?: TData;
  /** 操作的错误信息 */
  error?: string | string[] | null;
  /** 操作是否成功 */
  success?: boolean;
  /** 操作的时间戳 */
  timestamp?: number;
};

/**
 * Server Action函数签名
 */
export type ServerActionFunction<TState, _TData = unknown> = (
  previousState: TState,
  formData: FormData,
) => Promise<TState>;

/**
 * useActionState Hook返回值类型
 */
export type UseActionStateReturn<TState> = [
  state: TState,
  formAction: (formData: FormData) => void,
  isPending: boolean,
];

/**
 * useActionState Hook类型定义
 */
export interface UseActionState {
  <TState>(
    action: ServerActionFunction<TState, unknown>,
    initialState: TState,
    permalink?: string,
  ): UseActionStateReturn<TState>;
}

// ============================================================================
// useFormStatus Hook Types
// ============================================================================

/**
 * useFormStatus Hook返回值类型
 */
export type UseFormStatusReturn = {
  /** 表单是否正在提交中 */
  pending: boolean;
  /** 表单数据 */
  data: FormData | null;
  /** 表单提交方法 */
  method: string | null;
  /** 表单action */
  action: string | ((formData: FormData) => void) | null;
};

/**
 * useFormStatus Hook类型定义
 */
export interface UseFormStatus {
  (): UseFormStatusReturn;
}

// ============================================================================
// useOptimistic Hook Types
// ============================================================================

/**
 * useOptimistic Hook的更新函数类型
 */
export type OptimisticUpdateFunction<TState, TAction> = (
  currentState: TState,
  optimisticValue: TAction,
) => TState;

/**
 * useOptimistic Hook返回值类型
 */
export type UseOptimisticReturn<TState, TAction> = [
  optimisticState: TState,
  addOptimistic: (action: TAction) => void,
];

/**
 * useOptimistic Hook类型定义
 */
export interface UseOptimistic {
  <TState, TAction = TState>(
    state: TState,
    updateFn?: OptimisticUpdateFunction<TState, TAction>,
  ): UseOptimisticReturn<TState, TAction>;
}

// ============================================================================
// use Hook Types
// ============================================================================

/**
 * use Hook支持的资源类型
 */
export type UseResource<T> = Promise<T> | Context<T>;

/**
 * use Hook类型定义
 */
export interface Use {
  <T>(resource: Promise<T>): T;
  <T>(resource: Context<T>): T;
}

// ============================================================================
// Form Action Types
// ============================================================================

/**
 * 表单Action属性类型
 */
export type FormAction =
  | string
  | ((formData: FormData) => void)
  | ((formData: FormData) => Promise<void>);

/**
 * 表单组件Props扩展
 */
export interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  action?: FormAction;
}

/**
 * 按钮组件Props扩展（支持formAction）
 */
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  formAction?: FormAction;
}

// ============================================================================
// Server Components Types
// ============================================================================

/**
 * Server Component类型
 */
export type ServerComponent<TProps = Record<string, unknown>> = (
  props: TProps,
) => Promise<ReactNode> | ReactNode;

/**
 * Async Server Component类型
 */
export type AsyncServerComponent<TProps = Record<string, unknown>> = (
  props: TProps,
) => Promise<ReactNode>;

// ============================================================================
// Transition Types
// ============================================================================

/**
 * useTransition Hook返回值类型（React 19增强）
 */
export type UseTransitionReturn = [
  isPending: boolean,
  startTransition: TransitionFunction,
];

// ============================================================================
// Error Boundary Types
// ============================================================================

/**
 * Error Boundary错误信息类型
 */
export interface ErrorInfo {
  componentStack: string;
  errorBoundary?: React.Component | null;
  errorBoundaryName?: string | null;
}

/**
 * Error Boundary Props类型
 */
export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode | ((error: Error, errorInfo: ErrorInfo) => ReactNode);
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

// ============================================================================
// Suspense Types
// ============================================================================

/**
 * Suspense边界Props类型
 */
export interface SuspenseProps {
  children: ReactNode;
  fallback?: ReactNode;
}

// ============================================================================
// React 19 Component Types
// ============================================================================

/**
 * React 19组件基础Props类型
 */
export interface React19ComponentProps {
  children?: ReactNode;
  className?: string;
}

/**
 * React 19表单组件Props类型
 */
export interface React19FormComponentProps extends React19ComponentProps {
  onSubmit?: (formData: FormData) => void | Promise<void>;
  action?: FormAction;
  isPending?: boolean;
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * 提取Promise类型的工具类型
 */
export type Awaited<T> = T extends Promise<infer U> ? U : T;

/**
 * 表单字段值类型
 */
export type FormFieldValue = string | File | null;

/**
 * 表单数据类型映射
 */
export type FormDataMap = Record<string, FormFieldValue | FormFieldValue[]>;

/**
 * Server Action结果类型
 */
export type ServerActionResult<TData = unknown> = {
  success: boolean;
  data?: TData;
  error?: string | string[];
  timestamp: number;
};

// ============================================================================
// Type Guards
// ============================================================================

/**
 * 检查是否为Promise类型
 */
export function isPromise<T>(value: unknown): value is Promise<T> {
  return value instanceof Promise;
}

/**
 * 检查是否为Context类型
 */
export function isContext<T>(value: unknown): value is Context<T> {
  return (
    typeof value === 'object' &&
    value !== null &&
    '$$typeof' in value &&
    '_currentValue' in value
  );
}

/**
 * 检查是否为有效的FormData
 */
export function isFormData(value: unknown): value is FormData {
  return value instanceof FormData;
}
