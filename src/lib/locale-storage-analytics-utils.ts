/**
 * 语言存储分析工具函数和缓存管理
 * Locale Storage Analytics Utilities and Cache Management
 *
 * 负责缓存管理、数据导出和通用工具函数
 */

'use client';

import {
  getStorageStats,
  performHealthCheck,
} from './locale-storage-analytics-core';
import { AccessLogger, ErrorLogger } from '@/lib/locale-storage-analytics-events';
import {
  getPerformanceMetrics,
  getUsagePatterns,
  getUsageTrends,
} from './locale-storage-analytics-performance';
import type { StorageHealthCheck, StorageStats } from '@/lib/locale-storage-types';

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
  private static readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

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
    let validEntries = 0;
    let expiredEntries = 0;
    let memoryUsage = 0;

    for (const [_key, entry] of this.metricsCache.entries()) {
      if (now - entry.timestamp < this.CACHE_TTL) {
        validEntries += 1;
      } else {
        expiredEntries += 1;
      }

      // 估算内存使用量
      memoryUsage += JSON.stringify(entry).length * 2; // 粗略估算
    }

    // 简单的命中率计算（基于有效条目比例）
    const totalEntries = validEntries + expiredEntries;
    const hitRate = totalEntries > 0 ? (validEntries / totalEntries) * 100 : 0;

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
    accessLog: AccessLogger.getAccessLog(100), // 限制为最近100条
    errorLog: ErrorLogger.getErrorLog(50), // 限制为最近50条
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
  return JSON.stringify(data, null, 2);
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
    // 检查基础数据
    const stats = getStorageStats();
    if (!stats.success) {
      issues.push('无法获取存储统计信息');
    }

    const healthCheck = performHealthCheck();
    if (!healthCheck.success) {
      issues.push('无法执行健康检查');
    }

    // 检查日志数据
    const accessLog = AccessLogger.getAccessLog();
    const errorLog = ErrorLogger.getErrorLog();

    if (accessLog.length === 0) {
      issues.push('访问日志为空');
      recommendations.push('开始记录存储操作以收集分析数据');
    }

    if (errorLog.length > accessLog.length * 0.1) {
      issues.push('错误率过高');
      recommendations.push('检查存储操作逻辑，减少错误发生');
    }

    // 检查数据时效性
    const now = Date.now();
    const oneHourAgo = now - 60 * 60 * 1000;
    const recentAccess = accessLog.filter(
      (entry) => entry.timestamp > oneHourAgo,
    );

    if (recentAccess.length === 0 && accessLog.length > 0) {
      issues.push('最近一小时无活动记录');
      recommendations.push('检查应用是否正常运行');
    }

    // 检查缓存状态
    const cacheStats = CacheManager.getCacheStats();
    if (cacheStats.expiredEntries > cacheStats.validEntries) {
      recommendations.push('清理过期缓存以提高性能');
    }
  } catch (error) {
    issues.push(
      `数据验证过程中发生错误: ${error instanceof Error ? error.message : '未知错误'}`,
    );
  }

  return {
    isValid: issues.length === 0,
    issues,
    recommendations,
  };
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
    originalSize > 0 ? (1 - compressedSize / originalSize) * 100 : 0;

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
  const results: string[] = [];

  // 记录优化前的状态
  const beforeAccessLog = AccessLogger.getAccessLog();
  const beforeErrorLog = ErrorLogger.getErrorLog();
  const beforeCacheStats = CacheManager.getCacheStats();

  const before = {
    accessLogSize: beforeAccessLog.length,
    errorLogSize: beforeErrorLog.length,
    cacheSize: beforeCacheStats.totalEntries,
  };

  // 执行优化

  // 1. 清理过期缓存
  CacheManager.cleanExpiredCache();
  results.push('清理了过期缓存');

  // 2. 压缩访问日志（保留最近1000条）
  if (beforeAccessLog.length > 1000) {
    const recentAccessLog = beforeAccessLog.slice(0, 1000);
    AccessLogger.clearAccessLog();
    recentAccessLog.forEach((entry) => {
      AccessLogger.logAccess(
        entry.key,
        entry.operation,
        entry.success,
        entry.responseTime,
        entry.error,
      );
    });
    results.push(`压缩访问日志：${beforeAccessLog.length} -> 1000 条`);
  }

  // 3. 压缩错误日志（保留最近500条）
  if (beforeErrorLog.length > 500) {
    const recentErrorLog = beforeErrorLog.slice(0, 500);
    ErrorLogger.clearErrorLog();
    recentErrorLog.forEach((entry) => {
      ErrorLogger.logError(
        entry.error,
        entry.context,
        entry.severity,
        entry.stack,
      );
    });
    results.push(`压缩错误日志：${beforeErrorLog.length} -> 500 条`);
  }

  // 记录优化后的状态
  const afterAccessLog = AccessLogger.getAccessLog();
  const afterErrorLog = ErrorLogger.getErrorLog();
  const afterCacheStats = CacheManager.getCacheStats();

  const after = {
    accessLogSize: afterAccessLog.length,
    errorLogSize: afterErrorLog.length,
    cacheSize: afterCacheStats.totalEntries,
  };

  if (results.length === 0) {
    results.push('无需优化，数据已处于最佳状态');
  }

  return {
    beforeOptimization: before,
    afterOptimization: after,
    optimizationResults: results,
  };
}

// ==================== 工具函数 ====================

/**
 * 格式化字节大小
 * Format byte size
 */
export function formatByteSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }

  return `${size.toFixed(2)} ${units[unitIndex]}`;
}

/**
 * 格式化持续时间
 * Format duration
 */
export function formatDuration(milliseconds: number): string {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days}天 ${hours % 24}小时`;
  }
  if (hours > 0) {
    return `${hours}小时 ${minutes % 60}分钟`;
  }
  if (minutes > 0) {
    return `${minutes}分钟 ${seconds % 60}秒`;
  }
  return `${seconds}秒`;
}

/**
 * 格式化百分比
 * Format percentage
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * 生成唯一ID
 * Generate unique ID
 */
export function generateUniqueId(): string {
  return `analytics_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
