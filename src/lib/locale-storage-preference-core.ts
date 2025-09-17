/**
 * 用户语言偏好核心管理
 * User Locale Preference Core Management
 *
 * 负责用户偏好的基础操作：保存、获取、验证和核心数据管理
 */

'use client';

import { DEC_0_01, MAGIC_0_5, MAGIC_0_7 } from "@/constants/decimal";
import { ANIMATION_DURATION_VERY_SLOW, COUNT_PAIR, COUNT_TRIPLE, ONE, ZERO } from "@/constants/magic-numbers";
import { CookieManager } from '@/lib/locale-storage-cookie';
import { LocalStorageManager } from '@/lib/locale-storage-local';
import { isUserLocalePreference } from '@/lib/locale-storage-types';
import type { Locale } from '@/types/i18n';
import type {
  StorageOperationResult,
  UserLocalePreference,
  ValidationResult,
} from './locale-storage-types';

// ==================== 数据验证功能 ====================

/**
 * 验证偏好数据
 * Validate preference data
 */
export function validatePreferenceData(preference: unknown): ValidationResult {
  if (!isUserLocalePreference(preference)) {
    return {
      isValid: false,
      errors: ['Invalid preference data structure'],
      warnings: [],
    };
  }

  const errors: string[] = [];

  // 验证语言代码
  if (!preference.locale || typeof preference.locale !== 'string') {
    errors.push('Invalid locale');
  }

  // 验证来源
  if (!preference.source || typeof preference.source !== 'string') {
    errors.push('Invalid source');
  }

  // 验证置信度
  if (
    typeof preference.confidence !== 'number' ||
    preference.confidence < ZERO ||
    preference.confidence > ONE
  ) {
    errors.push('Invalid confidence value (must be between 0 and 1)');
  }

  // 验证时间戳
  if (typeof preference.timestamp !== 'number' || preference.timestamp <= ZERO) {
    errors.push('Invalid timestamp');
  }

  // 验证元数据（如果存在）
  if (preference.metadata && typeof preference.metadata !== 'object') {
    errors.push('Invalid metadata');
  }

  return {
    isValid: errors.length === ZERO,
    errors,
    warnings: [],
  };
}

/**
 * 创建默认偏好
 * Create default preference
 */
export function createDefaultPreference(
  locale: Locale = 'en',
): UserLocalePreference {
  return {
    locale,
    source: 'default',
    confidence: MAGIC_0_5,
    timestamp: Date.now(),
    metadata: {},
  };
}

/**
 * 规范化偏好数据
 * Normalize preference data
 */
export function normalizePreference(
  preference: UserLocalePreference,
): UserLocalePreference {
  return {
    locale: preference.locale,
    source: preference.source,
    confidence: Math.max(ZERO, Math.min(ONE, preference.confidence)),
    timestamp: preference.timestamp || Date.now(),
    metadata: preference.metadata || {},
  };
}

// ==================== 核心偏好管理 ====================

/**
 * 保存用户语言偏好
 * Save user locale preference
 */
export function saveUserPreference(
  preference: UserLocalePreference,
): StorageOperationResult<UserLocalePreference> {
  const startTime = Date.now();

  try {
    // 验证偏好数据
    const validation = validatePreferenceData(preference);
    if (!validation.isValid) {
      return {
        success: false,
        error: `Invalid preference data: ${validation.errors.join(', ')}`,
        timestamp: Date.now(),
        responseTime: Date.now() - startTime,
      };
    }

    // 规范化数据
    const normalizedPreference = normalizePreference(preference);

    // 保存到 localStorage
    LocalStorageManager.set('locale_preference', normalizedPreference);

    // 保存到 cookies（用于 SSR）
    CookieManager.set('locale_preference', normalizedPreference.locale);

    // 两个存储操作都返回void，我们假设成功
    // 如果有错误，会在try-catch中捕获
    return {
      success: true,
      data: normalizedPreference,
      source: 'localStorage',
      timestamp: Date.now(),
      responseTime: Date.now() - startTime,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: Date.now(),
      responseTime: Date.now() - startTime,
    };
  }
}

/**
 * 获取用户语言偏好
 * Get user locale preference
 */
