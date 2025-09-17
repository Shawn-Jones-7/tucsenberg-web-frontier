// 向后兼容的重新导出
import type {
  MessageStatus,
  WhatsAppContact,
  WhatsAppError,
  WhatsAppMessage,
} from '@/types/whatsapp-base-types';
import type {
  CompleteWebhookConfig,
  MessageContext,
  MessageStatusUpdate,
  WEBHOOK_FIELDS,
  WebhookBatchConfig,
  WebhookConfig,
  WebhookEntry,
  WebhookError,
  WebhookFilterConfig,
  WebhookMetadata,
  WebhookMonitoringConfig,
  WebhookPayload,
  WebhookProcessingResult,
  WebhookRetryConfig,
  WebhookSecurityConfig,
  WebhookStatus,
  WebhookSubscription,
  WebhookTransformConfig,
  WebhookVerificationRequest,
  WebhookVerificationResponse,
} from '@/types/whatsapp-webhook-base';
import type {
  AccountUpdateEvent,
  EventBatch,
  EventFilter,
  EventProcessingConfig,
  EventStatistics,
  MessageDeliveryEvent,
  MessageReadEvent,
  MessageReceivedEvent,
  MessageStatusEvent,
  PhoneNumberQualityEvent,
  SecurityEvent,
  TemplateStatusEvent,
  UserStatusChangeEvent,
  WEBHOOK_EVENT_TYPES,
  WebhookErrorEvent,
  WebhookEvent,
  WebhookProcessor,
} from '@/types/whatsapp-webhook-events';
import type {
  INCOMING_MESSAGE_TYPES,
  IncomingAudioMessage,
  IncomingButtonMessage,
  IncomingContactsMessage,
  IncomingDocumentMessage,
  IncomingImageMessage,
  IncomingInteractiveMessage,
  IncomingLocationMessage,
  IncomingOrderMessage,
  IncomingReactionMessage,
  IncomingStickerMessage,
  IncomingSystemMessage,
  IncomingTemplateReply,
  IncomingTextMessage,
  IncomingVideoMessage,
  IncomingWhatsAppMessage,
  INTERACTIVE_MESSAGE_TYPES,
  MEDIA_MESSAGE_TYPES,
} from '@/types/whatsapp-webhook-messages';
import {
  createWebhookError,
  createWebhookVerificationResponse,
  isRetryableError,
  isTimestampValid,
  isWebhookVerificationRequest,
  WebhookUtils,
} from '@/types/whatsapp-webhook-utils';

/**
 * WhatsApp Webhook 类型定义 - 主入口
 * WhatsApp Webhook Type Definitions - Main Entry Point
 *
 * 统一的WhatsApp Business API webhook类型入口，整合所有webhook相关类型定义
 */

// 重新导出所有模块的功能 - 类型导出
export type {
  WebhookEntry,
  WebhookPayload,
  MessageStatusUpdate,
  WebhookError,
  MessageContext,
  WebhookVerificationRequest,
  WebhookVerificationResponse,
  WebhookConfig,
  WebhookSubscription,
  WebhookProcessingResult,
  WebhookSecurityConfig,
  WebhookRetryConfig,
  WebhookMonitoringConfig,
  WebhookStatus,
  WebhookMetadata,
  WebhookBatchConfig,
  WebhookFilterConfig,
  WebhookTransformConfig,
  CompleteWebhookConfig,
  WebhookField,
  WebhookObjectType,
  WebhookChangeField,
} from '@/types/whatsapp-webhook-base';

// 常量和函数导出
export {
  WEBHOOK_FIELDS,
  WEBHOOK_OBJECT_TYPES,
  WEBHOOK_CHANGE_FIELDS,
  isWebhookPayload,
  isWebhookEntry,
  isMessageStatusUpdate,
  isWebhookError,
  isWebhookVerificationRequest,
} from '@/types/whatsapp-webhook-base';

export type {
  IncomingTextMessage,
  IncomingImageMessage,
  IncomingDocumentMessage,
  IncomingAudioMessage,
  IncomingVideoMessage,
  IncomingLocationMessage,
  IncomingContactsMessage,
  IncomingInteractiveMessage,
  IncomingReactionMessage,
  IncomingStickerMessage,
  IncomingOrderMessage,
  IncomingSystemMessage,
  IncomingButtonMessage,
  IncomingTemplateReply,
  IncomingWhatsAppMessage,
  IncomingMessageType,
  MediaMessageType,
  InteractiveMessageType,
} from '@/types/whatsapp-webhook-messages';

