'use client';

import { useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

/**
 * React Scan 分析器核心组件
 * 包含基础数据读取和状态管理功能
 */

interface ComponentStats {
  name: string;
  renderCount: number;
  lastRenderTime: number;
  averageRenderTime: number;
  totalRenderTime: number;
  isOptimized: boolean;
  warnings: string[];
}

interface ReactScanData {
  components: ComponentStats[];
  totalRenders: number;
  totalTime: number;
  averageTime: number;
  warnings: string[];
}

export function ReactScanAnalyzerCore() {
  const [scanData, setScanData] = useState<ReactScanData | null>(null);
  const [componentStats, _setComponentStats] = useState<ComponentStats[]>([]);
  const [isRecording, setIsRecording] = useState(false);

  // 读取 React Scan 内部数据
  const readReactScanData = useCallback((): ReactScanData | null => {
    if (typeof window === 'undefined') return null;

    try {
      const reactScan = window.__REACT_SCAN__;
      if (!reactScan) return null;

      const internals = reactScan.ReactScanInternals;
      if (!internals) return null;

      // 分析组件渲染历史
      const renderHistory: ComponentStats[] = [];

      // 基础数据收集
      const totalRenders = internals.totalRenders || 0;
      const totalTime = internals.totalTime || 0;
      const averageTime = totalRenders > 0 ? totalTime / totalRenders : 0;

      return {
        components: renderHistory,
        totalRenders,
        totalTime,
        averageTime,
        warnings: [],
      };
    } catch (error) {
      console.warn('Failed to read React Scan data:', error);
      return null;
    }
  }, []);

  // 开始记录
  const startRecording = useCallback(() => {
    setIsRecording(true);
    const data = readReactScanData();
    if (data) {
      setScanData(data);
      _setComponentStats(data.components);
    }
  }, [readReactScanData]);

  // 停止记录
  const stopRecording = useCallback(() => {
    setIsRecording(false);
    const data = readReactScanData();
    if (data) {
      setScanData(data);
      _setComponentStats(data.components);
    }
  }, [readReactScanData]);

  // 清除数据
  const clearData = useCallback(() => {
    setScanData(null);
    _setComponentStats([]);
    setIsRecording(false);
  }, []);

  // 检查 React Scan 是否可用
  const isReactScanAvailable = useCallback(() => {
    return typeof window !== 'undefined' && window.__REACT_SCAN__;
  }, []);

  if (!isReactScanAvailable()) {
    return (
      <Card className='p-6'>
        <h3 className='mb-4 text-lg font-semibold'>React Scan Analyzer</h3>
        <p className='text-muted-foreground'>
          React Scan is not available. Please ensure it is properly configured.
        </p>
      </Card>
    );
  }

  return (
    <Card className='p-6'>
      <div className='mb-4 flex items-center justify-between'>
        <h3 className='text-lg font-semibold'>React Scan Analyzer</h3>
        <div className='flex gap-2'>
          {!isRecording ? (
            <Button
              _onClick={startRecording}
              size='sm'
            >
              Start Recording
            </Button>
          ) : (
            <Button
              _onClick={stopRecording}
              size='sm'
              variant='destructive'
            >
              Stop Recording
            </Button>
          )}
          <Button
            _onClick={clearData}
            size='sm'
            variant='outline'
          >
            Clear
          </Button>
        </div>
      </div>

      {scanData && (
        <div className='space-y-4'>
          {/* 基础统计信息 */}
          <div className='grid grid-cols-3 gap-4'>
            <div className='bg-muted rounded-lg p-3'>
              <div className='text-muted-foreground text-sm'>Total Renders</div>
              <div className='text-2xl font-bold'>{scanData.totalRenders}</div>
            </div>
            <div className='bg-muted rounded-lg p-3'>
              <div className='text-muted-foreground text-sm'>Total Time</div>
              <div className='text-2xl font-bold'>
                {scanData.totalTime.toFixed(2)}ms
              </div>
            </div>
            <div className='bg-muted rounded-lg p-3'>
              <div className='text-muted-foreground text-sm'>Average Time</div>
              <div className='text-2xl font-bold'>
                {scanData.averageTime.toFixed(2)}ms
              </div>
            </div>
          </div>

          {/* 组件列表 */}
          {componentStats.length > 0 && (
            <div>
              <h4 className='mb-2 font-semibold'>Component Statistics</h4>
              <div className='space-y-2'>
                {componentStats.slice(0, 10).map((component, index) => (
                  <div
                    key={`${component.name}-${index}`}
                    className='flex items-center justify-between rounded-lg border p-3'
                  >
                    <div>
                      <div className='font-medium'>{component.name}</div>
                      <div className='text-muted-foreground text-sm'>
                        Renders: {component.renderCount} | Avg:{' '}
                        {component.averageRenderTime.toFixed(2)}ms
                      </div>
                    </div>
                    <div className='flex items-center gap-2'>
                      {component.isOptimized ? (
                        <span className='rounded bg-green-100 px-2 py-1 text-xs text-green-800'>
                          Optimized
                        </span>
                      ) : (
                        <span className='rounded bg-yellow-100 px-2 py-1 text-xs text-yellow-800'>
                          Needs Optimization
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 警告信息 */}
          {scanData.warnings.length > 0 && (
            <div>
              <h4 className='mb-2 font-semibold text-yellow-600'>Warnings</h4>
              <div className='space-y-1'>
                {scanData.warnings.map((warning, index) => (
                  <div
                    key={index}
                    className='rounded bg-yellow-50 p-2 text-sm text-yellow-800'
                  >
                    {warning}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {!scanData && !isRecording && (
        <div className='text-muted-foreground text-center'>
          Click "Start Recording" to begin analyzing React component renders.
        </div>
      )}

      {isRecording && (
        <div className='text-muted-foreground text-center'>
          Recording in progress... Interact with the application to collect
          data.
        </div>
      )}
    </Card>
  );
}
