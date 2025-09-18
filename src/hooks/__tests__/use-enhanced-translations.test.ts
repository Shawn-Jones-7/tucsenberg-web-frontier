import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  TEST_COUNT_CONSTANTS,
  TEST_SAMPLE_CONSTANTS,
} from '@/constants/test-constants';
import type {
  DateTimeFormatConstructor,
  NumberFormatConstructor,
} from '@/types';
import {
  useEnhancedTranslations,
  useI18nPerformance,
} from '../use-enhanced-translations';

// Hoisted mock functions
const { mockT, mockTRich, mockTHas, mockUseTranslations, mockUseLocale } =
  vi.hoisted(() => ({
    mockT: vi.fn(),
    mockTRich: vi.fn(),
    mockTHas: vi.fn(),
    mockUseTranslations: vi.fn(),
    mockUseLocale: vi.fn(),
  }));

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: mockUseTranslations,
  useLocale: mockUseLocale,
}));

// Mock I18nPerformanceMonitor
vi.mock('@/lib/i18n-performance', () => ({
  I18nPerformanceMonitor: {
    recordLoadTime: vi.fn(),
    recordError: vi.fn(),
    getMetrics: vi.fn(() => ({
      loadTime: 0,
      errorRate: 0,
      cacheHitRate: 0,
    })),
    reset: vi.fn(),
  },
}));

// Mock performance API
const mockPerformanceNow = vi.fn();
Object.defineProperty(global, 'performance', {
  value: {
    now: mockPerformanceNow,
  },
  writable: true,
});

