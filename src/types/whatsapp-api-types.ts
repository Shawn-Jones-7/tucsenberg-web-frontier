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
} from '@/types/whatsapp-api-config';
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
} from '@/types/whatsapp-api-errors';
import type {
  AnalyticsRequest,
  ApiRequest,
  ApiRequestOptions,
  BatchRequest,
  MediaUploadRequest,
  RequestBuilders,
  SendMessageRequest,
} from '@/types/whatsapp-api-requests';
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
} from '@/types/whatsapp-api-responses';
import type {
  ContactData,
  LocationData,
  WhatsAppContact,
} from '@/types/whatsapp-base-types';

/**
 * WhatsApp API 类型定义 - 主入口
 * WhatsApp API Type Definitions - Main Entry Point
 *
 * 统一的WhatsApp Business API类型入口，整合所有API相关类型定义
 */

// 重新导出所有模块的功能 - 类型导出
export type {
  SendMessageRequest,
  MediaUploadRequest,
  AnalyticsRequest,
  BatchRequest,
  BusinessProfileUpdateRequest,
  TemplateCreateRequest,
  TemplateDeleteRequest,
  TemplateStatusUpdateRequest,
  PhoneNumberRegistrationRequest,
  PhoneNumberVerificationRequest,
  WebhookSubscriptionRequest,
  MessageMarkRequest,
  UserBlockRequest,
  QualityRatingRequest,
  AccountInfoRequest,
  AppSettingsRequest,
  MessageReactionRequest,
  MessageForwardRequest,
  GroupMessageRequest,
  ApiRequestOptions,
  ApiRequest,
  WhatsAppApiRequest,
} from '@/types/whatsapp-api-requests';

// 函数导出
export {
  isSendMessageRequest,
  isMediaUploadRequest,
  isAnalyticsRequest,
  isBatchRequest,
} from '@/types/whatsapp-api-requests';

export type {
  SendMessageResponse,
  WhatsAppApiResponse,
  WhatsAppServiceResponse,
  MediaUploadResponse,
  MediaRetrieveResponse,
  PhoneNumberInfo,
  PhoneNumbersResponse,
  BusinessProfile,
  BusinessProfileResponse,
  TemplateStatus,
  TemplatesResponse,
  AnalyticsDataPoint,
  AnalyticsResponse,
  BatchResponse,
  RateLimitInfo,
  AccountInfoResponse,
  AppSettingsResponse,
  QualityRatingResponse,
  MessageStatusResponse,
  UserBlockStatusResponse,
  WebhookVerificationResponse,
  PaginationCursors,
  PaginationInfo,
  PaginatedResponse,
  WhatsAppApiResponseType,
} from '@/types/whatsapp-api-responses';

export {
  isSendMessageResponse,
  isMediaUploadResponse,
  isSuccessResponse,
  isErrorResponse,
} from '@/types/whatsapp-api-responses';

export type {
  ApiConfig,
  ExtendedApiConfig,
  EnvironmentConfig,
  WebhookConfig,
  ClientConfig,
  ApiEndpoint,
  HttpMethod,
  ApiVersion,
  MessageType,
  MediaType,
  TemplateStatusType,
  QualityRating,
  ThroughputLevel,
  AnalyticsGranularity,
  AnalyticsMetricType,
  ErrorCode,
} from '@/types/whatsapp-api-config';

export {
  validateApiConfig,
  validateWebhookConfig,
} from '@/types/whatsapp-api-config';

export type {
  WhatsAppApiErrorResponse,
  WhatsAppApiError,
  NetworkError,
  ValidationError,
  AuthenticationError,
  RateLimitError,
  BusinessLogicError,
  ServerError,
  WhatsAppError,
  ErrorSeverity,
  ErrorCategory,
  ErrorContext,
  ErrorDetails,
  ErrorHandlingStrategy,
  ErrorStatistics,
  ErrorReport,
  ErrorHandlingConfig,
} from '@/types/whatsapp-api-errors';

export {
  isWhatsAppApiError as isApiError,
  isNetworkError,
  isValidationError,
  isAuthenticationError,
  isRateLimitError,
  isBusinessLogicError,
  isServerError,
} from '@/types/whatsapp-api-errors';

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
  TemplateCategory,
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
  type API_ENDPOINTS,
  type HTTP_METHODS,
  type API_VERSIONS,
  type MESSAGE_TYPES,
  type MEDIA_TYPES,
  type TEMPLATE_CATEGORIES,
  type TEMPLATE_STATUSES,
  type QUALITY_RATINGS,
  type THROUGHPUT_LEVELS,
  type ANALYTICS_GRANULARITIES,
  type ANALYTICS_METRIC_TYPES,

  // 默认配置
  type DEFAULT_API_CONFIG,
  type DEFAULT_WEBHOOK_CONFIG,
  type DEFAULT_REQUEST_OPTIONS,

  // 错误相关
  type ERROR_CODE_MESSAGES,
  type RETRYABLE_ERROR_CODES,

  // 工具函数
  type ConfigUtils,
  type ResponseUtils,
  type ErrorUtils,
  type RequestBuilders,
};
