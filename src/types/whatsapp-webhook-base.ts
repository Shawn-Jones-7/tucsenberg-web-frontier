/**
 * WhatsApp Webhook 基础类型定义
 * WhatsApp Webhook Base Type Definitions
 *
 * 提供WhatsApp Business API webhook的基础类型定义
 */

import type {
  MessageStatus,
  WhatsAppContact,
  WhatsAppError,
  WhatsAppMessage,
} from '@/types/whatsapp-base-types';

/**
 * Webhook入口类型
 * Webhook entry types
 */
export interface WebhookEntry {
  id: string;
  changes: Array<{
    value: {
      messaging_product: 'whatsapp';
      metadata: {
        display_phone_number: string;
        phone_number_id: string;
      };
      contacts?: WhatsAppContact[];
      messages?: WhatsAppMessage[];
      statuses?: MessageStatusUpdate[];
      errors?: WebhookError[];
    };
    field: 'messages';
  }>;
}

/**
 * 主要Webhook载荷
 * Main webhook payload
 */
export interface WebhookPayload {
  object: 'whatsapp_business_account';
  entry: WebhookEntry[];
}

/**
 * 消息状态更新类型
 * Message status update types
 */
export interface MessageStatusUpdate {
  id: string;
  status: MessageStatus;
  timestamp: string;
  recipient_id: string;
  conversation?: {
    id: string;
    expiration_timestamp?: string;
    origin: {
      type: 'business_initiated' | 'customer_initiated' | 'referral_conversion';
    };
  };
  pricing?: {
    billable: boolean;
    pricing_model: 'CBP' | 'NBP';
    category: string;
  };
  errors?: WhatsAppError[];
}

/**
 * Webhook错误类型
 * Webhook error types
 */
export interface WebhookError {
  code: number;
  title: string;
  message: string;
  error_data?: {
    details: string;
  };
  href?: string;
}

/**
 * 消息上下文（用于回复和转发）
 * Message context (for replies and forwards)
 */
export interface MessageContext {
  from: string;
  id: string;
  frequently_forwarded?: boolean;
  forwarded?: boolean;
  referred_product?: {
    catalog_id: string;
    product_retailer_id: string;
  };
}

/**
 * Webhook验证请求
 * Webhook verification request
 */
export interface WebhookVerificationRequest {
  'hub.mode': 'subscribe';
  'hub.challenge': string;
  'hub.verify_token': string;
}

/**
 * Webhook验证响应
 * Webhook verification response
 */
export interface WebhookVerificationResponse {
  challenge: string;
}

/**
 * Webhook配置类型
 * Webhook configuration types
 */
export interface WebhookConfig {
  endpoint: string;
  verify_token: string;
  app_secret?: string;
  fields: string[];
}

/**
 * Webhook订阅
 * Webhook subscription
 */
export interface WebhookSubscription {
  object: 'whatsapp_business_account';
  callback_url: string;
  fields: string[];
  verify_token: string;
  access_token: string;
}

/**
 * Webhook处理结果
 * Webhook processing result
 */
export interface WebhookProcessingResult {
  success: boolean;
  processed_events: number;
  errors: Array<{
    event_type: string;
    error: string;
    timestamp: string;
  }>;
  processing_time_ms: number;
}

/**
 * Webhook安全配置
 * Webhook security configuration
 */
export interface WebhookSecurityConfig {
  verify_signature: boolean;
  app_secret: string;
  allowed_origins?: string[];
  rate_limit?: {
    max_requests: number;
    window_ms: number;
  };
}

/**
 * Webhook重试配置
 * Webhook retry configuration
 */
export interface WebhookRetryConfig {
  max_retries: number;
  initial_delay_ms: number;
  max_delay_ms: number;
  backoff_multiplier: number;
  retry_on_status_codes: number[];
}

/**
 * Webhook监控配置
 * Webhook monitoring configuration
 */
export interface WebhookMonitoringConfig {
  enable_logging: boolean;
  log_level: 'debug' | 'info' | 'warn' | 'error';
  metrics_enabled: boolean;
  health_check_interval_ms: number;
  alert_thresholds: {
    error_rate_percent: number;
    response_time_ms: number;
  };
}

/**
 * Webhook状态
 * Webhook status
 */
export interface WebhookStatus {
  is_active: boolean;
  last_successful_delivery?: string;
  last_error?: {
    timestamp: string;
    error: string;
    status_code?: number;
  };
  total_deliveries: number;
  successful_deliveries: number;
  failed_deliveries: number;
  average_response_time_ms: number;
}

