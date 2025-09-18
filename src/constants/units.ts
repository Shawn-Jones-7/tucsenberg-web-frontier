// 直接定义基础常量，避免循环依赖
const BYTES_PER_KB = 1024 as const;
const MAGIC_1048576 = 1048576 as const; // 1MB in bytes
const MAGIC_3600000 = 3600000 as const; // 1 hour in milliseconds

/**
 * 通用时间与容量单位常量
 */
export const SECOND_MS = 1000 as const;
export const HOUR_MS = MAGIC_3600000; // 60 * 60 * 1000

export const KB = BYTES_PER_KB;
export const MB = MAGIC_1048576; // BYTES_PER_KB * BYTES_PER_KB
