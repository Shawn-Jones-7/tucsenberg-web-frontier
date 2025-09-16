import { COUNT_TEN, MAGIC_300000 } from '@/constants/magic-numbers';

/**
 * WhatsApp Service Configuration Types
 *
 * This module provides type definitions for WhatsApp service configuration,
 * service options, and environment-specific configurations.
 */

// ==================== Basic Configuration Types ====================

/**
 * WhatsApp API Configuration
 * Core configuration required for WhatsApp Business API integration
 */
export interface WhatsAppConfig {
  /** Access token for WhatsApp Business API */
  accessToken: string;
  /** Phone number ID from WhatsApp Business Account */
  phoneNumberId: string;
  /** Verification token for webhook validation */
  verifyToken: string;
  /** Webhook URL for receiving messages (optional) */
  webhookUrl?: string;
  /** API version to use (optional, defaults to latest) */
  apiVersion?: string;
  /** Business Account ID (optional) */
  businessAccountId?: string;
  /** App secret for additional security (optional) */
  appSecret?: string;
}

/**
 * WhatsApp Service Options
 * Optional configuration for service behavior and performance tuning
 */
export interface WhatsAppServiceOptions {
  /** Request timeout in milliseconds (default: 30000) */
  timeout?: number;
  /** Maximum number of retry attempts (default: 3) */
  retries?: number;
  /** Initial retry delay in milliseconds (default: 1000) */
  retryDelay?: number;
  /** Maximum retry delay in milliseconds (default: 10000) */
  maxRetryDelay?: number;
  /** Retry delay multiplier for exponential backoff (default: 2) */
  retryMultiplier?: number;
  /** Enable service logging (default: true) */
  enableLogging?: boolean;
  /** Logging level (default: 'info') */
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
  /** Enable message validation before sending (default: true) */
  validateMessages?: boolean;
  /** Rate limiting strategy (default: 'exponential') */
  rateLimitStrategy?: 'exponential' | 'linear' | 'fixed';
  /** Maximum rate limit attempts (default: 5) */
  rateLimitMaxAttempts?: number;
}

/**
 * Environment-specific Configuration
 * Allows different configurations for different environments
 */
export interface ServiceEnvironmentConfig {
  /** Development environment configuration */
  development: WhatsAppConfig;
  /** Staging environment configuration */
  staging: WhatsAppConfig;
  /** Production environment configuration */
  production: WhatsAppConfig;
}

// ==================== Retry and Circuit Breaker Configuration ====================

/**
 * Retry Configuration
 * Configuration for retry logic and exponential backoff
 */
export interface RetryConfig {
  /** Maximum number of retry attempts */
  maxAttempts: number;
  /** Base delay between retries in milliseconds */
  baseDelay: number;
  /** Maximum delay between retries in milliseconds */
  maxDelay: number;
  /** Multiplier for exponential backoff */
  multiplier: number;
  /** Add random jitter to prevent thundering herd */
  jitter: boolean;
}

/**
 * Circuit Breaker Configuration
 * Configuration for circuit breaker pattern implementation
 */
export interface CircuitBreakerConfig {
  /** Number of failures before opening circuit */
  failureThreshold: number;
  /** Time to wait before attempting recovery in milliseconds */
  recoveryTimeout: number;
  /** Period for monitoring failures in milliseconds */
  monitoringPeriod: number;
  /** List of expected error types that should trigger circuit breaker */
  expectedErrors: string[];
}

/**
 * Circuit Breaker State
 * Current state of the circuit breaker
 */
export interface CircuitBreakerState {
  /** Current circuit state */
  state: 'closed' | 'open' | 'half-open';
  /** Current failure count */
  failureCount: number;
  /** Timestamp of last failure */
  lastFailureTime?: number;
  /** Timestamp when next attempt is allowed */
  nextAttemptTime?: number;
}

// ==================== Cache Configuration ====================

/**
 * Cache Configuration
 * Configuration for caching mechanisms
 */
export interface CacheConfig {
  /** Time to live in milliseconds */
  ttl: number;
  /** Maximum number of entries in cache */
  maxSize: number;
  /** Cache eviction strategy */
  strategy: 'lru' | 'fifo' | 'lfu';
}

/**
 * Cache Entry
 * Individual cache entry with metadata
 */
export interface CacheEntry<T> {
  /** Cached value */
  value: T;
  /** Timestamp when entry was created */
  timestamp: number;
  /** Time to live for this entry */
  ttl: number;
  /** Number of times this entry has been accessed */
  accessCount: number;
}

/**
 * Cache Interface
 * Generic cache interface for different cache implementations
 */
export interface Cache<T> {
  /** Get value from cache */
  get: (key: string) => T | undefined;
  /** Set value in cache */
  set: (key: string, value: T, ttl?: number) => void;
  /** Delete value from cache */
  delete: (key: string) => boolean;
  /** Clear all cache entries */
  clear: () => void;
  /** Get current cache size */
  size: () => number;
  /** Get all cache keys */
  keys: () => string[];
}

