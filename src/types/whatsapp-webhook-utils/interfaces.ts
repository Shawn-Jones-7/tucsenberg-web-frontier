/**
 * WhatsApp Webhook 工具接口定义
 * WhatsApp Webhook Utility Interface Definitions
 */

import type { WebhookEvent } from '@/types/whatsapp-webhook-events';

/**
 * Webhook解析结果
 * Webhook parsing result
 */
export interface WebhookParsingResult {
  success: boolean;
  events: WebhookEvent[];
  errors: Array<{
    entry_id?: string;
    error: string;
    raw_data?: Record<string, unknown> | string | unknown[];
  }>;
  metadata: {
    total_entries: number;
    parsed_entries: number;
    total_events: number;
    parsing_time_ms: number;
  };
}

/**
 * Webhook验证结果
 * Webhook validation result
 */
export interface WebhookValidationResult {
  is_valid: boolean;
  errors: string[];
  warnings: string[];
  signature_valid?: boolean;
  timestamp_valid?: boolean;
  payload_valid?: boolean;
}

/**
 * Webhook签名验证配置
 * Webhook signature verification configuration
 */
export interface SignatureVerificationConfig {
  app_secret: string;
  signature_header: string;
  timestamp_header?: string;
  max_timestamp_age_seconds?: number;
  algorithm: 'sha1' | 'sha256';
}

/**
 * Webhook处理上下文
 * Webhook processing context
 */
export interface WebhookProcessingContext {
  request_id: string;
  timestamp: string;
  source_ip?: string;
  user_agent?: string;
  headers: Record<string, string>;
  processing_start_time: number;
  retry_count?: number;
  batch_id?: string;
}

/**
 * Webhook响应配置
 * Webhook response configuration
 */
export interface WebhookResponseConfig {
  success_status_code: number;
  error_status_code: number;
  include_processing_time: boolean;
  include_event_count: boolean;
  custom_headers?: Record<string, string>;
  response_format: 'json' | 'text' | 'empty';
}

/**
 * Webhook重复检测配置
 * Webhook deduplication configuration
 */
export interface DeduplicationConfig {
  enabled: boolean;
  key_fields: string[];
  window_minutes: number;
  storage_type: 'memory' | 'redis' | 'database';
  max_entries: number;
}

/**
 * Webhook限流配置
 * Webhook rate limiting configuration
 */
export interface RateLimitConfig {
  enabled: boolean;
  max_requests_per_minute: number;
  max_requests_per_hour: number;
  burst_limit: number;
  key_generator: 'ip' | 'phone_number' | 'custom';
  custom_key_function?: (context: WebhookProcessingContext) => string;
}

/**
 * Webhook健康检查结果
 * Webhook health check result
 */
export interface WebhookHealthCheck {
  status: 'healthy' | 'degraded' | 'unhealthy';
  checks: {
    endpoint_reachable: boolean;
    signature_verification: boolean;
    event_processing: boolean;
    error_rate_acceptable: boolean;
    response_time_acceptable: boolean;
  };
  metrics: {
    uptime_percentage: number;
    average_response_time_ms: number;
    error_rate_percentage: number;
    last_successful_event?: string;
    last_error?: string;
  };
  recommendations: string[];
}

/**
 * Webhook调试信息
 * Webhook debug information
 */
export interface WebhookDebugInfo {
  request: {
    method: string;
    url: string;
    headers: Record<string, string>;
    body: string;
    timestamp: string;
  };
  processing: {
    parsed_events: WebhookEvent[];
    validation_result: WebhookValidationResult;
    processing_time_ms: number;
    errors: string[];
  };
  response: {
    status_code: number;
    headers: Record<string, string>;
    body: string;
    timestamp: string;
  };
}

/**
 * 事件聚合结果
 * Event aggregation result
 */
export interface EventAggregationResult {
  time_period: {
    start: string;
    end: string;
    duration_minutes: number;
  };
  totals: {
    events: number;
    unique_senders: number;
    unique_recipients: number;
    messages: number;
    errors: number;
  };
  by_type: Record<string, number>;
  by_hour: Array<{
    hour: string;
    count: number;
  }>;
  top_senders: Array<{
    phone_number: string;
    count: number;
  }>;
  error_summary: Array<{
    error_code: number;
    count: number;
    message: string;
  }>;
}
