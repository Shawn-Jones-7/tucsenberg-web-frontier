import {
  ANIMATION_DURATION_VERY_SLOW,
  BYTES_PER_KB,
  COUNT_FIVE,
  COUNT_PAIR,
  COUNT_TEN,
  COUNT_TRIPLE,
  ONE,
  PERCENTAGE_FULL,
  PERCENTAGE_HALF,
  PERCENTAGE_QUARTER,
  SECONDS_PER_MINUTE,
  ZERO,
} from '@/constants';
import {
  MAGIC_8,
  MAGIC_20,
  MAGIC_40,
  MAGIC_80,
  MAGIC_512,
} from '@/constants/count';
import {
  DEC_0_4,
  MAGIC_0_2,
  MAGIC_0_5,
  MAGIC_0_6,
  MAGIC_0_8,
  MAGIC_1_5,
} from '@/constants/decimal';

/**
 * 性能监控常量定义
 * Performance Monitoring Constants
 *
 * 定义性能监控相关的常量，避免魔法数字
 */

/**
 * 基础数值常量
 * Base numeric constants
 */
const BASE_CONSTANTS = {
  SECONDS_IN_MINUTE: SECONDS_PER_MINUTE,
  MS_IN_SECOND: ANIMATION_DURATION_VERY_SLOW,
  BYTES_IN_KB: BYTES_PER_KB,
  MB_MULTIPLIER: COUNT_FIVE,
} as const;

/**
 * 时间相关常量 (毫秒)
 * Time-related constants (milliseconds)
 */
export const TIME_CONSTANTS = {
  /** 一分钟的毫秒数 */
  ONE_MINUTE_MS: BASE_CONSTANTS.SECONDS_IN_MINUTE * BASE_CONSTANTS.MS_IN_SECOND,
  /** 默认时间窗口 (1分钟) */
  DEFAULT_TIME_WINDOW_MS:
    BASE_CONSTANTS.SECONDS_IN_MINUTE * BASE_CONSTANTS.MS_IN_SECOND,
} as const;

/**
 * 性能阈值常量
 * Performance threshold constants
 */
export const PERFORMANCE_THRESHOLDS = {
  /** 组件渲染时间阈值 (毫秒) */
  COMPONENT: {
    /** 默认渲染时间阈值 */
    DEFAULT_RENDER_TIME: PERCENTAGE_FULL,
    /** 良好渲染时间阈值 */
    GOOD_RENDER_TIME: PERCENTAGE_HALF,
  },
  /** 网络请求阈值 (毫秒) */
  NETWORK: {
    /** 默认响应时间阈值 */
    DEFAULT_RESPONSE_TIME: 1000,
    /** 良好响应时间阈值 */
    GOOD_RESPONSE_TIME: 500,
  },
  /** 打包大小阈值 (字节) */
  BUNDLE: {
    /** 默认大小阈值 (1MB) */
    DEFAULT_SIZE: BASE_CONSTANTS.BYTES_IN_KB * BASE_CONSTANTS.BYTES_IN_KB,
    /** 大文件阈值 (5MB) */
    LARGE_SIZE:
      BASE_CONSTANTS.MB_MULTIPLIER *
      BASE_CONSTANTS.BYTES_IN_KB *
      BASE_CONSTANTS.BYTES_IN_KB,
  },
} as const;

/**
 * 性能评分常量
 * Performance scoring constants
 */
export const SCORING_CONSTANTS = {
  /** 完美评分 */
  PERFECT_SCORE: PERCENTAGE_FULL,
  /** 优秀评分 */
  EXCELLENT_SCORE: MAGIC_80,
  /** 良好评分 */
  GOOD_SCORE: SECONDS_PER_MINUTE,
  /** 一般评分 */
  FAIR_SCORE: MAGIC_40,
  /** 差评分 */
  POOR_SCORE: MAGIC_20,

  /** 评分权重 */
  WEIGHTS: {
    COMPONENT: DEC_0_4,
    NETWORK: DEC_0_4,
    BUNDLE: MAGIC_0_2,
  },

  /** 性能倍数阈值 */
  MULTIPLIERS: {
    /** 0.5倍阈值 - 优秀 */
    EXCELLENT_MULTIPLIER: MAGIC_0_5,
    /** 0.6倍阈值 - 良好 */
    GOOD_MULTIPLIER: MAGIC_0_6,
    /** 1.0倍阈值 - 及格 */
    PASSING_MULTIPLIER: ONE,
    /** 1.5倍阈值 - 一般 */
    FAIR_MULTIPLIER: MAGIC_1_5,
    /** 2.0倍阈值 - 差 */
    POOR_MULTIPLIER: COUNT_PAIR,
    /** 3.0倍阈值 - 很差 */
    VERY_POOR_MULTIPLIER: COUNT_TRIPLE,
  },
} as const;

/**
 * 数据分析常量
 * Data analysis constants
 */
export const ANALYSIS_CONSTANTS = {
  /** 最小数据点数量 */
  MIN_DATA_POINTS: COUNT_PAIR,
  /** 趋势变化阈值 (百分比) */
  TREND_CHANGE_THRESHOLD: COUNT_FIVE,
  /** 最大显示项目数量 */
  MAX_DISPLAY_ITEMS: COUNT_FIVE,
  /** 大量指标阈值 */
  HIGH_METRICS_THRESHOLD: PERCENTAGE_FULL,
} as const;

/**
 * Bundle分析常量
 * Bundle analysis constants
 */
export const BUNDLE_CONSTANTS = {
  /** 显示项目数量 */
  TOP_ITEMS_COUNT: COUNT_TEN,
  /** 最大显示项目数量 */
  MAX_DISPLAY_ITEMS: COUNT_FIVE,
  /** 小文件阈值 (512 bytes) */
  SMALL_FILE_THRESHOLD: MAGIC_512,
  /** 压缩比例阈值 */
  COMPRESSION_RATIO_THRESHOLD: MAGIC_0_8,
  /** 分割倍数 */
  SPLIT_MULTIPLIER: COUNT_PAIR,
  /** 大文件百分比阈值 */
  LARGE_FILE_PERCENTAGE: PERCENTAGE_HALF,
  /** 超大文件阈值倍数 */
  HUGE_FILE_MULTIPLIER: PERCENTAGE_QUARTER,
  /** 字节转换基数 */
  BYTE_CONVERSION_BASE: MAGIC_8,
  /** 模块大小估算值 */
  ESTIMATED_MODULE_SIZE: ANIMATION_DURATION_VERY_SLOW,
} as const;

/**
 * 默认值常量
 * Default value constants
 */
export const DEFAULT_VALUES = {
  /** 默认数值 */
  ZERO: ZERO as number,
  /** 默认评分 */
  DEFAULT_SCORE: PERCENTAGE_FULL as number,
} as const;
