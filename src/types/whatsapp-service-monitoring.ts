import { COUNT_FIVE, COUNT_TEN, MAGIC_0_1, MAGIC_2000, MAGIC_95, MAGIC_99 } from '@/constants/magic-numbers';

/**
 * WhatsApp Service Monitoring and Health Types
 *
 * This module provides type definitions for service health monitoring,
 * metrics collection, status tracking, and event handling.
 */

// ==================== Service Health Types ====================

/**
 * Service Health Status
 * Overall health assessment of the WhatsApp service
 */
export interface ServiceHealth {
  /** Overall service status */
  status: 'healthy' | 'degraded' | 'unhealthy';
  /** Timestamp of last health check */
  lastCheck: number;
  /** Average response time in milliseconds */
  responseTime?: number;
  /** Error rate as percentage (0-100) */
  errorRate?: number;
  /** Service uptime as percentage (0-100) */
  uptime?: number;
  /** Detailed health information */
  details?: {
    /** API availability status */
    api: 'available' | 'unavailable';
    /** Webhook configuration status */
    webhook: 'configured' | 'not_configured' | 'error';
    /** Phone number verification status */
    phoneNumber: 'verified' | 'unverified' | 'error';
  };
}

/**
 * Service Metrics
 * Quantitative metrics for service performance monitoring
 */
export interface ServiceMetrics {
  /** Total number of messages sent */
  messagesSent: number;
  /** Total number of messages delivered */
  messagesDelivered: number;
  /** Total number of messages read by recipients */
  messagesRead: number;
  /** Total number of failed message attempts */
  messagesFailed: number;
  /** Total number of API calls made */
  apiCalls: number;
  /** Total number of API errors encountered */
  apiErrors: number;
  /** Average response time for API calls in milliseconds */
  averageResponseTime: number;
  /** Service uptime as percentage (0-100) */
  uptime: number;
  /** Timestamp when metrics were last reset */
  lastReset: number;
}

/**
 * Service Status
 * Complete status information for the WhatsApp service
 */
export interface ServiceStatus {
  /** Whether the service has been initialized */
  isInitialized: boolean;
  /** Whether the service is currently connected */
  isConnected: boolean;
  /** Timestamp of last service activity */
  lastActivity: number;
  /** Current health status */
  health: ServiceHealth;
  /** Performance metrics */
  metrics: ServiceMetrics;
  /** Configuration summary */
  config: {
    /** Phone number ID being used */
    phoneNumberId: string;
    /** API version being used */
    apiVersion: string;
    /** Whether webhook is configured */
    webhookConfigured: boolean;
  };
}

// ==================== Event Types ====================

/**
 * Base Service Event
 * Common structure for all service events
 */
export interface ServiceEvent {
  /** Event type identifier */
  type: string;
  /** Timestamp when event occurred */
  timestamp: number;
  /** Event-specific data */
  data: Record<string, unknown>;
  /** Source of the event */
  source: 'api' | 'webhook' | 'service';
}

/**
 * Message Sent Event
 * Fired when a message is successfully sent
 */
export interface MessageSentEvent extends ServiceEvent {
  type: 'message_sent';
  data: {
    /** WhatsApp message ID */
    messageId: string;
    /** Recipient phone number */
    to: string;
    /** Type of message sent */
    messageType: string;
    /** Timestamp when message was sent */
    sentAt: number;
  };
}

/**
 * Message Delivered Event
 * Fired when a message is delivered to recipient
 */
export interface MessageDeliveredEvent extends ServiceEvent {
  type: 'message_delivered';
  data: {
    /** WhatsApp message ID */
    messageId: string;
    /** Recipient phone number */
    to: string;
    /** Timestamp when message was delivered */
    deliveredAt: number;
  };
}

/**
 * Message Read Event
 * Fired when a message is read by recipient
 */
export interface MessageReadEvent extends ServiceEvent {
  type: 'message_read';
  data: {
    /** WhatsApp message ID */
    messageId: string;
    /** Recipient phone number */
    to: string;
    /** Timestamp when message was read */
    readAt: number;
  };
}

/**
 * Message Failed Event
 * Fired when a message fails to send
 */
export interface MessageFailedEvent extends ServiceEvent {
  type: 'message_failed';
  data: {
    /** WhatsApp message ID (if available) */
    messageId?: string;
    /** Recipient phone number */
    to: string;
    /** Error that caused the failure */
    error: {
      code: number;
      message: string;
      type: string;
    };
    /** Timestamp when failure occurred */
    failedAt: number;
  };
}

/**
 * Error Event
 * Fired when a service error occurs
 */
export interface ErrorEvent extends ServiceEvent {
  type: 'error';
  data: {
    /** Error object */
    error: {
      name: string;
      message: string;
      code: number;
      type: string;
      stack?: string;
    };
    /** Additional context */
    context?: Record<string, unknown>;
  };
}

/**
 * Health Check Event
 * Fired when a health check is performed
 */
