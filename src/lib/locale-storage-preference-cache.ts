/**
 * 用户语言偏好缓存和同步
 * User Locale Preference Cache and Sync
 *
 * 负责偏好数据的缓存管理、数据同步和性能优化
 */

'use client';

import { MAGIC_0_5, MAGIC_0_6, MAGIC_0_7 } from "@/constants/decimal";
import { ANIMATION_DURATION_VERY_SLOW, COUNT_FIVE, SECONDS_PER_MINUTE, ZERO } from "@/constants/magic-numbers";
import { CookieManager } from '@/lib/locale-storage-cookie';
import { LocalStorageManager } from '@/lib/locale-storage-local';
import type { Locale } from '@/types/i18n';
import {
  getUserPreference,
  saveUserPreference,
  validatePreferenceData,
} from './locale-storage-preference-core';
import type {
  StorageOperationResult,
  UserLocalePreference,
} from './locale-storage-types';

// ==================== 缓存管理器 ====================

/**
 * 偏好缓存管理器
 * Preference cache manager
 */
export class PreferenceCacheManager {
  private static cache: Map<string, UserLocalePreference> = new Map();
  private static cacheTimestamp = ZERO;
  private static readonly CACHE_TTL = COUNT_FIVE * SECONDS_PER_MINUTE * ANIMATION_DURATION_VERY_SLOW; // 5 minutes

  /**
   * 获取缓存的偏好
   * Get cached preference
   */
  static getCachedPreference(key: string): UserLocalePreference | null {
    if (Date.now() - this.cacheTimestamp > this.CACHE_TTL) {
      this.cache.clear();
      return null;
    }

    return this.cache.get(key) || null;
  }

  /**
   * 更新缓存
   * Update cache
   */
  static updateCache(key: string, preference: UserLocalePreference): void {
    this.cache.set(key, preference);
    this.cacheTimestamp = Date.now();
  }

  /**
   * 清除缓存
   * Clear cache
   */
  static clearCache(key?: string): void {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
      this.cacheTimestamp = ZERO;
    }
  }

  /**
   * 获取缓存状态
   * Get cache status
   */
  static getCacheStatus(): {
    size: number;
    age: number;
    isExpired: boolean;
    keys: string[];
  } {
    const age = Date.now() - this.cacheTimestamp;
    const isExpired = age > this.CACHE_TTL;

    return {
      size: this.cache.size,
      age,
      isExpired,
      keys: Array.from(this.cache.keys()),
    };
  }

  /**
   * 预热缓存
   * Warm up cache
   */
  static warmUpCache(): void {
    const preference = getUserPreference();
    if (preference.success && preference.data) {
      this.updateCache('locale_preference', preference.data);
    }
  }
}

// ==================== 数据同步功能 ====================

/**
 * 同步偏好数据
 * Sync preference data
 */
