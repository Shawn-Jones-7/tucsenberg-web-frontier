/**
 * 语言存储分析事件和日志管理
 * Locale Storage Analytics Events and Logging
 *
 * 负责事件监听、访问日志和错误日志管理
 */

'use client';

import { logger } from '@/lib/logger';
import type {
  StorageEvent,
  StorageEventListener,
} from './locale-storage-types';

// ==================== 事件管理 ====================

/**
 * 事件监听器管理
 * Event listener management
 */
export class EventManager {
  private static eventListeners: Map<string, StorageEventListener[]> =
    new Map();

  /**
   * 添加事件监听器
   * Add event listener
   */
  static addEventListener(
    eventType: string,
    listener: StorageEventListener,
  ): void {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, []);
    }
    this.eventListeners.get(eventType)!.push(listener);
  }

  /**
   * 移除事件监听器
   * Remove event listener
   */
  static removeEventListener(
    eventType: string,
    listener: StorageEventListener,
  ): void {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  /**
   * 移除所有事件监听器
   * Remove all event listeners
   */
  static removeAllListeners(eventType?: string): void {
    if (eventType) {
      this.eventListeners.delete(eventType);
    } else {
      this.eventListeners.clear();
    }
  }

  /**
   * 触发事件
   * Emit event
   */
  static emitEvent(event: StorageEvent): void {
    const listeners = this.eventListeners.get(event.type);
    if (listeners) {
      listeners.forEach((listener) => {
        try {
          listener(event);
        } catch (error) {
          logger.error('Error in storage event listener:', error);
        }
      });
    }
  }

  /**
   * 获取事件监听器数量
   * Get event listener count
   */
  static getListenerCount(eventType?: string): number {
    if (eventType) {
      return this.eventListeners.get(eventType)?.length || 0;
    }

    let total = 0;
    for (const listeners of this.eventListeners.values()) {
      total += listeners.length;
    }
    return total;
  }

  /**
   * 获取所有事件类型
   * Get all event types
   */
  static getEventTypes(): string[] {
    return Array.from(this.eventListeners.keys());
  }
}

// ==================== 访问日志管理 ====================

/**
 * 访问日志条目
 * Access log entry
 */
export interface AccessLogEntry {
  key: string;
  operation: string;
  timestamp: number;
  success: boolean;
  responseTime?: number;
  error?: string;
}

/**
 * 访问日志管理器
 * Access log manager
 */
export class AccessLogger {
  private static accessLog: AccessLogEntry[] = [];
  private static readonly MAX_LOG_ENTRIES = 1000;

  /**
   * 记录访问日志
   * Log access
   */
  static logAccess(
    key: string,
    operation: string,
    success: boolean,
    responseTime?: number,
    error?: string,
  ): void {
    const logEntry: AccessLogEntry = {
      key,
      operation,
      timestamp: Date.now(),
      success,
      ...(responseTime !== undefined && { responseTime }),
      ...(error !== undefined && { error }),
    };

    this.accessLog.unshift(logEntry);

    // 限制日志条目数量
    if (this.accessLog.length > this.MAX_LOG_ENTRIES) {
      this.accessLog = this.accessLog.slice(0, this.MAX_LOG_ENTRIES);
    }

    // 触发访问事件
    EventManager.emitEvent({
      type: 'preference_loaded',
      timestamp: Date.now(),
      source: 'analytics-events',
      data: logEntry,
    });
  }

  /**
   * 获取访问日志
   * Get access log
   */
  static getAccessLog(limit?: number): AccessLogEntry[] {
    return limit ? this.accessLog.slice(0, limit) : [...this.accessLog];
  }

  /**
   * 清理访问日志
   * Clear access log
   */
  static clearAccessLog(): void {
    this.accessLog = [];
  }

  /**
   * 获取访问统计
   * Get access statistics
   */
  static getAccessStats(): {
    totalOperations: number;
    successRate: number;
    averageResponseTime: number;
    operationCounts: Record<string, number>;
    keyCounts: Record<string, number>;
    recentErrors: AccessLogEntry[];
  } {
    const total = this.accessLog.length;
    const successful = this.accessLog.filter((entry) => entry.success).length;
    const successRate = total > 0 ? (successful / total) * 100 : 100;

    // 计算平均响应时间
    const responseTimes = this.accessLog
      .filter((entry) => entry.responseTime !== undefined)
      .map((entry) => entry.responseTime!);
    const averageResponseTime =
      responseTimes.length > 0
        ? responseTimes.reduce((sum, time) => sum + time, 0) /
          responseTimes.length
        : 0;

    // 统计操作类型
    const operationCounts: Record<string, number> = {};
    const keyCounts: Record<string, number> = {};

    for (const entry of this.accessLog) {
      operationCounts[entry.operation] =
        (operationCounts[entry.operation] || 0) + 1;
      keyCounts[entry.key] = (keyCounts[entry.key] || 0) + 1;
    }

    // 获取最近的错误
    const recentErrors = this.accessLog
      .filter((entry) => !entry.success)
      .slice(0, 10);

    return {
      totalOperations: total,
      successRate,
      averageResponseTime,
      operationCounts,
      keyCounts,
      recentErrors,
    };
  }
}

