import { ANIMATION_DURATION_VERY_SLOW, COUNT_PAIR, MAGIC_36, MAGIC_9, ONE, THIRTY_SECONDS_MS } from '@/constants';

/**
 * WhatsApp API 错误处理类型定义
 * WhatsApp API Error Handling Type Definitions
 *
 * 提供API错误处理相关的类型定义和工具函数
 */

/**
 * 基础API错误响应
 * Base API error response
 */
export interface WhatsAppApiErrorResponse {
  code: number;
  title: string;
  message: string;
  error_data?: {
    details: string;
    messaging_product?: string;
    fbtrace_id?: string;
  };
  href?: string;
}

/**
 * 完整API错误
 * Complete API error
 */
export interface WhatsAppApiError {
  error: {
    message: string;
    type: string;
    code: number;
    error_subcode?: number;
    fbtrace_id: string;
    error_user_title?: string;
    error_user_msg?: string;
    is_transient?: boolean;
  };
}

/**
 * 网络错误
 * Network error
 */
export interface NetworkError {
  name: 'NetworkError';
  message: string;
  code: 'NETWORK_ERROR' | 'TIMEOUT' | 'CONNECTION_REFUSED' | 'DNS_ERROR';
  originalError?: Error;
  retryable: boolean;
}

/**
 * 验证错误
 * Validation error
 */
export interface ValidationError {
  name: 'ValidationError';
  message: string;
  code: 'INVALID_PARAMETER' | 'MISSING_PARAMETER' | 'INVALID_FORMAT';
  field?: string;
  value?: string | number | boolean | Record<string, unknown> | unknown[];
  retryable: false;
}

/**
 * 认证错误
 * Authentication error
 */
export interface AuthenticationError {
  name: 'AuthenticationError';
  message: string;
  code: 'INVALID_TOKEN' | 'EXPIRED_TOKEN' | 'INSUFFICIENT_PERMISSIONS';
  retryable: false;
}

/**
 * 速率限制错误
 * Rate limit error
 */
export interface RateLimitError {
  name: 'RateLimitError';
  message: string;
  code: 'RATE_LIMIT_EXCEEDED';
  retryAfter?: number;
  limit?: number;
  remaining?: number;
  resetTime?: number;
  retryable: true;
}

/**
 * 业务逻辑错误
 * Business logic error
 */
export interface BusinessLogicError {
  name: 'BusinessLogicError';
  message: string;
  code:
    | 'INVALID_PHONE_NUMBER'
    | 'MESSAGE_UNDELIVERABLE'
    | 'TEMPLATE_NOT_APPROVED'
    | 'MEDIA_TOO_LARGE';
  details?: Record<
    string,
    string | number | boolean | Record<string, unknown> | unknown[]
  >;
  retryable: boolean;
}

/**
 * 服务器错误
 * Server error
 */
export interface ServerError {
  name: 'ServerError';
  message: string;
  code: 'INTERNAL_SERVER_ERROR' | 'SERVICE_UNAVAILABLE' | 'BAD_GATEWAY';
  statusCode: number;
  retryable: boolean;
}

/**
 * 错误联合类型
 * Error union type
 */
export type WhatsAppError =
  | WhatsAppApiError
  | NetworkError
  | ValidationError
  | AuthenticationError
  | RateLimitError
  | BusinessLogicError
  | ServerError;

/**
 * 错误严重程度
 * Error severity
 */
export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

/**
 * 错误分类
 * Error category
 */
export type ErrorCategory =
  | 'network'
  | 'authentication'
  | 'validation'
  | 'rate_limit'
  | 'business_logic'
  | 'server'
  | 'unknown';

/**
 * 错误上下文
 * Error context
 */
export interface ErrorContext {
  requestId?: string;
  timestamp: string;
  endpoint: string;
  method: string;
  phoneNumberId?: string;
  userId?: string;
  messageId?: string;
  retryCount?: number;
  userAgent?: string;
  ipAddress?: string;
}

/**
 * 错误详情
 * Error details
 */
export interface ErrorDetails {
  error: WhatsAppError;
  context: ErrorContext;
  severity: ErrorSeverity;
  category: ErrorCategory;
  retryable: boolean;
  retryAfter?: number;
  suggestions?: string[];
}

/**
 * 错误处理策略
 * Error handling strategy
 */
