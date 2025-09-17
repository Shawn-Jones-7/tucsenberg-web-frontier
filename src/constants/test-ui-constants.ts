/**
 * 测试UI相关常量定义
 * 包含透明度、角度、屏幕尺寸、内容限制等UI相关常量
 */

import { TEST_BASE_NUMBERS } from './test-base-constants';

// ==================== 测试UI常量 ====================

/** 测试透明度常量 */
export const TEST_OPACITY_CONSTANTS = {
  /** 完全透明 */
  TRANSPARENT: 0,

  /** 低透明度 - 0.3 */
  LOW: 0.3,

  /** 中等透明度 - 0.5 */
  MEDIUM: 0.5,

  /** 高透明度 - 0.8 */
  HIGH: 0.8,

  /** 完全不透明 */
  OPAQUE: 1,
} as const;

// ==================== 测试几何和角度常量 ====================

/** 测试角度常量 */
export const TEST_ANGLE_CONSTANTS = {
  /** 完整圆周 - 360度 */
  FULL_CIRCLE: TEST_BASE_NUMBERS.FULL_CIRCLE_DEGREES,

  /** 半圆 - 180度 */
  HALF_CIRCLE:
    TEST_BASE_NUMBERS.FULL_CIRCLE_DEGREES / TEST_BASE_NUMBERS.SMALL_COUNT,

  /** 四分之一圆 - 90度 */
  QUARTER_CIRCLE:
    TEST_BASE_NUMBERS.FULL_CIRCLE_DEGREES /
    (TEST_BASE_NUMBERS.SMALL_COUNT * TEST_BASE_NUMBERS.SMALL_COUNT),
} as const;

// ==================== 测试对比度和颜色常量 ====================

/** 测试对比度常量 */
export const TEST_CONTRAST_CONSTANTS = {
  /** 最小对比度 - 1 */
  MINIMUM: 1,

  /** 低对比度阈值 - 2 */
  LOW_THRESHOLD: TEST_BASE_NUMBERS.SMALL_COUNT,

  /** 高对比度阈值 - 10 */
  HIGH_THRESHOLD: TEST_BASE_NUMBERS.LARGE_COUNT,

  /** 精度位数 - 5 */
  PRECISION_DIGITS: TEST_BASE_NUMBERS.MEDIUM_COUNT,
} as const;

// ==================== 测试屏幕尺寸常量 ====================

/** 测试屏幕尺寸常量 */
export const TEST_SCREEN_CONSTANTS = {
  /** 移动端宽度 - 768px */
  MOBILE_WIDTH: 768,

  /** 平板宽度 - 1024px */
  TABLET_WIDTH: 1024,

  /** 桌面宽度 - 1280px */
  DESKTOP_WIDTH: 1280,

  /** 标准高度 - 768px */
  STANDARD_HEIGHT: 768,

  /** 小屏断点 - 640px */
  BREAKPOINT_SM: 640,

  /** 中屏断点 - 768px */
  BREAKPOINT_MD: 768,

  /** 大屏断点 - 1024px */
  BREAKPOINT_LG: 1024,

  /** 超大屏断点 - 1280px */
  BREAKPOINT_XL: 1280,
} as const;

// ==================== 测试内容限制常量 ====================

/** 测试内容限制常量 */
export const TEST_CONTENT_LIMITS = {
  /** 标题最大长度 - 60 */
  TITLE_MAX: 60,

  /** 描述最大长度 - 160 */
  DESCRIPTION_MAX: 160,

  /** 短文本最大长度 - 20 */
  SHORT_TEXT_MAX: 20,

  /** 中等文本最大长度 - 250 */
  MEDIUM_TEXT_MAX: 250,

  /** 长文本最大长度 - 500 */
  LONG_TEXT_MAX: 500,

  /** 最大文件大小 - 1024KB */
  MAX_FILE_SIZE: 1024,

  /** 最大嵌套回调 - 3 */
  MAX_NESTED_CALLBACKS: 3,

  /** 函数最大行数 - 80 */
  FUNCTION_MAX_LINES: 80,

  /** 文件最大行数 - 500 */
  FILE_MAX_LINES: 500,

  /** 最大复杂度 - 10 */
  MAX_COMPLEXITY: 10,

  /** SEO标题最大长度 - 60 */
  SEO_TITLE_MAX_LENGTH: 60,

  /** SEO描述最大长度 - 160 */
  SEO_DESCRIPTION_MAX_LENGTH: 160,
} as const;

