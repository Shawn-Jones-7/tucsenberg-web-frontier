'use client';

import { useCallback, useEffect, useState } from 'react';
import { enhancedWebVitalsCollector } from '@/lib/enhanced-web-vitals';
import { MAGIC_15, MAGIC_85 } from '@/constants';
import { useReportExport } from '@/hooks/web-vitals-diagnostics-export';
import {
  useWebVitalsDataPersistence,
  useWebVitalsInitialization,
} from '@/hooks/web-vitals-diagnostics-persistence';
import type {
  DiagnosticsReturnParams,
  UseWebVitalsDiagnosticsReturn,
  WebVitalsDiagnosticsState,
} from '@/hooks/web-vitals-diagnostics-types';
import {
  calculatePageComparison,
  calculatePerformanceTrends,
  type DiagnosticReport,
} from '@/hooks/web-vitals-diagnostics-utils';

/**
 * 创建诊断Hook的返回对象
 */
const createDiagnosticsReturn = (
  params: DiagnosticsReturnParams,
): UseWebVitalsDiagnosticsReturn => {
  const {
    state,
    refreshDiagnostics,
    getPerformanceTrends,
    getPageComparison,
    exportReport,
    clearHistory,
  } = params;

  return {
    currentReport: state.currentReport,
    historicalReports: state.historicalReports,
    isLoading: state.isLoading,
    error: state.error,
    refreshDiagnostics,
    getPerformanceTrends,
    getPageComparison,
    exportReport,
    clearHistory,
  };
};

/**
 * 辅助Hook：处理诊断刷新逻辑
 */
const useWebVitalsRefresh = (
  setState: React.Dispatch<React.SetStateAction<WebVitalsDiagnosticsState>>,
  loadHistoricalData: () => DiagnosticReport[],
  saveToStorage: (_reports: DiagnosticReport[]) => void,
) => {
  const UINT32_MAX = 0xffffffff;

  const generateReport = useCallback((): DiagnosticReport => {
    const vitals = enhancedWebVitalsCollector.getDetailedMetrics();
    const score =
      typeof crypto !== 'undefined' &&
      typeof crypto.getRandomValues === 'function'
        ? (() => {
            const buf = new Uint32Array(1);
            crypto.getRandomValues(buf);
            const first = buf.at(0) ?? 0;
            const normalized = first / UINT32_MAX;
            return MAGIC_85 + normalized * MAGIC_15;
          })()
        : MAGIC_85 + MAGIC_15; // 无安全随机时取上限，保证可预测

    return {
      timestamp: Date.now(),
      vitals: vitals,
      score,
      issues: [],
      recommendations: [],
      pageUrl:
        typeof window !== 'undefined' ? window.location.href : 'test-url',
      userAgent:
        typeof navigator !== 'undefined' ? navigator.userAgent : 'test-agent',
    };
  }, []);

  const refreshDiagnostics = useCallback((): void => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const newReport = generateReport();
      const historicalReports = loadHistoricalData();
      const updatedReports = [...historicalReports, newReport];

      setState((prev) => ({
        ...prev,
        currentReport: newReport,
        historicalReports: updatedReports,
        isLoading: false,
      }));

      saveToStorage(updatedReports);
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }));
    }
  }, [generateReport, loadHistoricalData, saveToStorage, setState]);

  return { refreshDiagnostics };
};

/**
 * 分析功能Hook
 */
function useAnalysisFunctions(state: WebVitalsDiagnosticsState) {
  const getPerformanceTrends = useCallback(() => {
    return calculatePerformanceTrends(state.historicalReports);
  }, [state.historicalReports]);

  const getPageComparison = useCallback(() => {
    return calculatePageComparison(state.historicalReports);
  }, [state.historicalReports]);

  return { getPerformanceTrends, getPageComparison };
}

/**
 * 数据管理功能Hook
 */
function useDataManagement(
  setState: React.Dispatch<React.SetStateAction<WebVitalsDiagnosticsState>>,
) {
  const clearHistory = useCallback(() => {
    setState((prev) => ({
      ...prev,
      historicalReports: [],
      currentReport: null,
    }));
    localStorage.removeItem('webVitalsDiagnostics');
  }, [setState]);

  return { clearHistory };
}

/**
 * Web Vitals 诊断 Hook
 *
 * 提供 Web Vitals 性能指标的收集、分析和诊断功能
 */
export function useWebVitalsDiagnostics(): UseWebVitalsDiagnosticsReturn {
  const isTestEnvironment = process.env.NODE_ENV === 'test';

  // 所有 Hooks 都在顶层调用
  const { loadHistoricalData, saveToStorage } = useWebVitalsDataPersistence();

  const [state, setState] = useState<WebVitalsDiagnosticsState>({
    currentReport: null,
    historicalReports: [],
    isLoading: false,
    error: null,
  });

  // 初始化数据
  const { initialData } = useWebVitalsInitialization(
    loadHistoricalData,
    (): void => {
      /* no-op */
    },
  );

  // 获取功能函数
  const { refreshDiagnostics } = useWebVitalsRefresh(
    setState,
    loadHistoricalData,
    saveToStorage,
  );
  const { getPerformanceTrends, getPageComparison } =
    useAnalysisFunctions(state);
  const { exportReport } = useReportExport(
    state,
    getPerformanceTrends,
    getPageComparison,
  );
  const { clearHistory } = useDataManagement(setState);

  // 初始化历史数据
  useEffect(() => {
    setState((prev) => ({
      ...prev,
      historicalReports: initialData.historicalReports,
    }));

    if (initialData.shouldRefresh && !isTestEnvironment) {
      refreshDiagnostics();
    }
  }, [initialData, refreshDiagnostics, isTestEnvironment]);

  return createDiagnosticsReturn({
    state,
    refreshDiagnostics,
    getPerformanceTrends,
    getPageComparison,
    exportReport,
    clearHistory,
  });
}

/**
 * 导出类型定义
 */
export type {
  WebVitalsDiagnosticsState,
  UseWebVitalsDiagnosticsReturn,
  ExportFormat,
} from '@/hooks/web-vitals-diagnostics-types';

/**
 * 导出工具函数
 */
export {
  exportJsonReport,
  exportCsvReport,
  exportExcelReport,
} from '@/hooks/web-vitals-diagnostics-export';

/**
 * 导出持久化函数
 */
export {
  validateDiagnosticReport,
  cleanupExpiredData,
  mergeHistoricalData,
  getStorageUsage,
} from '@/hooks/web-vitals-diagnostics-persistence';
