/**
 * 用户语言偏好事件和历史 - 主入口
 * 重新导出所有偏好事件相关模块
 */

'use client';

// 重新导出事件管理器
export { PreferenceEventManager } from '@/lib/locale-storage-preference-events/event-manager';

// 重新导出事件创建函数
export {
  createPreferenceSavedEvent,
  createPreferenceLoadedEvent,
  createOverrideSetEvent,
  createOverrideClearedEvent,
  createSyncEvent,
  createPreferenceErrorEvent,
} from './locale-storage-preference-events/event-creators';

// 重新导出偏好历史管理
export {
  getPreferenceHistory,
  recordPreferenceHistory,
  clearPreferenceHistory,
} from './locale-storage-preference-events/history-manager';

// 重新导出统计分析
export { getPreferenceChangeStats } from '@/lib/locale-storage-preference-events/stats-analyzer';

// 重新导出事件监听器
export {
  consoleLogListener,
  historyRecordingListener,
} from './locale-storage-preference-events/event-listeners';

// 重新导出系统管理
export {
  setupDefaultListeners,
  cleanupEventSystem,
  getEventSystemStatus,
} from './locale-storage-preference-events/system-manager';
