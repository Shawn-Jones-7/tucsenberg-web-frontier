/**
 * 语言存储系统验证函数
 * Locale Storage System Validation Functions
 */

import { BaseValidators } from '@/lib/locale-storage-types-base';
import { safeGetArrayItem } from '@/lib/security-object-access';
import { MAGIC_0_3, MAGIC_0_9, ONE, ZERO } from '@/constants';

import type {
  LocaleDetectionHistory,
  UserLocalePreference,
  ValidationResult,
} from '@/lib/locale-storage-types-data';

/**
 * 验证函数
 * Validation functions
 */

/**
 * 验证用户偏好
 * Validate user preference
 */
export function validatePreference(
  preference: UserLocalePreference,
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  validateRequiredFields(preference, errors);
  validateMetadata(preference, warnings, errors);

  // 置信度与来源的一致性
  if (preference.source === 'user' && preference.confidence < MAGIC_0_9) {
    warnings.push('User-selected preferences should have high confidence');
  }
  if (preference.source === 'fallback' && preference.confidence > MAGIC_0_3) {
    warnings.push('Fallback preferences should have low confidence');
  }

  return { isValid: errors.length === ZERO, errors, warnings };
}

function validateRequiredFields(preference: UserLocalePreference, errors: string[]): void {
  if (!BaseValidators.isValidLocale(preference.locale)) {
    errors.push('Invalid locale');
  }
  if (!BaseValidators.isValidSource(preference.source)) {
    errors.push('Invalid source');
  }
  if (!BaseValidators.isValidTimestamp(preference.timestamp)) {
    errors.push('Invalid timestamp');
  }
  if (!BaseValidators.isValidConfidence(preference.confidence)) {
    errors.push('Invalid confidence value');
  }
}

function validateMetadata(
  preference: UserLocalePreference,
  warnings: string[],
  errors: string[],
): void {
  if (!preference.metadata) return;
  if (typeof preference.metadata !== 'object') {
    errors.push('Metadata must be an object');
    return;
  }
  if (preference.metadata.userAgent && typeof preference.metadata.userAgent !== 'string') {
    warnings.push('User agent should be a string');
  }
  if (preference.metadata.ipCountry && typeof preference.metadata.ipCountry !== 'string') {
    warnings.push('IP country should be a string');
  }
  if (preference.metadata.browserLanguages && !Array.isArray(preference.metadata.browserLanguages)) {
    warnings.push('Browser languages should be an array');
  }
  if (preference.metadata.timezone && typeof preference.metadata.timezone !== 'string') {
    warnings.push('Timezone should be a string');
  }
}

/**
 * 验证检测历史
 * Validate detection history
 */
export function validateDetectionHistory(
  history: LocaleDetectionHistory,
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 验证检测记录数组
  if (!Array.isArray(history.detections)) {
    errors.push('Detections must be an array');
  } else {
    // 验证每个检测记录
    history.detections.forEach((detection, index) => {
      if (!BaseValidators.isValidLocale(detection.locale)) {
        errors.push(`Invalid locale in detection ${index}`);
      }

      if (!BaseValidators.isValidSource(detection.source)) {
        errors.push(`Invalid source in detection ${index}`);
      }

      if (!BaseValidators.isValidTimestamp(detection.timestamp)) {
        errors.push(`Invalid timestamp in detection ${index}`);
      }

      if (!BaseValidators.isValidConfidence(detection.confidence)) {
        errors.push(`Invalid confidence in detection ${index}`);
      }
    });

    // 验证数量一致性
    if (history.detections.length !== history.totalDetections) {
      warnings.push('Detection count mismatch');
    }

    // 验证时间顺序
    for (let i = ONE; i < history.detections.length; i++) {
      const current = safeGetArrayItem(history.detections, i);
      const previous = safeGetArrayItem(history.detections, i - ONE);
      if (current && previous && current.timestamp < previous.timestamp) {
        warnings.push('Detections are not in chronological order');
        break;
      }
    }
  }

  // 验证最后更新时间
  if (!BaseValidators.isValidTimestamp(history.lastUpdated)) {
    errors.push('Invalid lastUpdated timestamp');
  }

  // 验证总检测数
  if (
    typeof history.totalDetections !== 'number' ||
    history.totalDetections < ZERO
  ) {
    errors.push('Invalid totalDetections');
  }

  return {
    isValid: errors.length === ZERO,
    errors,
    warnings,
  };
}
