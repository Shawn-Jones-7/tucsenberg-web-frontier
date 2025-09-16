/**
 * 主题分析工具函数
 * Theme analytics utility functions
 */

import * as Sentry from '@sentry/nextjs';
import { COUNT_PAIR, HOURS_PER_DAY, SECONDS_PER_MINUTE } from '@/constants/magic-numbers';

import type {
  ThemePerformanceMetrics,
  ThemePerformanceSummary,
  ThemeSwitchPattern,
  ThemeUsageStats,
} from './theme-analytics-types';

/**
 * 主题分析工具类
 */
export class ThemeAnalyticsUtils {
  /**
   * 检查是否应该采样
   */
  static shouldSample(sampleRate: number): boolean {
    // 使用crypto.getRandomValues()替代Math.random()以提高安全性
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      const array = new Uint32Array(1);
      crypto.getRandomValues(array);
      const maxUint32 = 0xffffffff;
      const randomValue = (array[0] || 0) / maxUint32;
      return randomValue < sampleRate;
    }

    // 降级到Math.random()
    return Math.random() < sampleRate;
  }

  /**
   * 获取视口大小
   */
  static getViewportSize(): { width: number; height: number } {
    if (typeof window !== 'undefined') {
      return {
        width: window.innerWidth,
        height: window.innerHeight,
      };
    }
    return { width: 0, height: 0 };
  }

  /**
   * 发送性能指标到Sentry
   */
  static sendPerformanceMetrics(metrics: ThemePerformanceMetrics): void {
    Sentry.addBreadcrumb({
      category: 'theme-performance',
      message: `Theme switched from ${metrics.fromTheme} to ${metrics.toTheme}`,
      level: 'info',
      data: {
        duration: metrics.switchDuration,
        supportsViewTransitions: metrics.supportsViewTransitions,
      },
    });
  }

  /**
   * 报告性能问题
   */
  static reportPerformanceIssue(metrics: ThemePerformanceMetrics): void {
    Sentry.captureMessage(
      `Slow theme switch detected: ${metrics.switchDuration}ms`,
      'warning',
    );

    Sentry.setContext('theme-performance', {
      fromTheme: metrics.fromTheme,
      toTheme: metrics.toTheme,
      duration: metrics.switchDuration,
      viewportSize: metrics.viewportSize,
      supportsViewTransitions: metrics.supportsViewTransitions,
    });
  }

  /**
   * 更新使用统计
   */
  static updateUsageStats(
    usageStats: Map<string, ThemeUsageStats>,
    theme: string,
    timestamp: number,
    lastSwitchTime: number,
  ): void {
    const existing = usageStats.get(theme);
    if (existing) {
      existing.count += 1;
      existing.lastUsed = timestamp;
      existing.sessionDuration += timestamp - lastSwitchTime;
    } else {
      usageStats.set(theme, {
        theme,
        count: 1,
        lastUsed: timestamp,
        sessionDuration: 0,
      });
    }
  }

  /**
   * 分析切换模式
   */
  static analyzeSwitchPattern(
    switchPatterns: ThemeSwitchPattern[],
    fromTheme: string,
    toTheme: string,
    duration: number,
  ): void {
    const sequence = [fromTheme, toTheme];
    const sequenceKey = sequence.join('-');

    const existing = switchPatterns.find(
      (p) => p.sequence.join('-') === sequenceKey,
    );

    if (existing) {
      existing.frequency += 1;
      existing.avgDuration = (existing.avgDuration + duration) / COUNT_PAIR;
    } else {
      switchPatterns.push({
        sequence,
        frequency: 1,
        avgDuration: duration,
        timeOfDay: new Date().getHours(),
      });
    }
  }

  /**
   * 清理旧数据
   */
  static cleanupOldData(
    performanceMetrics: ThemePerformanceMetrics[],
    maxAge: number = HOURS_PER_DAY * SECONDS_PER_MINUTE * SECONDS_PER_MINUTE * 1000, // HOURS_PER_DAY小时
  ): void {
    const cutoffTime = Date.now() - maxAge;

    // 清理性能指标
    const validMetrics = performanceMetrics.filter(
      (metric) => metric.timestamp > cutoffTime,
    );

    // 清空原数组并添加有效数据
    performanceMetrics.length = 0;
    performanceMetrics.push(...validMetrics);
  }

  /**
   * 生成性能摘要
   */
  static generatePerformanceSummary(
    performanceMetrics: ThemePerformanceMetrics[],
    usageStats: Map<string, ThemeUsageStats>,
  ): ThemePerformanceSummary {
    if (performanceMetrics.length === 0) {
      return {
        totalSwitches: 0,
        averageDuration: 0,
        slowSwitches: 0,
        fastestSwitch: 0,
        slowestSwitch: 0,
        mostUsedTheme: 'system',
        viewTransitionSupport: false,
      };
    }

    const durations = performanceMetrics.map((m) => m.switchDuration);
    const averageDuration =
      durations.reduce((a, b) => a + b, 0) / durations.length;
    const slowSwitches = durations.filter((d) => d > 100).length; // 超过100ms的切换
    const fastestSwitch = Math.min(...durations);
    const slowestSwitch = Math.max(...durations);

    // 找出最常用的主题
    const usageArray = Array.from(usageStats.values());
    const mostUsedTheme =
      usageArray.length > 0
        ? usageArray.reduce((a, b) => (a.count > b.count ? a : b)).theme
        : 'system';

    // 检查View Transitions支持
    const viewTransitionSupport = performanceMetrics.some(
      (m) => m.supportsViewTransitions,
    );

    return {
      totalSwitches: performanceMetrics.length,
      averageDuration,
      slowSwitches,
      fastestSwitch,
      slowestSwitch,
      mostUsedTheme,
      viewTransitionSupport,
    };
  }

  /**
   * 格式化性能数据用于报告
   */
  static formatPerformanceData(
    summary: ThemePerformanceSummary,
  ): Record<string, unknown> {
    return {
      total_switches: summary.totalSwitches,
      avg_duration_ms: Math.round(summary.averageDuration),
      slow_switches: summary.slowSwitches,
      fastest_switch_ms: summary.fastestSwitch,
      slowest_switch_ms: summary.slowestSwitch,
      most_used_theme: summary.mostUsedTheme,
      view_transition_support: summary.viewTransitionSupport,
    };
  }
}
