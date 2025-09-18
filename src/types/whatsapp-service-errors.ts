import { ANIMATION_DURATION_VERY_SLOW, HTTP_BAD_REQUEST, HTTP_UNAUTHORIZED, MAGIC_429, SECONDS_PER_MINUTE } from '@/constants';

/**
 * WhatsApp Service Error Types and Classes
 *
 * This module provides comprehensive error handling types and classes
 * for WhatsApp Business API integration, including specific error types
 * for different failure scenarios.
 */

// ==================== Base Error Class ====================

/**
 * Base WhatsApp Error Class
 * All WhatsApp-related errors extend from this base class
 */
export class WhatsAppError extends Error {
  /** HTTP status code or custom error code */
  public readonly code: number;
  /** Error type identifier */
  public readonly type: string;
  /** Additional error subcode for more specific error identification */
  public readonly subcode?: number;
  /** Trace ID for request tracking */
  public readonly traceId?: string;
  /** Timestamp when error occurred */
  public readonly timestamp: number;

  constructor(
    message: string,
    code: number = 500,
    options?: { type?: string; subcode?: number; traceId?: string },
  ) {
    super(message);
    this.name = 'WhatsAppError';
    this.code = code;
    this.type = options?.type ?? 'WhatsAppError';
    if (options?.subcode !== undefined) this.subcode = options.subcode;
    if (options?.traceId !== undefined) this.traceId = options.traceId;
    this.timestamp = Date.now();

    // Ensure proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, WhatsAppError.prototype);
  }

  /**
   * Convert error to JSON for logging and serialization
   */
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      type: this.type,
      subcode: this.subcode,
      traceId: this.traceId,
      timestamp: this.timestamp,
      stack: this.stack,
    };
  }

  /**
   * Check if error is retryable based on error type and code
   */
  isRetryable(): boolean {
    // Rate limit errors are retryable
    if (this.code === MAGIC_429) return true;

    // Network errors are retryable
    if (this.code >= 500) return true;

    // Timeout errors are retryable
    if (this.type === 'NetworkError' && this instanceof WhatsAppNetworkError) {
      return this.isTimeout === true;
    }

    return false;
  }
}

// ==================== Specific Error Classes ====================

/**
 * WhatsApp API Error
 * Errors returned directly from WhatsApp Business API
 */
export class WhatsAppApiError extends WhatsAppError {
  /** Original API error details */
  public readonly apiError?: {
    error_data?: {
      messaging_product: string;
      details: string;
    };
    error_subcode?: number;
    fbtrace_id?: string;
  };

  constructor(
    message: string,
    code: number,
    options?: { apiError?: WhatsAppApiError['apiError']; traceId?: string },
  ) {
    const base: { type: string; subcode?: number; traceId?: string } = { type: 'ApiError' };
    const sub = options?.apiError?.error_subcode;
    if (typeof sub === 'number') base.subcode = sub;
    const tid = options?.traceId || options?.apiError?.fbtrace_id;
    if (typeof tid === 'string') base.traceId = tid;
    super(message, code, base);
    this.name = 'WhatsAppApiError';
    if (options?.apiError !== undefined) {
      this.apiError = options.apiError;
    }
  }

  /**
   * Convert to JSON with API error details
   */
  override toJSON() {
    return {
      ...super.toJSON(),
      apiError: this.apiError,
    };
  }

  /**
   * Get detailed error message including API details
   */
  getDetailedMessage(): string {
    if (this.apiError?.error_data?.details) {
      return `${this.message}: ${this.apiError.error_data.details}`;
    }
    return this.message;
  }
}

/**
 * WhatsApp Validation Error
 * Errors related to invalid input data or configuration
 */
export class WhatsAppValidationError extends WhatsAppError {
  /** Field that failed validation */
  public readonly field?: string;
  /** Value that failed validation */
  public readonly value?: unknown;

  constructor(message: string, field?: string, value?: unknown) {
    super(message, HTTP_BAD_REQUEST, { type: 'ValidationError' });
    this.name = 'WhatsAppValidationError';
    if (field !== undefined) {
      this.field = field;
    }
    if (value !== undefined) {
      this.value = value;
    }
  }

