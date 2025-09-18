/**
 * Web Vitals 诊断分析器
 * Web Vitals diagnostics analyzer functions
 */

import type { DetailedWebVitals } from '@/lib/enhanced-web-vitals';
import { COUNT_TRIPLE, COUNT_PAIR, OFFSET_NEGATIVE_MEDIUM, OFFSET_NEGATIVE_LARGE  } from '@/constants';

import { calculatePercentageChange } from '@/hooks/web-vitals-diagnostics-calculator';
import {
  WEB_VITALS_CONSTANTS,
  type DiagnosticReport,
  type ExportData,
  type PageComparison,
  type PagePerformanceGroup,
} from '@/hooks/web-vitals-diagnostics-constants';

/**
 * 生成诊断建议
 */
export const generateRecommendations = (
  vitals: DetailedWebVitals,
): string[] => {
  const recommendations: string[] = [];

  if (vitals.lcp && vitals.lcp > WEB_VITALS_CONSTANTS.LCP_GOOD) {
    recommendations.push(
      '优化最大内容绘制(LCP): 考虑优化图片加载、减少服务器响应时间',
    );
  }

  if (vitals.fid && vitals.fid > WEB_VITALS_CONSTANTS.FID_GOOD) {
    recommendations.push(
      '改善首次输入延迟(FID): 减少JavaScript执行时间、优化第三方脚本',
    );
  }

  if (vitals.cls && vitals.cls > WEB_VITALS_CONSTANTS.CLS_GOOD) {
    recommendations.push(
      '减少累积布局偏移(CLS): 为图片和广告设置尺寸、避免动态内容插入',
    );
  }

  if (vitals.fcp && vitals.fcp > WEB_VITALS_CONSTANTS.FCP_GOOD) {
    recommendations.push(
      '优化首次内容绘制(FCP): 减少阻塞渲染的资源、优化关键CSS',
    );
  }

  if (vitals.ttfb && vitals.ttfb > WEB_VITALS_CONSTANTS.TTFB_GOOD) {
    recommendations.push(
      '改善首字节时间(TTFB): 优化服务器配置、使用CDN、减少重定向',
    );
  }

  return recommendations;
};

/**
 * 识别性能问题
 */
export const identifyPerformanceIssues = (
  vitals: DetailedWebVitals,
): string[] => {
  const issues: string[] = [];

  if (vitals.lcp && vitals.lcp > WEB_VITALS_CONSTANTS.LCP_GOOD) {
    const severity =
      vitals.lcp > WEB_VITALS_CONSTANTS.LCP_POOR ? '严重' : '中等';
    issues.push(
      `LCP ${severity}问题: ${vitals.lcp.toFixed(0)}ms (建议 < ${WEB_VITALS_CONSTANTS.LCP_GOOD}ms)`,
    );
  }

  if (vitals.fid && vitals.fid > WEB_VITALS_CONSTANTS.FID_GOOD) {
    const severity =
      vitals.fid > WEB_VITALS_CONSTANTS.FID_POOR ? '严重' : '中等';
    issues.push(
      `FID ${severity}问题: ${vitals.fid.toFixed(0)}ms (建议 < ${WEB_VITALS_CONSTANTS.FID_GOOD}ms)`,
    );
  }

  if (vitals.cls && vitals.cls > WEB_VITALS_CONSTANTS.CLS_GOOD) {
    const severity =
      vitals.cls > WEB_VITALS_CONSTANTS.CLS_POOR ? '严重' : '中等';
    issues.push(
      `CLS ${severity}问题: ${vitals.cls.toFixed(COUNT_TRIPLE)} (建议 < ${WEB_VITALS_CONSTANTS.CLS_GOOD})`,
    );
  }

  if (vitals.fcp && vitals.fcp > WEB_VITALS_CONSTANTS.FCP_GOOD) {
    issues.push(
      `FCP 问题: ${vitals.fcp.toFixed(0)}ms (建议 < ${WEB_VITALS_CONSTANTS.FCP_GOOD}ms)`,
    );
  }

  if (vitals.ttfb && vitals.ttfb > WEB_VITALS_CONSTANTS.TTFB_GOOD) {
    issues.push(
      `TTFB 问题: ${vitals.ttfb.toFixed(0)}ms (建议 < ${WEB_VITALS_CONSTANTS.TTFB_GOOD}ms)`,
    );
  }

  return issues;
};

