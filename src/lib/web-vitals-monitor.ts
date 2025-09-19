'use client';

import { logger } from '@/lib/logger';
import {
  ANIMATION_DURATION_NORMAL,
  ANIMATION_DURATION_SLOW,
  HTTP_OK,
  PERCENTAGE_FULL,
  THREE_SECONDS_MS,
  ZERO,
} from '@/constants';
import {
  COUNT_800,
  MAGIC_1800,
  MAGIC_2500,
  MAGIC_4000,
} from '@/constants/count';
import { MAGIC_0_1, MAGIC_0_25 } from '@/constants/decimal';

/**
 * 扩展的PerformanceEntry接口，包含Layout Shift特定属性
 */
interface LayoutShiftEntry extends PerformanceEntry {
  hadRecentInput: boolean;
  value: number;
}

/**
 * 扩展的PerformanceEntry接口，包含First Input Delay特定属性
 */
interface FirstInputEntry extends PerformanceEntry {
  processingStart: number;
}

/**
 * Web Vitals 性能指标接口
 */
export interface WebVitalsMetrics {
  /** 累积布局偏移 (Cumulative Layout Shift) */
  cls: number;
  /** 首次输入延迟 (First Input Delay) */
  fid: number;
  /** 最大内容绘制 (Largest Contentful Paint) */
  lcp: number;
  /** 首次内容绘制 (First Contentful Paint) */
  fcp?: number;
  /** 首字节时间 (Time to First Byte) */
  ttfb?: number;
  /** 交互到下次绘制 (Interaction to Next Paint) */
  inp?: number;
}

/**
 * 性能指标评级
 */
export interface MetricRating {
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
}

/**
 * Web Vitals 性能监控类
 *
 * 基于现有性能监控组件模式，提供核心Web Vitals指标的收集和分析。
 * 支持开发环境显示和生产环境静默收集。
 */
export class WebVitalsMonitor {
  private static instance: WebVitalsMonitor;
  private metrics: Partial<WebVitalsMetrics> = {};
  private observers: PerformanceObserver[] = [];
  private isInitialized = false;

  // Web Vitals 阈值配置
  private static readonly THRESHOLDS = {
    CLS: { good: MAGIC_0_1, poor: MAGIC_0_25 },
    FID: { good: PERCENTAGE_FULL, poor: ANIMATION_DURATION_NORMAL },
    LCP: { good: MAGIC_2500, poor: MAGIC_4000 },
    FCP: { good: MAGIC_1800, poor: THREE_SECONDS_MS },
    TTFB: { good: COUNT_800, poor: MAGIC_1800 },
    INP: { good: HTTP_OK, poor: ANIMATION_DURATION_SLOW },
  } as const;

  private constructor() {
    this.initialize();
  }

  /**
   * 获取单例实例
   */
  static getInstance(): WebVitalsMonitor {
    if (!WebVitalsMonitor.instance) {
      WebVitalsMonitor.instance = new WebVitalsMonitor();
    }
    return WebVitalsMonitor.instance;
  }

