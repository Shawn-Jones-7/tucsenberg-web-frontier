/**
 * 语言检测历史事件管理
 * Locale Detection History Event Management
 *
 * 负责历史记录相关的事件监听、发布和管理功能
 */

'use client';

import { COUNT_TEN, ONE, PERCENTAGE_FULL, ZERO } from "@/constants/magic-numbers";
import { logger } from '@/lib/logger';
import type {
  StorageEvent,
  StorageEventListener,
} from './locale-storage-types';

// ==================== 事件管理器 ====================

/**
 * 历史事件管理器
 * History event manager
 */
export class HistoryEventManager {
  private static eventListeners: Map<string, StorageEventListener[]> =
    new Map();
  private static eventHistory: StorageEvent[] = [];
  private static readonly MAX_EVENT_HISTORY = PERCENTAGE_FULL;

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
   * 发出事件
   * Emit event
   */
  static emitEvent(event: StorageEvent): void {
    // 记录事件历史
    this.recordEvent(event);

    // 发送给特定类型的监听器
    const listeners = this.eventListeners.get(event.type);
    if (listeners) {
      listeners.forEach((listener) => {
        try {
          listener(event);
        } catch (error) {
          logger.error(`Error in history event listener for ${event.type}`, {
            error: error as Error,
          });
        }
      });
    }

    // 发送给通用监听器
    const allListeners = this.eventListeners.get('*');
    if (allListeners) {
      allListeners.forEach((listener) => {
        try {
          listener(event);
        } catch (error) {
          logger.error('Error in universal history event listener', {
            error: error as Error,
          });
        }
      });
    }
  }

  /**
   * 记录事件历史
   * Record event history
   */
  private static recordEvent(event: StorageEvent): void {
    this.eventHistory.unshift(event);

    // 限制事件历史长度
    if (this.eventHistory.length > this.MAX_EVENT_HISTORY) {
      this.eventHistory = this.eventHistory.slice(ZERO, this.MAX_EVENT_HISTORY);
    }
  }

  /**
   * 获取事件历史
   * Get event history
   */
  static getEventHistory(limit?: number): StorageEvent[] {
    return limit ? this.eventHistory.slice(ZERO, limit) : [...this.eventHistory];
  }

  /**
   * 清除事件历史
   * Clear event history
   */
  static clearEventHistory(): void {
    this.eventHistory = [];
  }

  /**
   * 获取监听器统计
   * Get listener statistics
   */
  static getListenerStats(): {
    totalListeners: number;
    eventTypes: string[];
    listenersByType: Record<string, number>;
  } {
    let totalListeners = ZERO;
    const listenersByType: Record<string, number> = {};

    for (const [eventType, listeners] of this.eventListeners.entries()) {
      const count = listeners.length;
      totalListeners += count;
      listenersByType[eventType] = count;
    }

    return {
      totalListeners,
      eventTypes: Array.from(this.eventListeners.keys()),
      listenersByType,
    };
  }
}

// ==================== 事件创建工具 ====================

/**
 * 创建历史记录添加事件
 * Create history record added event
 */
export function createRecordAddedEvent(
  locale: string,
  source: string,
  confidence: number,
): StorageEvent {
  return {
    type: 'preference_saved',
    data: {
      locale,
      source,
      confidence,
      action: 'add_record',
    },
    timestamp: Date.now(),
    source: 'history_manager',
  };
}

/**
 * 创建历史记录清理事件
 * Create history cleanup event
 */
export function createCleanupEvent(
  cleanupType: 'expired' | 'duplicates' | 'size_limit' | 'all',
  removedCount: number,
): StorageEvent {
  return {
    type: 'cache_cleared',
    data: {
      cleanupType,
      removedCount,
      action: 'cleanup',
    },
    timestamp: Date.now(),
    source: 'history_manager',
  };
}

/**
 * 创建历史记录导出事件
 * Create history export event
 */
export function createExportEvent(
  format: 'json' | 'backup',
  recordCount: number,
): StorageEvent {
  return {
    type: 'backup_created',
    data: {
      format,
      recordCount,
      action: 'export',
    },
    timestamp: Date.now(),
    source: 'history_manager',
  };
}

/**
 * 创建历史记录导入事件
 * Create history import event
 */
export function createImportEvent(
  format: 'json' | 'backup',
  recordCount: number,
  success: boolean,
): StorageEvent {
  return {
    type: 'backup_restored',
    data: {
      format,
      recordCount,
      success,
      action: 'import',
    },
    timestamp: Date.now(),
    source: 'history_manager',
  };
}

/**
 * 创建历史记录错误事件
 * Create history error event
 */
export function createErrorEvent(
  operation: string,
  error: string,
): StorageEvent {
  return {
    type: 'history_error',
    data: {
      operation,
      error,
      action: 'error',
    },
    timestamp: Date.now(),
    source: 'history_manager',
  };
}

// ==================== 事件监听器工具 ====================

/**
 * 创建调试事件监听器
 * Create debug event listener
 */
export function createDebugListener(
  prefix: string = '[History]',
): StorageEventListener {
  return (event: StorageEvent) => {
    logger.info(`${prefix} Event`, {
      type: event.type,
      data: event.data,
      timestamp: new Date(event.timestamp).toISOString(),
      source: event.source,
    });
  };
}

