import { Suspense } from 'react';
import nextDynamic from 'next/dynamic';
import { extractHeroMessages } from '@/lib/i18n/extract-hero-messages';
import { HeroSectionStatic } from '@/components/home/hero-section';
import TranslationsBoundary from '@/components/i18n/translations-boundary';

// Types aligned with page.tsx
type TranslationValue = string | Record<string, unknown>;
type TranslationMessages = Record<string, TranslationValue>;

// Defer below-the-fold sections to separate chunks (same as page.tsx)
const TechStackSection = nextDynamic(() =>
  import('@/components/home/tech-stack-section').then(
    (m) => m.TechStackSection,
  ),
);
const ComponentShowcase = nextDynamic(() =>
  import('@/components/home/component-showcase').then(
    (m) => m.ComponentShowcase,
  ),
);
const ProjectOverview = nextDynamic(() =>
  import('@/components/home/project-overview').then((m) => m.ProjectOverview),
);
const CallToAction = nextDynamic(() =>
  import('@/components/home/call-to-action').then((m) => m.CallToAction),
);

export function HomeStatic({
  messages,
  locale = 'en',
}: {
  messages: Record<string, unknown>;
  locale?: 'en' | 'zh';
}) {
  // 从提供的静态 messages 中提取 home.hero 命名空间（与 page.tsx 保持一致）
  const heroNs = extractHeroMessages(
    messages as Record<string, unknown>,
  ) as TranslationMessages;

  // 实验开关：中文首帧系统字体 + 600 权重（A/B）
  const zhFast = process.env.NEXT_PUBLIC_FAST_LCP_ZH === '1' && locale === 'zh';

  return (
    <div
      className='min-h-screen bg-background text-foreground'
      data-fast-lcp-zh={zhFast ? '1' : undefined}
    >
      {/* LCP-critical: render statically from provided messages */}
      <HeroSectionStatic messages={heroNs} />

      {/* Below-the-fold: wrap with intl provider inside Suspense to avoid blocking LCP */}
      <Suspense fallback={null}>
        <TranslationsBoundary locale={locale}>
          <TechStackSection />
          <ComponentShowcase />
          <ProjectOverview />
          <CallToAction />
        </TranslationsBoundary>
      </Suspense>
    </div>
  );
}
