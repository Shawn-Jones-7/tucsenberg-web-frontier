/**
 * Unit tests for locale-storage-hooks.ts
 * Target: 80% coverage
 */

import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
// Import hooks after mocks are set up
import {
  useAutoCleanup,
  useDetectionHistory,
  useLocalePreference,
  useLocaleStorage,
  useStorageAvailability,
  useStorageDataManager,
  useStorageEvents,
  useStorageStats,
} from '@/lib/locale-storage-hooks';

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
  localStorageIsAvailable: vi.fn(),
  cookieIsSupported: vi.fn(),
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

vi.mock('@/lib/locale-storage-local', () => ({
  LocalStorageManager: {
    isAvailable: mockFns.localStorageIsAvailable,
  },
}));

vi.mock('@/lib/locale-storage-cookie', () => ({
  CookieManager: {
    isSupported: mockFns.cookieIsSupported,
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
        source: 'user',
        timestamp: Date.now(),
      };

      act(() => {
        result.current.savePreference(preference);
      });

      expect(mockSaveUserPreference).toHaveBeenCalledWith(preference);
    });

    it('should call LocaleStorageManager.getUserPreference', () => {
      mockGetUserPreference.mockReturnValue({ locale: 'zh', source: 'user' });
      const { result } = renderHook(() => useLocaleStorage());

      const preference = result.current.getUserPreference();

      expect(mockGetUserPreference).toHaveBeenCalled();
      expect(preference).toEqual({ locale: 'zh', source: 'user' });
    });

    it('should call LocaleStorageManager.setUserOverride', () => {
      const { result } = renderHook(() => useLocaleStorage());

      act(() => {
        result.current.setUserOverride('zh');
      });

      expect(mockSetUserOverride).toHaveBeenCalledWith('zh');
    });

    it('should call LocaleStorageManager.getUserOverride', () => {
      mockGetUserOverride.mockReturnValue('en');
      const { result } = renderHook(() => useLocaleStorage());

      const override = result.current.getUserOverride();

      expect(mockGetUserOverride).toHaveBeenCalled();
      expect(override).toBe('en');
    });

    it('should call LocaleStorageManager.clearUserOverride', () => {
      const { result } = renderHook(() => useLocaleStorage());

      act(() => {
        result.current.clearUserOverride();
      });

      expect(mockClearUserOverride).toHaveBeenCalled();
    });

    it('should call LocaleStorageManager.getStorageStats', () => {
      const mockStats = { totalSize: 100, itemCount: 5 };
      mockGetStorageStats.mockReturnValue(mockStats);
      const { result } = renderHook(() => useLocaleStorage());

      const stats = result.current.getStats();

      expect(mockGetStorageStats).toHaveBeenCalled();
      expect(stats).toEqual(mockStats);
    });
  });

  describe('useLocalePreference', () => {
    it('should initialize with loading state', () => {
      mockGetUserPreference.mockReturnValue(null);
      mockGetUserOverride.mockReturnValue(null);

      const { result } = renderHook(() => useLocalePreference());

      expect(result.current.isLoading).toBe(true);
    });

    it('should load preferences on mount', async () => {
      const mockPreference = {
        locale: 'en',
        source: 'user',
        timestamp: Date.now(),
      };
      mockGetUserPreference.mockReturnValue(mockPreference);
      mockGetUserOverride.mockReturnValue('zh');

      const { result } = renderHook(() => useLocalePreference());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

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
      mockGetUserPreference.mockReturnValue(mockPreference);
      mockGetUserOverride.mockReturnValue(null);

      const { result } = renderHook(() => useLocalePreference());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.currentLocale).toBe('en');
    });

    it('should update preference', async () => {
      mockGetUserPreference.mockReturnValue(null);
      mockGetUserOverride.mockReturnValue(null);

      const { result } = renderHook(() => useLocalePreference());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const newPreference = {
        locale: 'zh' as const,
        source: 'user',
        timestamp: Date.now(),
      };
      act(() => {
        result.current.updatePreference(newPreference);
      });

      expect(mockSaveUserPreference).toHaveBeenCalledWith(newPreference);
      expect(result.current.preference).toEqual(newPreference);
    });

    it('should update override', async () => {
      mockGetUserPreference.mockReturnValue(null);
      mockGetUserOverride.mockReturnValue(null);

      const { result } = renderHook(() => useLocalePreference());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.updateOverride('zh');
      });

      expect(mockSetUserOverride).toHaveBeenCalledWith('zh');
      expect(result.current.override).toBe('zh');
    });

    it('should clear override', async () => {
      mockGetUserPreference.mockReturnValue(null);
      mockGetUserOverride.mockReturnValue('zh');

      const { result } = renderHook(() => useLocalePreference());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.clearOverride();
      });

      expect(mockClearUserOverride).toHaveBeenCalled();
      expect(result.current.override).toBeNull();
    });
  });

  describe('useDetectionHistory', () => {
    it('should initialize with loading state', () => {
      mockGetDetectionHistory.mockReturnValue(null);

      const { result } = renderHook(() => useDetectionHistory());

      expect(result.current.isLoading).toBe(true);
    });

    it('should load history on mount', async () => {
      const mockHistory = { records: [], lastUpdated: Date.now() };
      mockGetDetectionHistory.mockReturnValue(mockHistory);

      const { result } = renderHook(() => useDetectionHistory());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.history).toEqual(mockHistory);
    });

    it('should add detection record', async () => {
      const mockHistory = { records: [], lastUpdated: Date.now() };
      mockGetDetectionHistory.mockReturnValue(mockHistory);

      const { result } = renderHook(() => useDetectionHistory());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
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

      expect(mockAddDetectionRecord).toHaveBeenCalledWith(detection);
    });

    it('should get recent detections', async () => {
      mockGetDetectionHistory.mockReturnValue({
        records: [],
        lastUpdated: Date.now(),
      });
      mockGetRecentDetections.mockReturnValue([]);

      const { result } = renderHook(() => useDetectionHistory());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      result.current.getRecentDetections(10);

      expect(mockGetRecentDetections).toHaveBeenCalledWith(10);
    });

    it('should cleanup expired detections', async () => {
      mockGetDetectionHistory.mockReturnValue({
        records: [],
        lastUpdated: Date.now(),
      });

      const { result } = renderHook(() => useDetectionHistory());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.cleanupExpired(86400000);
      });

      expect(mockCleanupExpiredDetections).toHaveBeenCalledWith(86400000);
    });
  });

  describe('useStorageStats', () => {
    it('should initialize with loading state', () => {
      mockGetStorageStats.mockReturnValue(null);

      const { result } = renderHook(() => useStorageStats());

      expect(result.current.isLoading).toBe(true);
    });

    it('should load stats on mount', async () => {
      const mockStats = { totalSize: 100, itemCount: 5 };
      mockGetStorageStats.mockReturnValue(mockStats);

      const { result } = renderHook(() => useStorageStats());

      await act(async () => {
        await vi.runAllTimersAsync();
      });

      expect(result.current.stats).toEqual(mockStats);
      expect(result.current.isLoading).toBe(false);
    });

    it('should refresh stats', async () => {
      const mockStats = { totalSize: 100, itemCount: 5 };
      mockGetStorageStats.mockReturnValue(mockStats);

      const { result } = renderHook(() => useStorageStats());

      await act(async () => {
        await vi.runAllTimersAsync();
      });

      mockGetStorageStats.mockReturnValue({ totalSize: 200, itemCount: 10 });

      act(() => {
        result.current.refreshStats();
      });

      expect(result.current.stats).toEqual({ totalSize: 200, itemCount: 10 });
    });
  });

  describe('useStorageDataManager', () => {
    it('should export data', () => {
      const mockData = { preference: { locale: 'en' } };
      mockExportData.mockReturnValue(mockData);

      const { result } = renderHook(() => useStorageDataManager());

      const data = result.current.exportData();

      expect(mockExportData).toHaveBeenCalled();
      expect(data).toEqual(mockData);
    });

    it('should import data', () => {
      const { result } = renderHook(() => useStorageDataManager());
      const data = { preference: { locale: 'zh' } };

      act(() => {
        result.current.importData(data);
      });

      expect(mockImportData).toHaveBeenCalledWith(data);
    });

    it('should clear all data', () => {
      const { result } = renderHook(() => useStorageDataManager());

      act(() => {
        result.current.clearAllData();
      });

      expect(mockClearAll).toHaveBeenCalled();
    });
  });

  describe('useStorageAvailability', () => {
    it('should initialize with loading state', () => {
      const { result } = renderHook(() => useStorageAvailability());

      expect(result.current.isLoading).toBe(true);
    });

    it('should check storage availability', async () => {
      mockLocalStorageIsAvailable.mockReturnValue(true);
      mockCookieIsSupported.mockReturnValue(true);

      const { result } = renderHook(() => useStorageAvailability());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isLocalStorageAvailable).toBe(true);
      expect(result.current.isCookieAvailable).toBe(true);
      expect(result.current.isAnyStorageAvailable).toBe(true);
    });

    it('should handle unavailable storage', async () => {
      mockLocalStorageIsAvailable.mockReturnValue(false);
      mockCookieIsSupported.mockReturnValue(false);

      const { result } = renderHook(() => useStorageAvailability());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isLocalStorageAvailable).toBe(false);
      expect(result.current.isCookieAvailable).toBe(false);
      expect(result.current.isAnyStorageAvailable).toBe(false);
    });
  });

  describe('useAutoCleanup', () => {
    it('should run cleanup on mount when enabled', async () => {
      renderHook(() => useAutoCleanup({ enabled: true, intervalMs: 1000 }));

      expect(mockCleanupExpiredDetections).toHaveBeenCalled();
    });

    it('should not run cleanup when disabled', () => {
      renderHook(() => useAutoCleanup({ enabled: false }));

      expect(mockCleanupExpiredDetections).not.toHaveBeenCalled();
    });

    it('should run cleanup at intervals', async () => {
      renderHook(() => useAutoCleanup({ enabled: true, intervalMs: 1000 }));

      expect(mockCleanupExpiredDetections).toHaveBeenCalledTimes(1);

      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(mockCleanupExpiredDetections).toHaveBeenCalledTimes(2);

      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(mockCleanupExpiredDetections).toHaveBeenCalledTimes(3);
    });

    it('should cleanup interval on unmount', () => {
      const { unmount } = renderHook(() =>
        useAutoCleanup({ enabled: true, intervalMs: 1000 }),
      );

      expect(mockCleanupExpiredDetections).toHaveBeenCalledTimes(1);

      unmount();

      act(() => {
        vi.advanceTimersByTime(2000);
      });

      // Should not have been called again after unmount
      expect(mockCleanupExpiredDetections).toHaveBeenCalledTimes(1);
    });
  });

  describe('useStorageEvents', () => {
    it('should initialize with null lastStorageEvent', () => {
      const { result } = renderHook(() => useStorageEvents());

      expect(result.current.lastStorageEvent).toBeNull();
    });

    it('should update on storage event for tracked keys', () => {
      const { result } = renderHook(() => useStorageEvents());

      act(() => {
        const event = new StorageEvent('storage', {
          key: 'locale_user_preference',
          newValue: '{"locale":"zh"}',
          oldValue: '{"locale":"en"}',
        });
        window.dispatchEvent(event);
      });

      expect(result.current.lastStorageEvent).not.toBeNull();
      expect(result.current.lastStorageEvent?.key).toBe(
        'locale_user_preference',
      );
      expect(result.current.lastStorageEvent?.newValue).toBe('{"locale":"zh"}');
    });

    it('should ignore storage events for untracked keys', () => {
      const { result } = renderHook(() => useStorageEvents());

      act(() => {
        const event = new StorageEvent('storage', {
          key: 'unrelated_key',
          newValue: 'value',
          oldValue: null,
        });
        window.dispatchEvent(event);
      });

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
    });
  });
});
