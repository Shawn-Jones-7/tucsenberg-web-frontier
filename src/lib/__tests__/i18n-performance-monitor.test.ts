/**
 * I18n Performance - Monitor Tests
 *
 * 专门测试性能监控功能，包括：
 * - I18nPerformanceMonitor 指标记录
 * - 性能评估和评分
 * - 性能目标定义
 * - 集成测试场景
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  evaluatePerformance,
  I18nPerformanceMonitor,
  PERFORMANCE_TARGETS,
} from '../i18n-performance';

describe('I18n Performance - Monitor Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    I18nPerformanceMonitor.reset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('I18nPerformanceMonitor', () => {
    it('should record load times', () => {
      I18nPerformanceMonitor.recordLoadTime(100);
      I18nPerformanceMonitor.recordLoadTime(150);

      const metrics = I18nPerformanceMonitor.getMetrics();
      expect(metrics.averageLoadTime).toBe(125);
    });

    it('should record cache hits and misses', () => {
      I18nPerformanceMonitor.recordCacheHit();
      I18nPerformanceMonitor.recordCacheHit();
      I18nPerformanceMonitor.recordCacheMiss();

      const metrics = I18nPerformanceMonitor.getMetrics();
      expect(metrics.totalRequests).toBe(3);
      expect(metrics.cacheHitRate).toBeGreaterThan(0);
    });

    it('should record errors', () => {
      I18nPerformanceMonitor.recordError();
      I18nPerformanceMonitor.recordError();

      const metrics = I18nPerformanceMonitor.getMetrics();
      expect(metrics.totalErrors).toBe(2);
    });

    it('should limit load time history', () => {
      // Record more load times than the limit
      for (let i = 0; i < 2000; i++) {
        I18nPerformanceMonitor.recordLoadTime(i);
      }

      const metrics = I18nPerformanceMonitor.getMetrics();
      // Should not crash and should have reasonable average
      expect(metrics.averageLoadTime).toBeGreaterThan(0);
    });

    it('should reset metrics', () => {
      I18nPerformanceMonitor.recordLoadTime(100);
      I18nPerformanceMonitor.recordCacheHit();
      I18nPerformanceMonitor.recordError();

      I18nPerformanceMonitor.reset();

      const metrics = I18nPerformanceMonitor.getMetrics();
      expect(metrics.averageLoadTime).toBe(0);
      expect(metrics.totalRequests).toBe(0);
      expect(metrics.totalErrors).toBe(0);
    });

    it('should handle zero requests gracefully', () => {
      const metrics = I18nPerformanceMonitor.getMetrics();
      expect(metrics.cacheHitRate).toBe(0);
      expect(metrics.averageLoadTime).toBe(0);
    });

    it('should handle extreme load times', () => {
      // Test with very high load times
      I18nPerformanceMonitor.recordLoadTime(10000);
      I18nPerformanceMonitor.recordLoadTime(1);

      const metrics = I18nPerformanceMonitor.getMetrics();
      expect(metrics.averageLoadTime).toBe(5000.5);
    });

    it('should maintain accuracy with many data points', () => {
      // Ensure clean state
      I18nPerformanceMonitor.reset();

      // Record many precise measurements (within cache limit)
      for (let i = 1; i <= 100; i++) {
        I18nPerformanceMonitor.recordLoadTime(i);
      }

      const metrics = I18nPerformanceMonitor.getMetrics();
      // Average of 1 to 100 should be 50.5
      expect(Math.abs(metrics.averageLoadTime - 50.5)).toBeLessThan(0.1);
    });

    it('should handle concurrent metric recording', () => {
      const promises = [];

      for (let i = 0; i < 100; i++) {
        promises.push(
          new Promise<void>((resolve) => {
            I18nPerformanceMonitor.recordLoadTime(i);
            I18nPerformanceMonitor.recordCacheHit();
            resolve();
          }),
        );
      }

      return Promise.all(promises).then(() => {
        const metrics = I18nPerformanceMonitor.getMetrics();
        expect(metrics.totalRequests).toBe(100);
      });
    });
  });

  describe('PERFORMANCE_TARGETS', () => {
    it('should define translation load time targets', () => {
      expect(PERFORMANCE_TARGETS.TRANSLATION_LOAD_TIME).toHaveProperty(
        'excellent',
      );
      expect(PERFORMANCE_TARGETS.TRANSLATION_LOAD_TIME).toHaveProperty('good');
      expect(PERFORMANCE_TARGETS.TRANSLATION_LOAD_TIME).toHaveProperty(
        'acceptable',
      );
      expect(PERFORMANCE_TARGETS.TRANSLATION_LOAD_TIME).toHaveProperty('poor');
    });

    it('should define cache hit rate targets', () => {
      expect(PERFORMANCE_TARGETS.CACHE_HIT_RATE).toHaveProperty('excellent');
      expect(PERFORMANCE_TARGETS.CACHE_HIT_RATE).toHaveProperty('good');
      expect(PERFORMANCE_TARGETS.CACHE_HIT_RATE).toHaveProperty('acceptable');
      expect(PERFORMANCE_TARGETS.CACHE_HIT_RATE).toHaveProperty('poor');
    });

    it('should have logical target thresholds', () => {
      const loadTimeTargets = PERFORMANCE_TARGETS.TRANSLATION_LOAD_TIME;
      expect(loadTimeTargets.excellent).toBeLessThan(loadTimeTargets.good);
      expect(loadTimeTargets.good).toBeLessThan(loadTimeTargets.acceptable);
      expect(loadTimeTargets.acceptable).toBeLessThan(loadTimeTargets.poor);

      const cacheTargets = PERFORMANCE_TARGETS.CACHE_HIT_RATE;
      expect(cacheTargets.excellent).toBeGreaterThan(cacheTargets.good);
      expect(cacheTargets.good).toBeGreaterThan(cacheTargets.acceptable);
      expect(cacheTargets.acceptable).toBeGreaterThan(cacheTargets.poor);
    });
  });

  describe('evaluatePerformance', () => {
    it('should evaluate excellent performance', () => {
      const metrics = {
        averageLoadTime: 30, // excellent
        cacheHitRate: 99, // excellent
        totalErrors: 0,
        totalRequests: 100,
      };

      const evaluation = evaluatePerformance(metrics);

      expect(evaluation.grade).toBe('A');
      expect(evaluation.overallScore).toBeGreaterThan(90);
    });

    it('should evaluate poor performance', () => {
      const metrics = {
        averageLoadTime: 600, // poor
        cacheHitRate: 70, // poor
        totalErrors: 10,
        totalRequests: 100,
      };

      const evaluation = evaluatePerformance(metrics);

      expect(evaluation.grade).toBe('F');
      expect(evaluation.overallScore).toBeLessThan(70);
    });

    it('should evaluate mixed performance', () => {
      const metrics = {
        averageLoadTime: 120, // good
        cacheHitRate: 85, // acceptable
        totalErrors: 2,
        totalRequests: 100,
      };

      const evaluation = evaluatePerformance(metrics);

      expect(evaluation).toHaveProperty('overallScore');
      expect(evaluation).toHaveProperty('loadTimeScore');
      expect(evaluation).toHaveProperty('cacheScore');
      expect(evaluation).toHaveProperty('grade');
      expect(['A', 'B', 'C', 'D', 'F']).toContain(evaluation.grade);
    });

    it('should handle edge case metrics', () => {
      const metrics = {
        averageLoadTime: 0,
        cacheHitRate: 100,
        totalErrors: 0,
        totalRequests: 0,
      };

      const evaluation = evaluatePerformance(metrics);
      expect(evaluation).toHaveProperty('grade');
      expect(evaluation.overallScore).toBeGreaterThanOrEqual(0);
    });

    it('should penalize high error rates', () => {
      const metrics = {
        averageLoadTime: 50, // excellent
        cacheHitRate: 95, // excellent
        totalErrors: 50, // high error rate
        totalRequests: 100,
      };

      const evaluation = evaluatePerformance(metrics);
      // High error rate should significantly impact the score
      expect(evaluation.overallScore).toBeLessThan(80);
    });
  });
});
