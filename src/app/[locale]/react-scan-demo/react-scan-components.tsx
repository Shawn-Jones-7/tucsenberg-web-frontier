// @ts-nocheck - 开发工具豁免：仅开发环境使用，不影响生产代码质量
'use client';

import { useCallback, useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

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
  let expensiveCalculation = 0;
  for (let i = 0; i < 100000; i++) {
    expensiveCalculation += Math.random();
  }

  return (
    <Card className='border-red-200 bg-red-50'>
      <CardHeader>
        <CardTitle className='text-red-700'>
          低效组件 <Badge variant='destructive'>未优化</Badge>
        </CardTitle>
        <CardDescription>
          这个组件故意设计得低效，会在每次渲染时执行昂贵计算
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className='space-y-2'>
          <p>计数: {count}</p>
          <p>时间戳: {expensiveObject.timestamp}</p>
          <p>随机数: {expensiveObject.random.toFixed(4)}</p>
          <p>昂贵计算结果: {expensiveCalculation.toFixed(2)}</p>
          <div className='text-sm text-red-600'>
            ⚠️ 每次渲染都会重新计算所有值
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * 优化的组件 - 用于演示 React Scan 检测优化渲染
 */
export function OptimizedComponent({ count }: { count: number }) {
  // 使用 useMemo 缓存昂贵计算
  const expensiveCalculation = useMemo(() => {
    let result = 0;
    for (let i = 0; i < 100000; i++) {
      result += Math.random();
    }
    return result;
  }, []); // 计算结果不依赖于任何props，只计算一次

  // 使用 useMemo 缓存对象创建
  const cachedObject = useMemo(
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
        <CardTitle className='text-green-700'>
          优化组件{' '}
          <Badge
            variant='default'
            className='bg-green-600'
          >
            已优化
          </Badge>
        </CardTitle>
        <CardDescription>
          这个组件使用了 useMemo 来优化性能，避免不必要的重新计算
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className='space-y-2'>
          <p>计数: {count}</p>
          <p>时间戳: {cachedObject.timestamp}</p>
          <p>随机数: {cachedObject.random.toFixed(4)}</p>
          <p>昂贵计算结果: {expensiveCalculation.toFixed(2)}</p>
          <div className='text-sm text-green-600'>
            ✅ 使用 useMemo 缓存计算结果
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * 演示组件容器
 */
export function DemoComponentsContainer({
  count,
  onTriggerRender,
}: {
  count: number;
  onTriggerRender: () => void;
}) {
  const [showComponents, setShowComponents] = useState(true);

  const toggleComponents = useCallback(() => {
    setShowComponents((prev) => !prev);
  }, []);

  return (
    <div className='space-y-6'>
      <div className='flex gap-4'>
        <Button
          onClick={onTriggerRender}
          variant='outline'
        >
          触发重新渲染
        </Button>
        <Button
          onClick={toggleComponents}
          variant='outline'
        >
          {showComponents ? '隐藏' : '显示'}组件
        </Button>
      </div>

      {showComponents && (
        <div className='grid gap-6 md:grid-cols-2'>
          <IneffientComponent count={count} />
          <OptimizedComponent count={count} />
        </div>
      )}
    </div>
  );
}

/**
 * 性能测试组件
 */
export function PerformanceTestComponent({
  iterations = 1000,
}: {
  iterations?: number;
}) {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<{
    inefficient: number;
    optimized: number;
  } | null>(null);

  const runPerformanceTest = useCallback(async () => {
    setIsRunning(true);
    setResults(null);

    // 测试低效组件
    const inefficientStart = performance.now();
    for (let i = 0; i < iterations; i++) {
      // 模拟低效组件的计算（丢弃中间结果以避免未使用变量）
      for (let j = 0; j < 1000; j++) {
        Math.random();
      }
    }
    const inefficientTime = performance.now() - inefficientStart;

    // 测试优化组件（模拟缓存）
    const optimizedStart = performance.now();
    let cachedResult = 0;
    for (let j = 0; j < 1000; j++) {
      cachedResult += Math.random();
    }
    for (let i = 0; i < iterations; i++) {
      // 模拟使用缓存的结果（显式丢弃）
      void cachedResult;
    }
    const optimizedTime = performance.now() - optimizedStart;

    setResults({
      inefficient: inefficientTime,
      optimized: optimizedTime,
    });
    setIsRunning(false);
  }, [iterations]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>性能测试</CardTitle>
        <CardDescription>比较优化和未优化组件的性能差异</CardDescription>
      </CardHeader>
      <CardContent>
        <div className='space-y-4'>
          <Button
            onClick={runPerformanceTest}
            disabled={isRunning}
            className='w-full'
          >
            {isRunning ? '测试中...' : `运行性能测试 (${iterations} 次迭代)`}
          </Button>

          {results && (
            <div className='grid gap-4 md:grid-cols-2'>
              <div className='rounded-lg border border-red-200 bg-red-50 p-4'>
                <h4 className='font-semibold text-red-700'>未优化组件</h4>
                <p className='text-2xl font-bold text-red-600'>
                  {results.inefficient.toFixed(2)}ms
                </p>
              </div>
              <div className='rounded-lg border border-green-200 bg-green-50 p-4'>
                <h4 className='font-semibold text-green-700'>优化组件</h4>
                <p className='text-2xl font-bold text-green-600'>
                  {results.optimized.toFixed(2)}ms
                </p>
              </div>
            </div>
          )}

          {results && (
            <div className='text-center'>
              <p className='text-muted-foreground text-sm'>
                性能提升:{' '}
                {(
                  ((results.inefficient - results.optimized) /
                    results.inefficient) *
                  100
                ).toFixed(1)}
                %
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
