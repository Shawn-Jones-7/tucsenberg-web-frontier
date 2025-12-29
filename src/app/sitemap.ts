import type { MetadataRoute } from 'next';
import type { Locale, PostSummary, ProductSummary } from '@/types/content.types';
import { getAllPostsCached } from '@/lib/content/blog';
import { getAllProductsCached } from '@/lib/content/products';
import {
  getContentLastModified,
  getProductLastModified,
  getStaticPageLastModified,
  type StaticPageLastModConfig,
} from '@/lib/sitemap-utils';
import { SITE_CONFIG } from '@/config/paths';
import { routing } from '@/i18n/routing';

// Base URL for the site - uses centralized SITE_CONFIG for consistency
const BASE_URL = SITE_CONFIG.baseUrl;

// Static pages that exist in all locales
const STATIC_PAGES = [
  '',
  '/about',
  '/contact',
  '/products',
  '/blog',
  '/faq',
  '/privacy',
  '/terms',
] as const;

// Change frequency mapping for different page types
type ChangeFrequency =
  | 'always'
  | 'hourly'
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'yearly'
  | 'never';

interface PageConfig {
  changeFrequency: ChangeFrequency;
  priority: number;
}

// Page config lookup using Map for security
const PAGE_CONFIG_MAP = new Map<string, PageConfig>([
  ['', { changeFrequency: 'daily', priority: 1.0 }],
  ['/about', { changeFrequency: 'monthly', priority: 0.8 }],
  ['/contact', { changeFrequency: 'monthly', priority: 0.8 }],
  ['/products', { changeFrequency: 'weekly', priority: 0.9 }],
  ['/blog', { changeFrequency: 'weekly', priority: 0.7 }],
  ['/faq', { changeFrequency: 'monthly', priority: 0.6 }],
  ['/privacy', { changeFrequency: 'monthly', priority: 0.7 }],
  ['product', { changeFrequency: 'weekly', priority: 0.8 }],
  ['blogPost', { changeFrequency: 'monthly', priority: 0.6 }],
]);

const DEFAULT_CONFIG: PageConfig = {
  changeFrequency: 'weekly',
  priority: 0.5,
};

// Static page last modified dates configuration
// Update these dates when static page content changes significantly
const STATIC_PAGE_LASTMOD: StaticPageLastModConfig = new Map([
  // Homepage - updated frequently
  ['', new Date('2024-12-01T00:00:00Z')],
  // About page - rarely changes
  ['/about', new Date('2024-06-01T00:00:00Z')],
  // Contact page - rarely changes
  ['/contact', new Date('2024-06-01T00:00:00Z')],
  // Products listing - updated when products change
  ['/products', new Date('2024-11-01T00:00:00Z')],
  // Blog listing - updated when posts change
  ['/blog', new Date('2024-11-01T00:00:00Z')],
  // FAQ - occasionally updated
  ['/faq', new Date('2024-09-01T00:00:00Z')],
  // Legal pages - updated when terms change
  ['/privacy', new Date('2024-06-01T00:00:00Z')],
  ['/terms', new Date('2024-06-01T00:00:00Z')],
]);

// Helper to get page config
function getPageConfig(path: string): PageConfig {
  return PAGE_CONFIG_MAP.get(path) ?? DEFAULT_CONFIG;
}

// Build alternate languages object for a URL path
function buildAlternateLanguages(path: string): Record<string, string> {
  const entries = routing.locales.map((locale) => [
    locale,
    `${BASE_URL}/${locale}${path}`,
  ]);
  // x-default 指向默认语言版本，帮助搜索引擎识别语言选择器页面
  entries.push(['x-default', `${BASE_URL}/${routing.defaultLocale}${path}`]);
  return Object.fromEntries(entries);
}

interface SitemapEntryParams {
  url: string;
  lastModified: Date;
  config: PageConfig;
  alternates: Record<string, string>;
}

// Generate a single sitemap entry
function createSitemapEntry(
  params: SitemapEntryParams,
): MetadataRoute.Sitemap[number] {
  return {
    url: params.url,
    lastModified: params.lastModified,
    changeFrequency: params.config.changeFrequency,
    priority: params.config.priority,
    alternates: {
      languages: params.alternates,
    },
  };
}

// Generate static page entries for all locales
function generateStaticPageEntries(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of routing.locales) {
    for (const page of STATIC_PAGES) {
      const config = getPageConfig(page);
      const url = `${BASE_URL}/${locale}${page}`;
      const alternates = buildAlternateLanguages(page);
      const lastModified = getStaticPageLastModified(page, STATIC_PAGE_LASTMOD);

      entries.push(
        createSitemapEntry({ url, lastModified, config, alternates }),
      );
    }
  }

  return entries;
}

