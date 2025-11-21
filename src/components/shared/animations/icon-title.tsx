/**
 * 图标和标题动画组件
 */

import { Clock, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

// 1. 主图标动画组合
export const AnimatedHeroIcon = ({ className }: { className?: string }) => (
  <div className={cn('flex justify-center', className)}>
    <div className='group relative cursor-pointer'>
      <div className='relative'>
        {/* 多层动画效果容器 */}
        <div className='relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary/10 to-primary/5 shadow-lg transition-all duration-500 group-hover:scale-110 group-hover:from-primary/20 group-hover:to-primary/10 group-hover:shadow-xl'>
          {/* 背景脉冲效果 */}
          <div className='absolute inset-0 animate-ping rounded-full bg-primary/5' />

          {/* 旋转光环效果 */}
          <div
            className='absolute inset-0 animate-spin rounded-full border-2 border-primary/20 opacity-0 transition-opacity duration-500 group-hover:opacity-100'
            style={{ animationDuration: '3s' }}
          />

          {/* 主图标 */}
          <Zap className='relative z-10 h-10 w-10 animate-pulse text-primary transition-all duration-300 group-hover:animate-bounce' />
        </div>

        {/* 状态徽章 */}
        <div className='absolute -right-2 -top-2 duration-700 animate-in slide-in-from-top-2'>
          <Badge
            variant='secondary'
            className='animate-bounce shadow-md transition-all duration-200 hover:scale-105 hover:animate-pulse'
          >
            <Clock
              className='mr-1 h-3 w-3 animate-spin'
              style={{ animationDuration: '3s' }}
            />
            进行中
          </Badge>
        </div>
      </div>
    </div>
  </div>
);

// 2. 渐变文字动画
export const AnimatedTitle = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <h1
    className={cn(
      'text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl',
      'duration-1000 animate-in fade-in slide-in-from-bottom-4',
      className,
    )}
  >
    <span className='animate-pulse bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent transition-all duration-500 hover:from-primary/80 hover:to-primary'>
      {children}
    </span>
  </h1>
);
