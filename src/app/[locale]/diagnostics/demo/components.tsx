import { Download, Play, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { TestResults } from '@/app/[locale]/diagnostics/demo/utils';
import {
  getMetricLabel,
  getMetricStatus,
  PERFORMANCE_CONSTANTS,
} from './utils';

// 子组件：页面头部
export function PageHeader() {
  return (
    <div className='mb-8 text-center'>
      <h1 className='mb-4 text-4xl font-bold'>Web Vitals 诊断演示</h1>
      <p className='text-muted-foreground text-lg'>
        实时监控和分析网站性能指标，识别性能问题并提供优化建议
      </p>
    </div>
  );
}

// 子组件：控制面板
interface ControlPanelProps {
  isRunning: boolean;
  testResults: TestResults | null;
  onRunDiagnostics: () => void;
  onExportResults: () => void;
}

export function ControlPanel({
  isRunning,
  testResults,
  onRunDiagnostics,
  onExportResults,
}: ControlPanelProps) {
  return (
    <Card className='mb-6'>
      <CardHeader>
        <CardTitle>诊断控制面板</CardTitle>
        <CardDescription>运行性能诊断测试，模拟各种性能问题</CardDescription>
      </CardHeader>
      <CardContent>
        <div className='flex items-center gap-4'>
          <Button
            onClick={onRunDiagnostics}
            disabled={isRunning}
            className='flex items-center gap-2'
          >
            {isRunning ? (
              <RefreshCw className='h-4 w-4 animate-spin' />
            ) : (
              <Play className='h-4 w-4' />
            )}
            {isRunning ? '运行中...' : '运行诊断'}
          </Button>

          {testResults && (
            <Button
              variant='outline'
              onClick={onExportResults}
              className='flex items-center gap-2'
            >
              <Download className='h-4 w-4' />
              导出结果
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// 子组件：性能指标卡片
interface MetricCardProps {
  label: string;
  value: number;
  unit?: string;
  goodThreshold: number;
  needsImprovementThreshold: number;
  decimalPlaces?: number;
}

export function MetricCard({
  label,
  value,
  unit = '',
  goodThreshold,
  needsImprovementThreshold,
  decimalPlaces = 0,
}: MetricCardProps) {
  const displayValue =
    decimalPlaces > 0 ? value.toFixed(decimalPlaces) : Math.round(value);
  const status = getMetricStatus(
    value,
    goodThreshold,
    needsImprovementThreshold,
  );
  const statusLabel = getMetricLabel(
    value,
    goodThreshold,
    needsImprovementThreshold,
  );

  return (
    <Card>
      <CardHeader className='pb-2'>
        <CardTitle className='text-sm font-medium'>{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className='text-2xl font-bold'>
          {displayValue}
          {unit}
        </div>
        <Badge
          variant={status}
          className='mt-2'
        >
          {statusLabel}
        </Badge>
      </CardContent>
    </Card>
  );
}

// 子组件：性能指标网格
interface MetricsGridProps {
  testResults: TestResults;
}

export function MetricsGrid({ testResults }: MetricsGridProps) {
  return (
    <div className='mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5'>
      <MetricCard
        label='CLS (累积布局偏移)'
        value={testResults.metrics.cls}
        goodThreshold={PERFORMANCE_CONSTANTS.CLS_GOOD_THRESHOLD}
        needsImprovementThreshold={
          PERFORMANCE_CONSTANTS.CLS_NEEDS_IMPROVEMENT_THRESHOLD
        }
        decimalPlaces={PERFORMANCE_CONSTANTS.DECIMAL_PLACES}
      />
      <MetricCard
        label='LCP (最大内容绘制)'
        value={testResults.metrics.lcp}
        unit='ms'
        goodThreshold={PERFORMANCE_CONSTANTS.LCP_GOOD_THRESHOLD}
        needsImprovementThreshold={
          PERFORMANCE_CONSTANTS.LCP_NEEDS_IMPROVEMENT_THRESHOLD
        }
      />
      <MetricCard
        label='FID (首次输入延迟)'
        value={testResults.metrics.fid}
        unit='ms'
        goodThreshold={PERFORMANCE_CONSTANTS.FID_GOOD_THRESHOLD}
        needsImprovementThreshold={
          PERFORMANCE_CONSTANTS.FID_NEEDS_IMPROVEMENT_THRESHOLD
        }
      />
      <MetricCard
        label='FCP (首次内容绘制)'
        value={testResults.metrics.fcp}
        unit='ms'
        goodThreshold={PERFORMANCE_CONSTANTS.FCP_GOOD_THRESHOLD}
        needsImprovementThreshold={
          PERFORMANCE_CONSTANTS.FCP_NEEDS_IMPROVEMENT_THRESHOLD
        }
      />
      <MetricCard
        label='TTFB (首字节时间)'
        value={testResults.metrics.ttfb}
        unit='ms'
        goodThreshold={PERFORMANCE_CONSTANTS.TTFB_GOOD_THRESHOLD}
        needsImprovementThreshold={
          PERFORMANCE_CONSTANTS.TTFB_NEEDS_IMPROVEMENT_THRESHOLD
        }
      />
    </div>
  );
}

// 子组件：分析结果
interface AnalysisResultsProps {
  testResults: TestResults;
}

export function AnalysisResults({ testResults }: AnalysisResultsProps) {
  return (
    <div className='mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2'>
      <Card>
        <CardHeader>
          <CardTitle>发现的问题</CardTitle>
          <CardDescription>
            当前检测到的性能问题 ({testResults.analysis.issues.length} 个)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {testResults.analysis.issues.length > 0 ? (
            <ul className='space-y-2'>
              {testResults.analysis.issues.map((issue, index) => (
                <li
                  key={index}
                  className='flex items-start gap-2'
                >
                  <span className='text-destructive mt-1 text-xs'>●</span>
                  <span className='text-sm'>{issue}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className='text-muted-foreground text-sm'>
              未发现明显的性能问题
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>优化建议</CardTitle>
          <CardDescription>
            针对性的性能优化建议 ({testResults.analysis.recommendations.length}{' '}
            条)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {testResults.analysis.recommendations.length > 0 ? (
            <ul className='space-y-2'>
              {testResults.analysis.recommendations.map((rec, index) => (
                <li
                  key={index}
                  className='flex items-start gap-2'
                >
                  <span className='text-primary mt-1 text-xs'>●</span>
                  <span className='text-sm'>{rec}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className='text-muted-foreground text-sm'>
              当前性能表现良好，无需特别优化
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// 子组件：日志显示
interface LogDisplayProps {
  logs: string[];
}

export function LogDisplay({ logs }: LogDisplayProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>诊断日志</CardTitle>
        <CardDescription>详细的诊断过程和结果</CardDescription>
      </CardHeader>
      <CardContent>
        <div className='bg-muted max-h-96 overflow-y-auto rounded-md p-4'>
          <pre className='text-sm'>
            {logs.length > 0 ? logs.join('\n') : '等待诊断开始...'}
          </pre>
        </div>
      </CardContent>
    </Card>
  );
}
