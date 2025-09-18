// 导入主要类型用于向后兼容
import { DEFAULT_SERVICE_OPTIONS, type Cache, type CacheConfig, type CacheEntry, type CircuitBreakerConfig, type CircuitBreakerState, type DEFAULT_CACHE_CONFIG, type DEFAULT_CIRCUIT_BREAKER_CONFIG, type DEFAULT_RETRY_CONFIG, type LogEntry, type Logger, type LogLevel, type MessageStatus, type MessageType, type RetryConfig, type ServiceEnvironment, type ServiceEnvironmentConfig, type WhatsAppConfig, type WhatsAppServiceOptions } from '@/types/whatsapp-service-config';
import { PERCENTAGE_FULL, ZERO } from '@/constants';

// merged above
import {
  type WhatsAppError,
  type WhatsAppValidationError,
  WhatsAppApiError,
  WhatsAppAuthError,
  WhatsAppNetworkError,
  WhatsAppRateLimitError,
} from '@/types/whatsapp-service-errors';
import type {
  ApiRequest,
  ApiResponse,
  MessageRequest,
  MessageResponse,
  PluginManager,
  ServiceBuilder,
  ServiceFactory,
  ServicePlugin,
  WebhookConfig,
  WebhookHandler,
  WhatsAppServiceInterface,
} from '@/types/whatsapp-service-interface';
import type {
  ErrorEvent,
  HealthCheckEvent,
  MessageDeliveredEvent,
  MessageFailedEvent,
  MessageReadEvent,
  MessageSentEvent,
  RateLimitEvent,
  ServiceEvent,
  ServiceHealth,
  ServiceMetrics,
  ServiceStatus,
  WhatsAppServiceEvent,
} from '@/types/whatsapp-service-monitoring';

/**
 * WhatsApp Service Types - Main Entry Point
 * WhatsApp Service Configuration and Error Type Definitions
 *
 * 统一的WhatsApp服务类型定义入口，整合所有子模块功能
 */

// 重新导出所有模块的类型和功能
export { isWhatsAppService } from '@/types/whatsapp-service-interface';
export {
  mergeWithDefaults, validateServiceOptions, validateWhatsAppConfig
} from '@/types/whatsapp-service-config';
export {
  createErrorFromApiResponse,
  getErrorSeverity, isWhatsAppApiError, isWhatsAppAuthError, isWhatsAppError, isWhatsAppNetworkError, isWhatsAppRateLimitError, isWhatsAppValidationError
} from '@/types/whatsapp-service-errors';
export type {
  Config, Health,
  Metrics, ServiceError, ServiceInterface, ServiceOptions,
  Status
} from '@/types/whatsapp-service-interface';
export {
  calculateErrorRate, calculateUptime, createDefaultHealth, createDefaultMetrics, determineHealthStatus, needsAttention, updateMetrics
} from '@/types/whatsapp-service-monitoring';
export type {
  AlertConfig, HealthCheckConfig,
  MetricsConfig
} from '@/types/whatsapp-service-monitoring';

// ==================== 向后兼容的常量导出 ====================

/**
 * 向后兼容的常量导出
 * Backward compatible constant exports
 */
export {
  DEFAULT_SERVICE_OPTIONS, type DEFAULT_CACHE_CONFIG, type DEFAULT_CIRCUIT_BREAKER_CONFIG, type DEFAULT_RETRY_CONFIG
};

// ==================== 向后兼容的类型别名 ====================

/**
 * 向后兼容的类型别名
 * Backward compatible type aliases
 */
  export type {
    ApiRequest,
    ApiResponse, Cache, CacheConfig,
    CacheEntry, CircuitBreakerConfig,
    CircuitBreakerState, ErrorEvent,
    HealthCheckEvent, LogEntry,
    Logger, LogLevel, MessageDeliveredEvent, MessageFailedEvent, MessageReadEvent, MessageRequest,
    MessageResponse, MessageSentEvent, MessageStatus, MessageType, PluginManager, RateLimitEvent, RetryConfig, ServiceBuilder, ServiceEnvironment, ServiceEnvironmentConfig, ServiceEvent, ServiceFactory, ServiceHealth,
    ServiceMetrics, ServicePlugin, ServiceStatus, WebhookConfig, WebhookHandler, WhatsAppConfig, WhatsAppServiceEvent,
    WhatsAppServiceInterface, WhatsAppServiceOptions
  };

// ==================== 向后兼容的类导出 ====================

/**
 * 向后兼容的错误类导出
 * Backward compatible error class exports
 */
  export {
    WhatsAppApiError, WhatsAppAuthError, WhatsAppNetworkError, WhatsAppRateLimitError, type WhatsAppError, type WhatsAppValidationError
  };

// ==================== 便捷工厂函数 ====================

/**
 * 创建默认配置
 * Create default configuration
 */
export function createDefaultConfig(): WhatsAppConfig {
  return {
    accessToken: '',
    phoneNumberId: '',
    verifyToken: '',
    apiVersion: 'v18.0',
  };
}

/**
 * 创建默认服务选项
 * Create default service options
 */
export function createDefaultServiceOptions(): Required<WhatsAppServiceOptions> {
  return { ...DEFAULT_SERVICE_OPTIONS };
}

/**
 * 创建默认服务状态
 * Create default service status
 */
export function createDefaultServiceStatus(): ServiceStatus {
  return {
    isInitialized: false,
    isConnected: false,
    lastActivity: Date.now(),
    health: {
      status: 'healthy',
      lastCheck: Date.now(),
      responseTime: ZERO,
      errorRate: ZERO,
      uptime: PERCENTAGE_FULL,
      details: {
        api: 'available',
        webhook: 'not_configured',
        phoneNumber: 'unverified',
      },
    },
    metrics: {
      messagesSent: ZERO,
      messagesDelivered: ZERO,
      messagesRead: ZERO,
      messagesFailed: ZERO,
      apiCalls: ZERO,
      apiErrors: ZERO,
      averageResponseTime: ZERO,
      uptime: PERCENTAGE_FULL,
      lastReset: Date.now(),
    },
    config: {
      phoneNumberId: '',
      apiVersion: 'v18.0',
      webhookConfigured: false,
    },
  };
}

// ==================== 默认导出 ====================

/**
 * 默认导出主要配置类型
 * Default export main configuration type
 */
export type { WhatsAppConfig as default };
