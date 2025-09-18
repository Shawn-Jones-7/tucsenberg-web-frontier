/**
 * 语言存储分析和统计 - 主入口
 * Locale Storage Analytics - Main Entry Point
 *
 * 统一的语言存储分析入口，整合所有分析功能模块
 */

'use client';

// 重新导出所有模块的功能
// 导入主要功能用于向后兼容
import { DAYS_PER_WEEK } from "@/constants/time";
import { ANIMATION_DURATION_VERY_SLOW, HOURS_PER_DAY, SECONDS_PER_MINUTE } from '@/constants';

import {
  calculateStorageStats,
  performHealthCheck,
} from '@/lib/locale-storage-analytics-core';
import {
  AccessLogger,
  cleanupAnalyticsData,
  ErrorLogger,
  EventManager,
} from '@/lib/locale-storage-analytics-events';
import {
  getPerformanceMetrics,
  getUsagePatterns,
  getUsageTrends,
  type PerformanceMetrics,
  type UsagePatterns,
  type UsageTrends,
} from '@/lib/locale-storage-analytics-performance';
import {
  CacheManager,
  exportAnalyticsData,
  type ExportData
} from '@/lib/locale-storage-analytics-utils';
import type {
  StorageEventListener,
  StorageHealthCheck,
  StorageOperationResult,
  StorageStats,
} from '@/lib/locale-storage-types';

export {
  calculateHealthCheck, calculateStorageEfficiency, calculateStorageStats,
  getStorageStats, performHealthCheck
} from '@/lib/locale-storage-analytics-core';
export {
  cleanupAnalyticsData, EventManager
} from '@/lib/locale-storage-analytics-events';
export type {
  AccessLogEntry,
  AccessLogger,
  ErrorLogEntry,
  ErrorLogger
} from '@/lib/locale-storage-analytics-events';
export {
  getPerformanceMetrics, getUsagePatterns, getUsageTrends
} from '@/lib/locale-storage-analytics-performance';
export {
  CacheManager, compressAnalyticsData, exportAnalyticsData, formatByteSize,
  formatDuration,
  formatPercentage,
  generateUniqueId, optimizeAnalyticsStorage, validateAnalyticsData
} from '@/lib/locale-storage-analytics-utils';

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
      AccessLogger.logAccess({
        key: 'storage_stats',
        operation: 'read',
        success: true,
        responseTime: Date.now() - startTime,
      });

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
      ErrorLogger.logError({ error: errorMessage, context: 'getStorageStats' });
      AccessLogger.logAccess({
        key: 'storage_stats',
        operation: 'read',
        success: false,
        responseTime: Date.now() - startTime,
        error: errorMessage,
      });

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
    AccessLogger.logAccess({ key, operation, success });
  }

  /**
   * 记录错误日志
   * Log error
   */
  static logError(error: string, context?: string): void {
    ErrorLogger.logError({ error, context });
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
  static getUsageTrends(days: number = DAYS_PER_WEEK): UsageTrends {
    return getUsageTrends(days);
  }

  /**
   * 清理分析数据
   * Cleanup analytics data
   */
  static cleanupAnalyticsData(maxAge: number = DAYS_PER_WEEK * HOURS_PER_DAY * SECONDS_PER_MINUTE * SECONDS_PER_MINUTE * ANIMATION_DURATION_VERY_SLOW): void {
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
  LocaleStorageAnalytics as Analytics, ExportData, PerformanceMetrics, UsagePatterns, UsageTrends
};