/**
 * 比较页面性能
 */
export const comparePagePerformance = (
  currentReport: DiagnosticReport,
  comparedReport: DiagnosticReport,
): PageComparison => {
  // helper: compute comparison metrics for two numbers
  const compute = (a?: number, b?: number) => {
    const current = typeof a === 'number' ? a : undefined;
    const compared = typeof b === 'number' ? b : undefined;
    const hasBoth = typeof a === 'number' && typeof b === 'number';
    const difference = hasBoth ? a - b : 0;
    const percentageChange = hasBoth ? calculatePercentageChange(a, b) : 0;
    return { current, compared, difference, percentageChange } as const;
  };

  // helper: classify relation for "lower is better" metrics
  const classify = (a?: number, b?: number): 'better' | 'worse' | 'same' | undefined => {
    if (typeof a !== 'number' || typeof b !== 'number') return undefined;
    if (a < b) return 'better';
    if (a > b) return 'worse';
    return 'same';
  };

  // Build metrics without dynamic object indexing to satisfy security rules
  const lcpCmp = compute(currentReport.vitals.lcp, comparedReport.vitals.lcp);
  const fidCmp = compute(currentReport.vitals.fid, comparedReport.vitals.fid);
  const clsCmp = compute(currentReport.vitals.cls, comparedReport.vitals.cls);
  const fcpCmp = compute(currentReport.vitals.fcp, comparedReport.vitals.fcp);
  const ttfbCmp = compute(
    currentReport.vitals.ttfb,
    comparedReport.vitals.ttfb,
  );

  const metricsComparison: PageComparison['metrics'] = {
    // Only core metrics are populated; other keys (if any) remain undefined via type widening
    lcp: lcpCmp,
    fid: fidCmp,
    cls: clsCmp,
    fcp: fcpCmp,
    ttfb: ttfbCmp,
  } as PageComparison['metrics'];

  const betterMetrics: string[] = [];
  const worseMetrics: string[] = [];

  // 对于性能指标，值越小越好 — evaluate per metric via helper to reduce complexity
  const classifications: Array<{ key: 'lcp' | 'fid' | 'cls' | 'fcp' | 'ttfb'; kind?: 'better' | 'worse' | 'same' }> = [];
  const lcpKind = classify(currentReport.vitals.lcp, comparedReport.vitals.lcp);
  classifications.push(lcpKind ? { key: 'lcp', kind: lcpKind } : { key: 'lcp' });
  const fidKind = classify(currentReport.vitals.fid, comparedReport.vitals.fid);
  classifications.push(fidKind ? { key: 'fid', kind: fidKind } : { key: 'fid' });
  const clsKind = classify(currentReport.vitals.cls, comparedReport.vitals.cls);
  classifications.push(clsKind ? { key: 'cls', kind: clsKind } : { key: 'cls' });
  const fcpKind = classify(currentReport.vitals.fcp, comparedReport.vitals.fcp);
  classifications.push(fcpKind ? { key: 'fcp', kind: fcpKind } : { key: 'fcp' });
  const ttfbKind = classify(currentReport.vitals.ttfb, comparedReport.vitals.ttfb);
  classifications.push(ttfbKind ? { key: 'ttfb', kind: ttfbKind } : { key: 'ttfb' });

  for (const item of classifications) {
    if (item.kind === 'better') betterMetrics.push(item.key);
    if (item.kind === 'worse') worseMetrics.push(item.key);
  }

  return {
    currentPage: currentReport.pageUrl,
    comparedPage: comparedReport.pageUrl,
    scoreDifference: currentReport.score - comparedReport.score,
    betterMetrics,
    worseMetrics,
    metrics: metricsComparison,
  };
};

/**
 * 计算页面对比数据
 */