export function syncPreferenceData(): StorageOperationResult<{
  localStorage: UserLocalePreference | null;
  cookies: Locale | null;
  synced: boolean;
}> {
  const startTime = Date.now();

  try {
    // 获取各存储源的数据
    const localPreference =
      LocalStorageManager.get<UserLocalePreference>('locale_preference');
    const cookieLocale = CookieManager.get('locale_preference');

    let synced = false;
    let primaryPreference: UserLocalePreference | null = null;

    // 确定主要数据源
    if (localPreference && validatePreferenceData(localPreference).isValid) {
      primaryPreference = localPreference;

      // 同步到 cookies
      if (cookieLocale !== localPreference.locale) {
        CookieManager.set('locale_preference', localPreference.locale);
        synced = true;
      }
    } else if (cookieLocale) {
      // 从 cookies 创建偏好并同步到 localStorage
      primaryPreference = {
        locale: cookieLocale as Locale,
        source: 'browser',
        confidence: MAGIC_0_7,
        timestamp: Date.now(),
        metadata: { syncedFrom: 'cookies' },
      };

      const saveResult = saveUserPreference(primaryPreference);
      synced = saveResult.success;
    }

    // 更新缓存
    if (primaryPreference) {
      PreferenceCacheManager.updateCache(
        'locale_preference',
        primaryPreference,
      );
    }

    return {
      success: true,
      data: {
        localStorage: localPreference,
        cookies: cookieLocale as Locale | null,
        synced,
      },
      source: 'sync',
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
 * 检查数据一致性
 * Check data consistency
 */
export function checkDataConsistency(): {
  isConsistent: boolean;
  issues: string[];
  recommendations: string[];
} {
  const issues: string[] = [];
  const recommendations: string[] = [];

  try {
    const localPreference =
      LocalStorageManager.get<UserLocalePreference>('locale_preference');
    const cookieLocale = CookieManager.get('locale_preference');

    // 检查 localStorage 数据有效性
    if (localPreference) {
      const validation = validatePreferenceData(localPreference);
      if (!validation.isValid) {
        issues.push(
          `Invalid localStorage data: ${validation.errors.join(', ')}`,
        );
        recommendations.push('Clear and recreate localStorage preference data');
      }
    }

    // 检查数据一致性
    if (localPreference && cookieLocale) {
      if (localPreference.locale !== cookieLocale) {
        issues.push(
          `Locale mismatch: localStorage(${localPreference.locale}) vs cookies(${cookieLocale})`,
        );
        recommendations.push('Sync data between localStorage and cookies');
      }
    } else if (!localPreference && !cookieLocale) {
      issues.push('No preference data found in any storage');
      recommendations.push('Initialize default preference data');
    }

    // 检查缓存一致性
    const cachedPreference =
      PreferenceCacheManager.getCachedPreference('locale_preference');
    if (cachedPreference && localPreference) {
      if (
        cachedPreference.locale !== localPreference.locale ||
        Math.abs(cachedPreference.timestamp - localPreference.timestamp) > ANIMATION_DURATION_VERY_SLOW
      ) {
        issues.push('Cache data is inconsistent with localStorage');
        recommendations.push('Clear and refresh cache');
      }
    }

    return {
      isConsistent: issues.length === ZERO,
      issues,
      recommendations,
    };
  } catch (error) {
    return {
      isConsistent: false,
      issues: [
        `Error checking consistency: ${error instanceof Error ? error.message : 'Unknown error'}`,
      ],
      recommendations: ['Investigate storage access issues'],
    };
  }
}

/**
 * 修复数据不一致
 * Fix data inconsistency
 */
export function fixDataInconsistency(): StorageOperationResult<{
  fixed: boolean;
  actions: string[];
}> {
  const startTime = Date.now();
  const actions: string[] = [];

  try {
    const consistency = checkDataConsistency();

    if (consistency.isConsistent) {
      return {
        success: true,
        data: {
          fixed: false,
          actions: ['No issues found'],
        },
        timestamp: Date.now(),
        responseTime: Date.now() - startTime,
      };
    }

    // 清除无效的缓存
    PreferenceCacheManager.clearCache();
    actions.push('Cleared cache');

    // 获取最可靠的数据源
    const localPreference =
      LocalStorageManager.get<UserLocalePreference>('locale_preference');
    const cookieLocale = CookieManager.get('locale_preference');

    let authoritative: UserLocalePreference | null = null;

    // 确定权威数据源
    if (localPreference && validatePreferenceData(localPreference).isValid) {
      authoritative = localPreference;
      actions.push('Using localStorage as authoritative source');
    } else if (cookieLocale) {
      authoritative = {
        locale: cookieLocale as Locale,
        source: 'browser',
        confidence: MAGIC_0_6,
        timestamp: Date.now(),
        metadata: { recoveredFrom: 'cookies' },
      };
      actions.push('Recovered from cookies');
    } else {
      // 创建默认偏好
      authoritative = {
        locale: 'en',
        source: 'default',
        confidence: MAGIC_0_5,
        timestamp: Date.now(),
        metadata: { createdBy: 'recovery' },
      };
      actions.push('Created default preference');
    }

    // 同步到所有存储
    if (authoritative) {
      const saveResult = saveUserPreference(authoritative);
      if (saveResult.success) {
        actions.push('Synced to all storage locations');
      }
    }

    return {
      success: true,
      data: {
        fixed: true,
        actions,
      },
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
 * 获取存储使用情况
 * Get storage usage
 */
export function getStorageUsage(): {
  localStorage: {
    available: boolean;
    size: number;
    quota: number;
  };
  cookies: {
    available: boolean;
    size: number;
    count: number;
  };
  cache: {
    size: number;
    age: number;
    isExpired: boolean;
  };
} {
  const usage = {
    localStorage: {
      available: false,
      size: ZERO,
      quota: ZERO,
    },
    cookies: {
      available: false,
      size: ZERO,
      count: ZERO,
    },
    cache: {
      size: ZERO,
      age: ZERO,
      isExpired: false,
    },
  };

  // 检查 localStorage
  try {
    if (typeof localStorage !== 'undefined') {
      usage.localStorage.available = true;

      // 估算使用大小
      let totalSize = ZERO;
      for (const key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          totalSize += localStorage[key].length + key.length;
        }
      }
      usage.localStorage.size = totalSize;

      // 尝试获取配额信息
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        navigator.storage
          .estimate()
          .then((estimate) => {
            usage.localStorage.quota = estimate.quota || ZERO;
          })
          .catch(() => {
            // 忽略错误
          });
      }
    }
  } catch {
    // localStorage 不可用
  }

  // 检查 cookies
  try {
    if (typeof document !== 'undefined') {
      usage.cookies.available = true;
      usage.cookies.size = document.cookie.length;
      usage.cookies.count = document.cookie.split(';').length;
    }
  } catch {
    // cookies 不可用
  }

  // 检查缓存
  const cacheStatus = PreferenceCacheManager.getCacheStatus();
  usage.cache = {
    size: cacheStatus.size,
    age: cacheStatus.age,
    isExpired: cacheStatus.isExpired,
  };

  return usage;
}

/**
 * 优化存储性能
 * Optimize storage performance
 */
export function optimizeStoragePerformance(): StorageOperationResult<{
  optimized: boolean;
  actions: string[];
  performance: {
    before: number;
    after: number;
    improvement: number;
  };
}> {
  const startTime = Date.now();
  const actions: string[] = [];

  try {
    const beforeTime = Date.now();

    // 清理过期缓存
    const cacheStatus = PreferenceCacheManager.getCacheStatus();
    if (cacheStatus.isExpired) {
      PreferenceCacheManager.clearCache();
      actions.push('Cleared expired cache');
    }

    // 预热缓存
    PreferenceCacheManager.warmUpCache();
    actions.push('Warmed up cache');

    // 同步数据
    const syncResult = syncPreferenceData();
    if (syncResult.success && syncResult.data?.synced) {
      actions.push('Synced storage data');
    }

    const afterTime = Date.now();
    const improvement = beforeTime - afterTime;

    return {
      success: true,
      data: {
        optimized: actions.length > ZERO,
        actions,
        performance: {
          before: beforeTime,
          after: afterTime,
          improvement,
        },
      },
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