// ==================== Logging Configuration ====================

/**
 * Log Entry
 * Structure for individual log entries
 */
export interface LogEntry {
  /** Timestamp of log entry */
  timestamp: number;
  /** Log level */
  level: 'debug' | 'info' | 'warn' | 'error';
  /** Log message */
  message: string;
  /** Additional context data */
  context?: Record<string, unknown>;
  /** Error object if applicable */
  error?: Error;
  /** Trace ID for request tracking */
  traceId?: string;
  /** Phone number ID for WhatsApp context */
  phoneNumberId?: string;
  /** Message ID for message-specific logs */
  messageId?: string;
}

/**
 * Logger Interface
 * Standard logging interface for the service
 */
export interface Logger {
  /** Log debug message */
  debug: (message: string, context?: Record<string, unknown>) => void;
  /** Log info message */
  info: (message: string, context?: Record<string, unknown>) => void;
  /** Log warning message */
  warn: (message: string, context?: Record<string, unknown>) => void;
  /** Log error message */
  error: (
    message: string,
    error?: Error,
    context?: Record<string, unknown>,
  ) => void;
}

// ==================== Utility Types ====================

/**
 * Message Type Enumeration
 * All supported WhatsApp message types
 */
export type MessageType =
  | 'text'
  | 'image'
  | 'document'
  | 'audio'
  | 'video'
  | 'location'
  | 'contacts'
  | 'template'
  | 'interactive';

/**
 * Message Status Enumeration
 * All possible message delivery statuses
 */
export type MessageStatus = 'sent' | 'delivered' | 'read' | 'failed';

/**
 * Service Environment Enumeration
 * Supported deployment environments
 */
export type ServiceEnvironment = 'development' | 'staging' | 'production';

/**
 * Log Level Enumeration
 * Supported logging levels
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

// ==================== Default Configurations ====================

/**
 * Default Service Options
 * Sensible defaults for WhatsApp service configuration
 */
export const DEFAULT_SERVICE_OPTIONS: Required<WhatsAppServiceOptions> = {
  timeout: 30000,
  retries: 3,
  retryDelay: 1000,
  maxRetryDelay: 10000,
  retryMultiplier: 2,
  enableLogging: true,
  logLevel: 'info',
  validateMessages: true,
  rateLimitStrategy: 'exponential',
  rateLimitMaxAttempts: 5,
};

/**
 * Default Retry Configuration
 * Sensible defaults for retry logic
 */
export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  multiplier: 2,
  jitter: true,
};

/**
 * Default Circuit Breaker Configuration
 * Sensible defaults for circuit breaker pattern
 */
export const DEFAULT_CIRCUIT_BREAKER_CONFIG: CircuitBreakerConfig = {
  failureThreshold: 5,
  recoveryTimeout: 60000,
  monitoringPeriod: 10000,
  expectedErrors: ['WhatsAppRateLimitError', 'WhatsAppNetworkError'],
};

/**
 * Default Cache Configuration
 * Sensible defaults for caching
 */
export const DEFAULT_CACHE_CONFIG: CacheConfig = {
  ttl: MAGIC_300000, // 5 minutes
  maxSize: 1000,
  strategy: 'lru',
};

// ==================== Configuration Validation ====================

/**
 * Validate WhatsApp Configuration
 * Ensures all required configuration fields are present and valid
 */
export function validateWhatsAppConfig(
  config: Partial<WhatsAppConfig>,
): config is WhatsAppConfig {
  return Boolean(config.accessToken &&
    config.phoneNumberId &&
    config.verifyToken &&
    typeof config.accessToken === 'string' &&
    typeof config.phoneNumberId === 'string' &&
    typeof config.verifyToken === 'string');
}

/**
 * Validate Service Options
 * Ensures service options are within acceptable ranges
 */
export function validateServiceOptions(
  options: WhatsAppServiceOptions,
): boolean {
  if (options.timeout && (options.timeout < 1000 || options.timeout > MAGIC_300000)) {
    return false; // Timeout should be between 1s and 5min
  }

  if (options.retries && (options.retries < 0 || options.retries > COUNT_TEN)) {
    return false; // Retries should be between 0 and COUNT_TEN
  }

  if (options.retryDelay && options.retryDelay < 100) {
    return false; // Retry delay should be at least 100ms
  }

  return true;
}

/**
 * Merge Configuration with Defaults
 * Combines user configuration with default values
 */
export function mergeWithDefaults(
  config: WhatsAppConfig,
  options?: WhatsAppServiceOptions,
): { config: WhatsAppConfig; options: Required<WhatsAppServiceOptions> } {
  return {
    config: {
      apiVersion: 'v18.0',
      ...config,
    },
    options: {
      ...DEFAULT_SERVICE_OPTIONS,
      ...options,
    },
  };
}
