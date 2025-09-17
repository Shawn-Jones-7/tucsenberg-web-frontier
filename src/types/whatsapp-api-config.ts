/**
 * WhatsApp API 配置和工具类型定义 - 主入口
 * 重新导出所有WhatsApp API相关模块
 */

// 重新导出基础配置接口
export type {
  ApiConfig,
  ExtendedApiConfig,
  EnvironmentConfig,
  WebhookConfig,
  ClientConfig,
} from '@/types/whatsapp-api-config/interfaces';

// 重新导出类型定义
export type {
  ApiEndpoint,
  HttpMethod,
  ApiVersion,
  MessageType,
  MediaType,
  TemplateCategory,
  TemplateStatusType,
  QualityRating,
  ThroughputLevel,
  AnalyticsGranularity,
  AnalyticsMetricType,
  ErrorCode,
} from '@/types/whatsapp-api-config/types';

// 重新导出常量定义
export {
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
} from '@/types/whatsapp-api-config/constants';

// 重新导出默认配置
export {
  DEFAULT_API_CONFIG,
  DEFAULT_WEBHOOK_CONFIG,
  DEFAULT_REQUEST_OPTIONS,
} from '@/types/whatsapp-api-config/defaults';

// 重新导出错误处理
export {
  ERROR_CODE_MESSAGES,
  RETRYABLE_ERROR_CODES,
  validateApiConfig,
  validateWebhookConfig,
} from '@/types/whatsapp-api-config/errors';

// 重新导出工具函数
export { ConfigUtils } from '@/types/whatsapp-api-config/utils';
