/**
 * 语言存储系统对象操作工具函数
 * Locale Storage System Object Utility Functions
 */

import { safeGetProperty, safeSetProperty } from '@/lib/security-object-access';
import { hasOwn } from '@/lib/security/object-guards';

/**
 * 深度克隆对象
 * Deep clone object
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime()) as unknown as T;
  }

  if (obj instanceof Array) {
    return obj.map((item) => deepClone(item)) as unknown as T;
  }

  if (typeof obj === 'object') {
    const src = obj as unknown as Record<string, unknown>;
    const entries = Object.keys(src).map((key) => {
      const value = safeGetProperty(src, key);
      return [key, deepClone(value as unknown)] as const;
    });
    return Object.fromEntries(entries) as unknown as T;
  }

  return obj;
}

/**
 * 合并对象
 * Merge objects
 */
export function mergeObjects<T extends Record<string, unknown>>(
  target: T,
  source: Partial<T>,
): T {
  const result = { ...target };

  for (const key in source) {
    if (!hasOwn(source, key)) continue;
    const sourceValue = safeGetProperty(source, key as string);
    if (sourceValue === undefined) continue;
    const targetValue = safeGetProperty(result, key as string);

    const isSourcePlain =
      typeof sourceValue === 'object' &&
      sourceValue !== null &&
      !Array.isArray(sourceValue);
    const isTargetPlain =
      typeof targetValue === 'object' &&
      targetValue !== null &&
      !Array.isArray(targetValue);

    if (isSourcePlain && isTargetPlain) {
      const mergedNested = mergeObjects(
        targetValue as Record<string, unknown>,
        sourceValue as Record<string, unknown>,
      );
      safeSetProperty({ obj: result, key, value: mergedNested });
      continue;
    }

    safeSetProperty({ obj: result, key, value: sourceValue });
  }

  return result;
}

/**
 * 比较对象
 * Compare objects
 */
export function compareObjects(obj1: unknown, obj2: unknown): boolean {
  if (obj1 === obj2) {
    return true;
  }

  if (obj1 === null || obj2 === null || typeof obj1 !== typeof obj2) {
    return false;
  }

  if (typeof obj1 !== 'object') {
    return obj1 === obj2;
  }

  if (Array.isArray(obj1) !== Array.isArray(obj2)) {
    return false;
  }

  if (Array.isArray(obj1) && Array.isArray(obj2)) {
    if (obj1.length !== obj2.length) {
      return false;
    }
    return obj1.every((item, index) => {
      const other = Array.isArray(obj2) ? obj2.at(index) : undefined;
      return compareObjects(item, other);
    });
  }

  const keys1 = Object.keys(obj1 as Record<string, unknown>);
  const keys2 = Object.keys(obj2 as Record<string, unknown>);

  if (keys1.length !== keys2.length) {
    return false;
  }

  return keys1.every((key) => {
    const val1 = safeGetProperty(obj1 as Record<string, unknown>, key);
    const val2 = safeGetProperty(obj2 as Record<string, unknown>, key);
    return compareObjects(val1, val2);
  });
}
