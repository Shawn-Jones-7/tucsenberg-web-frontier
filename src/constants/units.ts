import { BYTES_PER_KB, MAGIC_1048576, MAGIC_3600000, MAGIC_60000 } from '@/constants/magic-numbers';

/**
 * 通用时间与容量单位常量
 */
export const SECOND_MS = 1000 as const;
export const MINUTE_MS = MAGIC_60000; // 60 * 1000
export const HOUR_MS = MAGIC_3600000; // 60 * 60 * 1000

export const KB = BYTES_PER_KB;
export const MB = MAGIC_1048576; // BYTES_PER_KB * BYTES_PER_KB
