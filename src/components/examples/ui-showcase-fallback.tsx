import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * UI Showcase 加载占位符组件 - 用于 PPR 试点
 * 在动态内容加载时显示的 Suspense fallback
 */
export function UIShowcaseFallback() {
  return (
    <div className='space-y-8'>
      {/* 动态内容加载状态 */}
      <Card>
        <CardHeader>
          <CardTitle>Loading Interactive Components...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-3'>
            <Skeleton className='h-4 w-3/4' />
            <Skeleton className='h-4 w-1/2' />
          </div>
        </CardContent>
      </Card>

      {/* Toast Demo 骨架 */}
      <Card>
        <CardHeader>
          <CardTitle>
            <Skeleton className='h-6 w-48' />
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid grid-cols-2 gap-4 md:grid-cols-4'>
            <Skeleton className='h-10 w-full' />
            <Skeleton className='h-10 w-full' />
            <Skeleton className='h-10 w-full' />
            <Skeleton className='h-10 w-full' />
          </div>
        </CardContent>
      </Card>

      {/* Typography Demo 骨架 */}
      <Card>
        <CardHeader>
          <CardTitle>
            <Skeleton className='h-6 w-40' />
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-3'>
          <Skeleton className='h-8 w-full' />
          <Skeleton className='h-4 w-full' />
          <Skeleton className='h-4 w-3/4' />
          <Skeleton className='h-4 w-1/2' />
        </CardContent>
      </Card>

      {/* Carousel Demo 骨架 */}
      <Card>
        <CardHeader>
          <CardTitle>
            <Skeleton className='h-6 w-36' />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className='h-48 w-full rounded-lg' />
        </CardContent>
      </Card>

      {/* Progress Bar Demo 骨架 */}
      <Card>
        <CardHeader>
          <CardTitle>
            <Skeleton className='h-6 w-44' />
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <Skeleton className='h-4 w-full' />
          <Skeleton className='h-10 w-32' />
        </CardContent>
      </Card>

      {/* 性能指标骨架 */}
      <Card>
        <CardHeader>
          <CardTitle>
            <Skeleton className='h-6 w-56' />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
            <div className='space-y-2 text-center'>
              <Skeleton className='mx-auto h-8 w-16' />
              <Skeleton className='mx-auto h-3 w-20' />
            </div>
            <div className='space-y-2 text-center'>
              <Skeleton className='mx-auto h-8 w-16' />
              <Skeleton className='mx-auto h-3 w-20' />
            </div>
            <div className='space-y-2 text-center'>
              <Skeleton className='mx-auto h-8 w-16' />
              <Skeleton className='mx-auto h-3 w-20' />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
