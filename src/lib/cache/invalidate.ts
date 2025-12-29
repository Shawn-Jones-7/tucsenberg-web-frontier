/**
 * Cache Invalidation Utilities
 *
 * Provides utilities for selective cache invalidation using Next.js 16 revalidateTag().
 * Designed to be called from server actions, API routes, or build scripts.
 *
 * Note: In Next.js 16, revalidateTag requires a second 'profile' parameter.
 * We use 'max' for stale-while-revalidate semantics (recommended).
 *
 * @see openspec/changes/p1-cache-tag-invalidation/proposal.md
 */

import { revalidatePath, revalidateTag } from 'next/cache';
import type { Locale } from '@/types/content.types';
import {
  CACHE_DOMAINS,
  cacheTags,
  contentTags,
  i18nTags,
  productTags,
} from '@/lib/cache/cache-tags';
import { logger } from '@/lib/logger';

/**
 * Default cache profile for revalidation.
 * 'max' uses stale-while-revalidate semantics - stale content is served
 * while fresh content is fetched in the background.
 */
const DEFAULT_REVALIDATE_PROFILE = 'max' as const;

/**
 * Result of an invalidation operation.
 */
interface InvalidationResult {
  success: boolean;
  invalidatedTags: string[];
  errors: string[];
}

/**
 * Invalidate multiple cache tags.
 * Uses 'max' profile for stale-while-revalidate behavior.
 */
function invalidateTags(tags: string[]): InvalidationResult {
  const invalidatedTags: string[] = [];
  const errors: string[] = [];

  for (const tag of tags) {
    try {
      revalidateTag(tag, DEFAULT_REVALIDATE_PROFILE);
      invalidatedTags.push(tag);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      errors.push(`Failed to invalidate tag "${tag}": ${message}`);
      logger.error(`Cache invalidation failed for tag: ${tag}`, error);
    }
  }

  return {
    success: errors.length === 0,
    invalidatedTags,
    errors,
  };
}

/**
 * i18n invalidation utilities.
 */
export const invalidateI18n = {
  /** Invalidate critical messages for a locale */
  critical(locale: Locale): InvalidationResult {
    return invalidateTags([i18nTags.critical(locale)]);
  },

  /** Invalidate deferred messages for a locale */
  deferred(locale: Locale): InvalidationResult {
    return invalidateTags([i18nTags.deferred(locale)]);
  },

  /** Invalidate all i18n messages for a locale */
  locale(locale: Locale): InvalidationResult {
    return invalidateTags(i18nTags.forLocale(locale));
  },

  /** Invalidate all i18n caches */
  all(): InvalidationResult {
    return invalidateTags([i18nTags.all()]);
  },
};

/**
 * Content invalidation utilities.
 */
export const invalidateContent = {
  /** Invalidate a specific blog post */
  blogPost(slug: string, locale: Locale): InvalidationResult {
    return invalidateTags(contentTags.forBlogPost(slug, locale));
  },

  /** Invalidate blog list for a locale */
  blogList(locale: Locale): InvalidationResult {
    return invalidateTags([contentTags.blogList(locale)]);
  },

  /** Invalidate a specific page */
  page(slug: string, locale: Locale): InvalidationResult {
    return invalidateTags([contentTags.page(slug, locale)]);
  },

  /** Invalidate all content for a locale */
  locale(locale: Locale): InvalidationResult {
    return invalidateTags(contentTags.forLocale(locale));
  },
};

/**
 * Product invalidation utilities.
 */
export const invalidateProduct = {
  /** Invalidate a specific product */
  detail(slug: string, locale: Locale, category?: string): InvalidationResult {
    return invalidateTags(productTags.forProduct(slug, locale, category));
  },

  /** Invalidate product list */
  list(locale: Locale, category?: string): InvalidationResult {
    return invalidateTags([productTags.list(locale, category)]);
  },

  /** Invalidate product categories */
  categories(locale: Locale): InvalidationResult {
    return invalidateTags([productTags.categories(locale)]);
  },

  /** Invalidate featured products */
  featured(locale: Locale): InvalidationResult {
    return invalidateTags([productTags.featured(locale)]);
  },

  /** Invalidate all products for a locale */
  locale(locale: Locale): InvalidationResult {
    return invalidateTags(productTags.forLocale(locale));
  },
};

/**
 * Invalidate all caches for a specific locale.
 * Useful after bulk content updates or translation changes.
 */
export function invalidateLocale(locale: Locale): InvalidationResult {
  const tags = [
    ...i18nTags.forLocale(locale),
    ...contentTags.forLocale(locale),
    ...productTags.forLocale(locale),
  ];

  return invalidateTags(tags);
}

/**
 * Invalidate all caches by domain.
 */
export function invalidateDomain(
  domain: (typeof CACHE_DOMAINS)[keyof typeof CACHE_DOMAINS],
): InvalidationResult {
  const domainTag = `${domain}:`;
  const tags: string[] = [];

  switch (domain) {
    case CACHE_DOMAINS.I18N:
      tags.push(i18nTags.all());
      break;
    case CACHE_DOMAINS.CONTENT:
      tags.push(contentTags.blogList('en'), contentTags.blogList('zh'));
      break;
    case CACHE_DOMAINS.PRODUCT:
      tags.push(...productTags.forLocale('en'), ...productTags.forLocale('zh'));
      break;
    default:
      logger.warn(`Unknown cache domain: ${domainTag}`);
  }

  return invalidateTags(tags);
}

/**
 * Invalidate a path (for ISR pages).
 * Use when you need to invalidate specific URL paths rather than data tags.
 */
export function invalidateCachePath(
  path: string,
  type: 'page' | 'layout' = 'page',
): void {
  try {
    revalidatePath(path, type);
    logger.info(`Invalidated path: ${path} (${type})`);
  } catch (error) {
    logger.error(`Failed to invalidate path: ${path}`, error);
  }
}

/**
 * Consolidated invalidation export for convenience.
 */
export const invalidate = {
  i18n: invalidateI18n,
  content: invalidateContent,
  product: invalidateProduct,
  locale: invalidateLocale,
  domain: invalidateDomain,
  path: invalidateCachePath,
  tags: invalidateTags,
} as const;

// Re-export cache tags for convenience
export { cacheTags };
