/**
 * 语言存储系统配置工厂
 * Locale Storage System Configuration Factory
 */

import { ZERO } from "@/constants";
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
    const preset = ((env: EnvironmentType) => {
      switch (env) {
        case 'development':
          return CONFIG_PRESETS.development;
        case 'production':
          return CONFIG_PRESETS.production;
        case 'test':
          return CONFIG_PRESETS.test;
        case 'staging':
          return CONFIG_PRESETS.staging;
        default:
          return undefined;
      }
    })(environment);

    if (preset) return this.merge(baseConfig, preset);
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

    // 预构建 Map，避免动态对象索引
    const required = new Set(CONFIG_VALIDATION_RULES.required);
    const typesMap = new Map(Object.entries(CONFIG_VALIDATION_RULES.types));
    const rangesMap = new Map(Object.entries(CONFIG_VALIDATION_RULES.ranges));
    const enumsMap = new Map(Object.entries(CONFIG_VALIDATION_RULES.enums));
    const customMap = new Map(Object.entries(CONFIG_VALIDATION_RULES.custom));

    this.validateRequired(cfg, required, errors);
    this.validateTypes(cfg, typesMap, errors);
    this.validateRanges(cfg, rangesMap, errors);
    this.validateEnums(cfg, enumsMap, errors);
    this.validateCustom(cfg, customMap, errors);

    return { isValid: errors.length === ZERO, errors, warnings };
  },

  private validateRequired(
    cfg: Record<string, unknown>,
    required: Set<string>,
    errors: string[],
  ) {
    for (const field of required) {
      if (this.getNestedValue(cfg, field) === undefined) {
        errors.push(`Required field '${field}' is missing`);
      }
    }
  },

  private validateTypes(
    cfg: Record<string, unknown>,
    typesMap: Map<string, string>,
    errors: string[],
  ) {
    for (const [field, expectedType] of typesMap.entries()) {
      const value = this.getNestedValue(cfg, field);
      if (value !== undefined && typeof value !== expectedType) {
        errors.push(`Field '${field}' must be of type ${expectedType}`);
      }
    }
  },

  private validateRanges(
    cfg: Record<string, unknown>,
    rangesMap: Map<string, { min?: number; max?: number }>,
    errors: string[],
  ) {
    for (const [field, range] of rangesMap.entries()) {
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
  },

  private validateEnums(
    cfg: Record<string, unknown>,
    enumsMap: Map<string, string[]>,
    errors: string[],
  ) {
    for (const [field, allowedValues] of enumsMap.entries()) {
      const value = this.getNestedValue(cfg, field) as string;
      if (typeof value === 'string' && !allowedValues.includes(value)) {
        errors.push(`Field '${field}' must be one of: ${allowedValues.join(', ')}`);
      }
    }
  },

  private validateCustom(
    cfg: Record<string, unknown>,
    customMap: Map<string, (value: unknown) => boolean>,
    errors: string[],
  ) {
    for (const [field, validator] of customMap.entries()) {
      const value = this.getNestedValue(cfg, field);
      if (value !== undefined && !validator(value)) {
        errors.push(`Field '${field}' failed custom validation`);
      }
    }
  },

  /**
   * 获取嵌套值
   * Get nested value
   */
  getNestedValue(obj: Record<string, unknown>, path: string): unknown {
    const keys = path.split('.');
    let current: unknown = obj;
    for (const key of keys) {
      if (current && typeof current === 'object') {
        const desc = Object.getOwnPropertyDescriptor(current as object, key);
        if (desc) {
          current = desc.value as unknown;
          continue;
        }
      }
      return undefined;
    }
    return current;
  },
} as const;
