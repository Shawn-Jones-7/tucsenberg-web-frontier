/**
 * 语言存储分析工具函数和缓存管理
 * Locale Storage Analytics Utilities and Cache Management
 *
 * 负责缓存管理、数据导出和通用工具函数
 */

'use client';

import { MAGIC_0_1 } from "@/constants/decimal";
import { ANIMATION_DURATION_VERY_SLOW, BYTES_PER_KB, COUNT_FIVE, COUNT_PAIR, HOURS_PER_DAY, ONE, PERCENTAGE_FULL, PERCENTAGE_HALF, SECONDS_PER_MINUTE, ZERO } from '@/constants';

import { AccessLogger, ErrorLogger } from '@/lib/locale-storage-analytics-events';
import type { StorageHealthCheck, StorageStats } from '@/lib/locale-storage-types';
import {
  getStorageStats,
  performHealthCheck,
} from '@/lib/locale-storage-analytics-core';
import {
  getPerformanceMetrics,
  getUsagePatterns,
  getUsageTrends,
} from '@/lib/locale-storage-analytics-performance';

// ==================== 缓存管理 ====================

/**
 * 缓存条目
 * Cache entry
 */
interface CacheEntry {
  data: unknown;
  timestamp: number;
}

/**
 * 缓存管理器
 * Cache manager
 */
export class CacheManager {
  private static metricsCache: Map<string, CacheEntry> = new Map();
  private static readonly CACHE_TTL = COUNT_FIVE * SECONDS_PER_MINUTE * ANIMATION_DURATION_VERY_SLOW; // 5 minutes

  /**
   * 获取缓存的指标
   * Get cached metrics
   */
  static getCachedMetrics(key: string): unknown | null {
    const cached = this.metricsCache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data;
    }
    return null;
  }

  /**
   * 设置缓存的指标
   * Set cached metrics
   */
  static setCachedMetrics(key: string, data: unknown): void {
    this.metricsCache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  /**
   * 使缓存失效
   * Invalidate cache
   */
  static invalidateCache(key?: string): void {
    if (key) {
      this.metricsCache.delete(key);
    } else {
      this.metricsCache.clear();
    }
  }

  /**
   * 清理过期缓存
   * Clean expired cache
   */
  static cleanExpiredCache(): void {
    const now = Date.now();
    for (const [key, entry] of this.metricsCache.entries()) {
      if (now - entry.timestamp >= this.CACHE_TTL) {
        this.metricsCache.delete(key);
      }
    }
  }

  /**
   * 获取缓存统计
   * Get cache statistics
   */
  static getCacheStats(): {
    totalEntries: number;
    validEntries: number;
    expiredEntries: number;
    hitRate: number;
    memoryUsage: number;
  } {
    const now = Date.now();
    let validEntries = ZERO;
    let expiredEntries = ZERO;
    let memoryUsage = ZERO;

    for (const [_key, entry] of this.metricsCache.entries()) {
      if (now - entry.timestamp < this.CACHE_TTL) {
        validEntries += ONE;
      } else {
        expiredEntries += ONE;
      }

      // 估算内存使用量
      memoryUsage += JSON.stringify(entry).length * COUNT_PAIR; // 粗略估算
    }

    // 简单的命中率计算（基于有效条目比例）
    const totalEntries = validEntries + expiredEntries;
    const hitRate = totalEntries > ZERO ? (validEntries / totalEntries) * PERCENTAGE_FULL : ZERO;

    return {
      totalEntries,
      validEntries,
      expiredEntries,
      hitRate,
      memoryUsage,
    };
  }
}

// ==================== 数据导出 ====================

/**
 * 导出数据格式
 * Export data format
 */
export interface ExportData {
  stats: StorageStats;
  healthCheck: StorageHealthCheck;
  usagePatterns: ReturnType<typeof getUsagePatterns>;
  performanceMetrics: ReturnType<typeof getPerformanceMetrics>;
  usageTrends: ReturnType<typeof getUsageTrends>;
  accessLog: ReturnType<typeof AccessLogger.getAccessLog>;
  errorLog: ReturnType<typeof ErrorLogger.getErrorLog>;
  exportTimestamp: number;
  exportVersion: string;
}

/**
 * 导出分析数据
 * Export analytics data
 */
export function exportAnalyticsData(): ExportData {
  return {
    stats: getStorageStats().data!,
    healthCheck: performHealthCheck().data!,
    usagePatterns: getUsagePatterns(),
    performanceMetrics: getPerformanceMetrics(),
    usageTrends: getUsageTrends(),
    accessLog: AccessLogger.getAccessLog(PERCENTAGE_FULL), // 限制为最近100条
    errorLog: ErrorLogger.getErrorLog(PERCENTAGE_HALF), // 限制为最近50条
    exportTimestamp: Date.now(),
    exportVersion: '1.0.0',
  };
}

