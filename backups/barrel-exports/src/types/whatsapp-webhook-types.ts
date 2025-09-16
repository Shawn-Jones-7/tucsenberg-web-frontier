// 向后兼容的重新导出
import type {
  MessageStatus,
  WhatsAppContact,
  WhatsAppError,
  WhatsAppMessage,
} from './whatsapp-base-types';
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
} from './whatsapp-webhook-base';
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
} from './whatsapp-webhook-events';
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
} from './whatsapp-webhook-messages';
import {
  createWebhookError,
  createWebhookVerificationResponse,
  isRetryableError,
  isTimestampValid,
  isWebhookVerificationRequest,
  WebhookUtils,
} from './whatsapp-webhook-utils';

/**
 * WhatsApp Webhook 类型定义 - 主入口
 * WhatsApp Webhook Type Definitions - Main Entry Point
 *
 * 统一的WhatsApp Business API webhook类型入口，整合所有webhook相关类型定义
 */

// 重新导出所有模块的功能
export * from '@/../backups/barrel-exports/src/types/whatsapp-webhook-base';
export * from '@/../backups/barrel-exports/src/types/whatsapp-webhook-messages';
export * from '@/../backups/barrel-exports/src/types/whatsapp-webhook-events';
export * from '@/../backups/barrel-exports/src/types/whatsapp-webhook-utils';

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
