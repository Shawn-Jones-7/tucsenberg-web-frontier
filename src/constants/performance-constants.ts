// 自包含的常量定义，不引入未使用的外部时间单位

/**
 * 性能监控常量定义
 * 集中管理Web Vitals、性能阈值、监控间隔等相关的魔法数字
 * 遵循项目编码标准，提高代码可维护性和可读性
 */

// ==================== 基础时间常量 ====================

/** 基础时间单位常量 */
const TIME_BASE = {
  /** 毫秒每秒 */
  MS_PER_SECOND: 1000,
  /** 秒每分钟 */
  SECONDS_PER_MINUTE: 60,
  /** 分钟每小时 */
  MINUTES_PER_HOUR: 60,
} as const;

/** 基础数字常量 - 避免magic numbers */
const BASE_NUMBERS = {
  /** 基础计数 */
  TWO: 2,
  THREE: 3,
  FIVE: 5,
  TEN: 10,
  THIRTY: 30,

  /** 文件大小相关 */
  BYTES_PER_KB: 1024,

  /** 动画时间 */
  FAST_ANIMATION_MS: 150,
  STANDARD_ANIMATION_MS: 300,
  SLOW_ANIMATION_MS: 500,
} as const;

/** 时间单位常量 */
export const TIME_UNITS = {
  /** 1秒 = 1000毫秒 */
  SECOND: TIME_BASE.MS_PER_SECOND,
  /** 1分钟 = 60000毫秒 */
  MINUTE: TIME_BASE.SECONDS_PER_MINUTE * TIME_BASE.MS_PER_SECOND,
  /** 1小时 = 3600000毫秒 */
  HOUR:
    TIME_BASE.MINUTES_PER_HOUR *
    TIME_BASE.SECONDS_PER_MINUTE *
    TIME_BASE.MS_PER_SECOND,
} as const;

// ==================== Web Vitals 阈值常量 ====================

/** Core Web Vitals 性能阈值 */
export const WEB_VITALS_THRESHOLDS = {
  /** Cumulative Layout Shift (CLS) 阈值 */
  CLS: {
    /** 良好阈值: 0.1 */
    GOOD: 0.1,
    /** 需要改进阈值: 0.25 */
    NEEDS_IMPROVEMENT: 0.25,
    /** 差阈值: > 0.25 */
    POOR: 0.25,
  },

  /** First Input Delay (FID) 阈值 (毫秒) */
  FID: {
    /** 良好阈值: 100ms */
    GOOD: 100,
    /** 需要改进阈值: 300ms */
    NEEDS_IMPROVEMENT: 300,
    /** 差阈值: > 300ms */
    POOR: 300,
  },

  /** Largest Contentful Paint (LCP) 阈值 (毫秒) */
  LCP: {
    /** 良好阈值: 2500ms */
    GOOD: 2500,
    /** 需要改进阈值: 4000ms */
    NEEDS_IMPROVEMENT: 4000,
    /** 差阈值: > 4000ms */
    POOR: 4000,
  },

  /** First Contentful Paint (FCP) 阈值 (毫秒) */
  FCP: {
    /** 良好阈值: 1800ms */
    GOOD: 1800,
    /** 需要改进阈值: 3000ms */
    NEEDS_IMPROVEMENT: 3000,
    /** 差阈值: > 3000ms */
    POOR: 3000,
  },

  /** Time to First Byte (TTFB) 阈值 (毫秒) */
  TTFB: {
    /** 良好阈值: 800ms */
    GOOD: 800,
    /** 需要改进阈值: 1800ms */
    NEEDS_IMPROVEMENT: 1800,
    /** 差阈值: > 1800ms */
    POOR: 1800,
  },

  /** Interaction to Next Paint (INP) 阈值 (毫秒) */
  INP: {
    /** 良好阈值: 200ms */
    GOOD: 200,
    /** 需要改进阈值: 500ms */
    NEEDS_IMPROVEMENT: 500,
    /** 差阈值: > 500ms */
    POOR: 500,
  },
} as const;

// ==================== 性能监控间隔常量 ====================

/** 性能监控时间间隔 */
export const MONITORING_INTERVALS = {
  /** 指标更新间隔: 3秒 */
  METRICS_UPDATE: BASE_NUMBERS.THREE * TIME_UNITS.SECOND,

  /** 报告发送间隔: 5分钟 */
  REPORT_SEND: BASE_NUMBERS.FIVE * TIME_UNITS.MINUTE,

  /** 诊断检查间隔: 10秒 */
  DIAGNOSTIC_CHECK: BASE_NUMBERS.TEN * TIME_UNITS.SECOND,

  /** 缓存清理间隔: 30分钟 */
  CACHE_CLEANUP: BASE_NUMBERS.THIRTY * TIME_UNITS.MINUTE,

  /** 性能采样间隔: 1秒 */
  PERFORMANCE_SAMPLING: TIME_UNITS.SECOND,
} as const;

// ==================== 性能评分常量 ====================

