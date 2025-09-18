import { ZERO } from "@/constants";

/**
 * 安全对象访问工具库
 * Security Object Access Utilities
 *
 * 防止对象注入攻击的统一工具函数集合
 * Unified utility functions to prevent object injection attacks
 */

// 此文件专门用于安全对象访问，内部的动态访问是经过安全验证的

/**
 * 通用安全对象属性访问函数
 * Generic safe object property access function
 *
 * @param obj - 要访问的对象
 * @param key - 属性键
 * @param allowedKeys - 允许的键白名单（可选）
 * @returns 属性值或undefined
 */
export function safeGetProperty<T extends object>(
  obj: T,
  key: string | number | symbol,
  allowedKeys?: readonly (string | number | symbol)[],
): T[keyof T] | undefined {
  // 如果提供了白名单，进行验证
  if (allowedKeys && !allowedKeys.includes(key)) {
    return undefined;
  }

  // 安全的属性访问
  if (Object.prototype.hasOwnProperty.call(obj, key)) {
    return obj[key as keyof T];
  }
  return undefined;
}

/**
 * 通用安全对象属性设置函数
 * Generic safe object property setter function
 *
 * @param obj - 要设置属性的对象
 * @param key - 属性键
 * @param value - 要设置的值
 * @param allowedKeys - 允许的键白名单（可选）
 * @returns 是否设置成功
 */
export function safeSetProperty<T extends object>(params: {
  obj: T;
  key: string | number | symbol;
  value: unknown;
  allowedKeys?: readonly (string | number | symbol)[];
}): boolean {
  const { obj, key, value, allowedKeys } = params;
  // 如果提供了白名单，进行验证
  if (allowedKeys && !allowedKeys.includes(key)) {
    return false;
  }

  // 安全的属性设置
  try {
    Object.defineProperty(obj, key, {
      value,
      writable: true,
      enumerable: true,
      configurable: true,
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * 安全的语言配置访问（专用于i18n）
 * Safe language config access (specific for i18n)
 */
export function safeGetLanguageConfig(
  languageConfig: Record<string, unknown>,
  locale: string,
) {
  // 白名单验证 - 只允许已知的locale值
  const allowedLocales = ['en', 'zh'] as const;
  type AllowedLocale = (typeof allowedLocales)[number];

  if (!allowedLocales.includes(locale as AllowedLocale)) {
    // 返回默认配置（英文）
    return safeGetProperty(languageConfig, 'en');
  }

  return safeGetProperty(languageConfig, locale);
}

/**
 * 安全的路径映射访问
 * Safe path mapping access
 */
export function safeGetPathMapping<T>(
  pathMap: Record<string, T>,
  path: string,
  defaultValue: T,
): T {
  // 安全的属性访问
  if (Object.prototype.hasOwnProperty.call(pathMap, path)) {
    return pathMap[path as keyof typeof pathMap] ?? defaultValue;
  }
  return defaultValue;
}

/**
 * 安全的配置对象访问
 * Safe config object access
 */
export function safeGetConfig<T extends Record<string, unknown>>(
  config: T,
  key: string,
  allowedKeys: readonly string[],
): T[keyof T] | undefined {
  return safeGetProperty(config, key, allowedKeys);
}

/**
 * 安全的嵌套对象访问
 * Safe nested object access
 */
export function safeGetNestedProperty(
  obj: Record<string, unknown>,
  path: string[],
  allowedKeys?: readonly string[],
): unknown {
  let current: unknown = obj;

  for (const key of path) {
    if (current && typeof current === 'object') {
      // 如果提供了白名单，进行验证
      if (allowedKeys && !allowedKeys.includes(key)) {
        return undefined;
      }

      const currentObj = current as Record<string, unknown>;
      if (Object.prototype.hasOwnProperty.call(currentObj, key)) {
        current = currentObj[key as keyof typeof currentObj];
      } else {
        return undefined;
      }
    } else {
      return undefined;
    }
  }

  return current;
}

/**
 * 安全的数组索引访问
 * Safe array index access
 */
export function safeGetArrayItem<T>(
  array: readonly T[],
  index: number,
): T | undefined {
  if (Array.isArray(array) && index >= ZERO && index < array.length) {
    // 使用 Object.getOwnPropertyDescriptor 进行安全访问
    const descriptor = Object.getOwnPropertyDescriptor(array, index);
    return descriptor ? descriptor.value : undefined;
  }
  return undefined;
}

/**
 * 安全的对象键遍历
 * Safe object key iteration
 */
export function safeIterateObject<T extends Record<string, unknown>>(
  obj: T,
  callback: (key: string, value: T[keyof T]) => void,
  allowedKeys?: readonly string[],
): void {
  for (const key of Object.keys(obj)) {
    // 如果提供了白名单，进行验证
    if (allowedKeys && !allowedKeys.includes(key)) {
      continue;
    }

    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      callback(key, obj[key as keyof T]);
    }
  }
}

/**
 * 创建安全的对象访问器
 * Create safe object accessor
 */
export function createSafeAccessor<T extends Record<string, unknown>>(
  obj: T,
  allowedKeys: readonly string[],
) {
  return {
    get: (key: string) => safeGetProperty(obj, key, allowedKeys),
    has: (key: string) =>
      allowedKeys.includes(key) &&
      Object.prototype.hasOwnProperty.call(obj, key),
    keys: () => Object.keys(obj).filter((key) => allowedKeys.includes(key)),
  };
}

/**
 * 验证对象键的安全性
 * Validate object key safety
 */
export function isKeySafe(
  key: string,
  allowedKeys: readonly string[],
): boolean {
  return allowedKeys.includes(key);
}

/**
 * 安全的对象合并
 * Safe object merge
 */
export function safeMergeObjects<T extends Record<string, unknown>>(
  target: T,
  source: Record<string, unknown>,
  allowedKeys: readonly string[],
): T {
  const result = { ...target };

  for (const key of Object.keys(source)) {
    if (
      allowedKeys.includes(key) &&
      Object.prototype.hasOwnProperty.call(source, key)
    ) {
      // 使用 Object.defineProperty 进行安全设置
      const sourceValue = Object.getOwnPropertyDescriptor(source, key)?.value;
      if (sourceValue !== undefined) {
        Object.defineProperty(result, key, {
          value: sourceValue,
          writable: true,
          enumerable: true,
          configurable: true,
        });
      }
    }
  }

  return result;
}

/**
 * 常用的白名单配置
 * Common whitelist configurations
 */
export const COMMON_WHITELISTS = {
  LOCALES: ['en', 'zh'] as const,
  PAGE_TYPES: [
    'home',
    'about',
    'contact',
    'blog',
    'products',
    'diagnostics',
    'services',
    'pricing',
    'support',
    'privacy',
    'terms',
  ] as const,
  THEME_MODES: ['light', 'dark', 'system'] as const,
  DETECTION_SOURCES: ['user', 'geo', 'browser'] as const,
} as const;
