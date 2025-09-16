/**
 * 语言存储分析和统计 - 主入口
 * Locale Storage Analytics - Main Entry Point
 *
 * 统一的语言存储分析入口，整合所有分析功能模块
 */

'use client';

// 重新导出所有模块的功能
// 导入主要功能用于向后兼容
import {
  calculateHealthCheck,
  calculateStorageEfficiency,
  calculateStorageStats,
  getStorageStats,
  performHealthCheck,
} from './locale-storage-analytics-core';
import {
  AccessLogger,
  cleanupAnalyticsData,
  ErrorLogger,
  EventManager,
} from './locale-storage-analytics-events';
import {
  getPerformanceMetrics,
  getUsagePatterns,
  getUsageTrends,
  type PerformanceMetrics,
  type UsagePatterns,
  type UsageTrends,
} from './locale-storage-analytics-performance';
import {
  CacheManager,
  compressAnalyticsData,
  exportAnalyticsData,
  exportAnalyticsDataAsCsv,
  exportAnalyticsDataAsJson,
  formatByteSize,
  formatDuration,
  formatPercentage,
  generateUniqueId,
  optimizeAnalyticsStorage,
  validateAnalyticsData,
  type ExportData,
} from './locale-storage-analytics-utils';
import type {
  StorageEvent,
  StorageEventListener,
  StorageHealthCheck,
  StorageOperationResult,
  StorageStats,
} from './locale-storage-types';

export * from '@/../backups/barrel-exports/src/lib/locale-storage-analytics-core';
export * from '@/../backups/barrel-exports/src/lib/locale-storage-analytics-events';
export * from '@/../backups/barrel-exports/src/lib/locale-storage-analytics-performance';
export * from '@/../backups/barrel-exports/src/lib/locale-storage-analytics-utils';

/**
 * 存储分析管理器 - 向后兼容类
 * Storage analytics manager - Backward compatible class
 */
export class LocaleStorageAnalytics {
  /**
   * 获取存储统计信息
   * Get storage statistics
   */
  static getStorageStats(): StorageOperationResult<StorageStats> {
    const startTime = Date.now();

    try {
      // 检查缓存
      const cached = CacheManager.getCachedMetrics('storage_stats');
      if (cached) {
        return {
          success: true,
          data: cached as StorageStats,
          source: 'memory',
          timestamp: Date.now(),
          responseTime: Date.now() - startTime,
        };
      }

      const stats = calculateStorageStats();

      // 缓存结果
      CacheManager.setCachedMetrics('storage_stats', stats);

      // 记录访问
      AccessLogger.logAccess(
        'storage_stats',
        'read',
        true,
        Date.now() - startTime,
      );

      return {
        success: true,
        data: stats,
        source: 'localStorage',
        timestamp: Date.now(),
        responseTime: Date.now() - startTime,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      ErrorLogger.logError(errorMessage, 'getStorageStats');
      AccessLogger.logAccess(
        'storage_stats',
        'read',
        false,
        Date.now() - startTime,
        errorMessage,
      );

      return {
        success: false,
        error: errorMessage,
        source: 'localStorage',
        timestamp: Date.now(),
        responseTime: Date.now() - startTime,
      };
    }
  }

  /**
   * 执行存储健康检查
   * Perform storage health check
   */
  static performHealthCheck(): StorageOperationResult<StorageHealthCheck> {
    return performHealthCheck();
  }

  /**
   * 记录访问日志
   * Log access
   */
  static logAccess(key: string, operation: string, success: boolean): void {
    AccessLogger.logAccess(key, operation, success);
  }

  /**
   * 记录错误日志
   * Log error
   */
  static logError(error: string, context?: string): void {
    ErrorLogger.logError(error, context);
  }

  /**
   * 获取使用模式
   * Get usage patterns
   */
  static getUsagePatterns(): UsagePatterns {
    return getUsagePatterns();
  }

  /**
   * 获取性能指标
   * Get performance metrics
   */
  static getPerformanceMetrics(): PerformanceMetrics {
    return getPerformanceMetrics();
  }

  /**
   * 获取使用趋势
   * Get usage trends
   */
  static getUsageTrends(days: number = 7): UsageTrends {
    return getUsageTrends(days);
  }

  /**
   * 清理分析数据
   * Cleanup analytics data
   */
  static cleanupAnalyticsData(maxAge: number = 7 * 24 * 60 * 60 * 1000): void {
    cleanupAnalyticsData(maxAge);
  }

  /**
   * 导出分析数据
   * Export analytics data
   */
  static exportAnalyticsData(): ExportData {
    return exportAnalyticsData();
  }

  /**
   * 添加事件监听器
   * Add event listener
   */
  static addEventListener(
    eventType: string,
    listener: StorageEventListener,
  ): void {
    EventManager.addEventListener(eventType, listener);
  }

  /**
   * 移除事件监听器
   * Remove event listener
   */
  static removeEventListener(
    eventType: string,
    listener: StorageEventListener,
  ): void {
    EventManager.removeEventListener(eventType, listener);
  }

  /**
   * 移除所有事件监听器
   * Remove all event listeners
   */
  static removeAllListeners(): void {
    EventManager.removeAllListeners();
  }
}

// ==================== 向后兼容的类型别名 ====================

/**
 * 向后兼容的类型别名
 * Backward compatible type aliases
 */
export type {
  LocaleStorageAnalytics as Analytics,
  UsagePatterns,
  PerformanceMetrics,
  UsageTrends,
  ExportData,
};