// ==================== 测试动画和缓动常量 ====================

/** 测试动画缓动常量 */
export const TEST_EASING_CONSTANTS = {
  /** 缓动测试点 - 0.25 */
  QUARTER_POINT: 0.25,

  /** 缓动测试点 - 0.5 */
  HALF_POINT: 0.5,

  /** 缓动测试点 - 0.75 */
  THREE_QUARTER_POINT: 0.75,
} as const;

// ==================== 测试数值样本常量 ====================

/** 测试数值样本常量 */
export const TEST_SAMPLE_CONSTANTS = {
  /** 小数测试值 - 123.7 */
  DECIMAL_SAMPLE: 123.7,

  /** 负小数测试值 - -5.2 */
  NEGATIVE_DECIMAL: -5.2,

  /** 大整数测试值 - 999999 */
  LARGE_INTEGER: 1000000,

  /** 小整数测试值 - 42 */
  SMALL_INTEGER: 42,

  /** 整数样本测试值 - 1234 */
  INTEGER_SAMPLE: 1234,

  /** 百分比样本测试值 - 96 */
  PERCENTAGE_SAMPLE: 96,

  /** 货币样本测试值 - 1234.56 */
  CURRENCY_SAMPLE: 1234.56,

  /** 精度样本测试值 - 123.456 */
  PRECISION_SAMPLE: 123.456,

  /** 零值测试 */
  ZERO_VALUE: 0,

  /** 单位值测试 */
  UNIT_VALUE: 1,

  /** 价格测试值 - 99.99 */
  PRICE_SAMPLE: 99.99,
} as const;

// ==================== 测试特殊数值常量 ====================

/** 测试特殊数值常量 */
export const TEST_SPECIAL_CONSTANTS = {
  /** 十六进制大数 - 0x80000000 */
  HEX_LARGE_NUMBER: 0x80000000,

  /** 负数测试值 - -100 */
  NEGATIVE_VALUE: -100,

  /** 零值 */
  ZERO: 0,

  /** 单位值 */
  UNIT: 1,

  /** 负单位值 */
  NEGATIVE_UNIT: -1,
} as const;

// ==================== 测试性能监控常量 ====================

/** 测试性能监控常量 */
export const TEST_PERFORMANCE_MONITORING = {
  /** CLS警告阈值 - 0.1 */
  CLS_WARNING_THRESHOLD: 0.1,

  /** CLS严重阈值 - 0.25 */
  CLS_CRITICAL_THRESHOLD: 0.25,

  /** LCP警告阈值 - 2500ms */
  LCP_WARNING_THRESHOLD: 2500,

  /** LCP严重阈值 - 4000ms */
  LCP_CRITICAL_THRESHOLD: 4000,

  /** FID警告阈值 - 100ms */
  FID_WARNING_THRESHOLD: 100,

  /** FID严重阈值 - 300ms */
  FID_CRITICAL_THRESHOLD: 300,

  /** 长超时时间 - 5000ms */
  LONG_TIMEOUT: 5000,

  /** 监控超时时间 - 1000ms */
  MONITORING_TIMEOUT: 1000,

  /** 性能数据测试值 - 0.15 */
  PERFORMANCE_DATA_VALUE: 0.15,
} as const;

// ==================== 导出UI常量类型 ====================

export type TestOpacityConstants = typeof TEST_OPACITY_CONSTANTS;
export type TestAngleConstants = typeof TEST_ANGLE_CONSTANTS;
export type TestContrastConstants = typeof TEST_CONTRAST_CONSTANTS;
export type TestScreenConstants = typeof TEST_SCREEN_CONSTANTS;
export type TestContentLimits = typeof TEST_CONTENT_LIMITS;
export type TestEasingConstants = typeof TEST_EASING_CONSTANTS;
export type TestSampleConstants = typeof TEST_SAMPLE_CONSTANTS;
export type TestSpecialConstants = typeof TEST_SPECIAL_CONSTANTS;
export type TestPerformanceMonitoring = typeof TEST_PERFORMANCE_MONITORING;
