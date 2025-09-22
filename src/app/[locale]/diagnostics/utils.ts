// ==================== 类型定义 ====================

// 导入Web Vitals相关类型
import type { MetricRating, WebVitalsMetrics } from '@/lib/web-vitals-monitor';

// 诊断页面工具函数和常量

// 常量定义 - 避免魔法数字
export const HISTORY_DISPLAY_LIMIT = 10;
export const HISTORY_STORAGE_LIMIT = 49;
export const METRICS_DECIMAL_PLACES = 2;
export const CLS_DECIMAL_PLACES = 3;
export const JSON_INDENT_SPACES = 2;

// 模拟数据生成常量
const SIMULATION_CONSTANTS = {
  FID_DIVISOR: 2,
  FID_MULTIPLIER: 2,
  FCP_OFFSET: 800,
  FCP_RANGE: 2000,
  TTFB_DIVISOR: 4,
  SCORE_OFFSET: 10,
  SCORE_RANGE: 40,
} as const;

export const PERFORMANCE_THRESHOLDS = {
  CLS_GOOD: 0.1,
  CLS_NEEDS_IMPROVEMENT: 0.25,
  LCP_GOOD: 2500,
  LCP_NEEDS_IMPROVEMENT: 4000,
  FID_GOOD: 100,
  FID_NEEDS_IMPROVEMENT: 300,
  FCP_GOOD: 1800,
  FCP_NEEDS_IMPROVEMENT: 3000,
  TTFB_GOOD: 800,
  TTFB_NEEDS_IMPROVEMENT: 1800,
  RETRY_ATTEMPTS: 3,
  SCORE_GOOD: 80,
  SCORE_NEEDS_IMPROVEMENT: 50,
} as const;

/**
 * Web Vitals 性能摘要接口
 * 用于诊断工具的性能数据汇总
 */
export interface WebVitalsSummary {
  /** Web Vitals 指标数据 */
  metrics: WebVitalsMetrics;
  /** 指标评级信息 */
  ratings: Record<string, MetricRating>;
  /** 综合评分 */
  score: number;
  /** 累积布局偏移 (Cumulative Layout Shift) */
  cls: number;
  /** 最大内容绘制 (Largest Contentful Paint) */
  lcp: number;
  /** 首次输入延迟 (First Input Delay) - 历史兼容 */
  fid?: number;
  /** 交互到下次绘制 (Interaction to Next Paint) - 新版推荐 */
  inp?: number;
  /** 首次内容绘制 (First Contentful Paint) */
  fcp: number;
  /** 首字节时间 (Time to First Byte) */
  ttfb: number;
}

/**
 * 简化的 Web Vitals 指标接口
 * 用于诊断页面的性能数据展示
 */
export interface SimpleWebVitals {
  /** 累积布局偏移 (Cumulative Layout Shift) */
  cls: number;
  /** 最大内容绘制 (Largest Contentful Paint) */
  lcp: number;
  /** 首次输入延迟 (First Input Delay) */
  fid: number;
  /** 首次内容绘制 (First Contentful Paint) */
  fcp: number;
  /** 首字节时间 (Time to First Byte) */
  ttfb: number;
  /** 综合评分 */
  score: number;
  /** 时间戳 */
  timestamp: number;
  /** 页面URL */
  url: string;
}

