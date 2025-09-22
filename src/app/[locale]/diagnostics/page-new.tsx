'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  ControlPanel,
  CurrentMetrics,
  HistoricalData,
  ThresholdReference,
} from '@/app/[locale]/diagnostics/components';
import {
  collectCurrentMetrics,
  exportDiagnosticsData,
  loadHistoricalData,
  saveCurrentData,
  type SimpleWebVitals,
} from '@/app/[locale]/diagnostics/utils';

export default function DiagnosticsPage() {
  const [currentMetrics, _setCurrentMetrics] = useState<SimpleWebVitals | null>(
    null,
  );
  const [historicalData, _setHistoricalData] = useState<SimpleWebVitals[]>([]);
  const [isLoading, _setIsLoading] = useState(false);

  // 刷新数据
  const refreshData = useCallback(async () => {
    _setIsLoading(true);
    try {
      // 模拟异步数据收集
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const metrics = collectCurrentMetrics();
      _setCurrentMetrics(metrics);

      // 保存到历史记录
      const updatedHistory = saveCurrentData(metrics);
      _setHistoricalData(updatedHistory);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to refresh data:', error);
      }
    } finally {
      _setIsLoading(false);
    }
  }, []);

  // 导出数据
  const handleExportData = useCallback(() => {
    exportDiagnosticsData(currentMetrics, historicalData);
  }, [currentMetrics, historicalData]);

  // 初始化数据加载
  useEffect(() => {
    const historical = loadHistoricalData();
    _setHistoricalData(historical);

    // 自动刷新一次
    refreshData();
  }, [refreshData]);

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100'>
      <div className='container mx-auto px-4 py-8'>
        {/* 页面标题 */}
        <div className='mb-8 text-center'>
          <h1 className='mb-4 text-4xl font-bold tracking-tight'>
            Web Vitals 性能诊断
          </h1>
          <p className='text-muted-foreground mx-auto max-w-3xl text-xl'>
            深入分析网站性能指标，识别关键问题，获取专业的优化建议。 实时监控
            CLS、LCP、FID 等核心 Web Vitals 指标。
          </p>
        </div>

        {/* 控制面板 */}
        <ControlPanel
          isLoading={isLoading}
          currentMetrics={currentMetrics}
          onRefresh={refreshData}
          onExport={handleExportData}
        />

        {/* 当前页面性能指标 */}
        {currentMetrics && <CurrentMetrics metrics={currentMetrics} />}

        {/* 历史数据 */}
        <HistoricalData data={historicalData} />

        {/* 性能阈值参考 */}
        <ThresholdReference />
      </div>
    </div>
  );
}
