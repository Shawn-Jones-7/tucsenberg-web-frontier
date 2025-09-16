'use client';

/**
 * 语言偏好存储主入口文件
 * Main locale storage entry point
 *
 * 这个文件作为所有语言偏好存储模块的统一入口，重新导出所有相关功能
 * This file serves as a unified entry point for all locale storage modules
 */

// 重新导出所有存储模块的功能
// Re-export all storage module functions

// Cookie 管理
export { CookieManager, COOKIE_CONFIG } from '@/lib/locale-storage-cookie';

// LocalStorage 管理
export { LocalStorageManager } from '@/lib/locale-storage-local';

// 用户偏好存储管理
export {
  LocaleStorageManager,
  STORAGE_KEYS,
  type UserLocalePreference,
  type LocaleDetectionHistory,
} from './locale-storage-manager';

// React Hooks
export {
  useLocaleStorage,
  useLocalePreference,
  useDetectionHistory,
  useStorageStats,
  useStorageDataManager,
  useStorageAvailability,
  useAutoCleanup,
  useStorageEvents,
} from './locale-storage-hooks';
