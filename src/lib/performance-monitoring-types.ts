/**
 * 性能监控类型定义和配置
 *
 * 包含性能监控相关的接口定义、配置类型和环境配置逻辑
 */

import { MAGIC_2500 } from "@/constants/count";
import { ANIMATION_DURATION_VERY_SLOW, BYTES_PER_KB, COUNT_FIVE, MAGIC_0_1, ONE, PERCENTAGE_FULL, PERCENTAGE_HALF, SECONDS_PER_MINUTE, TEN_SECONDS_MS, THIRTY_SECONDS_MS, THREE_SECONDS_MS, ZERO } from '@/constants';

import { MAGIC_0_9 } from "@/constants/decimal";
import { PERFORMANCE_CONSTANTS } from '@/constants/performance';

// ==================== 基础类型定义 ====================

/**
 * 性能指标数据源类型
 * Performance metrics source types
 */
export type PerformanceMetricSource =
  | 'react-scan'
  | 'web-eval-agent'
  | 'bundle-analyzer'
  | 'size-limit'
  | 'custom'
  | 'web-vitals'
  | 'lighthouse'
  | 'user-timing';

/**
 * 性能指标类型
 * Performance metrics types
 */
export type PerformanceMetricType =
  | 'component'
  | 'page'
  | 'bundle'
  | 'network'
  | 'user-interaction'
  | 'memory'
  | 'cpu'
  | 'rendering'
  | 'loading';

/**
 * 组件性能数据
 * Component performance data
 */
export interface ComponentPerformanceData {
  /** 渲染时间 (毫秒) */
  renderTime: number;
  /** 内存使用 (字节) */
  memoryUsage?: number;
}

/**
 * 网络性能数据
 * Network performance data
 */
export interface NetworkPerformanceData {
  /** 响应时间 (毫秒) */
  responseTime: number;
  /** 超时时间 (毫秒) */
  timeout?: number;
}

/**
 * 打包性能数据
 * Bundle performance data
 */
export interface BundlePerformanceData {
  /** 包大小 (字节) */
  size: number;
  /** 加载时间 (毫秒) */
  loadTime?: number;
}

/**
 * 性能指标数据联合类型
 * Performance metrics data union type
 */
export type PerformanceMetricData =
  | ComponentPerformanceData
  | NetworkPerformanceData
  | BundlePerformanceData
  | Record<string, unknown>;

/**
 * 性能指标接口
 * Performance metrics interface
 */
export interface PerformanceMetrics {
  /** 时间戳 */
  timestamp: number;
  /** 数据源 */
  source: PerformanceMetricSource;
  /** 指标类型 */
  type: PerformanceMetricType;
  /** 指标数据 */
  data: PerformanceMetricData;
  /** 指标ID (可选) */
  id?: string;
  /** 指标标签 (可选) */
  tags?: string[];
  /** 指标优先级 (可选) */
  priority?: 'low' | 'medium' | 'high' | 'critical';
}

// ==================== 配置接口定义 ====================

/**
 * React Scan 配置
 * React Scan configuration
 */
export interface ReactScanConfig {
  /** 是否启用 */
  enabled: boolean;
  /** 是否显示工具栏 */
  showToolbar: boolean;
  /** 是否跟踪不必要的渲染 */
  trackUnnecessaryRenders: boolean;
  /** 是否显示渲染时间 */
  showRenderTime?: boolean;
  /** 是否显示组件名称 */
  showComponentNames?: boolean;
  /** 最大跟踪组件数量 */
  maxTrackedComponents?: number;
  /** 渲染时间阈值 (毫秒) */
  renderThreshold?: number;
}

/**
 * Web Eval Agent 配置
 * Web Eval Agent configuration
 */
