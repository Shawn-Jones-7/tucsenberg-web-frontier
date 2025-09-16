import { useCallback, useEffect, useState } from 'react';
import type { SimpleWebVitals } from '@/app/[locale]/diagnostics/components';
import {
  collectCurrentMetrics,
  DATA_COLLECTION_DELAY,
  exportDiagnosticsData,
  loadHistoricalData,
  saveCurrentData,
} from './page-utils';

/**
 * 诊断数据管理的自定义 Hook
 */
export function useDiagnosticsData() {
  const [currentMetrics, _setCurrentMetrics] = useState<SimpleWebVitals | null>(
    null,
  );
  const [historicalData, _setHistoricalData] = useState<SimpleWebVitals[]>([]);
  const [isLoading, _setIsLoading] = useState(false);

  // 刷新数据
  const refreshData = useCallback(async () => {
    _setIsLoading(true);
    try {
      // 等待数据收集
      await new Promise((resolve) =>
        setTimeout(resolve, DATA_COLLECTION_DELAY),
      );
      const metrics = collectCurrentMetrics();
      _setCurrentMetrics(metrics);
      const updatedHistory = saveCurrentData(metrics);
      _setHistoricalData(updatedHistory);
    } finally {
      _setIsLoading(false);
    }
  }, []);

  const handleExportData = useCallback(() => {
    exportDiagnosticsData(currentMetrics, historicalData);
  }, [currentMetrics, historicalData]);

  // 初始化
  useEffect(() => {
    const loadedHistoricalData = loadHistoricalData();
    _setHistoricalData(loadedHistoricalData);
    refreshData();
  }, [refreshData]);

  return {
    currentMetrics,
    historicalData,
    isLoading,
    refreshData,
    handleExportData,
  };
}
