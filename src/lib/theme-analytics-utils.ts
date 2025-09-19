/**
 * 主题分析工具函数
 * Theme analytics utility functions
 */

import * as Sentry from '@sentry/nextjs';
import type {
  ThemePerformanceMetrics,
  ThemePerformanceSummary,
  ThemeSwitchPattern,
  ThemeUsageStats,
} from '@/lib/theme-analytics-types';
import {
  ANIMATION_DURATION_VERY_SLOW,
  COUNT_PAIR,
  HOURS_PER_DAY,
  ONE,
  PERCENTAGE_FULL,
  SECONDS_PER_MINUTE,
  ZERO,
} from '@/constants';

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
      const maxUint32 = 0xffffffff; // 2^32 - 1
      const first = array.at(0) ?? 0;
      const randomValue = first / maxUint32;
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
    return { width: ZERO, height: ZERO };
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
  static updateUsageStats(args: {
    usageStats: Map<string, ThemeUsageStats>;
    theme: string;
    timestamp: number;
    lastSwitchTime: number;
  }): void {
    const { usageStats, theme, timestamp, lastSwitchTime } = args;
    const existing = usageStats.get(theme);
    if (existing) {
      existing.count += ONE;
      existing.lastUsed = timestamp;
      existing.sessionDuration += timestamp - lastSwitchTime;
    } else {
      usageStats.set(theme, {
        theme,
        count: ONE,
        lastUsed: timestamp,
        sessionDuration: ZERO,
      });
    }
  }

  /**
   * 分析切换模式
   */
  static analyzeSwitchPattern(args: {
    switchPatterns: ThemeSwitchPattern[];
    fromTheme: string;
    toTheme: string;
    duration: number;
  }): void {
    const { switchPatterns, fromTheme, toTheme, duration } = args;
    const sequence = [fromTheme, toTheme];
    const sequenceKey = sequence.join('-');

    const existing = switchPatterns.find(
      (p) => p.sequence.join('-') === sequenceKey,
    );

    if (existing) {
      existing.frequency += ONE;
      existing.avgDuration = (existing.avgDuration + duration) / COUNT_PAIR;
    } else {
      switchPatterns.push({
        sequence,
        frequency: ONE,
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
    maxAge: number = HOURS_PER_DAY *
      SECONDS_PER_MINUTE *
      SECONDS_PER_MINUTE *
      ANIMATION_DURATION_VERY_SLOW, // HOURS_PER_DAY小时
  ): void {
    const cutoffTime = Date.now() - maxAge;

    // 清理性能指标
    const validMetrics = performanceMetrics.filter(
      (metric) => metric.timestamp > cutoffTime,
    );

    // 清空原数组并添加有效数据
    performanceMetrics.length = ZERO;
    performanceMetrics.push(...validMetrics);
  }

  /**
   * 生成性能摘要
   */
  static generatePerformanceSummary(
    performanceMetrics: ThemePerformanceMetrics[],
    usageStats: Map<string, ThemeUsageStats>,
  ): ThemePerformanceSummary {
    if (performanceMetrics.length === ZERO) {
      return {
        totalSwitches: ZERO,
        averageDuration: ZERO,
        slowSwitches: ZERO,
        fastestSwitch: ZERO,
        slowestSwitch: ZERO,
        mostUsedTheme: 'system',
        viewTransitionSupport: false,
      };
    }

    const durations = performanceMetrics.map((m) => m.switchDuration);
    const averageDuration =
      durations.reduce((a, b) => a + b, ZERO) / durations.length;
    const slowSwitches = durations.filter((d) => d > PERCENTAGE_FULL).length; // 超过100ms的切换
    const fastestSwitch = Math.min(...durations);
    const slowestSwitch = Math.max(...durations);

    // 找出最常用的主题
    const usageArray = Array.from(usageStats.values());
    const mostUsedTheme =
      usageArray.length > ZERO
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
