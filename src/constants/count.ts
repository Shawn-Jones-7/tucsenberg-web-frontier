// 移除循环导入 - 直接定义基础常量，避免依赖magic-numbers
import { MINUTE_MS } from "./time";
import { DAYS_PER_WEEK } from "./time";
import { ALERT_SYSTEM_CONSTANTS } from "./performance-constants";
import { FILE_SECURITY_CONSTANTS } from "./security-constants";
import { WEB_VITALS_CONSTANTS } from "./test-web-vitals-constants";

// 基础常量直接定义，避免循环依赖
const ANGLE_90_DEG = 90 as const;
const ONE = 1 as const;
const TEN_SECONDS_MS = 10000 as const;
const ZERO = 0 as const;

const RANDOM_ID_BASE = ALERT_SYSTEM_CONSTANTS.RANDOM_ID_BASE;
const FILENAME_MAX_LENGTH = FILE_SECURITY_CONSTANTS.FILENAME_MAX_LENGTH;
const TEST_DOM_INTERACTIVE = WEB_VITALS_CONSTANTS.TEST_DOM_INTERACTIVE;

/**
 * 计数相关常量
 *
 * 🎯 用途：基础计数、数量限制等数值常量
 * 📊 覆盖：常用的计数和数量相关常量
 */

// ============================================================================
// 基础计数常量
// ============================================================================

export const COUNT_ZERO = 0 as const;
export const COUNT_ONE = 1 as const;
export const COUNT_TWO = 2 as const;
export const COUNT_THREE = 3 as const;
export const COUNT_4 = 4 as const;
export const COUNT_FOUR = 4 as const;
export const COUNT_FIVE = 5 as const;
export const COUNT_SIX = 6 as const;
export const COUNT_SEVEN = 7 as const;
export const COUNT_EIGHT = 8 as const;
export const COUNT_NINE = 9 as const;
export const COUNT_TEN = 10 as const;
export const COUNT_14 = 14 as const;

// ============================================================================
// 特殊计数别名
// ============================================================================

export const COUNT_PAIR = 2 as const;
export const COUNT_TRIPLE = 3 as const;
export const COUNT_QUAD = 4 as const;

// ============================================================================
// 常用数值常量
// ============================================================================

export const MAGIC_6 = 6 as const;
export const MAGIC_8 = 8 as const;
export const MAGIC_9 = 9 as const;
export const MAGIC_12 = 12 as const;
export const MAGIC_15 = 15 as const;
export const MAGIC_16 = 16 as const;
export const MAGIC_17 = 17 as const;
export const MAGIC_18 = 18 as const;
export const MAGIC_20 = 20 as const;
export const MAGIC_22 = 22 as const;
export const COUNT_23 = 23 as const;
export const MAGIC_32 = 32 as const;
export const COUNT_35 = 35 as const;
export const MAGIC_36 = 36 as const;
export const MAGIC_40 = 40 as const;
export const COUNT_45 = 45 as const;
export const MAGIC_48 = 48 as const;
export const MAGIC_64 = 64 as const;
export const MAGIC_70 = 70 as const;
export const MAGIC_72 = 72 as const;
export const MAGIC_75 = 75 as const;
export const MAGIC_80 = 80 as const;
export const MAGIC_85 = 85 as const;
export const MAGIC_90 = 90 as const;
export const MAGIC_95 = 95 as const;
export const MAGIC_99 = 99 as const;
export const COUNT_120 = 120 as const;
export const COUNT_160 = 160 as const;
export const COUNT_250 = 250 as const;
export const COUNT_256 = 256 as const;
export const COUNT_368 = 368 as const;
export const COUNT_450 = 450 as const;
export const MAGIC_512 = 512 as const;
export const COUNT_700 = 700 as const;
export const COUNT_800 = 800 as const;

// ============================================================================
// 大数值常量
// ============================================================================

export const MAGIC_131 = 131 as const;
export const MAGIC_132 = 132 as const;
export const MAGIC_133 = 133 as const;
export const MAGIC_136 = 136 as const;
export const MAGIC_190 = 190 as const;
export const MAGIC_255 = 255 as const;
export const MAGIC_256 = 256 as const;
export const MAGIC_368 = 368 as const;
export const MAGIC_429 = 429 as const;
export const MAGIC_600 = 600 as const;
export const MAGIC_800 = 800 as const;
export const MAGIC_999 = 999 as const;
export const COUNT_1536 = 1536 as const;
export const COUNT_1600 = 1600 as const;
export const MAGIC_1800 = 1800 as const;
export const MAGIC_2000 = 2000 as const;
export const MAGIC_2500 = 2500 as const;
export const COUNT_3600 = 3600 as const;
export const MAGIC_4000 = 4000 as const;
export const MAGIC_4096 = 4096 as const;
export const COUNT_6000 = 6000 as const;
export const COUNT_7000 = 7000 as const;
export const COUNT_8000 = 8000 as const;
export const COUNT_9000 = 9000 as const;
export const MAGIC_10000 = 10000 as const;
export const COUNT_12000 = 12000 as const;
export const COUNT_15000 = 15000 as const;
export const COUNT_45000 = 45000 as const;
export const COUNT_100000 = 100000 as const;
export const COUNT_125000 = 125000 as const;
export const COUNT_200000 = 200000 as const;
export const COUNT_300000 = 300000 as const;

// ============================================================================
// WhatsApp API 错误码
// ============================================================================

export const MAGIC_131000 = 131000 as const;
export const MAGIC_131005 = 131005 as const;
export const MAGIC_131008 = 131008 as const;
export const MAGIC_131009 = 131009 as const;
export const MAGIC_131014 = 131014 as const;
export const MAGIC_131016 = 131016 as const;
export const MAGIC_131021 = 131021 as const;
export const MAGIC_131026 = 131026 as const;
export const MAGIC_131047 = 131047 as const;
export const MAGIC_131051 = 131051 as const;
export const MAGIC_131052 = 131052 as const;
export const MAGIC_131053 = 131053 as const;

// ============================================================================
// 大容量数值
// ============================================================================

export const MAGIC_60000 = 60000 as const;
export const MAGIC_300000 = 300000 as const;
export const MAGIC_1048576 = 1048576 as const; // 1MB in bytes
export const MAGIC_3600000 = 3600000 as const; // 1 hour in milliseconds
