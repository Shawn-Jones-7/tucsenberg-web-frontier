import type { WebVitalsMonitor } from '@/lib/web-vitals-monitor';
import type { SimpleWebVitals } from '@/app/[locale]/diagnostics/components';

// 常量定义 - 避免魔法数字
export const HISTORY_DISPLAY_LIMIT = 10;
export const HISTORY_STORAGE_LIMIT = 49;
export const JSON_INDENT_SPACES = 2;
export const DATA_COLLECTION_DELAY = 1000;

// 扩展Window接口以包含webVitalsMonitor
declare global {
  interface Window {
    webVitalsMonitor?: WebVitalsMonitor;
  }
}

/**
 * 从现有的 Web Vitals 监控器获取数据
 */
export function collectCurrentMetrics(): SimpleWebVitals {
  // 尝试从全局 webVitalsMonitor 获取数据
  const { webVitalsMonitor } = window;

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
    cls: 0,
    lcp: 800,
    fid: 0,
    fcp: 800,
    ttfb: 400,
    score: 100,
    timestamp: Date.now(),
    url: window.location.href,
  };
}

/**
 * 加载历史数据
 */
export function loadHistoricalData(): SimpleWebVitals[] {
  try {
    const stored = localStorage.getItem('webVitalsHistory');
    if (stored) {
      const data = JSON.parse(stored);
      return Array.isArray(data) ? data.slice(0, HISTORY_DISPLAY_LIMIT) : [];
    }
  } catch (error) {
    console.warn('Failed to load historical data:', error);
  }
  return [];
}

/**
 * 保存当前数据
 */
export function saveCurrentData(metrics: SimpleWebVitals): SimpleWebVitals[] {
  try {
    const existing = JSON.parse(
      localStorage.getItem('webVitalsHistory') || '[]',
    );
    const updated = [metrics, ...existing.slice(0, HISTORY_STORAGE_LIMIT)];
    localStorage.setItem('webVitalsHistory', JSON.stringify(updated));
    return updated.slice(0, HISTORY_DISPLAY_LIMIT);
  } catch (error) {
    console.warn('Failed to save data:', error);
    return [];
  }
}

/**
 * 导出诊断数据
 */
export function exportDiagnosticsData(
  currentMetrics: SimpleWebVitals | null,
  historicalData: SimpleWebVitals[],
): void {
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
  a.download = `web-vitals-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
