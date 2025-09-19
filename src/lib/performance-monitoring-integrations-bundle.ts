/**
 * Bundle Analyzer 性能监控集成
 * Bundle Analyzer Performance Monitoring Integration
 *
 * 提供与Bundle Analyzer工具的集成钩子，用于监控打包大小和优化
 */

import { logger } from '@/lib/logger';
import type {
  PerformanceConfig,
  PerformanceMetrics,
} from '@/lib/performance-monitoring-types';
import {
  ANIMATION_DURATION_SLOW,
  ANIMATION_DURATION_VERY_SLOW,
  BYTES_PER_KB,
  COUNT_FIVE,
  COUNT_PAIR,
  COUNT_TEN,
  MAGIC_0_8,
  MAGIC_8,
  MAGIC_512,
  ONE,
  PERCENTAGE_FULL,
  PERCENTAGE_HALF,
  PERCENTAGE_QUARTER,
  ZERO,
} from '@/constants';
import { KB, MB } from '@/constants/units';

/**
 * Bundle Analyzer 集成钩子返回类型
 * Bundle Analyzer integration hook return type
 */
export interface BundleAnalyzerIntegration {
  enabled: boolean;
  recordBundleSize: (
    bundleName: string,
    size: number,
    gzipSize?: number,
  ) => void;
  recordChunkInfo: (chunkName: string, size: number, modules: string[]) => void;
  generateSizeReport: () => Record<string, unknown>;
}

/**
 * Bundle Analyzer 集成钩子
 * Bundle Analyzer integration hook
 */
export function useBundleAnalyzerIntegration(
  config: PerformanceConfig,
  recordMetric: (metric: Omit<PerformanceMetrics, 'timestamp'>) => void,
): BundleAnalyzerIntegration {
  const bundleData = new Map<string, { size: number; gzipSize?: number }>();

  return {
    enabled: config.bundleAnalyzer.enabled,

    recordBundleSize: (bundleName: string, size: number, gzipSize?: number) => {
      if (!config.bundleAnalyzer.enabled) return;

      bundleData.set(bundleName, {
        size,
        ...(gzipSize !== undefined && { gzipSize }),
      });

      recordMetric({
        source: 'bundle-analyzer',
        type: 'bundle',
        data: {
          bundleName,
          size,
          gzipSize,
          timestamp: Date.now(),
        },
        tags: ['bundle-analyzer', 'bundle-size'],
        priority: 'medium',
      });
    },

    recordChunkInfo: (chunkName: string, size: number, modules: string[]) => {
      if (!config.bundleAnalyzer.enabled) return;

      recordMetric({
        source: 'bundle-analyzer',
        type: 'bundle',
        data: {
          chunkName,
          size,
          moduleCount: modules.length,
          modules: modules.slice(ZERO, COUNT_TEN), // 只记录前COUNT_TEN个模块
          timestamp: Date.now(),
        },
        tags: ['bundle-analyzer', 'chunk-info'],
        priority: 'low',
      });
    },

    generateSizeReport: () => {
      return Object.fromEntries(bundleData);
    },
  };
}

/**
 * Bundle Analyzer 配置验证
 * Bundle Analyzer configuration validation
 */
export function validateBundleAnalyzerConfig(config: PerformanceConfig): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!config.bundleAnalyzer) {
    errors.push('Bundle Analyzer configuration is missing');
    return { isValid: false, errors, warnings };
  }

  if (typeof config.bundleAnalyzer.enabled !== 'boolean') {
    errors.push('Bundle Analyzer enabled must be a boolean');
  }

  if (config.bundleAnalyzer.enabled) {
    if (
      config.bundleAnalyzer.port &&
      (typeof config.bundleAnalyzer.port !== 'number' ||
        config.bundleAnalyzer.port <= ZERO)
    ) {
      warnings.push('Bundle Analyzer port should be a positive number');
    }

    if (
      config.bundleAnalyzer.reportDir &&
      typeof config.bundleAnalyzer.reportDir !== 'string'
    ) {
      warnings.push('Bundle Analyzer reportDir should be a string');
    }
  }

  return {
    isValid: errors.length === ZERO,
    errors,
    warnings,
  };
}

/**
 * Bundle Analyzer 性能分析器
 * Bundle Analyzer performance analyzer
 */
export class BundleAnalyzerAnalyzer {
  private bundles = new Map<
    string,
    {
      size: number;
      gzipSize?: number;
      timestamp: number;
    }
  >();

  private chunks = new Map<
    string,
    {
      size: number;
      modules: string[];
      timestamp: number;
    }
  >();

  private config: PerformanceConfig;

  constructor(config: PerformanceConfig) {
    this.config = config;
  }