export {
  INCOMING_MESSAGE_TYPES,
  MEDIA_MESSAGE_TYPES,
  INTERACTIVE_MESSAGE_TYPES,
  isTextMessage,
  isImageMessage,
  isDocumentMessage,
  isAudioMessage,
  isVideoMessage,
  isLocationMessage,
  isContactsMessage,
  isInteractiveMessage,
  isReactionMessage,
  isStickerMessage,
  isOrderMessage,
  isSystemMessage,
  isButtonMessage,
  isTemplateReply,
  isMediaMessage,
  isInteractiveMessageType,
  getMessageText,
  getMessageMediaId,
  hasMessageContext,
} from '@/types/whatsapp-webhook-messages';

export type {
  MessageReceivedEvent,
  MessageStatusEvent,
  WebhookErrorEvent,
  MessageReadEvent,
  MessageDeliveryEvent,
  UserStatusChangeEvent,
  AccountUpdateEvent,
  TemplateStatusEvent,
  PhoneNumberQualityEvent,
  SecurityEvent,
  WebhookEvent,
  WebhookProcessor,
  EventFilter,
  EventProcessingConfig,
  EventStatistics,
  EventBatch,
  WebhookEventType,
  MessageEventType,
  SystemEventType,
} from '@/types/whatsapp-webhook-events';

export {
  WEBHOOK_EVENT_TYPES,
  MESSAGE_EVENT_TYPES,
  SYSTEM_EVENT_TYPES,
  isMessageReceivedEvent,
  isMessageStatusEvent,
  isMessageReadEvent,
  isMessageDeliveryEvent,
  isUserStatusChangeEvent,
  isAccountUpdateEvent,
  isTemplateStatusEvent,
  isPhoneNumberQualityEvent,
  isSecurityEvent,
  isWebhookErrorEvent,
  isMessageEvent,
  isSystemEvent,
  getEventPriority,
  shouldRetryEvent,
  getEventTimestamp,
  isEventExpired,
} from '@/types/whatsapp-webhook-events';

export type {
  WebhookParsingResult,
  WebhookValidationResult,
  SignatureVerificationConfig,
  WebhookProcessingContext,
  WebhookResponseConfig,
  DeduplicationConfig,
  RateLimitConfig,
  WebhookHealthCheck,
  WebhookDebugInfo,
  EventAggregationResult,
  WebhookUtils,
} from '@/types/whatsapp-webhook-utils';

export {
  createWebhookVerificationResponse,
  createWebhookError,
  isRetryableError,
  isTimestampValid,
} from '@/types/whatsapp-webhook-utils';

// ==================== 向后兼容的类型别名 ====================

/**
 * 向后兼容的类型别名
 * Backward compatible type aliases
 */
export type {
  // 基础类型
  WebhookPayload as Webhook,
  WebhookEntry as Entry,
  MessageStatusUpdate as StatusUpdate,
  WebhookError as Error,

  // 消息类型
  IncomingWhatsAppMessage as IncomingMessage,
  IncomingTextMessage as TextMessage,
  IncomingImageMessage as ImageMessage,
  IncomingDocumentMessage as DocumentMessage,
  IncomingAudioMessage as AudioMessage,
  IncomingVideoMessage as VideoMessage,
  IncomingLocationMessage as LocationMessage,
  IncomingContactsMessage as ContactsMessage,
  IncomingInteractiveMessage as InteractiveMessage,
  IncomingReactionMessage as ReactionMessage,
  IncomingStickerMessage as StickerMessage,

  // 事件类型
  MessageReceivedEvent as MessageEvent,
  MessageStatusEvent as StatusEvent,
  WebhookErrorEvent as ErrorEvent,
  WebhookEvent as Event,

  // 配置类型
  WebhookConfig as Config,
  WebhookSubscription as Subscription,
  WebhookProcessor as Processor,
  WebhookProcessingResult as ProcessingResult,

  // 验证类型
  WebhookVerificationRequest as VerificationRequest,
  WebhookVerificationResponse as VerificationResponse,
};
