import { ANIMATION_DURATION_VERY_SLOW, BYTES_PER_KB, COUNT_PAIR, HOURS_PER_DAY, MAGIC_36, MAGIC_9, ONE, SECONDS_PER_MINUTE, ZERO } from "@/constants/magic-numbers";

/**
 * 语言存储系统格式化工具函数
 * Locale Storage System Format Utility Functions
 */

/**
 * 格式化字节大小
 * Format byte size
 */
export function formatByteSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let size = bytes;
  let unitIndex = ZERO;

  while (size >= BYTES_PER_KB && unitIndex < units.length - ONE) {
    size /= BYTES_PER_KB;
    unitIndex += ONE;
  }

  return `${size.toFixed(COUNT_PAIR)} ${units[unitIndex]}`;
}

/**
 * 格式化时间间隔
 * Format time duration
 */
export function formatDuration(milliseconds: number): string {
  const seconds = Math.floor(milliseconds / ANIMATION_DURATION_VERY_SLOW);
  const minutes = Math.floor(seconds / SECONDS_PER_MINUTE);
  const hours = Math.floor(minutes / SECONDS_PER_MINUTE);
  const days = Math.floor(hours / HOURS_PER_DAY);

  if (days > ZERO) {
    return `${days}d ${hours % HOURS_PER_DAY}h`;
  }
  if (hours > ZERO) {
    return `${hours}h ${minutes % SECONDS_PER_MINUTE}m`;
  }
  if (minutes > ZERO) {
    return `${minutes}m ${seconds % SECONDS_PER_MINUTE}s`;
  }
  return `${seconds}s`;
}

/**
 * 生成唯一ID
 * Generate unique ID
 */
export function generateUniqueId(): string {
  return `${Date.now()}_${Math.random().toString(MAGIC_36).substr(COUNT_PAIR, MAGIC_9)}`;
}
