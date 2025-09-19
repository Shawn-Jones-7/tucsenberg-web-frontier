'use client';

import { cn } from '@/lib/utils';
import { ONE } from '@/constants';

interface UnderConstructionV2Props {
  pageType: 'products' | 'blog' | 'about' | 'contact';
  className?: string;
  showProgress?: boolean;
  currentStep?: number;
  expectedDate?: string;
  showEmailSubscription?: boolean;
  showSocialLinks?: boolean;
  showFeaturePreview?: boolean;
}

export function UnderConstructionV2({
  pageType,
  className,
  showProgress = true,
  currentStep = ONE,
  expectedDate = '2024年第二季度',
  showEmailSubscription = true,
  showSocialLinks = true,
  showFeaturePreview = true,
}: UnderConstructionV2Props) {
  return (
    <div
      className={cn(
        'relative min-h-screen overflow-hidden',
        'from-background via-background to-muted/30 bg-gradient-to-br',
        className,
      )}
    >
      {/* 背景装饰 */}
      <div className='pointer-events-none absolute inset-0 overflow-hidden'>
        <div className='bg-primary/5 absolute -top-40 -right-40 h-80 w-80 rounded-full blur-3xl' />
        <div className='bg-secondary/5 absolute -bottom-40 -left-40 h-80 w-80 rounded-full blur-3xl' />
        <div className='bg-accent/5 absolute top-1/2 left-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl' />
      </div>

      <div className='relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-16'>
        <div className='mx-auto w-full max-w-4xl space-y-12 text-center'>
          {/* 头部区域 */}
          <div>
            Header Section - {pageType} - {expectedDate}
          </div>

          {/* 进度指示器 */}
          <div>
            Progress Section - {showProgress ? 'Enabled' : 'Disabled'} - Step{' '}
            {currentStep}
          </div>

          {/* 功能预览 */}
          <div>
            Feature Preview - {showFeaturePreview ? 'Enabled' : 'Disabled'}
          </div>

          {/* 邮件订阅 */}
          <div>
            Email Subscription -{' '}
            {showEmailSubscription ? 'Enabled' : 'Disabled'}
          </div>

          {/* 联系方式 */}
          <div>Contact Section - {pageType}</div>

          {/* 社交链接 */}
          <div>Social Links - {showSocialLinks ? 'Enabled' : 'Disabled'}</div>
        </div>
      </div>
    </div>
  );
}