  /**
   * Convert to JSON with validation details
   */
  override toJSON() {
    return {
      ...super.toJSON(),
      field: this.field,
      value: this.value,
    };
  }

  /**
   * Create validation error for specific field
   */
  static forField(
    field: string,
    value: unknown,
    reason: string,
  ): WhatsAppValidationError {
    return new WhatsAppValidationError(
      `Validation failed for field '${field}': ${reason}`,
      field,
      value,
    );
  }

  /**
   * Create validation error for required field
   */
  static requiredField(field: string): WhatsAppValidationError {
    return new WhatsAppValidationError(
      `Required field '${field}' is missing`,
      field,
      undefined,
    );
  }
}

/**
 * WhatsApp Rate Limit Error
 * Errors related to API rate limiting
 */
export class WhatsAppRateLimitError extends WhatsAppError {
  /** Seconds to wait before retrying */
  public readonly retryAfter?: number;
  /** Rate limit quota */
  public readonly limit?: number;
  /** Remaining requests in current window */
  public readonly remaining?: number;

  constructor(
    message: string,
    options?: { retryAfter?: number; limit?: number; remaining?: number },
  ) {
    super(message, MAGIC_429, { type: 'RateLimitError' });
    this.name = 'WhatsAppRateLimitError';
    if (options?.retryAfter !== undefined) this.retryAfter = options.retryAfter;
    if (options?.limit !== undefined) this.limit = options.limit;
    if (options?.remaining !== undefined) this.remaining = options.remaining;
  }

  /**
   * Convert to JSON with rate limit details
   */
  override toJSON() {
    return {
      ...super.toJSON(),
      retryAfter: this.retryAfter,
      limit: this.limit,
      remaining: this.remaining,
    };
  }

  /**
   * Get retry delay in milliseconds
   */
  getRetryDelay(): number {
    return (this.retryAfter || SECONDS_PER_MINUTE) * ANIMATION_DURATION_VERY_SLOW; // Default to SECONDS_PER_MINUTE seconds
  }

  /**
   * Check if rate limit has expired
   */
  canRetryNow(): boolean {
    if (!this.retryAfter) return true;
    return Date.now() - this.timestamp >= this.getRetryDelay();
  }
}

/**
 * WhatsApp Network Error
 * Errors related to network connectivity and timeouts
 */
export class WhatsAppNetworkError extends WhatsAppError {
  /** Original network error */
  public readonly originalError?: Error;
  /** Whether this was a timeout error */
  public readonly isTimeout?: boolean;

  constructor(message: string, originalError?: Error, isTimeout?: boolean) {
    super(message, 500, { type: 'NetworkError' });
    this.name = 'WhatsAppNetworkError';
    if (originalError !== undefined) {
      this.originalError = originalError;
    }
    if (isTimeout !== undefined) {
      this.isTimeout = isTimeout;
    }
  }

  /**
   * Convert to JSON with network error details
   */
  override toJSON() {
    return {
      ...super.toJSON(),
      originalError: this.originalError?.message,
      isTimeout: this.isTimeout,
    };
  }

  /**
   * Create timeout error
   */
  static timeout(timeoutMs: number): WhatsAppNetworkError {
    return new WhatsAppNetworkError(
      `Request timed out after ${timeoutMs}ms`,
      undefined,
      true,
    );
  }

  /**
   * Create connection error
   */
  static connection(originalError: Error): WhatsAppNetworkError {
    return new WhatsAppNetworkError(
      `Network connection failed: ${originalError.message}`,
      originalError,
      false,
    );
  }
}

/**
 * WhatsApp Authentication Error
 * Errors related to authentication and authorization
 */
export class WhatsAppAuthError extends WhatsAppError {
  /** Whether the token has expired */
  public readonly tokenExpired?: boolean;
  /** Whether the token is invalid */
  public readonly tokenInvalid?: boolean;

  constructor(message: string, tokenExpired?: boolean, tokenInvalid?: boolean) {
    super(message, HTTP_UNAUTHORIZED, { type: 'AuthError' });
    this.name = 'WhatsAppAuthError';
    if (tokenExpired !== undefined) {
      this.tokenExpired = tokenExpired;
    }
    if (tokenInvalid !== undefined) {
      this.tokenInvalid = tokenInvalid;
    }
  }

