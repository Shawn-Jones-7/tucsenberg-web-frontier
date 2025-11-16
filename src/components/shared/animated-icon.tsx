'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { useReducedMotion } from '@/hooks/use-reduced-motion';

interface AnimatedIconProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'construction' | 'loading' | 'gear';
}

const sizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-12 h-12',
  lg: 'w-16 h-16',
  xl: 'w-24 h-24',
};

const AnimatedIconComponent = ({
  className,
  size = 'lg',
  variant = 'construction',
}: AnimatedIconProps) => {
  const prefersReducedMotion = useReducedMotion();

  // 安全的属性访问
  const getSizeClass = (sizeKey: string) => {
    const allowedSizes = ['sm', 'md', 'lg', 'xl'];
    if (!allowedSizes.includes(sizeKey)) {
      return sizeClasses.lg; // 默认值
    }
    return sizeClasses[sizeKey as keyof typeof sizeClasses];
  };

  if (variant === 'construction') {
    return (
      <div className={cn('relative', getSizeClass(size), className)}>
        {/* 建设中图标 - 简化版本 */}
        <div className={prefersReducedMotion ? '' : 'animate-pulse'}>
          <svg
            role='img'
            aria-label='Construction icon'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
            className='h-full w-full text-primary'
          >
            {/* 简化的工具图标 */}
            <path d='M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z' />
          </svg>
        </div>
      </div>
    );
  }

  if (variant === 'loading') {
    return (
      <div className={cn('relative', getSizeClass(size), className)}>
        <div
          className={cn(
            'absolute inset-0',
            prefersReducedMotion ? '' : 'animate-spin',
          )}
        >
          <svg
            role='img'
            aria-label='Loading icon'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
            className='h-full w-full text-primary'
          >
            <path d='M21 12a9 9 0 11-6.219-8.56' />
          </svg>
        </div>
      </div>
    );
  }

  if (variant === 'gear') {
    return (
      <div className={cn('relative', getSizeClass(size), className)}>
        <div
          className={cn(
            'absolute inset-0',
            prefersReducedMotion ? '' : 'animate-spin',
          )}
        >
          <svg
            role='img'
            aria-label='Gear icon'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
            className='h-full w-full text-primary'
          >
            <circle
              cx='12'
              cy='12'
              r='3'
            />
            <path d='M12 1v6m0 6v6m11-7h-6m-6 0H1m15.5-6.5l-4.24 4.24M7.76 16.24l-4.24 4.24m12.73 0l-4.24-4.24M7.76 7.76L3.52 3.52' />
          </svg>
        </div>
      </div>
    );
  }

  return null;
};

export const AnimatedIcon = React.memo(AnimatedIconComponent);
AnimatedIcon.displayName = 'AnimatedIcon';
