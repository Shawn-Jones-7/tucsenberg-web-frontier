/**
 * 安全对象属性访问守卫工具
 * 解决 security/detect-object-injection ESLint 错误
 * 提供类型安全的对象属性访问方法
 */

/* eslint-disable security/detect-object-injection */
// 此文件是安全守卫工具，内部使用受控的动态属性访问是安全的

/**
 * 安全检查对象是否拥有指定属性
 * 替代直接的 obj[key] 访问，避免对象注入风险
 */
export const hasOwn = <T extends object>(
  obj: T,
  key: PropertyKey,
): key is keyof T => {
  return Object.prototype.hasOwnProperty.call(obj, key);
};

/**
 * 安全获取对象属性值
 * 如果属性不存在，返回 undefined
 */
export const safeGet = <T extends object, K extends PropertyKey>(
  obj: T,
  key: K,
): K extends keyof T ? T[K] : undefined => {
  if (hasOwn(obj, key)) {
    return obj[key] as K extends keyof T ? T[K] : undefined;
  }
  return undefined as K extends keyof T ? T[K] : undefined;
};

/**
 * 安全获取对象属性值，带默认值
 */
export const safeGetWithDefault = <T extends object, K extends PropertyKey, D>(
  obj: T,
  key: K,
  defaultValue: D,
): (K extends keyof T ? T[K] : never) | D => {
  if (hasOwn(obj, key)) {
    return obj[key] as (K extends keyof T ? T[K] : never) | D;
  }
  return defaultValue;
};

/**
 * 安全设置对象属性值
 * 只有当属性已存在时才设置
 */
export const safeSet = <T extends object, K extends keyof T>(
  obj: T,
  key: K,
  value: T[K],
): boolean => {
  if (hasOwn(obj, key)) {
    obj[key] = value;
    return true;
  }
  return false;
};

/**
 * 安全删除对象属性
 */
export const safeDelete = <T extends object>(
  obj: T,
  key: PropertyKey,
): boolean => {
  if (hasOwn(obj, key)) {
    Reflect.deleteProperty(obj as Record<PropertyKey, unknown>, key);
    return true;
  }
  return false;
};

/**
 * 创建属性白名单访问器
 * 只允许访问预定义的属性列表
 */
export const createWhitelistAccessor = <T extends object, K extends keyof T>(
  allowedKeys: readonly K[],
) => {
  const keySet = new Set(allowedKeys);

  return {
    get: (obj: T, key: K): T[K] | undefined => {
      if (keySet.has(key) && hasOwn(obj, key)) {
        return obj[key];
      }
      return undefined;
    },

    set: (obj: T, key: K, value: T[K]): boolean => {
      if (keySet.has(key) && hasOwn(obj, key)) {
        obj[key] = value;
        return true;
      }
      return false;
    },

    has: (obj: T, key: K): boolean => {
      return keySet.has(key) && hasOwn(obj, key);
    },
  };
};

/**
 * 安全的对象键遍历
 * 只遍历对象自有属性
 */
export const safeKeys = <T extends object>(obj: T): (keyof T)[] => {
  return Object.keys(obj).filter((key) => hasOwn(obj, key)) as (keyof T)[];
};

/**
 * 安全的对象值遍历
 */
export const safeValues = <T extends object>(obj: T): T[keyof T][] => {
  return safeKeys(obj).map((key) => obj[key]);
};

/**
 * 安全的对象条目遍历
 */
export const safeEntries = <T extends object>(
  obj: T,
): [keyof T, T[keyof T]][] => {
  return safeKeys(obj).map((key) => [key, obj[key]]);
};

/**
 * 类型安全的对象合并
 * 只合并源对象中存在的属性
 */
export const safeMerge = <T extends object, U extends object>(
  target: T,
  source: U,
): T & Partial<U> => {
  const result = { ...target } as T & Partial<U>;

  for (const key of safeKeys(source)) {
    if (hasOwn(source, key)) {
      (result as Record<PropertyKey, unknown>)[key as PropertyKey] = (
        source as Record<PropertyKey, unknown>
      )[key as PropertyKey];
    }
  }

  return result;
};

