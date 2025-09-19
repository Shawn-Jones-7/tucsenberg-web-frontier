/**
 * WhatsApp Webhook 事件类型定义
 * WhatsApp Webhook Event Type Definitions
 *
 * 提供WhatsApp webhook事件的类型定义和处理接口
 */

import type { WhatsAppContact } from '@/types/whatsapp-base-types';
import type {
  MessageStatusUpdate,
  WebhookError,
} from '@/types/whatsapp-webhook-base';
import type { IncomingWhatsAppMessage } from '@/types/whatsapp-webhook-messages';
import {
  ANIMATION_DURATION_VERY_SLOW,
  COUNT_FIVE,
  COUNT_PAIR,
  COUNT_QUAD,
  COUNT_TEN,
  COUNT_TRIPLE,
  DAYS_PER_WEEK,
  HOURS_PER_DAY,
  MAGIC_6,
  MAGIC_8,
  MAGIC_9,
  ONE,
  SECONDS_PER_MINUTE,
} from '@/constants';

/**
 * 消息接收事件
 * Message received event
 */
export interface MessageReceivedEvent {
  type: 'message_received';
  timestamp: string;
  phone_number_id: string;
  from: string;
  message: IncomingWhatsAppMessage;
  contact?: WhatsAppContact;
}

/**
 * 消息状态事件
 * Message status event
 */
export interface MessageStatusEvent {
  type: 'message_status';
  timestamp: string;
  phone_number_id: string;
  status_update: MessageStatusUpdate;
}

/**
 * Webhook错误事件
 * Webhook error event
 */
export interface WebhookErrorEvent {
  type: 'webhook_error';
  timestamp: string;
  phone_number_id: string;
  error: WebhookError;
}

/**
 * 消息读取事件
 * Message read event
 */
export interface MessageReadEvent {
  type: 'message_read';
  timestamp: string;
  phone_number_id: string;
  from: string;
  message_id: string;
  read_timestamp: string;
}

/**
 * 消息传递事件
 * Message delivery event
 */
export interface MessageDeliveryEvent {
  type: 'message_delivery';
  timestamp: string;
  phone_number_id: string;
  to: string;
  message_id: string;
  delivery_timestamp: string;
}

/**
 * 用户状态变更事件
 * User status change event
 */
export interface UserStatusChangeEvent {
  type: 'user_status_change';
  timestamp: string;
  phone_number_id: string;
  from: string;
  status: 'online' | 'offline' | 'typing' | 'recording';
}

/**
 * 账户更新事件
 * Account update event
 */
export interface AccountUpdateEvent {
  type: 'account_update';
  timestamp: string;
  phone_number_id: string;
  update_type: 'profile' | 'business_info' | 'settings';
  changes: Record<
    string,
    string | number | boolean | Record<string, unknown> | unknown[]
  >;
}

/**
 * 模板状态事件
 * Template status event
 */
export interface TemplateStatusEvent {
  type: 'template_status';
  timestamp: string;
  phone_number_id: string;
  template_id: string;
  template_name: string;
  status: 'approved' | 'rejected' | 'pending' | 'disabled';
  reason?: string;
}

/**
 * 电话号码质量更新事件
 * Phone number quality update event
 */
export interface PhoneNumberQualityEvent {
  type: 'phone_number_quality';
  timestamp: string;
  phone_number_id: string;
  quality_score: number;
  quality_rating: 'green' | 'yellow' | 'red';
  previous_rating?: 'green' | 'yellow' | 'red';
}

/**
 * 安全事件
 * Security event
 */
export interface SecurityEvent {
  type: 'security_event';
  timestamp: string;
  phone_number_id: string;
  event_type:
    | 'suspicious_activity'
    | 'rate_limit_exceeded'
    | 'unauthorized_access';
  details: {
    source_ip?: string;
    user_agent?: string;
    request_count?: number;
    description: string;
  };
  severity: 'low' | 'medium' | 'high' | 'critical';
}

/**
 * Webhook事件联合类型
 * Union type for webhook events
 */
export type WebhookEvent =
  | MessageReceivedEvent
  | MessageStatusEvent
  | WebhookErrorEvent
  | MessageReadEvent
  | MessageDeliveryEvent
  | UserStatusChangeEvent
  | AccountUpdateEvent
  | TemplateStatusEvent
  | PhoneNumberQualityEvent
  | SecurityEvent;

/**
 * 事件处理器接口
 * Event handler interface
 */
export interface WebhookProcessor {
  onMessageReceived?: (event: MessageReceivedEvent) => Promise<void> | void;
  onMessageStatus?: (event: MessageStatusEvent) => Promise<void> | void;
  onMessageRead?: (event: MessageReadEvent) => Promise<void> | void;
  onMessageDelivery?: (event: MessageDeliveryEvent) => Promise<void> | void;
  onUserStatusChange?: (event: UserStatusChangeEvent) => Promise<void> | void;
  onAccountUpdate?: (event: AccountUpdateEvent) => Promise<void> | void;
  onTemplateStatus?: (event: TemplateStatusEvent) => Promise<void> | void;
  onPhoneNumberQuality?: (
    event: PhoneNumberQualityEvent,
  ) => Promise<void> | void;
  onSecurityEvent?: (event: SecurityEvent) => Promise<void> | void;
  onError?: (event: WebhookErrorEvent) => Promise<void> | void;
  onUnknownEvent?: (event: unknown) => Promise<void> | void;
}

/**
 * 事件过滤器
 * Event filter
 */
export interface EventFilter {
  event_types?: string[];
  phone_number_ids?: string[];
  sender_filters?: {
    include?: string[];
    exclude?: string[];
  };
  time_range?: {
    start: string;
    end: string;
  };
  custom_filters?: Array<{
    field: string;
    operator: 'equals' | 'contains' | 'starts_with' | 'ends_with' | 'regex';
    value: string;
  }>;
}

