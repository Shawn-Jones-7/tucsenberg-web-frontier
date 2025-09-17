'use client';

import { AnimatedIcon } from '@/components/shared/animated-icon';
import { ProgressIndicator } from '@/components/shared/progress-indicator';
import { Button } from '@/components/ui/button';
import { ONE } from "@/constants/magic-numbers";
import { Link } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';

interface UnderConstructionProps {
  pageType: 'products' | 'blog' | 'about' | 'contact';
  className?: string;
  showProgress?: boolean;
  currentStep?: number;
  expectedDate?: string;
}

export function UnderConstruction({
  pageType,
  className,
  showProgress = true,
  currentStep = ONE,
  expectedDate = '2024年第二季度',
}: UnderConstructionProps) {
  const t = useTranslations('underConstruction');
  const tPage = useTranslations(`underConstruction.pages.${pageType}`);

  return (
    <div
      className={cn(
        'flex min-h-[80vh] flex-col items-center justify-center px-4 py-16',
        'from-background via-background to-muted/20 bg-gradient-to-br',
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
            <span className='from-primary to-primary/60 bg-gradient-to-r bg-clip-text text-transparent'>
              {tPage('title')}
            </span>
          </h1>

          <p className='text-muted-foreground mx-auto max-w-lg text-xl leading-relaxed'>
            {tPage('description')}
          </p>
        </div>

        {/* 功能预告 */}
        <div className='bg-card rounded-lg border p-6 shadow-sm'>
          <h3 className='text-card-foreground mb-3 text-lg font-semibold'>
            {t('comingSoon')}
          </h3>
          <p className='text-muted-foreground'>{tPage('features')}</p>
        </div>

        {/* 进度指示器 */}
        {showProgress && (
          <div className='bg-card rounded-lg border p-6 shadow-sm'>
            <h3 className='text-card-foreground mb-6 text-lg font-semibold'>
              {t('progress.title')}
            </h3>
            <ProgressIndicator currentStep={currentStep} />
          </div>
        )}

        {/* 预计完成时间 */}
        <div className='bg-primary/5 border-primary/20 rounded-lg border p-4'>
          <p className='text-primary font-medium'>
            {t('expectedCompletion', { date: expectedDate })}
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
        <div className='border-border/50 border-t pt-8'>
          <p className='text-muted-foreground text-sm'>{t('stayTuned')}</p>
        </div>
      </div>

      {/* 背景装饰 - 简化版本 */}
      <div className='pointer-events-none fixed inset-0 -z-10 overflow-hidden'>
        <div className='bg-primary/3 absolute top-1/4 left-1/4 h-64 w-64 rounded-full blur-3xl' />
      </div>
    </div>
  );
}