/**
 * 安全的深度属性访问
 * 支持点号分隔的属性路径，如 'user.profile.name'
 */
export const safeDeepGet = <T extends object>(
  obj: T,
  path: string,
): unknown => {
  const keys = path.split('.');
  let current: unknown = obj;

  for (const key of keys) {
    if (current === null || current === undefined) {
      return undefined;
    }

    if (
      typeof current === 'object' &&
      hasOwn(current as Record<PropertyKey, unknown>, key)
    ) {
      current = (current as Record<PropertyKey, unknown>)[key as PropertyKey];
    } else {
      return undefined;
    }
  }

  return current;
};

/**
 * 验证对象结构是否符合预期
 * 检查必需属性是否存在
 */
export const validateObjectStructure = <T extends object>(
  obj: T,
  requiredKeys: (keyof T)[],
): boolean => {
  return requiredKeys.every((key) => hasOwn(obj, key));
};

/**
 * 创建类型安全的对象访问代理
 * 提供运行时类型检查和属性访问控制
 */
export const createSafeProxy = <T extends object>(
  obj: T,
  options: {
    allowedKeys?: (keyof T)[];
    readOnly?: boolean;
    validator?: (key: keyof T, value: unknown) => boolean;
  } = {},
): T => {
  const { allowedKeys, readOnly = false, validator } = options;
  const keySet = allowedKeys ? new Set(allowedKeys) : null;

  return new Proxy(obj, {
    get(target, prop) {
      if (typeof prop === 'string' || typeof prop === 'symbol') {
        if (keySet && !keySet.has(prop as keyof T)) {
          return undefined;
        }

        if (hasOwn(target, prop)) {
          return target[prop as keyof T];
        }
      }
      return undefined;
    },

    set(target, prop, value) {
      if (readOnly) {
        return false;
      }

      if (typeof prop === 'string' || typeof prop === 'symbol') {
        if (keySet && !keySet.has(prop as keyof T)) {
          return false;
        }

        if (validator && !validator(prop as keyof T, value)) {
          return false;
        }

        if (hasOwn(target, prop)) {
          target[prop as keyof T] = value;
          return true;
        }
      }

      return false;
    },

    has(target, prop) {
      if (typeof prop === 'string' || typeof prop === 'symbol') {
        if (keySet && !keySet.has(prop as keyof T)) {
          return false;
        }
        return hasOwn(target, prop);
      }
      return false;
    },

    ownKeys(target) {
      const keys = Object.keys(target).filter((key) => hasOwn(target, key));
      return keySet ? keys.filter((key) => keySet.has(key as keyof T)) : keys;
    },
  });
};

/**
 * 常用的安全访问模式
 */
export const SafeAccess = {
  /**
   * 安全访问配置对象
   */
  config: <T extends Record<string, unknown>>(
    config: T,
    key: string,
  ): T[keyof T] | undefined => {
    return hasOwn(config, key)
      ? ((config as Record<string, unknown>)[key] as T[keyof T])
      : undefined;
  },

  /**
   * 安全访问数组元素
   */
  array: <T>(arr: T[], index: number): T | undefined => {
    return index >= 0 && index < arr.length ? arr[index] : undefined;
  },

  /**
   * 安全访问嵌套对象
   */
  nested: <T extends object>(obj: T, ...keys: string[]): unknown => {
    let current: unknown = obj;

    for (const key of keys) {
      if (current === null || current === undefined) {
        return undefined;
      }

      if (
        typeof current === 'object' &&
        hasOwn(current as Record<PropertyKey, unknown>, key)
      ) {
        current = (current as Record<PropertyKey, unknown>)[key as PropertyKey];
      } else {
        return undefined;
      }
    }

    return current;
  },
};
