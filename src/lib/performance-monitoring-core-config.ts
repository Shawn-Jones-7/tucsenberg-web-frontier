/**
 * 性能监控核心配置管理
 * Performance Monitoring Core Configuration Management
 *
 * 负责性能监控的配置管理、验证和合并功能
 */

import { COUNT_PAIR, COUNT_TEN, ONE, PERCENTAGE_FULL, ZERO } from "@/constants/magic-numbers";
import { PERFORMANCE_CONSTANTS } from '@/constants/performance';
import { MB } from '@/constants/units';
import { logger } from '@/lib/logger';
import type { PerformanceConfig } from '@/lib/performance-monitoring-types';
import {
  generateEnvironmentConfig,
  validateConfig,
} from './performance-monitoring-types';

/**
 * 配置管理器
 * Configuration manager
 */
export class PerformanceConfigManager {
  private config: PerformanceConfig;
  private isInitialized = false;

  constructor(customConfig?: Partial<PerformanceConfig>) {
    this.config = this.initializeConfig(customConfig);
    this.isInitialized = true;
  }

  /**
   * 初始化配置
   * Initialize configuration
   */
  private initializeConfig(
    customConfig?: Partial<PerformanceConfig>,
  ): PerformanceConfig {
    // 生成默认配置
    const defaultConfig = generateEnvironmentConfig();

    // 合并自定义配置
    const mergedConfig = customConfig
      ? this.mergeConfig(defaultConfig, customConfig)
      : defaultConfig;

    // 验证配置
    const validation = validateConfig(mergedConfig);
    if (!validation.isValid) {
      logger.warn('Performance monitoring config validation failed', {
        errors: validation.errors,
      });
      // 使用默认配置作为后备
      return defaultConfig;
    }

    return mergedConfig;
  }

  /**
   * 合并配置
   * Merge configuration
   */
  mergeConfig(
    defaultConfig: PerformanceConfig,
    customConfig: Partial<PerformanceConfig>,
  ): PerformanceConfig {
    const merged: PerformanceConfig = {
      reactScan: {
        ...defaultConfig.reactScan,
        ...customConfig.reactScan,
      },
      webEvalAgent: {
        ...defaultConfig.webEvalAgent,
        ...customConfig.webEvalAgent,
      },
      bundleAnalyzer: {
        ...defaultConfig.bundleAnalyzer,
        ...customConfig.bundleAnalyzer,
      },
      sizeLimit: {
        ...defaultConfig.sizeLimit,
        ...customConfig.sizeLimit,
      },
      ...(defaultConfig.webVitals && {
        webVitals: customConfig.webVitals
          ? {
              ...defaultConfig.webVitals,
              ...customConfig.webVitals,
            }
          : defaultConfig.webVitals,
      }),
      ...(defaultConfig.component && {
        component: customConfig.component
          ? {
              ...defaultConfig.component,
              ...customConfig.component,
            }
          : defaultConfig.component,
      }),
      ...(defaultConfig.network && {
        network: customConfig.network
          ? {
              ...defaultConfig.network,
              ...customConfig.network,
            }
          : defaultConfig.network,
      }),
      ...(defaultConfig.bundle && {
        bundle: customConfig.bundle
          ? {
              ...defaultConfig.bundle,
              ...customConfig.bundle,
            }
          : defaultConfig.bundle,
      }),
      ...(defaultConfig.global && {
        global: customConfig.global
          ? {
              ...defaultConfig.global,
              ...customConfig.global,
            }
          : defaultConfig.global,
      }),
    };

    return merged;
  }

  /**
   * 获取配置
   * Get configuration
   */
  getConfig(): PerformanceConfig {
    return { ...this.config };
  }

  /**
   * 更新配置
   * Update configuration
   */
  updateConfig(newConfig: Partial<PerformanceConfig>): void {
    this.config = this.mergeConfig(this.config, newConfig);

    // 重新验证配置
    const validation = validateConfig(this.config);
    if (!validation.isValid) {
      logger.warn('Updated performance config validation failed', {
        errors: validation.errors,
      });
    }
  }

