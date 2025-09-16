// 诊断页面常量和工具函数

import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// 重新导出类型以便其他文件使用
export type { SimpleWebVitals } from '@/app/[locale]/diagnostics/utils';

// 常量定义 - 避免魔法数字
export const UI_CONSTANTS = {
  ICON_SIZE: 4, // Tailwind w-4 h-4
  SCORE_EXCELLENT_THRESHOLD: 80,
  SCORE_GOOD_THRESHOLD: 50,
} as const;

// Web Vitals 阈值常量 - 用于显示
export const DISPLAY_THRESHOLDS = {
  CLS_GOOD: 0.1,
  CLS_NEEDS_IMPROVEMENT: 0.25,
  LCP_GOOD: 2.5, // 秒
  LCP_NEEDS_IMPROVEMENT: 4.0, // 秒
  FID_GOOD: 100, // 毫秒
  FID_NEEDS_IMPROVEMENT: 300, // 毫秒
} as const;

// 指标配置
export const METRIC_CONFIGS = [
  { key: 'cls', label: 'CLS', description: '累积布局偏移' },
  { key: 'lcp', label: 'LCP', description: '最大内容绘制' },
  { key: 'fid', label: 'FID', description: '首次输入延迟' },
  { key: 'fcp', label: 'FCP', description: '首次内容绘制' },
  { key: 'ttfb', label: 'TTFB', description: '首字节时间' },
] as const;

// 工具函数：获取状态图标
export function getStatusIcon(status: string) {
  const iconClass = `h-${UI_CONSTANTS.ICON_SIZE} w-${UI_CONSTANTS.ICON_SIZE}`;

  switch (status) {
    case 'good':
      return <CheckCircle className={`${iconClass} text-green-600`} />;
    case 'needs-improvement':
      return <AlertTriangle className={`${iconClass} text-yellow-600`} />;
    case 'poor':
      return <XCircle className={`${iconClass} text-red-600`} />;
    default:
      return <AlertTriangle className={`${iconClass} text-gray-400`} />;
  }
}

// 工具函数：获取状态标签文本
export function getStatusLabel(status: string): string {
  switch (status) {
    case 'good':
      return '良好';
    case 'needs-improvement':
      return '需要改进';
    default:
      return '较差';
  }
}

// 工具函数：获取Badge变体
export function getBadgeVariant(
  status: string,
): 'default' | 'secondary' | 'destructive' {
  switch (status) {
    case 'good':
      return 'default';
    case 'needs-improvement':
      return 'secondary';
    default:
      return 'destructive';
  }
}

// 工具函数：获取评分状态
export function getScoreStatus(score: number): string {
  return score >= UI_CONSTANTS.SCORE_EXCELLENT_THRESHOLD
    ? 'good'
    : score >= UI_CONSTANTS.SCORE_GOOD_THRESHOLD
      ? 'needs-improvement'
      : 'poor';
}

// 工具函数：获取评分标签
export function getScoreLabel(score: number): string {
  return score >= UI_CONSTANTS.SCORE_EXCELLENT_THRESHOLD
    ? '优秀'
    : score >= UI_CONSTANTS.SCORE_GOOD_THRESHOLD
      ? '良好'
      : '需要优化';
}

// 指标卡片组件
interface MetricCardProps {
  label: string;
  value: string;
  status: string;
  description: string;
}

export function MetricCard({
  label,
  value,
  status,
  description,
}: MetricCardProps) {
  return (
    <div className='rounded-lg border p-4'>
      <div className='mb-2 flex items-center justify-between'>
        <h3 className='font-semibold'>{label}</h3>
        {getStatusIcon(status)}
      </div>
      <div className='mb-1 text-2xl font-bold'>{value}</div>
      <Badge variant={getBadgeVariant(status)}>{getStatusLabel(status)}</Badge>
      <p className='text-muted-foreground mt-2 text-sm'>{description}</p>
    </div>
  );
}

// 综合评分卡片组件
interface ScoreCardProps {
  score: number;
}

export function ScoreCard({ score }: ScoreCardProps) {
  const scoreStatus = getScoreStatus(score);
  const scoreLabel = getScoreLabel(score);

  return (
    <div className='rounded-lg border p-4'>
      <div className='mb-2 flex items-center justify-between'>
        <h3 className='font-semibold'>综合评分</h3>
        {getStatusIcon(scoreStatus)}
      </div>
      <div className='mb-1 text-2xl font-bold'>{Math.round(score)}</div>
      <Badge variant={getBadgeVariant(scoreStatus)}>{scoreLabel}</Badge>
      <p className='text-muted-foreground mt-2 text-sm'>整体性能评估</p>
    </div>
  );
}

// 阈值显示组件
interface ThresholdDisplayProps {
  title: string;
  goodThreshold: number;
  needsImprovementThreshold: number;
  unit?: string;
}

export function ThresholdDisplay({
  title,
  goodThreshold,
  needsImprovementThreshold,
  unit = '',
}: ThresholdDisplayProps) {
  return (
    <div>
      <h4 className='mb-3 font-semibold'>{title}</h4>
      <div className='space-y-2 text-sm'>
        <div className='flex justify-between'>
          <span className='text-green-600'>良好:</span>
          <span>
            ≤ {goodThreshold}
            {unit}
          </span>
        </div>
        <div className='flex justify-between'>
          <span className='text-yellow-600'>需要改进:</span>
          <span>
            {goodThreshold}
            {unit} - {needsImprovementThreshold}
            {unit}
          </span>
        </div>
        <div className='flex justify-between'>
          <span className='text-red-600'>较差:</span>
          <span>
            &gt; {needsImprovementThreshold}
            {unit}
          </span>
        </div>
      </div>
    </div>
  );
}

// 历史记录项组件
interface HistoryItemProps {
  record: {
    timestamp: number;
    url: string;
    cls: number;
    lcp: number;
    fid: number;
    score: number;
  };
  index: number;
  totalCount: number;
  formatMetric: (key: string, value: number) => string;
}

export function HistoryItem({
  record,
  index,
  totalCount,
  formatMetric,
}: HistoryItemProps) {
  return (
    <div className='flex items-center justify-between rounded-lg border p-3'>
      <div className='flex items-center space-x-4'>
        <div className='text-muted-foreground text-sm'>
          #{totalCount - index}
        </div>
        <div>
          <div className='font-medium'>
            {new Date(record.timestamp).toLocaleString('zh-CN')}
          </div>
          <div className='text-muted-foreground text-sm'>{record.url}</div>
        </div>
      </div>
      <div className='flex items-center space-x-4'>
        <div className='text-center'>
          <div className='text-sm font-medium'>
            {formatMetric('cls', record.cls)}
          </div>
          <div className='text-muted-foreground text-xs'>CLS</div>
        </div>
        <div className='text-center'>
          <div className='text-sm font-medium'>
            {formatMetric('lcp', record.lcp)}
          </div>
          <div className='text-muted-foreground text-xs'>LCP</div>
        </div>
        <div className='text-center'>
          <div className='text-sm font-medium'>
            {formatMetric('fid', record.fid)}
          </div>
          <div className='text-muted-foreground text-xs'>FID</div>
        </div>
        <div className='text-center'>
          <div className='text-sm font-medium'>{Math.round(record.score)}</div>
          <div className='text-muted-foreground text-xs'>评分</div>
        </div>
      </div>
    </div>
  );
}