/**
 * 导出为JSON字符串
 * Export as JSON string
 */
export function exportAnalyticsDataAsJson(): string {
  const data = exportAnalyticsData();
  return JSON.stringify(data, null, COUNT_PAIR);
}

/**
 * 导出为CSV格式
 * Export as CSV format
 */
export function exportAnalyticsDataAsCsv(): string {
  const data = exportAnalyticsData();
  const lines: string[] = [];

  // 访问日志CSV
  lines.push('=== Access Log ===');
  lines.push('Timestamp,Key,Operation,Success,Response Time,Error');

  for (const entry of data.accessLog) {
    lines.push(
      [
        new Date(entry.timestamp).toISOString(),
        entry.key,
        entry.operation,
        entry.success.toString(),
        entry.responseTime?.toString() || '',
        entry.error || '',
      ].join(','),
    );
  }

  lines.push('');
  lines.push('=== Error Log ===');
  lines.push('Timestamp,Error,Context,Severity');

  for (const entry of data.errorLog) {
    lines.push(
      [
        new Date(entry.timestamp).toISOString(),
        entry.error,
        entry.context || '',
        entry.severity,
      ].join(','),
    );
  }

  lines.push('');
  lines.push('=== Usage Trends ===');
  lines.push('Date,Operations');

  for (const entry of data.usageTrends.dailyOperations) {
    lines.push([entry.date, entry.operations.toString()].join(','));
  }

  return lines.join('\n');
}

// ==================== 数据验证 ====================

/**
 * 验证分析数据完整性
 * Validate analytics data integrity
 */
export function validateAnalyticsData(): {
  isValid: boolean;
  issues: string[];
  recommendations: string[];
} {
  const issues: string[] = [];
  const recommendations: string[] = [];

  try {
    runBaseChecks(issues);
    runLogChecks(issues, recommendations);
    runRecencyChecks(issues, recommendations);
    runCacheChecks(recommendations);
  } catch (error) {
    issues.push(
      `数据验证过程中发生错误: ${error instanceof Error ? error.message : '未知错误'}`,
    );
  }

  return {
    isValid: issues.length === ZERO,
    issues,
    recommendations,
  };
}

function runBaseChecks(issues: string[]): void {
  const stats = getStorageStats();
  if (!stats.success) {
    issues.push('无法获取存储统计信息');
  }

  const healthCheck = performHealthCheck();
  if (!healthCheck.success) {
    issues.push('无法执行健康检查');
  }
}

function runLogChecks(issues: string[], recommendations: string[]): void {
  const accessLog = AccessLogger.getAccessLog();
  const errorLog = ErrorLogger.getErrorLog();

  if (accessLog.length === ZERO) {
    issues.push('访问日志为空');
    recommendations.push('开始记录存储操作以收集分析数据');
  }

  if (errorLog.length > accessLog.length * MAGIC_0_1) {
    issues.push('错误率过高');
    recommendations.push('检查存储操作逻辑，减少错误发生');
  }
}

function runRecencyChecks(issues: string[], recommendations: string[]): void {
  const accessLog = AccessLogger.getAccessLog();
  const now = Date.now();
  const oneHourAgo = now - SECONDS_PER_MINUTE * SECONDS_PER_MINUTE * ANIMATION_DURATION_VERY_SLOW;
  const recentAccess = accessLog.filter((entry) => entry.timestamp > oneHourAgo);

  if (recentAccess.length === ZERO && accessLog.length > ZERO) {
    issues.push('最近一小时无活动记录');
    recommendations.push('检查应用是否正常运行');
  }
}

function runCacheChecks(recommendations: string[]): void {
  const cacheStats = CacheManager.getCacheStats();
  if (cacheStats.expiredEntries > cacheStats.validEntries) {
    recommendations.push('清理过期缓存以提高性能');
  }
}

// ==================== 数据压缩和优化 ====================

/**
 * 压缩分析数据
 * Compress analytics data
 */
export function compressAnalyticsData(): {
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  compressedData: string;
} {
  const originalData = exportAnalyticsDataAsJson();
  const originalSize = originalData.length;

  // 简单的数据压缩：移除不必要的空白和重复信息
  const compressedData = JSON.stringify(exportAnalyticsData());
  const compressedSize = compressedData.length;

  const compressionRatio =
    originalSize > ZERO ? (ONE - compressedSize / originalSize) * PERCENTAGE_FULL : ZERO;

  return {
    originalSize,
    compressedSize,
    compressionRatio,
    compressedData,
  };
}

/**
 * 优化分析数据存储
 * Optimize analytics data storage
 */
