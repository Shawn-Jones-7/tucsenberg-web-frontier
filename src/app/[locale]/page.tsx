// Auto-deploy verification test: 2025-10-31T12:34:56Z

import { extractHeroMessages } from '@/lib/i18n/extract-hero-messages';
import { loadCriticalMessages } from '@/lib/load-messages';
import { BelowTheFoldClient } from '@/components/home/below-the-fold.client';
import { HeroSectionStatic } from '@/components/home/hero-section';
import { routing } from '@/i18n/routing';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

interface HomePageProps {
  params: Promise<{ locale: 'en' | 'zh' }>;
}

// Type for nested translation messages (non-recursive to satisfy TS checks)
type TranslationValue = string | Record<string, unknown>;
type TranslationMessages = Record<string, TranslationValue>;

/**
 * 加载首页 `home.hero` 文案。
 *
 * 当前将缓存责任下沉到 `loadCriticalMessages` 内部的 `unstable_cache`，
 * 这里不再叠加一层 "use cache"，避免在预渲染阶段出现嵌套缓存导致的
 * `USE_CACHE_TIMEOUT` 问题，同时仍然享受 externalized JSON 带来的性能收益。
 *
 * 约束：
 * - 仅依赖显式的 `locale` 参数和 externalized translation JSON；
 * - 不调用 headers()/cookies()/requestLocale() 等请求作用域 API，
 *   保证在预渲染和运行时行为一致、可缓存。
 */
async function getHomeHeroMessages(
  locale: 'en' | 'zh',
): Promise<TranslationMessages> {
  const messages = await loadCriticalMessages(locale);
  return extractHeroMessages(messages) as TranslationMessages;
}

export default async function Home({ params }: HomePageProps) {
  const { locale } = await params;

  // Load critical messages for the hero namespace via an explicit
  // data-fetch style helper that is implemented as a data-level
  // Cache Component ("use cache" + cacheLife('days')) and does not
  // depend on request-scoped i18n hooks.
  const heroNs = await getHomeHeroMessages(locale);

  // 实验开关：中文首帧系统字体 + 600 权重（A/B）
  const zhFast = process.env.NEXT_PUBLIC_FAST_LCP_ZH === '1' && locale === 'zh';

  return (
    <div
      className='min-h-screen bg-background text-foreground'
      data-fast-lcp-zh={zhFast ? '1' : undefined}
    >
      {/* LCP-critical: render statically from compile-time messages */}
      <HeroSectionStatic messages={heroNs} />

      {/* Below-the-fold: client boundary for interactive sections */}
      <BelowTheFoldClient />
    </div>
  );
}
