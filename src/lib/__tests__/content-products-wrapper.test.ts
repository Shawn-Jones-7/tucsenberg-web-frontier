import { describe, expect, it } from 'vitest';
import type { Locale, ProductDetail } from '@/types/content';
import {
  getProductDetailCached,
  getProductListingCached,
} from '@/lib/content/products';

const { mockGetProductListing, mockGetProductDetail } = vi.hoisted(() => ({
  mockGetProductListing: vi.fn(),
  mockGetProductDetail: vi.fn(),
}));

vi.mock('@/lib/content/products-source', () => ({
  getProductListing: mockGetProductListing,
  getProductDetail: mockGetProductDetail,
}));

describe('content-products-wrapper', () => {
  const localeEn: Locale = 'en';
  const localeZh: Locale = 'zh';

  const createProductDetail = (
    overrides: Partial<ProductDetail> = {},
  ): ProductDetail => {
    const base: ProductDetail = {
      slug: overrides.slug ?? 'sample-product',
      locale: overrides.locale ?? localeEn,
      title: overrides.title ?? 'Sample Product',
      content: overrides.content ?? 'Sample content',
      filePath: overrides.filePath ?? '/content/products/sample-product.mdx',
    };

    // Only assign optional properties when explicitly provided (exactOptionalPropertyTypes)
    if (overrides.description !== undefined) {
      base.description = overrides.description;
    }
    if (overrides.categories !== undefined) {
      base.categories = overrides.categories;
    }
    if (overrides.tags !== undefined) {
      base.tags = overrides.tags;
    }
    if (overrides.seo !== undefined) {
      base.seo = overrides.seo;
    }

    return base;
  };

  describe('getProductListingCached', () => {
    it('should map ProductDetail list to ProductSummary list', async () => {
      const products: ProductDetail[] = [
        createProductDetail({
          slug: 'p1',
          locale: localeEn,
          title: 'Product 1',
          description: 'Desc 1',
          categories: ['cat-a'],
          tags: ['tag-a'],
          seo: { title: 'SEO P1', description: 'SEO Desc 1' },
        }),
        createProductDetail({
          slug: 'p2',
          locale: localeEn,
          title: 'Product 2',
        }),
      ];

      mockGetProductListing.mockReturnValue(products);

      const result = await getProductListingCached(localeEn, 'cat-a');

      expect(mockGetProductListing).toHaveBeenCalledWith(localeEn, 'cat-a');
      expect(result).toHaveLength(2);

      expect(result[0]).toEqual({
        slug: 'p1',
        locale: localeEn,
        title: 'Product 1',
        description: 'Desc 1',
        categories: ['cat-a'],
        tags: ['tag-a'],
        seo: { title: 'SEO P1', description: 'SEO Desc 1' },
      });

      expect(result[1]).toEqual({
        slug: 'p2',
        locale: localeEn,
        title: 'Product 2',
      });
    });

    it('should return empty array when no products are found', async () => {
      mockGetProductListing.mockReturnValue([]);

      const result = await getProductListingCached(localeEn, 'cat-empty');

      expect(mockGetProductListing).toHaveBeenCalledWith(localeEn, 'cat-empty');
      expect(result).toEqual([]);
    });

    it('should work with multiple locales', async () => {
      const enProduct = createProductDetail({ locale: localeEn, slug: 'p-en' });
      const zhProduct = createProductDetail({ locale: localeZh, slug: 'p-zh' });

      mockGetProductListing
        .mockReturnValueOnce([enProduct])
        .mockReturnValueOnce([zhProduct]);

      const enResult = await getProductListingCached(localeEn, 'cat');
      const zhResult = await getProductListingCached(localeZh, 'cat');

      expect(enResult[0]?.locale).toBe(localeEn);
      expect(zhResult[0]?.locale).toBe(localeZh);
    });

    it('should propagate errors from the underlying query', async () => {
      const error = new Error('Listing failed');
      mockGetProductListing.mockImplementation(() => {
        throw error;
      });

      await expect(getProductListingCached(localeEn, 'cat')).rejects.toBe(
        error,
      );
    });
  });

  describe('getProductDetailCached', () => {
    it('should return ProductDetail from underlying query', async () => {
      const product = createProductDetail({
        slug: 'detail-product',
        locale: localeZh,
      });
      mockGetProductDetail.mockReturnValue(product);

      const result = await getProductDetailCached(localeZh, 'detail-product');

      expect(mockGetProductDetail).toHaveBeenCalledWith(
        localeZh,
        'detail-product',
      );
      expect(result).toEqual(product);
    });

    it('should propagate errors from the underlying detail query', async () => {
      const error = new Error('Detail failed');
      mockGetProductDetail.mockImplementation(() => {
        throw error;
      });

      await expect(getProductDetailCached(localeEn, 'missing')).rejects.toBe(
        error,
      );
    });
  });
});
