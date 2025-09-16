// 诊断页面当前指标显示组件

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { METRIC_CONFIGS, MetricCard, ScoreCard } from '@/app/[locale]/diagnostics/diagnostics-constants';
import { formatMetric, getMetricStatus, type SimpleWebVitals } from '@/app/[locale]/diagnostics/utils';

// 当前指标显示组件属性接口
interface CurrentMetricsProps {
  metrics: SimpleWebVitals;
}

/**
 * 当前指标显示组件
 * 显示基于 Core Web Vitals 标准的实时性能评估
 */
export function CurrentMetrics({ metrics }: CurrentMetricsProps) {
  return (
    <Card className='mb-6'>
      <CardHeader>
        <CardTitle>当前页面性能指标</CardTitle>
        <CardDescription>
          基于 Core Web Vitals 标准的实时性能评估
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
          {METRIC_CONFIGS.map(({ key, label, description }) => (
            <MetricCard
              key={key}
              label={label}
              value={formatMetric(
                key,
                metrics[key as keyof SimpleWebVitals] as number,
              )}
              status={getMetricStatus(
                key,
                metrics[key as keyof SimpleWebVitals] as number,
              )}
              description={description}
            />
          ))}

          {/* 综合评分 */}
          <ScoreCard score={metrics.score} />
        </div>
      </CardContent>
    </Card>
  );
}

// 简化指标显示组件属性接口
interface SimpleMetricsProps {
  metrics: SimpleWebVitals;
  showScore?: boolean;
}

/**
 * 简化指标显示组件
 * 仅显示核心 Web Vitals 指标
 */
export function SimpleMetrics({
  metrics,
  showScore = true,
}: SimpleMetricsProps) {
  const coreMetrics = METRIC_CONFIGS.filter(({ key }) =>
    ['cls', 'lcp', 'fid'].includes(key),
  );

  return (
    <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
      {coreMetrics.map(({ key, label, description }) => (
        <MetricCard
          key={key}
          label={label}
          value={formatMetric(
            key,
            metrics[key as keyof SimpleWebVitals] as number,
          )}
          status={getMetricStatus(
            key,
            metrics[key as keyof SimpleWebVitals] as number,
          )}
          description={description}
        />
      ))}

      {showScore && <ScoreCard score={metrics.score} />}
    </div>
  );
}

// 指标对比组件属性接口
interface MetricsComparisonProps {
  currentMetrics: SimpleWebVitals;
  previousMetrics?: SimpleWebVitals;
}

/**
 * 指标对比组件
 * 显示当前指标与之前指标的对比
 */
