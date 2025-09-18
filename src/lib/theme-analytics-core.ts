'use client';

/**
 * 主题分析核心类
 * Theme analytics core class
 */
import { MAGIC_0_1 } from "@/constants/decimal";
import { ANIMATION_DURATION_VERY_SLOW, COUNT_FIVE, COUNT_TRIPLE, DAYS_PER_MONTH, HOURS_PER_DAY, PERCENTAGE_FULL, PERCENTAGE_HALF, SECONDS_PER_MINUTE, ZERO } from '@/constants';

import { ThemeAnalyticsUtils } from '@/lib/theme-analytics-utils';
import * as Sentry from '@sentry/nextjs';
import type {
  ThemeAnalyticsConfig,
  ThemePerformanceMetrics,
  ThemePerformanceSummary,
  ThemeSwitchPattern,
  ThemeUsageStats,
} from '@/lib/theme-analytics-types';

/**
 * 主题分析管理器
 * 负责收集、分析和报告主题相关的性能和使用数据
 */
export class ThemeAnalytics {
  private config: ThemeAnalyticsConfig;
  private performanceMetrics: ThemePerformanceMetrics[] = [];
  private usageStats: Map<string, ThemeUsageStats> = new Map();
  private switchPatterns: ThemeSwitchPattern[] = [];
  private currentTheme: string = 'system';
  private sessionStartTime: number = Date.now();
  private lastSwitchTime: number = ZERO;

  /**
   * 获取当前主题
   */
  getCurrentTheme(): string {
    return this.currentTheme;
  }

  constructor(config?: Partial<ThemeAnalyticsConfig>) {
    this.config = {
      enabled: process.env.NODE_ENV === 'production',
      performanceThreshold: PERCENTAGE_FULL, // 100ms
      sampleRate: MAGIC_0_1, // 10% 采样
      enableDetailedTracking: true,
      enableUserBehaviorAnalysis: true,
      ...config,
    };

    // 初始化Sentry自定义标签
    if (this.config.enabled) {
      Sentry.setTag('feature', 'theme-analytics');
    }
  }

  /**
   * 记录主题切换性能
   */
  recordThemeSwitch(args: {
    fromTheme: string;
    toTheme: string;
    startTime: number;
    endTime: number;
    supportsViewTransitions?: boolean;
  }): void {
    const { fromTheme, toTheme, startTime, endTime, supportsViewTransitions = false } = args;
    if (
      !this.config.enabled ||
      !ThemeAnalyticsUtils.shouldSample(this.config.sampleRate)
    ) {
      return;
    }

    const switchDuration = endTime - startTime;
    const now = Date.now();

    const metrics: ThemePerformanceMetrics = {
      switchDuration,
      fromTheme,
      toTheme,
      timestamp: now,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      viewportSize: ThemeAnalyticsUtils.getViewportSize(),
      supportsViewTransitions,
    };

    // 存储性能指标
    this.performanceMetrics.push(metrics);
    this.lastSwitchTime = now;

    // 更新使用统计
    ThemeAnalyticsUtils.updateUsageStats({
      usageStats: this.usageStats,
      theme: toTheme,
      timestamp: now,
      lastSwitchTime: this.lastSwitchTime,
    });

    // 发送到Sentry
    ThemeAnalyticsUtils.sendPerformanceMetrics(metrics);

    // 检查性能阈值
    if (switchDuration > this.config.performanceThreshold) {
      ThemeAnalyticsUtils.reportPerformanceIssue(metrics);
    }

    // 分析切换模式
    if (this.config.enableUserBehaviorAnalysis) {
      ThemeAnalyticsUtils.analyzeSwitchPattern({
        switchPatterns: this.switchPatterns,
        fromTheme,
        toTheme,
        duration: switchDuration,
      });
    }

    // 清理旧数据
    this.cleanupOldData();
  }

