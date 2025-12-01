/**
 * 性能监控核心配置管理
 * Performance Monitoring Core Configuration Management
 */

import { logger } from '@/lib/logger';
import {
  compareBundleConfig,
  compareComponentConfig,
  compareGlobalConfig,
  compareNetworkConfig,
} from '@/lib/performance-monitoring-config-compare';
import {
  ConfigHistoryManager,
  type ConfigHistoryEntry,
} from '@/lib/performance-monitoring-config-history';
import {
  getOptionalModuleConfig,
  getPrimaryModuleConfig,
  isOptionalModule,
  isRequiredModule,
  mergeConfigValue,
} from '@/lib/performance-monitoring-config-modules';
import {
  generateEnvironmentConfig,
  validateConfig,
  type PerformanceConfig,
} from '@/lib/performance-monitoring-types';
import {
  ANIMATION_DURATION_NORMAL,
  COUNT_PAIR,
  ONE,
  PERCENTAGE_FULL,
  ZERO,
} from '@/constants';
import { PERFORMANCE_CONSTANTS } from '@/constants/performance';
import { MB } from '@/constants/units';

/**
 * 配置管理器
 */
export class PerformanceConfigManager {
  private config: PerformanceConfig;
  private isInitialized = false;
  private historyManager = new ConfigHistoryManager();

  constructor(customConfig?: Partial<PerformanceConfig>) {
    this.config = this.initializeConfig(customConfig);
    this.isInitialized = true;
  }

  private initializeConfig(
    customConfig?: Partial<PerformanceConfig>,
  ): PerformanceConfig {
    const defaultConfig = generateEnvironmentConfig();
    const mergedConfig = customConfig
      ? this.mergeConfig(defaultConfig, customConfig)
      : defaultConfig;

    const validation = validateConfig(mergedConfig);
    if (!validation.isValid) {
      logger.warn('Performance monitoring config validation failed', {
        errors: validation.errors,
      });
      return defaultConfig;
    }

    return mergedConfig;
  }

  mergeConfig(
    defaultConfig: PerformanceConfig,
    customConfig: Partial<PerformanceConfig>,
  ): PerformanceConfig {
    const merged: PerformanceConfig = {
      reactScan: { ...defaultConfig.reactScan, ...customConfig.reactScan },
      bundleAnalyzer: {
        ...defaultConfig.bundleAnalyzer,
        ...customConfig.bundleAnalyzer,
      },
      sizeLimit: { ...defaultConfig.sizeLimit, ...customConfig.sizeLimit },
      ...(defaultConfig.webVitals && {
        webVitals: customConfig.webVitals
          ? { ...defaultConfig.webVitals, ...customConfig.webVitals }
          : defaultConfig.webVitals,
      }),
      ...(defaultConfig.component && {
        component: customConfig.component
          ? { ...defaultConfig.component, ...customConfig.component }
          : defaultConfig.component,
      }),
      ...(defaultConfig.network && {
        network: customConfig.network
          ? { ...defaultConfig.network, ...customConfig.network }
          : defaultConfig.network,
      }),
      ...(defaultConfig.bundle && {
        bundle: customConfig.bundle
          ? { ...defaultConfig.bundle, ...customConfig.bundle }
          : defaultConfig.bundle,
      }),
      ...(defaultConfig.global && {
        global: customConfig.global
          ? { ...defaultConfig.global, ...customConfig.global }
          : defaultConfig.global,
      }),
    };
    return merged;
  }

  getConfig(): PerformanceConfig {
    return { ...this.config };
  }

  updateConfig(newConfig: Partial<PerformanceConfig>): void {
    this.config = this.mergeConfig(this.config, newConfig);
    const validation = validateConfig(this.config);
    if (!validation.isValid) {
      logger.warn('Updated performance config validation failed', {
        errors: validation.errors,
      });
    }
  }

  resetConfig(): void {
    this.config = generateEnvironmentConfig();
  }

  isConfigValid(): boolean {
    return validateConfig(this.config).isValid;
  }

  validateCurrentConfig(): ReturnType<typeof validateConfig> {
    return validateConfig(this.config);
  }

  isConfigInitialized(): boolean {
    return this.isInitialized;
  }

  getModuleConfig<T extends keyof PerformanceConfig>(
    module: T,
  ): PerformanceConfig[T] | undefined {
    const primary = getPrimaryModuleConfig(this.config, module);
    if (primary !== undefined) return primary;
    return getOptionalModuleConfig(this.config, module);
  }

  private applyModuleConfig<T extends keyof PerformanceConfig>(
    module: T,
    nextValue: PerformanceConfig[T] | undefined,
  ): void {
    if (isRequiredModule(module)) {
      this.applyRequiredModuleConfig(module, nextValue);
    } else if (isOptionalModule(module)) {
      this.applyOptionalModuleConfig(module, nextValue);
    } else if (module === 'debug') {
      this.applyDebugConfig(nextValue);
    }
  }

  private applyRequiredModuleConfig<T extends keyof PerformanceConfig>(
    module: T,
    nextValue: PerformanceConfig[T] | undefined,
  ): void {
    switch (module) {
      case 'reactScan':
        this.config.reactScan = (nextValue ??
          this.config.reactScan) as PerformanceConfig['reactScan'];
        break;
      case 'bundleAnalyzer':
        this.config.bundleAnalyzer = (nextValue ??
          this.config.bundleAnalyzer) as PerformanceConfig['bundleAnalyzer'];
        break;
      case 'sizeLimit':
        this.config.sizeLimit = (nextValue ??
          this.config.sizeLimit) as PerformanceConfig['sizeLimit'];
        break;
      default:
        break;
    }
  }

