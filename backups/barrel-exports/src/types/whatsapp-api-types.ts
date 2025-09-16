// 向后兼容的重新导出
import type {
  ANALYTICS_GRANULARITIES,
  ANALYTICS_METRIC_TYPES,
  AnalyticsGranularity,
  AnalyticsMetricType,
  API_ENDPOINTS,
  API_VERSIONS,
  ApiConfig,
  ApiEndpoint,
  ApiVersion,
  ClientConfig,
  ConfigUtils,
  DEFAULT_API_CONFIG,
  DEFAULT_REQUEST_OPTIONS,
  DEFAULT_WEBHOOK_CONFIG,
  EnvironmentConfig,
  ERROR_CODE_MESSAGES,
  ErrorCode,
  ExtendedApiConfig,
  HTTP_METHODS,
  HttpMethod,
  MEDIA_TYPES,
  MediaType,
  MESSAGE_TYPES,
  MessageType,
  QUALITY_RATINGS,
  QualityRating,
  RETRYABLE_ERROR_CODES,
  TEMPLATE_CATEGORIES,
  TEMPLATE_STATUSES,
  TemplateCategory,
  TemplateStatusType,
  THROUGHPUT_LEVELS,
  ThroughputLevel,
  WebhookConfig,
} from './whatsapp-api-config';
import type {
  AuthenticationError,
  BusinessLogicError,
  ErrorCategory,
  ErrorContext,
  ErrorDetails,
  ErrorHandlingConfig,
  ErrorHandlingStrategy,
  ErrorReport,
  ErrorSeverity,
  ErrorStatistics,
  ErrorUtils,
  NetworkError,
  RateLimitError,
  ServerError,
  ValidationError,
  WhatsAppError,
} from './whatsapp-api-errors';
import type {
  AccountInfoRequest,
  AnalyticsRequest,
  ApiRequest,
  ApiRequestOptions,
  AppSettingsRequest,
  BatchRequest,
  BusinessProfileUpdateRequest,
  GroupMessageRequest,
  MediaUploadRequest,
  MessageForwardRequest,
  MessageMarkRequest,
  MessageReactionRequest,
  PhoneNumberRegistrationRequest,
  PhoneNumberVerificationRequest,
  QualityRatingRequest,
  RequestBuilders,
  SendMessageRequest,
  TemplateCreateRequest,
  TemplateDeleteRequest,
  TemplateStatusUpdateRequest,
  UserBlockRequest,
  WebhookSubscriptionRequest,
  WhatsAppApiRequest,
} from './whatsapp-api-requests';
import type {
  AccountInfoResponse,
  AnalyticsDataPoint,
  AnalyticsResponse,
  ApiResponse,
  AppSettingsResponse,
  BatchResponse,
  BusinessProfile,
  BusinessProfileResponse,
  MediaRetrieveResponse,
  MediaUploadResponse,
  MessageStatusResponse,
  PaginatedResponse,
  PaginationCursors,
  PaginationInfo,
  PhoneNumberInfo,
  PhoneNumbersResponse,
  QualityRatingResponse,
  RateLimitInfo,
  ResponseUtils,
  SendMessageResponse,
  TemplatesResponse,
  TemplateStatus,
  UserBlockStatusResponse,
  WebhookVerificationResponse,
  WhatsAppApiError,
  WhatsAppApiErrorResponse,
  WhatsAppApiResponse,
  WhatsAppApiResponseType,
  WhatsAppServiceResponse,
} from './whatsapp-api-responses';
import type {
  ContactData,
  LocationData,
  WhatsAppContact,
} from './whatsapp-base-types';
import type { TemplateMessage } from '@/../backups/barrel-exports/src/types/whatsapp-template-types';

/**
 * WhatsApp API 类型定义 - 主入口
 * WhatsApp API Type Definitions - Main Entry Point
 *
 * 统一的WhatsApp Business API类型入口，整合所有API相关类型定义
 */

// 重新导出所有模块的功能
export * from '@/../backups/barrel-exports/src/types/whatsapp-api-requests';
export * from '@/../backups/barrel-exports/src/types/whatsapp-api-responses';
export * from '@/../backups/barrel-exports/src/types/whatsapp-api-config';
export * from '@/../backups/barrel-exports/src/types/whatsapp-api-errors';

// ==================== 向后兼容的类型别名 ====================

/**
 * 向后兼容的类型别名
 * Backward compatible type aliases
 */
export type {
  // 请求类型
  SendMessageRequest as SendRequest,
  MediaUploadRequest as UploadRequest,
  AnalyticsRequest as AnalyticsReq,
  BatchRequest as BatchReq,
  ApiRequest as Request,
  ApiRequestOptions as RequestOptions,

  // 响应类型
  SendMessageResponse as SendResponse,
  WhatsAppApiResponse as ApiResponse,
  WhatsAppServiceResponse as ServiceResponse,
  MediaUploadResponse as UploadResponse,
  MediaRetrieveResponse as RetrieveResponse,
  PhoneNumbersResponse as PhoneNumbersResp,
  BusinessProfileResponse as BusinessProfileResp,
  TemplatesResponse as TemplatesResp,
  AnalyticsResponse as AnalyticsResp,
  BatchResponse as BatchResp,
  ApiResponse as Response,

  // 配置类型
  ApiConfig as Config,
  ExtendedApiConfig as ExtendedConfig,
  WebhookConfig as WebhookConf,
  ClientConfig as ClientConf,

  // 错误类型
  WhatsAppApiError as ApiError,
  WhatsAppApiErrorResponse as ErrorResponse,
  WhatsAppError as Error,
  NetworkError as NetError,
  ValidationError as ValidError,
  AuthenticationError as AuthError,
  RateLimitError as RateLimitErr,
  BusinessLogicError as BusinessError,
  ServerError as ServError,

  // 工具类型
  ApiEndpoint as Endpoint,
  HttpMethod as Method,
  MessageType as MsgType,
  MediaType as MediaT,
  TemplateCategory as TemplateCategory,
  QualityRating as Quality,
  ErrorCode as ErrCode,

  // 分页类型
  PaginatedResponse as PagedResponse,
  PaginationInfo as PageInfo,
  PaginationCursors as PageCursors,
};

/**
 * 向后兼容的导出别名
 * Backward compatible export aliases
 */
export {
  // 常量
  API_ENDPOINTS,
  HTTP_METHODS,
  API_VERSIONS,
  MESSAGE_TYPES,
  MEDIA_TYPES,
  TEMPLATE_CATEGORIES,
  TEMPLATE_STATUSES,
  QUALITY_RATINGS,
  THROUGHPUT_LEVELS,
  ANALYTICS_GRANULARITIES,
  ANALYTICS_METRIC_TYPES,

  // 默认配置
  DEFAULT_API_CONFIG,
  DEFAULT_WEBHOOK_CONFIG,
  DEFAULT_REQUEST_OPTIONS,

  // 错误相关
  ERROR_CODE_MESSAGES,
  RETRYABLE_ERROR_CODES,

  // 工具函数
  ConfigUtils,
  ResponseUtils,
  ErrorUtils,
  RequestBuilders,
};
