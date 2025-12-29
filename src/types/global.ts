/**
 * 全局类型定义
 * 包含项目中使用的通用类型和工具类型
 */

/**
 * API响应的通用接口
 * @template T - 响应数据的类型
 */
export interface ApiResponse<T = unknown> {
  /** 响应数据 */
  data: T;
  /** 请求是否成功 */
  success: boolean;
  /** 响应消息 */
  message?: string;
  /** 错误信息，键为字段名，值为错误消息数组 */
  errors?: Record<string, string[]>;
}

/**
 * 分页响应接口
 * @template T - 数据项的类型
 */
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  /** 分页信息 */
  pagination: {
    /** 当前页码 */
    page: number;
    /** 每页数量 */
    limit: number;
    /** 总记录数 */
    total: number;
    /** 总页数 */
    totalPages: number;
  };
}

/**
 * 深度可选类型 - 将对象的所有属性（包括嵌套对象）设为可选
 * @template T - 要处理的类型
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * 必需键类型 - 将指定的键设为必需，其他保持原样
 * @template T - 原始类型
 * @template K - 要设为必需的键
 */
export type RequiredKeys<T, K extends keyof T> = T & Required<Pick<T, K>>;

/**
 * 可选键类型 - 将指定的键设为可选，其他保持原样
 * @template T - 原始类型
 * @template K - 要设为可选的键
 */
export type OptionalKeys<T, K extends keyof T> = Omit<T, K> &
  Partial<Pick<T, K>>;

/**
 * 品牌类型 - 用于创建类型安全的字符串类型
 */
declare const brand: unique symbol;
export type Brand<T, TBrand> = T & { [brand]: TBrand };

/**
 * 用户ID类型 - 使用品牌类型确保类型安全
 */
export type UserId = Brand<string, 'UserId'>;

/**
 * 邮箱类型 - 使用品牌类型确保类型安全
 */
export type Email = Brand<string, 'Email'>;

/**
 * 主题类型
 */
export type Theme = 'light' | 'dark' | 'system';

/**
 * 语言类型
 */
export type Locale = 'en' | 'zh';

/**
 * 环境类型
 */
export type Environment = 'development' | 'production' | 'test';

/**
 * 错误类型枚举
 */
export type ErrorType =
  | 'validation'
  | 'authentication'
  | 'authorization'
  | 'not_found'
  | 'server_error'
  | 'network_error';

/**
 * 加载状态类型
 */
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

/**
 * 表单状态接口
 * @template T - 表单数据的类型
 */
export interface FormState<T> {
  /** 表单值 */
  values: T;
  /** 表单错误 */
  errors: FormErrors<T>;
  /** 已触摸的字段 */
  touched: Record<string, boolean>;
  /** 是否正在提交 */
  isSubmitting: boolean;
  /** 表单是否有效 */
  isValid: boolean;
}

/**
 * 表单错误类型 - 简化版本
 */
export type FormErrors<T> = Record<keyof T, string>;

/**
 * 事件处理器类型
 */
export type EventHandler = () => void;

/**
 * 异步函数类型
 */
export type AsyncFunction<T = unknown> = () => Promise<T>;

/**
 * 配置选项接口
 */
export interface ConfigOptions {
  /** API基础URL */
  apiBaseUrl: string;
  /** 应用环境 */
  environment: Environment;
  /** 默认语言 */
  defaultLocale: Locale;
  /** 是否启用调试模式 */
  debug: boolean;
}

// Window接口扩展已在lib.dom.d.ts中定义，无需重复声明
