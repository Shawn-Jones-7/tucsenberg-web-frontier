// 导出全局实例
import { I18nMonitor } from '@/lib/i18n-monitor-core';

/**
 * 企业级国际化监控和错误追踪 - 统一导出入口
 * 提供翻译错误监控、性能追踪、质量保证等功能
 */

// 导出类型定义和枚举
export type {
  MonitoringEvent,
  MonitoringConfig,
  PerformanceThresholds,
  QualityThresholds,
  PerformanceData,
} from './i18n-monitoring-types';

export { ErrorLevel, MonitoringEventType } from '@/lib/i18n-monitoring-types';

// 导出核心类
export { EventCollector } from '@/lib/i18n-event-collector';
export { PerformanceMonitor } from '@/lib/i18n-performance-monitor';
export { I18nMonitor } from '@/lib/i18n-monitor-core';

export const i18nMonitor = new I18nMonitor();
