// @ts-nocheck - 开发工具豁免：仅开发环境使用，不影响生产代码质量
'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronRight, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

/**
 * React Scan 使用指南组件 - 简化版
 */
export function ReactScanGuide() {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    quickStart: true,
  });

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({
      ...prev,
       
      [section]:
        !Object.prototype.hasOwnProperty.call(prev, section) || !prev[section], // section 来自内部控制，安全
    }));
  };

  const Section = ({
    id,
    title,
    children,
  }: {
    id: string;
    title: string;
    children: React.ReactNode;
  }) => (
    <Card className='mb-4'>
      <CardHeader
        className='cursor-pointer'
        onClick={() => toggleSection(id)}
      >
        <CardTitle className='flex items-center gap-2 text-lg'>
          {/* eslint-disable-next-line security/detect-object-injection */}
          {openSections[id] ? (
            <ChevronDown className='h-4 w-4' />
          ) : (
            <ChevronRight className='h-4 w-4' />
          )}
          {title}
        </CardTitle>
      </CardHeader>
      { }
      {Object.prototype.hasOwnProperty.call(openSections, id) &&
        openSections[id] && <CardContent>{children}</CardContent>}
    </Card>
  );

  return (
    <div className='mx-auto w-full max-w-4xl space-y-6'>
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            React Scan 使用指南
            <Badge variant='secondary'>开发工具</Badge>
          </CardTitle>
          <CardDescription>
            学习如何使用 React Scan 来分析和优化 React 应用的性能
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs
        defaultValue='guide'
        className='w-full'
      >
        <TabsList className='grid w-full grid-cols-3'>
          <TabsTrigger value='guide'>使用指南</TabsTrigger>
          <TabsTrigger value='examples'>示例代码</TabsTrigger>
          <TabsTrigger value='tips'>优化技巧</TabsTrigger>
        </TabsList>

        <TabsContent
          value='guide'
          className='space-y-4'
        >
          <Section
            id='quickStart'
            title='快速开始'
          >
            <div className='space-y-4'>
              <p className='text-muted-foreground text-sm'>
                React Scan 是一个强大的性能分析工具，可以帮助你识别 React
                应用中的性能瓶颈。
              </p>

              <div className='space-y-2'>
                <h4 className='font-medium'>安装步骤：</h4>
                <ol className='list-inside list-decimal space-y-1 text-sm'>
                  <li>安装 React Scan 包</li>
                  <li>在开发环境中启用 React Scan</li>
                  <li>使用分析器查看性能数据</li>
                </ol>
              </div>

              <div className='bg-muted rounded-lg p-4'>
                <code className='text-sm'>
                  npm install react-scan --save-dev
                </code>
              </div>
            </div>
          </Section>

          <Section
            id='configuration'
            title='配置选项'
          >
            <div className='space-y-4'>
              <p className='text-muted-foreground text-sm'>
                React Scan 提供多种配置选项来自定义分析行为。
              </p>

              <div className='space-y-2'>
                <h4 className='font-medium'>主要配置：</h4>
                <ul className='list-inside list-disc space-y-1 text-sm'>
                  <li>enabled: 启用/禁用扫描</li>
                  <li>showToolbar: 显示工具栏</li>
                  <li>alwaysShowLabels: 始终显示标签</li>
                  <li>animationSpeed: 动画速度</li>
                </ul>
              </div>
            </div>
          </Section>

          <Section
            id='analysis'
            title='性能分析'
          >
            <div className='space-y-4'>
              <p className='text-muted-foreground text-sm'>
                使用 React Scan 分析器来深入了解组件的渲染性能。
              </p>

              <div className='space-y-2'>
                <h4 className='font-medium'>分析指标：</h4>
                <ul className='list-inside list-disc space-y-1 text-sm'>
                  <li>渲染次数：组件被渲染的总次数</li>
                  <li>渲染时间：组件渲染所花费的时间</li>
                  <li>平均时间：每次渲染的平均时间</li>
                  <li>效率分数：基于性能的评分</li>
                </ul>
              </div>
            </div>
          </Section>
        </TabsContent>

        <TabsContent
          value='examples'
          className='space-y-4'
        >
          <Card>
            <CardHeader>
              <CardTitle className='text-lg'>代码示例</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div>
                <h4 className='mb-2 font-medium'>基础配置</h4>
                <div className='bg-muted rounded-lg p-4'>
                  <pre className='overflow-x-auto text-sm'>
                    {`import { scan } from 'react-scan';

// 在开发环境中启用
if (process.env.NODE_ENV === 'development') {
  scan({
    enabled: true,
    showToolbar: true,
  });
}`}
                  </pre>
                </div>
              </div>

              <div>
                <h4 className='mb-2 font-medium'>组件优化示例</h4>
                <div className='bg-muted rounded-lg p-4'>
                  <pre className='overflow-x-auto text-sm'>
                    {`// 使用 React.memo 优化组件
const OptimizedComponent = React.memo(({ data }) => {
  return <div>{data.name}</div>;
});

// 使用 useMemo 优化计算
const ExpensiveComponent = ({ items }) => {
  const expensiveValue = useMemo(() => {
    return items.reduce((sum, item) => sum + item.value, 0);
  }, [items]);

  return <div>{expensiveValue}</div>;
};`}
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent
          value='tips'
          className='space-y-4'
        >
          <Card>
            <CardHeader>
              <CardTitle className='text-lg'>性能优化技巧</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='space-y-3'>
                <div className='border-l-4 border-blue-500 pl-4'>
                  <h4 className='font-medium'>使用 React.memo</h4>
                  <p className='text-muted-foreground text-sm'>
                    对于纯组件，使用 React.memo 可以避免不必要的重新渲染。
                  </p>
                </div>

                <div className='border-l-4 border-green-500 pl-4'>
                  <h4 className='font-medium'>优化状态管理</h4>
                  <p className='text-muted-foreground text-sm'>
                    将状态尽可能靠近使用它的组件，避免不必要的状态传递。
                  </p>
                </div>

                <div className='border-l-4 border-yellow-500 pl-4'>
                  <h4 className='font-medium'>使用 useMemo 和 useCallback</h4>
                  <p className='text-muted-foreground text-sm'>
                    对于昂贵的计算和函数，使用这些钩子来避免重复计算。
                  </p>
                </div>

                <div className='border-l-4 border-red-500 pl-4'>
                  <h4 className='font-medium'>避免内联对象和函数</h4>
                  <p className='text-muted-foreground text-sm'>
                    在 JSX
                    中避免创建内联对象和函数，这会导致子组件不必要的重新渲染。
                  </p>
                </div>
              </div>

              <div className='pt-4'>
                <Button
                  variant='outline'
                  className='w-full'
                >
                  <ExternalLink className='mr-2 h-4 w-4' />
                  查看更多优化技巧
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
