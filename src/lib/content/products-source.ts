/**
 * Products content query source.
 *
 * Low-level query functions for products content.
 * Reads product MDX files from content/products/[locale]/ directory.
 */

import fs from 'fs';
import path from 'path';
import type { Locale, Product, ProductDetail, ProductMetadata } from '@/types/content.types';
import { parseContentFile } from '@/lib/content-parser';
import { PRODUCTS_DIR } from '@/lib/content-utils';
import { routing } from '@/i18n/routing';

/**
 * Get all MDX files in a specific locale directory.
 */
function getProductFilesInLocale(locale: Locale): string[] {
  const localeDir = path.join(PRODUCTS_DIR, locale);

  // eslint-disable-next-line security/detect-non-literal-fs-filename
  if (!fs.existsSync(localeDir)) {
    return [];
  }

  // eslint-disable-next-line security/detect-non-literal-fs-filename
  const files = fs.readdirSync(localeDir);
  return files
    .filter((file) => ['.md', '.mdx'].includes(path.extname(file)))
    .map((file) => path.join(localeDir, file));
}

/**
 * Get all product files for a locale
 */
function getAllProductFiles(locale: Locale): Product[] {
  const files = getProductFilesInLocale(locale);
  return files.map((file) => parseContentFile<ProductMetadata>(file, 'products'));
}

/**
 * Assign optional string fields from metadata to detail.
 */
function assignStringFields(detail: ProductDetail, metadata: ProductMetadata): void {
  if (metadata.description !== undefined) detail.description = metadata.description;
  if (metadata.pdfUrl !== undefined) detail.pdfUrl = metadata.pdfUrl;
  if (metadata.moq !== undefined) detail.moq = metadata.moq;
  if (metadata.leadTime !== undefined) detail.leadTime = metadata.leadTime;
  if (metadata.supplyCapacity !== undefined) detail.supplyCapacity = metadata.supplyCapacity;
  if (metadata.packaging !== undefined) detail.packaging = metadata.packaging;
  if (metadata.portOfLoading !== undefined) detail.portOfLoading = metadata.portOfLoading;
}

/**
 * Assign optional array fields from metadata to detail.
 */
function assignArrayFields(detail: ProductDetail, metadata: ProductMetadata): void {
  if (metadata.images !== undefined) detail.images = metadata.images;
  if (metadata.categories !== undefined) detail.categories = metadata.categories;
  if (metadata.tags !== undefined) detail.tags = metadata.tags;
  if (metadata.certifications !== undefined) detail.certifications = metadata.certifications;
  if (metadata.relatedProducts !== undefined) detail.relatedProducts = metadata.relatedProducts;
}

/**
 * Assign optional object/boolean fields from metadata to detail.
 */
function assignObjectFields(detail: ProductDetail, metadata: ProductMetadata): void {
  if (metadata.featured !== undefined) detail.featured = metadata.featured;
  if (metadata.seo !== undefined) detail.seo = metadata.seo;
  if (metadata.specs !== undefined) detail.specs = metadata.specs;
}

/**
 * Map a Product entity to a ProductDetail domain model.
 */
function mapProductToDetail(product: Product, locale: Locale): ProductDetail {
  const { metadata, content, filePath, slug } = product;

  const detail: ProductDetail = {
    slug: metadata.slug ?? slug,
    locale,
    title: metadata.title,
    coverImage: metadata.coverImage,
    category: metadata.category,
    publishedAt: metadata.publishedAt,
    content,
    filePath,
  };

  // Timestamp fields
  if (metadata.updatedAt !== undefined) detail.updatedAt = metadata.updatedAt;

  assignStringFields(detail, metadata);
  assignArrayFields(detail, metadata);
  assignObjectFields(detail, metadata);

  return detail;
}

/**
 * Get all products for a locale, optionally filtered by category.
 */
export function getProductListing(locale: Locale, category?: string): ProductDetail[] {
  const products = getAllProductFiles(locale);

  let filtered = products;
  if (category !== undefined && category !== '') {
    filtered = products.filter((p) => p.metadata.category === category);
  }

  return filtered.map((product) => mapProductToDetail(product, locale));
}

/**
 * Get a single product by slug.
 */
export function getProductDetail(locale: Locale, slug: string): ProductDetail {
  const supportedLocales = routing.locales as readonly string[];
  if (!supportedLocales.includes(locale)) {
    throw new Error(
      `Invalid locale "${locale}" for product lookup. ` +
        `Supported locales: ${supportedLocales.join(', ')}. ` +
        `This may indicate a routing issue (e.g., static file path being parsed as locale).`,
    );
  }

  const files = getProductFilesInLocale(locale);

  const matchingFile = files.find((file) => {
    const fileSlug = path.basename(file, path.extname(file));
    return fileSlug === slug || fileSlug.startsWith(`${slug}.`);
  });

  if (matchingFile === undefined) {
    throw new Error(`Product not found: slug="${slug}", locale="${locale}"`);
  }

  const product = parseContentFile<ProductMetadata>(matchingFile, 'products');
  return mapProductToDetail(product, locale);
}

/**
 * Get all unique product categories for a locale.
 */
export function getProductCategories(locale: Locale): string[] {
  const products = getAllProductFiles(locale);

  const categories = new Set<string>();
  for (const product of products) {
    categories.add(product.metadata.category);
  }

  return Array.from(categories).sort();
}

/**
 * Get featured products for a locale.
 */
export function getFeaturedProducts(locale: Locale, limit?: number): ProductDetail[] {
  const products = getAllProductFiles(locale);

  const featured = products.filter((p) => p.metadata.featured === true);
  const mapped = featured.map((product) => mapProductToDetail(product, locale));

  if (limit !== undefined) {
    return mapped.slice(0, limit);
  }

  return mapped;
}