// Build alternate languages for a product across locales
function buildProductAlternates(
  slug: string,
  currentLocale: string,
  allProductsByLocale: Map<string, ProductSummary[]>,
): Record<string, string> {
  const productPath = `/products/${slug}`;

  const entries = routing.locales
    .filter((locale) => {
      const products = allProductsByLocale.get(locale);
      if (products === undefined) return false;
      return locale === currentLocale || products.some((p) => p.slug === slug);
    })
    .map((locale) => [locale, `${BASE_URL}/${locale}${productPath}`]);

  // x-default 指向默认语言版本
  const defaultLocaleProducts = allProductsByLocale.get(routing.defaultLocale);
  if (defaultLocaleProducts?.some((p) => p.slug === slug)) {
    entries.push([
      'x-default',
      `${BASE_URL}/${routing.defaultLocale}${productPath}`,
    ]);
  }

  return Object.fromEntries(entries);
}

// Fetch all products for all locales
async function fetchAllProductsByLocale(): Promise<
  Map<string, ProductSummary[]>
> {
  const productsByLocale = new Map<string, ProductSummary[]>();

  for (const locale of routing.locales) {
    try {
      const products = await getAllProductsCached(locale as Locale);
      productsByLocale.set(locale, products);
    } catch {
      productsByLocale.set(locale, []);
    }
  }

  return productsByLocale;
}

// Generate product page entries for all locales
async function generateProductEntries(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];
  const config = getPageConfig('product');
  const allProductsByLocale = await fetchAllProductsByLocale();

  // Track processed product slugs to avoid duplicates
  const processedSlugs = new Set<string>();

  for (const locale of routing.locales) {
    const products = allProductsByLocale.get(locale);
    if (products === undefined) continue;

    for (const product of products) {
      const entryKey = `${locale}:${product.slug}`;
      if (processedSlugs.has(entryKey)) continue;
      processedSlugs.add(entryKey);

      const url = `${BASE_URL}/${locale}/products/${product.slug}`;
      const alternates = buildProductAlternates(
        product.slug,
        locale,
        allProductsByLocale,
      );
      // Use real product timestamps for lastmod
      const lastModified = getProductLastModified(product);

      entries.push(
        createSitemapEntry({ url, lastModified, config, alternates }),
      );
    }
  }

  return entries;
}

// Fetch all blog posts for all locales
async function fetchAllPostsByLocale(): Promise<Map<string, PostSummary[]>> {
  const postsByLocale = new Map<string, PostSummary[]>();

  for (const locale of routing.locales) {
    try {
      const posts = await getAllPostsCached(locale as Locale, {
        draft: false,
      });
      postsByLocale.set(locale, posts);
    } catch {
      postsByLocale.set(locale, []);
    }
  }

  return postsByLocale;
}

// Build alternate languages for a blog post across locales
function buildBlogAlternates(
  slug: string,
  currentLocale: string,
  allPostsByLocale: Map<string, PostSummary[]>,
): Record<string, string> {
  const postPath = `/blog/${slug}`;

  const entries = routing.locales
    .filter((locale) => {
      const posts = allPostsByLocale.get(locale);
      if (posts === undefined) return false;
      return locale === currentLocale || posts.some((p) => p.slug === slug);
    })
    .map((locale) => [locale, `${BASE_URL}/${locale}${postPath}`]);

  // x-default 指向默认语言版本
  const defaultLocalePosts = allPostsByLocale.get(routing.defaultLocale);
  if (defaultLocalePosts?.some((p) => p.slug === slug)) {
    entries.push([
      'x-default',
      `${BASE_URL}/${routing.defaultLocale}${postPath}`,
    ]);
  }

  return Object.fromEntries(entries);
}

// Generate blog post page entries for all locales
async function generateBlogEntries(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];
  const config = getPageConfig('blogPost');
  const allPostsByLocale = await fetchAllPostsByLocale();

  // Track processed post slugs to avoid duplicates
  const processedSlugs = new Set<string>();

  for (const locale of routing.locales) {
    const posts = allPostsByLocale.get(locale);
    if (posts === undefined) continue;

    for (const post of posts) {
      const entryKey = `${locale}:${post.slug}`;
      if (processedSlugs.has(entryKey)) continue;
      processedSlugs.add(entryKey);

      const url = `${BASE_URL}/${locale}/blog/${post.slug}`;
      const alternates = buildBlogAlternates(
        post.slug,
        locale,
        allPostsByLocale,
      );
      const lastModified = getContentLastModified({
        publishedAt: post.publishedAt,
        updatedAt: post.updatedAt,
      });

      entries.push(
        createSitemapEntry({ url, lastModified, config, alternates }),
      );
    }
  }

  return entries;
}

/**
 * Dynamic sitemap generation for Next.js.
 * Includes all static pages and dynamic product pages with proper i18n alternates.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries = generateStaticPageEntries();
  const [productEntries, blogEntries] = await Promise.all([
    generateProductEntries(),
    generateBlogEntries(),
  ]);

  return [...staticEntries, ...productEntries, ...blogEntries];
}
