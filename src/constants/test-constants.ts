/**
 * 测试相关常量定义 - 主入口文件
 * 重新导出所有拆分的测试常量，保持向后兼容性
 * 遵循项目编码标准，提高测试代码的可维护性
 */

// 导入Web Vitals相关常量

// 导入UI相关常量
import {
  TEST_CONTENT_LIMITS,
  TEST_SAMPLE_CONSTANTS,
  TEST_SCREEN_CONSTANTS,
  TEST_SPECIAL_CONSTANTS,
} from './test-ui-constants';
import {
  TEST_WEB_VITALS_DIAGNOSTICS,
  WEB_VITALS_CONSTANTS,
} from './test-web-vitals-constants';

// ==================== 应用特定测试常量 ====================

/** 时间计算相关常量 */
export const TEST_TIME_CALCULATIONS = {
  /** 毫秒基数 - 1000 */
  MILLISECOND_BASE: 1000,

  /** 时间单位 - 60 */
  TIME_UNIT: 60,

  /** 每天小时数 - 24 */
  HOURS_PER_DAY: 24,

  /** 25小时 */
  TWENTY_FIVE_HOURS: 25,
} as const;

/** 延迟相关常量 */
export const TEST_DELAY_VALUES = {
  /** 短延迟 - 150ms */
  SHORT_DELAY: 150,

  /** 中等延迟 - 200ms */
  MEDIUM_DELAY: 200,

  /** 清理延迟 - 500ms */
  CLEANUP_DELAY: 500,

  /** 主题切换延迟 - 400ms */
  THEME_CHANGE_DELAY: 400,

  /** 减少动画延迟 - 50ms */
  REDUCED_MOTION_DELAY: 50,
} as const;

/** 百分比值常量 */
export const TEST_PERCENTAGE_VALUES = {
  /** 完整 - 100 */
  FULL: 100,

  /** 一半 - 50 */
  HALF: 50,

  /** 四分之一 - 25 */
  QUARTER: 25,

  /** 60% */
  SIXTY: 60,
} as const;

/** 性能时间戳常量 */
export const TEST_PERFORMANCE_TIMESTAMPS = {
  /** 基础时间戳 - 1000 */
  BASE: 1000,

  /** 偏移量 - 1005 */
  OFFSET: 1005,

  /** 小增量 - 1050 */
  INCREMENT_SMALL: 1050,

  /** 中等增量 - 1100 */
  INCREMENT_MEDIUM: 1100,

  /** 大基数 - 200000 */
  LARGE_BASE: 200000,

  /** 大偏移 - 200100 */
  LARGE_OFFSET: 200100,

  /** 超大值 - 2100 */
  EXTRA_LARGE: 2100,
} as const;

/** 应用特定测试常量 */
export const TEST_APP_CONSTANTS = {
  // 屏幕尺寸
  /** 平板屏幕宽度 - 1024 */
  SCREEN_WIDTH_TABLET: 1024,

  // 透明度
  /** 中高透明度 - 0.75 */
  OPACITY_MEDIUM_HIGH: 0.75,

  /** 很高透明度 - 0.9 */
  OPACITY_VERY_HIGH: 0.9,

  // 计数
  /** 小计数3 - 3 */
  SMALL_COUNT_THREE: 3,

  /** 中等计数4 - 4 */
  MEDIUM_COUNT_FOUR: 4,

  /** 标准计数5 - 5 */
  STANDARD_COUNT_FIVE: 5,

  // 比例
  /** 比例值 - 6.25 */
  RATIO_VALUE: 6.25,

  /** 健康阈值 - 0.8 */
  HEALTH_THRESHOLD: 0.8,

  /** 置信度阈值 - 0.5 */
  CONFIDENCE_THRESHOLD: 0.5,

  /** 低置信度阈值 - 0.2 */
  LOW_CONFIDENCE_THRESHOLD: 0.2,

  // 时间相关常量
  /** 时间单位 - 60 */
  TIME_UNIT: 60,

  /** 毫秒基数 - 1000 */
  MILLISECOND_BASE: 1000,

  /** 每天小时数 - 24 */
  HOURS_PER_DAY: 24,

  // 百分比常量
  /** 一半百分比 - 50 */
  PERCENTAGE_HALF: 50,

  // 超时相关
  /** 超时基数 - 1000ms */
  TIMEOUT_BASE: 1000,

  /** 延迟时间 - 150ms */
  DELAY_TIME: 150,

  // 屏幕分辨率常量
  /** 标准宽度 - 1920 */
  STANDARD_WIDTH: 1920,

  /** 标准高度 - 1080 */
  STANDARD_HEIGHT: 1080,
} as const;