export interface WebEvalAgentConfig {
  /** 是否启用 */
  enabled: boolean;
  /** 是否捕获网络请求 */
  captureNetwork: boolean;
  /** 是否捕获日志 */
  captureLogs: boolean;
  /** 是否捕获截图 */
  captureScreenshots?: boolean;
  /** 是否捕获性能指标 */
  capturePerformance?: boolean;
  /** 测试超时时间 (毫秒) */
  timeout?: number;
  /** 每个会话最大交互次数 */
  maxInteractionsPerSession?: number;
}

/**
 * Bundle Analyzer 配置
 * Bundle Analyzer configuration
 */
export interface BundleAnalyzerConfig {
  /** 是否启用 */
  enabled: boolean;
  /** 是否自动打开分析器 */
  openAnalyzer: boolean;
  /** 分析器端口 */
  port?: number;
  /** 是否生成静态报告 */
  generateStaticReport?: boolean;
  /** 报告输出目录 */
  reportDir?: string;
}

/**
 * Size Limit 配置
 * Size Limit configuration
 */
export interface SizeLimitConfig {
  /** 是否启用 */
  enabled: boolean;
  /** 大小限制 (字节) */
  limits: Record<string, number>;
  /** 是否启用 gzip 压缩检查 */
  gzip?: boolean;
  /** 是否启用 brotli 压缩检查 */
  brotli?: boolean;
  /** 警告阈值 (百分比) */
  warningThreshold?: number;
}

/**
 * Web Vitals 配置
 * Web Vitals configuration
 */
export interface WebVitalsConfig {
  /** 是否启用 */
  enabled: boolean;
  /** 是否上报到分析服务 */
  reportToAnalytics: boolean;
  /** 采样率 (0-1) */
  sampleRate?: number;
  /** 是否在控制台输出 */
  debug?: boolean;
  /** 是否报告所有变化 */
  reportAllChanges?: boolean;
  /** 性能阈值配置 */
  thresholds?: {
    /** CLS 阈值 */
    cls?: number;
    /** FID 阈值 */
    fid?: number;
    /** LCP 阈值 */
    lcp?: number;
  };
}

/**
 * 组件性能监控配置
 * Component performance monitoring configuration
 */
export interface ComponentConfig {
  /** 是否启用 */
  enabled: boolean;
  /** 性能阈值 */
  thresholds?: {
    /** 渲染时间阈值 (毫秒) */
    renderTime: number;
    /** 内存使用阈值 (字节) */
    memoryUsage?: number;
  };
  /** 是否跟踪重新渲染 */
  trackRerenders?: boolean;
  /** 最大跟踪组件数 */
  maxTrackedComponents?: number;
}

/**
 * 网络性能监控配置
 * Network performance monitoring configuration
 */
export interface NetworkConfig {
  /** 是否启用 */
  enabled: boolean;
  /** 性能阈值 */
  thresholds?: {
    /** 响应时间阈值 (毫秒) */
    responseTime: number;
    /** 超时时间 (毫秒) */
    timeout?: number;
  };
  /** 是否监控所有请求 */
  monitorAllRequests?: boolean;
  /** 采样率 (0-1) */
  sampleRate?: number;
}

/**
 * 打包性能监控配置
 * Bundle performance monitoring configuration
 */
export interface BundleConfig {
  /** 是否启用 */
  enabled: boolean;
  /** 性能阈值 */
  thresholds?: {
    /** 包大小阈值 (字节) */
    size: number;
    /** 加载时间阈值 (毫秒) */
    loadTime?: number;
  };
  /** 是否分析依赖 */
  analyzeDependencies?: boolean;
  /** 是否生成报告 */
  generateReports?: boolean;
}

/**
 * 性能监控总配置
 * Performance monitoring configuration
 */