// ==================== 错误日志管理 ====================

/**
 * 错误日志条目
 * Error log entry
 */
export interface ErrorLogEntry {
  error: string;
  timestamp: number;
  context?: string;
  stack?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

/**
 * 错误日志管理器
 * Error log manager
 */
export class ErrorLogger {
  private static errorLog: ErrorLogEntry[] = [];
  private static readonly MAX_ERROR_ENTRIES = 500;

  /**
   * 记录错误
   * Log error
   */
  static logError(
    error: string,
    context?: string,
    severity: ErrorLogEntry['severity'] = 'medium',
    stack?: string,
  ): void {
    const errorEntry: ErrorLogEntry = {
      error,
      timestamp: Date.now(),
      severity,
      ...(context !== undefined && { context }),
      ...(stack !== undefined && { stack }),
    };

    this.errorLog.unshift(errorEntry);

    // 限制错误日志条目数量
    if (this.errorLog.length > this.MAX_ERROR_ENTRIES) {
      this.errorLog = this.errorLog.slice(0, this.MAX_ERROR_ENTRIES);
    }

    // 触发错误事件
    EventManager.emitEvent({
      type: 'error_occurred',
      timestamp: Date.now(),
      source: 'analytics-events',
      data: errorEntry,
    });

    // 对于严重错误，额外处理
    if (severity === 'critical') {
      logger.error('Critical storage error:', error, context);
    }
  }

  /**
   * 获取错误日志
   * Get error log
   */
  static getErrorLog(limit?: number): ErrorLogEntry[] {
    return limit ? this.errorLog.slice(0, limit) : [...this.errorLog];
  }

  /**
   * 清理错误日志
   * Clear error log
   */
  static clearErrorLog(): void {
    this.errorLog = [];
  }

  /**
   * 获取错误统计
   * Get error statistics
   */
  static getErrorStats(): {
    totalErrors: number;
    errorRate: number;
    severityDistribution: Record<string, number>;
    recentErrors: ErrorLogEntry[];
    errorTrends: Array<{ date: string; count: number }>;
  } {
    const total = this.errorLog.length;
    const {totalOperations} = AccessLogger.getAccessStats();
    const errorRate = totalOperations > 0 ? (total / totalOperations) * 100 : 0;

    // 统计严重程度分布
    const severityDistribution: Record<string, number> = {
      low: 0,
      medium: 0,
      high: 0,
      critical: 0,
    };

    for (const entry of this.errorLog) {
      if (
        entry.severity &&
        severityDistribution[entry.severity] !== undefined
      ) {
        severityDistribution[entry.severity]! += 1;
      }
    }

    // 获取最近错误
    const recentErrors = this.errorLog.slice(0, 10);

    // 计算错误趋势（按天）
    const errorTrends = this.calculateErrorTrends();

    return {
      totalErrors: total,
      errorRate,
      severityDistribution,
      recentErrors,
      errorTrends,
    };
  }

  /**
   * 计算错误趋势
   * Calculate error trends
   */
  private static calculateErrorTrends(): Array<{
    date: string;
    count: number;
  }> {
    const trends: Record<string, number> = {};
    const now = new Date();

    // 初始化最近7天的数据
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0] || date.toISOString();
      trends[dateStr] = 0;
    }

    // 统计错误数量
    for (const entry of this.errorLog) {
      const date = new Date(entry.timestamp);
      const dateStr = date.toISOString().split('T')[0] || date.toISOString();
      if (Object.prototype.hasOwnProperty.call(trends, dateStr)) {
        trends[dateStr] = (trends[dateStr] || 0) + 1;
      }
    }

    return Object.entries(trends).map(([date, count]) => ({ date, count }));
  }
}

// ==================== 数据清理 ====================

/**
 * 清理分析数据
 * Cleanup analytics data
 */
export function cleanupAnalyticsData(
  maxAge: number = 7 * 24 * 60 * 60 * 1000,
): void {
  const cutoffTime = Date.now() - maxAge;

  // 清理访问日志
  const accessLog = AccessLogger.getAccessLog();
  const filteredAccessLog = accessLog.filter(
    (entry) => entry.timestamp > cutoffTime,
  );
  AccessLogger.clearAccessLog();
  filteredAccessLog.forEach((entry) => {
    AccessLogger.logAccess(
      entry.key,
      entry.operation,
      entry.success,
      entry.responseTime,
      entry.error,
    );
  });

  // 清理错误日志
  const errorLog = ErrorLogger.getErrorLog();
  const filteredErrorLog = errorLog.filter(
    (entry) => entry.timestamp > cutoffTime,
  );
  ErrorLogger.clearErrorLog();
  filteredErrorLog.forEach((entry) => {
    ErrorLogger.logError(
      entry.error,
      entry.context,
      entry.severity,
      entry.stack,
    );
  });

  // 触发清理事件
  EventManager.emitEvent({
    type: 'cache_cleared',
    timestamp: Date.now(),
    source: 'analytics-events',
    data: {
      maxAge,
      cutoffTime,
      accessLogCleaned: accessLog.length - filteredAccessLog.length,
      errorLogCleaned: errorLog.length - filteredErrorLog.length,
    },
  });
}