  /**
   * Convert to JSON with auth details
   */
  override toJSON() {
    return {
      ...super.toJSON(),
      tokenExpired: this.tokenExpired,
      tokenInvalid: this.tokenInvalid,
    };
  }

  /**
   * Create expired token error
   */
  static expiredToken(): WhatsAppAuthError {
    return new WhatsAppAuthError('Access token has expired', true, false);
  }

  /**
   * Create invalid token error
   */
  static invalidToken(): WhatsAppAuthError {
    return new WhatsAppAuthError('Access token is invalid', false, true);
  }
}

// ==================== Error Type Guards ====================

/**
 * Check if error is a WhatsApp error
 */
export function isWhatsAppError(error: unknown): error is WhatsAppError {
  return error instanceof WhatsAppError;
}

/**
 * Check if error is a WhatsApp API error
 */
export function isWhatsAppApiError(error: unknown): error is WhatsAppApiError {
  return error instanceof WhatsAppApiError;
}

/**
 * Check if error is a WhatsApp validation error
 */
export function isWhatsAppValidationError(
  error: unknown,
): error is WhatsAppValidationError {
  return error instanceof WhatsAppValidationError;
}

/**
 * Check if error is a WhatsApp rate limit error
 */
export function isWhatsAppRateLimitError(
  error: unknown,
): error is WhatsAppRateLimitError {
  return error instanceof WhatsAppRateLimitError;
}

/**
 * Check if error is a WhatsApp network error
 */
export function isWhatsAppNetworkError(
  error: unknown,
): error is WhatsAppNetworkError {
  return error instanceof WhatsAppNetworkError;
}

/**
 * Check if error is a WhatsApp authentication error
 */
export function isWhatsAppAuthError(
  error: unknown,
): error is WhatsAppAuthError {
  return error instanceof WhatsAppAuthError;
}

// ==================== Error Utilities ====================

/**
 * Create error from API response
 */
export function createErrorFromApiResponse(
  response: { status: number; data?: Record<string, unknown> },
  traceId?: string,
): WhatsAppError {
  const { status, data } = response;

  if (status === HTTP_UNAUTHORIZED) {
    return WhatsAppAuthError.invalidToken();
  }

  if (status === MAGIC_429) {
    const retryAfter =
      (data as Record<string, unknown>)?.error &&
      typeof (data as Record<string, unknown>).error === 'object'
        ? ((data as Record<string, unknown>).error as Record<string, unknown>)
            .retry_after
        : undefined;
    const retryAfterNumber =
      typeof retryAfter === 'number' ? retryAfter : undefined;
    const opts: { retryAfter?: number; limit?: number; remaining?: number } = {};
    if (typeof retryAfterNumber === 'number') opts.retryAfter = retryAfterNumber;
    return new WhatsAppRateLimitError('Rate limit exceeded', opts);
  }

  if (data?.error) {
    const errorMessage =
      typeof data.error === 'object' &&
      data.error !== null &&
      'message' in data.error
        ? (data.error as Record<string, unknown>).message || 'API Error'
        : 'API Error';
    const opts: { apiError?: WhatsAppApiError['apiError']; traceId?: string } = {};
    opts.apiError = data.error as WhatsAppApiError['apiError'];
    if (typeof traceId === 'string') opts.traceId = traceId;
    return new WhatsAppApiError(errorMessage as string, status, opts);
  }

  const base: { type: string; traceId?: string } = { type: 'HttpError' };
  if (typeof traceId === 'string') base.traceId = traceId;
  return new WhatsAppError(`HTTP ${status} Error`, status, base);
}

/**
 * Get error severity level
 */
export function getErrorSeverity(
  error: WhatsAppError,
): 'low' | 'medium' | 'high' | 'critical' {
  if (error instanceof WhatsAppAuthError) return 'critical';
  if (error instanceof WhatsAppValidationError) return 'medium';
  if (error instanceof WhatsAppRateLimitError) return 'medium';
  if (error instanceof WhatsAppNetworkError)
    return error.isTimeout ? 'medium' : 'high';
  if (error instanceof WhatsAppApiError) {
    return error.code >= 500 ? 'high' : 'medium';
  }
  return 'medium';
}
