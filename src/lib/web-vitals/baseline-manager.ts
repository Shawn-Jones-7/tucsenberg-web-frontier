import { ONE, PERCENTAGE_FULL, ZERO } from "@/constants/magic-numbers";
import {
  BASELINE_CONSTANTS,
  WEB_VITALS_THRESHOLDS,
} from '@/constants/performance-constants';
import { WEB_VITALS_CONSTANTS } from '@/constants/test-constants';
import { logger } from '@/lib/logger';
import type { DetailedWebVitals, PerformanceBaseline } from '@/lib/web-vitals/types';

/**
 * 性能基准数据库管理类
 * 负责保存、检索和管理性能基准数据
 */
export class PerformanceBaselineManager {
  private static readonly STORAGE_KEY = 'performance-baselines';
  private static readonly MAX_BASELINES = WEB_VITALS_CONSTANTS.MAX_BASELINES; // 最多保存50个基准数据

  /**
   * 保存性能基准数据
   */
  saveBaseline(
    metrics: DetailedWebVitals,
    _buildInfo?: PerformanceBaseline['buildInfo'],
  ): void {
    try {
      const baselineData = {
        id: this.generateId(),
        timestamp: Date.now(),
        url: metrics.page.url,
        userAgent: metrics.device.userAgent,
        connection: metrics.connection
          ? {
              effectiveType: metrics.connection.effectiveType,
              downlink: metrics.connection.downlink,
            }
          : undefined,
        metrics: {
          cls: metrics.cls,
          lcp: metrics.lcp,
          fid: metrics.fid,
          fcp: metrics.fcp,
          ttfb: metrics.ttfb,
          domContentLoaded: metrics.domContentLoaded,
          loadComplete: metrics.loadComplete,
          firstPaint: metrics.firstPaint,
        },
        score: this.calculateScore(metrics),
        environment: {
          viewport: metrics.device.viewport,
          memory: metrics.device.memory,
          cores: metrics.device.cores,
        },
      };

      const baseline: PerformanceBaseline = baselineData as PerformanceBaseline;

      const baselines = this.getBaselines();
      baselines.push(baseline);

      // 保持最新的基准数据
      if (baselines.length > PerformanceBaselineManager.MAX_BASELINES) {
        baselines.splice(
          ZERO,
          baselines.length - PerformanceBaselineManager.MAX_BASELINES,
        );
      }

      this.saveBaselines(baselines);
      logger.info('Performance baseline saved', { baselineId: baseline.id });
    } catch (error) {
      logger.error('Failed to save performance baseline', { error });
    }
  }

  /**
   * 获取最近的基准数据
   */
  getRecentBaseline(
    page?: string,
    locale?: string,
  ): PerformanceBaseline | null {
    try {
      const baselines = this.getBaselines();

      // 过滤匹配的基准数据
      const filtered = baselines.filter((baseline) => {
        if (page && !baseline.url.includes(page)) return false;
        if (locale && !baseline.url.includes(`/${locale}/`)) return false;
        return true;
      });

      // 返回最新的基准数据
      return filtered.length > ZERO ? filtered[filtered.length - ONE] || null : null;
    } catch (error) {
      logger.error('Failed to get recent baseline', { error });
      return null;
    }
  }

  /**
   * 获取所有基准数据
   */
  getBaselines(): PerformanceBaseline[] {
    try {
      if (typeof window === 'undefined') return [];

      const stored = localStorage.getItem(
        PerformanceBaselineManager.STORAGE_KEY,
      );
      if (!stored) return [];

      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      logger.error('Failed to get baselines from storage', { error });
      return [];
    }
  }

  /**
   * 保存基准数据到存储
   */
  private saveBaselines(baselines: PerformanceBaseline[]): void {
    try {
      if (typeof window === 'undefined') return;

      localStorage.setItem(
        PerformanceBaselineManager.STORAGE_KEY,
        JSON.stringify(baselines),
      );
    } catch (error) {
      logger.error('Failed to save baselines to storage', { error });
    }
  }

  /**
   * 生成唯一ID
   */
  private generateId(): string {
    return `baseline-${Date.now()}-${Math.random().toString(WEB_VITALS_CONSTANTS.HASH_BASE).substr(WEB_VITALS_CONSTANTS.ID_SUBSTR_START, WEB_VITALS_CONSTANTS.ID_RANDOM_LENGTH)}`;
  }

  /**
   * 计算性能评分
   */
  private calculateScore(metrics: DetailedWebVitals): number {
    // 简化的评分算法
    let score = PERCENTAGE_FULL;

    // CLS 评分
    if (metrics.cls > BASELINE_CONSTANTS.CLS_BASELINE)
      score -= BASELINE_CONSTANTS.CLS_BASELINE_DAYS;
    else if (metrics.cls > BASELINE_CONSTANTS.FID_BASELINE)
      score -= BASELINE_CONSTANTS.FID_BASELINE_DAYS;

    // LCP 评分
    if (metrics.lcp > BASELINE_CONSTANTS.LCP_BASELINE)
      score -= BASELINE_CONSTANTS.LCP_BASELINE_DAYS;
    else if (metrics.lcp > BASELINE_CONSTANTS.TTFB_BASELINE)
      score -= BASELINE_CONSTANTS.TTFB_BASELINE_DAYS;

    // FID 评分
    if (metrics.fid > BASELINE_CONSTANTS.INP_BASELINE)
      score -= BASELINE_CONSTANTS.INP_BASELINE_DAYS;
    else if (metrics.fid > WEB_VITALS_THRESHOLDS.FID.GOOD)
      score -= BASELINE_CONSTANTS.INP_BASELINE_EXTRA_DAYS;

    return Math.max(ZERO, score);
  }

  /**
   * 清理过期的基准数据
   */
  cleanupOldBaselines(
    maxAge: number = WEB_VITALS_CONSTANTS.BASELINE_MAX_AGE_DAYS *
      WEB_VITALS_CONSTANTS.HOURS_PER_DAY *
      WEB_VITALS_CONSTANTS.MINUTES_PER_HOUR *
      WEB_VITALS_CONSTANTS.SECONDS_PER_MINUTE *
      WEB_VITALS_CONSTANTS.MILLISECONDS_PER_SECOND,
  ): void {
    try {
      const baselines = this.getBaselines();
      const cutoff = Date.now() - maxAge;

      const filtered = baselines.filter(
        (baseline) => baseline.timestamp > cutoff,
      );

      if (filtered.length !== baselines.length) {
        this.saveBaselines(filtered);
        logger.info('Cleaned up old baselines', {
          removed: baselines.length - filtered.length,
          remaining: filtered.length,
        });
      }
    } catch (error) {
      logger.error('Failed to cleanup old baselines', { error });
    }
  }
}
