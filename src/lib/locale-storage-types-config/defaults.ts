/**
 * 语言存储系统默认配置常量
 * Locale Storage System Default Configuration Constants
 */

import { STORAGE_CONSTANTS } from '@/lib/locale-storage-types-base';
import type { StorageConfig } from '@/lib/locale-storage-types-config/interfaces';

/**
 * 默认存储配置
 * Default storage configuration
 */
export const DEFAULT_STORAGE_CONFIG: StorageConfig = {
  enableCookies: true,
  enableLocalStorage: true,
  enableSessionStorage: false,
  enableIndexedDB: false,
  enableMemoryCache: true,

  retention: {
    preferences: STORAGE_CONSTANTS.DEFAULT_RETENTION_TIME,
    history: STORAGE_CONSTANTS.DEFAULT_RETENTION_TIME,
    analytics: STORAGE_CONSTANTS.ANALYTICS_RETENTION_TIME,
    cache: STORAGE_CONSTANTS.CACHE_RETENTION_TIME,
  },

  performance: {
    maxEntries: STORAGE_CONSTANTS.MAX_HISTORY_ENTRIES,
    maxSize: STORAGE_CONSTANTS.MAX_LOCALSTORAGE_SIZE,
    batchSize: 10,
    throttleDelay: 100,
  },

  compression: {
    enabled: false,
    algorithm: 'none',
    threshold: STORAGE_CONSTANTS.COMPRESSION_THRESHOLD,
  },

  encryption: {
    enabled: false,
    algorithm: 'none',
    keyDerivation: 'pbkdf2',
    keyLength: STORAGE_CONSTANTS.ENCRYPTION_KEY_LENGTH,
    saltLength: 16,
    iterations: 10000,
  },

  sync: {
    enabled: false,
    interval: STORAGE_CONSTANTS.SYNC_INTERVAL,
    retryAttempts: STORAGE_CONSTANTS.SYNC_RETRY_ATTEMPTS,
    timeout: STORAGE_CONSTANTS.SYNC_TIMEOUT,
    conflictResolution: 'client',
  },

  healthCheck: {
    enabled: true,
    interval: STORAGE_CONSTANTS.HEALTH_CHECK_INTERVAL,
    timeout: STORAGE_CONSTANTS.HEALTH_CHECK_TIMEOUT,
    retryAttempts: 3,
  },

  errorHandling: {
    retryAttempts: STORAGE_CONSTANTS.MAX_RETRY_ATTEMPTS,
    retryDelay: STORAGE_CONSTANTS.RETRY_DELAY,
    fallbackStorage: ['localStorage', 'cookie', 'memory'],
    logErrors: true,
  },

  debug: {
    enabled: process.env.NODE_ENV === 'development',
    logLevel: 'warn',
    logToConsole: true,
    logToStorage: false,
  },
};
