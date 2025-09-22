'use client';

import {
    DemoComponentsContainer,
    PerformanceTestComponent,
} from '@/app/[locale]/react-scan-demo/react-scan-components';
import {
    ReactScanControlPanel,
    ReactScanInstructions,
} from '@/app/[locale]/react-scan-demo/react-scan-stats';
import { ReactScanAnalyzer } from '@/components/dev-tools/react-scan-analyzer';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { useCallback, useState } from 'react';

/**
 * React Scan 演示客户端组件
 *
 * 这个组件展示了如何使用 React Scan 来检测和优化 React 应用的性能。
 * 包含了低效组件和优化组件的对比演示，以及实时的性能统计数据。
 */
export function ReactScanDemoClient() {
  const [count, setCount] = useState(0);
  const [triggerRender, setTriggerRender] = useState(0);

  // 故意触发不必要渲染的函数
  const triggerUnnecessaryRender = useCallback(() => {
    setTriggerRender((prev) => prev + 1);
  }, []);

  // 增加计数器
  const incrementCount = useCallback(() => {
    setCount((prev) => prev + 1);
  }, []);

  // 重置所有状态
  const resetAll = useCallback(() => {
    setCount(0);
    setTriggerRender(0);
  }, []);

  return (
    <div className='container mx-auto space-y-8 p-6'>
      {/* 页面标题 */}
      <div className='text-center'>
        <h1 className='text-3xl font-bold'>React Scan 性能演示</h1>
        <p className='text-muted-foreground mt-2'>
          使用 React Scan 检测和优化 React 组件的渲染性能
        </p>
      </div>

      {/* React Scan 分析器 */}
      <ReactScanAnalyzer />

      {/* 控制面板 */}
      <ReactScanControlPanel />

      {/* 主要控制按钮 */}
      <Card>
        <CardHeader>
          <CardTitle>演示控制</CardTitle>
          <CardDescription>
            使用这些按钮来触发不同类型的渲染，观察 React Scan 的检测结果
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='flex flex-wrap gap-4'>
            <Button
              onClick={incrementCount}
              variant='default'
            >
              增加计数 ({count})
            </Button>
            <Button
              onClick={triggerUnnecessaryRender}
              variant='outline'
            >
              触发不必要渲染 ({triggerRender})
            </Button>
            <Button
              onClick={resetAll}
              variant='secondary'
            >
              重置所有
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 演示组件容器 */}
      <DemoComponentsContainer
        count={count}
        onTriggerRender={triggerUnnecessaryRender}
      />

      {/* 性能测试组件 */}
      <PerformanceTestComponent iterations={1000} />

      {/* 使用说明 */}
      <ReactScanInstructions />

      {/* 开发者信息 */}
      <Card className='border-dashed'>
        <CardHeader>
          <CardTitle className='text-sm'>开发者信息</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='text-muted-foreground space-y-2 text-xs'>
            <p>🔧 这是一个开发工具演示页面，仅在开发环境中使用。</p>
            <p>📊 React Scan 会实时监控组件渲染，帮助识别性能瓶颈。</p>
            <p>🎯 红色高亮表示可能的性能问题，绿色表示正常渲染。</p>
            <p>💡 使用 React.memo、useMemo 和 useCallback 来优化组件性能。</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * 导出默认组件
 */
export default ReactScanDemoClient;
