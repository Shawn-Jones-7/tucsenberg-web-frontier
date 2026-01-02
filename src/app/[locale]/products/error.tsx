'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { logger } from '@/lib/logger';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/routing';

interface RouteErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ProductsRouteError({ error, reset }: RouteErrorProps) {
  const t = useTranslations('errors.products');

  useEffect(() => {
    logger.error('Products route error', error);
  }, [error]);

  return (
    <div className='flex min-h-[60vh] flex-col items-center justify-center bg-background px-4 py-16'>
      <div className='mx-auto flex w-full max-w-lg flex-col items-center gap-6 text-center'>
        <div className='space-y-3'>
          <h2 className='text-2xl font-semibold text-foreground'>
            {t('title')}
          </h2>
          <p className='text-sm leading-relaxed text-muted-foreground'>
            {t('description')}
          </p>
        </div>
        <div className='flex flex-wrap justify-center gap-3'>
          <Button
            type='button'
            onClick={reset}
          >
            {t('tryAgain')}
          </Button>
          <Button
            asChild
            variant='outline'
          >
            <Link href='/'>{t('goHome')}</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
