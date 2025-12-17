'use client';

import dynamic from 'next/dynamic';

const VercelNavigation = dynamic(
  () =>
    import('@/components/layout/vercel-navigation').then(
      (m) => m.VercelNavigation,
    ),
  { ssr: false },
);

export function VercelNavigationI18n() {
  return <VercelNavigation />;
}
