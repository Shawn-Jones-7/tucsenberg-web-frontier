/**
 * Cache Tag System for Next.js 16 Cache Components
 *
 * Provides consistent tag naming and generation for selective cache invalidation.
 * Tags follow the schema: `domain:entity:identifier[:locale]`
 *
 * @see openspec/changes/p1-cache-tag-invalidation/proposal.md
 */

import type { Locale } from '@/types/content.types';

/**
 * Valid cache tag domains.
 * Each domain represents a distinct category of cached data.
 */
export const CACHE_DOMAINS = {
  /** i18n translation messages */
  I18N: 'i18n',
  /** Content (blog posts, pages) */
  CONTENT: 'content',
  /** Product data */
  PRODUCT: 'product',
  /** SEO metadata */
  SEO: 'seo',
} as const;

export type CacheDomain = (typeof CACHE_DOMAINS)[keyof typeof CACHE_DOMAINS];

/**
 * Entity types within each domain.
 */
export const CACHE_ENTITIES = {
  /** i18n entities */
  I18N: {
    CRITICAL: 'critical',
    DEFERRED: 'deferred',
    ALL: 'all',
  },
  /** Content entities */
  CONTENT: {
    BLOG: 'blog',
    PAGE: 'page',
    LIST: 'list',
  },
  /** Product entities */
  PRODUCT: {
    DETAIL: 'detail',
    LIST: 'list',
    CATEGORY: 'category',
    FEATURED: 'featured',
  },
  /** SEO entities */
  SEO: {
    METADATA: 'metadata',
    SITEMAP: 'sitemap',
  },
} as const;

/**
 * Options for building a cache tag.
 */
interface BuildTagOptions {
  domain: CacheDomain;
  entity: string;
  identifier?: string;
  locale?: Locale;
}

/**
 * Build a cache tag string from components.
 * Format: `domain:entity:identifier[:locale]`
 */
function buildTag(options: BuildTagOptions): string {
  const { domain, entity, identifier, locale } = options;
  const parts = [domain, entity];

  if (identifier) {
    parts.push(identifier);
  }

  if (locale) {
    parts.push(locale);
  }

  return parts.join(':');
}

/**
 * i18n cache tag generators.
 */
export const i18nTags = {
  /** Tag for critical messages of a locale */
  critical(locale: Locale): string {
    return buildTag({
      domain: CACHE_DOMAINS.I18N,
      entity: CACHE_ENTITIES.I18N.CRITICAL,
      identifier: locale,
    });
  },

  /** Tag for deferred messages of a locale */
  deferred(locale: Locale): string {
    return buildTag({
      domain: CACHE_DOMAINS.I18N,
      entity: CACHE_ENTITIES.I18N.DEFERRED,
      identifier: locale,
    });
  },

  /** Tag for all i18n messages (invalidates entire i18n cache) */
  all(): string {
    return buildTag({
      domain: CACHE_DOMAINS.I18N,
      entity: CACHE_ENTITIES.I18N.ALL,
    });
  },

  /** All tags for a specific locale */
  forLocale(locale: Locale): string[] {
    return [this.critical(locale), this.deferred(locale), this.all()];
  },
};

/**
 * Content cache tag generators (blog posts, pages).
 */
export const contentTags = {
  /** Tag for a specific blog post */
  blogPost(slug: string, locale: Locale): string {
    return buildTag({
      domain: CACHE_DOMAINS.CONTENT,
      entity: CACHE_ENTITIES.CONTENT.BLOG,
      identifier: slug,
      locale,
    });
  },

  /** Tag for blog list of a locale */
  blogList(locale: Locale): string {
    return buildTag({
      domain: CACHE_DOMAINS.CONTENT,
      entity: CACHE_ENTITIES.CONTENT.LIST,
      identifier: 'blog',
      locale,
    });
  },

  /** Tag for a specific page */
  page(slug: string, locale: Locale): string {
    return buildTag({
      domain: CACHE_DOMAINS.CONTENT,
      entity: CACHE_ENTITIES.CONTENT.PAGE,
      identifier: slug,
      locale,
    });
  },

  /** All tags for a blog post (includes list tags for cascading invalidation) */
  forBlogPost(slug: string, locale: Locale): string[] {
    return [this.blogPost(slug, locale), this.blogList(locale)];
  },

  /** All content tags for a locale */
  forLocale(locale: Locale): string[] {
    return [this.blogList(locale)];
  },
};

/**
 * Product cache tag generators.
 */
export const productTags = {
  /** Tag for a specific product detail */
  detail(slug: string, locale: Locale): string {
    return buildTag({
      domain: CACHE_DOMAINS.PRODUCT,
      entity: CACHE_ENTITIES.PRODUCT.DETAIL,
      identifier: slug,
      locale,
    });
  },

  /** Tag for product list */
  list(locale: Locale, category?: string): string {
    const identifier = category ?? 'all';
    return buildTag({
      domain: CACHE_DOMAINS.PRODUCT,
      entity: CACHE_ENTITIES.PRODUCT.LIST,
      identifier,
      locale,
    });
  },

  /** Tag for product categories */
  categories(locale: Locale): string {
    return buildTag({
      domain: CACHE_DOMAINS.PRODUCT,
      entity: CACHE_ENTITIES.PRODUCT.CATEGORY,
      identifier: locale,
    });
  },

  /** Tag for featured products */
  featured(locale: Locale): string {
    return buildTag({
      domain: CACHE_DOMAINS.PRODUCT,
      entity: CACHE_ENTITIES.PRODUCT.FEATURED,
      identifier: locale,
    });
  },

  /** All tags for a product (includes list tags for cascading invalidation) */
  forProduct(slug: string, locale: Locale, category?: string): string[] {
    const tags = [
      this.detail(slug, locale),
      this.list(locale),
      this.featured(locale),
    ];

    if (category) {
      tags.push(this.list(locale, category));
    }

    return tags;
  },

  /** All product tags for a locale */
  forLocale(locale: Locale): string[] {
    return [this.list(locale), this.categories(locale), this.featured(locale)];
  },
};

/**
 * SEO cache tag generators.
 */
export const seoTags = {
  /** Tag for SEO metadata */
  metadata(path: string, locale: Locale): string {
    return buildTag({
      domain: CACHE_DOMAINS.SEO,
      entity: CACHE_ENTITIES.SEO.METADATA,
      identifier: path,
      locale,
    });
  },

  /** Tag for sitemap */
  sitemap(locale?: Locale): string {
    if (locale) {
      return buildTag({
        domain: CACHE_DOMAINS.SEO,
        entity: CACHE_ENTITIES.SEO.SITEMAP,
        identifier: locale,
      });
    }
    return buildTag({
      domain: CACHE_DOMAINS.SEO,
      entity: CACHE_ENTITIES.SEO.SITEMAP,
    });
  },
};

/**
 * Consolidated cache tags export for convenience.
 */
export const cacheTags = {
  i18n: i18nTags,
  content: contentTags,
  product: productTags,
  seo: seoTags,
} as const;
