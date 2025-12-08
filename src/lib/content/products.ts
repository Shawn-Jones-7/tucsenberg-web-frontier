/**
 * Products content wrappers
 *
 * Cache-friendly wrapper implementations for products content.
 *
 * These functions:
 * - use the products query source (getProductListing, getProductDetail, etc.)
 * - expose view-oriented domain models (ProductSummary, ProductDetail)
 * - accept only explicit, serializable arguments (locale, category, slug)
 * - intentionally do NOT use request-scoped APIs (headers, cookies, etc.)
 */

import { cacheLife } from 'next/cache';
import type {
  GetAllProductsCachedFn,
  GetProductBySlugCachedFn,
  GetProductCategoriesCachedFn,
  Locale,
  ProductDetail,
  ProductSummary,
} from '@/types/content';
import {
  getProductDetail,
  getProductListing,
  getProductCategories,
  getFeaturedProducts,
} from '@/lib/content/products-source';

/**
 * Map a ProductDetail to a ProductSummary (list view).
 */
function mapProductDetailToSummary(product: ProductDetail): ProductSummary {
  const summary: ProductSummary = {
    slug: product.slug,
    locale: product.locale,
    title: product.title,
    coverImage: product.coverImage,
    category: product.category,
  };

  if (product.description !== undefined) summary.description = product.description;
  if (product.images !== undefined) summary.images = product.images;
  if (product.categories !== undefined) summary.categories = product.categories;
  if (product.tags !== undefined) summary.tags = product.tags;
  if (product.featured !== undefined) summary.featured = product.featured;
  if (product.moq !== undefined) summary.moq = product.moq;
  if (product.leadTime !== undefined) summary.leadTime = product.leadTime;
  if (product.supplyCapacity !== undefined) summary.supplyCapacity = product.supplyCapacity;
  if (product.seo !== undefined) summary.seo = product.seo;

  return summary;
}

/**
 * Get all products as ProductSummary list for a given locale.
 */
export const getAllProductsCached: GetAllProductsCachedFn = async (locale, options = {}) => {
  'use cache';
  cacheLife('days');

  const products = await Promise.resolve(getProductListing(locale, options.category));

  let filtered = products;

  // Filter by tags if specified
  if (options.tags !== undefined && options.tags.length > 0) {
    filtered = filtered.filter((p) => {
      const productTags = p.tags ?? [];
      return options.tags!.some((tag) => productTags.includes(tag));
    });
  }

  // Filter by featured if specified
  if (options.featured !== undefined) {
    filtered = filtered.filter((p) => p.featured === options.featured);
  }

  // Apply pagination
  const offset = options.offset ?? 0;
  const { limit } = options;

  if (limit !== undefined) {
    filtered = filtered.slice(offset, offset + limit);
  } else if (offset > 0) {
    filtered = filtered.slice(offset);
  }

  return filtered.map((product) => mapProductDetailToSummary(product));
};

/**
 * Get a single product by slug as a ProductDetail model.
 */
export const getProductBySlugCached: GetProductBySlugCachedFn = async (locale, slug) => {
  'use cache';
  cacheLife('days');

  const product = await Promise.resolve(getProductDetail(locale, slug));
  return product;
};

/**
 * Get all unique product categories for a locale.
 */
export const getProductCategoriesCached: GetProductCategoriesCachedFn = async (locale) => {
  'use cache';
  cacheLife('days');

  const categories = await Promise.resolve(getProductCategories(locale));
  return categories;
};

/**
 * Get featured products for homepage or highlight sections.
 */
export async function getFeaturedProductsCached(
  locale: Locale,
  limit?: number,
): Promise<ProductSummary[]> {
  'use cache';
  cacheLife('days');

  const products = await Promise.resolve(getFeaturedProducts(locale, limit));
  return products.map((product) => mapProductDetailToSummary(product));
}