/** 性能评分阈值 */
export const PERFORMANCE_SCORES = {
  /** 优秀评分阈值: 90分 */
  EXCELLENT: 90,

  /** 良好评分阈值: 80分 */
  GOOD: 80,

  /** 一般评分阈值: 70分 */
  FAIR: 70,

  /** 需要改进评分阈值: 60分 */
  NEEDS_IMPROVEMENT: 60,

  /** 差评分阈值: < 60分 */
  POOR: 60,

  /** 满分 */
  PERFECT: 100,
} as const;

// ==================== 资源性能阈值 ====================

/** 资源加载性能阈值 */
export const RESOURCE_THRESHOLDS = {
  /** 慢速资源阈值: 1000ms */
  SLOW_RESOURCE: TIME_UNITS.SECOND,

  /** 超慢资源阈值: 3000ms */
  VERY_SLOW_RESOURCE: BASE_NUMBERS.THREE * TIME_UNITS.SECOND,

  /** 大文件阈值: 1MB */
  LARGE_FILE_SIZE: BASE_NUMBERS.BYTES_PER_KB * BASE_NUMBERS.BYTES_PER_KB,

  /** 超大文件阈值: 5MB */
  VERY_LARGE_FILE_SIZE:
    BASE_NUMBERS.FIVE * BASE_NUMBERS.BYTES_PER_KB * BASE_NUMBERS.BYTES_PER_KB,
} as const;

// ==================== 监控配置常量 ====================

/** 监控配置参数 */
export const MONITORING_CONFIG = {
  /** 最大监控数据点数量 */
  MAX_DATA_POINTS: 1000,

  /** 最大错误记录数量 */
  MAX_ERROR_RECORDS: 100,

  /** 性能数据保留时间: 1小时 */
  DATA_RETENTION_TIME: TIME_UNITS.HOUR,

  /** 采样率: 10% */
  SAMPLING_RATE: 0.1,

  /** 错误采样率: 100% */
  ERROR_SAMPLING_RATE: 1.0,
} as const;

// ==================== 诊断延迟常量 ====================

/** 诊断和测试延迟 */
export const DIAGNOSTIC_DELAYS = {
  /** 诊断启动延迟: 2秒 */
  STARTUP_DELAY: BASE_NUMBERS.TWO * TIME_UNITS.SECOND,

  /** 模拟延迟: 2秒 */
  SIMULATION_DELAY: BASE_NUMBERS.TWO * TIME_UNITS.SECOND,

  /** 自动运行延迟: 1秒 */
  AUTO_RUN_DELAY: TIME_UNITS.SECOND,

  /** 重试延迟: 5秒 */
  RETRY_DELAY: BASE_NUMBERS.FIVE * TIME_UNITS.SECOND,
} as const;

// ==================== 动画和UI常量 ====================

/** UI动画时间常量 */
export const ANIMATION_DURATIONS = {
  /** 快速动画: 150ms */
  FAST: BASE_NUMBERS.FAST_ANIMATION_MS,

  /** 标准动画: 300ms */
  STANDARD: BASE_NUMBERS.STANDARD_ANIMATION_MS,

  /** 慢速动画: 500ms */
  SLOW: BASE_NUMBERS.SLOW_ANIMATION_MS,

  /** 计数器动画: 2秒 */
  COUNTER: BASE_NUMBERS.TWO * TIME_UNITS.SECOND,
} as const;

// ==================== Web Vitals 报警系统常量 ====================

/** Web Vitals 报警系统常量 */
export const ALERT_SYSTEM_CONSTANTS = {
  /** 随机ID生成基数 */
  RANDOM_ID_BASE: 36,
  /** 随机ID截取起始位置 */
  RANDOM_ID_START: 2,
  /** 随机ID截取长度 */
  RANDOM_ID_LENGTH: 9,
} as const;

/** Web Vitals 基线管理常量 */
export const BASELINE_CONSTANTS = {
  /** CLS 基线阈值 */
  CLS_BASELINE: 0.25,
  /** CLS 基线天数 */
  CLS_BASELINE_DAYS: 30,
  /** FID 基线阈值 */
  FID_BASELINE: 0.1,
  /** FID 基线天数 */
  FID_BASELINE_DAYS: 15,
  /** LCP 基线阈值 */
  LCP_BASELINE: 4000,
  /** LCP 基线天数 */
  LCP_BASELINE_DAYS: 30,
  /** TTFB 基线阈值 */
  TTFB_BASELINE: 2500,
  /** TTFB 基线天数 */
  TTFB_BASELINE_DAYS: 15,
  /** INP 基线阈值 */
  INP_BASELINE: 300,
  /** INP 基线天数 */
  INP_BASELINE_DAYS: 30,
  /** INP 基线额外天数 */
  INP_BASELINE_EXTRA_DAYS: 15,
} as const;

// ==================== 导出所有常量 ====================

/** 性能常量集合 */
export const PERFORMANCE_CONSTANTS = {
  TIME_UNITS,
  WEB_VITALS_THRESHOLDS,
  MONITORING_INTERVALS,
  PERFORMANCE_SCORES,
  RESOURCE_THRESHOLDS,
  MONITORING_CONFIG,
  DIAGNOSTIC_DELAYS,
  ANIMATION_DURATIONS,
} as const;