// ==================== 基础测试常量 ====================

/** 测试基础数字常量 */
export const TEST_BASE_NUMBERS = {
  // 时间相关
  MILLISECONDS_PER_SECOND: 1000,
  SECONDS_PER_MINUTE: 60,
  MINUTES_PER_HOUR: 60,
  HOURS_PER_DAY: 24,
  TWENTY_FIVE_HOURS: 25,

  // 计数相关
  SMALL_COUNT: 2,
  MEDIUM_COUNT: 5,
  LARGE_COUNT: 10,
  VERY_LARGE_COUNT: 20,
  HUGE_COUNT: 25,

  // 数学运算
  DIVISION_BY_TWO: 2,

  // 百分比
  PERCENTAGE_FULL: 100,
  HALF_PERCENTAGE: 50,

  // 角度
  FULL_CIRCLE_DEGREES: 360,
  RIGHT_ANGLE_DEGREES: 90,

  // 浮点数测试
  FLOAT_DECIMAL_ONE: 0.1,
  FLOAT_DECIMAL_TWO: 0.2,

  // 内存大小（MB）
  MEMORY_SIZE_50MB: 50,
  MEMORY_SIZE_100MB: 100,
  MEMORY_SIZE_200MB: 200,

  // 字节转换
  BYTES_PER_KB: 1024,
} as const;

/** 测试超时常量 (毫秒) */
export const TEST_TIMEOUT_CONSTANTS = {
  /** 标准测试超时 - 1000ms */
  STANDARD: TEST_BASE_NUMBERS.MILLISECONDS_PER_SECOND,

  /** 扩展测试超时 - 1100ms */
  EXTENDED: TEST_BASE_NUMBERS.MILLISECONDS_PER_SECOND + 100,

  /** 快速测试超时 - 500ms */
  QUICK: 500,

  /** 长测试超时 - 5000ms */
  LONG: 5000,

  /** 极长测试超时 - 10000ms */
  VERY_LONG: 10000,

  /** 网络测试超时 - 3000ms */
  NETWORK: 3000,

  /** 短延迟 - 100ms */
  SHORT_DELAY: 100,

  /** 中等延迟 - 250ms */
  MEDIUM_DELAY: 250,

  /** 长延迟 - 500ms */
  LONG_DELAY: 500,
} as const;

/** 测试迭代和计数常量 */
export const TEST_COUNT_CONSTANTS = {
  /** 微小计数 - 3 */
  TINY: 3,

  /** 小计数 - 2 */
  SMALL: TEST_BASE_NUMBERS.SMALL_COUNT,

  /** 中等计数 - 5 */
  MEDIUM: TEST_BASE_NUMBERS.MEDIUM_COUNT,

  /** 大计数 - 10 */
  LARGE: TEST_BASE_NUMBERS.LARGE_COUNT,

  /** 超大计数 - 20 */
  VERY_LARGE: TEST_BASE_NUMBERS.VERY_LARGE_COUNT,

  /** 巨大计数 - 25 */
  HUGE: TEST_BASE_NUMBERS.HUGE_COUNT,

  /** 完整百分比 - 100 */
  PERCENTAGE_FULL: TEST_BASE_NUMBERS.PERCENTAGE_FULL,

  /** 最大标签数 - 5 */
  MAX_TAGS: TEST_BASE_NUMBERS.MEDIUM_COUNT,
} as const;

