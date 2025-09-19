import {
  COUNT_4,
  COUNT_3600,
  COUNT_300000,
  MAGIC_12,
  MAGIC_2000,
} from './count';

/**
 * 时间相关常量
 *
 * 🎯 用途：时间单位、时间间隔等时间相关的常量定义
 * 📝 注意：与 @/lib/units 工具库配合使用，处理时间转换
 */

// ============================================================================
// 基础时间单位
// ============================================================================

export const DAYS_PER_WEEK = 7 as const;
export const HOURS_PER_DAY = 24 as const;
export const MINUTES_PER_HOUR = 60 as const;
export const SECONDS_PER_MINUTE = 60 as const;

// ============================================================================
// 扩展时间单位
// ============================================================================

export const DAYS_PER_MONTH = 30 as const;
export const DAYS_PER_YEAR = 365 as const;
export const MONTHS_PER_YEAR = MAGIC_12;
export const WEEKS_PER_MONTH = COUNT_4;

// ============================================================================
// 毫秒时间常量
// ============================================================================

export const MILLISECONDS_PER_SECOND = 1000;
export const SECONDS_PER_HOUR = COUNT_3600;
export const MILLISECONDS_PER_MINUTE = 60000;
export const MILLISECONDS_PER_HOUR = 3600000 as const;

// ============================================================================
// 常用时间间隔 (毫秒)
// ============================================================================

export const HALF_SECOND_MS = 500;
export const TWO_HUNDRED_MS = 200;
export const FOUR_HUNDRED_MS = 400;
export const ONE_SECOND_MS = 1000;
export const TWO_SECONDS_MS = MAGIC_2000;
export const THREE_SECONDS_MS = 3000;
export const FIVE_SECONDS_MS = 5000;
export const TEN_SECONDS_MS = 10000;
export const THIRTY_SECONDS_MS = 30000;
export const MINUTE_MS = 60000;
export const FIVE_MINUTES_MS = COUNT_300000;
