/**
 * 测试相关的TypeScript类型定义
 * 用于替换测试文件中的any类型，提升类型安全性
 */

// ============================================================================
// DOM Mock Types - 用于测试中的DOM元素模拟
// ============================================================================

/**
 * Mock DOM元素接口
 * 用于模拟测试中的HTML元素
 * 使用交叉类型提供HTMLElement兼容性，同时保留必需的Mock属性
 */
export interface MockDOMElement {
  id: string;
  textContent: string | null;
  setAttribute: (_name: string, _value: string) => void;
  style: Record<string, string>;
  parentNode: {
    removeChild: (_child: MockDOMElement) => MockDOMElement;
  } | null;
  // 添加HTMLElement的关键属性以提供类型兼容性
  [key: string]: unknown;
}

/**
 * Mock键盘事件接口
 * 用于模拟键盘交互测试
 * 使用交叉类型提供KeyboardEvent兼容性，同时保留必需的Mock属性
 */
export interface MockKeyboardEvent {
  key: string;
  preventDefault: () => void;
  stopPropagation?: () => void;
  target?: MockDOMElement;
  currentTarget?: MockDOMElement;
  // 添加KeyboardEvent的关键属性以提供类型兼容性
  [key: string]: unknown;
}

/**
 * Mock鼠标事件接口
 * 用于模拟鼠标交互测试
 */
export interface MockMouseEvent {
  type: string;
  button: number;
  clientX: number;
  clientY: number;
  preventDefault: () => void;
  stopPropagation?: () => void;
  target?: MockDOMElement;
  currentTarget?: MockDOMElement;
}

// ============================================================================
// Environment Mock Types - 用于环境变量和全局对象模拟
// ============================================================================

/**
 * Mock环境变量接口
 * 用于测试中的process.env模拟
 */
export interface MockProcessEnv {
  NODE_ENV?: string;
  [key: string]: string | undefined;
}

/**
 * Mock Crypto API接口
 * 用于测试中的加密API模拟
 */
export interface MockCrypto {
  getRandomValues: ((_array: Uint8Array) => Uint8Array) | null;
  randomUUID?: () => string;
  subtle?: {
    digest: (_algorithm: string, _data: ArrayBuffer) => Promise<ArrayBuffer>;
  };
}

/**
 * Mock全局对象接口
 * 用于测试中的全局对象模拟
 */
export interface MockGlobal {
  crypto: MockCrypto;
  window?: {
    matchMedia: (_query: string) => MediaQueryList;
    location: {
      href: string;
      pathname: string;
      search: string;
    };
  };
}

// ============================================================================
// Test Analytics Types - 用于主题分析测试的数据类型
// ============================================================================

/**
 * 主题切换模式类型
 */
export type ThemeMode = 'light' | 'dark' | 'system';

/**
 * 不安全的语言代码类型 - 用于安全性测试
 * 包含可能导致原型污染的危险字符串
 */
export type UnsafeLocaleCode =
  | '__proto__'
  | 'constructor'
  | 'prototype'
  | string;

/**
 * 性能指标接口
 * 用于主题切换性能测试
 */
export interface MockPerformanceMetric {
  switchDuration: number;
  fromTheme: ThemeMode;
  toTheme: ThemeMode;
  timestamp: number | null;
  userAgent: string;
  viewportSize: {
    width: number;
    height: number;
  };
  supportsViewTransitions: boolean;
}

/**
 * 主题切换模式接口
 * 用于分析主题切换行为模式
 */
export interface MockSwitchPattern {
  sequence: [ThemeMode, ThemeMode];
  frequency: number;
  lastOccurrence: number;
}

/**
 * 分析配置接口
 * 用于主题分析器配置测试
 */
export interface MockAnalyticsConfig {
  enabled: boolean;
  sampleRate: number;
  maxRecords?: number;
  debugMode?: boolean;
}

// ============================================================================
// Test Utility Types - 用于测试工具函数的类型
// ============================================================================

/**
 * Jest Mock函数类型
 * 用于类型化Jest模拟函数
 */
