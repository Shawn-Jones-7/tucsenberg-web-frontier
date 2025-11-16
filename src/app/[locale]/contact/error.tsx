'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import * as Sentry from '@/lib/sentry-client';
import { Button } from '@/components/ui/button';

interface RouteErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ContactRouteError({ error, reset }: RouteErrorProps) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className='flex min-h-[60vh] flex-col items-center justify-center bg-background px-4 py-16'>
      <div className='mx-auto flex w-full max-w-lg flex-col items-center gap-6 text-center'>
        <div className='space-y-3'>
          <h2 className='text-2xl font-semibold text-foreground'>
            联系表单暂时不可用
          </h2>
          <p className='text-sm leading-relaxed text-muted-foreground'>
            我们的团队会立即查看问题。您可以稍后重试提交，或者通过其他渠道与我们联系。
          </p>
        </div>
        <div className='flex flex-wrap justify-center gap-3'>
          <Button
            type='button'
            onClick={reset}
          >
            重试
          </Button>
          <Button
            asChild
            variant='outline'
          >
            <Link href='/'>返回首页</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
