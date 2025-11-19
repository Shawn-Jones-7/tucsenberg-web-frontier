/**
 * 语言存储分析事件和日志管理
 * Locale Storage Analytics Events and Logging
 *
 * 负责事件监听、访问日志和错误日志管理
 */

'use client';

import type {
  StorageEvent,
  StorageEventListener,
} from '@/lib/locale-storage-types';
import { logger } from '@/lib/logger';
import {
  ANIMATION_DURATION_VERY_SLOW,
  COUNT_TEN,
  HOURS_PER_DAY,
  ONE,
  PERCENTAGE_FULL,
  SECONDS_PER_MINUTE,
  ZERO,
} from '@/constants';
import { MAGIC_6 } from '@/constants/count';
import { DAYS_PER_WEEK } from '@/constants/time';

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
      if (index > -ONE) {
        listeners.splice(index, ONE);
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
      return this.eventListeners.get(eventType)?.length || ZERO;
    }

    let total = ZERO;
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

// 受控操作类型白名单（用于统计，未知类型归为 other）
type OperationType =
  | 'read'
  | 'write'
  | 'update'
  | 'remove'
  | 'delete'
  | 'clear'
  | 'list';

interface OperationCounts {
  read: number;
  write: number;
  update: number;
  remove: number;
  delete: number;
  clear: number;
  list: number;
  other: number;
}

function createEmptyOperationCounts(): OperationCounts {
  return {
    read: ZERO,
    write: ZERO,
    update: ZERO,
    remove: ZERO,
    delete: ZERO,
    clear: ZERO,
    list: ZERO,
    other: ZERO,
  };
}

function incrementOperationCount(target: OperationCounts, op: string): void {
  switch (op as OperationType) {
    case 'read':
      target.read += ONE;
      break;
    case 'write':
      target.write += ONE;
      break;
    case 'update':
      target.update += ONE;
      break;
    case 'remove':
      target.remove += ONE;
      break;
    case 'delete':
      target.delete += ONE;
      break;
    case 'clear':
      target.clear += ONE;
      break;
    case 'list':
      target.list += ONE;
      break;
    default:
      target.other += ONE;
      break;
  }
}

/**
 * 访问日志管理器
 * Access log manager
 */
export class AccessLogger {
  private static accessLog: AccessLogEntry[] = [];
  private static readonly MAX_LOG_ENTRIES = ANIMATION_DURATION_VERY_SLOW;

