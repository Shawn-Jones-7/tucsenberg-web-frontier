/**
 * 语言存储系统配置工厂
 * Locale Storage System Configuration Factory
 */

import { ZERO } from "@/constants/magic-numbers";
import type { EnvironmentType } from '@/lib/locale-storage-types-base';
import { DEFAULT_STORAGE_CONFIG } from '@/lib/locale-storage-types-config/defaults';
import type { StorageConfig } from '@/lib/locale-storage-types-config/interfaces';
import { CONFIG_PRESETS } from '@/lib/locale-storage-types-config/presets';
import { CONFIG_VALIDATION_RULES } from '@/lib/locale-storage-types-config/validation';
import type { ValidationResult } from '@/lib/locale-storage-types-data';

/**
 * 配置工厂函数
 * Configuration factory functions
 */
export const ConfigFactory = {
  /**
   * 创建默认配置
   * Create default configuration
   */
  createDefault(): StorageConfig {
    return { ...DEFAULT_STORAGE_CONFIG };
  },

  /**
   * 创建环境配置
   * Create environment configuration
   */
  createForEnvironment(environment: EnvironmentType): StorageConfig {
    const baseConfig = this.createDefault();
    const preset = CONFIG_PRESETS[environment];

    if (preset) {
      return this.merge(baseConfig, preset);
    }

    return baseConfig;
  },

  /**
   * 合并配置
   * Merge configurations
   */
  merge(base: StorageConfig, override: Partial<StorageConfig>): StorageConfig {
    return {
      ...base,
      ...override,
      retention: { ...base.retention, ...override.retention },
      performance: { ...base.performance, ...override.performance },
      compression: { ...base.compression, ...override.compression },
      encryption: { ...base.encryption, ...override.encryption },
      sync: { ...base.sync, ...override.sync },
      healthCheck: { ...base.healthCheck, ...override.healthCheck },
      errorHandling: { ...base.errorHandling, ...override.errorHandling },
      debug: { ...base.debug, ...override.debug },
    };
  },

  /**
   * 验证配置
   * Validate configuration
   */
  validate(config: unknown): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!config || typeof config !== 'object') {
      errors.push('Configuration must be an object');
      return { isValid: false, errors, warnings };
    }

    const cfg = config as Record<string, unknown>;

    // 验证必需字段
    for (const field of CONFIG_VALIDATION_RULES.required) {
      if (this.getNestedValue(cfg, field) === undefined) {
        errors.push(`Required field '${field}' is missing`);
      }
    }

    // 验证类型
    for (const [field, expectedType] of Object.entries(
      CONFIG_VALIDATION_RULES.types,
    )) {
      const value = this.getNestedValue(cfg, field);
      if (value !== undefined && typeof value !== expectedType) {
        errors.push(`Field '${field}' must be of type ${expectedType}`);
      }
    }

    // 验证范围
    for (const [field, range] of Object.entries(
      CONFIG_VALIDATION_RULES.ranges,
    )) {
      const value = this.getNestedValue(cfg, field) as number;
      if (typeof value === 'number') {
        if (range.min !== undefined && value < range.min) {
          errors.push(`Field '${field}' must be >= ${range.min}`);
        }
        if (range.max !== undefined && value > range.max) {
          errors.push(`Field '${field}' must be <= ${range.max}`);
        }
      }
    }

    // 验证枚举
    for (const [field, allowedValues] of Object.entries(
      CONFIG_VALIDATION_RULES.enums,
    )) {
      const value = this.getNestedValue(cfg, field) as string;
      if (typeof value === 'string' && !allowedValues.includes(value)) {
        errors.push(
          `Field '${field}' must be one of: ${allowedValues.join(', ')}`,
        );
      }
    }

    // 自定义验证
    for (const [field, validator] of Object.entries(
      CONFIG_VALIDATION_RULES.custom,
    )) {
      const value = this.getNestedValue(cfg, field);
      if (value !== undefined && !validator(value)) {
        errors.push(`Field '${field}' failed custom validation`);
      }
    }

    return {
      isValid: errors.length === ZERO,
      errors,
      warnings,
    };
  },

  /**
   * 获取嵌套值
   * Get nested value
   */
  getNestedValue(obj: Record<string, unknown>, path: string): unknown {
    return path.split('.').reduce((current: unknown, key: string) => {
      return current && typeof current === 'object'
        ? (current as Record<string, unknown>)[key]
        : undefined;
    }, obj as unknown);
  },
} as const;
