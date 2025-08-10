/**
 * 测试相关常量定义 - 主入口文件
 * 重新导出所有拆分的测试常量，保持向后兼容性
 * 遵循项目编码标准，提高测试代码的可维护性
 */

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
  /** 短延迟 - 100ms */
  SHORT_DELAY: 100,

  /** 中等延迟 - 300ms */
  MEDIUM_DELAY: 300,

  /** 清理延迟 - 500ms */
  CLEANUP_DELAY: 500,
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

  /** 小增量 - 1010 */
  INCREMENT_SMALL: 1010,

  /** 中等增量 - 1020 */
  INCREMENT_MEDIUM: 1020,

  /** 大基数 - 200000 */
  LARGE_BASE: 200000,

  /** 大偏移 - 200100 */
  LARGE_OFFSET: 200100,

  /** 超大值 - 300000 */
  EXTRA_LARGE: 300000,
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

  // 比例
  /** 比例值 - 6.25 */
  RATIO_VALUE: 6.25,

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

  // 百分比
  PERCENTAGE_FULL: 100,
  HALF_PERCENTAGE: 50,

  // 角度
  FULL_CIRCLE_DEGREES: 360,
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
  HALF_CIRCLE: TEST_BASE_NUMBERS.FULL_CIRCLE_DEGREES / 2,

  /** 直角 - 90度 */
  RIGHT_ANGLE: 90,
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

/** 测试屏幕尺寸常量 */
export const TEST_SCREEN_CONSTANTS = {
  /** 移动端宽度 - 768px */
  MOBILE_WIDTH: 768,

  /** 平板宽度 - 1024px */
  TABLET_WIDTH: 1024,

  /** 桌面宽度 - 1920px */
  DESKTOP_WIDTH: 1920,

  /** 标准高度 - 768px */
  STANDARD_HEIGHT: 768,
} as const;

/** 测试内容限制常量 */
export const TEST_CONTENT_LIMITS = {
  /** 标题最大长度 - 60 */
  TITLE_MAX: 60,

  /** 描述最大长度 - 160 */
  DESCRIPTION_MAX: 160,

  /** 短文本最大长度 - 20 */
  SHORT_TEXT_MAX: 20,

  /** 长文本最大长度 - 500 */
  LONG_TEXT_MAX: 500,

  /** 最大文件大小 - 1024KB */
  MAX_FILE_SIZE: 1024,

  /** 函数最大行数 - 120 */
  FUNCTION_MAX_LINES: 120,

  /** 文件最大行数 - 500 */
  FILE_MAX_LINES: 500,

  /** 最大复杂度 - 15 */
  MAX_COMPLEXITY: 15,

  /** 最大嵌套回调 - 3 */
  MAX_NESTED_CALLBACKS: 3,
} as const;

/** 测试动画缓动常量 */
export const TEST_EASING_CONSTANTS = {
  /** 缓动测试点 - 0.25 */
  QUARTER_POINT: 0.25,

  /** 缓动测试点 - 0.5 */
  HALF_POINT: 0.5,

  /** 缓动测试点 - 0.75 */
  THREE_QUARTER_POINT: 0.75,
} as const;

