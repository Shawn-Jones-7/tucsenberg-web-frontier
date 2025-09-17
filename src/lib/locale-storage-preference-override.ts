/**
 * 用户语言偏好覆盖管理
 * User Locale Preference Override Management
 *
 * 负责用户手动覆盖语言设置的功能，包括设置、获取、清除覆盖
 */

'use client';

import { MAGIC_0_8 } from "@/constants/decimal";
import { ONE, PERCENTAGE_HALF, ZERO } from "@/constants/magic-numbers";
import { CookieManager } from '@/lib/locale-storage-cookie';
import { LocalStorageManager } from '@/lib/locale-storage-local';
import type { Locale } from '@/types/i18n';
import {
  getUserPreference,
  saveUserPreference,
} from './locale-storage-preference-core';
import type {
  StorageOperationResult,
  UserLocalePreference,
} from './locale-storage-types';

// ==================== 用户覆盖管理 ====================

/**
 * 设置用户语言覆盖
 * Set user locale override
 */
export function setUserOverride(
  locale: Locale,
  metadata?: Record<string, unknown>,
): StorageOperationResult<UserLocalePreference> {
  const preference: UserLocalePreference = {
    locale,
    source: 'user',
    confidence: ONE, // 用户手动选择，置信度最高
    timestamp: Date.now(),
    metadata: {
      ...metadata,
      isOverride: true,
      originalSource: 'user_manual',
    },
  };

  // 保存偏好
  const saveResult = saveUserPreference(preference);

  if (saveResult.success) {
    // 同时保存覆盖标记到单独的存储键
    LocalStorageManager.set('user_locale_override', locale);
    CookieManager.set('user_locale_override', locale);
  }

  return saveResult;
}

/**
 * 获取用户语言覆盖
 * Get user locale override
 */
