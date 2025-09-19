import { useCallback } from 'react';
import {
  ANIMATION_DURATION_NORMAL,
  COUNT_FIVE,
  COUNT_TRIPLE,
  MAGIC_0_1,
  MAGIC_0_25,
  MAGIC_75,
  MAGIC_90,
  MAGIC_2500,
  MAGIC_4000,
  PERCENTAGE_HALF,
} from '@/constants';
import { TEST_COUNT_CONSTANTS } from '@/constants/test-constants';
import type {
  DiagnosticReport,
  ExportFormat,
  WebVitalsDiagnosticsState,
  WebVitalsReportExport,
} from '@/hooks/web-vitals-diagnostics-types';

/**
 * Web Vitals 报告导出功能
 */

/**
 * 导出JSON格式报告
 */
export function exportJsonReport(data: Record<string, unknown>): void {
  const blob = new Blob(
    [JSON.stringify(data, null, TEST_COUNT_CONSTANTS.SMALL)],
    { type: 'application/json' },
  );
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `web-vitals-report-${Date.now()}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * 导出CSV格式报告
 */
export function exportCsvReport(historicalReports: DiagnosticReport[]): void {
  const csvHeaders = [
    'Timestamp',
    'URL',
    'CLS',
    'LCP',
    'FID',
    'FCP',
    'TTFB',
    'Performance Score',
  ];

  const csvRows = historicalReports.map((report) => [
    new Date(report.timestamp).toISOString(),
    report.pageUrl,
    report.vitals.cls.toFixed(COUNT_TRIPLE),
    report.vitals.lcp.toFixed(0),
    report.vitals.fid.toFixed(0),
    report.vitals.fcp.toFixed(0),
    report.vitals.ttfb.toFixed(0),
    report.score?.toFixed(1) || 'N/A',
  ]);

  const csvContent = [csvHeaders, ...csvRows]
    .map((row) => row.map((cell) => `"${cell}"`).join(','))
    .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `web-vitals-report-${Date.now()}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * 报告导出逻辑Hook
 */
export function useReportExport(
  state: WebVitalsDiagnosticsState,
  getPerformanceTrends: () => unknown,
  getPageComparison: () => unknown,
): WebVitalsReportExport {
  const exportReport = useCallback(
    (format: ExportFormat = 'json') => {
      if (format === 'csv') {
        exportCsvReport(state.historicalReports);
      } else {
        const exportData = {
          currentReport: state.currentReport,
          historicalReports: state.historicalReports,
          performanceTrends: getPerformanceTrends(),
          pageComparison: getPageComparison(),
          exportTimestamp: Date.now(),
          exportVersion: '1.0.0',
        };
        exportJsonReport(exportData);
      }
    },
    [
      state.currentReport,
      state.historicalReports,
      getPerformanceTrends,
      getPageComparison,
    ],
  );

  return { exportReport };
}

/**
 * 生成详细的报告数据
 */
export function generateDetailedReport(
  state: WebVitalsDiagnosticsState,
  performanceTrends: unknown,
  pageComparison: unknown,
): Record<string, unknown> {
  return {
    summary: {
      totalReports: state.historicalReports.length,
      latestReport: state.currentReport,
      averageMetrics: calculateAverageMetrics(state.historicalReports),
      exportTimestamp: Date.now(),
    },
    currentReport: state.currentReport,
    historicalReports: state.historicalReports,
    analysis: {
      performanceTrends,
      pageComparison,
      insights: generateInsights(state.historicalReports),
    },
    metadata: {
      version: '1.0.0',
      userAgent:
        typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown',
      url: typeof window !== 'undefined' ? window.location.href : 'Unknown',
    },
  };
}

/**
 * 计算平均指标
 */
function calculateAverageMetrics(reports: DiagnosticReport[]): {
  cls: number;
  lcp: number;
  fid: number;
  fcp: number;
  ttfb: number;
  performanceScore: number;
} {
  if (reports.length === 0) {
    return {
      cls: 0,
      lcp: 0,
      fid: 0,
      fcp: 0,
      ttfb: 0,
      performanceScore: 0,
    };
  }

  const totals = reports.reduce(
    (acc, report) => ({
      cls: acc.cls + report.vitals.cls,
      lcp: acc.lcp + report.vitals.lcp,
      fid: acc.fid + report.vitals.fid,
      fcp: acc.fcp + report.vitals.fcp,
      ttfb: acc.ttfb + report.vitals.ttfb,
      performanceScore: acc.performanceScore + (report.score || 0),
    }),
    { cls: 0, lcp: 0, fid: 0, fcp: 0, ttfb: 0, performanceScore: 0 },
  );

  const count = reports.length;
  return {
    cls: totals.cls / count,
    lcp: totals.lcp / count,
    fid: totals.fid / count,
    fcp: totals.fcp / count,
    ttfb: totals.ttfb / count,
    performanceScore: totals.performanceScore / count,
  };
}

/**
 * 生成性能洞察
 */
function generateInsights(reports: DiagnosticReport[]): string[] {
  if (reports.length === 0) return ['No data available for analysis'];

  const insights: string[] = [];
  const averages = calculateAverageMetrics(reports);

  const addClsInsights = (cls: number) => {
    if (cls > MAGIC_0_25) {
      insights.push(
        'High Cumulative Layout Shift detected. Consider optimizing layout stability.',
      );
      return;
    }
    if (cls > MAGIC_0_1) {
      insights.push(
        'Moderate Cumulative Layout Shift. Room for improvement in layout stability.',
      );
    }
  };

  const addLcpInsights = (lcp: number) => {
    if (lcp > MAGIC_4000) {
      insights.push(
        'Slow Largest Contentful Paint. Consider optimizing loading performance.',
      );
      return;
    }
    if (lcp > MAGIC_2500) {
      insights.push(
        'Moderate Largest Contentful Paint. Some optimization opportunities exist.',
      );
    }
  };

  const addFidInsights = (fid: number) => {
    if (fid > ANIMATION_DURATION_NORMAL) {
      insights.push(
        'High First Input Delay. Consider optimizing JavaScript execution.',
      );
      return;
    }
    if (fid > 100) {
      insights.push(
        'Moderate First Input Delay. Some interactivity improvements possible.',
      );
    }
  };

  const addTrendInsights = (all: DiagnosticReport[]) => {
    if (all.length < COUNT_FIVE) return;
    const recent = all.slice(-COUNT_FIVE);
    const older = all.slice(0, -COUNT_FIVE);
    if (older.length === 0) return;

    const recentAvg = calculateAverageMetrics(recent);
    const olderAvg = calculateAverageMetrics(older);
    if (recentAvg.performanceScore > olderAvg.performanceScore) {
      insights.push('Performance is improving over time.');
      return;
    }
    if (recentAvg.performanceScore < olderAvg.performanceScore) {
      insights.push(
        'Performance is declining over time. Consider investigating recent changes.',
      );
    }
  };

  addClsInsights(averages.cls);
  addLcpInsights(averages.lcp);
  addFidInsights(averages.fid);
  addTrendInsights(reports);

  if (insights.length === 0) {
    insights.push('Performance metrics are within acceptable ranges.');
  }

  return insights;
}

/**
 * 导出为Excel格式（XLSX）
 */
export function exportExcelReport(historicalReports: DiagnosticReport[]): void {
  // 创建简化的Excel格式（实际上是CSV，但可以被Excel打开）
  const headers = [
    'Date',
    'Time',
    'URL',
    'CLS',
    'LCP (ms)',
    'FID (ms)',
    'FCP (ms)',
    'TTFB (ms)',
    'Performance Score',
    'Status',
  ];

  const rows = historicalReports.map((report) => {
    const date = new Date(report.timestamp);
    const status = getPerformanceStatus(report);

    return [
      date.toLocaleDateString(),
      date.toLocaleTimeString(),
      report.pageUrl,
      report.vitals.cls.toFixed(COUNT_TRIPLE),
      report.vitals.lcp.toFixed(0),
      report.vitals.fid.toFixed(0),
      report.vitals.fcp.toFixed(0),
      report.vitals.ttfb.toFixed(0),
      report.score?.toFixed(1) || 'N/A',
      status,
    ];
  });

  const csvContent = [headers, ...rows]
    .map((row) => row.map((cell) => `"${cell}"`).join(','))
    .join('\n');

  const blob = new Blob([csvContent], { type: 'application/vnd.ms-excel' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `web-vitals-report-${Date.now()}.xlsx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * 获取性能状态
 */
function getPerformanceStatus(report: DiagnosticReport): string {
  const score = report.score || 0;

  if (score >= MAGIC_90) return 'Excellent';
  if (score >= MAGIC_75) return 'Good';
  if (score >= PERCENTAGE_HALF) return 'Needs Improvement';
  return 'Poor';
}
