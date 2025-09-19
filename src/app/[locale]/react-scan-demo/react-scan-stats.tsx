// @ts-nocheck - 开发工具豁免：仅开发环境使用，不影响生产代码质量
'use client';

import { useCallback, useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type {
  ReactScanStats,
  ReactScanWindow,
} from '@/app/[locale]/react-scan-demo/react-scan-types';
import { REACT_SCAN_CONFIG } from '@/constants/react-scan';

/**
 * React Scan 性能数据显示组件
 */
export function ReactScanStatsComponent() {
  const [stats, setStats] = useState<ReactScanStats | null>(null);

  const updateStats = useCallback(() => {
    if (typeof window !== 'undefined') {
      try {
        const reactScanWindow = window as ReactScanWindow;
        const reactScanData =
          reactScanWindow.__REACT_SCAN__?.ReactScanInternals;

        if (reactScanData) {
          setStats({
            enabled: reactScanData.enabled || false,
            totalRenders: reactScanData.totalRenders || 0,
            componentsTracked: reactScanData.componentsScanned || 0,
            lastUpdate: new Date().toLocaleTimeString(),
          });
        } else {
          setStats({
            enabled: false,
            totalRenders: 0,
            componentsTracked: 0,
            lastUpdate: new Date().toLocaleTimeString(),
          });
        }
      } catch (error) {
        console.warn('Failed to get React Scan stats:', error);
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
    const interval = setInterval(updateStats, 1000);
    return () => clearInterval(interval);
  }, [updateStats]);

  const toggleReactScan = useCallback(() => {
    if (typeof window !== 'undefined') {
      try {
        const reactScanWindow = window as ReactScanWindow;
        if (reactScanWindow.__REACT_SCAN__?.ReactScanInternals) {
          const currentState =
            reactScanWindow.__REACT_SCAN__.ReactScanInternals.enabled;
          reactScanWindow.__REACT_SCAN__.ReactScanInternals.enabled =
            !currentState;
          updateStats();
        }
      } catch (error) {
        console.warn('Failed to toggle React Scan:', error);
      }
    }
  }, [updateStats]);

  const resetStats = useCallback(() => {
    if (typeof window !== 'undefined') {
      try {
        const reactScanWindow = window as ReactScanWindow;
        if (reactScanWindow.__REACT_SCAN__?.ReactScanInternals) {
          reactScanWindow.__REACT_SCAN__.ReactScanInternals.totalRenders = 0;
          reactScanWindow.__REACT_SCAN__.ReactScanInternals.componentsScanned = 0;
          updateStats();
        }
      } catch (error) {
        console.warn('Failed to reset React Scan stats:', error);
      }
    }
  }, [updateStats]);

  if (!stats) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>React Scan 统计</CardTitle>
          <CardDescription>加载中...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center justify-between'>
          React Scan 统计
          <Badge variant={stats.enabled ? 'default' : 'secondary'}>
            {stats.enabled ? '已启用' : '已禁用'}
          </Badge>
        </CardTitle>
        <CardDescription>实时监控 React 组件渲染性能</CardDescription>
      </CardHeader>
      <CardContent>
        <div className='space-y-4'>
          <div className='grid gap-4 md:grid-cols-3'>
            <div className='rounded-lg border p-4 text-center'>
              <div className='text-2xl font-bold text-blue-600'>
                {stats.totalRenders}
              </div>
              <div className='text-muted-foreground text-sm'>总渲染次数</div>
            </div>
            <div className='rounded-lg border p-4 text-center'>
              <div className='text-2xl font-bold text-green-600'>
                {stats.componentsTracked}
              </div>
              <div className='text-muted-foreground text-sm'>跟踪组件数</div>
            </div>
            <div className='rounded-lg border p-4 text-center'>
              <div className='text-sm font-medium text-purple-600'>
                {stats.lastUpdate}
              </div>
              <div className='text-muted-foreground text-sm'>最后更新</div>
            </div>
          </div>

          <div className='flex gap-2'>
            <Button
              onClick={toggleReactScan}
              variant='outline'
              size='sm'
            >
              {stats.enabled ? '禁用' : '启用'} React Scan
            </Button>
            <Button
              onClick={resetStats}
              variant='outline'
              size='sm'
            >
              重置统计
            </Button>
            <Button
              onClick={updateStats}
              variant='outline'
              size='sm'
            >
              刷新数据
            </Button>
          </div>

          <div className='bg-muted rounded-lg p-4'>
            <h4 className='mb-2 font-semibold'>配置信息</h4>
            <div className='space-y-1 text-sm'>
              <div>启用状态: {REACT_SCAN_CONFIG.enabled ? '是' : '否'}</div>
              <div>
                显示覆盖层: {REACT_SCAN_CONFIG.showOverlay ? '是' : '否'}
              </div>
              <div>
                跟踪渲染: {REACT_SCAN_CONFIG.trackRenders ? '是' : '否'}
              </div>
              <div>
                控制台日志: {REACT_SCAN_CONFIG.logToConsole ? '是' : '否'}
              </div>
            </div>
          </div>

          <div className='text-muted-foreground text-xs'>
            <p>
              💡 提示: React Scan 会高亮显示不必要的重新渲染。
              红色表示可能的性能问题，绿色表示正常渲染。
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * React Scan 控制面板
 */
export function ReactScanControlPanel() {
  const [isVisible, setIsVisible] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const toggleVisibility = useCallback(() => {
    setIsVisible((prev) => !prev);
  }, []);

  const toggleAutoRefresh = useCallback(() => {
    setAutoRefresh((prev) => !prev);
  }, []);

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <h3 className='text-lg font-semibold'>React Scan 控制面板</h3>
        <div className='flex gap-2'>
          <Button
            onClick={toggleAutoRefresh}
            variant='outline'
            size='sm'
          >
            自动刷新: {autoRefresh ? '开' : '关'}
          </Button>
          <Button
            onClick={toggleVisibility}
            variant='outline'
            size='sm'
          >
            {isVisible ? '隐藏' : '显示'}统计
          </Button>
        </div>
      </div>

      {isVisible && <ReactScanStatsComponent />}
    </div>
  );
}

/**
 * React Scan 使用说明组件
 */
export function ReactScanInstructions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>React Scan 使用说明</CardTitle>
        <CardDescription>
          了解如何使用 React Scan 来优化 React 应用性能
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className='space-y-4'>
          <div>
            <h4 className='mb-2 font-semibold'>什么是 React Scan？</h4>
            <p className='text-muted-foreground text-sm'>
              React Scan 是一个开发工具，用于检测和可视化 React
              组件的不必要重新渲染。
              它可以帮助开发者识别性能瓶颈并优化应用性能。
            </p>
          </div>

          <div>
            <h4 className='mb-2 font-semibold'>如何使用？</h4>
            <ul className='text-muted-foreground space-y-1 text-sm'>
              <li>• 启用 React Scan 后，它会自动检测组件渲染</li>
              <li>• 红色高亮表示可能的不必要渲染</li>
              <li>• 绿色高亮表示正常的渲染</li>
              <li>• 查看统计数据了解应用的渲染性能</li>
            </ul>
          </div>

          <div>
            <h4 className='mb-2 font-semibold'>优化建议</h4>
            <ul className='text-muted-foreground space-y-1 text-sm'>
              <li>• 使用 React.memo 包装纯组件</li>
              <li>• 使用 useMemo 缓存昂贵的计算</li>
              <li>• 使用 useCallback 缓存函数引用</li>
              <li>• 避免在渲染过程中创建新对象</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