/** 测试计数常量 (简化版本，向后兼容) */
export const TEST_COUNTS = {
  /** 小计数 - 3 */
  SMALL: 3,

  /** 中等计数 - 5 */
  MEDIUM: 5,

  /** 大计数 - 10 */
  LARGE: 10,

  /** 批处理大小 - 20 */
  BATCH_SIZE: 20,

  /** 小循环计数 - 1 */
  SMALL_LOOP: 1,
} as const;

/** 测试百分比常量 */
export const TEST_PERCENTAGE_CONSTANTS = {
  /** 完整 - 100% */
  FULL: TEST_BASE_NUMBERS.PERCENTAGE_FULL,

  /** 一半 - 50% */
  HALF: TEST_BASE_NUMBERS.HALF_PERCENTAGE,
} as const;

/** 测试时间戳常量 */
export const TEST_TIMESTAMP_CONSTANTS = {
  /** 基础时间戳 - 1000 */
  BASE: TEST_BASE_NUMBERS.MILLISECONDS_PER_SECOND,

  /** 时间戳偏移 - 1005 */
  OFFSET: 1005,

  /** 时间戳增量 - 1010 */
  INCREMENT: 1010,

  /** 时间戳差值 - 1020 */
  DELTA: 1020,

  /** 时间戳步长 - 1050 */
  STEP: 1050,

  /** 时间戳间隔 - 1100 */
  INTERVAL: 1100,

  /** 大数值偏移 - 200100 */
  LARGE_OFFSET: 200100,
} as const;

// ==================== UI测试常量 ====================

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

/** 测试角度常量 */
export const TEST_ANGLE_CONSTANTS = {
  /** 完整圆周 - 360度 */
  FULL_CIRCLE: TEST_BASE_NUMBERS.FULL_CIRCLE_DEGREES,

  /** 半圆 - 180度 */
  HALF_CIRCLE:
    TEST_BASE_NUMBERS.FULL_CIRCLE_DEGREES / TEST_BASE_NUMBERS.DIVISION_BY_TWO,

  /** 直角 - 90度 */
  RIGHT_ANGLE: TEST_BASE_NUMBERS.RIGHT_ANGLE_DEGREES,
} as const;

/** 测试对比度常量 */
export const TEST_CONTRAST_CONSTANTS = {
  /** 最小对比度 - 1 */
  MINIMUM: 1,

  /** 低对比度阈值 - 2 */
  LOW_THRESHOLD: TEST_BASE_NUMBERS.SMALL_COUNT,

  /** 中等对比度阈值 - 5 */
  MEDIUM_THRESHOLD: TEST_BASE_NUMBERS.MEDIUM_COUNT,

  /** 高对比度阈值 - 10 */
  HIGH_THRESHOLD: TEST_BASE_NUMBERS.LARGE_COUNT,

  /** 精度位数 - 2 */
  PRECISION_DIGITS: 2,
} as const;

// 测试屏幕尺寸常量已移动到 test-ui-constants.ts

// 测试内容限制常量已移动到 test-ui-constants.ts

/** 测试动画缓动常量 */
export const TEST_EASING_CONSTANTS = {
  /** 缓动测试点 - 0.25 */
  QUARTER_POINT: 0.25,

  /** 缓动测试点 - 0.5 */
  HALF_POINT: 0.5,

  /** 缓动测试点 - 0.75 */
  THREE_QUARTER_POINT: 0.75,
} as const;

// 测试样本常量和特殊常量已移动到 test-ui-constants.ts

