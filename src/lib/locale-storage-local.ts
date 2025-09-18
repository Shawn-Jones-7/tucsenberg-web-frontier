import { MAGIC_0_8 } from "@/constants/decimal";
import { BYTES_PER_KB, COUNT_FIVE, ZERO } from '@/constants';



/**
 * LocalStorage 操作工具类
 * LocalStorage management utility class
 */
export class LocalStorageManager {
  /**
   * 设置 LocalStorage 项
   * Set item in localStorage
   */
  static set(key: string, value: unknown): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // 静默处理localStorage错误，避免在生产环境中输出日志
      if (process.env.NODE_ENV === 'development') {
        // 在开发环境中可以使用调试器或其他日志方案
        // console.warn('Failed to save to localStorage:', error);
      }
    }
  }

  /**
   * 获取 LocalStorage 项
   * Get item from localStorage
   */
  static get<T>(key: string): T | null {
    if (typeof window === 'undefined') return null;
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch {
      // 静默处理localStorage错误，避免在生产环境中输出日志
      if (process.env.NODE_ENV === 'development') {
        // 在开发环境中可以使用调试器或其他日志方案
        // console.warn('Failed to read from localStorage:', error);
      }
      return null;
    }
  }

  /**
   * 删除 LocalStorage 项
   * Remove item from localStorage
   */
  static remove(key: string): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(key);
    } catch {
      // 静默处理localStorage错误，避免在生产环境中输出日志
      if (process.env.NODE_ENV === 'development') {
        // 在开发环境中可以使用调试器或其他日志方案
        // console.warn('Failed to remove from localStorage:', error);
      }
    }
  }

  /**
   * 检查 LocalStorage 项是否存在
   * Check if item exists in localStorage
   */
  static exists(key: string): boolean {
    if (typeof window === 'undefined') return false;
    try {
      return localStorage.getItem(key) !== null;
    } catch {
      return false;
    }
  }

  /**
   * 获取所有 LocalStorage 项
   * Get all localStorage items
   */
  static getAll(): Record<string, unknown> {
    if (typeof window === 'undefined') return {};
    const entries: Array<[string, unknown]> = [];

    try {
      for (let i = ZERO; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!key) continue;
        const value = this.get(key);
        if (value !== null) entries.push([key, value]);
      }
    } catch {
      if (process.env.NODE_ENV === 'development') {
        // console.warn('Failed to get all localStorage items:', error);
      }
    }
    return Object.fromEntries(entries);
  }

  /**
   * 清除所有 LocalStorage 项
   * Clear all localStorage items
   */
  static clear(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.clear();
    } catch {
      if (process.env.NODE_ENV === 'development') {
        // console.warn('Failed to clear localStorage:', error);
      }
    }
  }

  /**
   * 获取 LocalStorage 使用的存储空间大小
   * Get localStorage usage size in bytes
   */
  static getUsageSize(): number {
    if (typeof window === 'undefined') return ZERO;

    let totalSize = ZERO;

    try {
      for (let i = ZERO; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!key) continue;
        const value = localStorage.getItem(key);
        if (!value) continue;
        totalSize += new Blob([key + value]).size;
      }
    } catch {
      if (process.env.NODE_ENV === 'development') {
        // console.warn('Failed to calculate localStorage usage:', error);
      }
    }

    return totalSize;
  }

  /**
   * 获取特定项的大小
   * Get size of specific item in bytes
   */
  static getItemSize(key: string): number {
    if (typeof window === 'undefined') return ZERO;

    try {
      const value = localStorage.getItem(key);
      if (!value) return ZERO;

      return new Blob([key + value]).size;
    } catch {
      return ZERO;
    }
  }

  /**
   * 检查 LocalStorage 是否可用
   * Check if localStorage is available
   */
  static isAvailable(): boolean {
    if (typeof window === 'undefined') return false;

    try {
      const testKey = '__localStorage_test__';
      const testValue = 'test';

      localStorage.setItem(testKey, testValue);
      const retrieved = localStorage.getItem(testKey);
      localStorage.removeItem(testKey);

      return retrieved === testValue;
    } catch {
      return false;
    }
  }

  /**
   * 获取 LocalStorage 剩余空间（估算）
   * Get estimated remaining localStorage space
   */
  static getRemainingSpace(): number {
    if (!this.isAvailable()) return ZERO;

    const maxSize = COUNT_FIVE * BYTES_PER_KB * BYTES_PER_KB; // 5MB 估算限制
    const usedSize = this.getUsageSize();

    return Math.max(ZERO, maxSize - usedSize);
  }

  /**
   * 检查是否接近存储限制
   * Check if approaching storage limit
   */
  static isNearLimit(threshold: number = MAGIC_0_8): boolean {
    if (!this.isAvailable()) return true;

    const maxSize = COUNT_FIVE * BYTES_PER_KB * BYTES_PER_KB; // 5MB 估算限制
    const usedSize = this.getUsageSize();

    return usedSize / maxSize > threshold;
  }

  /**
   * 设置带有过期时间的项
   * Set item with expiration time
   */
  static setWithExpiry(key: string, value: unknown, expiryMs: number): void {
    const item = {
      value,
      expiry: Date.now() + expiryMs,
    };

    this.set(key, item);
  }

  /**
   * 获取带有过期时间检查的项
   * Get item with expiry check
   */
  static getWithExpiry<T>(key: string): T | null {
    const item = this.get<{ value: T; expiry: number }>(key);

    if (!item) return null;

    // 检查是否过期
    if (Date.now() > item.expiry) {
      this.remove(key);
      return null;
    }

    return item.value;
  }

  /**
   * 批量设置多个项
   * Set multiple items in batch
   */
  static setMultiple(items: Record<string, unknown>): void {
    Object.entries(items).forEach(([key, value]) => {
      this.set(key, value);
    });
  }

  /**
   * 批量获取多个项
   * Get multiple items in batch
   */
  static getMultiple<T>(keys: string[]): Record<string, T | null> {
    const entries = keys.map((key) => [key, this.get<T>(key)] as const);
    return Object.fromEntries(entries) as Record<string, T | null>;
  }

  /**
   * 批量删除多个项
   * Remove multiple items in batch
   */
  static removeMultiple(keys: string[]): void {
    keys.forEach((key) => {
      this.remove(key);
    });
  }

  /**
   * 按前缀获取项
   * Get items by key prefix
   */
  static getByPrefix<T>(prefix: string): Record<string, T> {
    const entries: Array<[string, T]> = [];

    if (typeof window === 'undefined') return {} as Record<string, T>;

    try {
      for (let i = ZERO; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!key || !key.startsWith(prefix)) continue;
        const value = this.get<T>(key);
        if (value !== null) entries.push([key, value]);
      }
    } catch {
      if (process.env.NODE_ENV === 'development') {
        // console.warn('Failed to get items by prefix:', error);
      }
    }
    return Object.fromEntries(entries) as Record<string, T>;
  }

  /**
   * 按前缀删除项
   * Remove items by key prefix
   */
  static removeByPrefix(prefix: string): void {
    if (typeof window === 'undefined') return;

    const keysToRemove: string[] = [];

    try {
      for (let i = ZERO; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(prefix)) keysToRemove.push(key);
      }

      keysToRemove.forEach((key) => this.remove(key));
    } catch {
      if (process.env.NODE_ENV === 'development') {
        // console.warn('Failed to remove items by prefix:', error);
      }
    }
  }
}
