import { COUNT_FIVE, SECONDS_PER_MINUTE } from '@/constants/magic-numbers';

/**
 * 性能监控相关常量定义
 * 用于替换代码中的魔法数字，提高可维护性
 */

export const PERFORMANCE_CONSTANTS = {
  // Bundle 大小限制 (KB)
  BUNDLE_LIMITS: {
    /** 主包大小限制 */
    MAIN_BUNDLE: 50,
    /** 框架包大小限制 */
    FRAMEWORK_BUNDLE: 130,
    /** CSS 包大小限制 */
    CSS_BUNDLE: 50,
    /** 单位转换 (KB to bytes) */
    KB_TO_BYTES: 1024,
  },

  // 监控配置
  MONITORING: {
    /** 数据收集间隔 (分钟) */
    DATA_COLLECTION_INTERVAL: COUNT_FIVE,
    /** 数据收集时长 (分钟) */
    DATA_COLLECTION_DURATION: SECONDS_PER_MINUTE,
    /** 监控间隔 (ms) */
    MONITORING_INTERVAL: 60000,
    /** 最大数据点数量 */
    MAX_DATA_POINTS: 10,
    /** 数据分页大小 */
    DATA_PAGE_SIZE: 2,
  },

  // 数据保留配置
  /** 默认数据保留时间 (ms) - COUNT_FIVE分钟 */
  DEFAULT_RETENTION_TIME: COUNT_FIVE * SECONDS_PER_MINUTE * 1000,
  /** 默认最大指标数量 */
  DEFAULT_MAX_METRICS: 1000,

  // 性能阈值
  THRESHOLDS: {
    /** Core Web Vitals 阈值 */
    CLS_GOOD: 0.1,
    LCP_GOOD: 2500,
    FID_GOOD: 100,
    /** 性能评分阈值 */
    PERFORMANCE_SCORE_GOOD: 80,
    PERFORMANCE_SCORE_NEEDS_IMPROVEMENT: 50,
  },

  // 时间相关常量
  TIME: {
    /** 超时时间 (ms) */
    TIMEOUT: 5000,
    /** 重试次数 */
    RETRY_COUNT: 3,
    /** 延迟时间 (ms) */
    DELAY: 2000,
    /** 防抖延迟 (ms) */
    DEBOUNCE_DELAY: 300,
  },
} as const;

export type PerformanceConstants = typeof PERFORMANCE_CONSTANTS;
