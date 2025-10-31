// Auto-deploy verification test: 2025-10-31T00:00:00Z

import { HeroSectionStatic } from '@/components/home/hero-section';
import TranslationsBoundary from '@/components/i18n/translations-boundary';
import { routing } from '@/i18n/routing';
import { extractHeroMessages } from '@/lib/i18n/extract-hero-messages';
import enMessages from '@messages/en.json';
import zhMessages from '@messages/zh.json';
import nextDynamic from 'next/dynamic';
import { Suspense } from 'react';

export const revalidate = 3600;
export const dynamic = 'force-static';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

// Defer below-the-fold sections to separate chunks
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

interface HomePageProps {
  params: Promise<{ locale: 'en' | 'zh' }>;
}

// Type for nested translation messages (non-recursive to satisfy TS checks)
type TranslationValue = string | Record<string, unknown>;
type TranslationMessages = Record<string, TranslationValue>;

export default async function Home({ params }: HomePageProps) {
  const { locale } = await params;
  const messagesFile = (locale === 'zh' ? zhMessages : enMessages) as Record<
    string,
    unknown
  >;
  const heroNs = extractHeroMessages(messagesFile) as TranslationMessages;

  // 实验开关：中文首帧系统字体 + 600 权重（A/B）
  const zhFast = process.env.NEXT_PUBLIC_FAST_LCP_ZH === '1' && locale === 'zh';

  return (
    <div
      className='bg-background text-foreground min-h-screen'
      data-fast-lcp-zh={zhFast ? '1' : undefined}
    >
      {/* LCP-critical: render statically from compile-time messages */}
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