/** 测试数值样本常量 */
export const TEST_SAMPLE_CONSTANTS = {
  /** 小数测试值 - 123.7 */
  DECIMAL_SAMPLE: 123.7,

  /** 负小数测试值 - -5.2 */
  NEGATIVE_DECIMAL: -5.2,

  /** 零值测试 */
  ZERO_VALUE: 0,

  /** 正整数测试值 - 42 */
  POSITIVE_INTEGER: 42,

  /** 负整数测试值 - -15 */
  NEGATIVE_INTEGER: -15,

  /** 小数精度测试值 - 0.123456789 */
  PRECISION_DECIMAL: 0.123456789,

  /** 科学计数法测试值 - 1e6 */
  SCIENTIFIC_NOTATION: 1e6,

  /** 极小数值 - 0.0001 */
  VERY_SMALL_NUMBER: 0.0001,

  /** 边界值测试 - Number.MAX_SAFE_INTEGER */
  MAX_SAFE_INTEGER: Number.MAX_SAFE_INTEGER,

  /** 边界值测试 - Number.MIN_SAFE_INTEGER */
  MIN_SAFE_INTEGER: Number.MIN_SAFE_INTEGER,

  // 格式化器测试专用常量
  /** 整数样本 - 1234 */
  INTEGER_SAMPLE: 1234,

  /** 百分比样本 - 96 */
  PERCENTAGE_SAMPLE: 96,

  /** 货币样本 - 1235 */
  CURRENCY_SAMPLE: 1235,

  /** 精度样本 - 123.456 */
  PRECISION_SAMPLE: 123.456,

  /** 价格样本 - 100 */
  PRICE_SAMPLE: 100,

  /** 大整数 - 1000000 */
  LARGE_INTEGER: 1000000,
} as const;

/** 测试特殊数值常量 */
export const TEST_SPECIAL_CONSTANTS = {
  /** 十六进制大数 - 0x80000000 */
  HEX_LARGE_NUMBER: 0x80000000,

  /** 负数测试值 - -100 */
  NEGATIVE_VALUE: -100,

  /** 浮点精度测试 - 0.1 + 0.2 */
  FLOAT_PRECISION_ISSUE: 0.1 + 0.2,

  /** 无穷大 */
  POSITIVE_INFINITY: Number.POSITIVE_INFINITY,

  /** 负无穷大 */
  NEGATIVE_INFINITY: Number.NEGATIVE_INFINITY,
} as const;

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

// ==================== 性能测试常量 ====================

