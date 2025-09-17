'use client';

import { MAGIC_80 } from "@/constants/count";
import { FIVE_SECONDS_MS, ONE, TEN_SECONDS_MS, ZERO } from "@/constants/magic-numbers";
import { useI18nPerformance } from '@/hooks/use-enhanced-translations';
import {
  evaluatePerformance,
  PERFORMANCE_TARGETS,
} from '@/lib/i18n-performance';
import { useEffect, useState } from 'react';

interface PerformanceMetrics {
  averageLoadTime: number;
  cacheHitRate: number;
  totalErrors: number;
  totalRequests: number;
}

export function I18nPerformanceDashboard() {
  const { registerTool, unregisterTool, getClasses } = {
    registerTool: (_toolId: string) => {},
    unregisterTool: (_toolId: string) => {},
    getClasses: () => '',
  };
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [isVisible, setIsVisible] = useState(
    process.env.NODE_ENV === 'development',
  );
  const { getMetrics, resetMetrics } = useI18nPerformance();

  // 注册工具到布局管理器
  useEffect(() => {
    registerTool('i18nPerformanceDashboard');
    return () => unregisterTool('i18nPerformanceDashboard');
  }, [registerTool, unregisterTool]);

  useEffect(() => {
    const updateMetrics = () => {
      const currentMetrics = getMetrics();
      setMetrics(currentMetrics);
    };

    // 初始加载
    updateMetrics();

    // 定期更新指标
    const interval = setInterval(updateMetrics, FIVE_SECONDS_MS); // 每5秒更新

    return () => clearInterval(interval);
  }, [getMetrics]);

  if (!isVisible || !metrics) {
    return null;
  }

  const evaluation = evaluatePerformance(metrics);

  return (
    <div
      className={`${getClasses()} rounded-lg border border-gray-200 bg-white p-4 shadow-lg dark:border-gray-700 dark:bg-gray-800`}
    >
      <div className='mb-3 flex items-center justify-between'>
        <h3 className='text-sm font-semibold text-gray-900 dark:text-gray-100'>
          I18n Performance
        </h3>
        <div className='flex items-center gap-2'>
          <span
            className={`rounded px-2 py-1 text-xs ${getGradeColor(evaluation.grade)}`}
          >
            {evaluation.grade}
          </span>
          <button
            onClick={() => setIsVisible(false)}
            className='text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
          >
            ×
          </button>
        </div>
      </div>

      <div className='space-y-2 text-xs'>
        <MetricRow
          label='Load Time'
          value={`${metrics.averageLoadTime.toFixed(ONE)}ms`}
          target={PERFORMANCE_TARGETS.TRANSLATION_LOAD_TIME.excellent}
          current={metrics.averageLoadTime}
          isLowerBetter={true}
        />

        <MetricRow
          label='Cache Hit Rate'
          value={`${metrics.cacheHitRate.toFixed(ONE)}%`}
          target={PERFORMANCE_TARGETS.CACHE_HIT_RATE.excellent}
          current={metrics.cacheHitRate}
          isLowerBetter={false}
        />

        <MetricRow
          label='Total Requests'
          value={metrics.totalRequests.toString()}
          target={null}
          current={metrics.totalRequests}
        />

        <MetricRow
          label='Errors'
          value={metrics.totalErrors.toString()}
          target={ZERO}
          current={metrics.totalErrors}
          isLowerBetter={true}
        />
      </div>

      <div className='mt-3 border-t border-gray-200 pt-3 dark:border-gray-600'>
        <div className='flex items-center justify-between'>
          <span className='text-xs text-gray-600 dark:text-gray-400'>
            Overall Score: {evaluation.overallScore}/100
          </span>
          <button
            onClick={resetMetrics}
            className='text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300'
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}

interface MetricRowProps {
  label: string;
  value: string;
  target: number | null;
  current: number;
  isLowerBetter?: boolean;
}

function MetricRow({
  label,
  value,
  target,
  current,
  isLowerBetter = false,
}: MetricRowProps) {
  const getStatusColor = () => {
    if (target === null) return 'text-gray-600 dark:text-gray-400';

    const isGood = isLowerBetter ? current <= target : current >= target;

    return isGood
      ? 'text-green-600 dark:text-green-400'
      : 'text-red-600 dark:text-red-400';
  };

  return (
    <div className='flex items-center justify-between'>
      <span className='text-gray-700 dark:text-gray-300'>{label}:</span>
      <span className={getStatusColor()}>{value}</span>
    </div>
  );
}

function getGradeColor(grade: string): string {
  switch (grade) {
    case 'A':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case 'B':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    case 'C':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    case 'D':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
    case 'F':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  }
}

/**
 * 简化版性能指示器
 * 只显示关键指标，适合生产环境
 */
export function I18nPerformanceIndicator() {
  const { registerTool, unregisterTool, getClasses } = {
    registerTool: (_toolId: string) => {},
    unregisterTool: (_toolId: string) => {},
    getClasses: () => '',
  };
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [showDetails, _setShowDetails] = useState(false);
  const { getMetrics } = useI18nPerformance();

  // 注册工具到布局管理器
  useEffect(() => {
    registerTool('i18nPerformanceIndicator');
    return () => unregisterTool('i18nPerformanceIndicator');
  }, [registerTool, unregisterTool]);

  useEffect(() => {
    const updateMetrics = () => {
      const currentMetrics = getMetrics();
      setMetrics(currentMetrics);
    };

    updateMetrics();
    const interval = setInterval(updateMetrics, TEN_SECONDS_MS); // 每10秒更新

    return () => clearInterval(interval);
  }, [getMetrics]);

  if (!metrics) return null;

  const evaluation = evaluatePerformance(metrics);
  const hasIssues = evaluation.overallScore < MAGIC_80;

  // 只在有性能问题时显示
  if (!hasIssues && !showDetails) return null;

  return (
    <div className={getClasses()}>
      <button
        onClick={() => _setShowDetails(!showDetails)}
        className={`rounded-full px-3 py-2 text-xs font-medium transition-colors ${
          hasIssues
            ? 'bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900 dark:text-red-200'
            : 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-200'
        }`}
      >
        I18n: {evaluation.grade}
      </button>

      {showDetails && (
        <div className='absolute bottom-full left-0 mb-2 min-w-48 rounded-lg border border-gray-200 bg-white p-3 shadow-lg dark:border-gray-700 dark:bg-gray-800'>
          <div className='space-y-1 text-xs'>
            <div>Load: {metrics.averageLoadTime.toFixed(ONE)}ms</div>
            <div>Cache: {metrics.cacheHitRate.toFixed(ONE)}%</div>
            <div>Errors: {metrics.totalErrors}</div>
          </div>
        </div>
      )}
    </div>
  );
}