// 工具函数：从现有的 Web Vitals 监控器获取数据
export function collectCurrentMetrics(): SimpleWebVitals {
  // 尝试从全局 webVitalsMonitor 获取数据
  const { webVitalsMonitor } = window as Window & {
    webVitalsMonitor?: {
      getPerformanceSummary: () => {
        cls?: number;
        lcp?: number;
        fid?: number;
        fcp?: number;
        ttfb?: number;
        score?: number;
      };
    };
  };

  if (webVitalsMonitor) {
    const summary = webVitalsMonitor.getPerformanceSummary();
    return {
      cls: summary.metrics.cls || 0,
      lcp: summary.metrics.lcp || 0,
      fid: summary.metrics.fid || 0,
      fcp: summary.metrics.fcp || 0,
      ttfb: summary.metrics.ttfb || 0,
      score: summary.score || 0,
      timestamp: Date.now(),
      url: window.location.href,
    };
  }

  // 如果没有监控器，返回模拟数据
  return {
    cls: Math.random() * PERFORMANCE_THRESHOLDS.CLS_NEEDS_IMPROVEMENT,
    lcp:
      PERFORMANCE_THRESHOLDS.LCP_GOOD +
      Math.random() * PERFORMANCE_THRESHOLDS.LCP_GOOD,
    fid:
      PERFORMANCE_THRESHOLDS.FID_GOOD / SIMULATION_CONSTANTS.FID_DIVISOR +
      Math.random() *
        PERFORMANCE_THRESHOLDS.FID_GOOD *
        SIMULATION_CONSTANTS.FID_MULTIPLIER,
    fcp:
      PERFORMANCE_THRESHOLDS.FCP_GOOD -
      SIMULATION_CONSTANTS.FCP_OFFSET +
      Math.random() * SIMULATION_CONSTANTS.FCP_RANGE,
    ttfb:
      PERFORMANCE_THRESHOLDS.TTFB_GOOD / SIMULATION_CONSTANTS.TTFB_DIVISOR +
      Math.random() * PERFORMANCE_THRESHOLDS.TTFB_GOOD,
    score:
      PERFORMANCE_THRESHOLDS.SCORE_NEEDS_IMPROVEMENT +
      SIMULATION_CONSTANTS.SCORE_OFFSET +
      Math.random() * SIMULATION_CONSTANTS.SCORE_RANGE,
    timestamp: Date.now(),
    url: window.location.href,
  };
}

// 工具函数：加载历史数据
export function loadHistoricalData(): SimpleWebVitals[] {
  try {
    const stored = localStorage.getItem('webVitalsHistory');
    if (stored) {
      const data = JSON.parse(stored);
      return Array.isArray(data) ? data.slice(0, HISTORY_DISPLAY_LIMIT) : [];
    }
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('Failed to load historical data:', error);
    }
  }
  return [];
}

// 工具函数：保存当前数据
export function saveCurrentData(metrics: SimpleWebVitals): SimpleWebVitals[] {
  try {
    const existing = JSON.parse(
      localStorage.getItem('webVitalsHistory') || '[]',
    );
    const updated = [metrics, ...existing.slice(0, HISTORY_STORAGE_LIMIT)];
    localStorage.setItem('webVitalsHistory', JSON.stringify(updated));
    return updated.slice(0, HISTORY_DISPLAY_LIMIT);
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('Failed to save data:', error);
    }
    return [];
  }
}

// 工具函数：导出数据
export function exportDiagnosticsData(
  currentMetrics: SimpleWebVitals | null,
  historicalData: SimpleWebVitals[],
) {
  const data = {
    current: currentMetrics,
    historical: historicalData,
    timestamp: new Date().toISOString(),
  };

  const blob = new Blob([JSON.stringify(data, null, JSON_INDENT_SPACES)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `web-vitals-diagnostics-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// 工具函数：获取指标状态
export function getMetricStatus(
  metric: string,
  value: number,
): 'good' | 'needs-improvement' | 'poor' {
  const thresholds = {
    cls: {
      good: PERFORMANCE_THRESHOLDS.CLS_GOOD,
      needsImprovement: PERFORMANCE_THRESHOLDS.CLS_NEEDS_IMPROVEMENT,
    },
    lcp: {
      good: PERFORMANCE_THRESHOLDS.LCP_GOOD,
      needsImprovement: PERFORMANCE_THRESHOLDS.LCP_NEEDS_IMPROVEMENT,
    },
    fid: {
      good: PERFORMANCE_THRESHOLDS.FID_GOOD,
      needsImprovement: PERFORMANCE_THRESHOLDS.FID_NEEDS_IMPROVEMENT,
    },
    fcp: {
      good: PERFORMANCE_THRESHOLDS.FCP_GOOD,
      needsImprovement: PERFORMANCE_THRESHOLDS.FCP_NEEDS_IMPROVEMENT,
    },
    ttfb: {
      good: PERFORMANCE_THRESHOLDS.TTFB_GOOD,
      needsImprovement: PERFORMANCE_THRESHOLDS.TTFB_NEEDS_IMPROVEMENT,
    },
  } as const;

  const threshold = thresholds[metric as keyof typeof thresholds];
  if (!threshold) return 'good';

  if (value <= threshold.good) return 'good';
  if (value <= threshold.needsImprovement) return 'needs-improvement';
  return 'poor';
}

// 工具函数：格式化指标值
export function formatMetric(metric: string, value: number): string {
  if (metric === 'cls') {
    return value.toFixed(CLS_DECIMAL_PLACES);
  }
  return Math.round(value).toString() + (metric !== 'score' ? 'ms' : '');
}
