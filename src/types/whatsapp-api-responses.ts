// ZERO常量已被数字字面量0替代，移除未使用的导入

/**
 * WhatsApp API 响应类型定义
 * WhatsApp API Response Type Definitions
 *
 * 提供WhatsApp Business API响应相关的类型定义
 */

/**
 * 发送消息响应
 * Send message response
 */
export interface SendMessageResponse {
  messaging_product: 'whatsapp';
  contacts: Array<{
    input: string;
    wa_id: string;
  }>;
  messages: Array<{
    id: string;
  }>;
}

/**
 * WhatsApp API 原始响应类型（与 SendMessageResponse 相同）
 * WhatsApp API raw response type (same as SendMessageResponse)
 */
export type WhatsAppApiResponse = SendMessageResponse;

/**
 * 服务层响应包装类型
 * Service layer response wrapper type
 */
export interface WhatsAppServiceResponse {
  success: boolean;
  data?: WhatsAppApiResponse;
  error?: string;
  timestamp?: string;
  requestId?: string;
}

/**
 * 媒体上传响应
 * Media upload response
 */
export interface MediaUploadResponse {
  id: string;
}

/**
 * 媒体检索响应
 * Media retrieve response
 */
export interface MediaRetrieveResponse {
  url: string;
  mime_type: string;
  sha256: string;
  file_size: number;
  id: string;
}

/**
 * 电话号码信息
 * Phone number information
 */
export interface PhoneNumberInfo {
  verified_name: string;
  display_phone_number: string;
  id: string;
  quality_rating: 'GREEN' | 'YELLOW' | 'RED' | 'UNKNOWN';
  throughput: {
    level: 'STANDARD' | 'HIGH';
  };
  webhook_configuration?: {
    webhook_url: string;
    webhook_fields: string[];
  };
}

/**
 * 电话号码列表响应
 * Phone numbers list response
 */
export interface PhoneNumbersResponse {
  data: PhoneNumberInfo[];
  paging?: {
    cursors?: {
      before?: string;
      after?: string;
    };
    next?: string;
    previous?: string;
  };
}

/**
 * 业务档案
 * Business profile
 */
export interface BusinessProfile {
  about?: string;
  address?: string;
  description?: string;
  email?: string;
  profile_picture_url?: string;
  websites?: string[];
  vertical?: string;
  messaging_product: 'whatsapp';
}

/**
 * 业务档案响应
 * Business profile response
 */
export interface BusinessProfileResponse {
  data: BusinessProfile[];
}

/**
 * 模板状态
 * Template status
 */
export interface TemplateStatus {
  name: string;
  status: 'APPROVED' | 'PENDING' | 'REJECTED' | 'DISABLED' | 'PAUSED';
  category: 'AUTHENTICATION' | 'MARKETING' | 'UTILITY';
  language: string;
  id: string;
  components?: Array<{
    type: 'HEADER' | 'BODY' | 'FOOTER' | 'BUTTONS';
    format?: 'TEXT' | 'IMAGE' | 'DOCUMENT' | 'VIDEO';
    text?: string;
    buttons?: Array<{
      type: 'QUICK_REPLY' | 'URL' | 'PHONE_NUMBER';
      text: string;
      url?: string;
      phone_number?: string;
    }>;
  }>;
  created_time?: string;
  modified_time?: string;
}

/**
 * 模板列表响应
 * Templates list response
 */
export interface TemplatesResponse {
  data: TemplateStatus[];
  paging?: {
    cursors?: {
      before?: string;
      after?: string;
    };
    next?: string;
    previous?: string;
  };
}

/**
 * 分析数据点
 * Analytics data point
 */
export interface AnalyticsDataPoint {
  start: string;
  end: string;
  sent: number;
  delivered: number;
  read: number;
  cost?: number;
  conversation_analytics?: {
    conversation_opened: number;
    conversation_closed: number;
    conversation_expired: number;
  };
}

/**
 * 分析响应
 * Analytics response
 */
export interface AnalyticsResponse {
  data: Array<{
    name: string;
    period: string;
    data_points: AnalyticsDataPoint[];
  }>;
  paging?: {
    cursors?: {
      before?: string;
      after?: string;
    };
    next?: string;
    previous?: string;
  };
}

/**
 * 批量响应
 * Batch response
 */
export interface BatchResponse {
  responses: Array<{
    code: number;
    headers: Array<{
      name: string;
      value: string;
    }>;
    body: string;
  }>;
}

/**
 * 速率限制信息
 * Rate limit information
 */
export interface RateLimitInfo {
  app_id: string;
  application_quota_usage: number;
  business_quota_usage: number;
  call_count: number;
  total_cputime: number;
  total_time: number;
  type: 'application' | 'business';
}

/**
 * 账户信息响应
 * Account info response
 */
export interface AccountInfoResponse {
  id: string;
  name: string;
  timezone_offset_minutes: number;
  message_template_namespace: string;
  account_review_status: 'APPROVED' | 'PENDING' | 'REJECTED';
  business_verification_status: 'VERIFIED' | 'UNVERIFIED' | 'PENDING';
  country: string;
  currency: string;
  primary_business_location: string;
}

/**
 * 应用设置响应
 * App settings response
 */
export interface AppSettingsResponse {
  data: {
    application: {
      name: string;
      description?: string;
      category?: string;
    };
    webhooks: {
      callback_url: string;
      fields: string[];
      verify_token: string;
    };
  };
}

/**
 * 质量评级响应
 * Quality rating response
 */
