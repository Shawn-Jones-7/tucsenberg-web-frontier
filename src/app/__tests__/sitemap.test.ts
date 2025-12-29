import { describe, expect, it, vi } from 'vitest';
import sitemap from '../sitemap';

// Mock dependencies before imports
vi.mock('@/config/paths', () => ({
  SITE_CONFIG: {
    baseUrl: 'https://example.com',
  },
}));

vi.mock('@/i18n/routing', () => ({
  routing: {
    locales: ['en', 'zh'],
    defaultLocale: 'en',
  },
}));

vi.mock('@/lib/content/products', () => ({
  getAllProductsCached: vi.fn(async (locale: string) => {
    if (locale === 'en') {
      return [
        {
          slug: 'product-a',
          title: 'Product A',
          updatedAt: '2024-06-01T00:00:00Z',
        },
        {
          slug: 'product-b',
          title: 'Product B',
          createdAt: '2024-05-01T00:00:00Z',
        },
      ];
    }
    if (locale === 'zh') {
      return [
        {
          slug: 'product-a',
          title: '产品A',
          updatedAt: '2024-06-01T00:00:00Z',
        },
      ];
    }
    return [];
  }),
}));

vi.mock('@/lib/content/blog', () => ({
  getAllPostsCached: vi.fn(async (locale: string) => {
    if (locale === 'en') {
      return [
        {
          slug: 'post-a',
          title: 'Post A',
          publishedAt: '2024-04-01T00:00:00Z',
          updatedAt: '2024-04-02T00:00:00Z',
        },
      ];
    }
    if (locale === 'zh') {
      return [
        {
          slug: 'post-a',
          title: '文章A',
          publishedAt: '2024-04-01T00:00:00Z',
          updatedAt: '2024-04-02T00:00:00Z',
        },
      ];
    }
    return [];
  }),
}));

vi.mock('@/lib/sitemap-utils', () => ({
  getContentLastModified: vi.fn(({ updatedAt, publishedAt }) => {
    if (updatedAt) return new Date(updatedAt);
    if (publishedAt) return new Date(publishedAt);
    return new Date('2024-01-01T00:00:00Z');
  }),
  getProductLastModified: vi.fn((product) => {
    if (product.updatedAt) {
      return new Date(product.updatedAt);
    }
    if (product.createdAt) {
      return new Date(product.createdAt);
    }
    return new Date('2024-01-01T00:00:00Z');
  }),
  getStaticPageLastModified: vi.fn((page) => {
    const dates: Record<string, Date> = {
      '': new Date('2024-12-01T00:00:00Z'),
      '/about': new Date('2024-06-01T00:00:00Z'),
      '/contact': new Date('2024-06-01T00:00:00Z'),
      '/products': new Date('2024-11-01T00:00:00Z'),
      '/blog': new Date('2024-11-01T00:00:00Z'),
      '/faq': new Date('2024-09-01T00:00:00Z'),
      '/privacy': new Date('2024-06-01T00:00:00Z'),
      '/terms': new Date('2024-06-01T00:00:00Z'),
    };
    return dates[page] || new Date('2024-01-01T00:00:00Z');
  }),
}));

describe('sitemap.ts', () => {
  describe('sitemap()', () => {
    it('should return sitemap array', async () => {
      const result = await sitemap();

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should include static pages for all locales', async () => {
      const result = await sitemap();

      // Check for English home page
      const enHome = result.find(
        (entry) => entry.url === 'https://example.com/en',
      );
      expect(enHome).toBeDefined();

      // Check for Chinese home page
      const zhHome = result.find(
        (entry) => entry.url === 'https://example.com/zh',
      );
      expect(zhHome).toBeDefined();
    });

    it('should include static pages', async () => {
      const result = await sitemap();
      const urls = result.map((entry) => entry.url);

      expect(urls).toContain('https://example.com/en/about');
      expect(urls).toContain('https://example.com/en/contact');
      expect(urls).toContain('https://example.com/en/products');
      expect(urls).toContain('https://example.com/en/blog');
      expect(urls).toContain('https://example.com/en/faq');
      expect(urls).toContain('https://example.com/en/privacy');
      expect(urls).toContain('https://example.com/en/terms');
    });

    it('should include product pages', async () => {
      const result = await sitemap();
      const urls = result.map((entry) => entry.url);

      expect(urls).toContain('https://example.com/en/products/product-a');
      expect(urls).toContain('https://example.com/en/products/product-b');
    });

    it('should include Chinese product pages', async () => {
      const result = await sitemap();
      const urls = result.map((entry) => entry.url);

      expect(urls).toContain('https://example.com/zh/products/product-a');
    });

    it('should have lastModified for entries', async () => {
      const result = await sitemap();

      for (const entry of result) {
        expect(entry.lastModified).toBeDefined();
        expect(entry.lastModified).toBeInstanceOf(Date);
      }
    });

    it('should have changeFrequency for entries', async () => {
      const result = await sitemap();
      const validFrequencies = [
        'always',
        'hourly',
        'daily',
        'weekly',
        'monthly',
        'yearly',
        'never',
      ];

      for (const entry of result) {
        expect(validFrequencies).toContain(entry.changeFrequency);
      }
    });

    it('should have priority for entries', async () => {
      const result = await sitemap();

      for (const entry of result) {
        expect(entry.priority).toBeDefined();
        expect(entry.priority).toBeGreaterThanOrEqual(0);
        expect(entry.priority).toBeLessThanOrEqual(1);
      }
    });

    it('should have alternates with languages', async () => {
      const result = await sitemap();

      for (const entry of result) {
        expect(entry.alternates).toBeDefined();
        expect(entry.alternates?.languages).toBeDefined();
      }
    });

    it('should include x-default in alternates', async () => {
      const result = await sitemap();
      const enHome = result.find(
        (entry) => entry.url === 'https://example.com/en',
      );

      expect(enHome?.alternates?.languages?.['x-default']).toBeDefined();
    });

    it('should set home page priority to 1.0', async () => {
      const result = await sitemap();
      const enHome = result.find(
        (entry) => entry.url === 'https://example.com/en',
      );

      expect(enHome?.priority).toBe(1.0);
    });

    it('should set products listing priority to 0.9', async () => {
      const result = await sitemap();
      const products = result.find(
        (entry) => entry.url === 'https://example.com/en/products',
      );

      expect(products?.priority).toBe(0.9);
    });

    it('should set home page changeFrequency to daily', async () => {
      const result = await sitemap();
      const enHome = result.find(
        (entry) => entry.url === 'https://example.com/en',
      );

      expect(enHome?.changeFrequency).toBe('daily');
    });

    it('should set about page changeFrequency to monthly', async () => {
      const result = await sitemap();
      const about = result.find(
        (entry) => entry.url === 'https://example.com/en/about',
      );

      expect(about?.changeFrequency).toBe('monthly');
    });

    it('should not have duplicate entries', async () => {
      const result = await sitemap();
      const urls = result.map((entry) => entry.url);
      const uniqueUrls = new Set(urls);

      expect(uniqueUrls.size).toBe(urls.length);
    });
  });
});
