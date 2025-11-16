// Auto-deploy verification test: 2025-10-31T12:34:56Z

import { extractHeroMessages } from '@/lib/i18n/extract-hero-messages';
import { loadCriticalMessages } from '@/lib/load-messages';
import { BelowTheFoldClient } from '@/components/home/below-the-fold.client';
import { HeroSectionStatic } from '@/components/home/hero-section';
import { routing } from '@/i18n/routing';

export const revalidate = 3600;
export const dynamic = 'force-static';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

interface HomePageProps {
  params: Promise<{ locale: 'en' | 'zh' }>;
}

// Type for nested translation messages (non-recursive to satisfy TS checks)
type TranslationValue = string | Record<string, unknown>;
type TranslationMessages = Record<string, TranslationValue>;

export default async function Home({ params }: HomePageProps) {
  const { locale } = await params;

  // Load critical messages dynamically from externalized files
  const messages = await loadCriticalMessages(locale);
  const heroNs = extractHeroMessages(messages) as TranslationMessages;

  // 实验开关：中文首帧系统字体 + 600 权重（A/B）
  const zhFast = process.env.NEXT_PUBLIC_FAST_LCP_ZH === '1' && locale === 'zh';

  return (
    <div
      className='min-h-screen bg-background text-foreground'
      data-fast-lcp-zh={zhFast ? '1' : undefined}
    >
      {/* LCP-critical: render statically from compile-time messages */}
      <HeroSectionStatic messages={heroNs} />

      {/* Below-the-fold: client boundary with scoped i18n to keep vendors slim */}
      <BelowTheFoldClient locale={locale} />
    </div>
  );
}
