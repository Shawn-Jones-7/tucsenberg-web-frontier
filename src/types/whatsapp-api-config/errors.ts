/**
 * WhatsApp API 错误处理
 * WhatsApp API Error Handling
 */

import type {
  ApiConfig,
  WebhookConfig,
} from '@/types/whatsapp-api-config/interfaces';
import type { ErrorCode } from '@/types/whatsapp-api-config/types';
import {
  MAGIC_131,
  MAGIC_131000,
  MAGIC_131014,
  MAGIC_131016,
  MAGIC_131052,
  MAGIC_131053,
} from '@/constants';

/**
 * 错误代码映射
 * Error code mappings
 */
export const ERROR_CODE_MESSAGES: Record<ErrorCode, string> = {
  100: 'Generic user error',
  131: 'Generic temporary error',
  132: 'Generic limit reached',
  133: 'Generic permission error',
  136: 'Generic authentication error',
  190: 'Access token error',
  368: 'Temporarily blocked for policies violations',
  131000: 'Generic temporary error',
  131005: 'Request limit reached',
  131008: 'Required parameter is missing',
  131009: 'Parameter value is not valid',
  131014: 'Request timeout',
  131016: 'Service temporarily unavailable',
  131021: 'Recipient phone number not valid',
  131026: 'Message undeliverable',
  131047: 'Re-engagement message',
  131051: 'Unsupported message type',
  131052: 'Media download error',
  131053: 'Media upload error',
};

/**
 * 可重试的错误代码
 * Retryable error codes
 */
export const RETRYABLE_ERROR_CODES: ErrorCode[] = [
  MAGIC_131, // Generic temporary error
  MAGIC_131000, // Generic temporary error
  MAGIC_131014, // Request timeout
  MAGIC_131016, // Service temporarily unavailable
  MAGIC_131052, // Media download error
  MAGIC_131053, // Media upload error
];

/**
 * 配置验证函数
 * Configuration validation functions
 */
export function validateApiConfig(config: Partial<ApiConfig>): string[] {
  const errors: string[] = [];

  if (!config.accessToken) {
    errors.push('Access token is required');
  }

  if (!config.phoneNumberId) {
    errors.push('Phone number ID is required');
  }

  if (config.timeout && config.timeout <= 0) {
    errors.push('Timeout must be greater than 0');
  }

  if (config.retries && config.retries < 0) {
    errors.push('Retries must be non-negative');
  }

  if (config.retryDelay && config.retryDelay <= 0) {
    errors.push('Retry delay must be greater than 0');
  }

  return errors;
}

export function validateWebhookConfig(
  config: Partial<WebhookConfig>,
): string[] {
  const errors: string[] = [];

  if (!config.url) {
    errors.push('Webhook URL is required');
  }

  if (!config.verifyToken) {
    errors.push('Verify token is required');
  }

  if (config.fields && !Array.isArray(config.fields)) {
    errors.push('Fields must be an array');
  }

  if (config.timeout && config.timeout <= 0) {
    errors.push('Timeout must be greater than 0');
  }

  return errors;
}
