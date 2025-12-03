import type { MetadataRoute } from 'next';
import type { Locale, ProductSummary } from '@/types/content';
import { getAllProductsCached } from '@/lib/content/products';
import { routing } from '@/i18n/routing';

// Base URL for the site - should be configured in env
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://example.com';

// Static pages that exist in all locales
const STATIC_PAGES = [
  '',
  '/about',
  '/contact',
  '/products',
  '/blog',
  '/faq',
  '/privacy',
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
]);

const DEFAULT_CONFIG: PageConfig = {
  changeFrequency: 'weekly',
  priority: 0.5,
};

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
  const now = new Date();

  for (const locale of routing.locales) {
    for (const page of STATIC_PAGES) {
      const config = getPageConfig(page);
      const url = `${BASE_URL}/${locale}${page}`;
      const alternates = buildAlternateLanguages(page);

      entries.push(
        createSitemapEntry({ url, lastModified: now, config, alternates }),
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
  const now = new Date();
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

      entries.push(
        createSitemapEntry({ url, lastModified: now, config, alternates }),
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
  const productEntries = await generateProductEntries();

  return [...staticEntries, ...productEntries];
}