/**
 * Webhook元数据
 * Webhook metadata
 */
export interface WebhookMetadata {
  webhook_id: string;
  created_at: string;
  updated_at: string;
  version: string;
  description?: string;
  tags?: string[];
  owner: {
    user_id: string;
    email: string;
  };
}

/**
 * Webhook批处理配置
 * Webhook batch processing configuration
 */
export interface WebhookBatchConfig {
  enabled: boolean;
  batch_size: number;
  flush_interval_ms: number;
  max_wait_time_ms: number;
  parallel_processing: boolean;
  max_concurrent_batches: number;
}

/**
 * Webhook过滤器配置
 * Webhook filter configuration
 */
export interface WebhookFilterConfig {
  message_types?: string[];
  sender_filters?: {
    include_patterns?: string[];
    exclude_patterns?: string[];
  };
  content_filters?: {
    keywords?: string[];
    regex_patterns?: string[];
  };
  time_filters?: {
    start_time?: string;
    end_time?: string;
    timezone?: string;
  };
}

/**
 * Webhook转换配置
 * Webhook transformation configuration
 */
export interface WebhookTransformConfig {
  enabled: boolean;
  transformations: Array<{
    field_path: string;
    operation: 'rename' | 'remove' | 'add' | 'modify';
    target_path?: string;
    value?: string | number | boolean | Record<string, unknown> | unknown[];
    condition?: string;
  }>;
  custom_headers?: Record<string, string>;
  response_format?: 'json' | 'xml' | 'form-data';
}

/**
 * 完整的Webhook配置
 * Complete webhook configuration
 */
export interface CompleteWebhookConfig {
  basic: WebhookConfig;
  security: WebhookSecurityConfig;
  retry: WebhookRetryConfig;
  monitoring: WebhookMonitoringConfig;
  batch: WebhookBatchConfig;
  filter: WebhookFilterConfig;
  transform: WebhookTransformConfig;
  metadata: WebhookMetadata;
}

/**
 * Webhook常量
 * Webhook constants
 */
export const WEBHOOK_FIELDS = [
  'messages',
  'message_deliveries',
  'message_reads',
  'message_reactions',
  'message_echoes',
] as const;

export const WEBHOOK_OBJECT_TYPES = ['whatsapp_business_account'] as const;

export const WEBHOOK_CHANGE_FIELDS = ['messages'] as const;

/**
 * Webhook字段类型
 * Webhook field types
 */
export type WebhookField = (typeof WEBHOOK_FIELDS)[number];
export type WebhookObjectType = (typeof WEBHOOK_OBJECT_TYPES)[number];
export type WebhookChangeField = (typeof WEBHOOK_CHANGE_FIELDS)[number];

/**
 * 类型守卫函数
 * Type guard functions
 */
export function isWebhookPayload(obj: unknown): obj is WebhookPayload {
  return Boolean(
    obj &&
      typeof obj === 'object' &&
      (obj as Record<string, unknown>).object === 'whatsapp_business_account' &&
      Array.isArray((obj as Record<string, unknown>).entry),
  );
}

export function isWebhookEntry(obj: unknown): obj is WebhookEntry {
  return Boolean(
    obj &&
      typeof obj === 'object' &&
      typeof (obj as Record<string, unknown>).id === 'string' &&
      Array.isArray((obj as Record<string, unknown>).changes),
  );
}

export function isMessageStatusUpdate(
  obj: unknown,
): obj is MessageStatusUpdate {
  return Boolean(
    obj &&
      typeof obj === 'object' &&
      typeof (obj as Record<string, unknown>).id === 'string' &&
      typeof (obj as Record<string, unknown>).status === 'string' &&
      typeof (obj as Record<string, unknown>).timestamp === 'string' &&
      typeof (obj as Record<string, unknown>).recipient_id === 'string',
  );
}

export function isWebhookError(obj: unknown): obj is WebhookError {
  return Boolean(
    obj &&
      typeof obj === 'object' &&
      typeof (obj as Record<string, unknown>).code === 'number' &&
      typeof (obj as Record<string, unknown>).title === 'string' &&
      typeof (obj as Record<string, unknown>).message === 'string',
  );
}

export function isWebhookVerificationRequest(
  query: unknown,
): query is WebhookVerificationRequest {
  return Boolean(
    query &&
      typeof query === 'object' &&
      'hub.mode' in query &&
      'hub.challenge' in query &&
      'hub.verify_token' in query &&
      (query as Record<string, unknown>)['hub.mode'] === 'subscribe',
  );
}
