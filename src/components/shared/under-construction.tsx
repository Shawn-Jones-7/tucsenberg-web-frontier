'use client';

import { useRef } from 'react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { AnimatedIcon } from '@/components/shared/animated-icon';
import { ProgressIndicator } from '@/components/shared/progress-indicator';
import { Button } from '@/components/ui/button';
import { ONE } from '@/constants';
import {
  useDeferredBackground,
  useDeferredContent,
} from '@/hooks/use-deferred-render';
import { Link } from '@/i18n/routing';

interface UnderConstructionProps {
  pageType: 'products' | 'blog' | 'about' | 'contact';
  className?: string;
  showProgress?: boolean;
  currentStep?: number;
  expectedDateKey?: string;
}

export function UnderConstruction({
  pageType,
  className,
  showProgress = true,
  currentStep = ONE,
  expectedDateKey = 'dates.q2_2024',
}: UnderConstructionProps) {
  const t = useTranslations('underConstruction');
  const tPage = useTranslations(`underConstruction.pages.${pageType}`);
  const detailsRef = useRef<HTMLDivElement | null>(null);

  // 背景装饰延后渲染，避免首屏大面积模糊造成绘制开销
  const showBg = useDeferredBackground({ timeout: 1200 });

  // 延迟/按需渲染次要内容（功能预告与进度卡片），避免与 LCP 竞争
  const showDeferred = useDeferredContent(detailsRef, {
    rootMargin: '200px',
    timeout: 1200,
  });

  return (
    <div
      className={cn(
        'flex min-h-[80vh] flex-col items-center justify-center px-4 py-16',
        'bg-gradient-to-br from-background via-background to-muted/20',
        className,
      )}
    >
      <div className='mx-auto max-w-2xl space-y-8 text-center'>
        {/* 动画图标 - 简化版本 */}
        <div className='mb-8 flex justify-center'>
          <AnimatedIcon
            variant='construction'
            size='xl'
            className='text-primary'
          />
        </div>

        {/* 页面标题 */}
        <div className='space-y-4'>
          <h1 className='text-4xl font-bold tracking-tight md:text-5xl'>
            <span className='text-foreground md:bg-gradient-to-r md:from-primary md:to-primary/60 md:bg-clip-text md:text-transparent'>
              {tPage('title')}
            </span>
          </h1>

          <p className='mx-auto max-w-lg text-xl leading-relaxed text-muted-foreground'>
            {tPage('description')}
          </p>
        </div>

        {/* 功能预告 */}
        <div ref={detailsRef}>
          {showDeferred ? (
            <div className='rounded-lg border bg-card p-6 shadow-sm'>
              <h3 className='mb-3 text-lg font-semibold text-card-foreground'>
                {t('comingSoon')}
              </h3>
              <p className='text-muted-foreground'>{tPage('features')}</p>
            </div>
          ) : (
            <div
              className='rounded-lg border bg-muted/40 p-6'
              aria-hidden='true'
            >
              <div className='mb-3 h-5 w-40 animate-pulse rounded bg-muted' />
              <div className='h-4 w-full animate-pulse rounded bg-muted' />
            </div>
          )}
        </div>

        {/* 进度指示器 */}
        {showProgress &&
          (showDeferred ? (
            <div className='rounded-lg border bg-card p-6 shadow-sm'>
              <h3 className='mb-6 text-lg font-semibold text-card-foreground'>
                {t('progress.title')}
              </h3>
              <ProgressIndicator currentStep={currentStep} />
            </div>
          ) : (
            <div
              className='rounded-lg border bg-muted/40 p-6'
              aria-hidden='true'
            >
              <div className='mb-6 h-5 w-32 animate-pulse rounded bg-muted' />
              <div className='h-2 w-full animate-pulse rounded bg-muted' />
            </div>
          ))}

        {/* 预计完成时间 */}
        <div className='rounded-lg border border-primary/20 bg-primary/5 p-4'>
          <p className='font-medium text-primary'>
            {t('expectedCompletion', { date: t(expectedDateKey) })}
          </p>
        </div>

        {/* 操作按钮 */}
        <div className='flex flex-col items-center justify-center gap-4 sm:flex-row'>
          <Button
            asChild
            size='lg'
            className='min-w-[140px]'
          >
            <Link href='/'>{t('backToHome')}</Link>
          </Button>

          <Button
            asChild
            variant='outline'
            size='lg'
            className='min-w-[140px]'
          >
            <Link href='/contact'>{t('contactUs')}</Link>
          </Button>
        </div>

        {/* 底部提示 */}
        <div className='border-t border-border/50 pt-8'>
          <p className='text-sm text-muted-foreground'>{t('stayTuned')}</p>
        </div>
      </div>

      {/* 背景装饰 - 延后呈现，降低 LCP 绘制压力 */}
      {showBg ? (
        <div className='pointer-events-none fixed inset-0 -z-10 overflow-hidden'>
          <div className='bg-primary/3 absolute left-1/4 top-1/4 h-64 w-64 rounded-full blur-3xl' />
        </div>
      ) : null}
    </div>
  );
}