export type MockFunction<T extends (..._args: unknown[]) => unknown> = T & {
  mock: {
    calls: unknown[][];
    results: Array<{ type: 'return' | 'throw'; value: unknown }>;
    instances: unknown[];
  };
  mockReturnValue: (_value: ReturnType<T>) => MockFunction<T>;
  mockImplementation: (_fn: T) => MockFunction<T>;
  mockResolvedValue: (_value: Awaited<ReturnType<T>>) => MockFunction<T>;
  mockRejectedValue: (_value: unknown) => MockFunction<T>;
};

/**
 * 测试回调函数类型
 * 用于异步测试的回调
 */
export type TestCallback = (_done?: () => void) => void;

/**
 * 测试配置接口
 * 用于测试设置和配置
 */
export interface TestConfig {
  timeout?: number;
  retries?: number;
  skipCI?: boolean;
  mockTimers?: boolean;
}

/**
 * 颜色测试数据接口
 * 用于颜色系统测试
 */
export interface MockColorData {
  [key: string]: {
    l: number;
    c: number;
    h: number;
    alpha?: number;
  };
}

// ============================================================================
// Type Guards - 用于类型检查的工具函数
// ============================================================================

/**
 * 检查是否为Mock DOM元素
 */
export function isMockDOMElement(obj: unknown): obj is MockDOMElement {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'textContent' in obj &&
    'setAttribute' in obj
  );
}

/**
 * 检查是否为Mock键盘事件
 */
export function isMockKeyboardEvent(obj: unknown): obj is MockKeyboardEvent {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'key' in obj &&
    'preventDefault' in obj
  );
}

/**
 * 检查是否为有效的主题模式
 */
export function isValidThemeMode(mode: string): mode is ThemeMode {
  return ['light', 'dark', 'system'].includes(mode);
}

// ============================================================================
// Accessibility Test Types - 用于无障碍功能测试的类型
// ============================================================================

/**
 * 无障碍管理器私有属性接口
 * 用于测试中访问私有属性
 */
export interface AccessibilityManagerPrivate {
  liveRegion: MockDOMElement | null;
  language: string;
  announcements: string[];
}

/**
 * 无障碍测试配置接口
 */
export interface AccessibilityTestConfig {
  language?: string;
  enableAnnouncements?: boolean;
  mockLiveRegion?: boolean;
}

// ============================================================================
// Theme Analytics Private Types - 用于主题分析器私有属性测试
// ============================================================================

/**
 * 主题分析器私有属性接口
 * 用于测试中访问私有属性
 */
export interface ThemeAnalyticsPrivate {
  performanceMetrics: MockPerformanceMetric[];
  switchPatterns: MockSwitchPattern[];
  config: MockAnalyticsConfig;
  isEnabled: boolean;
}

/**
 * 主题分析器实例类型
 * 结合公共接口和私有属性
 */
export type ThemeAnalyticsInstance = {
  recordThemeSwitch: (
    _fromTheme: ThemeMode,
    _toTheme: ThemeMode,
    _startTime: number,
    _endTime: number,
    _supportsViewTransitions?: boolean,
  ) => void;
  recordThemePreference: (_theme: ThemeMode) => void;
  getPerformanceSummary: () => {
    totalSwitches: number;
    averageDuration: number;
    fastestSwitch: number;
    slowestSwitch: number;
  };
} & ThemeAnalyticsPrivate;

// ============================================================================
// Color System Test Types - 用于颜色系统测试的类型
// ============================================================================

/**
 * 不完整的主题颜色类型
 * 用于测试边界情况
 */
export interface IncompleteThemeColors {
  background?: {
    l: number;
    c: number;
    h: number;
    alpha?: number;
  };
  [key: string]:
    | {
        l: number;
        c: number;
        h: number;
        alpha?: number;
      }
    | undefined;
}

/**
 * CSS变量生成测试类型
 */
export interface CSSVariablesTest {
  input: MockColorData | IncompleteThemeColors;
  prefix?: string;
  expected: Record<string, string>;
}

// ============================================================================
// Browser API Mock Types - 用于浏览器API模拟的类型
// ============================================================================

/**
 * NumberFormat构造函数类型
 * 用于测试中模拟Intl.NumberFormat
 */