export function optimizeAnalyticsStorage(): {
  beforeOptimization: {
    accessLogSize: number;
    errorLogSize: number;
    cacheSize: number;
  };
  afterOptimization: {
    accessLogSize: number;
    errorLogSize: number;
    cacheSize: number;
  };
  optimizationResults: string[];
} {
  const before = snapshotState();
  const results: string[] = [];

  // 1. 清理过期缓存
  if (cleanExpiredCache()) {
    results.push('清理了过期缓存');
  }

  // 2. 压缩访问日志（保留最近1000条）
  const compressedAccess = compressAccessLog(before.accessLogSize);
  if (compressedAccess) {
    results.push(`压缩访问日志：${before.accessLogSize} -> 1000 条`);
  }

  // 3. 压缩错误日志（保留最近500条）
  const compressedError = compressErrorLog(before.errorLogSize);
  if (compressedError) {
    results.push(`压缩错误日志：${before.errorLogSize} -> 500 条`);
  }

  const after = snapshotState();

  if (results.length === ZERO) {
    results.push('无需优化，数据已处于最佳状态');
  }

  return {
    beforeOptimization: before,
    afterOptimization: after,
    optimizationResults: results,
  };
}

function snapshotState(): { accessLogSize: number; errorLogSize: number; cacheSize: number } {
  const accessLogSize = AccessLogger.getAccessLog().length;
  const errorLogSize = ErrorLogger.getErrorLog().length;
  const cacheSize = CacheManager.getCacheStats().totalEntries;
  return { accessLogSize, errorLogSize, cacheSize };
}

function cleanExpiredCache(): boolean {
  const before = CacheManager.getCacheStats().expiredEntries;
  CacheManager.cleanExpiredCache();
  const after = CacheManager.getCacheStats().expiredEntries;
  return after <= before;
}

function compressAccessLog(beforeSize: number): boolean {
  if (beforeSize <= ANIMATION_DURATION_VERY_SLOW) return false;
  const beforeAccessLog = AccessLogger.getAccessLog();
  const recentAccessLog = beforeAccessLog.slice(ZERO, ANIMATION_DURATION_VERY_SLOW);
  AccessLogger.clearAccessLog();
  recentAccessLog.forEach((entry) => {
    AccessLogger.logAccess({
      key: entry.key,
      operation: entry.operation,
      success: entry.success,
      ...(entry.responseTime !== undefined && { responseTime: entry.responseTime }),
      ...(entry.error !== undefined && { error: entry.error }),
    });
  });
  return true;
}

function compressErrorLog(beforeSize: number): boolean {
  if (beforeSize <= 500) return false;
  const beforeErrorLog = ErrorLogger.getErrorLog();
  const recentErrorLog = beforeErrorLog.slice(ZERO, 500);
  ErrorLogger.clearErrorLog();
  recentErrorLog.forEach((entry) => {
    ErrorLogger.logError({
      error: entry.error,
      ...(entry.context !== undefined && { context: entry.context }),
      severity: entry.severity,
      ...(entry.stack !== undefined && { stack: entry.stack }),
    });
  });
  return true;
}

// ==================== 工具函数 ====================

/**
 * 格式化字节大小
 * Format byte size
 */
export function formatByteSize(bytes: number): string {
  let size = bytes;
  let unitIndex = ZERO;

  while (size >= BYTES_PER_KB && unitIndex < 3) {
    size /= BYTES_PER_KB;
    unitIndex += ONE;
  }

  const unit = ((): 'B' | 'KB' | 'MB' | 'GB' => {
    switch (unitIndex) {
      case 0: return 'B';
      case 1: return 'KB';
      case 2: return 'MB';
      case 3: return 'GB';
      default: return 'GB';
    }
  })();

  return `${size.toFixed(COUNT_PAIR)} ${unit}`;
}

/**
 * 格式化持续时间
 * Format duration
 */
export function formatDuration(milliseconds: number): string {
  const seconds = Math.floor(milliseconds / ANIMATION_DURATION_VERY_SLOW);
  const minutes = Math.floor(seconds / SECONDS_PER_MINUTE);
  const hours = Math.floor(minutes / SECONDS_PER_MINUTE);
  const days = Math.floor(hours / HOURS_PER_DAY);

  if (days > ZERO) {
    return `${days}天 ${hours % HOURS_PER_DAY}小时`;
  }
  if (hours > ZERO) {
    return `${hours}小时 ${minutes % SECONDS_PER_MINUTE}分钟`;
  }
  if (minutes > ZERO) {
    return `${minutes}分钟 ${seconds % SECONDS_PER_MINUTE}秒`;
  }
  return `${seconds}秒`;
}

/**
 * 格式化百分比
 * Format percentage
 */
export function formatPercentage(value: number, decimals: number = ONE): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * 生成唯一ID
 * Generate unique ID
 */
export function generateUniqueId(): string {
  return `analytics_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