export interface PerformanceConfig {
  /** React Scan 配置 */
  reactScan: ReactScanConfig;
  /** Web Eval Agent 配置 */
  webEvalAgent: WebEvalAgentConfig;
  /** Bundle Analyzer 配置 */
  bundleAnalyzer: BundleAnalyzerConfig;
  /** Size Limit 配置 */
  sizeLimit: SizeLimitConfig;
  /** Web Vitals 配置 */
  webVitals?: WebVitalsConfig;
  /** 组件性能监控配置 */
  component?: ComponentConfig;
  /** 网络性能监控配置 */
  network?: NetworkConfig;
  /** 打包性能监控配置 */
  bundle?: BundleConfig;
  /** 是否启用调试模式 */
  debug?: boolean;
  /** 全局配置 */
  global?: {
    /** 是否启用性能监控 */
    enabled: boolean;
    /** 数据保留时间 (毫秒) */
    dataRetentionTime: number;
    /** 最大指标数量 */
    maxMetrics: number;
    /** 是否在生产环境启用 */
    enableInProduction: boolean;
  };
}

// ==================== 环境检测和配置生成 ====================

/**
 * 环境类型
 * Environment types
 */
export type Environment = 'development' | 'production' | 'test' | 'staging';

/**
 * 获取当前环境
 * Get current environment
 */
export function getCurrentEnvironment(): Environment {
  if (
    process.env.NODE_ENV === 'test' ||
    process.env.PLAYWRIGHT_TEST === 'true'
  ) {
    return 'test';
  }
  if (process.env.NODE_ENV === 'production') {
    return 'production';
  }
  if (process.env.NODE_ENV === 'development') {
    return 'development';
  }
  if (
    process.env.VERCEL_ENV === 'preview' ||
    process.env.NODE_ENV === 'staging'
  ) {
    return 'staging';
  }
  return 'development';
}

/**
 * 检查是否为测试环境
 * Check if in test environment
 */
export function isTestEnvironment(): boolean {
  return getCurrentEnvironment() === 'test';
}

/**
 * 检查是否为开发环境
 * Check if in development environment
 */
export function isDevelopmentEnvironment(): boolean {
  return getCurrentEnvironment() === 'development';
}

/**
 * 检查是否为生产环境
 * Check if in production environment
 */
export function isProductionEnvironment(): boolean {
  return getCurrentEnvironment() === 'production';
}

/**
 * 根据环境生成默认配置
 * Generate default configuration based on environment
 */
