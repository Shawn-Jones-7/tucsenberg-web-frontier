// @ts-nocheck - 开发工具豁免：仅开发环境使用，不影响生产代码质量
'use client';

import React, { useCallback, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { REACT_SCAN_CONFIG } from '@/constants/react-scan';

/**
 * React Scan 演示组件
 *
 * 用于演示 React Scan 如何检测不必要的渲染
 * 包含优化和未优化的组件示例
 */

// 未优化的组件 - 会导致不必要的渲染
function UnoptimizedComponent({ count }: { count: number }) {
  if (process.env.NODE_ENV === 'development') {
    console.log('🔴 UnoptimizedComponent rendered');
  }

  // 每次渲染都会创建新的对象和函数
  const style = { color: 'red', fontWeight: 'bold' };
  const handleClick = () => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Clicked');
    }
  };

  return (
    <div style={style}>
      <p>Unoptimized Count: {count}</p>
      <button onClick={handleClick}>Click me</button>
    </div>
  );
}

// 优化的组件 - 使用 React.memo 和 hooks
const OptimizedComponent = React.memo(({ count }: { count: number }) => {
  console.log('🟢 OptimizedComponent rendered');

  // 使用 useMemo 缓存样式对象
  const style = useMemo(
    () => ({
      color: 'green',
      fontWeight: 'bold' as const,
    }),
    [],
  );

  // 使用 useCallback 缓存函数
  const handleClick = useCallback(() => {
    console.log('Optimized clicked');
  }, []);

  return (
    <div style={style}>
      <p>Optimized Count: {count}</p>
      <button onClick={handleClick}>Click me</button>
    </div>
  );
});

OptimizedComponent.displayName = 'OptimizedComponent';

// 频繁渲染的组件 - 用于测试性能警告
function FrequentRenderComponent({ trigger }: { trigger: number }) {
  console.log('⚡ FrequentRenderComponent rendered');

  // 模拟复杂计算
  const expensiveValue = useMemo(() => {
    let result = 0;
    for (let i = 0; i < 1000; i++) {
      result += Math.random();
    }
    return result;
  }, []); // 只计算一次，不依赖任何变量

  return (
    <div className='rounded border p-2'>
      <p>Frequent Render: {trigger}</p>
      <p>
        Expensive Value:{' '}
        {expensiveValue.toFixed(
          DEV_TOOLS_CONSTANTS.REACT_SCAN.EXPORT_SPLIT_COUNT,
        )}
      </p>
    </div>
  );
}

// 主演示组件
export function ReactScanDemo() {
  const [count, setCount] = useState(0);
  const [trigger, setTrigger] = useState(0);
  const [independentState, setIndependentState] = useState(0);

  // 检查 React Scan 是否启用
  const isReactScanEnabled =
    process.env.NODE_ENV === 'development' &&
    process.env.NEXT_PUBLIC_DISABLE_REACT_SCAN !== 'true';

  if (!isReactScanEnabled) {
    const reason =
      process.env.NODE_ENV !== 'development'
        ? 'React Scan is only available in development mode.'
        : 'React Scan is disabled. Set NEXT_PUBLIC_DISABLE_REACT_SCAN=false to enable.';

    return (
      <Card className='p-6'>
        <h3 className='mb-4 text-lg font-semibold'>React Scan Demo</h3>
        <p className='text-muted-foreground'>{reason}</p>
      </Card>
    );
  }

  return (
    <Card className='p-6'>
      <h3 className='mb-4 text-lg font-semibold'>
        React Scan Performance Demo
      </h3>

      <div className='space-y-4'>
        {/* 控制按钮 */}
        <div className='flex gap-2'>
          <Button
            onClick={() => setCount((c) => c + 1)}
            variant='outline'
          >
            Increment Count ({count})
          </Button>

          <Button
            onClick={() => setTrigger((t) => t + 1)}
            variant='outline'
          >
            Trigger Frequent Render ({trigger})
          </Button>

          <Button
            onClick={() => setIndependentState((s) => s + 1)}
            variant='outline'
          >
            Independent State ({independentState})
          </Button>
        </div>

        {/* 组件对比 */}
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
          <Card className='p-4'>
            <h4 className='mb-2 text-sm font-medium text-red-600'>
              ❌ Unoptimized Component
            </h4>
            <p className='text-muted-foreground mb-2 text-xs'>
              Will re-render on every parent update
            </p>
            <UnoptimizedComponent count={count} />
          </Card>

          <Card className='p-4'>
            <h4 className='mb-2 text-sm font-medium text-green-600'>
              ✅ Optimized Component
            </h4>
            <p className='text-muted-foreground mb-2 text-xs'>
              Only re-renders when count changes
            </p>
            <OptimizedComponent count={count} />
          </Card>
        </div>

        {/* 频繁渲染组件 */}
        <Card className='p-4'>
          <h4 className='mb-2 text-sm font-medium text-yellow-600'>
            ⚡ Frequent Render Component
          </h4>
          <p className='text-muted-foreground mb-2 text-xs'>
            Triggers performance warnings when rendered frequently
          </p>
          <FrequentRenderComponent trigger={trigger} />
        </Card>

        {/* 使用说明 */}
        <Card className='bg-blue-50 p-4'>
          <h4 className='mb-2 text-sm font-medium'>
            🔍 React Scan Instructions
          </h4>
          <ul className='text-muted-foreground space-y-1 text-xs'>
            <li>• Red highlights indicate unnecessary re-renders</li>
            <li>• Green highlights indicate optimized renders</li>
            <li>• Check browser console for performance warnings</li>
            <li>• Press Ctrl+Shift+X to toggle React Scan display</li>
            <li>• Click buttons above to trigger different render patterns</li>
          </ul>
        </Card>
      </div>
    </Card>
  );
}

/**
 * React Scan 性能测试组件
 *
 * 用于生成大量渲染以测试性能监控
 */
export function ReactScanStressTest() {
  const [items, setItems] = useState<number[]>([]);

  const addItems = useCallback(() => {
    setItems((prev) => [
      ...prev,
      ...Array.from({ length: 10 }, (_, i) => prev.length + i),
    ]);
  }, []);

  const clearItems = useCallback(() => {
    setItems([]);
  }, []);

  return (
    <Card className='p-6'>
      <h3 className='mb-4 text-lg font-semibold'>React Scan Stress Test</h3>

      <div className='space-y-4'>
        <div className='flex gap-2'>
          <Button
            onClick={addItems}
            variant='outline'
          >
            Add 10 Items ({items.length})
          </Button>
          <Button
            onClick={clearItems}
            variant='outline'
          >
            Clear All
          </Button>
        </div>

        <div className='grid grid-cols-5 gap-2'>
          {items.map((item) => (
            <div
              key={item}
              className='rounded border p-2 text-center text-xs'
            >
              Item {item}
            </div>
          ))}
        </div>

        {items.length > REACT_SCAN_CONFIG.LARGE_ITEMS_WARNING_THRESHOLD && (
          <p className='text-sm text-yellow-600'>
            ⚠️ Large number of items may trigger performance warnings
          </p>
        )}
      </div>
    </Card>
  );
}