  /**
   * 记录访问日志
   * Log access
   */
  static logAccess(params: {
    key: string;
    operation: string;
    success: boolean;
    responseTime?: number;
    error?: string;
  }): void {
    const { key, operation, success, responseTime, error } = params;
    const logEntry: AccessLogEntry = {
      key,
      operation,
      timestamp: Date.now(),
      success,
    };
    if (responseTime !== undefined) {
      logEntry.responseTime = responseTime;
    }
    if (error !== undefined) {
      logEntry.error = error;
    }

    this.accessLog.unshift(logEntry);

    // 限制日志条目数量
    if (this.accessLog.length > this.MAX_LOG_ENTRIES) {
      this.accessLog = this.accessLog.slice(ZERO, this.MAX_LOG_ENTRIES);
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
    return limit ? this.accessLog.slice(ZERO, limit) : [...this.accessLog];
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
    operationCounts: OperationCounts;
    keyCounts: Record<string, number>;
    recentErrors: AccessLogEntry[];
  } {
    const total = this.accessLog.length;
    const successful = this.accessLog.filter((entry) => entry.success).length;
    const successRate =
      total > ZERO ? (successful / total) * PERCENTAGE_FULL : PERCENTAGE_FULL;

    // 计算平均响应时间
    const responseTimes = this.accessLog
      .filter((entry) => entry.responseTime !== undefined)
      .map((entry) => entry.responseTime!);
    const averageResponseTime =
      responseTimes.length > ZERO
        ? responseTimes.reduce((sum, time) => sum + time, ZERO) /
          responseTimes.length
        : ZERO;

    // 统计操作类型（受控）与键访问次数（使用 Map 避免对象注入）
    const operationCounts = createEmptyOperationCounts();
    const keyCountsMap = new Map<string, number>();

    for (const entry of this.accessLog) {
      incrementOperationCount(operationCounts, entry.operation);
      const prev = keyCountsMap.get(entry.key) ?? ZERO;
      keyCountsMap.set(entry.key, prev + ONE);
    }

    const keyCounts: Record<string, number> = Object.fromEntries(
      keyCountsMap.entries(),
    ) as Record<string, number>;

    // 获取最近的错误
    const recentErrors = this.accessLog
      .filter((entry) => !entry.success)
      .slice(ZERO, COUNT_TEN);

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
  static logError(params: {
    error: string;
    context?: string;
    severity?: ErrorLogEntry['severity'];
    stack?: string;
  }): void {
    const { error, context, severity = 'medium', stack } = params;
    const errorEntry: ErrorLogEntry = {
      error,
      timestamp: Date.now(),
      severity,
    };
    if (context !== undefined) {
      errorEntry.context = context;
    }
    if (stack !== undefined) {
      errorEntry.stack = stack;
    }

    this.errorLog.unshift(errorEntry);

    // 限制错误日志条目数量
    if (this.errorLog.length > this.MAX_ERROR_ENTRIES) {
      this.errorLog = this.errorLog.slice(ZERO, this.MAX_ERROR_ENTRIES);
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
    return limit ? this.errorLog.slice(ZERO, limit) : [...this.errorLog];
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
    const { totalOperations } = AccessLogger.getAccessStats();
    const errorRate =
      totalOperations > ZERO
        ? (total / totalOperations) * PERCENTAGE_FULL
        : ZERO;

    // 统计严重程度分布（受控联合 + switch）
    const severityDistribution = {
      low: ZERO,
      medium: ZERO,
      high: ZERO,
      critical: ZERO,
    };
    const dist: {
      low: number;
      medium: number;
      high: number;
      critical: number;
    } = {
      low: severityDistribution.low,
      medium: severityDistribution.medium,
      high: severityDistribution.high,
      critical: severityDistribution.critical,
    };
    for (const entry of this.errorLog) {
      switch (entry.severity) {
        case 'low':
          dist.low += ONE;
          break;
        case 'medium':
          dist.medium += ONE;
          break;
        case 'high':
          dist.high += ONE;
          break;
        case 'critical':
          dist.critical += ONE;
          break;
        default:
          break;
      }
    }

    // 获取最近错误
    const recentErrors = this.errorLog.slice(ZERO, COUNT_TEN);

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
    const trends = new Map<string, number>();
    const now = new Date();

    // 初始化最近7天的数据
    for (let i = MAGIC_6; i >= ZERO; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr =
        date.toISOString().split('T').at(ZERO) || date.toISOString();
      trends.set(dateStr, ZERO);
    }

    // 统计错误数量
    for (const entry of this.errorLog) {
      const date = new Date(entry.timestamp);
      const dateStr =
        date.toISOString().split('T').at(ZERO) || date.toISOString();
      if (trends.has(dateStr)) {
        trends.set(dateStr, (trends.get(dateStr) ?? ZERO) + ONE);
      }
    }

    return Array.from(trends.entries()).map(([date, count]) => ({
      date,
      count,
    }));
  }
}

// ==================== 数据清理 ====================

/**
 * 清理分析数据
 * Cleanup analytics data
 */
export function cleanupAnalyticsData(
  maxAge: number = DAYS_PER_WEEK *
    HOURS_PER_DAY *
    SECONDS_PER_MINUTE *
    SECONDS_PER_MINUTE *
    ANIMATION_DURATION_VERY_SLOW,
): void {
  const cutoffTime = Date.now() - maxAge;

  // 清理访问日志
  const accessLog = AccessLogger.getAccessLog();
  const filteredAccessLog = accessLog.filter(
    (entry) => entry.timestamp > cutoffTime,
  );
  AccessLogger.clearAccessLog();
  filteredAccessLog.forEach((entry) => {
    const payload: {
      key: string;
      operation: string;
      success: boolean;
      responseTime?: number;
      error?: string;
    } = {
      key: entry.key,
      operation: entry.operation,
      success: entry.success,
    };
    if (entry.responseTime !== undefined) {
      payload.responseTime = entry.responseTime;
    }
    if (entry.error !== undefined) {
      payload.error = entry.error;
    }
    AccessLogger.logAccess(payload);
  });

  // 清理错误日志
  const errorLog = ErrorLogger.getErrorLog();
  const filteredErrorLog = errorLog.filter(
    (entry) => entry.timestamp > cutoffTime,
  );
  ErrorLogger.clearErrorLog();
  filteredErrorLog.forEach((entry) => {
    const payload: {
      error: string;
      context?: string;
      severity: ErrorLogEntry['severity'];
      stack?: string;
    } = {
      error: entry.error,
      severity: entry.severity,
    };
    if (entry.context !== undefined) {
      payload.context = entry.context;
    }
    if (entry.stack !== undefined) {
      payload.stack = entry.stack;
    }
    ErrorLogger.logError(payload);
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
