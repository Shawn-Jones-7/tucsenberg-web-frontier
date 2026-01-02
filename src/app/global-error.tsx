'use client';

import { useEffect } from 'react';
import { logger } from '@/lib/logger';
import { Button } from '@/components/ui/button';
import { routing } from '@/i18n/routing-config';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Static translations for global error page.
 * Global error boundary runs outside [locale] route, so we use static translations
 * with browser language detection as fallback.
 */
const translations = {
  en: {
    title: 'Something went wrong!',
    description:
      'We apologize for the inconvenience. An unexpected error has occurred.',
    tryAgain: 'Try again',
    goHome: 'Go to homepage',
    devDetails: 'Error Details (Development Only)',
  },
  zh: {
    title: '出错了！',
    description: '非常抱歉给您带来不便。发生了意外错误。',
    tryAgain: '重试',
    goHome: '返回首页',
    devDetails: '错误详情（仅开发环境）',
  },
} as const;

function getLocaleFromBrowser(): 'en' | 'zh' {
  if (typeof window === 'undefined')
    return routing.defaultLocale as 'en' | 'zh';

  const browserLang = navigator.language?.toLowerCase() || '';
  if (browserLang.startsWith('zh')) return 'zh';
  return 'en';
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  const locale = getLocaleFromBrowser();
  // Safe: locale is strictly typed as 'en' | 'zh' from getLocaleFromBrowser()
  // eslint-disable-next-line security/detect-object-injection -- locale is a controlled enum value
  const t = translations[locale];

  useEffect(() => {
    logger.error('Global error caught', error);
  }, [error]);

  return (
    <html lang={locale}>
      <body>
        <div className='flex min-h-screen flex-col items-center justify-center bg-background px-4'>
          <div className='mx-auto max-w-md text-center'>
            <h1 className='mb-4 text-2xl font-bold text-foreground'>
              {t.title}
            </h1>
            <p className='mb-6 text-muted-foreground'>{t.description}</p>
            {process.env.NODE_ENV === 'development' && (
              <details className='mb-6 text-left'>
                <summary className='cursor-pointer text-sm font-medium'>
                  {t.devDetails}
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
                {t.tryAgain}
              </Button>
              <Button
                variant='outline'
                onClick={() => {
                  window.location.href = `/${locale}`;
                }}
                className='w-full'
              >
                {t.goHome}
              </Button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