export function MetricsComparison({
  currentMetrics,
  previousMetrics,
}: MetricsComparisonProps) {
  const getTrend = (
    current: number,
    previous: number,
  ): 'up' | 'down' | 'same' => {
    if (current > previous) return 'up';
    if (current < previous) return 'down';
    return 'same';
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'same') => {
    switch (trend) {
      case 'up':
        return '↗️';
      case 'down':
        return '↘️';
      default:
        return '→';
    }
  };

  const getTrendColor = (trend: 'up' | 'down' | 'same', metricKey: string) => {
    // 对于某些指标，数值越低越好（如 CLS, LCP, FID）
    const lowerIsBetter = ['cls', 'lcp', 'fid', 'fcp', 'ttfb'].includes(
      metricKey,
    );

    if (trend === 'same') return 'text-gray-500';

    if (lowerIsBetter) {
      return trend === 'down' ? 'text-green-600' : 'text-red-600';
    }
    return trend === 'up' ? 'text-green-600' : 'text-red-600';
  };

  return (
    <Card className='mb-6'>
      <CardHeader>
        <CardTitle>指标对比</CardTitle>
        <CardDescription>当前指标与上次检测的对比</CardDescription>
      </CardHeader>
      <CardContent>
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
          {METRIC_CONFIGS.map(({ key, label, description }) => {
            const currentValue = currentMetrics[
              key as keyof SimpleWebVitals
            ] as number;
            const previousValue = previousMetrics?.[
              key as keyof SimpleWebVitals
            ] as number;
            const trend = previousValue
              ? getTrend(currentValue, previousValue)
              : 'same';
            const trendColor = getTrendColor(trend, key);

            return (
              <div
                key={key}
                className='rounded-lg border p-4'
              >
                <div className='mb-2 flex items-center justify-between'>
                  <h3 className='font-semibold'>{label}</h3>
                  {previousValue && (
                    <span className={`text-sm ${trendColor}`}>
                      {getTrendIcon(trend)}
                    </span>
                  )}
                </div>
                <div className='mb-1 text-2xl font-bold'>
                  {formatMetric(key, currentValue)}
                </div>
                {previousValue && (
                  <div className='text-muted-foreground text-sm'>
                    上次: {formatMetric(key, previousValue)}
                  </div>
                )}
                <p className='text-muted-foreground mt-2 text-sm'>
                  {description}
                </p>
              </div>
            );
          })}

          {/* 综合评分对比 */}
          <div className='rounded-lg border p-4'>
            <div className='mb-2 flex items-center justify-between'>
              <h3 className='font-semibold'>综合评分</h3>
              {previousMetrics && (
                <span
                  className={getTrendColor(
                    getTrend(currentMetrics.score, previousMetrics.score),
                    'score',
                  )}
                >
                  {getTrendIcon(
                    getTrend(currentMetrics.score, previousMetrics.score),
                  )}
                </span>
              )}
            </div>
            <div className='mb-1 text-2xl font-bold'>
              {Math.round(currentMetrics.score)}
            </div>
            {previousMetrics && (
              <div className='text-muted-foreground text-sm'>
                上次: {Math.round(previousMetrics.score)}
              </div>
            )}
            <p className='text-muted-foreground mt-2 text-sm'>整体性能评估</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// 指标摘要组件属性接口
interface MetricsSummaryProps {
  metrics: SimpleWebVitals;
  compact?: boolean;
}

/**
 * 指标摘要组件
 * 显示指标的简要摘要信息
 */
export function MetricsSummary({
  metrics,
  compact = false,
}: MetricsSummaryProps) {
  const coreMetrics = ['cls', 'lcp', 'fid'];
  const goodMetrics = coreMetrics.filter(
    (key) =>
      getMetricStatus(key, metrics[key as keyof SimpleWebVitals] as number) ===
      'good',
  );

  if (compact) {
    return (
      <div className='flex items-center space-x-4 text-sm'>
        <div className='flex items-center space-x-1'>
          <span className='font-medium'>评分:</span>
          <span className='font-bold'>{Math.round(metrics.score)}</span>
        </div>
        <div className='flex items-center space-x-1'>
          <span className='font-medium'>良好指标:</span>
          <span className='font-bold'>
            {goodMetrics.length}/{coreMetrics.length}
          </span>
        </div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>指标摘要</CardTitle>
      </CardHeader>
      <CardContent>
        <div className='grid grid-cols-2 gap-4'>
          <div className='text-center'>
            <div className='text-3xl font-bold'>
              {Math.round(metrics.score)}
            </div>
            <div className='text-muted-foreground text-sm'>综合评分</div>
          </div>
          <div className='text-center'>
            <div className='text-3xl font-bold'>
              {goodMetrics.length}/{coreMetrics.length}
            </div>
            <div className='text-muted-foreground text-sm'>良好指标</div>
          </div>
        </div>
        <div className='mt-4 space-y-2'>
          {coreMetrics.map((key) => {
            const config = METRIC_CONFIGS.find((c) => c.key === key);
            const status = getMetricStatus(
              key,
              metrics[key as keyof SimpleWebVitals] as number,
            );
            return (
              <div
                key={key}
                className='flex items-center justify-between text-sm'
              >
                <span>{config?.label}</span>
                <span
                  className={
                    status === 'good'
                      ? 'text-green-600'
                      : status === 'needs-improvement'
                        ? 'text-yellow-600'
                        : 'text-red-600'
                  }
                >
                  {formatMetric(
                    key,
                    metrics[key as keyof SimpleWebVitals] as number,
                  )}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
