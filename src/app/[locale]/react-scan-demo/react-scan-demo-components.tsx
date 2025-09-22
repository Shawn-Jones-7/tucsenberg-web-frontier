'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { REACT_SCAN_CONFIG } from '@/constants/react-scan';
import { useCallback, useEffect, useMemo, useState } from 'react';

// React Scan 类型定义
interface ReactScanStats {
  enabled: boolean;
  totalRenders: number;
  componentsTracked: number;
  lastUpdate: string;
}

interface ReactScanWindow extends Window {
  __REACT_SCAN__?: {
    ReactScanInternals?: {
      enabled?: boolean;
      totalRenders?: number;
      componentsScanned?: number;
      lastScanTime?: number;
      fiberRoots?: Record<string, unknown>;
    };
  };
}

/**
 * 故意设计的低效组件 - 用于演示 React Scan 检测不必要渲染
 */
export function IneffientComponent({ count }: { count: number }) {
  // 故意在每次渲染时创建新对象 - 这会导致不必要的渲染
  const expensiveObject = {
    timestamp: Date.now(),
    random: Math.random(),
    count,
  };

  // 故意的昂贵计算 - 每次渲染都会执行
  const expensiveCalculation = () => {
    let result = 0;
    for (let i = 0; i < DEV_TOOLS_CONSTANTS.REACT_SCAN.MAX_RENDERS; i++) {
      result += Math.random();
    }
    return result;
  };

  const result = expensiveCalculation();

  return (
    <Card className='border-red-200 bg-red-50'>
      <CardHeader>
        <CardTitle className='text-red-700'>低效组件 (故意设计)</CardTitle>
        <CardDescription>
          这个组件故意设计得低效，用于演示 React Scan 如何检测性能问题
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className='space-y-2'>
          <p>
            <strong>计数:</strong> {count}
          </p>
          <p>
            <strong>昂贵计算结果:</strong> {result.toFixed(4)}
          </p>
          <p>
            <strong>时间戳:</strong> {expensiveObject.timestamp}
          </p>
          <p>
            <strong>随机数:</strong> {expensiveObject.random.toFixed(4)}
          </p>
          <Badge variant='destructive'>每次渲染都重新计算</Badge>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * 优化后的组件 - 使用 React 优化技术
 */
export function OptimizedComponent({ count }: { count: number }) {
  // 使用 useMemo 缓存昂贵计算
  const expensiveCalculation = useMemo(() => {
    let result = 0;
    for (let i = 0; i < DEV_TOOLS_CONSTANTS.REACT_SCAN.MAX_RENDERS; i++) {
      result += Math.random();
    }
    return result;
  }, []); // 计算结果不依赖于任何props，只计算一次

  // 使用 useMemo 缓存对象
  const optimizedObject = useMemo(
    () => ({
      timestamp: Date.now(),
      random: Math.random(),
      count,
    }),
    [count],
  );

  return (
    <Card className='border-green-200 bg-green-50'>
      <CardHeader>
        <CardTitle className='text-green-700'>优化组件</CardTitle>
        <CardDescription>
          这个组件使用了 React 优化技术，避免不必要的重新计算
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className='space-y-2'>
          <p>
            <strong>计数:</strong> {count}
          </p>
          <p>
            <strong>缓存计算结果:</strong> {expensiveCalculation.toFixed(4)}
          </p>
          <p>
            <strong>缓存时间戳:</strong> {optimizedObject.timestamp}
          </p>
          <p>
            <strong>缓存随机数:</strong> {optimizedObject.random.toFixed(4)}
          </p>
          <Badge variant='secondary'>使用 useMemo 优化</Badge>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * React Scan 状态显示组件
 */
export function ReactScanStats() {
  const [stats, setStats] = useState<ReactScanStats | null>(null);

  const updateStats = useCallback(() => {
    if (typeof window !== 'undefined') {
      try {
        // 检查多种可能的 React Scan 状态
        const reactScan = (window as ReactScanWindow).__REACT_SCAN__;
        const reactScanInternals = reactScan?.ReactScanInternals;

        // 尝试从多个位置获取状态
        let isEnabled = false;
        let totalRenders = 0;
        let componentsTracked = 0;

        if (reactScanInternals) {
          isEnabled = reactScanInternals.enabled ?? false;
          totalRenders = reactScanInternals.totalRenders ?? 0;

          // 获取跟踪组件数
          const fiberRoots = reactScanInternals?.fiberRoots || {};
          componentsTracked = Object.keys(fiberRoots).length;
        }

        setStats({
          enabled: isEnabled,
          totalRenders,
          componentsTracked,
          lastUpdate: new Date().toLocaleTimeString(),
        });
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('无法获取 React Scan 状态:', error);
        }
        setStats({
          enabled: false,
          totalRenders: 0,
          componentsTracked: 0,
          lastUpdate: new Date().toLocaleTimeString(),
        });
      }
    }
  }, []);

  useEffect(() => {
    updateStats();

    // 更频繁的轮询以快速响应状态变化
    const interval = setInterval(
      updateStats,
      REACT_SCAN_CONFIG.STATS_UPDATE_INTERVAL,
    );

    // 监听键盘事件以立即更新状态
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === 'x') {
        // 延迟一点更新以确保 React Scan 状态已经改变
        setTimeout(updateStats, 100);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearInterval(interval);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [updateStats]);

  if (!stats) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>React Scan 状态</CardTitle>
        </CardHeader>
        <CardContent>
          <p>正在加载状态...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          React Scan 状态
          <Badge variant={stats.enabled ? 'default' : 'secondary'}>
            {stats.enabled ? '已启用' : '已禁用'}
          </Badge>
        </CardTitle>
        <CardDescription>
          实时显示 React Scan 的运行状态和统计信息
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className='grid grid-cols-2 gap-4'>
          <div>
            <p className='text-sm font-medium'>总渲染次数</p>
            <p className='text-2xl font-bold'>{stats.totalRenders}</p>
          </div>
          <div>
            <p className='text-sm font-medium'>跟踪组件数</p>
            <p className='text-2xl font-bold'>{stats.componentsTracked}</p>
          </div>
        </div>
        <div className='border-_t mt-4 pt-4'>
          <p className='text-muted-foreground text-xs'>
            最后更新: {stats.lastUpdate}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

interface ControlPanelProps {
  count: number;
  onIncrement: () => void;
  onTriggerRender: () => void;
}

export function ControlPanel({
  count,
  onIncrement,
  onTriggerRender,
}: ControlPanelProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>控制面板</CardTitle>
        <CardDescription>
          使用这些按钮来触发组件重新渲染，观察 React Scan 的检测效果
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className='flex flex-col gap-4 sm:flex-row'>
          <Button
            _onClick={onIncrement}
            className='flex-1'
          >
            增加计数 ({count})
          </Button>
          <Button
            _onClick={onTriggerRender}
            variant='outline'
            className='flex-1'
          >
            触发不必要渲染
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