  /**
   * 记录Bundle大小
   * Record bundle size
   */
  recordBundleSize(bundleName: string, size: number, gzipSize?: number): void {
    if (!this.config.bundleAnalyzer.enabled) return;

    this.bundles.set(bundleName, {
      size,
      ...(gzipSize !== undefined && { gzipSize }),
      timestamp: Date.now(),
    });

    // 检查是否超过大小限制 (使用bundle配置的阈值)
    const maxSize = this.config.bundle?.thresholds?.size || MB; // 1MB
    if (size > maxSize) {
      logger.warn(`Bundle ${bundleName} exceeds size limit`, {
        size: this.formatSize(size),
        maxSize: this.formatSize(maxSize),
      });
    }
  }

  /**
   * 记录Chunk信息
   * Record chunk information
   */
  recordChunkInfo(chunkName: string, size: number, modules: string[]): void {
    if (!this.config.bundleAnalyzer.enabled) return;

    this.chunks.set(chunkName, {
      size,
      modules,
      timestamp: Date.now(),
    });

    // 检查是否超过大小限制 (使用bundle配置的阈值)
    const maxSize = this.config.bundle?.thresholds?.size || MAGIC_512 * KB; // 512KB
    if (size > maxSize) {
      logger.warn(`Chunk ${chunkName} exceeds size limit`, {
        size: this.formatSize(size),
        maxSize: this.formatSize(maxSize),
      });
    }
  }

  /**
   * 生成Bundle分析报告
   * Generate bundle analysis report
   */
  generateBundleReport(): {
    totalBundles: number;
    totalSize: number;
    totalGzipSize: number;
    largestBundles: Array<{
      name: string;
      size: number;
      gzipSize?: number;
      compressionRatio?: number;
    }>;
    recommendations: string[];
  } {
    const bundles = Array.from(this.bundles.entries());
    const totalSize = bundles.reduce(
      (sum, [, bundle]) => sum + bundle.size,
      ZERO,
    );
    const totalGzipSize = bundles.reduce(
      (sum, [, bundle]) => sum + (bundle.gzipSize || ZERO),
      ZERO,
    );

    const largestBundles = bundles
      .map(([name, bundle]) => ({
        name,
        size: bundle.size,
        ...(bundle.gzipSize !== undefined && { gzipSize: bundle.gzipSize }),
        ...(bundle.gzipSize !== undefined && {
          compressionRatio: bundle.gzipSize / bundle.size,
        }),
      }))
      .sort((a, b) => b.size - a.size)
      .slice(ZERO, COUNT_TEN);

    const recommendations: string[] = [];

    // 生成优化建议
    if (totalSize > COUNT_FIVE * BYTES_PER_KB * BYTES_PER_KB) {
      // 5MB
      recommendations.push(
        'Total bundle size is large. Consider code splitting and lazy loading.',
      );
    }

    const largeBundles = largestBundles.filter(
      (b) => b.size > BYTES_PER_KB * BYTES_PER_KB,
    ); // 1MB
    if (largeBundles.length > ZERO) {
      recommendations.push(
        `${largeBundles.length} bundles are larger than 1MB. Consider splitting them.`,
      );
    }

    const poorCompressionBundles = largestBundles.filter(
      (b) => b.compressionRatio && b.compressionRatio > MAGIC_0_8,
    );
    if (poorCompressionBundles.length > ZERO) {
      recommendations.push(
        `${poorCompressionBundles.length} bundles have poor compression ratios. Check for duplicate code.`,
      );
    }

    return {
      totalBundles: bundles.length,
      totalSize,
      totalGzipSize,
      largestBundles,
      recommendations,
    };
  }

  /**
   * 生成Chunk分析报告
   * Generate chunk analysis report
   */
  generateChunkReport(): {
    totalChunks: number;
    totalSize: number;
    largestChunks: Array<{
      name: string;
      size: number;
      moduleCount: number;
      topModules: string[];
    }>;
    duplicateModules: Array<{
      module: string;
      chunks: string[];
      totalSize: number;
    }>;
  } {
    const chunks = Array.from(this.chunks.entries());
    const totalSize = chunks.reduce((sum, [, chunk]) => sum + chunk.size, ZERO);

    const largestChunks = chunks
      .map(([name, chunk]) => ({
        name,
        size: chunk.size,
        moduleCount: chunk.modules.length,
        topModules: chunk.modules.slice(ZERO, COUNT_FIVE),
      }))
      .sort((a, b) => b.size - a.size)
      .slice(ZERO, COUNT_TEN);

    // 查找重复模块
    const moduleChunkMap = new Map<string, string[]>();
    chunks.forEach(([chunkName, chunk]) => {
      chunk.modules.forEach((module) => {
        if (!moduleChunkMap.has(module)) {
          moduleChunkMap.set(module, []);
        }
        moduleChunkMap.get(module)!.push(chunkName);
      });
    });

    const duplicateModules = Array.from(moduleChunkMap.entries())
      .filter(([, chunkList]) => chunkList.length > ONE)
      .map(([module, chunkList]) => ({
        module,
        chunks: chunkList,
        totalSize: chunkList.length * ANIMATION_DURATION_VERY_SLOW, // 估算大小
      }))
      .sort((a, b) => b.totalSize - a.totalSize)
      .slice(ZERO, COUNT_TEN);

    return {
      totalChunks: chunks.length,
      totalSize,
      largestChunks,
      duplicateModules,
    };
  }

