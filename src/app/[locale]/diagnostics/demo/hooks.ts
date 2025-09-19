import { useCallback, useState } from 'react';
import {
  exportTestResults,
  PERFORMANCE_CONSTANTS,
  simulatePerformanceIssues,
  type TestResults,
} from '@/app/[locale]/diagnostics/demo/utils';
import {
  analyzePerformance,
  testWebVitalsCollection,
} from '@/scripts/test-web-vitals';

// 诊断功能 Hook
export function useDiagnostics() {
  const [testResults, setTestResults] = useState<TestResults | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = useCallback((message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev, `[${timestamp}] ${message}`]);
  }, []);

  const runDiagnostics = useCallback(async () => {
    if (isRunning) return;

    setIsRunning(true);
    setLogs([]);
    addLog('开始性能诊断...');

    try {
      // 1. 模拟性能问题
      addLog('模拟性能问题...');
      simulatePerformanceIssues();

      // 2. 等待一段时间让性能问题生效
      await new Promise((resolve) =>
        setTimeout(resolve, PERFORMANCE_CONSTANTS.DIAGNOSTIC_DELAY),
      );

      // 3. 收集 Web Vitals 数据
      addLog('收集 Web Vitals 数据...');
      const report = testWebVitalsCollection();

      if (report) {
        // 4. 分析性能数据
        addLog('分析性能数据...');
        analyzePerformance(report);

        // 5. 转换为组件需要的格式
        const results: TestResults = {
          metrics: {
            cls: report.metrics.cls,
            lcp: report.metrics.lcp,
            fid: report.metrics.fid,
            fcp: report.metrics.fcp,
            ttfb: report.metrics.ttfb,
          },
          analysis: {
            score: report.analysis.score,
            issues: report.analysis.issues,
            recommendations: report.analysis.recommendations,
          },
          timestamp: Date.now(),
        };

        setTestResults(results);
        addLog(`诊断完成！总体评分: ${results.analysis.score}`);
        addLog(`发现 ${results.analysis.issues.length} 个问题`);
        addLog(`提供 ${results.analysis.recommendations.length} 条建议`);
      } else {
        addLog('诊断失败：无法收集性能数据');
      }
    } catch (error) {
      addLog(`诊断过程中出现错误: ${error}`);
    } finally {
      setIsRunning(false);
    }
  }, [isRunning, addLog]);

  const handleExportResults = useCallback(() => {
    if (testResults) {
      exportTestResults(testResults);
      addLog('测试结果已导出');
    }
  }, [testResults, addLog]);

  return {
    testResults,
    isRunning,
    logs,
    runDiagnostics,
    handleExportResults,
  };
}