  /**
   * 重置配置为默认值
   * Reset configuration to defaults
   */
  resetConfig(): void {
    this.config = generateEnvironmentConfig();
  }

  /**
   * 检查配置是否有效
   * Check if configuration is valid
   */
  isConfigValid(): boolean {
    const validation = validateConfig(this.config);
    return validation.isValid;
  }

  /**
   * 获取配置验证结果
   * Get configuration validation result
   */
  validateCurrentConfig(): ReturnType<typeof validateConfig> {
    return validateConfig(this.config);
  }

  /**
   * 检查是否已初始化
   * Check if initialized
   */
  isConfigInitialized(): boolean {
    return this.isInitialized;
  }

  /**
   * 获取特定模块的配置
   * Get specific module configuration
   */
  getModuleConfig<T extends keyof PerformanceConfig>(
    module: T,
  ): PerformanceConfig[T] {
    const moduleConfig = this.config[module];
    return typeof moduleConfig === 'object' && moduleConfig !== null
      ? ({ ...moduleConfig } as PerformanceConfig[T])
      : moduleConfig;
  }

  /**
   * 更新特定模块的配置
   * Update specific module configuration
   */
  updateModuleConfig<T extends keyof PerformanceConfig>(
    module: T,
    config: Partial<PerformanceConfig[T]>,
  ): void {
    const currentConfig = this.config[module];
    this.config[module] =
      typeof currentConfig === 'object' && currentConfig !== null
        ? ({ ...currentConfig, ...config } as PerformanceConfig[T])
        : (config as PerformanceConfig[T]);

    // 验证更新后的配置
    const validation = validateConfig(this.config);
    if (!validation.isValid) {
      logger.warn(`Updated ${module} config validation failed`, {
        errors: validation.errors,
      });
    }
  }

  /**
   * 导出配置为JSON
   * Export configuration as JSON
   */
  exportConfig(): string {
    return JSON.stringify(this.config, null, COUNT_PAIR);
  }

  /**
   * 从JSON导入配置
   * Import configuration from JSON
   */
  importConfig(configJson: string): boolean {
    try {
      const importedConfig = JSON.parse(configJson) as PerformanceConfig;

      // 验证导入的配置
      const validation = validateConfig(importedConfig);
      if (!validation.isValid) {
        logger.error('Imported config validation failed', {
          errors: validation.errors,
        });
        return false;
      }

      this.config = importedConfig;
      return true;
    } catch (error) {
      logger.error('Failed to import config', { error: error as Error });
      return false;
    }
  }

  /**
   * 获取配置摘要
   * Get configuration summary
   */
  getConfigSummary(): {
    isEnabled: boolean;
    enabledModules: string[];
    dataRetentionTime: number;
    maxMetrics: number;
    thresholds: Record<string, number>;
  } {
    const {global} = this.config;
    const {component} = this.config;
    const {network} = this.config;
    const {bundle} = this.config;

    const enabledModules: string[] = [];
    if (component?.enabled) enabledModules.push('component');
    if (network?.enabled) enabledModules.push('network');
    if (bundle?.enabled) enabledModules.push('bundle');

    return {
      isEnabled: global?.enabled || false,
      enabledModules,
      dataRetentionTime:
        global?.dataRetentionTime ||
        PERFORMANCE_CONSTANTS.DEFAULT_RETENTION_TIME,
      maxMetrics:
        global?.maxMetrics || PERFORMANCE_CONSTANTS.DEFAULT_MAX_METRICS,
      thresholds: {
        componentRenderTime: component?.thresholds?.renderTime || PERCENTAGE_FULL,
        networkResponseTime: network?.thresholds?.responseTime || 1000,
        bundleSize: bundle?.thresholds?.size || MB, // 1MB
      },
    };
  }

