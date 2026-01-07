'use client';

import dynamic from 'next/dynamic';
import { useIdleRender } from '@/hooks/use-idle-render';

const Toaster = dynamic(
  () => import('@/components/ui/toaster').then((mod) => mod.Toaster),
  { ssr: false, loading: () => null },
);

export function LazyToaster() {
  const shouldRender = useIdleRender();
  if (!shouldRender) return null;
  return <Toaster />;
}
