'use client';

import { useCallback, useEffect, useState } from 'react';
import type { Locale } from '@/types/i18n';
import {
  LocaleStorageManager,
  type LocaleDetectionHistory,
  type UserLocalePreference,
} from '@/lib/locale-storage-manager';
import { STORAGE_KEYS } from '@/lib/locale-storage-types';
import { logger } from '@/lib/logger';
import {
  ANIMATION_DURATION_VERY_SLOW,
  COUNT_FIVE,
  DAYS_PER_MONTH,
  HOURS_PER_DAY,
  SECONDS_PER_MINUTE,
} from '@/constants';

/**
 * React Hook: 使用语言偏好存储
 * React Hook: Use locale preference storage
 */
export function useLocaleStorage() {
  const savePreference = useCallback((preference: UserLocalePreference) => {
    LocaleStorageManager.saveUserPreference(preference);
  }, []);

  const getUserPreference = useCallback(() => {
    return LocaleStorageManager.getUserPreference();
  }, []);

  const setUserOverride = useCallback((locale: Locale) => {
    LocaleStorageManager.setUserOverride(locale);
  }, []);

  const getUserOverride = useCallback(() => {
    return LocaleStorageManager.getUserOverride();
  }, []);

  const clearUserOverride = useCallback(() => {
    LocaleStorageManager.clearUserOverride();
  }, []);

  const getStats = useCallback(() => {
    return LocaleStorageManager.getStorageStats();
  }, []);

  return {
    savePreference,
    getUserPreference,
    setUserOverride,
    getUserOverride,
    clearUserOverride,
    getStats,
  };
}

/**
 * React Hook: 响应式语言偏好状态
 * React Hook: Reactive locale preference state
 */
