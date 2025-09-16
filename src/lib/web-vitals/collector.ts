/**
 * Web Vitals 收集器 - 统一导出入口
 * Web Vitals collector - unified export entry
 */

'use client';

import type { DetailedWebVitals } from '@/lib/web-vitals/types';
import { WebVitalsCollectorAnalyzer } from '@/lib/web-vitals/web-vitals-collector-analyzer';
import { WebVitalsCollectorBase } from '@/lib/web-vitals/web-vitals-collector-base';

/**
 * 增强的 Web Vitals 数据收集器
 * 提供详细的性能分析和诊断信息
 */
export class EnhancedWebVitalsCollector extends WebVitalsCollectorBase {
  private analyzer: WebVitalsCollectorAnalyzer;

  constructor() {
    super();
    this.analyzer = new WebVitalsCollectorAnalyzer();
  }

  /**
   * 开始收集性能指标
   * 为了与测试兼容，提供公共的start方法
   */
  public start(): void {
    // 基类构造函数已经自动开始收集，这里确保收集状态
    if (!this.collectingStatus) {
      this.initializeCollection();
    }
  }

  /**
   * 停止收集性能指标并清理资源
   * 为了与测试兼容，提供公共的stop方法
   */
  public stop(): void {
    this.cleanup();
  }

  public generateDiagnosticReport(): {
    metrics: DetailedWebVitals;
    analysis: {
      issues: string[];
      recommendations: string[];
      score: number;
    };
  } {
    const metrics = this.getDetailedMetrics();
    return this.analyzer.generateDiagnosticReport(metrics);
  }
}
