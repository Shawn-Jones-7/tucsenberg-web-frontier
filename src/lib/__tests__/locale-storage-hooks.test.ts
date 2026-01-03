/**
 * Unit tests for locale-storage-hooks.ts
 * Target: 80% coverage
 */

import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
// Import hooks after mocks are set up
import {
  useAutoCleanup,
  useDetectionHistory,
  useLocalePreference,
  useLocaleStorage,
  useStorageDataManager,
  useStorageEvents,
  useStorageStats,
} from '@/lib/locale-storage-hooks';
import { ONE } from '@/constants';

// Use vi.hoisted to define mocks before they're used in vi.mock factories
const mockFns = vi.hoisted(() => ({
  saveUserPreference: vi.fn(),
  getUserPreference: vi.fn(),
  setUserOverride: vi.fn(),
  getUserOverride: vi.fn(),
  clearUserOverride: vi.fn(),
  getStorageStats: vi.fn(),
  getDetectionHistory: vi.fn(),
  addDetectionRecord: vi.fn(),
  getRecentDetections: vi.fn(),
  cleanupExpiredDetections: vi.fn(),
  exportData: vi.fn(),
  importData: vi.fn(),
  clearAll: vi.fn(),
}));

vi.mock('@/lib/locale-storage-manager', () => ({
  LocaleStorageManager: {
    saveUserPreference: mockFns.saveUserPreference,
    getUserPreference: mockFns.getUserPreference,
    setUserOverride: mockFns.setUserOverride,
    getUserOverride: mockFns.getUserOverride,
    clearUserOverride: mockFns.clearUserOverride,
    getStorageStats: mockFns.getStorageStats,
    getDetectionHistory: mockFns.getDetectionHistory,
    addDetectionRecord: mockFns.addDetectionRecord,
    getRecentDetections: mockFns.getRecentDetections,
    cleanupExpiredDetections: mockFns.cleanupExpiredDetections,
    exportData: mockFns.exportData,
    importData: mockFns.importData,
    clearAll: mockFns.clearAll,
  },
  STORAGE_KEYS: {
    USER_PREFERENCE: 'locale_user_preference',
    USER_OVERRIDE: 'locale_user_override',
    DETECTION_HISTORY: 'locale_detection_history',
  },
}));

vi.mock('@/lib/locale-storage-types', () => ({
  STORAGE_KEYS: {
    USER_PREFERENCE: 'locale_user_preference',
    USER_OVERRIDE: 'locale_user_override',
    DETECTION_HISTORY: 'locale_detection_history',
  },
}));

vi.mock('@/lib/logger', () => ({
  logger: {
    warn: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  },
}));

