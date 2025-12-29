'use client';

import { useEffect } from 'react';
import { logger } from '@/lib/logger';
import { Button } from '@/components/ui/button';
import { routing } from '@/i18n/routing-config';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    logger.error('Global error caught', error);
  }, [error]);

  return (
    <html lang={routing.defaultLocale}>
      <body>
        <div className='flex min-h-screen flex-col items-center justify-center bg-background px-4'>
          <div className='mx-auto max-w-md text-center'>
            <h1 className='mb-4 text-2xl font-bold text-foreground'>
              Something went wrong!
            </h1>
            <p className='mb-6 text-muted-foreground'>
              We apologize for the inconvenience. An unexpected error has
              occurred.
            </p>
            {process.env.NODE_ENV === 'development' && (
              <details className='mb-6 text-left'>
                <summary className='cursor-pointer text-sm font-medium'>
                  Error Details (Development Only)
                </summary>
                <pre className='mt-2 overflow-auto rounded bg-muted p-2 text-xs'>
                  {error.message}
                  {error.stack && (
                    <>
                      {'\n\n'}
                      {error.stack}
                    </>
                  )}
                </pre>
              </details>
            )}
            <div className='space-y-4'>
              <Button
                onClick={reset}
                className='w-full'
              >
                Try again
              </Button>
              <Button
                variant='outline'
                onClick={() => {
                  window.location.href = '/';
                }}
                className='w-full'
              >
                Go to homepage
              </Button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