/** 测试性能监控常量 */
export const TEST_PERFORMANCE_MONITORING = {
  /** CLS警告阈值 - 0.1 */
  CLS_WARNING_THRESHOLD: 0.1,

  /** CLS严重阈值 - 0.25 */
  CLS_CRITICAL_THRESHOLD: 0.25,

  /** FID良好阈值 - 100ms */
  FID_GOOD_THRESHOLD: 100,

  /** FID需要改进阈值 - 300ms */
  FID_NEEDS_IMPROVEMENT_THRESHOLD: 300,

  /** LCP良好阈值 - 2500ms */
  LCP_GOOD_THRESHOLD: 2500,

  /** LCP需要改进阈值 - 4000ms */
  LCP_NEEDS_IMPROVEMENT_THRESHOLD: 4000,

  /** 性能监控采样率 - 0.1 */
  MONITORING_SAMPLE_RATE: 0.1,

  /** 性能报告间隔 - 30000ms */
  REPORTING_INTERVAL: 30000,

  /** 性能数据缓存大小 - 100 */
  CACHE_SIZE: 100,

  /** 性能阈值检查间隔 - 5000ms */
  THRESHOLD_CHECK_INTERVAL: 5000,
} as const;

/** 主题分析常量 */
export const THEME_ANALYTICS_CONSTANTS = {
  /** 主题切换延迟 - 400ms */
  THEME_SWITCH_DELAY: 400,

  /** 主题分析采样率 - 0.1 */
  ANALYTICS_SAMPLE_RATE: 0.1,

  /** 主题数据缓存大小 - 50 */
  CACHE_SIZE: 50,

  /** 主题切换超时 - 1000ms */
  SWITCH_TIMEOUT: 1000,

  /** 完整采样率 - 1.0 */
  SAMPLING_RATE_FULL: 1.0,

  /** 默认最大数据点 - 100 */
  MAX_DATA_POINTS_DEFAULT: 100,

  /** 默认性能阈值 - 500ms */
  PERFORMANCE_THRESHOLD_DEFAULT: 500,
} as const;

// ==================== 性能测试常量 ====================
// Web Vitals 常量已移动到 test-web-vitals-constants.ts

// ==================== 统一导出对象 ====================

/**
 * 统一的测试常量对象
 * 提供所有测试常量的集中访问点
 */
export const TEST_CONSTANTS = {
  // 基础常量
  BASE: TEST_BASE_NUMBERS,
  COUNT: TEST_COUNT_CONSTANTS,
  PERCENTAGE: TEST_PERCENTAGE_CONSTANTS,
  TIMEOUT: TEST_TIMEOUT_CONSTANTS,
  TIMESTAMP: TEST_TIMESTAMP_CONSTANTS,

  // UI常量
  ANGLE: TEST_ANGLE_CONSTANTS,
  CONTENT: TEST_CONTENT_LIMITS,
  CONTRAST: TEST_CONTRAST_CONSTANTS,
  EASING: TEST_EASING_CONSTANTS,
  OPACITY: TEST_OPACITY_CONSTANTS,
  PERFORMANCE_MONITORING: TEST_PERFORMANCE_MONITORING,
  SAMPLE: TEST_SAMPLE_CONSTANTS,
  SCREEN: TEST_SCREEN_CONSTANTS,
  SPECIAL: TEST_SPECIAL_CONSTANTS,

  // 性能常量
  WEB_VITALS: WEB_VITALS_CONSTANTS,
  WEB_VITALS_DIAGNOSTICS: TEST_WEB_VITALS_DIAGNOSTICS,

  // 应用常量（从外部导入）
  APP: TEST_APP_CONSTANTS,
  TIME: TEST_TIME_CALCULATIONS,
  DELAY: TEST_DELAY_VALUES,
  PERFORMANCE_TIMESTAMPS: TEST_PERFORMANCE_TIMESTAMPS,
} as const;

// 兼容旧版测试用到的下划线命名
export const _TEST_CONSTANTS = TEST_CONSTANTS;
export const _WEB_VITALS_CONSTANTS = WEB_VITALS_CONSTANTS;

// ==================== 单独导出常用常量 ====================

// 导出常用的测试常量以便直接使用
export {
  TEST_CONTENT_LIMITS,
  TEST_SAMPLE_CONSTANTS,
  TEST_SCREEN_CONSTANTS,
  TEST_SPECIAL_CONSTANTS,
} from './test-ui-constants';

// 导出Web Vitals相关常量
export {
  TEST_WEB_VITALS_DIAGNOSTICS,
  WEB_VITALS_CONSTANTS,
} from './test-web-vitals-constants';