export const calculatePageComparison = (
  historicalReports: DiagnosticReport[],
): PagePerformanceGroup[] => {
  // 使用Map避免对象注入安全问题
  const pageGroups = new Map<string, DiagnosticReport[]>();

  // 按页面URL分组
  historicalReports.forEach((report) => {
    // 安全地处理URL，避免过长的路径
    const safeUrl =
      report.pageUrl.length > WEB_VITALS_CONSTANTS.MAX_PATH_LENGTH
        ? `${report.pageUrl.substring(0, WEB_VITALS_CONSTANTS.MAX_PATH_LENGTH) 
          }...`
        : report.pageUrl;

    const existing = pageGroups.get(safeUrl);
    if (existing) {
      existing.push(report);
    } else {
      pageGroups.set(safeUrl, [report]);
    }
  });

  // 转换为数组并计算统计信息
  return Array.from(pageGroups.entries())
    .map(([url, reports]) => {
      // 按时间戳排序，最新的在前
      const sortedReports = reports.sort((a, b) => b.timestamp - a.timestamp);

      // 计算平均分数
      const averageScore =
        reports.reduce((sum, report) => sum + report.score, 0) / reports.length;

      // 确保有最新报告
      const latestReport = sortedReports[0];
      if (!latestReport) {
        throw new Error(`No reports found for URL: ${url}`);
      }

      return {
        url,
        reports: sortedReports,
        averageScore: Number(averageScore.toFixed(1)),
        latestReport,
      };
    })
    .sort((a, b) => b.averageScore - a.averageScore); // 按平均分数降序排列
};

/**
 * 导出报告数据
 */
export const exportReportData = (reports: DiagnosticReport[]): ExportData => {
  return {
    exportDate: new Date().toISOString(),
    totalReports: reports.length,
    reports: reports.map((report) => ({
      timestamp: report.timestamp,
      pageUrl: report.pageUrl,
      score: report.score,
      vitals: {
        lcp: report.vitals.lcp,
        fid: report.vitals.fid,
        cls: report.vitals.cls,
        fcp: report.vitals.fcp,
        ttfb: report.vitals.ttfb,
      },
      issues: report.issues,
      recommendations: report.recommendations,
    })),
  };
};

/**
 * 生成CSV格式的报告数据
 */
export const generateCSVData = (reports: DiagnosticReport[]): string => {
  const headers = [
    'Timestamp',
    'Page URL',
    'Score',
    'LCP (ms)',
    'FID (ms)',
    'CLS',
    'FCP (ms)',
    'TTFB (ms)',
    'Issues Count',
    'Recommendations Count',
  ];

  const rows = reports.map((report) => [
    new Date(report.timestamp).toISOString(),
    report.pageUrl,
    report.score.toString(),
    report.vitals.lcp?.toString() || '',
    report.vitals.fid?.toString() || '',
    report.vitals.cls?.toString() || '',
    report.vitals.fcp?.toString() || '',
    report.vitals.ttfb?.toString() || '',
    report.issues.length.toString(),
    report.recommendations.length.toString(),
  ]);

  return [headers, ...rows]
    .map((row) => row.map((cell) => `"${cell}"`).join(','))
    .join('\n');
};

/**
 * 分析性能趋势总体状况
 */
export const analyzeOverallTrend = (
  reports: DiagnosticReport[],
): 'improving' | 'declining' | 'stable' => {
  if (reports.length < COUNT_PAIR) return 'stable';

  const recentScores = reports.slice(OFFSET_NEGATIVE_MEDIUM).map((r) => r.score);
  const previousScores = reports.slice(OFFSET_NEGATIVE_LARGE, OFFSET_NEGATIVE_MEDIUM).map((r) => r.score);

  if (previousScores.length === 0) return 'stable';

  const recentAvg =
    recentScores.reduce((sum, score) => sum + score, 0) / recentScores.length;
  const previousAvg =
    previousScores.reduce((sum, score) => sum + score, 0) /
    previousScores.length;

  const change = recentAvg - previousAvg;
  const threshold = 5; // 5分的变化阈值

  if (Math.abs(change) < threshold) return 'stable';
  return change > 0 ? 'improving' : 'declining';
};
