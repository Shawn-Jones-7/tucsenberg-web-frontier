/**
 * WhatsApp API 工具函数
 * WhatsApp API Utility Functions
 */

import {
  API_VERSIONS,
  MEDIA_TYPES,
  MESSAGE_TYPES,
} from '@/types/whatsapp-api-config/constants';
import { DEFAULT_API_CONFIG } from '@/types/whatsapp-api-config/defaults';
import {
  ERROR_CODE_MESSAGES,
  RETRYABLE_ERROR_CODES,
} from '@/types/whatsapp-api-config/errors';
import type { ApiConfig } from '@/types/whatsapp-api-config/interfaces';
import type {
  ApiVersion,
  ErrorCode,
  MediaType,
  MessageType,
} from '@/types/whatsapp-api-config/types';

/**
 * 配置工具函数
 * Configuration utility functions
 */
export const ConfigUtils = {
  /**
   * 合并配置
   * Merge configurations
   */
  mergeConfigs<T extends Record<string, unknown>>(
    base: T,
    override: Partial<T>,
  ): T {
    return { ...base, ...override };
  },

  /**
   * 创建完整的API URL
   * Create full API URL
   */
  buildApiUrl(config: ApiConfig, endpoint: string): string {
    return `${config.baseUrl}/${config.version}/${config.phoneNumberId}/${endpoint}`;
  },

  /**
   * 获取默认请求头
   * Get default request headers
   */
  getDefaultHeaders(config: ApiConfig): Record<string, string> {
    return {
      'Authorization': `Bearer ${config.accessToken}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'User-Agent': config.userAgent || DEFAULT_API_CONFIG.userAgent!,
    };
  },

  /**
   * 检查错误是否可重试
   * Check if error is retryable
   */
  isRetryableError(errorCode: number): boolean {
    return RETRYABLE_ERROR_CODES.includes(errorCode as ErrorCode);
  },

  /**
   * 获取错误消息
   * Get error message
   */
  getErrorMessage(errorCode: number): string {
    return ERROR_CODE_MESSAGES[errorCode as ErrorCode] || 'Unknown error';
  },

  /**
   * 验证API版本
   * Validate API version
   */
  isValidApiVersion(version: string): version is ApiVersion {
    return Object.values(API_VERSIONS).includes(version as ApiVersion);
  },

  /**
   * 验证消息类型
   * Validate message type
   */
  isValidMessageType(type: string): type is MessageType {
    return Object.values(MESSAGE_TYPES).includes(type as MessageType);
  },

  /**
   * 验证媒体类型
   * Validate media type
   */
  isValidMediaType(type: string): type is MediaType {
    return Object.values(MEDIA_TYPES).includes(type as MediaType);
  },
};