  private applyWebVitalsConfig(
    v: PerformanceConfig['webVitals'] | undefined,
  ): void {
    if (v !== undefined) {
      this.config.webVitals = v;
    } else {
      delete this.config.webVitals;
    }
  }

  private applyComponentConfig(
    v: PerformanceConfig['component'] | undefined,
  ): void {
    if (v !== undefined) {
      this.config.component = v;
    } else {
      delete this.config.component;
    }
  }

  private applyNetworkConfig(
    v: PerformanceConfig['network'] | undefined,
  ): void {
    if (v !== undefined) {
      this.config.network = v;
    } else {
      delete this.config.network;
    }
  }

  private applyBundleConfig(v: PerformanceConfig['bundle'] | undefined): void {
    if (v !== undefined) {
      this.config.bundle = v;
    } else {
      delete this.config.bundle;
    }
  }

  private applyGlobalConfig(v: PerformanceConfig['global'] | undefined): void {
    if (v !== undefined) {
      this.config.global = v;
    } else {
      delete this.config.global;
    }
  }

  private applyOptionalModuleConfig<T extends keyof PerformanceConfig>(
    module: T,
    nextValue: PerformanceConfig[T] | undefined,
  ): void {
    switch (module) {
      case 'webVitals':
        this.applyWebVitalsConfig(nextValue as PerformanceConfig['webVitals']);
        break;
      case 'component':
        this.applyComponentConfig(nextValue as PerformanceConfig['component']);
        break;
      case 'network':
        this.applyNetworkConfig(nextValue as PerformanceConfig['network']);
        break;
      case 'bundle':
        this.applyBundleConfig(nextValue as PerformanceConfig['bundle']);
        break;
      case 'global':
        this.applyGlobalConfig(nextValue as PerformanceConfig['global']);
        break;
      default:
        break;
    }
  }

  private applyDebugConfig(nextValue: unknown): void {
    if (typeof nextValue === 'boolean') {
      this.config.debug = nextValue;
    } else if (nextValue === undefined) {
      delete this.config.debug;
    }
  }

  private validateConfigUpdate<T extends keyof PerformanceConfig>(
    module: T,
  ): void {
    const validation = validateConfig(this.config);
    if (!validation.isValid) {
      logger.warn(`Updated ${module} config validation failed`, {
        errors: validation.errors,
      });
    }
  }

  updateModuleConfig<T extends keyof PerformanceConfig>(
    module: T,
    config: Partial<PerformanceConfig[T]>,
  ): void {
    const current = this.getModuleConfig(module);
    if (current !== undefined) {
      const nextValue = mergeConfigValue(current, config);
      this.applyModuleConfig(module, nextValue);
    } else {
      this.applyModuleConfig(module, config as PerformanceConfig[T]);
    }
    this.validateConfigUpdate(module);
  }

  exportConfig(): string {
    return JSON.stringify(this.config, null, COUNT_PAIR);
  }

  importConfig(configJson: string): boolean {
    try {
      const importedConfig = JSON.parse(configJson) as PerformanceConfig;
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

  getConfigSummary(): {
    isEnabled: boolean;
    enabledModules: string[];
    dataRetentionTime: number;
    maxMetrics: number;
    thresholds: Record<string, number>;
  } {
    const { global, component, network, bundle } = this.config;
    const enabledModules = this.getEnabledModules(
      component?.enabled,
      network?.enabled,
      bundle?.enabled,
    );

    return {
      isEnabled: Boolean(global?.enabled),
      enabledModules,
      dataRetentionTime:
        global?.dataRetentionTime ??
        PERFORMANCE_CONSTANTS.DEFAULT_RETENTION_TIME,
      maxMetrics:
        global?.maxMetrics ?? PERFORMANCE_CONSTANTS.DEFAULT_MAX_METRICS,
      thresholds: this.buildThresholds(
        component?.thresholds?.renderTime,
        network?.thresholds?.responseTime,
        bundle?.thresholds?.size,
      ),
    };
  }

  private getEnabledModules(
    cmp?: boolean,
    net?: boolean,
    bnd?: boolean,
  ): string[] {
    const list: string[] = [];
    if (cmp) list.push('component');
    if (net) list.push('network');
    if (bnd) list.push('bundle');
    return list;
  }

  private buildThresholds(
    renderTime?: number,
    responseTime?: number,
    size?: number,
  ): Record<string, number> {
    return {
      componentRenderTime: renderTime || PERCENTAGE_FULL,
      networkResponseTime: responseTime || ANIMATION_DURATION_NORMAL,
      bundleSize: size || MB,
    };
  }

  compareConfigs(otherConfig: PerformanceConfig): {
    isDifferent: boolean;
    differences: string[];
  } {
    const differences: string[] = [];
    compareGlobalConfig(this.config, otherConfig, differences);
    compareComponentConfig(this.config, otherConfig, differences);
    compareNetworkConfig(this.config, otherConfig, differences);
    compareBundleConfig(this.config, otherConfig, differences);
    return { isDifferent: differences.length > ZERO, differences };
  }

  getConfigHistory(): ConfigHistoryEntry[] {
    return this.historyManager.getHistory();
  }

  rollbackConfig(steps = ONE): boolean {
    const targetConfig = this.historyManager.rollback(steps);
    if (targetConfig) {
      this.config = targetConfig;
      this.historyManager.recordChange(this.config, `Rollback ${steps} steps`);
      return true;
    }
    return false;
  }
}

// Note: createConfigManager, getDefaultConfig, validatePerformanceConfig
// are exported directly from '@/lib/performance-monitoring-config-factory'
// to avoid circular dependency. Import from that module instead.
