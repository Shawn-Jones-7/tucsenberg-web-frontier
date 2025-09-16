import { BYTES_PER_KB, COUNT_TEN, DAYS_PER_YEAR, HOURS_PER_DAY, SECONDS_PER_MINUTE } from '@/constants/magic-numbers';

/**
 * 语言存储系统配置验证规则
 * Locale Storage System Configuration Validation Rules
 */

/**
 * 配置验证规则
 * Configuration validation rules
 */
export interface ConfigValidationRules {
  required: string[];
  optional: string[];
  types: Record<string, string>;
  ranges: Record<string, { min?: number; max?: number }>;
  enums: Record<string, string[]>;
  custom: Record<string, (value: unknown) => boolean>;
}

/**
 * 配置验证器
 * Configuration validator
 */
export const CONFIG_VALIDATION_RULES: ConfigValidationRules = {
  required: [
    'enableCookies',
    'enableLocalStorage',
    'retention.preferences',
    'performance.maxEntries',
  ],

  optional: [
    'compression.enabled',
    'encryption.enabled',
    'sync.enabled',
    'debug.enabled',
  ],

  types: {
    'enableCookies': 'boolean',
    'enableLocalStorage': 'boolean',
    'retention.preferences': 'number',
    'performance.maxEntries': 'number',
    'compression.algorithm': 'string',
    'encryption.algorithm': 'string',
  },

  ranges: {
    'retention.preferences': { min: 0, max: DAYS_PER_YEAR * HOURS_PER_DAY * SECONDS_PER_MINUTE * SECONDS_PER_MINUTE * 1000 },
    'performance.maxEntries': { min: 1, max: 10000 },
    'performance.maxSize': { min: BYTES_PER_KB, max: 100 * BYTES_PER_KB * BYTES_PER_KB },
    'encryption.keyLength': { min: 16, max: 64 },
    'compression.threshold': { min: 0, max: COUNT_TEN * BYTES_PER_KB * BYTES_PER_KB },
  },

  enums: {
    'compression.algorithm': ['none', 'gzip', 'lz4', 'brotli'],
    'encryption.algorithm': ['none', 'aes-256-gcm', 'chacha20-poly1305'],
    'sync.conflictResolution': ['client', 'server', 'merge', 'manual'],
    'debug.logLevel': ['error', 'warn', 'info', 'debug'],
  },

  custom: {
    'retention.preferences': (value: unknown) => {
      return typeof value === 'number' && value >= 0;
    },
    'performance.maxEntries': (value: unknown) => {
      return typeof value === 'number' && value > 0 && Number.isInteger(value);
    },
  },
};