export function generateEnvironmentConfig(): PerformanceConfig {
  const environment = getCurrentEnvironment();
  const isProduction = environment === 'production';
  const isTest = environment === 'test';
  const isDevelopment = environment === 'development';

  return {
    reactScan: {
      enabled:
        isDevelopment &&
        !isTest &&
        process.env.NEXT_PUBLIC_DISABLE_REACT_SCAN !== 'true',
      showToolbar: isDevelopment && !isTest,
      trackUnnecessaryRenders: isDevelopment,
      showRenderTime: isDevelopment,
      showComponentNames: isDevelopment,
      maxTrackedComponents: PERCENTAGE_FULL,
      renderThreshold: PERCENTAGE_FULL, // 100ms
    },
    webEvalAgent: {
      enabled:
        isTest || process.env.NEXT_PUBLIC_ENABLE_WEB_EVAL_AGENT === 'true',
      captureNetwork: true,
      captureLogs: true,
      captureScreenshots: isTest,
      capturePerformance: true,
      timeout: THIRTY_SECONDS_MS,
      maxInteractionsPerSession: PERCENTAGE_HALF,
    },
    bundleAnalyzer: {
      enabled: process.env.ANALYZE === 'true',
      openAnalyzer: !isProduction,
      port: 8888,
      generateStaticReport: isProduction,
      reportDir: './bundle-analysis',
    },
    sizeLimit: {
      enabled: true,
      limits: {
        main:
          PERFORMANCE_CONSTANTS.BUNDLE_LIMITS.MAIN_BUNDLE *
          PERFORMANCE_CONSTANTS.BUNDLE_LIMITS.KB_TO_BYTES,
        framework:
          PERFORMANCE_CONSTANTS.BUNDLE_LIMITS.FRAMEWORK_BUNDLE *
          PERFORMANCE_CONSTANTS.BUNDLE_LIMITS.KB_TO_BYTES,
        css:
          PERFORMANCE_CONSTANTS.BUNDLE_LIMITS.CSS_BUNDLE *
          PERFORMANCE_CONSTANTS.BUNDLE_LIMITS.KB_TO_BYTES,
      },
      gzip: true,
      brotli: true,
      warningThreshold: MAGIC_0_9, // 90%
    },
    webVitals: {
      enabled: true,
      reportToAnalytics: isProduction,
      sampleRate: isProduction ? MAGIC_0_1 : ONE, // 生产环境10%采样
      debug: isDevelopment,
      reportAllChanges: isDevelopment,
      thresholds: {
        cls: MAGIC_0_1,
        fid: PERCENTAGE_FULL,
        lcp: MAGIC_2500,
      },
    },
    component: {
      enabled: isDevelopment,
      thresholds: {
        renderTime: PERCENTAGE_FULL, // 100ms
        memoryUsage: PERCENTAGE_HALF * BYTES_PER_KB * BYTES_PER_KB, // 50MB
      },
      trackRerenders: isDevelopment,
      maxTrackedComponents: PERCENTAGE_FULL,
    },
    network: {
      enabled: true,
      thresholds: {
        responseTime: 1000, // 1s
        timeout: TEN_SECONDS_MS, // 10s
      },
      monitorAllRequests: isDevelopment,
      sampleRate: isProduction ? MAGIC_0_1 : ONE,
    },
    bundle: {
      enabled: true,
      thresholds: {
        size: BYTES_PER_KB * BYTES_PER_KB, // 1MB
        loadTime: THREE_SECONDS_MS, // 3s
      },
      analyzeDependencies: isDevelopment,
      generateReports: !isProduction,
    },
    debug: isDevelopment,
    global: {
      enabled: true,
      dataRetentionTime: COUNT_FIVE * SECONDS_PER_MINUTE * ANIMATION_DURATION_VERY_SLOW, // COUNT_FIVE分钟
      maxMetrics: ANIMATION_DURATION_VERY_SLOW,
      enableInProduction: false,
    },
  };
}

// ==================== 配置验证 ====================

/**
 * 验证配置的有效性
 * Validate configuration
 */
export function validateConfig(config: PerformanceConfig): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  validateSizeLimits(config, errors);
  validateWebVitalsConfig(config, errors);
  validateGlobalConfig(config, errors);
  collectWarnings(config, warnings);

  return { isValid: errors.length === ZERO, errors, warnings };
}

function validateSizeLimits(config: PerformanceConfig, errors: string[]): void {
  if (!config.sizeLimit.enabled) return;
  for (const [key, limit] of Object.entries(config.sizeLimit.limits)) {
    if (typeof limit !== 'number' || limit <= ZERO) {
      errors.push(`Size limit for "${key}" must be a positive number`);
    }
  }
}

function validateWebVitalsConfig(config: PerformanceConfig, errors: string[]): void {
  if (!config.webVitals?.enabled) return;
  const rate = config.webVitals.sampleRate;
  if (rate && (rate < ZERO || rate > ONE)) {
    errors.push('Web Vitals sample rate must be between 0 and 1');
  }
}

function validateGlobalConfig(config: PerformanceConfig, errors: string[]): void {
  if (!config.global?.enabled) return;
  if (config.global.dataRetentionTime <= ZERO) {
    errors.push('Data retention time must be positive');
  }
  if (config.global.maxMetrics <= ZERO) {
    errors.push('Max metrics must be positive');
  }
}

function collectWarnings(config: PerformanceConfig, warnings: string[]): void {
  if (config.reactScan.enabled && isProductionEnvironment()) {
    warnings.push('React Scan is enabled in production environment');
  }
  if (config.bundleAnalyzer.enabled && config.bundleAnalyzer.openAnalyzer && isProductionEnvironment()) {
    warnings.push('Bundle analyzer auto-open is enabled in production');
  }
}
