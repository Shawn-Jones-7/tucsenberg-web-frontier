/**
 * 偏好历史管理
 * Preference History Management
 */

'use client';

import { LocalStorageManager } from '@/lib/locale-storage-local';
import type { UserLocalePreference } from '@/lib/locale-storage-types';
import { logger } from '@/lib/logger';
import { ANIMATION_DURATION_VERY_SLOW } from '@/constants';
import { MAGIC_20 } from '@/constants/count';

/**
 * 偏好历史管理
 * Preference history management
 */

/**
 * 获取偏好历史
 * Get preference history
 */
export function getPreferenceHistory(): UserLocalePreference[] {
  const history: UserLocalePreference[] = [];

  try {
    // 从当前偏好开始
    const currentPreference =
      LocalStorageManager.get<UserLocalePreference>('locale_preference');
    if (currentPreference) {
      history.push(currentPreference);
    }

    // 从历史记录中获取
    const storedHistory =
      LocalStorageManager.get<UserLocalePreference[]>('preference_history');
    if (storedHistory && Array.isArray(storedHistory)) {
      history.push(...storedHistory);
    }

    // 去重并按时间排序
    const uniqueHistory = history.filter(
      (pref, index, arr) =>
        arr.findIndex((p) => p.timestamp === pref.timestamp) === index,
    );

    return uniqueHistory.sort((a, b) => b.timestamp - a.timestamp);
  } catch (error) {
    logger.error('Error getting preference history', { error: error as Error });
    return [];
  }
}

/**
 * 记录偏好历史
 * Record preference history
 */
export function recordPreferenceHistory(
  preference: UserLocalePreference,
): void {
  try {
    const history = getPreferenceHistory();

    // 检查是否已存在相同的记录
    const exists = history.some(
      (p) =>
        p.locale === preference.locale &&
        p.source === preference.source &&
        Math.abs(p.timestamp - preference.timestamp) <
          ANIMATION_DURATION_VERY_SLOW,
    );

    if (!exists) {
      history.unshift(preference);

      // 限制历史记录数量
      const maxHistory = MAGIC_20;
      if (history.length > maxHistory) {
        history.splice(maxHistory);
      }

      LocalStorageManager.set('preference_history', history);
    }
  } catch (error) {
    logger.error('Error recording preference history', {
      error: error as Error,
    });
  }
}

/**
 * 清除偏好历史
 * Clear preference history
 */
export function clearPreferenceHistory(): void {
  try {
    LocalStorageManager.remove('preference_history');
  } catch (error) {
    logger.error('Error clearing preference history', {
      error: error as Error,
    });
  }
}