  /**
   * 比较两个配置
   * Compare two configurations
   */
  compareConfigs(otherConfig: PerformanceConfig): {
    isDifferent: boolean;
    differences: string[];
  } {
    const differences: string[] = [];
    const current = this.config;

    // 比较全局配置
    if (current.global?.enabled !== otherConfig.global?.enabled) {
      differences.push('global.enabled');
    }
    if (
      current.global?.dataRetentionTime !==
      otherConfig.global?.dataRetentionTime
    ) {
      differences.push('global.dataRetentionTime');
    }
    if (current.global?.maxMetrics !== otherConfig.global?.maxMetrics) {
      differences.push('global.maxMetrics');
    }

    // 比较组件配置
    if (current.component?.enabled !== otherConfig.component?.enabled) {
      differences.push('component.enabled');
    }
    if (
      current.component?.thresholds?.renderTime !==
      otherConfig.component?.thresholds?.renderTime
    ) {
      differences.push('component.thresholds.renderTime');
    }

    // 比较网络配置
    if (current.network?.enabled !== otherConfig.network?.enabled) {
      differences.push('network.enabled');
    }
    if (
      current.network?.thresholds?.responseTime !==
      otherConfig.network?.thresholds?.responseTime
    ) {
      differences.push('network.thresholds.responseTime');
    }

    // 比较打包配置
    if (current.bundle?.enabled !== otherConfig.bundle?.enabled) {
      differences.push('bundle.enabled');
    }
    if (
      current.bundle?.thresholds?.size !== otherConfig.bundle?.thresholds?.size
    ) {
      differences.push('bundle.thresholds.size');
    }

    return {
      isDifferent: differences.length > ZERO,
      differences,
    };
  }

  /**
   * 获取配置变更历史
   * Get configuration change history
   */
  private configHistory: Array<{
    timestamp: number;
    config: PerformanceConfig;
    reason?: string;
  }> = [];

  /**
   * 记录配置变更
   * Record configuration change
   */
  private recordConfigChange(reason?: string): void {
    this.configHistory.push({
      timestamp: Date.now(),
      config: { ...this.config },
      ...(reason !== undefined && { reason }),
    });

    // 限制历史记录数量
    if (this.configHistory.length > COUNT_TEN) {
      this.configHistory = this.configHistory.slice(-COUNT_TEN);
    }
  }

  /**
   * 获取配置变更历史
   * Get configuration change history
   */
  getConfigHistory(): typeof this.configHistory {
    return [...this.configHistory];
  }

  /**
   * 回滚到之前的配置
   * Rollback to previous configuration
   */
  rollbackConfig(steps = ONE): boolean {
    if (this.configHistory.length < steps + ONE) {
      return false;
    }

    const targetConfig =
      this.configHistory[this.configHistory.length - steps - ONE];
    const newConfig: any = {};
    if (targetConfig?.config) {
      Object.keys(targetConfig.config).forEach((key) => {
        const value = (targetConfig.config as any)[key];
        if (value !== undefined) {
          newConfig[key] = value;
        }
      });
    }
    this.config = newConfig;
    this.recordConfigChange(`Rollback ${steps} steps`);

    return true;
  }
}

/**
 * 创建配置管理器实例
 * Create configuration manager instance
 */
export function createConfigManager(
  customConfig?: Partial<PerformanceConfig>,
): PerformanceConfigManager {
  return new PerformanceConfigManager(customConfig);
}

/**
 * 获取默认配置
 * Get default configuration
 */
export function getDefaultConfig(): PerformanceConfig {
  return generateEnvironmentConfig();
}

/**
 * 验证配置对象
 * Validate configuration object
 */
export function validatePerformanceConfig(
  config: unknown,
): ReturnType<typeof validateConfig> {
  return validateConfig(config as PerformanceConfig);
}