/**
 * 事件处理配置
 * Event processing configuration
 */
export interface EventProcessingConfig {
  parallel_processing: boolean;
  max_concurrent_events: number;
  timeout_ms: number;
  retry_failed_events: boolean;
  max_retries: number;
  retry_delay_ms: number;
  dead_letter_queue: boolean;
  event_ordering: 'fifo' | 'priority' | 'none';
}

/**
 * 事件统计
 * Event statistics
 */
export interface EventStatistics {
  total_events: number;
  events_by_type: Record<string, number>;
  processing_times: {
    average_ms: number;
    min_ms: number;
    max_ms: number;
    p95_ms: number;
    p99_ms: number;
  };
  error_rate: number;
  success_rate: number;
  last_processed_at?: string;
}

/**
 * 事件批处理
 * Event batch
 */
export interface EventBatch {
  batch_id: string;
  events: WebhookEvent[];
  created_at: string;
  processed_at?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error?: string;
}

/**
 * 事件常量
 * Event constants
 */
export const WEBHOOK_EVENT_TYPES = [
  'message_received',
  'message_status',
  'message_read',
  'message_delivery',
  'user_status_change',
  'account_update',
  'template_status',
  'phone_number_quality',
  'security_event',
  'webhook_error',
] as const;

export const MESSAGE_EVENT_TYPES = [
  'message_received',
  'message_status',
  'message_read',
  'message_delivery',
] as const;

export const SYSTEM_EVENT_TYPES = [
  'account_update',
  'template_status',
  'phone_number_quality',
  'security_event',
  'webhook_error',
] as const;

/**
 * 事件类型
 * Event types
 */
export type WebhookEventType = (typeof WEBHOOK_EVENT_TYPES)[number];
export type MessageEventType = (typeof MESSAGE_EVENT_TYPES)[number];
export type SystemEventType = (typeof SYSTEM_EVENT_TYPES)[number];

/**
 * 类型守卫函数
 * Type guard functions
 */
export function isMessageReceivedEvent(
  event: WebhookEvent,
): event is MessageReceivedEvent {
  return event.type === 'message_received';
}

export function isMessageStatusEvent(
  event: WebhookEvent,
): event is MessageStatusEvent {
  return event.type === 'message_status';
}

export function isMessageReadEvent(
  event: WebhookEvent,
): event is MessageReadEvent {
  return event.type === 'message_read';
}

export function isMessageDeliveryEvent(
  event: WebhookEvent,
): event is MessageDeliveryEvent {
  return event.type === 'message_delivery';
}

export function isUserStatusChangeEvent(
  event: WebhookEvent,
): event is UserStatusChangeEvent {
  return event.type === 'user_status_change';
}

export function isAccountUpdateEvent(
  event: WebhookEvent,
): event is AccountUpdateEvent {
  return event.type === 'account_update';
}

export function isTemplateStatusEvent(
  event: WebhookEvent,
): event is TemplateStatusEvent {
  return event.type === 'template_status';
}

export function isPhoneNumberQualityEvent(
  event: WebhookEvent,
): event is PhoneNumberQualityEvent {
  return event.type === 'phone_number_quality';
}

export function isSecurityEvent(event: WebhookEvent): event is SecurityEvent {
  return event.type === 'security_event';
}

export function isWebhookErrorEvent(
  event: WebhookEvent,
): event is WebhookErrorEvent {
  return event.type === 'webhook_error';
}

export function isMessageEvent(
  event: WebhookEvent,
): event is
  | MessageReceivedEvent
  | MessageStatusEvent
  | MessageReadEvent
  | MessageDeliveryEvent {
  return MESSAGE_EVENT_TYPES.includes(event.type as MessageEventType);
}

export function isSystemEvent(
  event: WebhookEvent,
): event is
  | AccountUpdateEvent
  | TemplateStatusEvent
  | PhoneNumberQualityEvent
  | SecurityEvent
  | WebhookErrorEvent {
  return SYSTEM_EVENT_TYPES.includes(event.type as SystemEventType);
}

/**
 * 事件工具函数
 * Event utility functions
 */
export function getEventPriority(event: WebhookEvent): number {
  switch (event.type) {
    case 'security_event':
      return ONE; // Highest priority
    case 'webhook_error':
      return COUNT_PAIR;
    case 'message_received':
      return COUNT_TRIPLE;
    case 'message_status':
      return COUNT_QUAD;
    case 'template_status':
      return COUNT_FIVE;
    case 'phone_number_quality':
      return MAGIC_6;
    case 'account_update':
      return DAYS_PER_WEEK;
    case 'message_read':
    case 'message_delivery':
      return MAGIC_8;
    case 'user_status_change':
      return MAGIC_9; // Lowest priority
    default:
      return COUNT_TEN;
  }
}

export function shouldRetryEvent(event: WebhookEvent, error: Error): boolean {
  // Don't retry security events or webhook errors
  if (event.type === 'security_event' || event.type === 'webhook_error') {
    return false;
  }

  // Don't retry on client errors (4xx)
  if (error.message.includes('COUNT_QUAD')) {
    return false;
  }

  return true;
}

export function getEventTimestamp(event: WebhookEvent): Date {
  return new Date(event.timestamp);
}

export function isEventExpired(
  event: WebhookEvent,
  maxAgeMs: number = HOURS_PER_DAY *
    SECONDS_PER_MINUTE *
    SECONDS_PER_MINUTE *
    ANIMATION_DURATION_VERY_SLOW,
): boolean {
  const eventTime = getEventTimestamp(event);
  const now = new Date();
  return now.getTime() - eventTime.getTime() > maxAgeMs;
}
