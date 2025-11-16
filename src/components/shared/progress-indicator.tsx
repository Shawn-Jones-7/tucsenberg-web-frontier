'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { COUNT_PAIR, COUNT_TRIPLE, PERCENTAGE_FULL } from '@/constants';

interface ProgressStep {
  key: 'planning' | 'development' | 'testing' | 'launch';
  completed: boolean;
  current: boolean;
}

interface ProgressIndicatorProps {
  className?: string;
  currentStep?: number; // 0-3 (0=planning, 1=development, 2=testing, 3=launch)
}

function createProgressSteps(currentStep: number): ProgressStep[] {
  return [
    {
      key: 'planning',
      completed: currentStep > 0,
      current: currentStep === 0,
    },
    {
      key: 'development',
      completed: currentStep > 1,
      current: currentStep === 1,
    },
    {
      key: 'testing',
      completed: currentStep > 2,
      current: currentStep === 2,
    },
    {
      key: 'launch',
      completed: currentStep > 3,
      current: currentStep === 3,
    },
  ];
}

function ProgressStepItem({
  step,
  index,
  t,
}: {
  step: ProgressStep;
  index: number;
  t: (key: string) => string;
}) {
  return (
    <div
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
            'animate-pulse border-2 border-primary bg-primary/20 text-primary':
              step.current,
            'bg-muted text-muted-foreground': !step.completed && !step.current,
          },
        )}
        role='button'
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
            data-testid={index === 0 ? 'check-icon' : `check-icon-${index}`}
            aria-hidden='true'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={COUNT_PAIR}
              d='M5 13l4 4L19 7'
            />
          </svg>
        ) : step.current ? (
          <svg
            className='h-4 w-4'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
            data-testid='circle-icon'
            aria-hidden='true'
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
            'font-medium text-primary': step.current || step.completed,
            'text-muted-foreground': !step.current && !step.completed,
          },
        )}
      >
        {t(step.key)}
      </span>
    </div>
  );
}

const ProgressIndicatorComponent = ({
  className,
  currentStep = 0,
}: ProgressIndicatorProps) => {
  const t = useTranslations('progress');
  const isRTL = typeof document !== 'undefined' && document.dir === 'rtl';
  const steps = createProgressSteps(currentStep);

  return (
    <div
      className={cn('responsive mx-auto w-full max-w-md', className, {
        rtl: isRTL,
      })}
      role='progressbar'
      aria-valuenow={currentStep}
      aria-valuemin={1}
      aria-valuemax={COUNT_TRIPLE + 1}
      aria-label={t('ariaLabel')}
    >
      <div className='mb-4 flex items-center justify-between'>
        {steps.map((step, index) => (
          <ProgressStepItem
            key={step.key}
            step={step}
            index={index}
            t={t}
          />
        ))}
      </div>

      {/* 连接线 */}
      <div className='relative -mt-8 mb-4'>
        <div className='absolute left-4 right-4 top-4 h-0.5 bg-muted'>
          <div
            className='h-full bg-primary transition-all duration-500 ease-out'
            style={{
              width: `${Math.max(0, (currentStep / COUNT_TRIPLE) * PERCENTAGE_FULL)}%`,
            }}
          />
        </div>
      </div>

      {/* 进度百分比 */}
      <div className='text-center'>
        <div className='text-2xl font-bold text-primary'>
          {Math.round((currentStep / COUNT_TRIPLE) * PERCENTAGE_FULL)}%
        </div>
        <div className='text-sm text-muted-foreground'>
          {currentStep >= COUNT_TRIPLE ? t('nearCompletion') : t('status')}
        </div>
      </div>
    </div>
  );
};

export const ProgressIndicator = React.memo(ProgressIndicatorComponent);