describe('useEnhancedTranslations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPerformanceNow.mockReturnValue(1000);

    // Setup mock translations
    mockT.mockImplementation((key: string, values?: unknown) => {
      if (key === 'missing.key') {
        throw new Error('Translation not found');
      }
      if (key === 'fallback.key') {
        return key; // Simulate fallback behavior
      }
      return values
        ? `translated-${key}-${JSON.stringify(values)}`
        : `translated-${key}`;
    });

    // Add rich and has methods to mock
    Object.assign(mockT, {
      rich: mockTRich,
      has: mockTHas,
    });

    mockUseTranslations.mockReturnValue(mockT);
    mockUseLocale.mockReturnValue('en');
    mockTHas.mockReturnValue(true);
    mockTRich.mockImplementation((key: string) => `rich-${key}`);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('basic functionality', () => {
    it('should return enhanced translation functions', () => {
      const { result } = renderHook(() => useEnhancedTranslations());

      expect(result.current.t).toBeDefined();
      expect(result.current.batchT).toBeDefined();
      expect(result.current.conditionalT).toBeDefined();
      expect(result.current.richT).toBeDefined();
      expect(result.current.hasTranslation).toBeDefined();
      expect(result.current.formatNumber).toBeDefined();
      expect(result.current.formatDate).toBeDefined();
      expect(result.current.formatRelativeTime).toBeDefined();
      expect(result.current.getPerformanceMetrics).toBeDefined();
      expect(result.current.locale).toBe('en');
    });

    it('should translate simple keys', () => {
      const { result } = renderHook(() => useEnhancedTranslations());

      const translation = result.current.t('hello');
      expect(translation).toBe('translated-hello');
      expect(mockT).toHaveBeenCalledWith('hello', undefined);
    });

    it('should translate keys with values', () => {
      const { result } = renderHook(() => useEnhancedTranslations());
      const values = { name: 'John' };

      const translation = result.current.t('greeting', values);
      expect(translation).toBe(`translated-greeting-${JSON.stringify(values)}`);
      expect(mockT).toHaveBeenCalledWith('greeting', values);
    });

    it('should handle namespace option', () => {
      const { result } = renderHook(() =>
        useEnhancedTranslations({ namespace: 'common' }),
      );

      expect(mockUseTranslations).toHaveBeenCalledWith('common');
      expect(result.current.namespace).toBe('common');
    });
  });

  describe('error handling and fallbacks', () => {
    it('should handle translation errors with fallback', () => {
      const { result } = renderHook(() =>
        useEnhancedTranslations({ fallback: true }),
      );

      const translation = result.current.t('missing.key');
      expect(translation).toBe('[ERROR] missing.key');
    });

    it('should handle translation errors without fallback', () => {
      const { result } = renderHook(() =>
        useEnhancedTranslations({ fallback: false }),
      );

      const translation = result.current.t('missing.key');
      expect(translation).toBe('missing.key');
    });

    it('should handle fallback keys', () => {
      const { result } = renderHook(() =>
        useEnhancedTranslations({ fallback: true }),
      );

      const translation = result.current.t('fallback.key');
      expect(translation).toBe('[EN] fallback.key');
    });

    it('should handle rich text translation errors', () => {
      mockTRich.mockImplementation(() => {
        throw new Error('Rich translation error');
      });

      const { result } = renderHook(() =>
        useEnhancedTranslations({ fallback: true }),
      );

      const translation = result.current.richT('rich.key', {});
      expect(translation).toBe('[RICH ERROR] rich.key');
    });
  });

  describe('batch translations', () => {
    it('should translate multiple keys', () => {
      const { result } = renderHook(() => useEnhancedTranslations());

      const translations = result.current.batchT(['key1', 'key2', 'key3']);

      expect(translations).toEqual({
        key1: 'translated-key1',
        key2: 'translated-key2',
        key3: 'translated-key3',
      });
    });

    it('should handle batch translations with values', () => {
      const { result } = renderHook(() => useEnhancedTranslations());
      const values = { count: 5 };

      const translations = result.current.batchT(['item1', 'item2'], values);

      expect(translations).toEqual({
        item1: `translated-item1-${JSON.stringify(values)}`,
        item2: `translated-item2-${JSON.stringify(values)}`,
      });
    });

    it('should handle empty batch translations', () => {
      const { result } = renderHook(() => useEnhancedTranslations());

      const translations = result.current.batchT([]);
      expect(translations).toEqual({});
    });
  });

  describe('conditional translations', () => {
    it('should return true key when condition is true', () => {
      const { result } = renderHook(() => useEnhancedTranslations());

      const translation = result.current.conditionalT({
        condition: true,
        trueKey: 'true.key',
        falseKey: 'false.key',
      });
      expect(translation).toBe('translated-true.key');
    });

    it('should return false key when condition is false', () => {
      const { result } = renderHook(() => useEnhancedTranslations());

      const translation = result.current.conditionalT({
        condition: false,
        trueKey: 'true.key',
        falseKey: 'false.key',
      });
      expect(translation).toBe('translated-false.key');
    });

    it('should handle conditional translations with values', () => {
      const { result } = renderHook(() => useEnhancedTranslations());
      const values = { status: 'active' };

      const translation = result.current.conditionalT({
        condition: true,
        trueKey: 'active.key',
        falseKey: 'inactive.key',
        values,
      });
      expect(translation).toBe(
        `translated-active.key-${JSON.stringify(values)}`,
      );
    });
  });

  describe('rich text translations', () => {
    it('should handle rich text translations', () => {
      const { result } = renderHook(() => useEnhancedTranslations());
      const components = { bold: (chunks: unknown) => `<b>${chunks}</b>` };

      const translation = result.current.richT('rich.text', components);
      expect(translation).toBe('rich-rich.text');
      expect(mockTRich).toHaveBeenCalledWith('rich.text', components);
    });

    it('should handle rich text without fallback', () => {
      mockTRich.mockImplementation(() => {
        throw new Error('Rich translation error');
      });

      const { result } = renderHook(() =>
        useEnhancedTranslations({ fallback: false }),
      );

      const translation = result.current.richT('rich.key', {});
      expect(translation).toBe('rich.key');
    });
  });

  describe('translation existence check', () => {
    it('should check if translation exists', () => {
      const { result } = renderHook(() => useEnhancedTranslations());

      const exists = result.current.hasTranslation('existing.key');
      expect(exists).toBe(true);
      expect(mockTHas).toHaveBeenCalledWith('existing.key');
    });

    it('should handle translation existence check errors', () => {
      mockTHas.mockImplementation(() => {
        throw new Error('Check error');
      });

      const { result } = renderHook(() => useEnhancedTranslations());

      const exists = result.current.hasTranslation('error.key');
      expect(exists).toBe(false);
    });
  });

  describe('formatting functions', () => {
    it('should format numbers', () => {
      const { result } = renderHook(() => useEnhancedTranslations());

      const formatted = result.current.formatNumber(
        TEST_SAMPLE_CONSTANTS.CURRENCY_SAMPLE,
      );
      expect(typeof formatted).toBe('string');
    });

    it('should format numbers with options', () => {
      const { result } = renderHook(() => useEnhancedTranslations());

      const formatted = result.current.formatNumber(
        TEST_SAMPLE_CONSTANTS.CURRENCY_SAMPLE,
        {
          style: 'currency',
          currency: 'USD',
        },
      );
      expect(typeof formatted).toBe('string');
    });

    it('should handle number formatting errors', () => {
      // Mock Intl.NumberFormat to throw
      const originalNumberFormat = Intl.NumberFormat;
      const mockNumberFormat = vi.fn().mockImplementation(() => {
        throw new Error('Format error');
      }) as any;
      // Add required static method
      (mockNumberFormat as any).supportedLocalesOf = vi
        .fn()
        .mockReturnValue([]);
      Intl.NumberFormat = mockNumberFormat as NumberFormatConstructor;

      const { result } = renderHook(() => useEnhancedTranslations());

      const formatted = result.current.formatNumber(
        TEST_SAMPLE_CONSTANTS.CURRENCY_SAMPLE,
      );
      expect(formatted).toBe('1234.56');

      // Restore
      Intl.NumberFormat = originalNumberFormat;
    });

    it('should format dates', () => {
      const { result } = renderHook(() => useEnhancedTranslations());
      const date = new Date('2023-01-01');

      const formatted = result.current.formatDate(date);
      expect(typeof formatted).toBe('string');
    });

    it('should handle date formatting errors', () => {
      const originalDateTimeFormat = Intl.DateTimeFormat;
      const mockDateTimeFormat = vi.fn().mockImplementation(() => {
        throw new Error('Format error');
      }) as any;
      // Add required static method
      (mockDateTimeFormat as any).supportedLocalesOf = vi
        .fn()
        .mockReturnValue([]);
      Intl.DateTimeFormat = mockDateTimeFormat as DateTimeFormatConstructor;

      const { result } = renderHook(() => useEnhancedTranslations());
      const date = new Date('2023-01-01');

      const formatted = result.current.formatDate(date);
      expect(formatted).toBe(date.toISOString());

      Intl.DateTimeFormat = originalDateTimeFormat;
    });

    it('should format relative time', () => {
      const { result } = renderHook(() => useEnhancedTranslations());

      const formatted = result.current.formatRelativeTime(-1, 'day');
      expect(typeof formatted).toBe('string');
    });

    it('should handle relative time formatting errors', () => {
      const originalRelativeTimeFormat = Intl.RelativeTimeFormat;
      const mockRelativeTimeFormat = vi.fn().mockImplementation(() => {
        throw new Error('Format error');
      });

      // Mock the constructor property instead of trying to assign to readonly property
      Object.defineProperty(Intl, 'RelativeTimeFormat', {
        value: mockRelativeTimeFormat,
        writable: true,
        configurable: true,
      });

      const { result } = renderHook(() => useEnhancedTranslations());

      const formatted = result.current.formatRelativeTime(-1, 'day');
      expect(formatted).toBe('-1 day');

      // Restore
      Object.defineProperty(Intl, 'RelativeTimeFormat', {
        value: originalRelativeTimeFormat,
        writable: true,
        configurable: true,
      });
    });
  });

  describe('performance monitoring', () => {
    it('should record performance metrics when analytics enabled', async () => {
      const mockModule = (await vi.importMock('@/lib/i18n-performance')) as any;
      const I18nPerformanceMonitor = (mockModule as any).I18nPerformanceMonitor;

      mockPerformanceNow
        .mockReturnValueOnce(1000)
        .mockReturnValueOnce(1000 + TEST_COUNT_CONSTANTS.LARGE);

      const { result } = renderHook(() =>
        useEnhancedTranslations({ analytics: true }),
      );

      result.current.t('test.key');

      expect(I18nPerformanceMonitor.recordLoadTime).toHaveBeenCalledWith(
        TEST_COUNT_CONSTANTS.LARGE,
      );
    });

    it('should not record performance metrics when analytics disabled', async () => {
      const mockModule = (await vi.importMock('@/lib/i18n-performance')) as any;
      const I18nPerformanceMonitor = mockModule.I18nPerformanceMonitor as any;

      const { result } = renderHook(() =>
        useEnhancedTranslations({ analytics: false }),
      );

      result.current.t('test.key');

      expect(I18nPerformanceMonitor.recordLoadTime).not.toHaveBeenCalled();
    });

    it('should record errors when analytics enabled', async () => {
      const mockModule = (await vi.importMock('@/lib/i18n-performance')) as any;
      const I18nPerformanceMonitor = mockModule.I18nPerformanceMonitor as any;

      const { result } = renderHook(() =>
        useEnhancedTranslations({ analytics: true }),
      );

      result.current.t('missing.key');

      expect(I18nPerformanceMonitor.recordError).toHaveBeenCalled();
    });

    it('should get performance metrics', async () => {
      const mockModule = (await vi.importMock('@/lib/i18n-performance')) as any;
      const I18nPerformanceMonitor = mockModule.I18nPerformanceMonitor as any;

      const { result } = renderHook(() => useEnhancedTranslations());

      const metrics = result.current.getPerformanceMetrics();

      expect(I18nPerformanceMonitor.getMetrics).toHaveBeenCalled();
      expect(metrics).toEqual({
        loadTime: 0,
        errorRate: 0,
        cacheHitRate: 0,
      });
    });
  });

  describe('preloading', () => {
    it('should preload specified keys', () => {
      renderHook(() => useEnhancedTranslations({ preload: ['key1', 'key2'] }));

      expect(mockT).toHaveBeenCalledWith('key1');
      expect(mockT).toHaveBeenCalledWith('key2');
    });

    it('should handle preload errors gracefully', () => {
      mockT.mockImplementation((key: string) => {
        if (key === 'error.key') {
          throw new Error('Preload error');
        }
        return `translated-${key}`;
      });

      expect(() => {
        renderHook(() =>
          useEnhancedTranslations({ preload: ['error.key', 'valid.key'] }),
        );
      }).not.toThrow();

      expect(mockT).toHaveBeenCalledWith('error.key');
      expect(mockT).toHaveBeenCalledWith('valid.key');
    });

    it('should handle empty preload array', () => {
      renderHook(() => useEnhancedTranslations({ preload: [] }));

      // Should not call mockT for preloading
      expect(mockT).not.toHaveBeenCalled();
    });
  });
});

describe('useI18nPerformance', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should provide performance monitoring functions', () => {
    const { result } = renderHook(() => useI18nPerformance());

    expect(result.current.getMetrics).toBeDefined();
    expect(result.current.resetMetrics).toBeDefined();
  });

  it('should get performance metrics', async () => {
    const mockModule = (await vi.importMock('@/lib/i18n-performance')) as any;
    const I18nPerformanceMonitor = mockModule.I18nPerformanceMonitor as any;

    const { result } = renderHook(() => useI18nPerformance());

    act(() => {
      result.current.getMetrics();
    });

    expect(I18nPerformanceMonitor.getMetrics).toHaveBeenCalled();
  });

  it('should reset performance metrics', async () => {
    const mockModule = (await vi.importMock('@/lib/i18n-performance')) as any;
    const I18nPerformanceMonitor = mockModule.I18nPerformanceMonitor as any;

    const { result } = renderHook(() => useI18nPerformance());

    act(() => {
      result.current.resetMetrics();
    });

    expect(I18nPerformanceMonitor.reset).toHaveBeenCalled();
  });
});
