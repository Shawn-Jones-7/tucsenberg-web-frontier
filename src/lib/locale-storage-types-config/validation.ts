import { MAGIC_16, MAGIC_64 } from "@/constants/count";
import { ANIMATION_DURATION_VERY_SLOW, BYTES_PER_KB, COUNT_TEN, DAYS_PER_YEAR, HOURS_PER_DAY, ONE, PERCENTAGE_FULL, SECONDS_PER_MINUTE, TEN_SECONDS_MS, ZERO } from "@/constants/magic-numbers";

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
    'retention.preferences': { min: ZERO, max: DAYS_PER_YEAR * HOURS_PER_DAY * SECONDS_PER_MINUTE * SECONDS_PER_MINUTE * ANIMATION_DURATION_VERY_SLOW },
    'performance.maxEntries': { min: ONE, max: TEN_SECONDS_MS },
    'performance.maxSize': { min: BYTES_PER_KB, max: PERCENTAGE_FULL * BYTES_PER_KB * BYTES_PER_KB },
    'encryption.keyLength': { min: MAGIC_16, max: MAGIC_64 },
    'compression.threshold': { min: ZERO, max: COUNT_TEN * BYTES_PER_KB * BYTES_PER_KB },
  },

  enums: {
    'compression.algorithm': ['none', 'gzip', 'lz4', 'brotli'],
    'encryption.algorithm': ['none', 'aes-256-gcm', 'chacha20-poly1305'],
    'sync.conflictResolution': ['client', 'server', 'merge', 'manual'],
    'debug.logLevel': ['error', 'warn', 'info', 'debug'],
  },

  custom: {
    'retention.preferences': (value: unknown) => {
      return typeof value === 'number' && value >= ZERO;
    },
    'performance.maxEntries': (value: unknown) => {
      return typeof value === 'number' && value > ZERO && Number.isInteger(value);
    },
  },
};
