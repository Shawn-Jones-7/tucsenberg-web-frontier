// 创建默认实例
import { ThemeAnalytics } from '@/lib/theme-analytics-core';

/**
 * 主题分析服务 - 统一导出入口
 * Theme analytics service - unified export entry
 */

// 导出核心类
export { ThemeAnalytics } from '@/lib/theme-analytics-core';

// 导出工具类
export { ThemeAnalyticsUtils } from '@/lib/theme-analytics-utils';

// 导出所有类型
export type {
  ThemePerformanceMetrics,
  ThemeUsageStats,
  ThemeSwitchPattern,
  ThemeAnalyticsConfig,
  ThemePerformanceSummary,
  ThemeAnalyticsEvent,
  ThemeAnalyticsData,
} from './theme-analytics-types';

export const themeAnalytics = new ThemeAnalytics();

// 导出便利函数，用于向后兼容
export const recordThemePreference = (theme: string) =>
  themeAnalytics.recordThemePreference(theme);
export const recordThemeSwitch = (
  fromTheme: string,
  toTheme: string,
  duration?: number,
) => {
  const now = Date.now();
  const startTime = duration ? now - duration : now;
  themeAnalytics.recordThemeSwitch(fromTheme, toTheme, startTime, now);
};
export const sendThemeReport = () => themeAnalytics.sendPerformanceReport();
