'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { BelowTheFoldSkeleton } from '@/components/home/below-the-fold-skeleton';
import { ClientI18nProvider } from '@/components/i18n/client-i18n-provider';

// 移除 ssr: false 配置以启用服务端渲染，减少 CLS (Cumulative Layout Shift)
// SSR 可以确保首屏内容完整，避免客户端水合时的布局跳动
const TechStackSection = dynamic(() =>
  import('@/components/home/tech-stack-section').then(
    (m) => m.TechStackSection,
  ),
);
const ComponentShowcase = dynamic(() =>
  import('@/components/home/component-showcase').then(
    (m) => m.ComponentShowcase,
  ),
);
const ProjectOverview = dynamic(() =>
  import('@/components/home/project-overview').then((m) => m.ProjectOverview),
);
const CallToAction = dynamic(() =>
  import('@/components/home/call-to-action').then((m) => m.CallToAction),
);

export function BelowTheFoldClient({ locale }: { locale: 'en' | 'zh' }) {
  return (
    <Suspense fallback={<BelowTheFoldSkeleton />}>
      <ClientI18nProvider locale={locale}>
        <TechStackSection />
        <ComponentShowcase />
        <ProjectOverview />
        <CallToAction />
      </ClientI18nProvider>
    </Suspense>
  );
}
