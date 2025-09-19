/**
 * 事件系统管理
 * Event System Management
 */

'use client';

import {
  consoleLogListener,
  historyRecordingListener,
} from '@/lib/locale-storage-preference-events/event-listeners';
import { PreferenceEventManager } from '@/lib/locale-storage-preference-events/event-manager';
import { safeGetArrayItem } from '@/lib/security-object-access';
import { ONE, ZERO } from '@/constants';

/**
 * 事件管理工具函数
 * Event management utility functions
 */

/**
 * 设置默认事件监听器
 * Setup default event listeners
 */
export function setupDefaultListeners(
  options: {
    enableConsoleLog?: boolean;
    enableHistoryRecording?: boolean;
  } = {},
): void {
  const { enableConsoleLog = true, enableHistoryRecording = true } = options;

  if (enableConsoleLog) {
    PreferenceEventManager.addEventListener('*', consoleLogListener);
  }

  if (enableHistoryRecording) {
    PreferenceEventManager.addEventListener(
      'preference_saved',
      historyRecordingListener,
    );
  }
}

/**
 * 清理事件系统
 * Cleanup event system
 */
export function cleanupEventSystem(): void {
  PreferenceEventManager.removeAllListeners();
  PreferenceEventManager.clearEventHistory();
}

/**
 * 获取事件系统状态
 * Get event system status
 */
export function getEventSystemStatus(): {
  isActive: boolean;
  listenerStats: ReturnType<typeof PreferenceEventManager.getListenerStats>;
  eventHistoryCount: number;
  lastEventTime: number | null;
} {
  const listenerStats = PreferenceEventManager.getListenerStats();
  const eventHistory = PreferenceEventManager.getEventHistory(ONE);
  const first = safeGetArrayItem(eventHistory, ZERO);

  return {
    isActive: listenerStats.totalListeners > ZERO,
    listenerStats,
    eventHistoryCount: PreferenceEventManager.getEventHistory().length,
    lastEventTime: first ? first.timestamp || null : null,
  };
}
