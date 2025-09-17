'use client';

import { ANIMATION_DURATION_VERY_SLOW, COUNT_FIVE, SECONDS_PER_MINUTE, TEN_SECONDS_MS, ZERO } from "@/constants/magic-numbers";
import { logger } from '@/lib/logger';
import { sendThemeReport, themeAnalytics } from '@/lib/theme-analytics';
import { useEffect } from 'react';

/**
 * 主题性能监控组件
 * 负责定期发送性能报告和处理页面卸载时的数据上报
 */
export function ThemePerformanceMonitor() {
  useEffect(() => {
    // 定期发送性能报告（每5分钟）
    const minutesInterval = COUNT_FIVE;
    const secondsInMinute = SECONDS_PER_MINUTE;
    const millisecondsInSecond = ANIMATION_DURATION_VERY_SLOW;
    const reportIntervalMs =
      minutesInterval * secondsInMinute * millisecondsInSecond;
    const reportInterval = setInterval(() => {
      sendThemeReport();
    }, reportIntervalMs);

    // 页面可见性变化时发送报告
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        sendThemeReport();
      }
    };

    // 页面卸载前发送最终报告
    const handleBeforeUnload = () => {
      sendThemeReport();
    };

    // 添加事件监听器
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    // 组件挂载时发送初始报告
    sendThemeReport();

    // 清理函数
    return () => {
      clearInterval(reportInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);

      // 组件卸载时发送最终报告
      sendThemeReport();
    };
  }, []);

  // 这个组件不渲染任何内容
  return null;
}

/**
 * 主题性能仪表板组件（开发环境使用）
 * 显示实时的主题切换性能统计
 */
export function ThemePerformanceDashboard() {
  const isDevelopment = process.env.NODE_ENV === 'development';

  useEffect(() => {
    if (!isDevelopment) {
      return undefined;
    }

    // 每秒更新一次统计信息
    const updateIntervalMs = TEN_SECONDS_MS; // 每10秒输出一次
    const updateInterval = setInterval(() => {
      const summary = themeAnalytics.getPerformanceSummary();
      const usage = themeAnalytics.getUsageStatistics();

      // 在控制台输出性能统计
      if (summary.totalSwitches > ZERO) {
        logger.info('Theme Performance Summary', { summary });
        logger.info('Theme Usage Statistics', { usage });
      }
    }, updateIntervalMs);

    return () => clearInterval(updateInterval);
  }, [isDevelopment]);

  return null;
}
