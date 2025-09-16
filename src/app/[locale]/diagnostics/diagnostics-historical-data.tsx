// 诊断页面历史数据组件

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { HistoryItem } from '@/app/[locale]/diagnostics/diagnostics-constants';
import { formatMetric, type SimpleWebVitals } from '@/app/[locale]/diagnostics/utils';

// 历史数据组件属性接口
interface HistoricalDataProps {
  data: SimpleWebVitals[];
}

/**
 * 历史数据组件
 * 显示最近的性能检测记录
 */
export function HistoricalData({ data }: HistoricalDataProps) {
  if (data.length === 0) return null;

  return (
    <Card className='mb-6'>
      <CardHeader>
        <CardTitle>历史性能数据</CardTitle>
        <CardDescription>最近 {data.length} 次性能检测记录</CardDescription>
      </CardHeader>
      <CardContent>
        <div className='space-y-4'>
          {data.map((record, index) => (
            <HistoryItem
              key={record.timestamp}
              record={record}
              index={index}
              totalCount={data.length}
              formatMetric={formatMetric}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// 历史趋势组件属性接口
interface HistoricalTrendProps {
  data: SimpleWebVitals[];
  metricKey: string;
  title: string;
}

/**
 * 历史趋势组件
 * 显示特定指标的历史趋势
 */
export function HistoricalTrend({
  data,
  metricKey,
  title,
}: HistoricalTrendProps) {
  if (data.length === 0) return null;

  const values = data.map(
    (record) => record[metricKey as keyof SimpleWebVitals] as number,
  );
  const average = values.reduce((sum, val) => sum + val, 0) / values.length;
  const latest = values[values.length - 1];
  const trend =
    values.length > 1
      ? latest &&
        values[values.length - 2] !== undefined &&
        latest > (values[values.length - 2] ?? 0)
        ? 'up'
        : latest &&
            values[values.length - 2] !== undefined &&
            latest < (values[values.length - 2] ?? 0)
          ? 'down'
          : 'same'
      : 'same';

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title} 趋势</CardTitle>
        <CardDescription>基于最近 {data.length} 次检测</CardDescription>
      </CardHeader>
      <CardContent>
        <div className='space-y-4'>
          <div className='grid grid-cols-3 gap-4 text-center'>
            <div>
              <div className='text-2xl font-bold'>
                {formatMetric(metricKey, latest || 0)}
              </div>
              <div className='text-muted-foreground text-sm'>最新值</div>
            </div>
            <div>
              <div className='text-2xl font-bold'>
                {formatMetric(metricKey, average)}
              </div>
              <div className='text-muted-foreground text-sm'>平均值</div>
            </div>
            <div>
              <div
                className={`text-2xl font-bold ${
                  trend === 'up'
                    ? 'text-red-600'
                    : trend === 'down'
                      ? 'text-green-600'
                      : 'text-gray-600'
                }`}
              >
                {trend === 'up' ? '↗️' : trend === 'down' ? '↘️' : '→'}
              </div>
              <div className='text-muted-foreground text-sm'>趋势</div>
            </div>
          </div>

          <div className='space-y-2'>
            {data.slice(-5).map((record, _index) => (
              <div
                key={record.timestamp}
                className='flex items-center justify-between text-sm'
              >
                <span className='text-muted-foreground'>
                  {new Date(record.timestamp).toLocaleString('zh-CN')}
                </span>
                <span className='font-medium'>
                  {formatMetric(
                    metricKey,
                    record[metricKey as keyof SimpleWebVitals] as number,
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// 历史统计组件属性接口
interface HistoricalStatsProps {
  data: SimpleWebVitals[];
}

/**
 * 历史统计组件
 * 显示历史数据的统计信息
 */
export function HistoricalStats({ data }: HistoricalStatsProps) {
  if (data.length === 0) return null;

  const scores = data.map((record) => record.score);
  const averageScore =
    scores.reduce((sum, score) => sum + score, 0) / scores.length;
  const maxScore = Math.max(...scores);
  const minScore = Math.min(...scores);

  const goodRecords = data.filter((record) => record.score >= 80).length;
  const improvementRate = (goodRecords / data.length) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle>历史统计</CardTitle>
        <CardDescription>基于 {data.length} 次检测记录</CardDescription>
      </CardHeader>
      <CardContent>
        <div className='grid grid-cols-2 gap-4'>
          <div className='space-y-4'>
            <div className='text-center'>
              <div className='text-2xl font-bold'>
                {Math.round(averageScore)}
              </div>
              <div className='text-muted-foreground text-sm'>平均评分</div>
            </div>
            <div className='text-center'>
              <div className='text-2xl font-bold'>{Math.round(maxScore)}</div>
              <div className='text-muted-foreground text-sm'>最高评分</div>
            </div>
          </div>
          <div className='space-y-4'>
            <div className='text-center'>
              <div className='text-2xl font-bold'>{Math.round(minScore)}</div>
              <div className='text-muted-foreground text-sm'>最低评分</div>
            </div>
            <div className='text-center'>
              <div className='text-2xl font-bold'>
                {Math.round(improvementRate)}%
              </div>
              <div className='text-muted-foreground text-sm'>优秀率</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// 简化历史数据组件属性接口
interface SimpleHistoricalDataProps {
  data: SimpleWebVitals[];
  maxItems?: number;
}

/**
 * 简化历史数据组件
 * 显示简化的历史记录列表
 */
export function SimpleHistoricalData({
  data,
  maxItems = 5,
}: SimpleHistoricalDataProps) {
  if (data.length === 0) return null;

  const displayData = data.slice(-maxItems);

  return (
    <div className='space-y-3'>
      <h3 className='text-lg font-semibold'>最近检测记录</h3>
      <div className='space-y-2'>
        {displayData.map((record, _index) => (
          <div
            key={record.timestamp}
            className='flex items-center justify-between rounded-lg border p-3'
          >
            <div>
              <div className='font-medium'>
                {new Date(record.timestamp).toLocaleString('zh-CN')}
              </div>
              <div className='text-muted-foreground text-sm'>
                评分: {Math.round(record.score)}
              </div>
            </div>
            <div className='flex space-x-3 text-sm'>
              <div className='text-center'>
                <div className='font-medium'>
                  {formatMetric('cls', record.cls)}
                </div>
                <div className='text-muted-foreground text-xs'>CLS</div>
              </div>
              <div className='text-center'>
                <div className='font-medium'>
                  {formatMetric('lcp', record.lcp)}
                </div>
                <div className='text-muted-foreground text-xs'>LCP</div>
              </div>
              <div className='text-center'>
                <div className='font-medium'>
                  {formatMetric('fid', record.fid)}
                </div>
                <div className='text-muted-foreground text-xs'>FID</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// 历史数据过滤器组件属性接口
interface HistoricalDataFilterProps {
  data: SimpleWebVitals[];
  onFilterChange: (filteredData: SimpleWebVitals[]) => void;
}

/**
 * 历史数据过滤器组件
 * 提供数据过滤功能
 */
export function HistoricalDataFilter({
  data,
  onFilterChange,
}: HistoricalDataFilterProps) {
  const filterByTimeRange = (days: number) => {
    const cutoffTime = Date.now() - days * 24 * 60 * 60 * 1000;
    const filtered = data.filter((record) => record.timestamp >= cutoffTime);
    onFilterChange(filtered);
  };

  const filterByScore = (minScore: number) => {
    const filtered = data.filter((record) => record.score >= minScore);
    onFilterChange(filtered);
  };

  return (
    <div className='mb-4 flex flex-wrap gap-2'>
      <button
        onClick={() => onFilterChange(data)}
        className='rounded-md border px-3 py-1 text-sm hover:bg-gray-50'
      >
        全部
      </button>
      <button
        onClick={() => filterByTimeRange(7)}
        className='rounded-md border px-3 py-1 text-sm hover:bg-gray-50'
      >
        最近7天
      </button>
      <button
        onClick={() => filterByTimeRange(30)}
        className='rounded-md border px-3 py-1 text-sm hover:bg-gray-50'
      >
        最近30天
      </button>
      <button
        onClick={() => filterByScore(80)}
        className='rounded-md border px-3 py-1 text-sm hover:bg-gray-50'
      >
        优秀记录
      </button>
      <button
        onClick={() => filterByScore(50)}
        className='rounded-md border px-3 py-1 text-sm hover:bg-gray-50'
      >
        良好以上
      </button>
    </div>
  );
}
