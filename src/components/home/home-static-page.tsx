import { Suspense } from 'react';
import nextDynamic from 'next/dynamic';
import { extractHeroMessages } from '@/lib/i18n/extract-hero-messages';
import { HeroSplitBlockStatic } from '@/components/blocks/hero/hero-split-block';
import TranslationsBoundary from '@/components/i18n/translations-boundary';

// Types aligned with page.tsx
type TranslationValue = string | Record<string, unknown>;
type TranslationMessages = Record<string, TranslationValue>;

// Dynamic imports use leaf module paths directly to ensure optimal code splitting
// Importing from barrel (@/components/blocks) risks chunk size bloat
const TechStackSection = nextDynamic(() =>
  import('@/components/blocks/tech/tech-tabs-block').then(
    (m) => m.TechTabsBlock,
  ),
);
const ComponentShowcase = nextDynamic(() =>
  import('@/components/home/component-showcase').then(
    (m) => m.ComponentShowcase,
  ),
);
const ProjectOverview = nextDynamic(() =>
  import('@/components/blocks/features/features-grid-block').then(
    (m) => m.FeaturesGridBlock,
  ),
);
const CallToAction = nextDynamic(() =>
  import('@/components/blocks/cta/cta-banner-block').then(
    (m) => m.CTABannerBlock,
  ),
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
      <HeroSplitBlockStatic messages={heroNs} />

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