export interface ErrorHandlingStrategy {
  name: string;
  description: string;
  shouldRetry: (error: ErrorDetails) => boolean;
  getRetryDelay: (error: ErrorDetails, attempt: number) => number;
  maxRetries: number;
  onError?: (error: ErrorDetails) => void;
  onRetry?: (error: ErrorDetails, attempt: number) => void;
  onMaxRetriesExceeded?: (error: ErrorDetails) => void;
}

/**
 * 错误统计
 * Error statistics
 */
export interface ErrorStatistics {
  total: number;
  byCategory: Record<ErrorCategory, number>;
  bySeverity: Record<ErrorSeverity, number>;
  byCode: Record<string, number>;
  retryableCount: number;
  nonRetryableCount: number;
  averageRetryCount: number;
  lastOccurrence?: string;
}

/**
 * 错误报告
 * Error report
 */
export interface ErrorReport {
  id: string;
  timestamp: string;
  error: ErrorDetails;
  stackTrace?: string;
  userAgent?: string;
  environment: string;
  version: string;
  additionalData?: Record<
    string,
    string | number | boolean | Record<string, unknown> | unknown[]
  >;
}

/**
 * 错误处理配置
 * Error handling configuration
 */
export interface ErrorHandlingConfig {
  enableRetry: boolean;
  maxRetries: number;
  retryDelay: number;
  retryMultiplier: number;
  maxRetryDelay: number;
  enableLogging: boolean;
  enableReporting: boolean;
  reportingEndpoint?: string;
  customStrategies?: Record<string, ErrorHandlingStrategy>;
}

/**
 * 错误类型守卫函数
 * Error type guard functions
 */
export function isWhatsAppApiError(error: unknown): error is WhatsAppApiError {
  return Boolean(
    error &&
      typeof error === 'object' &&
      typeof (error as Record<string, unknown>).error === 'object' &&
      'message' in
        ((error as Record<string, unknown>).error as Record<string, unknown>) &&
      'type' in
        ((error as Record<string, unknown>).error as Record<string, unknown>) &&
      'code' in
        ((error as Record<string, unknown>).error as Record<string, unknown>),
  );
}

export function isNetworkError(error: unknown): error is NetworkError {
  return Boolean(
    error &&
      typeof error === 'object' &&
      (error as Record<string, unknown>).name === 'NetworkError',
  );
}

export function isValidationError(error: unknown): error is ValidationError {
  return Boolean(
    error &&
      typeof error === 'object' &&
      (error as Record<string, unknown>).name === 'ValidationError',
  );
}

export function isAuthenticationError(
  error: unknown,
): error is AuthenticationError {
  return Boolean(
    error &&
      typeof error === 'object' &&
      (error as Record<string, unknown>).name === 'AuthenticationError',
  );
}

export function isRateLimitError(error: unknown): error is RateLimitError {
  return Boolean(
    error &&
      typeof error === 'object' &&
      (error as Record<string, unknown>).name === 'RateLimitError',
  );
}

export function isBusinessLogicError(
  error: unknown,
): error is BusinessLogicError {
  return Boolean(
    error &&
      typeof error === 'object' &&
      (error as Record<string, unknown>).name === 'BusinessLogicError',
  );
}

export function isServerError(error: unknown): error is ServerError {
  return Boolean(
    error &&
      typeof error === 'object' &&
      (error as Record<string, unknown>).name === 'ServerError',
  );
}

/**
 * 错误工具函数
 * Error utility functions
 */
