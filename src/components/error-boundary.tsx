'use client';

import { Component, type ErrorInfo, type ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { logger } from '@/lib/logger';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ZERO } from '@/constants';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // 安全的错误日志记录
    this.logError(error, errorInfo);
  }

  private logError(error: Error, errorInfo: ErrorInfo) {
    // Dev-only console output; no-ops in production
    logger.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  override render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <ErrorFallback
          onReset={() => this.setState({ hasError: false })}
          {...(this.state.error && { error: this.state.error })}
        />
      );
    }

    return this.props.children;
  }
}

interface ErrorFallbackProps {
  onReset: () => void;
  error?: Error;
}

function ErrorFallback({ onReset, error: _error }: ErrorFallbackProps) {
  const t = useTranslations('common');

  return (
    <div className='flex min-h-screen items-center justify-center p-4'>
      <Card
        className='w-full max-w-md'
        data-testid='error-boundary-card'
      >
        <CardHeader
          className='text-center'
          data-testid='error-boundary-card-header'
        >
          <div className='mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10'>
            <span
              className='h-6 w-6 text-destructive'
              data-testid='alert-triangle-icon'
            >
              ⚠️
            </span>
          </div>
          <CardTitle
            className='text-destructive'
            data-testid='error-boundary-card-title'
          >
            {t('error')}
          </CardTitle>
          <CardDescription data-testid='error-boundary-card-description'>
            Something went wrong. Please try refreshing the page.
          </CardDescription>
        </CardHeader>
        <CardContent
          className='text-center'
          data-testid='error-boundary-card-content'
        >
          <Button
            onClick={onReset}
            variant='outline'
            className='gap-2'
            data-testid='error-boundary-button'
            tabIndex={ZERO}
          >
            <span
              className='h-4 w-4'
              data-testid='refresh-icon'
            >
              🔄
            </span>
            Try Again
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
