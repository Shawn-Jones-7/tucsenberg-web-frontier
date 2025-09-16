/**
 * WhatsApp API 通用请求类型
 * WhatsApp API Generic Request Types
 */

// 导入所有请求类型
import type {
  AccountInfoRequest,
  AppSettingsRequest,
} from './account-app-requests';
import type {
  BatchRequest,
  BusinessProfileUpdateRequest,
} from './batch-business-requests';
import type {
  AnalyticsRequest,
  MediaUploadRequest,
} from './media-analytics-requests';
import type {
  GroupMessageRequest,
  MessageForwardRequest,
  MessageReactionRequest,
} from './message-actions-requests';
import type { SendMessageRequest } from '@/types/whatsapp-api-requests/message-requests';
import type {
  MessageMarkRequest,
  PhoneNumberRegistrationRequest,
  PhoneNumberVerificationRequest,
  WebhookSubscriptionRequest,
} from './phone-webhook-requests';
import type {
  TemplateCreateRequest,
  TemplateDeleteRequest,
  TemplateStatusUpdateRequest,
} from './template-requests';
import type {
  QualityRatingRequest,
  UserBlockRequest,
} from './user-quality-requests';

/**
 * 请求选项
 * Request options
 */
export interface ApiRequestOptions {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  headers?: Record<string, string>;
  signal?: AbortSignal;
  validateStatus?: (status: number) => boolean;
}

/**
 * 通用API请求包装器
 * Generic API request wrapper
 */
export interface ApiRequest<T = unknown> {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  endpoint: string;
  data?: T;
  params?: Record<string, string | number | boolean>;
  options?: ApiRequestOptions;
}

/**
 * 请求类型联合
 * Request type union
 */
export type WhatsAppApiRequest =
  | SendMessageRequest
  | MediaUploadRequest
  | AnalyticsRequest
  | BatchRequest
  | BusinessProfileUpdateRequest
  | TemplateCreateRequest
  | TemplateDeleteRequest
  | PhoneNumberRegistrationRequest
  | PhoneNumberVerificationRequest
  | WebhookSubscriptionRequest
  | MessageMarkRequest
  | UserBlockRequest
  | QualityRatingRequest
  | TemplateStatusUpdateRequest
  | AccountInfoRequest
  | AppSettingsRequest
  | MessageReactionRequest
  | MessageForwardRequest
  | GroupMessageRequest;

/**
 * 请求验证函数
 * Request validation functions
 */
export function isSendMessageRequest(
  request: unknown,
): request is SendMessageRequest {
  return Boolean(
    request &&
      typeof request === 'object' &&
      (request as Record<string, unknown>).messaging_product === 'whatsapp' &&
      (request as Record<string, unknown>).recipient_type === 'individual' &&
      typeof (request as Record<string, unknown>).to === 'string' &&
      typeof (request as Record<string, unknown>).type === 'string',
  );
}

export function isMediaUploadRequest(
  request: unknown,
): request is MediaUploadRequest {
  return Boolean(
    request &&
      typeof request === 'object' &&
      (request as Record<string, unknown>).messaging_product === 'whatsapp' &&
      (request as Record<string, unknown>).file &&
      typeof (request as Record<string, unknown>).type === 'string',
  );
}

export function isAnalyticsRequest(
  request: unknown,
): request is AnalyticsRequest {
  return Boolean(
    request &&
      typeof request === 'object' &&
      typeof (request as Record<string, unknown>).start === 'string' &&
      typeof (request as Record<string, unknown>).end === 'string' &&
      typeof (request as Record<string, unknown>).granularity === 'string',
  );
}

export function isBatchRequest(request: unknown): request is BatchRequest {
  return Boolean(
    request &&
      typeof request === 'object' &&
      Array.isArray((request as Record<string, unknown>).requests),
  );
}