export function getUserOverride(): StorageOperationResult<Locale> {
  const startTime = Date.now();

  try {
    // 首先检查专门的覆盖存储
    const localOverride = LocalStorageManager.get<Locale>(
      'user_locale_override',
    );

    if (localOverride) {
      return {
        success: true,
        data: localOverride,
        source: 'localStorage',
        timestamp: Date.now(),
        responseTime: Date.now() - startTime,
      };
    }

    // 检查 cookies 中的覆盖
    const cookieOverride = CookieManager.get('user_locale_override');

    if (cookieOverride) {
      // 同步到 localStorage
      LocalStorageManager.set('user_locale_override', cookieOverride);

      return {
        success: true,
        data: cookieOverride as Locale,
        source: 'cookies',
        timestamp: Date.now(),
        responseTime: Date.now() - startTime,
      };
    }

    // 检查主偏好是否为用户覆盖
    const preferenceResult = getUserPreference();

    if (
      preferenceResult.success &&
      preferenceResult.data &&
      preferenceResult.data.source === 'user_override'
    ) {
      return {
        success: true,
        data: preferenceResult.data.locale,
        timestamp: Date.now(),
        responseTime: Date.now() - startTime,
        ...(preferenceResult.source && { source: preferenceResult.source }),
      };
    }

    // 没有找到覆盖
    return {
      success: false,
      error: 'No user override found',
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
 * 清除用户语言覆盖
 * Clear user locale override
 */
export function clearUserOverride(): StorageOperationResult<void> {
  const startTime = Date.now();

  try {
    // 清除专门的覆盖存储
    LocalStorageManager.remove('user_locale_override');
    CookieManager.remove('user_locale_override');

    // 检查主偏好是否为覆盖，如果是则清除
    const preferenceResult = getUserPreference();

    if (
      preferenceResult.success &&
      preferenceResult.data &&
      preferenceResult.data.source === 'user_override'
    ) {
      // 创建一个新的非覆盖偏好
      const newPreference: UserLocalePreference = {
        ...preferenceResult.data,
        source: 'auto',
        confidence: MAGIC_0_8,
        timestamp: Date.now(),
        metadata: {
          ...preferenceResult.data.metadata,
          isOverride: false,
          clearedAt: Date.now(),
        },
      };

      saveUserPreference(newPreference);
    }

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

/**
 * 检查是否有用户覆盖
 * Check if user override exists
 */
export function hasUserOverride(): boolean {
  const localOverride = LocalStorageManager.get<Locale>('user_locale_override');
  const cookieOverride = CookieManager.get('user_locale_override');

  if (localOverride || cookieOverride) {
    return true;
  }

  // 检查主偏好
  const preferenceResult = getUserPreference();
  return (
    preferenceResult.success &&
    preferenceResult.data?.source === 'user_override'
  );
}

/**
 * 获取覆盖历史
 * Get override history
 */
export function getOverrideHistory(): Array<{
  locale: Locale;
  timestamp: number;
  action: 'set' | 'clear';
  metadata?: Record<string, unknown>;
}> {
  const history: Array<{
    locale: Locale;
    timestamp: number;
    action: 'set' | 'clear';
    metadata?: Record<string, unknown>;
  }> = [];

  // 从 localStorage 获取历史记录
  const storedHistory = LocalStorageManager.get<
    Array<{
      locale: Locale;
      timestamp: number;
      action: 'set' | 'clear';
      metadata?: Record<string, unknown>;
    }>
  >('override_history');

  if (storedHistory && Array.isArray(storedHistory)) {
    history.push(...storedHistory);
  }

  return history.sort((a, b) => b.timestamp - a.timestamp);
}

/**
 * 记录覆盖操作
 * Record override operation
 */
export function recordOverrideOperation(
  locale: Locale,
  action: 'set' | 'clear',
  metadata?: Record<string, unknown>,
): void {
  const history = getOverrideHistory();

  const newEntry = {
    locale,
    timestamp: Date.now(),
    action,
    ...(metadata && { metadata }),
  };

  history.unshift(newEntry);

  // 限制历史记录数量
  const maxHistory = PERCENTAGE_HALF;
  if (history.length > maxHistory) {
    history.splice(maxHistory);
  }

  LocalStorageManager.set('override_history', history);
}

/**
 * 获取覆盖统计
 * Get override statistics
 */
export function getOverrideStats(): {
  totalOverrides: number;
  currentOverride: Locale | null;
  lastOverrideTime: number | null;
  mostUsedLocale: Locale | null;
  overrideFrequency: Record<Locale, number>;
} {
  const history = getOverrideHistory();
  const currentOverride = getUserOverride();

  const stats = {
    totalOverrides: ZERO,
    currentOverride:
      currentOverride.success && currentOverride.data
        ? currentOverride.data
        : null,
    lastOverrideTime: null as number | null,
    mostUsedLocale: null as Locale | null,
    overrideFrequency: {} as Record<Locale, number>,
  };

  if (history.length === ZERO) {
    return stats;
  }

  // 统计覆盖操作
  const setOperations = history.filter((entry) => entry.action === 'set');
  stats.totalOverrides = setOperations.length;

  if (setOperations.length > ZERO) {
    stats.lastOverrideTime = setOperations[ZERO]?.timestamp || null;

    // 统计语言使用频率
    setOperations.forEach((entry) => {
      stats.overrideFrequency[entry.locale] =
        (stats.overrideFrequency[entry.locale] || ZERO) + ONE;
    });

    // 找出最常用的语言
    let maxCount = ZERO;
    for (const [locale, count] of Object.entries(stats.overrideFrequency)) {
      if (count > maxCount) {
        maxCount = count;
        stats.mostUsedLocale = locale as Locale;
      }
    }
  }

  return stats;
}

/**
 * 清除覆盖历史
 * Clear override history
 */
export function clearOverrideHistory(): StorageOperationResult<void> {
  const startTime = Date.now();

  try {
    LocalStorageManager.remove('override_history');

    return {
      success: true,
      data: undefined,
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
 * 导出覆盖数据
 * Export override data
 */
export function exportOverrideData(): {
  currentOverride: Locale | null;
  history: ReturnType<typeof getOverrideHistory>;
  stats: ReturnType<typeof getOverrideStats>;
  exportTime: number;
} {
  const currentOverride = getUserOverride();

  return {
    currentOverride:
      currentOverride.success && currentOverride.data
        ? currentOverride.data
        : null,
    history: getOverrideHistory(),
    stats: getOverrideStats(),
    exportTime: Date.now(),
  };
}

/**
 * 导入覆盖数据
 * Import override data
 */
export function importOverrideData(data: {
  currentOverride?: Locale | null;
  history?: ReturnType<typeof getOverrideHistory>;
}): StorageOperationResult<void> {
  const startTime = Date.now();

  try {
    // 导入历史记录
    if (data.history && Array.isArray(data.history)) {
      LocalStorageManager.set('override_history', data.history);
    }

    // 设置当前覆盖
    if (data.currentOverride) {
      const setResult = setUserOverride(data.currentOverride, {
        importedAt: Date.now(),
      });

      if (!setResult.success) {
        return {
          success: false,
          error: `Failed to set imported override: ${setResult.error}`,
          timestamp: Date.now(),
          responseTime: Date.now() - startTime,
        };
      }
    }

    return {
      success: true,
      data: undefined,
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
