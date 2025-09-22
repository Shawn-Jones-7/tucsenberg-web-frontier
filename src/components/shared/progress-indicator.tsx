'use client';

import {
    COUNT_PAIR,
    COUNT_TRIPLE,
    PERCENTAGE_FULL
} from '@/constants';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import React from 'react';

interface ProgressStep {
  key: 'planning' | 'development' | 'testing' | 'launch';
  completed: boolean;
  current: boolean;
}

interface ProgressIndicatorProps {
  className?: string;
  currentStep?: number; // 0-3 (0=planning, 1=development, 2=testing, 3=launch)
}

const ProgressIndicatorComponent = ({
  className,
  currentStep = 0,
}: ProgressIndicatorProps) => {
  const t = useTranslations('progress');

  // 检测RTL语言支持
  const isRTL = typeof document !== 'undefined' && document.dir === 'rtl';

  // 边界情况处理：确保currentStep在有效范围内
  const clampedCurrentStep = Math.max(0, Math.min(currentStep, COUNT_TRIPLE));

  const steps: ProgressStep[] = [
    {
      key: 'planning',
      completed: clampedCurrentStep > 0 || currentStep >= COUNT_TRIPLE + 1,
      current: clampedCurrentStep === 0 && currentStep < COUNT_TRIPLE + 1,
    },
    {
      key: 'development',
      completed: clampedCurrentStep > 1 || currentStep >= COUNT_TRIPLE + 1,
      current: clampedCurrentStep === 1 && currentStep < COUNT_TRIPLE + 1,
    },
    {
      key: 'testing',
      completed: clampedCurrentStep > 2 || currentStep >= COUNT_TRIPLE + 1,
      current: clampedCurrentStep === 2 && currentStep < COUNT_TRIPLE + 1,
    },
    {
      key: 'launch',
      completed: clampedCurrentStep > 3 || currentStep >= COUNT_TRIPLE + 1,
      current: clampedCurrentStep === 3 && currentStep < COUNT_TRIPLE + 1,
    },
  ];

  return (
    <div
      className={cn('mx-auto w-full max-w-md responsive', className, {
        'rtl': isRTL,
      })}
      role="progressbar"
      aria-valuenow={currentStep}
      aria-valuemin={1}
      aria-valuemax={COUNT_TRIPLE + 1}
      aria-label={t('ariaLabel')}
    >
      <div className='mb-4 flex items-center justify-between'>
        {steps.map((step, index) => (
          <div
            key={step.key}
            className='flex flex-col items-center'
            data-step={index}
            data-current={step.current ? 'true' : 'false'}
            data-completed={step.completed ? 'true' : undefined}
            data-future={!step.completed && !step.current ? 'true' : undefined}
          >
            {/* 步骤圆圈 */}
            <button
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-all duration-300',
                {
                  'bg-primary text-primary-foreground': step.completed,
                  'bg-primary/20 text-primary border-primary animate-pulse border-2':
                    step.current,
                  'bg-muted text-muted-foreground':
                    !step.completed && !step.current,
                },
              )}
              role="button"
              aria-label={`${t(step.key)} - ${step.completed ? t('completed') : step.current ? t('current') : t('upcoming')}`}
              aria-current={step.current ? 'step' : undefined}
              tabIndex={0}
            >
              {step.completed ? (
                <svg
                  className='h-4 w-4'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                  data-testid={index === 0 ? "check-icon" : `check-icon-${index}`}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={COUNT_PAIR}
                    d='M5 13l4 4L19 7'
                  />
                </svg>
              ) : step.current && currentStep >= 0 ? (
                <svg
                  className='h-4 w-4'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                  data-testid='circle-icon'
                  aria-hidden="true"
                >
                  <circle
                    cx='12'
                    cy='12'
                    r='10'
                    strokeWidth={COUNT_PAIR}
                  />
                </svg>
              ) : (
                <span>{index + 1}</span>
              )}
            </button>

            {/* 步骤标签 */}
            <span
              className={cn(
                'mt-2 text-center text-xs transition-colors duration-300',
                {
                  'text-primary font-medium': step.current || step.completed,
                  'text-muted-foreground': !step.current && !step.completed,
                },
              )}
            >
              {t(step.key)}
            </span>
          </div>
        ))}
      </div>

      {/* 连接线 */}
      <div className='relative -mt-8 mb-4'>
        <div className='bg-muted absolute top-4 right-4 left-4 h-0.5'>
          <div
            className='bg-primary h-full transition-all duration-500 ease-out'
            style={{
              width: `${Math.max(0, (currentStep / COUNT_TRIPLE) * PERCENTAGE_FULL)}%`,
            }}
          />
        </div>
      </div>

      {/* 进度百分比 */}
      <div className='text-center'>
        <div className='text-primary text-2xl font-bold'>
          {Math.round((currentStep / COUNT_TRIPLE) * PERCENTAGE_FULL)}%
        </div>
        <div className='text-muted-foreground text-sm'>
          {currentStep >= COUNT_TRIPLE ? t('nearCompletion') : t('status')}
        </div>
      </div>
    </div>
  );
};

export const ProgressIndicator = React.memo(ProgressIndicatorComponent);
