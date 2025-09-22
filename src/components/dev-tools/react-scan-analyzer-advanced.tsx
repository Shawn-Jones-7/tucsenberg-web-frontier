'use client';

import { useCallback, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

/**
 * React Scan 分析器高级功能组件
 * 包含详细分析、性能建议和优化提示
 */

interface ComponentStats {
  name: string;
  renderCount: number;
  lastRenderTime: number;
  averageRenderTime: number;
  totalRenderTime: number;
  isOptimized: boolean;
  warnings: string[];
  props?: Record<string, unknown>;
  children?: ComponentStats[];
}

interface PerformanceInsight {
  type: 'warning' | 'error' | 'info';
  component: string;
  message: string;
  suggestion: string;
  impact: 'low' | 'medium' | 'high';
}

export function ReactScanAnalyzerAdvanced() {
  const [componentStats, _setComponentStats] = useState<ComponentStats[]>([]);
  const [_selectedComponent, _setSelectedComponent] =
    useState<ComponentStats | null>(null);
  const [_showDetails, _setShowDetails] = useState(false);

  // 生成性能洞察
  const performanceInsights = useMemo((): PerformanceInsight[] => {
    const insights: PerformanceInsight[] = [];

    componentStats.forEach((component) => {
      // 检查渲染频率
      if (component.renderCount > 50) {
        insights.push({
          type: 'warning',
          component: component.name,
          message: `Component renders ${component.renderCount} times`,
          suggestion: 'Consider using React.memo() or useMemo() to optimize',
          impact: 'high',
        });
      }

      // 检查渲染时间
      if (component.averageRenderTime > 16) {
        insights.push({
          type: 'error',
          component: component.name,
          message: `Slow render time: ${component.averageRenderTime.toFixed(2)}ms`,
          suggestion:
            'Optimize component logic or break into smaller components',
          impact: 'high',
        });
      }

      // 检查优化状态
      if (!component.isOptimized && component.renderCount > 10) {
        insights.push({
          type: 'info',
          component: component.name,
          message: 'Component could benefit from optimization',
          suggestion: 'Add React.memo() or optimize props/state usage',
          impact: 'medium',
        });
      }
    });

    return insights.sort((a, b) => {
      const impactOrder = { high: 3, medium: 2, low: 1 };
      return impactOrder[b.impact] - impactOrder[a.impact];
    });
  }, [componentStats]);

  // 获取最慢的组件
  const slowestComponents = useMemo(() => {
    return [...componentStats]
      .sort((a, b) => b.averageRenderTime - a.averageRenderTime)
      .slice(0, 5);
  }, [componentStats]);

  // 获取渲染最频繁的组件
  const mostRenderedComponents = useMemo(() => {
    return [...componentStats]
      .sort((a, b) => b.renderCount - a.renderCount)
      .slice(0, 5);
  }, [componentStats]);

  // 计算总体性能分数
  const performanceScore = useMemo(() => {
    if (componentStats.length === 0) return 100;

    let score = 100;
    const highImpactIssues = performanceInsights.filter(
      (i) => i.impact === 'high',
    ).length;
    const mediumImpactIssues = performanceInsights.filter(
      (i) => i.impact === 'medium',
    ).length;
    const lowImpactIssues = performanceInsights.filter(
      (i) => i.impact === 'low',
    ).length;

    score -= highImpactIssues * 20;
    score -= mediumImpactIssues * 10;
    score -= lowImpactIssues * 5;

    return Math.max(0, score);
  }, [performanceInsights, componentStats.length]);

  // 获取性能分数颜色
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  // 获取洞察类型颜色
  const getInsightColor = (type: string) => {
    switch (type) {
      case 'error':
        return 'bg-red-50 text-red-800 border-red-200';
      case 'warning':
        return 'bg-yellow-50 text-yellow-800 border-yellow-200';
      case 'info':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-50 text-gray-800 border-gray-200';
    }
  };

  // 导出分析报告
  const exportReport = useCallback(() => {
    const report = {
      timestamp: new Date().toISOString(),
      performanceScore,
      totalComponents: componentStats.length,
      insights: performanceInsights,
      slowestComponents,
      mostRenderedComponents,
      componentDetails: componentStats,
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `react-scan-report-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [
    performanceScore,
    componentStats,
    performanceInsights,
    slowestComponents,
    mostRenderedComponents,
  ]);

  return (
    <div className='space-y-6'>
      {/* 性能总览 */}
      <Card className='p-6'>
        <div className='mb-4 flex items-center justify-between'>
          <h3 className='text-lg font-semibold'>Performance Overview</h3>
          <Button
            _onClick={exportReport}
            size='sm'
            variant='outline'
          >
            Export Report
          </Button>
        </div>

        <div className='grid grid-cols-2 gap-4 md:grid-cols-4'>
          <div className='text-center'>
            <div
              className={`text-3xl font-bold ${getScoreColor(performanceScore)}`}
            >
              {performanceScore}
            </div>
            <div className='text-muted-foreground text-sm'>
              Performance Score
            </div>
          </div>
          <div className='text-center'>
            <div className='text-3xl font-bold'>{componentStats.length}</div>
            <div className='text-muted-foreground text-sm'>Components</div>
          </div>
          <div className='text-center'>
            <div className='text-3xl font-bold text-red-600'>
              {performanceInsights.filter((i) => i.impact === 'high').length}
            </div>
            <div className='text-muted-foreground text-sm'>
              High Impact Issues
            </div>
          </div>
          <div className='text-center'>
            <div className='text-3xl font-bold text-yellow-600'>
              {performanceInsights.filter((i) => i.impact === 'medium').length}
            </div>
            <div className='text-muted-foreground text-sm'>
              Medium Impact Issues
            </div>
          </div>
        </div>
      </Card>

      {/* 性能洞察 */}
      {performanceInsights.length > 0 && (
        <Card className='p-6'>
          <h3 className='mb-4 text-lg font-semibold'>Performance Insights</h3>
          <div className='space-y-3'>
            {performanceInsights.slice(0, 10).map((insight, index) => (
              <div
                key={index}
                className={`rounded-lg border p-4 ${getInsightColor(insight.type)}`}
              >
                <div className='flex items-start justify-between'>
                  <div className='flex-1'>
                    <div className='font-medium'>{insight.component}</div>
                    <div className='mt-1 text-sm'>{insight.message}</div>
                    <div className='mt-2 text-sm font-medium'>
                      💡 {insight.suggestion}
                    </div>
                  </div>
                  <span className='ml-2 rounded px-2 py-1 text-xs font-medium'>
                    {insight.impact.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* 最慢组件 */}
      {slowestComponents.length > 0 && (
        <Card className='p-6'>
          <h3 className='mb-4 text-lg font-semibold'>Slowest Components</h3>
          <div className='space-y-2'>
            {slowestComponents.map((component, index) => (
              <div
                key={`slow-${component.name}-${index}`}
                className='flex items-center justify-between rounded-lg border p-3'
              >
                <div>
                  <div className='font-medium'>{component.name}</div>
                  <div className='text-muted-foreground text-sm'>
                    Average: {component.averageRenderTime.toFixed(2)}ms
                  </div>
                </div>
                <div className='text-right'>
                  <div className='text-sm font-medium'>
                    {component.renderCount} renders
                  </div>
                  <div className='text-muted-foreground text-sm'>
                    Total: {component.totalRenderTime.toFixed(2)}ms
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* 渲染最频繁组件 */}
      {mostRenderedComponents.length > 0 && (
        <Card className='p-6'>
          <h3 className='mb-4 text-lg font-semibold'>
            Most Rendered Components
          </h3>
          <div className='space-y-2'>
            {mostRenderedComponents.map((component, index) => (
              <div
                key={`frequent-${component.name}-${index}`}
                className='flex items-center justify-between rounded-lg border p-3'
              >
                <div>
                  <div className='font-medium'>{component.name}</div>
                  <div className='text-muted-foreground text-sm'>
                    {component.renderCount} renders
                  </div>
                </div>
                <div className='text-right'>
                  <div className='text-sm font-medium'>
                    {component.averageRenderTime.toFixed(2)}ms avg
                  </div>
                  <div className='text-muted-foreground text-sm'>
                    {component.isOptimized ? 'Optimized' : 'Not Optimized'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
