/**
 * 内容统计函数
 */

import { ZERO } from "@/constants/magic-numbers";
import { getAllPages, getAllPosts } from '@/lib/content-query/queries';
import { getContentConfig } from '@/lib/content-utils';
import type { ContentStats, Locale } from '@/types/content';

/**
 * Get content statistics
 */
export function getContentStats(): ContentStats {
  const config = getContentConfig();
  const stats: ContentStats = {
    totalPosts: ZERO,
    totalPages: ZERO,
    postsByLocale: {} as Record<Locale, number>,
    pagesByLocale: {} as Record<Locale, number>,
    totalTags: ZERO,
    totalCategories: ZERO,
    lastUpdated: new Date().toISOString(),
  };

  // Count posts by locale
  for (const locale of config.supportedLocales) {
    const posts = getAllPosts(locale);
    const pages = getAllPages(locale);

    // Use type-safe property access with explicit validation
    if (locale === 'en' || locale === 'zh') {
      // Safe property assignment for known locales
      if (locale === 'en') {
        stats.postsByLocale.en = posts.length;
        stats.pagesByLocale.en = pages.length;
      } else {
        stats.postsByLocale.zh = posts.length;
        stats.pagesByLocale.zh = pages.length;
      }
    }
    stats.totalPosts += posts.length;
    stats.totalPages += pages.length;
  }

  return stats;
}
