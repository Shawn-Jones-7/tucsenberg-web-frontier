/**
 * WhatsApp API 请求类型定义 - 主入口
 * 重新导出所有WhatsApp API请求相关模块
 */

// 重新导出消息相关请求
export type { SendMessageRequest } from '@/types/whatsapp-api-requests/message-requests';

// 重新导出媒体和分析请求
export type {
  MediaUploadRequest,
  AnalyticsRequest,
} from '@/types/whatsapp-api-requests/media-analytics-requests';

// 重新导出批量和业务配置请求
export type {
  BatchRequest,
  BusinessProfileUpdateRequest,
} from '@/types/whatsapp-api-requests/batch-business-requests';

// 重新导出模板相关请求
export type {
  TemplateCreateRequest,
  TemplateDeleteRequest,
  TemplateStatusUpdateRequest,
} from '@/types/whatsapp-api-requests/template-requests';

// 重新导出电话号码和Webhook请求
export type {
  PhoneNumberRegistrationRequest,
  PhoneNumberVerificationRequest,
  WebhookSubscriptionRequest,
  MessageMarkRequest,
} from '@/types/whatsapp-api-requests/phone-webhook-requests';

// 重新导出用户和质量请求
export type {
  UserBlockRequest,
  QualityRatingRequest,
} from '@/types/whatsapp-api-requests/user-quality-requests';

// 重新导出账户和应用设置请求
export type {
  AccountInfoRequest,
  AppSettingsRequest,
} from '@/types/whatsapp-api-requests/account-app-requests';

// 重新导出消息操作请求
export type {
  MessageReactionRequest,
  MessageForwardRequest,
  GroupMessageRequest,
} from '@/types/whatsapp-api-requests/message-actions-requests';

// 重新导出通用API请求类型
export type {
  ApiRequestOptions,
  ApiRequest,
  WhatsAppApiRequest,
} from '@/types/whatsapp-api-requests/api-types';

export {
  isSendMessageRequest,
  isMediaUploadRequest,
  isAnalyticsRequest,
  isBatchRequest,
} from '@/types/whatsapp-api-requests/api-types';

// 重新导出请求构建器
export { RequestBuilders } from '@/types/whatsapp-api-requests/request-builders';