export interface NumberFormatConstructor {
  new (
    locales?: string | string[],
    options?: Intl.NumberFormatOptions,
  ): Intl.NumberFormat;
  (
    locales?: string | string[],
    options?: Intl.NumberFormatOptions,
  ): Intl.NumberFormat;
  supportedLocalesOf(
    locales: string | string[],
    options?: { localeMatcher?: string },
  ): string[];
}

/**
 * DateTimeFormat构造函数类型
 * 用于测试中模拟Intl.DateTimeFormat
 */
export interface DateTimeFormatConstructor {
  new (
    locales?: string | string[],
    options?: Intl.DateTimeFormatOptions,
  ): Intl.DateTimeFormat;
  (
    locales?: string | string[],
    options?: Intl.DateTimeFormatOptions,
  ): Intl.DateTimeFormat;
  supportedLocalesOf(
    locales: string | string[],
    options?: { localeMatcher?: string },
  ): string[];
}

/**
 * Mock存储管理器接口
 * 用于测试中模拟存储操作
 */
export interface MockStorageManager {
  getUserPreference: MockFunction<() => string | null>;
  getDetectionHistory: MockFunction<
    () => Array<{ locale: string; timestamp: number }>
  >;
  getUserOverride: MockFunction<() => string | null>;
  setUserPreference: MockFunction<(locale: string) => void>;
  setUserOverride: MockFunction<(locale: string) => void>;
  clearUserData: MockFunction<() => void>;
}

/**
 * Mock地理位置接口
 * 用于测试中模拟地理位置API
 */
export interface MockGeolocation {
  getCurrentPosition: MockFunction<
    (
      success: (position: GeolocationPosition) => void,
      error?: (error: GeolocationPositionError) => void,
    ) => void
  >;
  watchPosition: MockFunction<
    (
      success: (position: GeolocationPosition) => void,
      error?: (error: GeolocationPositionError) => void,
    ) => number
  >;
  clearWatch: MockFunction<(watchId: number) => void>;
}

// ============================================================================
// Jest Extended Types - Jest相关的扩展类型
// ============================================================================

/**
 * Jest模拟函数的扩展类型
 * 支持更复杂的模拟场景
 */
export type ExtendedMockFunction<
  T extends (..._args: unknown[]) => unknown = (
    ..._args: unknown[]
  ) => unknown,
> = MockFunction<T> & {
  mockReturnValueOnce: (_value: ReturnType<T>) => ExtendedMockFunction<T>;
  mockResolvedValueOnce: (
    _value: Awaited<ReturnType<T>>,
  ) => ExtendedMockFunction<T>;
  mockRejectedValueOnce: (_error: unknown) => ExtendedMockFunction<T>;
};

/**
 * Jest间谍函数类型
 */
export type SpyFunction<T = unknown> = T & {
  mockRestore: () => void;
  mockClear: () => void;
  mockReset: () => void;
};

/**
 * 测试套件配置接口
 */
export interface TestSuiteConfig {
  name: string;
  timeout?: number;
  beforeEach?: () => void | Promise<void>;
  afterEach?: () => void | Promise<void>;
  beforeAll?: () => void | Promise<void>;
  afterAll?: () => void | Promise<void>;
}

// ============================================================================
// Pattern Matching Types - 用于模式匹配测试的类型
// ============================================================================

/**
 * 模式匹配结果接口
 * 用于测试中的模式识别
 */
export interface PatternMatchResult {
  pattern: MockSwitchPattern;
  confidence: number;
  occurrences: number;
}

/**
 * 测试数据生成器类型
 */
export type TestDataGenerator<T> = (_count: number) => T[];

/**
 * 测试断言辅助类型
 */
export interface TestAssertion<T> {
  actual: T;
  expected: T;
  message?: string;
}

// ============================================================================
// Export All Types - 导出所有类型的便捷接口
// ============================================================================

/**
 * 所有测试类型的联合类型
 * 用于类型检查和文档生成
 */
export type AllTestTypes =
  | MockDOMElement
  | MockKeyboardEvent
  | MockMouseEvent
  | MockProcessEnv
  | MockCrypto
  | MockGlobal
  | MockPerformanceMetric
  | MockSwitchPattern
  | MockAnalyticsConfig
  | AccessibilityManagerPrivate
  | ThemeAnalyticsPrivate
  | IncompleteThemeColors
  | CSSVariablesTest;