describe('locale-storage-hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('useLocaleStorage', () => {
    it('should return storage functions', () => {
      const { result } = renderHook(() => useLocaleStorage());

      expect(result.current.savePreference).toBeDefined();
      expect(result.current.getUserPreference).toBeDefined();
      expect(result.current.setUserOverride).toBeDefined();
      expect(result.current.getUserOverride).toBeDefined();
      expect(result.current.clearUserOverride).toBeDefined();
      expect(result.current.getStats).toBeDefined();
    });

    it('should call LocaleStorageManager.saveUserPreference', () => {
      const { result } = renderHook(() => useLocaleStorage());
      const preference = {
        locale: 'en' as const,
        source: 'user' as const,
        timestamp: Date.now(),
        confidence: ONE,
      };

      act(() => {
        result.current.savePreference(preference);
      });

      expect(mockFns.saveUserPreference).toHaveBeenCalledWith(preference);
    });

    it('should call LocaleStorageManager.getUserPreference', () => {
      const preference = {
        locale: 'zh' as const,
        source: 'user' as const,
        timestamp: Date.now(),
        confidence: ONE,
      };
      mockFns.getUserPreference.mockReturnValue(preference);
      const { result } = renderHook(() => useLocaleStorage());

      const returnedPreference = result.current.getUserPreference();

      expect(mockFns.getUserPreference).toHaveBeenCalled();
      expect(returnedPreference).toEqual(preference);
    });

    it('should call LocaleStorageManager.setUserOverride', () => {
      const { result } = renderHook(() => useLocaleStorage());

      act(() => {
        result.current.setUserOverride('zh');
      });

      expect(mockFns.setUserOverride).toHaveBeenCalledWith('zh');
    });

    it('should call LocaleStorageManager.getUserOverride', () => {
      mockFns.getUserOverride.mockReturnValue('en');
      const { result } = renderHook(() => useLocaleStorage());

      const override = result.current.getUserOverride();

      expect(mockFns.getUserOverride).toHaveBeenCalled();
      expect(override).toBe('en');
    });

    it('should call LocaleStorageManager.clearUserOverride', () => {
      const { result } = renderHook(() => useLocaleStorage());

      act(() => {
        result.current.clearUserOverride();
      });

      expect(mockFns.clearUserOverride).toHaveBeenCalled();
    });

    it('should call LocaleStorageManager.getStorageStats', () => {
      const mockStats = { totalSize: 100, itemCount: 5 };
      mockFns.getStorageStats.mockReturnValue(mockStats);
      const { result } = renderHook(() => useLocaleStorage());

      const stats = result.current.getStats();

      expect(mockFns.getStorageStats).toHaveBeenCalled();
      expect(stats).toEqual(mockStats);
    });
  });

  describe('useLocalePreference', () => {
    it('should load preferences on mount', async () => {
      const mockPreference = {
        locale: 'en',
        source: 'user',
        timestamp: Date.now(),
      };
      mockFns.getUserPreference.mockReturnValue(mockPreference);
      mockFns.getUserOverride.mockReturnValue('zh');

      const { result } = renderHook(() => useLocalePreference());

      // Run effect
      await act(async () => {
        await vi.runAllTimersAsync();
      });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.preference).toEqual(mockPreference);
      expect(result.current.override).toBe('zh');
      expect(result.current.currentLocale).toBe('zh');
    });

    it('should use preference locale when no override', async () => {
      const mockPreference = {
        locale: 'en',
        source: 'user',
        timestamp: Date.now(),
      };
      mockFns.getUserPreference.mockReturnValue(mockPreference);
      mockFns.getUserOverride.mockReturnValue(null);

      const { result } = renderHook(() => useLocalePreference());

      await act(async () => {
        await vi.runAllTimersAsync();
      });

      expect(result.current.currentLocale).toBe('en');
    });

    it('should update preference', async () => {
      mockFns.getUserPreference.mockReturnValue(null);
      mockFns.getUserOverride.mockReturnValue(null);

      const { result } = renderHook(() => useLocalePreference());

      await act(async () => {
        await vi.runAllTimersAsync();
      });

      const newPreference = {
        locale: 'zh' as const,
        source: 'user' as const,
        timestamp: Date.now(),
        confidence: ONE,
      };
      act(() => {
        result.current.updatePreference(newPreference);
      });

      expect(mockFns.saveUserPreference).toHaveBeenCalledWith(newPreference);
      expect(result.current.preference).toEqual(newPreference);
    });

    it('should update override', async () => {
      mockFns.getUserPreference.mockReturnValue(null);
      mockFns.getUserOverride.mockReturnValue(null);

      const { result } = renderHook(() => useLocalePreference());

      await act(async () => {
        await vi.runAllTimersAsync();
      });

      act(() => {
        result.current.updateOverride('zh');
      });

      expect(mockFns.setUserOverride).toHaveBeenCalledWith('zh');
      expect(result.current.override).toBe('zh');
    });

    it('should clear override', async () => {
      mockFns.getUserPreference.mockReturnValue(null);
      mockFns.getUserOverride.mockReturnValue('zh');

      const { result } = renderHook(() => useLocalePreference());

      await act(async () => {
        await vi.runAllTimersAsync();
      });

      act(() => {
        result.current.clearOverride();
      });

      expect(mockFns.clearUserOverride).toHaveBeenCalled();
      expect(result.current.override).toBeNull();
    });
  });

  describe('useDetectionHistory', () => {
    it('should load history on mount', async () => {
      const mockHistory = { records: [], lastUpdated: Date.now() };
      mockFns.getDetectionHistory.mockReturnValue(mockHistory);

      const { result } = renderHook(() => useDetectionHistory());

      await act(async () => {
        await vi.runAllTimersAsync();
      });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.history).toEqual(mockHistory);
    });

    it('should add detection record', async () => {
      const mockHistory = { records: [], lastUpdated: Date.now() };
      mockFns.getDetectionHistory.mockReturnValue(mockHistory);

      const { result } = renderHook(() => useDetectionHistory());

      await act(async () => {
        await vi.runAllTimersAsync();
      });

      const detection = {
        locale: 'en' as const,
        source: 'browser',
        timestamp: Date.now(),
        confidence: 0.9,
      };

      act(() => {
        result.current.addDetection(detection);
      });

      expect(mockFns.addDetectionRecord).toHaveBeenCalledWith(detection);
    });

    it('should get recent detections', async () => {
      mockFns.getDetectionHistory.mockReturnValue({
        records: [],
        lastUpdated: Date.now(),
      });
      mockFns.getRecentDetections.mockReturnValue([]);

      const { result } = renderHook(() => useDetectionHistory());

      await act(async () => {
        await vi.runAllTimersAsync();
      });

      result.current.getRecentDetections(10);

      expect(mockFns.getRecentDetections).toHaveBeenCalledWith(10);
    });

    it('should cleanup expired detections', async () => {
      mockFns.getDetectionHistory.mockReturnValue({
        records: [],
        lastUpdated: Date.now(),
      });

      const { result } = renderHook(() => useDetectionHistory());

      await act(async () => {
        await vi.runAllTimersAsync();
      });

      act(() => {
        result.current.cleanupExpired(86400000);
      });

      expect(mockFns.cleanupExpiredDetections).toHaveBeenCalledWith(86400000);
    });
  });

  describe('useStorageStats', () => {
    it('should load stats on mount', async () => {
      const mockStats = { totalSize: 100, itemCount: 5 };
      mockFns.getStorageStats.mockReturnValue(mockStats);

      const { result } = renderHook(() => useStorageStats());

      await act(async () => {
        await vi.runAllTimersAsync();
      });

      expect(result.current.stats).toEqual(mockStats);
      expect(result.current.isLoading).toBe(false);
    });

    it('should refresh stats', async () => {
      const mockStats = { totalSize: 100, itemCount: 5 };
      mockFns.getStorageStats.mockReturnValue(mockStats);

      const { result } = renderHook(() => useStorageStats());

      await act(async () => {
        await vi.runAllTimersAsync();
      });

      mockFns.getStorageStats.mockReturnValue({
        totalSize: 200,
        itemCount: 10,
      });

      act(() => {
        result.current.refreshStats();
      });

      expect(result.current.stats).toEqual({ totalSize: 200, itemCount: 10 });
    });
  });

  describe('useStorageDataManager', () => {
    it('should export data', () => {
      const timestamp = Date.now();
      const mockData = {
        version: '1.0.0',
        timestamp,
        metadata: {
          userAgent: 'test',
          exportedBy: 'test',
          dataIntegrity: 'test',
        },
        preference: {
          locale: 'en' as const,
          source: 'user' as const,
          timestamp,
          confidence: ONE,
        },
      };
      mockFns.exportData.mockReturnValue(mockData);

      const { result } = renderHook(() => useStorageDataManager());

      const data = result.current.exportData();

      expect(mockFns.exportData).toHaveBeenCalled();
      expect(data).toEqual(mockData);
    });

    it('should import data', () => {
      const { result } = renderHook(() => useStorageDataManager());
      const timestamp = Date.now();
      const data = {
        version: '1.0.0',
        timestamp,
        metadata: {
          userAgent: 'test',
          exportedBy: 'test',
          dataIntegrity: 'test',
        },
        preference: {
          locale: 'zh' as const,
          source: 'user' as const,
          timestamp,
          confidence: ONE,
        },
      };

      act(() => {
        result.current.importData(data);
      });

      expect(mockFns.importData).toHaveBeenCalledWith(data);
    });

    it('should clear all data', () => {
      const { result } = renderHook(() => useStorageDataManager());

      act(() => {
        result.current.clearAllData();
      });

      expect(mockFns.clearAll).toHaveBeenCalled();
    });
  });

  describe('useAutoCleanup', () => {
    it('should run cleanup on mount when enabled', () => {
      renderHook(() => useAutoCleanup({ enabled: true, intervalMs: 1000 }));

      expect(mockFns.cleanupExpiredDetections).toHaveBeenCalled();
    });

    it('should not run cleanup when disabled', () => {
      renderHook(() => useAutoCleanup({ enabled: false }));

      expect(mockFns.cleanupExpiredDetections).not.toHaveBeenCalled();
    });

    it('should run cleanup at intervals', () => {
      renderHook(() => useAutoCleanup({ enabled: true, intervalMs: 1000 }));

      expect(mockFns.cleanupExpiredDetections).toHaveBeenCalledTimes(1);

      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(mockFns.cleanupExpiredDetections).toHaveBeenCalledTimes(2);

      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(mockFns.cleanupExpiredDetections).toHaveBeenCalledTimes(3);
    });

    it('should cleanup interval on unmount', () => {
      const { unmount } = renderHook(() =>
        useAutoCleanup({ enabled: true, intervalMs: 1000 }),
      );

      expect(mockFns.cleanupExpiredDetections).toHaveBeenCalledTimes(1);

      unmount();

      act(() => {
        vi.advanceTimersByTime(2000);
      });

      // Should not have been called again after unmount
      expect(mockFns.cleanupExpiredDetections).toHaveBeenCalledTimes(1);
    });
  });

  describe('useStorageEvents', () => {
    it('should initialize with null lastStorageEvent', () => {
      const { result } = renderHook(() => useStorageEvents());

      expect(result.current.lastStorageEvent).toBeNull();
    });

    it('should cleanup event listener on unmount', () => {
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

      const { unmount } = renderHook(() => useStorageEvents());

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'storage',
        expect.any(Function),
      );

      removeEventListenerSpy.mockRestore();
    });
  });
});
