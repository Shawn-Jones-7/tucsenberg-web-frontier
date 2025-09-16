/**
 * 语言存储系统环境配置预设
 * Locale Storage System Environment Configuration Presets
 */

import type { StorageConfig } from '@/lib/locale-storage-types-config/interfaces';
import { DAYS_PER_MONTH, COUNT_FIVE, SECONDS_PER_MINUTE, COUNT_TEN, BYTES_PER_KB, DAYS_PER_WEEK, HOURS_PER_DAY, COUNT_TRIPLE, MAGIC_6 } from '@/constants/magic-numbers';


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
      interval: DAYS_PER_MONTH * 1000, // DAYS_PER_MONTH秒
      timeout: COUNT_FIVE * 1000,
      retryAttempts: 1,
    },
    errorHandling: {
      retryAttempts: 1,
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
      threshold: 512,
    },
    encryption: {
      enabled: true,
      algorithm: 'aes-256-gcm',
      keyDerivation: 'pbkdf2',
      keyLength: 32,
      saltLength: 16,
      iterations: 100000,
    },
    healthCheck: {
      enabled: true,
      interval: COUNT_FIVE * SECONDS_PER_MINUTE * 1000, // COUNT_FIVE分钟
      timeout: COUNT_TEN * 1000,
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
      interval: 0,
      timeout: 0,
      retryAttempts: 0,
    },
  },

  // 高性能预设
  performance: {
    performance: {
      maxEntries: 50,
      maxSize: BYTES_PER_KB * BYTES_PER_KB, // 1MB
      batchSize: 20,
      throttleDelay: 50,
    },
    compression: {
      enabled: true,
      algorithm: 'lz4',
      threshold: 256,
    },
    retention: {
      preferences: DAYS_PER_WEEK * HOURS_PER_DAY * SECONDS_PER_MINUTE * SECONDS_PER_MINUTE * 1000, // DAYS_PER_WEEK天
      history: COUNT_TRIPLE * HOURS_PER_DAY * SECONDS_PER_MINUTE * SECONDS_PER_MINUTE * 1000, // COUNT_TRIPLE天
      analytics: DAYS_PER_MONTH * HOURS_PER_DAY * SECONDS_PER_MINUTE * SECONDS_PER_MINUTE * 1000, // DAYS_PER_MONTH天
      cache: MAGIC_6 * SECONDS_PER_MINUTE * SECONDS_PER_MINUTE * 1000, // MAGIC_6小时
    },
  },

  // 安全预设
  security: {
    encryption: {
      enabled: true,
      algorithm: 'chacha20-poly1305',
      keyDerivation: 'argon2',
      keyLength: 32,
      saltLength: 32,
      iterations: 200000,
    },
    sync: {
      enabled: true,
      conflictResolution: 'server',
      interval: 300000, // COUNT_FIVE minutes
      retryAttempts: COUNT_TRIPLE,
      timeout: 30000, // DAYS_PER_MONTH seconds
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
