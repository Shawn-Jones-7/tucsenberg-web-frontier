import { vi } from 'vitest';
import type { MockSwitchPattern } from '@/types/test-types';
import {
  TEST_BASE_NUMBERS,
  TEST_CONSTANTS,
  THEME_ANALYTICS_CONSTANTS,
} from '@/constants/test-constants';
import {
  DEBUG_CONSTANTS,
  DELAY_CONSTANTS,
  OPACITY_CONSTANTS,
  PERCENTAGE_CONSTANTS,
  PERFORMANCE_CONSTANTS,
  TIME_CONSTANTS,
} from '../../../constants/app-constants';
import {
  ThemeAnalytics,
  themeAnalytics,
  type ThemeAnalyticsConfig,
} from '../../theme-analytics';

// Note: Logger is mocked in the test file using vi.hoisted

// Mock crypto for secure random
export const mockGetRandomValues = vi.fn();
Object.defineProperty(global, 'crypto', {
  value: {
    getRandomValues: mockGetRandomValues,
  },
  writable: true,
});

// Mock performance.now
export const mockPerformanceNow = vi.fn();
Object.defineProperty(global, 'performance', {
  value: {
    now: mockPerformanceNow,
  },
  writable: true,
});

// Mock localStorage
export const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(global, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
});

// Mock sessionStorage
export const mockSessionStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(global, 'sessionStorage', {
  value: mockSessionStorage,
  writable: true,
});

// Mock navigator
export const mockNavigator = {
  userAgent:
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
  language: 'en-US',
  languages: ['en-US', 'en'],
  onLine: true,
  connection: {
    effectiveType: '4g',
    downlink: 10,
    rtt: 50,
  },
};

Object.defineProperty(global, 'navigator', {
  value: mockNavigator,
  writable: true,
});

// Mock window
export const mockWindow = {
  innerWidth: 0,
  innerHeight: 0,
};

Object.defineProperty(global, 'window', {
  value: mockWindow,
  writable: true,
});

// Mock document.startViewTransition
export const mockStartViewTransition = vi.fn();
if (!document.startViewTransition) {
  Object.defineProperty(document, 'startViewTransition', {
    value: mockStartViewTransition,
    configurable: true,
    writable: true,
  });
} else {
  // If it already exists, just replace the implementation
  document.startViewTransition = mockStartViewTransition;
}

// Setup function for theme analytics tests
export function setupThemeAnalyticsTest() {
  vi.clearAllMocks();

  // Reset mockGetRandomValues to default behavior (100% sampling for tests)
  mockGetRandomValues.mockReset();
  mockGetRandomValues.mockImplementation((array) => {
    array[0] = 0; // 0% value ensures 100% sampling (0 < any positive sampleRate)
    return array;
  });

  // Reset performance.now mock
  mockPerformanceNow.mockReset();
  mockPerformanceNow.mockReturnValue(1000); // Default timestamp

  // Reset localStorage mock
  mockLocalStorage.getItem.mockReturnValue(null);
  mockLocalStorage.setItem.mockImplementation(() => {});
  mockLocalStorage.removeItem.mockImplementation(() => {});
  mockLocalStorage.clear.mockImplementation(() => {});

  // Reset sessionStorage mock
  mockSessionStorage.getItem.mockReturnValue(null);
  mockSessionStorage.setItem.mockImplementation(() => {});
  mockSessionStorage.removeItem.mockImplementation(() => {});
  mockSessionStorage.clear.mockImplementation(() => {});

  // Reset navigator mock
  Object.assign(mockNavigator, {
    userAgent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    language: 'en-US',
    languages: ['en-US', 'en'],
    onLine: true,
    connection: {
      effectiveType: '4g',
      downlink: 10,
      rtt: 50,
    },
  });

  // Reset window mock
  mockWindow.innerWidth = 0;
  mockWindow.innerHeight = 0;

  // Reset startViewTransition mock
  mockStartViewTransition.mockReset();
  mockStartViewTransition.mockImplementation((callback) => {
    callback?.();
    return Promise.resolve();
  });

  // Note: Logger mocks are cleared by vi.clearAllMocks() above
}

// Helper function to create analytics instance with default config
export function createAnalyticsInstance(
  config?: Partial<ThemeAnalyticsConfig>,
): ThemeAnalytics {
  return new ThemeAnalytics({
    enabled: true,
    performanceThreshold:
      THEME_ANALYTICS_CONSTANTS.PERFORMANCE_THRESHOLD_DEFAULT,
    sampleRate: THEME_ANALYTICS_CONSTANTS.SAMPLING_RATE_FULL,
    enableDetailedTracking: true,
    enableUserBehaviorAnalysis: true,
    ...config,
  });
}

// Helper function to create mock switch pattern
export function createMockSwitchPattern(
  overrides?: Partial<MockSwitchPattern>,
): MockSwitchPattern {
  return {
    sequence: ['light', 'dark'],
    frequency: 1,
    lastOccurrence: Date.now(),
    ...overrides,
  };
}

// Helper function to simulate time passage
export function simulateTimePassage(milliseconds: number) {
  const currentTime =
    mockPerformanceNow.mock.results[mockPerformanceNow.mock.results.length - 1]
      ?.value || 1000;
  mockPerformanceNow.mockReturnValue(currentTime + milliseconds);
}

// Helper function to simulate multiple theme switches
export function simulateThemeSwitches(
  analytics: ThemeAnalytics,
  count: number,
) {
  const patterns = ['light', 'dark', 'system'] as const;
  for (let i = 0; i < count; i++) {
    const from = patterns[i % patterns.length]!;
    const to = patterns[(i + 1) % patterns.length]!;
    const startTime = Date.now() + i * 1000;
    const endTime = startTime + 100 + i * TEST_BASE_NUMBERS.LARGE_COUNT;
    analytics.recordThemeSwitch({
      fromTheme: from,
      toTheme: to,
      startTime,
      endTime,
    });
  }
}

// Cleanup function for tests
export function cleanupThemeAnalyticsTest() {
  vi.restoreAllMocks();
}

// 辅助方法：移除 crypto 用于验证退化逻辑
export function removeGlobalCrypto() {
  vi.stubGlobal('crypto', undefined);
}

// 辅助方法：移除 navigator 用于测试边界场景
export function removeGlobalNavigator() {
  vi.stubGlobal('navigator', undefined);
}

// 辅助方法：配置全局实例以便通过公开接口进行断言
export function configureGlobalThemeAnalytics(
  overrides: Partial<ThemeAnalyticsConfig> = {},
): void {
  themeAnalytics.reset();
  themeAnalytics.updateConfig({
    enabled: true,
    performanceThreshold:
      THEME_ANALYTICS_CONSTANTS.PERFORMANCE_THRESHOLD_DEFAULT,
    sampleRate: THEME_ANALYTICS_CONSTANTS.SAMPLING_RATE_FULL,
    enableDetailedTracking: true,
    enableUserBehaviorAnalysis: true,
    ...overrides,
  });
}

// Export constants for use in tests
export {
  DEBUG_CONSTANTS,
  DELAY_CONSTANTS,
  OPACITY_CONSTANTS,
  PERCENTAGE_CONSTANTS,
  PERFORMANCE_CONSTANTS,
  TEST_CONSTANTS,
  THEME_ANALYTICS_CONSTANTS,
  TIME_CONSTANTS,
};