/** Web Vitals 性能监控相关常量 */
export const WEB_VITALS_CONSTANTS = {
  // 性能阈值 - CLS (Cumulative Layout Shift)
  CLS_GOOD_THRESHOLD: 0.1,
  CLS_NEEDS_IMPROVEMENT_THRESHOLD: 0.25,
  CLS_WARNING_CHANGE: 0.05,
  CLS_CRITICAL_CHANGE: 0.1,

  // 性能阈值 - FID (First Input Delay)
  FID_GOOD_THRESHOLD: 100,
  FID_NEEDS_IMPROVEMENT_THRESHOLD: 300,
  FID_WARNING_CHANGE: 50,
  FID_CRITICAL_CHANGE: 100,

  // 性能阈值 - LCP (Largest Contentful Paint)
  LCP_GOOD_THRESHOLD: 2500,
  LCP_NEEDS_IMPROVEMENT_THRESHOLD: 4000,
  LCP_WARNING_CHANGE: 500,
  LCP_CRITICAL_CHANGE: 1000,

  // 性能阈值 - FCP (First Contentful Paint)
  FCP_GOOD_THRESHOLD: 1800,
  FCP_NEEDS_IMPROVEMENT_THRESHOLD: 3000,
  FCP_WARNING_CHANGE: 300,
  FCP_CRITICAL_CHANGE: 600,

  // 性能阈值 - TTFB (Time to First Byte)
  TTFB_GOOD_THRESHOLD: 800,
  TTFB_NEEDS_IMPROVEMENT_THRESHOLD: 1800,
  TTFB_WARNING_CHANGE: 200,
  TTFB_CRITICAL_CHANGE: 400,

  // 性能监控配置
  MONITORING_SAMPLE_RATE: 0.1,
  REPORTING_INTERVAL: 30000,
  CACHE_SIZE: 100,
  THRESHOLD_CHECK_INTERVAL: 5000,
  PERFORMANCE_OBSERVER_BUFFER_SIZE: 150,
  METRIC_COLLECTION_TIMEOUT: 10000,

  // 网络相关
  NETWORK_DOWNLINK: 10,
  NETWORK_RTT: 50,

  // 设备相关
  DEVICE_MEMORY: 8,

  // 资源加载相关
  SLOW_RESOURCE_DURATION: 2000, // 2秒，用于测试慢资源检测
  SLOW_RESOURCE_THRESHOLD: 1000, // 1秒，慢资源阈值
  MAX_SLOW_RESOURCES: 10, // 最大慢资源数量
  MAX_SLOW_RESOURCES_PENALTY: 5, // 慢资源数量阈值
  SLOW_RESOURCE_PENALTY: 10, // 慢资源评分惩罚

  // 测试评分阈值
  TEST_SCORE_THRESHOLD_GOOD: 80,
  TEST_SCORE_THRESHOLD_POOR: 50,
  PERFECT_SCORE: 100, // 完美评分

  // 评分权重和乘数
  SCORE_WEIGHT_QUARTER: 0.25,
  SCORE_MULTIPLIER_GOOD: 15,
  SCORE_MULTIPLIER_NEEDS_IMPROVEMENT: 25,
  SCORE_MULTIPLIER_POOR: 35,

  // 回归检测百分比阈值
  PERCENT_CHANGE_WARNING: 10, // 10%变化触发警告
  PERCENT_CHANGE_CRITICAL: 25, // 25%变化触发严重警告

  // 测试用百分比和计数常量
  TEST_PERCENTAGE_FIFTY: 50,
  TEST_COUNT_TWO: 2,

  // 测试时间常量
  TEST_FETCH_START: 100,
  TEST_DOMAIN_LOOKUP_END: 150,
  TEST_CONNECT_START: 200,
  TEST_CONNECT_END: 250,
  TEST_REQUEST_START: 300,
  TEST_RESPONSE_START: 400,
  TEST_RESPONSE_END: 500,
  TEST_DOM_INTERACTIVE: 600,
  TEST_DOM_CONTENT_LOADED_START: 700,
  TEST_DOM_CONTENT_LOADED_END: 750,
  TEST_DOM_COMPLETE: 800,
  TEST_LOAD_EVENT_END: 900,

  // 网络测试常量
  TEST_DOWNLINK_SPEED: 10,
  TEST_RTT_LATENCY: 50,

  // 评分阈值常量
  GRADE_A_THRESHOLD: 90,
  GRADE_B_THRESHOLD: 80,
  GRADE_C_THRESHOLD: 70,
  GRADE_D_THRESHOLD: 60,

  // 性能监控常量
  PERFORMANCE_SAMPLE_SIZE: 50,
  BASELINE_REFRESH_HOURS: 24,
  SCORE_EXCELLENT_THRESHOLD: 90,
  SCORE_AVERAGE_THRESHOLD: 70,
  REPORT_HISTORY_LIMIT: 10,

  // 小数位数常量
  DECIMAL_PLACES_ONE: 1,
  DECIMAL_PLACES_TWO: 2,
  DECIMAL_PLACES_THREE: 3,

  // 字节转换常量
  BYTES_TO_KB_DIVISOR: 1024,

  // 时间单位常量
  MINUTES_PER_HOUR: 60,
} as const;

/** Web Vitals 诊断测试常量 */
export const TEST_WEB_VITALS_DIAGNOSTICS = {
  // 基准性能值
  CLS_BASELINE: 0.05,
  LCP_BASELINE: 2000,
  FID_BASELINE: 80,
  FCP_BASELINE: 1500,
  TTFB_BASELINE: 600,
  INP_BASELINE: 150,

  // 增量值（用于生成测试数据）
  CLS_INCREMENT: 0.01,
  LCP_INCREMENT: 100,
  FID_INCREMENT: 10,

  // 性能评分
  PERFORMANCE_SCORE: 85,

  // 历史数据时间偏移
  HISTORICAL_TIME_OFFSET: 3600000, // 1小时

  // 网络相关常量
  NETWORK_DOWNLINK: 4,
  NETWORK_RTT: 50,

  // 设备相关常量
  DEVICE_MEMORY: 8,
} as const;

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
