/**
 * 偏好事件管理器
 * Preference Event Manager
 */

'use client';

import type {
  StorageEvent,
  StorageEventListener,
} from '@/lib/locale-storage-types';
import { logger } from '@/lib/logger';
import { ONE, PERCENTAGE_FULL, ZERO } from '@/constants';

/**
 * 偏好事件管理器
 * Preference event manager
 */
export class PreferenceEventManager {
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
          logger.error(`Error in preference event listener for ${event.type}`, {
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
          logger.error('Error in universal preference event listener', {
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
    return limit
      ? this.eventHistory.slice(ZERO, limit)
      : [...this.eventHistory];
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
    const byType = new Map<string, number>();

    for (const [eventType, listeners] of this.eventListeners.entries()) {
      const count = listeners.length;
      totalListeners += count;
      byType.set(eventType, count);
    }

    return {
      totalListeners,
      eventTypes: Array.from(this.eventListeners.keys()),
      listenersByType: Object.fromEntries(byType) as Record<string, number>,
    };
  }
}