export interface QualityRatingResponse {
  quality_score: number;
  quality_rating: 'GREEN' | 'YELLOW' | 'RED' | 'UNKNOWN';
  previous_quality_rating?: 'GREEN' | 'YELLOW' | 'RED' | 'UNKNOWN';
  event?: 'FLAGGED' | 'QUALITY_SCORE_CHANGED';
}

/**
 * 消息状态响应
 * Message status response
 */
export interface MessageStatusResponse {
  success: boolean;
}

/**
 * 用户阻止状态响应
 * User block status response
 */
export interface UserBlockStatusResponse {
  success: boolean;
  action: 'block' | 'unblock';
}

/**
 * Webhook验证响应
 * Webhook verification response
 */
export interface WebhookVerificationResponse {
  challenge: string;
}

/**
 * 分页信息
 * Pagination information
 */
export interface PaginationCursors {
  before?: string;
  after?: string;
}

export interface PaginationInfo {
  cursors?: PaginationCursors;
  next?: string;
  previous?: string;
}

/**
 * 分页响应包装器
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> {
  data: T[];
  paging?: PaginationInfo;
}

/**
 * 通用API响应包装器
 * Generic API response wrapper
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: WhatsAppApiError;
  rateLimitInfo?: RateLimitInfo;
  requestId?: string;
  timestamp?: string;
  version?: string;
}

/**
 * 错误响应类型
 * Error response types
 */
export interface WhatsAppApiErrorResponse {
  code: number;
  title: string;
  message: string;
  error_data?: {
    details: string;
    messaging_product?: string;
    fbtrace_id?: string;
  };
  href?: string;
}

export interface WhatsAppApiError {
  error: {
    message: string;
    type: string;
    code: number;
    error_subcode?: number;
    fbtrace_id: string;
    error_user_title?: string;
    error_user_msg?: string;
  };
}

/**
 * 响应类型联合
 * Response type union
 */
export type WhatsAppApiResponseType =
  | SendMessageResponse
  | MediaUploadResponse
  | MediaRetrieveResponse
  | PhoneNumbersResponse
  | BusinessProfileResponse
  | TemplatesResponse
  | AnalyticsResponse
  | BatchResponse
  | AccountInfoResponse
  | AppSettingsResponse
  | QualityRatingResponse
  | MessageStatusResponse
  | UserBlockStatusResponse
  | WebhookVerificationResponse;

/**
 * 响应验证函数
 * Response validation functions
 */
export function isSendMessageResponse(
  response: unknown,
): response is SendMessageResponse {
  return Boolean(
    response &&
      typeof response === 'object' &&
      (response as Record<string, unknown>).messaging_product === 'whatsapp' &&
      Array.isArray((response as Record<string, unknown>).contacts) &&
      Array.isArray((response as Record<string, unknown>).messages),
  );
}

export function isMediaUploadResponse(
  response: unknown,
): response is MediaUploadResponse {
  return Boolean(
    response &&
      typeof response === 'object' &&
      typeof (response as Record<string, unknown>).id === 'string',
  );
}

export function isWhatsAppApiError(error: unknown): error is WhatsAppApiError {
  return Boolean(
    error &&
      typeof error === 'object' &&
      typeof (error as Record<string, unknown>).error === 'object' &&
      'message' in
        ((error as Record<string, unknown>).error as Record<string, unknown>) &&
      'type' in
        ((error as Record<string, unknown>).error as Record<string, unknown>) &&
      'code' in
        ((error as Record<string, unknown>).error as Record<string, unknown>),
  );
}

export function isSuccessResponse<T>(
  response: ApiResponse<T>,
): response is ApiResponse<T> & { success: true; data: T } {
  return response.success && Boolean(response.data);
}

export function isErrorResponse<T>(
  response: ApiResponse<T>,
): response is ApiResponse<T> & { success: false; error: WhatsAppApiError } {
  return !response.success && Boolean(response.error);
}

/**
 * 响应处理工具函数
 * Response handling utility functions
 */
export const ResponseUtils = {
  /**
   * 提取消息ID
   * Extract message ID
   */
  extractMessageId(response: SendMessageResponse): string | null {
    return response.messages?.[0]?.id || null;
  },

  /**
   * 提取联系人信息
   * Extract contact info
   */
  extractContactInfo(
    response: SendMessageResponse,
  ): { input: string; wa_id: string } | null {
    return response.contacts?.[0] || null;
  },

  /**
   * 检查是否为成功响应
   * Check if response is successful
   */
  isSuccess(response: WhatsAppServiceResponse): boolean {
    return response.success && !response.error;
  },

  /**
   * 格式化错误信息
   * Format error message
   */
  formatError(error: WhatsAppApiError): string {
    const { message, type, code } = error.error;
    return `[${type}:${code}] ${message}`;
  },

  /**
   * 提取分页信息
   * Extract pagination info
   */
  extractPaginationInfo<T>(
    response: PaginatedResponse<T>,
  ): PaginationInfo | null {
    return response.paging || null;
  },

  /**
   * 检查是否有下一页
   * Check if has next page
   */
  hasNextPage<T>(response: PaginatedResponse<T>): boolean {
    return Boolean(response.paging?.next || response.paging?.cursors?.after);
  },

  /**
   * 检查是否有上一页
   * Check if has previous page
   */
  hasPreviousPage<T>(response: PaginatedResponse<T>): boolean {
    return Boolean(
      response.paging?.previous || response.paging?.cursors?.before,
    );
  },
};