  /**
   * 记录主题偏好
   */
  recordThemePreference(theme: string): void {
    if (!this.config.enabled) return;

    this.currentTheme = theme;

    // 发送用户偏好数据到Sentry
    Sentry.setUser({
      themePreference: theme,
    });

    Sentry.addBreadcrumb({
      category: 'theme',
      message: `User selected theme: ${theme}`,
      level: 'info',
      data: {
        theme,
        timestamp: Date.now(),
      },
    });

    // 记录主题偏好事件
    Sentry.addBreadcrumb({
      category: 'user-preference',
      message: `Theme preference set to ${theme}`,
      level: 'info',
      data: {
        theme,
        sessionDuration: Date.now() - this.sessionStartTime,
      },
    });
  }

  /**
   * 获取性能摘要
   */
  getPerformanceSummary(): ThemePerformanceSummary {
    return ThemeAnalyticsUtils.generatePerformanceSummary(
      this.performanceMetrics,
      this.usageStats,
    );
  }

  /**
   * 获取主题使用统计
   */
  getUsageStatistics(): ThemeUsageStats[] {
    return Array.from(this.usageStats.values()).sort(
      (a, b) => b.count - a.count,
    );
  }

  /**
   * 发送性能报告到Sentry
   */
  sendPerformanceReport(): void {
    if (!this.config.enabled) return;

    const summary = this.getPerformanceSummary();
    const usageStats = this.getUsageStatistics();

    // 发送性能摘要
    Sentry.addBreadcrumb({
      category: 'theme-analytics',
      message: 'Theme performance report',
      level: 'info',
      data: ThemeAnalyticsUtils.formatPerformanceData(summary),
    });

    // 发送使用统计
    Sentry.setContext('theme-usage', {
      statistics: usageStats.slice(ZERO, COUNT_FIVE), // 只发送前COUNT_FIVE个最常用的主题
      totalThemes: usageStats.length,
      sessionDuration: Date.now() - this.sessionStartTime,
    });

    // 发送切换模式分析
    if (
      this.config.enableUserBehaviorAnalysis &&
      this.switchPatterns.length > ZERO
    ) {
      const topPatterns = this.switchPatterns
        .sort((a, b) => b.frequency - a.frequency)
        .slice(ZERO, COUNT_TRIPLE);

      Sentry.setContext('theme-patterns', {
        topPatterns: topPatterns.map((p) => ({
          sequence: p.sequence.join(' → '),
          frequency: p.frequency,
          avgDuration: Math.round(p.avgDuration),
        })),
      });
    }

    // 发送自定义事件
    Sentry.captureMessage('Theme Analytics Report', 'info');
  }

  /**
   * 重置分析数据
   */
  reset(): void {
    this.performanceMetrics = [];
    this.usageStats.clear();
    this.switchPatterns = [];
    this.sessionStartTime = Date.now();
    this.lastSwitchTime = ZERO;
  }

  /**
   * 获取配置
   */
  getConfig(): ThemeAnalyticsConfig {
    return { ...this.config };
  }

  /**
   * 更新配置
   */
  updateConfig(newConfig: Partial<ThemeAnalyticsConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * 清理旧数据
   */
  private cleanupOldData(): void {
    const hoursInDay = HOURS_PER_DAY;
    const minutesInHour = SECONDS_PER_MINUTE;
    const secondsInMinute = SECONDS_PER_MINUTE;
    const millisecondsInSecond = ANIMATION_DURATION_VERY_SLOW;
    const maxAge =
      hoursInDay * minutesInHour * secondsInMinute * millisecondsInSecond; // 24小时

    ThemeAnalyticsUtils.cleanupOldData(this.performanceMetrics, maxAge);

    // 清理使用统计中的过期数据
    const cutoffTime = Date.now() - maxAge;
    for (const [theme, stats] of this.usageStats.entries()) {
      if (stats.lastUsed < cutoffTime) {
        this.usageStats.delete(theme);
      }
    }

    // 清理切换模式数据（保留最近的模式）
    if (this.switchPatterns.length > PERCENTAGE_HALF) {
      this.switchPatterns = this.switchPatterns
        .sort((a, b) => b.frequency - a.frequency)
        .slice(ZERO, DAYS_PER_MONTH);
    }
  }
}
