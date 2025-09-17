import { COUNT_FIVE, MAGIC_16, ZERO } from "@/constants/magic-numbers";

/**
 * 语言存储系统存储工具函数
 * Locale Storage System Storage Utility Functions
 */

/**
 * 工具函数
 * Utility functions
 */

/**
 * 创建存储键
 * Create storage key
 */
export function createStorageKey(prefix: string, key: string): string {
  return `${prefix}${key}`;
}

/**
 * 解析存储键
 * Parse storage key
 */
export function parseStorageKey(fullKey: string, prefix: string): string {
  return fullKey.startsWith(prefix) ? fullKey.slice(prefix.length) : fullKey;
}

/**
 * 估算存储大小
 * Estimate storage size
 */
export function estimateStorageSize(data: unknown): number {
  try {
    return new Blob([JSON.stringify(data)]).size;
  } catch {
    return ZERO;
  }
}

/**
 * 生成校验和
 * Generate checksum
 */
export function generateChecksum(data: unknown): string {
  const str = JSON.stringify(data);
  let hash = ZERO;

  for (let i = ZERO; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << COUNT_FIVE) - hash + char;
    hash = hash & hash; // 转换为32位整数
  }

  return Math.abs(hash).toString(MAGIC_16);
}