export interface HealthCheckEvent extends ServiceEvent {
  type: 'health_check';
  data: {
    /** Health status result */
    status: 'healthy' | 'degraded' | 'unhealthy';
    /** Response time for health check */
    responseTime: number;
    /** Any issues detected */
    issues?: string[];
  };
}

/**
 * Rate Limit Event
 * Fired when rate limiting occurs
 */
export interface RateLimitEvent extends ServiceEvent {
  type: 'rate_limit';
  data: {
    /** Seconds to wait before retrying */
    retryAfter: number;
    /** Current rate limit */
    limit?: number;
    /** Remaining requests */
    remaining?: number;
  };
}

/**
 * Union type for all WhatsApp service events
 */
export type WhatsAppServiceEvent =
  | MessageSentEvent
  | MessageDeliveredEvent
  | MessageReadEvent
  | MessageFailedEvent
  | ErrorEvent
  | HealthCheckEvent
  | RateLimitEvent;

// ==================== Monitoring Configuration ====================

/**
 * Health Check Configuration
 * Configuration for automated health checks
 */
export interface HealthCheckConfig {
  /** Interval between health checks in milliseconds */
  interval: number;
  /** Timeout for health check requests in milliseconds */
  timeout: number;
  /** Number of consecutive failures before marking as unhealthy */
  failureThreshold: number;
  /** Number of consecutive successes before marking as healthy */
  successThreshold: number;
  /** Whether to perform deep health checks */
  deepCheck: boolean;
}

/**
 * Metrics Collection Configuration
 * Configuration for metrics collection and aggregation
 */
export interface MetricsConfig {
  /** Whether to collect metrics */
  enabled: boolean;
  /** Interval for metrics collection in milliseconds */
  collectionInterval: number;
  /** How long to retain metrics in milliseconds */
  retentionPeriod: number;
  /** Whether to aggregate metrics */
  aggregateMetrics: boolean;
  /** Metrics aggregation window in milliseconds */
  aggregationWindow: number;
}

/**
 * Alert Configuration
 * Configuration for service alerts and notifications
 */
export interface AlertConfig {
  /** Whether alerts are enabled */
  enabled: boolean;
  /** Error rate threshold for alerts (percentage) */
  errorRateThreshold: number;
  /** Response time threshold for alerts (milliseconds) */
  responseTimeThreshold: number;
  /** Failure count threshold for alerts */
  failureCountThreshold: number;
  /** Cooldown period between alerts in milliseconds */
  alertCooldown: number;
}

// ==================== Monitoring Utilities ====================

/**
 * Calculate service uptime percentage
 */
export function calculateUptime(totalTime: number, downTime: number): number {
  if (totalTime <= 0) return 100;
  return Math.max(0, Math.min(100, ((totalTime - downTime) / totalTime) * 100));
}

/**
 * Calculate error rate percentage
 */
export function calculateErrorRate(
  totalRequests: number,
  errorCount: number,
): number {
  if (totalRequests <= 0) return 0;
  return Math.min(100, (errorCount / totalRequests) * 100);
}

/**
 * Determine health status based on metrics
 */
export function determineHealthStatus(
  errorRate: number,
  responseTime: number,
  uptime: number,
): 'healthy' | 'degraded' | 'unhealthy' {
  // Unhealthy thresholds
  if (errorRate > COUNT_TEN || responseTime > 5000 || uptime < MAGIC_95) {
    return 'unhealthy';
  }

  // Degraded thresholds
  if (errorRate > COUNT_FIVE || responseTime > MAGIC_2000 || uptime < MAGIC_99) {
    return 'degraded';
  }

  return 'healthy';
}

/**
 * Create default service metrics
 */
export function createDefaultMetrics(): ServiceMetrics {
  return {
    messagesSent: 0,
    messagesDelivered: 0,
    messagesRead: 0,
    messagesFailed: 0,
    apiCalls: 0,
    apiErrors: 0,
    averageResponseTime: 0,
    uptime: 100,
    lastReset: Date.now(),
  };
}

/**
 * Create default health status
 */
export function createDefaultHealth(): ServiceHealth {
  return {
    status: 'healthy',
    lastCheck: Date.now(),
    responseTime: 0,
    errorRate: 0,
    uptime: 100,
    details: {
      api: 'available',
      webhook: 'not_configured',
      phoneNumber: 'unverified',
    },
  };
}

/**
 * Update metrics with new data point
 */
export function updateMetrics(
  current: ServiceMetrics,
  update: Partial<ServiceMetrics>,
): ServiceMetrics {
  return {
    ...current,
    ...update,
    // Recalculate average response time if new response time provided
    averageResponseTime:
      update.averageResponseTime !== undefined
        ? update.averageResponseTime
        : current.averageResponseTime,
  };
}

/**
 * Check if service needs attention based on metrics
 */
export function needsAttention(
  health: ServiceHealth,
  metrics: ServiceMetrics,
): boolean {
  return (
    health.status !== 'healthy' ||
    (health.errorRate && health.errorRate > COUNT_FIVE) ||
    (health.responseTime && health.responseTime > MAGIC_2000) ||
    metrics.messagesFailed > metrics.messagesSent * MAGIC_0_1
  );
}
