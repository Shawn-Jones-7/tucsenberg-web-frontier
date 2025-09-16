/**
 * 语言存储系统类型守卫函数
 * Locale Storage System Type Guard Functions
 */

import { BaseValidators } from '@/lib/locale-storage-types-base';
import type {
  LocaleDetectionHistory,
  StorageSyncConfig,
  UserLocalePreference,
} from '../locale-storage-types-data';

/**
 * 类型守卫函数
 * Type guard functions
 */

/**
 * 检查是否为用户语言偏好
 * Check if value is user locale preference
 */
export function isUserLocalePreference(
  value: unknown,
): value is UserLocalePreference {
  return (
    typeof value === 'object' &&
    value !== null &&
    'locale' in value &&
    'source' in value &&
    'timestamp' in value &&
    'confidence' in value &&
    BaseValidators.isValidLocale((value as UserLocalePreference).locale) &&
    BaseValidators.isValidSource((value as UserLocalePreference).source) &&
    BaseValidators.isValidTimestamp(
      (value as UserLocalePreference).timestamp,
    ) &&
    BaseValidators.isValidConfidence((value as UserLocalePreference).confidence)
  );
}

/**
 * 检查是否为语言检测历史
 * Check if value is locale detection history
 */
export function isLocaleDetectionHistory(
  value: unknown,
): value is LocaleDetectionHistory {
  return (
    typeof value === 'object' &&
    value !== null &&
    'detections' in value &&
    'lastUpdated' in value &&
    'totalDetections' in value &&
    Array.isArray((value as LocaleDetectionHistory).detections) &&
    typeof (value as LocaleDetectionHistory).lastUpdated === 'number' &&
    typeof (value as LocaleDetectionHistory).totalDetections === 'number'
  );
}

/**
 * 检查是否为存储配置
 * Check if value is storage configuration
 */
export function isStorageSyncConfig(
  value: unknown,
): value is StorageSyncConfig {
  return (
    typeof value === 'object' &&
    value !== null &&
    'interval' in value &&
    'retryAttempts' in value &&
    typeof (value as StorageSyncConfig).interval === 'number' &&
    typeof (value as StorageSyncConfig).retryAttempts === 'number'
  );
}
