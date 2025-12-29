'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { logger } from '@/lib/logger';
import { Button } from '@/components/ui/button';

interface RouteErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ProductsRouteError({ error, reset }: RouteErrorProps) {
  useEffect(() => {
    logger.error('Products route error', error);
  }, [error]);

  return (
    <div className='flex min-h-[60vh] flex-col items-center justify-center bg-background px-4 py-16'>
      <div className='mx-auto flex w-full max-w-lg flex-col items-center gap-6 text-center'>
        <div className='space-y-3'>
          <h2 className='text-2xl font-semibold text-foreground'>
            产品信息加载失败
          </h2>
          <p className='text-sm leading-relaxed text-muted-foreground'>
            我们未能加载产品详情。请点击重试或返回首页浏览其他内容。
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