  /**
   * 初始化监控
   */
  private initialize(): void {
    if (this.isInitialized || typeof window === 'undefined') {
      return;
    }

    try {
      this.setupPerformanceObservers();
      this.setupNavigationTiming();
      this.isInitialized = true;
    } catch (error) {
      logger.warn('Web Vitals monitoring initialization failed', {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * 设置性能观察器
   */
  private setupPerformanceObservers(): void {
    if (!('PerformanceObserver' in window)) return;

    const trySetupObserver = (
      name: 'CLS' | 'LCP' | 'FID' | 'FCP',
      setup: () => PerformanceObserver,
    ) => {
      try {
        const obs = setup();
        this.observers.push(obs);
      } catch (error) {
        logger.warn(`${name} observer setup failed`, {
          error: error instanceof Error ? error.message : String(error),
        });
      }
    };

    // CLS (Cumulative Layout Shift)
    trySetupObserver('CLS', () => {
      const clsObserver = new PerformanceObserver((list) => {
        let clsValue = ZERO;
        for (const entry of list.getEntries()) {
          const layoutShiftEntry = entry as LayoutShiftEntry;
          if (!layoutShiftEntry.hadRecentInput) {
            clsValue += layoutShiftEntry.value;
          }
        }
        this.recordCLS(clsValue);
      });
      clsObserver.observe({ type: 'layout-shift', buffered: true });
      return clsObserver;
    });

    // LCP (Largest Contentful Paint)
    trySetupObserver('LCP', () => {
      const lcpObserver = new PerformanceObserver((list) => {
        const lastEntry = list.getEntries().at(-1);
        if (lastEntry) this.recordLCP(lastEntry.startTime);
      });
      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
      return lcpObserver;
    });

    // FID (First Input Delay)
    trySetupObserver('FID', () => {
      const fidObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const firstInputEntry = entry as FirstInputEntry;
          this.recordFID(firstInputEntry.processingStart - entry.startTime);
        }
      });
      fidObserver.observe({ type: 'first-input', buffered: true });
      return fidObserver;
    });

    // FCP (First Contentful Paint)
    trySetupObserver('FCP', () => {
      const fcpObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === 'first-contentful-paint') {
            this.recordFCP(entry.startTime);
          }
        }
      });
      fcpObserver.observe({ type: 'paint', buffered: true });
      return fcpObserver;
    });
  }

  /**
   * 设置导航时间监控
   */
  private setupNavigationTiming(): void {
    if ('performance' in window && 'getEntriesByType' in performance) {
      // 使用 setTimeout 确保导航时间数据可用
      setTimeout(() => {
        const navigationEntries = performance.getEntriesByType('navigation') as
          | PerformanceNavigationTiming[]
          | undefined;
        if (
          !Array.isArray(navigationEntries) ||
          navigationEntries.length <= ZERO
        ) {
          return;
        }
        const [navigation] = navigationEntries;
        if (navigation && navigation.responseStart && navigation.requestStart) {
          const ttfb = navigation.responseStart - navigation.requestStart;
          this.recordTTFB(ttfb);
        }
      }, ZERO);
    }
  }

  /**
   * 记录 CLS 指标
   */
  recordCLS(value: number): void {
    this.metrics.cls = (this.metrics.cls || ZERO) + value;
  }

  /**
   * 记录 FID 指标
   */
  recordFID(value: number): void {
    if (!this.metrics.fid || value > this.metrics.fid) {
      this.metrics.fid = value;
    }
  }

  /**
   * 记录 LCP 指标
   */
  recordLCP(value: number): void {
    this.metrics.lcp = value;
  }

  /**
   * 记录 FCP 指标
   */
  recordFCP(value: number): void {
    this.metrics.fcp = value;
  }

  /**
   * 记录 TTFB 指标
   */
  recordTTFB(value: number): void {
    this.metrics.ttfb = value;
  }

  /**
   * 获取性能指标评级
   */
  private getMetricRating(
    metric: keyof typeof WebVitalsMonitor.THRESHOLDS,
    value: number,
  ): MetricRating {
    // 安全的属性访问，防止对象注入攻击
    const allowedMetrics = ['CLS', 'FID', 'LCP', 'FCP', 'TTFB', 'INP'] as const;
    if (!allowedMetrics.includes(metric as (typeof allowedMetrics)[number])) {
      throw new Error(`Invalid metric: ${metric}`);
    }
    const safeThresholds = new Map(Object.entries(WebVitalsMonitor.THRESHOLDS));
    const thresholds = safeThresholds.get(metric) || { good: ZERO, poor: ZERO };
    let rating: 'good' | 'needs-improvement' | 'poor';

    if (value <= thresholds.good) {
      rating = 'good';
    } else if (value <= thresholds.poor) {
      rating = 'needs-improvement';
    } else {
      rating = 'poor';
    }

    return { value, rating };
  }

  /**
   * 获取性能摘要
   */
  getPerformanceSummary(): {
    metrics: WebVitalsMetrics;
    ratings: Record<string, MetricRating>;
    score: number;
  } {
    const metrics: WebVitalsMetrics = {
      cls: this.metrics.cls || ZERO,
      fid: this.metrics.fid || ZERO,
      lcp: this.metrics.lcp || ZERO,
      ...(this.metrics.fcp !== undefined && { fcp: this.metrics.fcp }),
      ...(this.metrics.ttfb !== undefined && { ttfb: this.metrics.ttfb }),
      ...(this.metrics.inp !== undefined && { inp: this.metrics.inp }),
    };

    const ratings = {
      cls: this.getMetricRating('CLS', metrics.cls),
      fid: this.getMetricRating('FID', metrics.fid),
      lcp: this.getMetricRating('LCP', metrics.lcp),
      ...(metrics.fcp && { fcp: this.getMetricRating('FCP', metrics.fcp) }),
      ...(metrics.ttfb && { ttfb: this.getMetricRating('TTFB', metrics.ttfb) }),
    };

    // 计算总体性能评分
    const ratingValues = Object.values(ratings);
    const goodCount = ratingValues.filter((r) => r.rating === 'good').length;
    const score = Math.round(
      (goodCount / ratingValues.length) * PERCENTAGE_FULL,
    );

    return { metrics, ratings, score };
  }

  /**
   * 发送性能报告
   */
  sendReport(): void {
    const summary = this.getPerformanceSummary();

    // 开发环境输出到日志
    if (process.env.NODE_ENV === 'development') {
      logger.info('Web Vitals Performance Report', {
        ratings: summary.ratings,
        score: summary.score,
        metrics: summary.metrics,
      });
    }

    // 生产环境可以发送到分析服务
    // 这里可以集成 Google Analytics、Vercel Analytics 等
  }

  /**
   * 重置监控器状态
   */
  reset(): void {
    this.metrics = {};
    this.cleanup();
    this.initialize();
  }

  /**
   * 清理监控器
   */
  cleanup(): void {
    this.observers.forEach((observer) => {
      try {
        observer.disconnect();
      } catch (error) {
        logger.warn('Failed to disconnect performance observer', {
          error: error instanceof Error ? error.message : String(error),
        });
      }
    });
    this.observers = [];
    this.isInitialized = false;
  }
}

/**
 * 获取 Web Vitals 监控实例
 */
export const webVitalsMonitor = WebVitalsMonitor.getInstance();