export function getUserPreference(): StorageOperationResult<UserLocalePreference> {
  const startTime = Date.now();

  try {
    // 首先尝试从 localStorage 获取
    const localPreference =
      LocalStorageManager.get<UserLocalePreference>('locale_preference');

    if (localPreference && validatePreferenceData(localPreference).isValid) {
      return {
        success: true,
        data: localPreference,
        source: 'localStorage',
        timestamp: Date.now(),
        responseTime: Date.now() - startTime,
      };
    }

    // 如果 localStorage 没有，尝试从 cookies 获取
    const cookieLocale = CookieManager.get('locale_preference');

    if (cookieLocale) {
      const cookiePreference: UserLocalePreference = {
        locale: cookieLocale as Locale,
        source: 'fallback',
        confidence: MAGIC_0_7,
        timestamp: Date.now(),
        metadata: { source: 'cookie_fallback' },
      };

      // 同步到 localStorage
      const _syncResult = saveUserPreference(cookiePreference);
      // 同步结果已保存但在此处未直接使用

      return {
        success: true,
        data: cookiePreference,
        source: 'cookies',
        timestamp: Date.now(),
        responseTime: Date.now() - startTime,
      };
    }

    // 如果都没有，返回默认偏好
    const defaultPreference = createDefaultPreference();

    return {
      success: true,
      data: defaultPreference,
      source: 'default',
      timestamp: Date.now(),
      responseTime: Date.now() - startTime,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: Date.now(),
      responseTime: Date.now() - startTime,
    };
  }
}

/**
 * 更新偏好置信度
 * Update preference confidence
 */
export function updatePreferenceConfidence(
  confidence: number,
): StorageOperationResult<UserLocalePreference> {
  const currentResult = getUserPreference();

  if (!currentResult.success || !currentResult.data) {
    return {
      success: false,
      error: 'Failed to get current preference',
      timestamp: Date.now(),
    };
  }

  const updatedPreference: UserLocalePreference = {
    ...currentResult.data,
    confidence: Math.max(ZERO, Math.min(ONE, confidence)),
    timestamp: Date.now(),
  };

  return saveUserPreference(updatedPreference);
}

/**
 * 检查偏好是否存在
 * Check if preference exists
 */
export function hasUserPreference(): boolean {
  const localPreference =
    LocalStorageManager.get<UserLocalePreference>('locale_preference');
  const cookieLocale = CookieManager.get('locale_preference');

  return (
    (localPreference && validatePreferenceData(localPreference).isValid) ||
    Boolean(cookieLocale)
  );
}

/**
 * 获取偏好来源优先级
 * Get preference source priority
 */
export function getPreferenceSourcePriority(): Array<{
  source: string;
  available: boolean;
  priority: number;
}> {
  const localPreference =
    LocalStorageManager.get<UserLocalePreference>('locale_preference');
  const cookieLocale = CookieManager.get('locale_preference');

  return [
    {
      source: 'localStorage',
      available: Boolean(localPreference && validatePreferenceData(localPreference).isValid),
      priority: ONE,
    },
    {
      source: 'cookies',
      available: Boolean(cookieLocale),
      priority: COUNT_PAIR,
    },
    {
      source: 'default',
      available: true,
      priority: COUNT_TRIPLE,
    },
  ];
}

/**
 * 比较两个偏好
 * Compare two preferences
 */
export function comparePreferences(
  pref1: UserLocalePreference,
  pref2: UserLocalePreference,
): {
  isEqual: boolean;
  differences: string[];
} {
  const differences: string[] = [];

  if (pref1.locale !== pref2.locale) {
    differences.push(`locale: ${pref1.locale} vs ${pref2.locale}`);
  }

  if (pref1.source !== pref2.source) {
    differences.push(`source: ${pref1.source} vs ${pref2.source}`);
  }

  if (Math.abs(pref1.confidence - pref2.confidence) > DEC_0_01) {
    differences.push(`confidence: ${pref1.confidence} vs ${pref2.confidence}`);
  }

  if (Math.abs(pref1.timestamp - pref2.timestamp) > ANIMATION_DURATION_VERY_SLOW) {
    differences.push(`timestamp: ${pref1.timestamp} vs ${pref2.timestamp}`);
  }

  return {
    isEqual: differences.length === ZERO,
    differences,
  };
}

/**
 * 获取偏好摘要
 * Get preference summary
 */
export function getPreferenceSummary(): {
  hasPreference: boolean;
  locale: Locale | null;
  source: string | null;
  confidence: number | null;
  age: number | null;
  isValid: boolean;
} {
  const result = getUserPreference();

  if (!result.success || !result.data) {
    return {
      hasPreference: false,
      locale: null,
      source: null,
      confidence: null,
      age: null,
      isValid: false,
    };
  }

  const preference = result.data;
  const age = Date.now() - preference.timestamp;

  return {
    hasPreference: true,
    locale: preference.locale,
    source: preference.source,
    confidence: preference.confidence,
    age,
    isValid: validatePreferenceData(preference).isValid,
  };
}

/**
 * 清除用户偏好
 * Clear user preference
 */
export function clearUserPreference(): StorageOperationResult<void> {
  const startTime = Date.now();

  try {
    // 清除 localStorage
    const _localResult = LocalStorageManager.remove('locale_preference');

    // 清除 cookies
    const _cookieResult = CookieManager.remove('locale_preference');
    // 清除结果已保存但在此处未直接使用

    return {
      success: true,
      data: undefined,
      source: 'both',
      timestamp: Date.now(),
      responseTime: Date.now() - startTime,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: Date.now(),
      responseTime: Date.now() - startTime,
    };
  }
}
