/**
 * WhatsApp API 默认配置
 * WhatsApp API Default Configurations
 */

import { API_VERSIONS } from '@/types/whatsapp-api-config/constants';
import type { ApiConfig, WebhookConfig } from '@/types/whatsapp-api-config/interfaces';

export const DEFAULT_API_CONFIG: Partial<ApiConfig> = {
  baseUrl: 'https://graph.facebook.com',
  version: API_VERSIONS.LATEST,
  timeout: 30000,
  retries: 3,
  retryDelay: 1000,
  userAgent: 'WhatsApp-Business-API-Client/1.0',
};

export const DEFAULT_WEBHOOK_CONFIG: Partial<WebhookConfig> = {
  fields: [
    'messages',
    'message_deliveries',
    'message_reads',
    'message_reactions',
  ],
  enableSignatureVerification: true,
  timeout: 10000,
  retryPolicy: {
    maxRetries: 3,
    backoffMultiplier: 2,
    initialDelay: 1000,
    maxDelay: 10000,
  },
};

export const DEFAULT_REQUEST_OPTIONS = {
  timeout: 30000,
  retries: 3,
  retryDelay: 1000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
};