  /**
   * 格式化文件大小
   * Format file size
   */
  private formatSize(bytes: number): string {
    const getUnit = (index: number): 'B' | 'KB' | 'MB' | 'GB' => {
      switch (true) {
        case index <= 0:
          return 'B';
        case index === 1:
          return 'KB';
        case index === 2:
          return 'MB';
        default:
          return 'GB';
      }
    };

    let size = bytes;
    let unitIndex = ZERO;

    while (size >= BYTES_PER_KB && unitIndex < 3) {
      size /= BYTES_PER_KB;
      unitIndex += ONE;
    }

    return `${size.toFixed(COUNT_PAIR)} ${getUnit(unitIndex)}`;
  }

  /**
   * 获取优化建议
   * Get optimization suggestions
   */
  getOptimizationSuggestions(): string[] {
    const suggestions: string[] = [];
    const bundleReport = this.generateBundleReport();
    const chunkReport = this.generateChunkReport();

    // Bundle优化建议
    if (bundleReport.totalSize > COUNT_FIVE * BYTES_PER_KB * BYTES_PER_KB) {
      suggestions.push(
        'Consider implementing code splitting to reduce initial bundle size',
      );
    }

    if (bundleReport.largestBundles.length > ZERO) {
      const largest = bundleReport.largestBundles.at(ZERO);
      if (largest && largest.size > COUNT_PAIR * BYTES_PER_KB * BYTES_PER_KB) {
        suggestions.push(
          `Bundle "${largest.name}" is very large (${this.formatSize(largest.size)}). Consider splitting it.`,
        );
      }
    }

    // Chunk优化建议
    if (chunkReport.duplicateModules.length > ZERO) {
      suggestions.push(
        `Found ${chunkReport.duplicateModules.length} duplicate modules. Consider creating shared chunks.`,
      );
    }

    if (chunkReport.totalChunks > PERCENTAGE_HALF) {
      suggestions.push(
        'Large number of chunks detected. Consider consolidating smaller chunks.',
      );
    }

    return suggestions;
  }

  /**
   * 重置所有数据
   * Reset all data
   */
  reset(): void {
    this.bundles.clear();
    this.chunks.clear();
  }
}

/**
 * Bundle Analyzer 工具函数
 * Bundle Analyzer utility functions
 */
export const BundleAnalyzerUtils = {
  /**
   * 计算压缩比
   * Calculate compression ratio
   */
  calculateCompressionRatio(
    originalSize: number,
    compressedSize: number,
  ): number {
    return compressedSize / originalSize;
  },

  /**
   * 获取大小等级
   * Get size rating
   */
  getSizeRating(size: number): 'small' | 'medium' | 'large' | 'huge' {
    if (size < PERCENTAGE_FULL * BYTES_PER_KB) return 'small'; // < 100KB
    if (size < ANIMATION_DURATION_SLOW * BYTES_PER_KB) return 'medium'; // < 500KB
    if (size < BYTES_PER_KB * BYTES_PER_KB) return 'large'; // < 1MB
    return 'huge'; // >= 1MB
  },

  /**
   * 估算加载时间
   * Estimate loading time
   */
  estimateLoadingTime(
    size: number,
    connectionSpeed: 'slow' | 'fast' | 'average' = 'average',
  ): number {
    const speedBps = (() => {
      switch (connectionSpeed) {
        case 'slow':
          return (BYTES_PER_KB * BYTES_PER_KB) / MAGIC_8; // 1 Mbps in Bps
        case 'fast':
          return (PERCENTAGE_QUARTER * BYTES_PER_KB * BYTES_PER_KB) / MAGIC_8;
        default:
          return (COUNT_FIVE * BYTES_PER_KB * BYTES_PER_KB) / MAGIC_8; // average
      }
    })();

    return (size / speedBps) * ANIMATION_DURATION_VERY_SLOW; // Return in milliseconds
  },
} as const;
