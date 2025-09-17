'use client';

import { ONE, ZERO } from "@/constants/magic-numbers";
import { logger } from '@/lib/logger';
import type { DetailedWebVitals } from '@/lib/web-vitals/types';

/**
 * Web Vitals 观察器类
 * 负责收集各种性能指标
 */
export class WebVitalsObservers {
  private metrics: Partial<DetailedWebVitals>;
  private observers: PerformanceObserver[] = [];

  constructor(metrics: Partial<DetailedWebVitals>) {
    this.metrics = metrics;
  }

  /**
   * 观察布局偏移 (CLS)
   */
  observeLayoutShift(): PerformanceObserver | null {
    if (!('PerformanceObserver' in window)) return null;

    try {
      const observer = new PerformanceObserver((list) => {
        let clsValue = ZERO;
        for (const entry of list.getEntries()) {
          const layoutShift = entry as PerformanceEntry & {
            hadRecentInput?: boolean;
            value: number;
          };
          // 只计算非用户输入引起的布局偏移
          if (!layoutShift.hadRecentInput) {
            clsValue += layoutShift.value;
          }
        }
        this.metrics.cls = (this.metrics.cls || ZERO) + clsValue;
      });

      observer.observe({ type: 'layout-shift', buffered: true });
      this.observers.push(observer);
      return observer;
    } catch (error) {
      logger.warn('Failed to observe layout shift', { error });
      return null;
    }
  }

  /**
   * 观察最大内容绘制 (LCP)
   */
  observeLargestContentfulPaint(): PerformanceObserver | null {
    if (!('PerformanceObserver' in window)) return null;

    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - ONE];
        if (lastEntry) {
          this.metrics.lcp = lastEntry.startTime;
        }
      });

      observer.observe({ type: 'largest-contentful-paint', buffered: true });
      this.observers.push(observer);
      return observer;
    } catch (error) {
      logger.warn('Failed to observe LCP', { error });
      return null;
    }
  }

  /**
   * 观察首次输入延迟 (FID)
   */
  observeFirstInputDelay(): PerformanceObserver | null {
    if (!('PerformanceObserver' in window)) return null;

    try {
      const observer = new PerformanceObserver((list) => {
        // eslint-disable-next-line no-unreachable-loop
        for (const entry of list.getEntries()) {
          const firstInput = entry as PerformanceEntry & {
            processingStart: number;
          };
          this.metrics.fid = firstInput.processingStart - firstInput.startTime;
          break; // 只需要第一个输入
        }
      });

      observer.observe({ type: 'first-input', buffered: true });
      this.observers.push(observer);
      return observer;
    } catch (error) {
      logger.warn('Failed to observe FID', { error });
      return null;
    }
  }

  /**
   * 观察首次内容绘制 (FCP)
   */
  observeFirstContentfulPaint(): PerformanceObserver | null {
    if (!('PerformanceObserver' in window)) return null;

    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === 'first-contentful-paint') {
            this.metrics.fcp = entry.startTime;
            break;
          }
        }
      });

      observer.observe({ type: 'paint', buffered: true });
      this.observers.push(observer);
      return observer;
    } catch (error) {
      logger.warn('Failed to observe FCP', { error });
      return null;
    }
  }

  /**
   * 观察交互到下次绘制 (INP)
   */
  observeInteractionToNextPaint(): PerformanceObserver | null {
    if (!('PerformanceObserver' in window)) return null;

    try {
      const observer = new PerformanceObserver((list) => {
        let maxINP = ZERO;
        for (const entry of list.getEntries()) {
          const interaction = entry as PerformanceEntry & {
            processingEnd: number;
          };
          const inp = interaction.processingEnd - interaction.startTime;
          maxINP = Math.max(maxINP, inp);
        }
        this.metrics.inp = Math.max(this.metrics.inp || ZERO, maxINP);
      });

      observer.observe({ type: 'event', buffered: true });
      this.observers.push(observer);
      return observer;
    } catch (error) {
      logger.warn('Failed to observe INP', { error });
      return null;
    }
  }

  /**
   * 启动所有观察器
   */
  startAllObservers(): void {
    this.observeLayoutShift();
    this.observeLargestContentfulPaint();
    this.observeFirstInputDelay();
    this.observeFirstContentfulPaint();
    this.observeInteractionToNextPaint();
  }

  /**
   * 清理所有观察器
   */
  cleanup(): void {
    this.observers.forEach((observer) => observer.disconnect());
    this.observers = [];
  }

  /**
   * 获取观察器列表
   */
  getObservers(): PerformanceObserver[] {
    return [...this.observers];
  }
}
