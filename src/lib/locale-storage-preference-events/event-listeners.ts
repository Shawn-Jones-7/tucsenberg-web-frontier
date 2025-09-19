/**
 * 预定义事件监听器
 * Predefined Event Listeners
 */

'use client';

import type { Locale } from '@/types/i18n';
import { recordPreferenceHistory } from '@/lib/locale-storage-preference-events/history-manager';
import type {
  LocaleSource,
  StorageEvent,
  StorageEventListener,
  UserLocalePreference,
} from '@/lib/locale-storage-types';
import { logger } from '@/lib/logger';

/**
 * 预定义事件监听器
 * Predefined event listeners
 */

/**
 * 控制台日志监听器
 * Console log listener
 */
export const consoleLogListener: StorageEventListener = (
  event: StorageEvent,
) => {
  const timestamp = new Date(event.timestamp).toLocaleTimeString();

  switch (event.type) {
    case 'preference_saved':
      logger.info('偏好已保存', { timestamp, data: event.data });
      break;
    case 'preference_loaded':
      logger.info('偏好已加载', { timestamp, data: event.data });
      break;
    case 'override_set':
      logger.info('覆盖已设置', { timestamp, data: event.data });
      break;
    case 'override_cleared':
      logger.info('覆盖已清除', { timestamp, data: event.data });
      break;
    case 'preference_sync':
      logger.info('偏好已同步', { timestamp, data: event.data });
      break;
    case 'preference_error':
      logger.error('偏好错误', { timestamp, data: event.data as unknown });
      break;
    default:
      logger.info(`偏好事件 (${event.type})`, { timestamp, data: event.data });
  }
};

/**
 * 历史记录监听器
 * History recording listener
 */
export const historyRecordingListener: StorageEventListener = (
  event: StorageEvent,
) => {
  if (event.type === 'preference_saved' && event.data) {
    const { locale, source, confidence } = event.data as {
      locale: Locale;
      source: LocaleSource;
      confidence: number;
    };

    const preference: UserLocalePreference = {
      locale,
      source,
      confidence,
      timestamp: event.timestamp,
      metadata: { recordedBy: 'event_listener' },
    };

    recordPreferenceHistory(preference);
  }
};
