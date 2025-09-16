/**
 * WhatsApp Webhook 工具类型和函数 - 主入口
 * 重新导出所有Webhook工具相关模块
 */

// 重新导出基础接口定义
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
} from './whatsapp-webhook-utils/interfaces';

// 重新导出工具类
export { WebhookUtils } from '@/types/whatsapp-webhook-utils/webhook-utils';

// 重新导出工具函数
export {
  isWebhookVerificationRequest,
  createWebhookVerificationResponse,
  createWebhookError,
  isRetryableError,
  isTimestampValid,
} from './whatsapp-webhook-utils/functions';
