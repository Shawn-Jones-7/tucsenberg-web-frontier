import { MAGIC_131, MAGIC_131000, MAGIC_131005, MAGIC_131008, MAGIC_131009, MAGIC_131014, MAGIC_131016, MAGIC_131021, MAGIC_131026, MAGIC_131047, MAGIC_131051, MAGIC_131052, MAGIC_131053, MAGIC_132, MAGIC_133, MAGIC_136, MAGIC_190, MAGIC_368 } from '@/constants/magic-numbers';

/**
 * WhatsApp API 类型定义
 * WhatsApp API Type Definitions
 */

/**
 * API端点类型
 * API endpoint types
 */
export type ApiEndpoint =
  | 'messages'
  | 'media'
  | 'phone_numbers'
  | 'business_profile'
  | 'message_templates'
  | 'analytics'
  | 'batch'
  | 'webhooks'
  | 'account'
  | 'apps';

/**
 * HTTP方法类型
 * HTTP method types
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

/**
 * API版本类型
 * API version types
 */
export type ApiVersion = 'v17.0' | 'v18.0' | 'v19.0' | 'v20.0';

/**
 * 消息类型
 * Message types
 */
export type MessageType =
  | 'text'
  | 'template'
  | 'image'
  | 'document'
  | 'audio'
  | 'video'
  | 'location'
  | 'contacts'
  | 'interactive'
  | 'reaction'
  | 'sticker';

/**
 * 媒体类型
 * Media types
 */
export type MediaType = 'image' | 'document' | 'audio' | 'video' | 'sticker';

/**
 * 模板类别
 * Template categories
 */
export type TemplateCategory = 'AUTHENTICATION' | 'MARKETING' | 'UTILITY';

/**
 * 模板状态
 * Template status
 */
export type TemplateStatusType =
  | 'APPROVED'
  | 'PENDING'
  | 'REJECTED'
  | 'DISABLED'
  | 'PAUSED';

/**
 * 质量评级
 * Quality rating
 */
export type QualityRating = 'GREEN' | 'YELLOW' | 'RED' | 'UNKNOWN';

/**
 * 吞吐量级别
 * Throughput level
 */
export type ThroughputLevel = 'STANDARD' | 'HIGH';

/**
 * 分析粒度
 * Analytics granularity
 */
export type AnalyticsGranularity = 'HALF_HOUR' | 'DAY' | 'MONTH';

/**
 * 分析指标类型
 * Analytics metric types
 */
export type AnalyticsMetricType =
  | 'cost'
  | 'conversation'
  | 'phone_number_quality_score';

/**
 * 错误代码类型
 * Error code types
 */
export type ErrorCode =
  | 100 // Generic user error
  | 131 // Generic temporary error
  | 132 // Generic limit reached
  | 133 // Generic permission error
  | 136 // Generic authentication error
  | 190 // Access token error
  | 368 // Temporarily blocked for policies violations
  | 131000 // Generic temporary error
  | 131005 // Request limit reached
  | 131008 // Required parameter is missing
  | 131009 // Parameter value is not valid
  | 131014 // Request timeout
  | 131016 // Service temporarily unavailable
  | 131021 // Recipient phone number not valid
  | 131026 // Message undeliverable
  | 131047 // Re-engagement message
  | 131051 // Unsupported message type
  | 131052 // Media download error
  | 131053; // Media upload error