export function useLocalePreference() {
  const [preference, setPreference] = useState<UserLocalePreference | null>(
    null,
  );
  const [override, setOverride] = useState<Locale | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 初始化加载
  useEffect(() => {
    const loadPreferences = () => {
      try {
        const userPreference = LocaleStorageManager.getUserPreference();
        const userOverride = LocaleStorageManager.getUserOverride();

        setPreference(userPreference);
        setOverride(userOverride);
      } catch (error) {
        logger.warn('Failed to load locale preferences:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPreferences();
  }, []);

  const updatePreference = useCallback(
    (newPreference: UserLocalePreference) => {
      LocaleStorageManager.saveUserPreference(newPreference);
      setPreference(newPreference);
    },
    [],
  );

  const updateOverride = useCallback((locale: Locale) => {
    LocaleStorageManager.setUserOverride(locale);
    setOverride(locale);
  }, []);

  const clearOverride = useCallback(() => {
    LocaleStorageManager.clearUserOverride();
    setOverride(null);
  }, []);

  const currentLocale = override || preference?.locale || null;

  return {
    preference,
    override,
    currentLocale,
    isLoading,
    updatePreference,
    updateOverride,
    clearOverride,
  };
}

/**
 * React Hook: 检测历史状态
 * React Hook: Detection history state
 */
export function useDetectionHistory() {
  const [history, setHistory] = useState<LocaleDetectionHistory | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 初始化加载
  useEffect(() => {
    const loadHistory = () => {
      try {
        const detectionHistory = LocaleStorageManager.getDetectionHistory();
        setHistory(detectionHistory);
      } catch (error) {
        logger.warn('Failed to load detection history:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadHistory();
  }, []);

  const addDetection = useCallback(
    (detection: {
      locale: Locale;
      source: string;
      timestamp: number;
      confidence: number;
    }) => {
      LocaleStorageManager.addDetectionRecord(detection);

      // 重新加载历史记录
      const updatedHistory = LocaleStorageManager.getDetectionHistory();
      setHistory(updatedHistory);
    },
    [],
  );

  const getRecentDetections = useCallback((limit: number = COUNT_FIVE) => {
    return LocaleStorageManager.getRecentDetections(limit);
  }, []);

  const cleanupExpired = useCallback((maxAgeMs?: number) => {
    LocaleStorageManager.cleanupExpiredDetections(maxAgeMs);

    // 重新加载历史记录
    const updatedHistory = LocaleStorageManager.getDetectionHistory();
    setHistory(updatedHistory);
  }, []);

  return {
    history,
    isLoading,
    addDetection,
    getRecentDetections,
    cleanupExpired,
  };
}

/**
 * React Hook: 存储统计信息
 * React Hook: Storage statistics
 */
export function useStorageStats() {
  const [stats, setStats] = useState<ReturnType<
    typeof LocaleStorageManager.getStorageStats
  > | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshStats = useCallback(() => {
    try {
      const currentStats = LocaleStorageManager.getStorageStats();
      setStats(currentStats);
    } catch (error) {
      logger.warn('Failed to get storage stats:', error);
    }
  }, []);

  // 初始化加载
  useEffect(() => {
    refreshStats();
    setIsLoading(false);
  }, [refreshStats]);

  return {
    stats,
    isLoading,
    refreshStats,
  };
}

/**
 * React Hook: 存储数据导入导出
 * React Hook: Storage data import/export
 */
export function useStorageDataManager() {
  const exportData = useCallback(() => {
    return LocaleStorageManager.exportData();
  }, []);

  const importData = useCallback(
    (data: Parameters<typeof LocaleStorageManager.importData>[0]) => {
      LocaleStorageManager.importData(data);
    },
    [],
  );

  const clearAllData = useCallback(() => {
    LocaleStorageManager.clearAll();
  }, []);

  return {
    exportData,
    importData,
    clearAllData,
  };
}

/**
 * React Hook: 存储可用性检查
 * React Hook: Storage availability check
 */
export function useStorageAvailability() {
  const [isLocalStorageAvailable, setIsLocalStorageAvailable] = useState(false);
  const [isCookieAvailable, setIsCookieAvailable] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAvailability = async () => {
      try {
        // 动态导入以避免 SSR 问题
        const { LocalStorageManager } = await import(
          '@/lib/locale-storage-local'
        );
        const { CookieManager } = await import('@/lib/locale-storage-cookie');

        setIsLocalStorageAvailable(LocalStorageManager.isAvailable());
        setIsCookieAvailable(CookieManager.isSupported());
      } catch (error) {
        logger.warn('Failed to check storage availability:', error);
        setIsLocalStorageAvailable(false);
        setIsCookieAvailable(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAvailability();
  }, []);

  return {
    isLocalStorageAvailable,
    isCookieAvailable,
    isAnyStorageAvailable: isLocalStorageAvailable || isCookieAvailable,
    isLoading,
  };
}

/**
 * React Hook: 自动清理过期数据
 * React Hook: Auto cleanup expired data
 */
export function useAutoCleanup(
  options: {
    enabled?: boolean;
    intervalMs?: number;
    maxAgeMs?: number;
  } = {},
) {
  const {
    enabled = true,
    intervalMs = SECONDS_PER_MINUTE *
      SECONDS_PER_MINUTE *
      ANIMATION_DURATION_VERY_SLOW, // 1 hour
    maxAgeMs = DAYS_PER_MONTH *
      HOURS_PER_DAY *
      SECONDS_PER_MINUTE *
      SECONDS_PER_MINUTE *
      ANIMATION_DURATION_VERY_SLOW, // 30 days
  } = options;

  useEffect(() => {
    if (!enabled) {
      // 一致返回清理函数，保持 consistent-return
      return () => {
        /* noop when disabled */
      };
    }

    const cleanup = () => {
      try {
        LocaleStorageManager.cleanupExpiredDetections(maxAgeMs);
      } catch (error) {
        logger.warn('Auto cleanup failed:', error);
      }
    };

    // 立即执行一次清理
    cleanup();

    // 设置定期清理
    const intervalId = setInterval(cleanup, intervalMs);

    return () => {
      clearInterval(intervalId);
    };
  }, [enabled, intervalMs, maxAgeMs]);
}

/**
 * React Hook: 存储事件监听
 * React Hook: Storage event listener
 */
export function useStorageEvents() {
  const [lastStorageEvent, setLastStorageEvent] = useState<{
    key: string;
    newValue: string | null;
    oldValue: string | null;
    timestamp: number;
  } | null>(null);

  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (
        event.key &&
        (Object.values(STORAGE_KEYS) as string[]).includes(event.key)
      ) {
        setLastStorageEvent({
          key: event.key,
          newValue: event.newValue,
          oldValue: event.oldValue,
          timestamp: Date.now(),
        });
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return {
    lastStorageEvent,
  };
}
