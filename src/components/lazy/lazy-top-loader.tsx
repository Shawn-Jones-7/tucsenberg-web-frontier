'use client';

import dynamic from 'next/dynamic';
import { COUNT_1600 } from '@/constants';
import { useIdleRender } from '@/hooks/use-idle-render';

const NextTopLoader = dynamic(() => import('nextjs-toploader'), {
  ssr: false,
  loading: () => null,
});

interface LazyTopLoaderProps {
  nonce?: string | undefined;
}

export function LazyTopLoader({ nonce }: LazyTopLoaderProps) {
  const shouldRender = useIdleRender();
  if (!shouldRender) return null;

  return (
    <NextTopLoader
      color='var(--primary)'
      height={2}
      showSpinner={false}
      easing='ease-in-out'
      speed={200}
      shadow='0 0 15px var(--primary),0 0 8px var(--primary)'
      zIndex={COUNT_1600}
      {...(nonce && { nonce })}
    />
  );
}