/**
 * 创建统计事件监听器
 * Create statistics event listener
 */
export function createStatsListener(): {
  listener: StorageEventListener;
  getStats: () => {
    totalEvents: number;
    eventsByType: Record<string, number>;
    recentEvents: StorageEvent[];
  };
} {
  const stats = {
    totalEvents: ZERO,
    eventsByType: {} as Record<string, number>,
    recentEvents: [] as StorageEvent[],
  };

  const listener: StorageEventListener = (event: StorageEvent) => {
    stats.totalEvents += ONE;
    stats.eventsByType[event.type] = (stats.eventsByType[event.type] || ZERO) + ONE;

    // 保留最近10个事件
    stats.recentEvents.unshift(event);
    if (stats.recentEvents.length > COUNT_TEN) {
      stats.recentEvents = stats.recentEvents.slice(ZERO, COUNT_TEN);
    }
  };

  const getStats = () => ({ ...stats });

  return { listener, getStats };
}

/**
 * 创建错误监听器
 * Create error listener
 */
export function createErrorListener(
  onError: (error: string, operation: string, event: StorageEvent) => void,
): StorageEventListener {
  return (event: StorageEvent) => {
    if (event.type === 'history_error' && event.data) {
      const { operation, error } = event.data as {
        operation: string;
        error: string;
      };
      onError(error, operation, event);
    }
  };
}

// ==================== 预定义事件监听器 ====================

/**
 * 控制台日志监听器
 * Console log listener
 */
export const consoleLogListener: StorageEventListener = (
  event: StorageEvent,
) => {
  const timestamp = new Date(event.timestamp).toLocaleTimeString();

  switch (event.type as string) {
    case 'history_record_added':
      logger.info('历史记录已添加', { timestamp, data: event.data });
      break;
    case 'history_cleanup':
      logger.info('历史记录已清理', { timestamp, data: event.data });
      break;
    case 'history_export':
      logger.info('历史记录已导出', { timestamp, data: event.data });
      break;
    case 'history_import':
      logger.info('历史记录已导入', { timestamp, data: event.data });
      break;
    case 'history_error':
      logger.error('历史记录错误', { timestamp, data: event.data as unknown });
      break;
    default:
      logger.info(`历史记录事件 (${event.type})`, {
        timestamp,
        data: event.data,
      });
  }
};

/**
 * 性能监控监听器
 * Performance monitoring listener
 */
export const performanceListener: StorageEventListener = (
  event: StorageEvent,
) => {
  // 记录性能相关的事件
  if ((event.type as string) === 'history_cleanup' && event.data) {
    const { cleanupType, removedCount } = event.data as {
      cleanupType: string;
      removedCount: number;
    };

    if (removedCount > PERCENTAGE_FULL) {
      logger.warn('大量历史记录清理', { cleanupType, removedCount });
    }
  }

  if (event.type === 'history_error') {
    logger.error('历史记录操作失败', { data: event.data as unknown });
  }
};

// ==================== 事件管理工具函数 ====================

/**
 * 批量添加事件监听器
 * Batch add event listeners
 */
export function addMultipleListeners(
  listeners: Array<{
    eventType: string;
    listener: StorageEventListener;
  }>,
): void {
  listeners.forEach(({ eventType, listener }) => {
    HistoryEventManager.addEventListener(eventType, listener);
  });
}

/**
 * 设置默认事件监听器
 * Setup default event listeners
 */
export function setupDefaultListeners(
  options: {
    enableConsoleLog?: boolean;
    enablePerformanceMonitoring?: boolean;
    enableDebug?: boolean;
  } = {},
): void {
  const {
    enableConsoleLog = true,
    enablePerformanceMonitoring = true,
    enableDebug = false,
  } = options;

  if (enableConsoleLog) {
    HistoryEventManager.addEventListener('*', consoleLogListener);
  }

  if (enablePerformanceMonitoring) {
    HistoryEventManager.addEventListener('*', performanceListener);
  }

  if (enableDebug) {
    HistoryEventManager.addEventListener(
      '*',
      createDebugListener('[HistoryDebug]'),
    );
  }
}

/**
 * 清理所有事件监听器和历史
 * Cleanup all event listeners and history
 */
export function cleanupEventSystem(): void {
  HistoryEventManager.removeAllListeners();
  HistoryEventManager.clearEventHistory();
}

/**
 * 获取事件系统状态
 * Get event system status
 */
export function getEventSystemStatus(): {
  isActive: boolean;
  listenerStats: ReturnType<typeof HistoryEventManager.getListenerStats>;
  eventHistoryCount: number;
  lastEventTime: number | null;
} {
  const listenerStats = HistoryEventManager.getListenerStats();
  const eventHistory = HistoryEventManager.getEventHistory(ONE);

  return {
    isActive: listenerStats.totalListeners > ZERO,
    listenerStats,
    eventHistoryCount: HistoryEventManager.getEventHistory().length,
    lastEventTime: eventHistory.length > ZERO ? eventHistory[ZERO]!.timestamp : null,
  };
}
