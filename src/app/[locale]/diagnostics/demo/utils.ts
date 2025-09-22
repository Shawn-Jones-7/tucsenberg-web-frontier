import { DEV_TOOLS_CONSTANTS } from '@/constants/dev-tools';

// 性能诊断常量定义
export const PERFORMANCE_CONSTANTS = {
  SIMULATION_DELAY: 2000,
  DIAGNOSTIC_DELAY: 2000,
  BLOCKING_DURATION: 100,
  SPACING_INDENT: 2,
  DECIMAL_PLACES: 3,
  AUTO_RUN_DELAY: 1000,
  // Web Vitals 阈值
  CLS_GOOD_THRESHOLD: 0.1,
  CLS_NEEDS_IMPROVEMENT_THRESHOLD: 0.25,
  LCP_GOOD_THRESHOLD: 2500,
  LCP_NEEDS_IMPROVEMENT_THRESHOLD: 4000,
  FID_GOOD_THRESHOLD: 100,
  FID_NEEDS_IMPROVEMENT_THRESHOLD: 300,
  FCP_GOOD_THRESHOLD: 1800,
  FCP_NEEDS_IMPROVEMENT_THRESHOLD: 3000,
  TTFB_GOOD_THRESHOLD: 800,
  TTFB_NEEDS_IMPROVEMENT_THRESHOLD: 1800,
} as const;

// 类型定义
export interface TestResults {
  metrics: {
    cls: number;
    lcp: number;
    fid: number;
    fcp: number;
    ttfb: number;
    inp?: number;
  };
  analysis: {
    score: number;
    issues: string[];
    recommendations: string[];
  };
  timestamp: number;
}

// 工具函数：模拟性能问题（优化版本 - 减少 CLS 影响）
export function simulatePerformanceIssues(): void {
  // 模拟布局偏移 - 使用更温和的方式，避免严重的 CLS
  const div = document.createElement('div');
  div.style.height = '50px'; // 减少初始高度
  div.style.backgroundColor = 'rgba(255, 0, 0, 0.3)'; // 半透明，减少视觉冲击
  div.style.position = 'fixed'; // 使用 fixed 定位，减少对页面布局的影响
  div.style.top = '10px';
  div.style.right = '10px'; // 移到右上角，避免影响主要内容
  div.style.width = '100px';
  div.style.zIndex = '9999';
  div.style.borderRadius = '4px';
  div.style.transition = 'height 0.3s ease'; // 添加过渡动画，减少突兀感
  document.body.appendChild(div);

  setTimeout(() => {
    div.style.height = '80px'; // 减少高度变化幅度
    setTimeout(() => {
      div.style.opacity = '0'; // 淡出效果
      setTimeout(() => {
        if (document.body.contains(div)) {
          document.body.removeChild(div);
        }
      }, DEV_TOOLS_CONSTANTS.DIAGNOSTICS.DIAGNOSTIC_DELAY); // 等待淡出动画完成
    }, PERFORMANCE_CONSTANTS.SIMULATION_DELAY);
  }, PERFORMANCE_CONSTANTS.BLOCKING_DURATION);

  // 模拟主线程阻塞 - 减少阻塞时间
  const start = performance.now();
  const reducedBlockingTime = Math.min(
    PERFORMANCE_CONSTANTS.BLOCKING_DURATION,
    DEV_TOOLS_CONSTANTS.LAYOUT.DEFAULT_OFFSET,
  ); // 最多阻塞50ms
  while (performance.now() - start < reducedBlockingTime) {
    // 阻塞主线程
  }
}

// 工具函数：导出测试结果
export function exportTestResults(testResults: TestResults): void {
  const data = {
    ...testResults,
    exportedAt: new Date().toISOString(),
    userAgent: navigator.userAgent,
    viewport: {
      width: window.innerWidth,
      height: window.innerHeight,
    },
  };

  const blob = new Blob(
    [JSON.stringify(data, null, PERFORMANCE_CONSTANTS.SPACING_INDENT)],
    {
      type: 'application/json',
    },
  );
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `web-vitals-demo-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// 工具函数：获取性能指标状态
export function getMetricStatus(
  value: number,
  goodThreshold: number,
  needsImprovementThreshold: number,
): 'default' | 'secondary' | 'destructive' {
  if (value <= goodThreshold) return 'default';
  if (value <= needsImprovementThreshold) return 'secondary';
  return 'destructive';
}

// 工具函数：获取性能指标标签
export function getMetricLabel(
  value: number,
  goodThreshold: number,
  needsImprovementThreshold: number,
): string {
  if (value <= goodThreshold) return '良好';
  if (value <= needsImprovementThreshold) return '需要改进';
  return '较差';
}