export const ErrorUtils = {
  /**
   * 分类错误
   * Categorize error
   */
  categorizeError(error: WhatsAppError): ErrorCategory {
    if (isNetworkError(error)) return 'network';
    if (isAuthenticationError(error)) return 'authentication';
    if (isValidationError(error)) return 'validation';
    if (isRateLimitError(error)) return 'rate_limit';
    if (isBusinessLogicError(error)) return 'business_logic';
    if (isServerError(error)) return 'server';
    return 'unknown';
  },

  /**
   * 评估错误严重程度
   * Assess error severity
   */
  assessSeverity(error: WhatsAppError): ErrorSeverity {
    if (isAuthenticationError(error)) return 'critical';
    if (isServerError(error) && error.statusCode >= 500) return 'high';
    if (isRateLimitError(error)) return 'medium';
    if (isValidationError(error)) return 'low';
    if (isBusinessLogicError(error)) {
      if (error.code === 'INVALID_PHONE_NUMBER') return 'medium';
      if (error.code === 'MESSAGE_UNDELIVERABLE') return 'high';
      return 'low';
    }
    return 'medium';
  },

  /**
   * 检查错误是否可重试
   * Check if error is retryable
   */
  isRetryable(error: WhatsAppError): boolean {
    if (isNetworkError(error)) return error.retryable;
    if (isAuthenticationError(error)) return false;
    if (isValidationError(error)) return false;
    if (isRateLimitError(error)) return true;
    if (isBusinessLogicError(error)) return error.retryable;
    if (isServerError(error)) return error.retryable;
    if (isWhatsAppApiError(error)) {
      return error.error.is_transient || false;
    }
    return false;
  },

  /**
   * 格式化错误消息
   * Format error message
   */
  formatErrorMessage(error: WhatsAppError): string {
    if (isWhatsAppApiError(error)) {
      const { message, type, code } = error.error;
      return `[${type}:${code}] ${message}`;
    }

    if ('message' in error) {
      return `[${error.name}] ${error.message}`;
    }

    return 'Unknown error occurred';
  },

  /**
   * 提取错误代码
   * Extract error code
   */
  extractErrorCode(error: WhatsAppError): string | number {
    if (isWhatsAppApiError(error)) {
      return error.error.code;
    }

    if ('code' in error) {
      return error.code;
    }

    return 'UNKNOWN';
  },

  /**
   * 创建错误详情
   * Create error details
   */
  createErrorDetails(
    error: WhatsAppError,
    context: ErrorContext,
  ): ErrorDetails {
    const category = ErrorUtils.categorizeError(error);
    const severity = ErrorUtils.assessSeverity(error);
    const retryable = ErrorUtils.isRetryable(error);

    let retryAfter: number | undefined;
    if (isRateLimitError(error)) {
      ({ retryAfter } = error);
    }

    const suggestions = ErrorUtils.generateSuggestions(error);

    return {
      error,
      context,
      severity,
      category,
      retryable,
      ...(retryAfter !== undefined && { retryAfter }),
      suggestions,
    };
  },

  /**
   * 生成错误建议
   * Generate error suggestions
   */
  generateSuggestions(error: WhatsAppError): string[] {
    const suggestions: string[] = [];

    if (isAuthenticationError(error)) {
      suggestions.push(
        ...['Check your access token', 'Verify token permissions', 'Ensure token has not expired'],
      );
    }

    if (isValidationError(error)) {
      suggestions.push(
        ...['Check request parameters', 'Validate input format', 'Review API documentation'],
      );
    }

    if (isRateLimitError(error)) {
      suggestions.push(
        ...['Implement exponential backoff', 'Reduce request frequency', 'Consider upgrading your plan'],
      );
    }

    if (isNetworkError(error)) {
      suggestions.push(
        ...['Check network connectivity', 'Verify API endpoint URL', 'Try again later'],
      );
    }

    if (isBusinessLogicError(error)) {
      if (error.code === 'INVALID_PHONE_NUMBER') {
        suggestions.push(
          ...['Verify phone number format', 'Include country code'],
        );
      }
      if (error.code === 'MESSAGE_UNDELIVERABLE') {
        suggestions.push(
          ...['Check recipient status', 'Verify phone number is active'],
        );
      }
    }

    return suggestions;
  },

  /**
   * 计算重试延迟
   * Calculate retry delay
   */
  calculateRetryDelay(
    attempt: number,
    baseDelay: number = ANIMATION_DURATION_VERY_SLOW,
    multiplier: number = COUNT_PAIR,
    maxDelay: number = THIRTY_SECONDS_MS,
  ): number {
    const delay = baseDelay * multiplier**(attempt - ONE);
    return Math.min(delay, maxDelay);
  },

  /**
   * 创建错误报告
   * Create error report
   */
  createErrorReport(
    errorDetails: ErrorDetails,
    environment: string = 'production',
    version: string = '1.0.0',
  ): ErrorReport {
    return {
      id: `error_${Date.now()}_${Math.random().toString(MAGIC_36).substr(COUNT_PAIR, MAGIC_9)}`,
      timestamp: new Date().toISOString(),
      error: errorDetails,
      environment,
      version,
    };
  },
};
