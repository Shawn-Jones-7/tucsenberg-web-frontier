'use client';

import {
  ANIMATION_DURATION_VERY_SLOW,
  HOURS_PER_DAY,
  SECONDS_PER_MINUTE,
  ZERO,
} from '@/constants';
import { MAGIC_4096 } from '@/constants/count';
import { MAGIC_0_8 } from '@/constants/decimal';
import { CACHE_DURATIONS } from '@/constants/i18n-constants';

/**
 * Cookie 配置常量
 * Cookie configuration constants
 */
export const COOKIE_CONFIG = {
  maxAge: CACHE_DURATIONS.COOKIE_MAX_AGE / ANIMATION_DURATION_VERY_SLOW, // 转换为秒
  sameSite: 'lax' as const,
  secure:
    typeof window !== 'undefined' && window.location.protocol === 'https:',
  path: '/',
} as const;

/**
 * Cookie 操作工具类
 * Cookie management utility class
 */
export class CookieManager {
  /**
   * 设置 Cookie
   * Set cookie with options
   */
  static set(name: string, value: string, options = COOKIE_CONFIG): void {
    if (typeof document === 'undefined') return;

    const optionsStr = Object.entries(options)
      .map(([key, val]) => {
        if (key === 'maxAge') return `max-age=${val}`;
        if (key === 'sameSite') return `SameSite=${val}`;
        if (key === 'secure' && val) return 'Secure';
        if (key === 'path') return `Path=${val}`;
        return '';
      })
      .filter(Boolean)
      .join('; ');

    document.cookie = `${name}=${encodeURIComponent(value)}; ${optionsStr}`;
  }

  /**
   * 获取 Cookie 值
   * Get cookie value by name
   */
  static get(name: string): string | null {
    if (typeof document === 'undefined') return null;

    // 使用更安全的cookie解析方法
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [cookieName, ...cookieValueParts] = cookie.trim().split('=');
      if (cookieName !== name) continue;

      const cookieValue = cookieValueParts.join('=');
      if (!cookieValue) return null;

      try {
        return decodeURIComponent(cookieValue);
      } catch {
        // 静默处理URI解码错误
        if (process.env.NODE_ENV === 'development') {
          // console.warn('Failed to decode cookie value:', error);
        }
        return null;
      }
    }
    return null;
  }

  /**
   * 删除 Cookie
   * Remove cookie by name
   */
  static remove(name: string): void {
    if (typeof document === 'undefined') return;
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  }

  /**
   * 检查 Cookie 是否存在
   * Check if cookie exists
   */
  static exists(name: string): boolean {
    return this.get(name) !== null;
  }

  /**
   * 获取所有 Cookie
   * Get all cookies as key-value pairs
   */
  static getAll(): Record<string, string> {
    if (typeof document === 'undefined') return {};

    const map = new Map<string, string>();
    const cookieStrings = document.cookie.split(';');

    for (const cookie of cookieStrings) {
      const [name, ...valueParts] = cookie.trim().split('=');
      if (!name) continue;

      const value = valueParts.join('=');
      if (!value) continue;

      try {
        map.set(name, decodeURIComponent(value));
      } catch {
        if (process.env.NODE_ENV === 'development') {
          // console.warn(`Failed to decode cookie ${name}:`, error);
        }
      }
    }

    return Object.fromEntries(map.entries()) as Record<string, string>;
  }

  /**
   * 清除所有 Cookie
   * Clear all cookies
   */
  static clearAll(): void {
    if (typeof document === 'undefined') return;

    const cookies = this.getAll();
    Object.keys(cookies).forEach((name) => {
      this.remove(name);
    });
  }

  /**
   * 设置带有过期时间的 Cookie
   * Set cookie with expiration date
   */
  static setWithExpiry(params: {
    name: string;
    value: string;
    expiryDays: number;
    options?: Partial<typeof COOKIE_CONFIG>;
  }): void {
    const { name, value, expiryDays, options = {} } = params;
    const expiryDate = new Date();
    expiryDate.setTime(
      expiryDate.getTime() +
        expiryDays *
          HOURS_PER_DAY *
          SECONDS_PER_MINUTE *
          SECONDS_PER_MINUTE *
          ANIMATION_DURATION_VERY_SLOW,
    );

    type MutableCookieOptions = {
      secure?: boolean;
      sameSite?: 'lax' | 'strict' | 'none';
      path?: string;
      maxAge?: number;
      expires: string;
    };

    const cookieOptions: MutableCookieOptions = {
      secure: COOKIE_CONFIG.secure,
      sameSite: COOKIE_CONFIG.sameSite,
      path: COOKIE_CONFIG.path,
      maxAge: COOKIE_CONFIG.maxAge,
      expires: expiryDate.toUTCString(),
    };

    if (options) {
      if (options.secure !== undefined) cookieOptions.secure = options.secure;
      if (options.sameSite !== undefined)
        cookieOptions.sameSite = options.sameSite;
      if (options.path !== undefined) cookieOptions.path = options.path;
      if (options.maxAge !== undefined) cookieOptions.maxAge = options.maxAge;
    }

    const optionsStr = Object.entries(cookieOptions)
      .map(([key, val]) => {
        if (key === 'maxAge') return `max-age=${val}`;
        if (key === 'sameSite') return `SameSite=${val}`;
        if (key === 'secure' && val) return 'Secure';
        if (key === 'path') return `Path=${val}`;
        if (key === 'expires') return `expires=${val}`;
        return '';
      })
      .filter(Boolean)
      .join('; ');

    document.cookie = `${name}=${encodeURIComponent(value)}; ${optionsStr}`;
  }

  /**
   * 获取 Cookie 的过期时间
   * Get cookie expiration time (if available)
   */
  static getExpiry(_name: string): Date | null {
    // Note: JavaScript无法直接获取Cookie的过期时间
    // 这个方法主要用于文档完整性，实际使用中需要在设置时记录
    if (process.env.NODE_ENV === 'development') {
      console.warn(
        'Cookie expiry cannot be retrieved directly from JavaScript. ' +
          'Consider storing expiry information separately if needed.',
      );
    }
    return null;
  }

  /**
   * 检查 Cookie 是否支持
   * Check if cookies are supported
   */
  static isSupported(): boolean {
    if (typeof document === 'undefined') return false;

    try {
      const testKey = '__cookie_test__';
      const testValue = 'test';

      this.set(testKey, testValue);
      const retrieved = this.get(testKey);
      this.remove(testKey);

      return retrieved === testValue;
    } catch {
      return false;
    }
  }

  /**
   * 获取 Cookie 大小（字节）
   * Get cookie size in bytes
   */
  static getSize(name: string): number {
    const value = this.get(name);
    if (!value) return ZERO;

    // 计算 Cookie 的总大小（名称 + 值 + 分隔符）
    return new Blob([`${name}=${value}`]).size;
  }

  /**
   * 获取所有 Cookie 的总大小
   * Get total size of all cookies
   */
  static getTotalSize(): number {
    if (typeof document === 'undefined') return ZERO;

    return new Blob([document.cookie]).size;
  }

  /**
   * 检查是否接近 Cookie 大小限制
   * Check if approaching cookie size limit
   */
  static isNearLimit(threshold: number = MAGIC_0_8): boolean {
    const maxSize = MAGIC_4096; // 标准 Cookie 大小限制
    const currentSize = this.getTotalSize();

    return currentSize / maxSize > threshold;
  }
}
