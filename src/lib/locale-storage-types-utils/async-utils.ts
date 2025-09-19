/**
 * 语言存储系统异步工具函数
 * Locale Storage System Async Utility Functions
 */

import { STORAGE_CONSTANTS } from '@/lib/locale-storage-types-base';
import { ONE, ZERO } from '@/constants';

/**
 * 节流函数
 * Throttle function
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  delay: number,
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null;
  let lastExecTime = ZERO;

  return (...args: Parameters<T>) => {
    const currentTime = Date.now();

    if (currentTime - lastExecTime > delay) {
      func(...args);
      lastExecTime = currentTime;
    } else {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(
        () => {
          func(...args);
          lastExecTime = Date.now();
        },
        delay - (currentTime - lastExecTime),
      );
    }
  };
}

/**
 * 防抖函数
 * Debounce function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  delay: number,
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

/**
 * 重试函数
 * Retry function
 */
export async function retry<T>(
  func: () => Promise<T>,
  maxAttempts: number = STORAGE_CONSTANTS.MAX_RETRY_ATTEMPTS,
  delay: number = STORAGE_CONSTANTS.RETRY_DELAY,
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = ONE; attempt <= maxAttempts; attempt++) {
    try {
      return await func();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt === maxAttempts) {
        throw lastError;
      }

      await new Promise((resolve) => setTimeout(resolve, delay * attempt));
    }
  }

  throw lastError ?? new Error('Unknown error');
}
