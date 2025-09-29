'use client';

import * as React from 'react';
import {
  CarouselDemoSection,
  ProgressBarDemoSection,
  ToastDemoSection,
  TypographyDemoSection,
} from '@/components/examples/ui-showcase-sections';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

/**
 * 动态 UI Showcase 组件 - 用于 PPR 试点
 * 包含需要客户端交互的动态内容
 */
export function UIShowcaseDynamic() {
  const { toast } = useToast();
  const [loadTime] = React.useState(() => Date.now());

  const handleToastDemo = (type: 'success' | 'error' | 'info' | 'warning') => {
    switch (type) {
      case 'success':
        toast.success('Success!', 'This is a success message.');
        break;
      case 'error':
        toast.error('Error!', 'This is an error message.');
        break;
      case 'info':
        toast.info('Info!', 'This is an info message.');
        break;
      case 'warning':
        toast.warning('Warning!', 'This is a warning message.');
        break;
      default:
        // Default case to satisfy ESLint
        break;
    }
  };

  const handleFormToastDemo = () => {
    toast.formSuccess('contact');
  };

  return (
    <div className='space-y-8'>
      {/* 动态加载时间显示 */}
      <Card>
        <CardHeader>
          <CardTitle>Dynamic Content Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-2'>
            <p className='text-sm'>
              <span className='font-medium'>Client Load Time:</span>{' '}
              {new Date(loadTime).toLocaleTimeString()}
            </p>
            <p className='text-muted-foreground text-sm'>
              This timestamp shows when the dynamic content was hydrated on the
              client.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Toast Notifications Demo */}
      <ToastDemoSection
        onToastDemo={handleToastDemo}
        onFormToastDemo={handleFormToastDemo}
      />

      {/* Typography Demo */}
      <TypographyDemoSection />

      {/* Carousel Demo */}
      <CarouselDemoSection />

      {/* Progress Bar Demo */}
      <ProgressBarDemoSection />

      {/* 实时性能指标 */}
      <Card>
        <CardHeader>
          <CardTitle>Real-time Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
            <div className='text-center'>
              <div className='text-2xl font-bold text-blue-600'>
                {typeof window !== 'undefined'
                  ? Math.round(performance.now())
                  : '---'}
                ms
              </div>
              <p className='text-muted-foreground text-xs'>Page Load Time</p>
            </div>
            <div className='text-center'>
              <div className='text-2xl font-bold text-green-600'>
                {typeof window !== 'undefined'
                  ? navigator.hardwareConcurrency || 'N/A'
                  : '---'}
              </div>
              <p className='text-muted-foreground text-xs'>CPU Cores</p>
            </div>
            <div className='text-center'>
              <div className='text-2xl font-bold text-purple-600'>
                {typeof window !== 'undefined'
                  ? Math.round(
                      (navigator as Navigator & { deviceMemory?: number })
                        .deviceMemory || 0,
                    ) || 'N/A'
                  : '---'}
                GB
              </div>
              <p className='text-muted-foreground text-xs'>Device Memory</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
