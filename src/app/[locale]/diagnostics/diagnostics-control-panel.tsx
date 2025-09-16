// 诊断页面控制面板组件

import { Download, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { SimpleWebVitals } from '@/app/[locale]/diagnostics/utils';

// 控制面板组件属性接口
interface ControlPanelProps {
  isLoading: boolean;
  currentMetrics: SimpleWebVitals | null;
  onRefresh: () => void;
  onExport: () => void;
}

/**
 * 诊断控制面板组件
 * 提供刷新检测和导出数据功能
 */
export function ControlPanel({
  isLoading,
  currentMetrics,
  onRefresh,
  onExport,
}: ControlPanelProps) {
  return (
    <Card className='mb-6'>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <div>
            <CardTitle>性能诊断控制台</CardTitle>
            <CardDescription>实时监控和分析网站性能指标</CardDescription>
          </div>
          <div className='flex gap-2'>
            <Button
              onClick={onRefresh}
              disabled={isLoading}
              variant='outline'
              size='sm'
            >
              <RefreshCw
                className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
              />
              {isLoading ? '检测中...' : '重新检测'}
            </Button>
            <Button
              onClick={onExport}
              disabled={!currentMetrics}
              variant='outline'
              size='sm'
            >
              <Download className='mr-2 h-4 w-4' />
              导出数据
            </Button>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
}

// 扩展控制面板组件属性接口
interface ExtendedControlPanelProps extends ControlPanelProps {
  onClearHistory?: () => void;
  onSettings?: () => void;
  historyCount?: number;
}

/**
 * 扩展诊断控制面板组件
 * 包含更多控制选项
 */
export function ExtendedControlPanel({
  isLoading,
  currentMetrics,
  onRefresh,
  onExport,
  onClearHistory,
  onSettings,
  historyCount = 0,
}: ExtendedControlPanelProps) {
  return (
    <Card className='mb-6'>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <div>
            <CardTitle>性能诊断控制台</CardTitle>
            <CardDescription>
              实时监控和分析网站性能指标
              {historyCount > 0 && ` • 历史记录: ${historyCount} 条`}
            </CardDescription>
          </div>
          <div className='flex gap-2'>
            <Button
              onClick={onRefresh}
              disabled={isLoading}
              variant='outline'
              size='sm'
            >
              <RefreshCw
                className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
              />
              {isLoading ? '检测中...' : '重新检测'}
            </Button>
            <Button
              onClick={onExport}
              disabled={!currentMetrics}
              variant='outline'
              size='sm'
            >
              <Download className='mr-2 h-4 w-4' />
              导出数据
            </Button>
            {onClearHistory && historyCount > 0 && (
              <Button
                onClick={onClearHistory}
                variant='outline'
                size='sm'
              >
                清除历史
              </Button>
            )}
            {onSettings && (
              <Button
                onClick={onSettings}
                variant='outline'
                size='sm'
              >
                设置
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      {(isLoading || currentMetrics) && (
        <CardContent>
          {isLoading && (
            <div className='flex items-center justify-center py-4'>
              <div className='flex items-center space-x-2'>
                <RefreshCw className='h-4 w-4 animate-spin' />
                <span className='text-muted-foreground text-sm'>
                  正在检测性能指标...
                </span>
              </div>
            </div>
          )}
          {currentMetrics && !isLoading && (
            <div className='text-muted-foreground text-sm'>
              最后更新:{' '}
              {new Date(currentMetrics.timestamp).toLocaleString('zh-CN')}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}

// 简化控制面板组件属性接口
interface SimpleControlPanelProps {
  onRefresh: () => void;
  isLoading?: boolean;
}

/**
 * 简化诊断控制面板组件
 * 仅包含基本的刷新功能
 */
export function SimpleControlPanel({
  onRefresh,
  isLoading = false,
}: SimpleControlPanelProps) {
  return (
    <div className='mb-6 flex items-center justify-between'>
      <div>
        <h2 className='text-2xl font-bold'>性能诊断</h2>
        <p className='text-muted-foreground'>实时监控网站性能指标</p>
      </div>
      <Button
        onClick={onRefresh}
        disabled={isLoading}
        variant='outline'
      >
        <RefreshCw
          className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
        />
        {isLoading ? '检测中...' : '重新检测'}
      </Button>
    </div>
  );
}

// 控制面板状态指示器组件
interface StatusIndicatorProps {
  isOnline: boolean;
  lastUpdate?: number;
  errorMessage?: string;
}

/**
 * 状态指示器组件
 * 显示连接状态和最后更新时间
 */
export function StatusIndicator({
  isOnline,
  lastUpdate,
  errorMessage,
}: StatusIndicatorProps) {
  return (
    <div className='flex items-center space-x-2 text-sm'>
      <div
        className={`h-2 w-2 rounded-full ${
          isOnline ? 'bg-green-500' : 'bg-red-500'
        }`}
      />
      <span className='text-muted-foreground'>
        {isOnline ? '在线' : '离线'}
        {lastUpdate && (
          <>
            {' • 最后更新: '}
            {new Date(lastUpdate).toLocaleTimeString('zh-CN')}
          </>
        )}
      </span>
      {errorMessage && (
        <span className='text-xs text-red-500'>{errorMessage}</span>
      )}
    </div>
  );
}

// 快速操作按钮组组件
interface QuickActionsProps {
  onRefresh: () => void;
  onExport: () => void;
  onClear?: () => void;
  isLoading?: boolean;
  hasData?: boolean;
}

/**
 * 快速操作按钮组组件
 * 提供常用操作的快捷按钮
 */
export function QuickActions({
  onRefresh,
  onExport,
  onClear,
  isLoading = false,
  hasData = false,
}: QuickActionsProps) {
  return (
    <div className='flex gap-2'>
      <Button
        onClick={onRefresh}
        disabled={isLoading}
        size='sm'
        variant='outline'
      >
        <RefreshCw
          className={`mr-1 h-3 w-3 ${isLoading ? 'animate-spin' : ''}`}
        />
        刷新
      </Button>
      <Button
        onClick={onExport}
        disabled={!hasData || isLoading}
        size='sm'
        variant='outline'
      >
        <Download className='mr-1 h-3 w-3' />
        导出
      </Button>
      {onClear && (
        <Button
          onClick={onClear}
          disabled={!hasData || isLoading}
          size='sm'
          variant='outline'
        >
          清除
        </Button>
      )}
    </div>
  );
}
