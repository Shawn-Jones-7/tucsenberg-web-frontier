'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import {
  COUNT_PAIR,
  COUNT_TRIPLE,
  ONE,
  PERCENTAGE_FULL,
  ZERO,
} from '@/constants';

interface ProgressStep {
  key: 'planning' | 'development' | 'testing' | 'launch';
  completed: boolean;
  current: boolean;
}

interface ProgressIndicatorProps {
  className?: string;
  currentStep?: number; // 0-3
}

const ProgressIndicatorComponent = ({
  className,
  currentStep = ONE,
}: ProgressIndicatorProps) => {
  const t = useTranslations('underConstruction.progress');

  // 步骤索引常量
  const PLANNING_STEP = ZERO;
  const DEVELOPMENT_STEP = ONE;
  const TESTING_STEP = COUNT_PAIR;
  const LAUNCH_STEP = COUNT_TRIPLE;

  const steps: ProgressStep[] = [
    {
      key: 'planning',
      completed: currentStep > PLANNING_STEP,
      current: currentStep === PLANNING_STEP,
    },
    {
      key: 'development',
      completed: currentStep > DEVELOPMENT_STEP,
      current: currentStep === DEVELOPMENT_STEP,
    },
    {
      key: 'testing',
      completed: currentStep > TESTING_STEP,
      current: currentStep === TESTING_STEP,
    },
    {
      key: 'launch',
      completed: currentStep > LAUNCH_STEP,
      current: currentStep === LAUNCH_STEP,
    },
  ];

  return (
    <div className={cn('mx-auto w-full max-w-md', className)}>
      <div className='mb-4 flex items-center justify-between'>
        {steps.map((step, index) => (
          <div
            key={step.key}
            className='flex flex-col items-center'
          >
            {/* 步骤圆圈 */}
            <div
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
            >
              {step.completed ? (
                <svg
                  className='h-4 w-4'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={COUNT_PAIR}
                    d='M5 13l4 4L19 7'
                  />
                </svg>
              ) : (
                <span>{index + ONE}</span>
              )}
            </div>

            {/* 步骤标签 */}
            <span
              className={cn(
                'mt-2 text-center text-xs transition-colors duration-300',
                {
                  'text-primary font-medium': step.completed || step.current,
                  'text-muted-foreground': !step.completed && !step.current,
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
              width: `${(currentStep / (steps.length - ONE)) * PERCENTAGE_FULL}%`,
            }}
          />
        </div>
      </div>

      {/* 进度百分比 */}
      <div className='text-center'>
        <div className='text-primary text-2xl font-bold'>
          {Math.round((currentStep / (steps.length - ONE)) * PERCENTAGE_FULL)}%
        </div>
        <div className='text-muted-foreground text-sm'>
          {currentStep < steps.length - ONE ? t('status') : t('nearCompletion')}
        </div>
      </div>
    </div>
  );
};

export const ProgressIndicator = React.memo(ProgressIndicatorComponent);
