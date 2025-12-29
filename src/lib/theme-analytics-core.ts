'use client';

/**
 * 主题分析核心类
 * Theme analytics core class
 */
import { logger } from '@/lib/logger';
import type {
  ThemeAnalyticsConfig,
  ThemePerformanceMetrics,
  ThemePerformanceSummary,
  ThemeSwitchPattern,
  ThemeUsageStats,
} from '@/lib/theme-analytics-types';
import { ThemeAnalyticsUtils } from '@/lib/theme-analytics-utils';
import {
  ANIMATION_DURATION_VERY_SLOW,
  COUNT_FIVE,
  COUNT_TRIPLE,
  DAYS_PER_MONTH,
  HOURS_PER_DAY,
  PERCENTAGE_FULL,
  PERCENTAGE_HALF,
  SECONDS_PER_MINUTE,
  ZERO,
} from '@/constants';
import { MAGIC_0_1 } from '@/constants/decimal';

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
    };

    if (config) {
      this.applyPartialConfig(config);
    }

    if (this.config.enabled) {
      logger.info('ThemeAnalytics initialized');
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
    const {
      fromTheme,
      toTheme,
      startTime,
      endTime,
      supportsViewTransitions = false,
    } = args;
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

    logger.info('User theme preference recorded', {
      theme,
      timestamp: Date.now(),
      sessionDuration: Date.now() - this.sessionStartTime,
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
   * 获取记录的性能指标副本（主要用于测试和调试）
   */
  getPerformanceMetrics(): ThemePerformanceMetrics[] {
    return [...this.performanceMetrics];
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
   * 发送性能报告
   */
  sendPerformanceReport(): void {
    if (!this.config.enabled) return;

    const summary = this.getPerformanceSummary();
    const usageStats = this.getUsageStatistics();

    logger.info('Theme performance report', {
      ...ThemeAnalyticsUtils.formatPerformanceData(summary),
      statistics: usageStats.slice(ZERO, COUNT_FIVE),
      totalThemes: usageStats.length,
      sessionDuration: Date.now() - this.sessionStartTime,
    });

    if (
      this.config.enableUserBehaviorAnalysis &&
      this.switchPatterns.length > ZERO
    ) {
      const topPatterns = this.switchPatterns
        .sort((a, b) => b.frequency - a.frequency)
        .slice(ZERO, COUNT_TRIPLE);

      logger.info('Theme switch patterns', {
        topPatterns: topPatterns.map((p) => ({
          sequence: p.sequence.join(' → '),
          frequency: p.frequency,
          avgDuration: Math.round(p.avgDuration),
        })),
      });
    }
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
    return {
      enabled: this.config.enabled,
      performanceThreshold: this.config.performanceThreshold,
      sampleRate: this.config.sampleRate,
      enableDetailedTracking: this.config.enableDetailedTracking,
      enableUserBehaviorAnalysis: this.config.enableUserBehaviorAnalysis,
    };
  }

  /**
   * 更新配置
   */
  updateConfig(newConfig: Partial<ThemeAnalyticsConfig>): void {
    this.applyPartialConfig(newConfig);
  }

  /**
   * 应用部分配置更新（显式字段白名单）
   */
  private applyPartialConfig(
    partialConfig: Partial<ThemeAnalyticsConfig>,
  ): void {
    if (typeof partialConfig.enabled === 'boolean') {
      this.config.enabled = partialConfig.enabled;
    }
    if (typeof partialConfig.performanceThreshold === 'number') {
      this.config.performanceThreshold = partialConfig.performanceThreshold;
    }
    if (typeof partialConfig.sampleRate === 'number') {
      this.config.sampleRate = partialConfig.sampleRate;
    }
    if (typeof partialConfig.enableDetailedTracking === 'boolean') {
      this.config.enableDetailedTracking = partialConfig.enableDetailedTracking;
    }
    if (typeof partialConfig.enableUserBehaviorAnalysis === 'boolean') {
      this.config.enableUserBehaviorAnalysis =
        partialConfig.enableUserBehaviorAnalysis;
    }
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
