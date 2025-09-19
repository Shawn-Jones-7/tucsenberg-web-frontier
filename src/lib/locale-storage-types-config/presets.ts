/**
 * 语言存储系统环境配置预设
 * Locale Storage System Environment Configuration Presets
 */

import type { StorageConfig } from '@/lib/locale-storage-types-config/interfaces';
import {
  ANIMATION_DURATION_VERY_SLOW,
  BYTES_PER_KB,
  COUNT_FIVE,
  COUNT_TEN,
  COUNT_TRIPLE,
  DAYS_PER_MONTH,
  DAYS_PER_WEEK,
  HOURS_PER_DAY,
  MAGIC_6,
  ONE,
  PERCENTAGE_HALF,
  SECONDS_PER_MINUTE,
  THIRTY_SECONDS_MS,
  ZERO,
} from '@/constants';
import {
  COUNT_256,
  COUNT_100000,
  COUNT_200000,
  COUNT_300000,
  MAGIC_16,
  MAGIC_20,
  MAGIC_32,
  MAGIC_512,
} from '@/constants/count';

/**
 * 配置预设
 * Configuration presets
 */
export const CONFIG_PRESETS: Record<string, Partial<StorageConfig>> = {
  // 开发环境预设
  development: {
    debug: {
      enabled: true,
      logLevel: 'debug',
      logToConsole: true,
      logToStorage: true,
    },
    healthCheck: {
      enabled: true,
      interval: DAYS_PER_MONTH * ANIMATION_DURATION_VERY_SLOW, // DAYS_PER_MONTH秒
      timeout: COUNT_FIVE * ANIMATION_DURATION_VERY_SLOW,
      retryAttempts: ONE,
    },
    errorHandling: {
      retryAttempts: ONE,
      retryDelay: 500,
      fallbackStorage: ['localStorage', 'memory'],
      logErrors: true,
    },
  },

  // 生产环境预设
  production: {
    debug: {
      enabled: false,
      logLevel: 'error',
      logToConsole: false,
      logToStorage: true,
    },
    compression: {
      enabled: true,
      algorithm: 'gzip',
      threshold: MAGIC_512,
    },
    encryption: {
      enabled: true,
      algorithm: 'aes-256-gcm',
      keyDerivation: 'pbkdf2',
      keyLength: MAGIC_32,
      saltLength: MAGIC_16,
      iterations: COUNT_100000,
    },
    healthCheck: {
      enabled: true,
      interval: COUNT_FIVE * SECONDS_PER_MINUTE * ANIMATION_DURATION_VERY_SLOW, // COUNT_FIVE分钟
      timeout: COUNT_TEN * ANIMATION_DURATION_VERY_SLOW,
      retryAttempts: COUNT_TRIPLE,
    },
  },

  // 测试环境预设
  test: {
    enableCookies: false,
    enableLocalStorage: false,
    enableSessionStorage: false,
    enableIndexedDB: false,
    enableMemoryCache: true,
    debug: {
      enabled: false,
      logLevel: 'error',
      logToConsole: false,
      logToStorage: false,
    },
    healthCheck: {
      enabled: false,
      interval: ZERO,
      timeout: ZERO,
      retryAttempts: ZERO,
    },
  },

  // 高性能预设
  performance: {
    performance: {
      maxEntries: PERCENTAGE_HALF,
      maxSize: BYTES_PER_KB * BYTES_PER_KB, // 1MB
      batchSize: MAGIC_20,
      throttleDelay: PERCENTAGE_HALF,
    },
    compression: {
      enabled: true,
      algorithm: 'lz4',
      threshold: COUNT_256,
    },
    retention: {
      preferences:
        DAYS_PER_WEEK *
        HOURS_PER_DAY *
        SECONDS_PER_MINUTE *
        SECONDS_PER_MINUTE *
        ANIMATION_DURATION_VERY_SLOW, // DAYS_PER_WEEK天
      history:
        COUNT_TRIPLE *
        HOURS_PER_DAY *
        SECONDS_PER_MINUTE *
        SECONDS_PER_MINUTE *
        ANIMATION_DURATION_VERY_SLOW, // COUNT_TRIPLE天
      analytics:
        DAYS_PER_MONTH *
        HOURS_PER_DAY *
        SECONDS_PER_MINUTE *
        SECONDS_PER_MINUTE *
        ANIMATION_DURATION_VERY_SLOW, // DAYS_PER_MONTH天
      cache:
        MAGIC_6 *
        SECONDS_PER_MINUTE *
        SECONDS_PER_MINUTE *
        ANIMATION_DURATION_VERY_SLOW, // MAGIC_6小时
    },
  },

  // 安全预设
  security: {
    encryption: {
      enabled: true,
      algorithm: 'chacha20-poly1305',
      keyDerivation: 'argon2',
      keyLength: MAGIC_32,
      saltLength: MAGIC_32,
      iterations: COUNT_200000,
    },
    sync: {
      enabled: true,
      conflictResolution: 'server',
      interval: COUNT_300000, // COUNT_FIVE minutes
      retryAttempts: COUNT_TRIPLE,
      timeout: THIRTY_SECONDS_MS, // DAYS_PER_MONTH seconds
      authentication: {
        type: 'oauth',
        credentials: {},
      },
    },
    debug: {
      enabled: false,
      logLevel: 'error',
      logToConsole: false,
      logToStorage: false,
    },
  },
};
