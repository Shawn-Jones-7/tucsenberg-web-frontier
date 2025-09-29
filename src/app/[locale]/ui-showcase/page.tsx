import { Suspense } from 'react';
import type { Metadata } from 'next';
import { UIShowcaseDynamic } from '@/components/examples/ui-showcase-dynamic';
import { UIShowcaseFallback } from '@/components/examples/ui-showcase-fallback';
import { UIShowcaseStatic } from '@/components/examples/ui-showcase-static';

// PPR 需要 Next.js canary 版本，暂时禁用
// export const experimental_ppr = true;

export const revalidate = 86400;

export const metadata: Metadata = {
  title: 'UI Enhancement Components Showcase - PPR Demo',
  description:
    'Demonstration of UI enhancement components with Next.js 15 Partial Prerendering',
};

export default function UIShowcasePage() {
  return (
    <div className='container mx-auto space-y-8 py-8'>
      {/* 静态内容 - 在构建时预渲染 */}
      <UIShowcaseStatic />

      {/* 动态内容 - 客户端渲染，使用 Suspense 边界 */}
      <Suspense fallback={<UIShowcaseFallback />}>
        <UIShowcaseDynamic />
      </Suspense>
    </div>
  );
}
