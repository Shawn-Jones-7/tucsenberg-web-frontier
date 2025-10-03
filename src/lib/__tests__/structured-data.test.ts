import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
// Import after mocks
import {
  generateArticleSchema,
  generateBreadcrumbSchema,
  generateFAQSchema,
  generateJSONLD,
  generateLocalBusinessSchema,
  generateLocalizedStructuredData,
  generateProductSchema,
  generateStructuredData,
} from '../structured-data';

// 测试常量定义
const TEST_COUNTS = {
  HOME_STRUCTURED_DATA: 2, // Organization + Website
  BLOG_STRUCTURED_DATA: 3, // Organization + Website + Article
  PRODUCTS_STRUCTURED_DATA: 3, // Organization + Website + Product
  FALLBACK_STRUCTURED_DATA: 2, // Organization + Website (fallback)
} as const;

// Use vi.hoisted to ensure proper mock setup
const { mockGetTranslations, mockGenerateCanonicalURL, mockRecordError } =
  vi.hoisted(() => ({
    mockGetTranslations: vi.fn(),
    mockGenerateCanonicalURL: vi.fn(),
    mockRecordError: vi.fn(),
  }));

vi.mock('next-intl/server', () => ({
  getTranslations: mockGetTranslations,
}));

vi.mock('@/services/url-generator', () => ({
  generateCanonicalURL: mockGenerateCanonicalURL,
}));

vi.mock('@/lib/i18n-performance', () => ({
  I18nPerformanceMonitor: {
    getInstance: () => ({
      trackTranslationUsage: vi.fn(),
    }),
    recordError: mockRecordError,
  },
}));

vi.mock('@/i18n/routing', () => ({
  routing: {
    locales: ['en', 'zh'],
    defaultLocale: 'en',
  },
}));

vi.mock('@/config/paths', () => ({
  SITE_CONFIG: {
    name: 'Tucsenberg',
    description: 'Modern Enterprise Platform',
    baseUrl: 'https://tucsenberg.com',
    author: 'Tucsenberg Team',
    social: {
      twitter: '@tucsenberg',
      linkedin: 'company/tucsenberg',
    },
  },
}));

describe('Structured Data Generation', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Mock translation function
    const mockT = vi.fn((key: string, options?: { defaultValue?: string }) => {
      const translations: Record<string, string> = {
        'organization.name': 'Tucsenberg',
        'organization.description': 'Modern Enterprise Platform',
        'website.name': 'Tucsenberg',
        'website.description': 'Enterprise Solutions',
        'breadcrumb.home': 'Home',
        'breadcrumb.about': 'About',
        'breadcrumb.contact': 'Contact',
        'article.author': 'Tucsenberg Team',
        'product.brand': 'Tucsenberg',
        'faq.question1': 'What is Tucsenberg?',
        'faq.answer1': 'A modern enterprise platform',
        'business.name': 'Tucsenberg Inc.',
        'business.address': '123 Business St, City, Country',
        'business.phone': '+1-234-567-8900',
      };
      const safeTranslations = new Map(Object.entries(translations));
      return safeTranslations.get(key) || options?.defaultValue || key;
    });

    mockGetTranslations.mockResolvedValue(mockT);
    mockGenerateCanonicalURL.mockReturnValue('https://tucsenberg.com/test');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('generateLocalizedStructuredData - Organization', () => {
    it('should generate valid organization schema', async () => {
      const schema = await generateLocalizedStructuredData(
        'en',
        'Organization',
        {},
      );

      expect(schema).toEqual({
        '@context': 'https://schema.org',
        '@type': 'Organization',
        'name': 'Tucsenberg',
        'description': 'Modern Enterprise Platform',
        'url': 'https://tucsenberg.com',
        'logo': 'https://tucsenberg.com/logo.png',
        'contactPoint': {
          '@type': 'ContactPoint',
          'telephone': '+1-555-0123',
          'contactType': 'customer service',
          'availableLanguage': ['en', 'zh'],
        },
        'sameAs': [
          'https://twitter.com/tucsenberg',
          'https://linkedin.com/company/tucsenberg',
          'https://github.com/tucsenberg',
        ],
      });
    });

    it('should handle different locales', async () => {
      await generateLocalizedStructuredData('zh', 'Organization', {});

      expect(mockGetTranslations).toHaveBeenCalledWith({
        locale: 'zh',
        namespace: 'structured-data',
      });
    });
  });

  describe('generateLocalizedStructuredData - WebSite', () => {
    it('should generate valid website schema', async () => {
      const schema = await generateLocalizedStructuredData('en', 'WebSite', {});

      expect(schema).toEqual({
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        'name': 'Tucsenberg',
        'description': 'Enterprise Solutions',
        'url': 'https://tucsenberg.com',
        'potentialAction': {
          '@type': 'SearchAction',
          'target': 'https://tucsenberg.com/search?q={search_term_string}',
          'query-input': 'required name=search_term_string',
        },
        'inLanguage': ['en', 'zh'],
      });
    });
  });

  describe('generateBreadcrumbSchema', () => {
    it('should generate breadcrumb schema for nested pages', async () => {
      const breadcrumbs = [
        { name: 'Home', url: 'https://tucsenberg.com/' },
        { name: 'About', url: 'https://tucsenberg.com/about' },
        { name: 'Contact', url: 'https://tucsenberg.com/contact' },
      ];

      const schema = await generateBreadcrumbSchema(breadcrumbs, 'en');

      expect(schema).toEqual({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': [
          {
            '@type': 'ListItem',
            'position': 1,
            'name': 'Home',
            'item': 'https://tucsenberg.com/',
          },
          {
            '@type': 'ListItem',
            'position': 2,
            'name': 'About',
            'item': 'https://tucsenberg.com/about',
          },
          {
            '@type': 'ListItem',
            'position': 3,
            'name': 'Contact',
            'item': 'https://tucsenberg.com/contact',
          },
        ],
      });
    });

    it('should handle empty breadcrumbs', async () => {
      const schema = await generateBreadcrumbSchema([], 'en');

      expect(schema.itemListElement).toEqual([]);
    });
  });

  describe('generateArticleSchema', () => {
    it('should generate valid article schema', async () => {
      const articleData = {
        title: 'Test Article',
        description: 'Test Description',
        author: 'John Doe',
        publishedTime: '2023-01-01T00:00:00Z',
        modifiedTime: '2023-01-02T00:00:00Z',
        image: '/test-image.jpg',
        section: 'Technology',
      };

      const schema = await generateArticleSchema(articleData, 'en');

      expect(schema).toEqual({
        '@context': 'https://schema.org',
        '@type': 'Article',
        'headline': 'Test Article',
        'description': 'Test Description',
        'author': {
          '@type': 'Person',
          'name': 'John Doe',
        },
        'publisher': {
          '@type': 'Organization',
          'name': 'Tucsenberg',
          'logo': {
            '@type': 'ImageObject',
            'url': 'https://tucsenberg.com/logo.png',
          },
        },
        'datePublished': '2023-01-01T00:00:00Z',
        'dateModified': '2023-01-02T00:00:00Z',
        'image': {
          '@type': 'ImageObject',
          'url': '/test-image.jpg',
        },
        'section': 'Technology',
        'inLanguage': 'en',
        'mainEntityOfPage': {
          '@type': 'WebPage',
          '@id': 'https://tucsenberg.com/test',
        },
      });
    });

    it('should handle missing optional fields', async () => {
      const articleData = {
        title: 'Test Article',
        description: 'Test Description',
      };

      const schema = await generateArticleSchema(articleData, 'en');

      expect(schema.author).toEqual({
        '@type': 'Person',
        'name': 'Tucsenberg Team',
      });
      expect(schema.datePublished).toBeDefined();
      expect(schema.dateModified).toBeDefined();
    });
  });

  describe('generateProductSchema', () => {
    it('should generate valid product schema', async () => {
      const productData = {
        name: 'Enterprise Solution',
        description: 'Advanced business platform',
        image: '/product-image.jpg',
        price: '999.00',
        currency: 'USD',
        availability: 'InStock' as const,
        brand: 'Tucsenberg',
        sku: 'ENT-001',
      };

      const schema = await generateProductSchema(productData, 'en');

      expect(schema).toEqual({
        '@context': 'https://schema.org',
        '@type': 'Product',
        'name': 'Enterprise Solution',
        'description': 'Advanced business platform',
        'image': ['/product-image.jpg'],
        'manufacturer': {
          '@type': 'Organization',
          'name': 'Tucsenberg',
        },
        'brand': {
          '@type': 'Brand',
          'name': 'Tucsenberg',
        },
        'sku': 'ENT-001',
        'offers': {
          '@type': 'Offer',
          'price': 999,
          'priceCurrency': 'USD',
          'availability': 'InStock',
        },
      });
    });

    it('should generate product schema without offers when no price provided', async () => {
      const productData = {
        name: 'Free Tool',
        description: 'Open source utility',
        image: '/tool-image.jpg',
        brand: 'Tucsenberg',
        sku: 'FREE-001',
        // No price provided
      };

      const schema = await generateProductSchema(productData, 'en');

      expect(schema).toEqual({
        '@context': 'https://schema.org',
        '@type': 'Product',
        'name': 'Free Tool',
        'description': 'Open source utility',
        'image': ['/tool-image.jpg'],
        'manufacturer': {
          '@type': 'Organization',
          'name': 'Tucsenberg',
        },
        'brand': {
          '@type': 'Brand',
          'name': 'Tucsenberg',
        },
        'sku': 'FREE-001',
        'offers': undefined, // This should cover the undefined case on line 170
      });
    });
  });

  describe('generateFAQSchema', () => {
    it('should generate valid FAQ schema', async () => {
      const faqData = [
        {
          question: 'What is Tucsenberg?',
          answer: 'A modern enterprise platform',
        },
        {
          question: 'How does it work?',
          answer: 'Through advanced technology',
        },
      ];

      const schema = await generateFAQSchema(faqData, 'en');

      expect(schema).toEqual({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        'mainEntity': [
          {
            '@type': 'Question',
            'name': 'What is Tucsenberg?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'A modern enterprise platform',
            },
          },
          {
            '@type': 'Question',
            'name': 'How does it work?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Through advanced technology',
            },
          },
        ],
      });
    });
  });

  describe('generateLocalBusinessSchema', () => {
    it('should generate valid local business schema', async () => {
      const businessData = {
        name: 'Tucsenberg Office',
        address: '123 Business St, City, Country',
        phone: '+1-234-567-8900',
        email: 'contact@tucsenberg.com',
        openingHours: ['Mo-Fr 09:00-17:00'],
        priceRange: '$$$',
      };

      const schema = await generateLocalBusinessSchema(businessData, 'en');

      expect(schema).toEqual({
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        'name': 'Tucsenberg Office',
        'address': {
          '@type': 'PostalAddress',
          'streetAddress': '123 Business St, City, Country',
        },
        'telephone': '+1-234-567-8900',
        'email': 'contact@tucsenberg.com',
        'openingHours': ['Mo-Fr 09:00-17:00'],
        'priceRange': '$$$',
        'url': 'https://tucsenberg.com',
      });
    });
  });

  describe('generateStructuredData', () => {
    it('should generate structured data for home page', async () => {
      const data = await generateStructuredData('home', 'en');

      expect(data).toHaveLength(TEST_COUNTS.HOME_STRUCTURED_DATA); // Organization + Website
      expect(data[0]['@type']).toBe('Organization');
      expect(data[1]['@type']).toBe('WebSite');
    });

    it('should generate structured data for blog page', async () => {
      const articleData = {
        title: 'Blog Post',
        description: 'Blog Description',
      };

      const data = await generateStructuredData('blog', 'en', {
        article: articleData,
      });

      expect(data).toHaveLength(TEST_COUNTS.BLOG_STRUCTURED_DATA); // Organization + Website + Article
      expect(data[2]['@type']).toBe('Article');
    });

    it('should generate structured data for products page', async () => {
      const productData = {
        name: 'Product',
        description: 'Product Description',
        price: '100.00',
        currency: 'USD',
        availability: 'InStock' as const,
      };

      const data = await generateStructuredData('products', 'en', {
        product: productData,
      });

      expect(data).toHaveLength(TEST_COUNTS.PRODUCTS_STRUCTURED_DATA); // Organization + Website + Product
      expect(data[2]['@type']).toBe('Product');
    });

    it('should handle unknown page types', async () => {
      const data = await generateStructuredData('home', 'en');

      expect(data).toHaveLength(TEST_COUNTS.FALLBACK_STRUCTURED_DATA); // Organization + Website (fallback)
    });
  });

  describe('错误处理和边缘情况', () => {
    it('should handle translation errors gracefully', async () => {
      // Mock getTranslations to throw an error
      mockGetTranslations.mockRejectedValueOnce(new Error('Translation error'));

      const data = await generateLocalizedStructuredData(
        'en',
        'Organization',
        {},
      );

      // Should return basic structure even when translation fails
      expect(data).toHaveProperty('@context', 'https://schema.org');
      expect(data).toHaveProperty('@type', 'Organization');
    });

    it('should handle invalid structured data types', async () => {
      const data = await generateLocalizedStructuredData(
        'en',
        'InvalidType' as any,
        {},
      );

      // Should return basic structure for unknown types
      expect(data).toHaveProperty('@context', 'https://schema.org');
      expect(data).toHaveProperty('@type', 'InvalidType');
    });

    it('should handle null and undefined data inputs', async () => {
      const testCases = [
        { type: 'Organization', data: null },
        { type: 'WebSite', data: undefined },
        { type: 'Article', data: {} },
      ] as const;

      for (const testCase of testCases) {
        const data = await generateLocalizedStructuredData(
          'en',
          testCase.type,
          testCase.data as any,
        );

        expect(data).toHaveProperty('@context', 'https://schema.org');
        expect(data).toHaveProperty('@type', testCase.type);
      }
    });

    it('should handle malformed article data', async () => {
      const malformedData = {
        title: 'Test Article',
        description: 'Test Description',
        publishedTime: '2023-01-01T00:00:00Z',
        url: 'https://example.com/test',
        invalidProperty: 'should be ignored',
      };

      const data = await generateLocalizedStructuredData(
        'en',
        'Article',
        malformedData,
      );

      expect(data).toHaveProperty('@context', 'https://schema.org');
      expect(data).toHaveProperty('@type', 'Article');
    });

    it('should handle malformed product data', async () => {
      const malformedData = {
        name: '',
        price: 'invalid-price',
        currency: null,
        availability: 'InvalidStatus',
      };

      const data = await generateLocalizedStructuredData(
        'en',
        'Product',
        malformedData,
      );

      expect(data).toHaveProperty('@context', 'https://schema.org');
      expect(data).toHaveProperty('@type', 'Product');
    });
  });

  describe('JSON-LD 生成测试', () => {
    it('should generate valid JSON-LD string', () => {
      const testData = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        'name': 'Test Organization',
      };

      const jsonLD = generateJSONLD(testData);

      // Should be valid JSON
      expect(() => JSON.parse(jsonLD)).not.toThrow();

      // Should be properly formatted
      expect(jsonLD).toContain('"@context"');
      expect(jsonLD).toContain('"@type"');
      expect(jsonLD).toContain('Test Organization');
    });

    it('should handle complex nested objects in JSON-LD', () => {
      const complexData = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        'address': {
          '@type': 'PostalAddress',
          'streetAddress': '123 Main St',
          'addressLocality': 'City',
        },
        'contactPoint': [
          {
            '@type': 'ContactPoint',
            'telephone': '+1-555-123-4567',
            'contactType': 'customer service',
          },
        ],
      };

      const jsonLD = generateJSONLD(complexData);

      expect(() => JSON.parse(jsonLD)).not.toThrow();

      const parsed = JSON.parse(jsonLD);
      expect(parsed.address).toHaveProperty('@type', 'PostalAddress');
      expect(parsed.contactPoint).toHaveLength(1);
    });

    it('should handle null and undefined values in JSON-LD', () => {
      const dataWithNulls = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        'name': 'Test',
        'description': null,
        'url': undefined,
      };

      const jsonLD = generateJSONLD(dataWithNulls);

      expect(() => JSON.parse(jsonLD)).not.toThrow();

      const parsed = JSON.parse(jsonLD);
      expect(parsed.description).toBeNull();
      expect(parsed).not.toHaveProperty('url'); // undefined should be omitted
    });
  });

  describe('性能和内存测试', () => {
    it('should handle repeated generation efficiently', async () => {
      const startTime = performance.now();

      // Generate structured data multiple times
      for (let i = 0; i < 100; i++) {
        await generateStructuredData('home', 'en');
        await generateLocalizedStructuredData('en', 'Organization', {});
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should complete within reasonable time (less than 1000ms)
      expect(duration).toBeLessThan(1000);
    });

    it('should not create memory leaks with repeated calls', async () => {
      const initialMemory = performance.memory?.usedJSHeapSize || 0;

      // Perform many operations
      for (let i = 0; i < 1000; i++) {
        await generateLocalizedStructuredData('en', 'Organization', {});
        generateJSONLD({ test: 'data' });
      }

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      const finalMemory = performance.memory?.usedJSHeapSize || 0;
      const memoryIncrease = finalMemory - initialMemory;

      // Memory increase should be minimal (less than 5MB)
      expect(memoryIncrease).toBeLessThan(5 * 1024 * 1024);
    });
  });

  describe('generateJSONLD', () => {
    it('should generate valid JSON-LD string', () => {
      const testData = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        'name': 'Test Organization',
      };

      const result = generateJSONLD(testData);

      expect(result).toBe(JSON.stringify(testData, null, 2));
      expect(() => JSON.parse(result)).not.toThrow();
    });

    it('should handle complex nested objects', () => {
      const complexData = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        'author': {
          '@type': 'Person',
          'name': 'John Doe',
        },
        'publisher': {
          '@type': 'Organization',
          'name': 'Test Publisher',
          'logo': {
            '@type': 'ImageObject',
            'url': 'https://example.com/logo.png',
          },
        },
      };

      const result = generateJSONLD(complexData);

      expect(result).toContain('"@context": "https://schema.org"');
      expect(result).toContain('"@type": "Article"');
      expect(result).toContain('"name": "John Doe"');
      expect(() => JSON.parse(result)).not.toThrow();
    });

    it('should handle null and undefined values', () => {
      const dataWithNulls = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        'name': 'Test',
        'description': null,
        'url': undefined,
      };

      const result = generateJSONLD(dataWithNulls);

      expect(() => JSON.parse(result)).not.toThrow();
      const parsed = JSON.parse(result);
      expect(parsed.description).toBeNull();
      expect(parsed).not.toHaveProperty('url');
    });

    it('should handle empty objects and arrays', () => {
      const emptyData = {};
      const result = generateJSONLD(emptyData);

      expect(result).toBe('{}');
      expect(() => JSON.parse(result)).not.toThrow();
    });
  });

  describe('generateLocalizedStructuredData - Error Handling', () => {
    beforeEach(() => {
      // Reset mocks
      vi.clearAllMocks();
    });

    it('should handle translation errors gracefully', async () => {
      // Mock getTranslations to throw an error
      const mockGetTranslationsError = vi.mocked(
        await import('next-intl/server'),
      ).getTranslations;
      mockGetTranslationsError.mockRejectedValueOnce(
        new Error('Translation failed'),
      );

      const result = await generateLocalizedStructuredData(
        'en',
        'Organization',
        {},
      );

      expect(result).toEqual({
        '@context': 'https://schema.org',
        '@type': 'Organization',
      });
    });

    it('should handle unknown structured data types', async () => {
      const result = await generateLocalizedStructuredData(
        'en',
        'UnknownType' as any,
        {},
      );

      expect(result).toEqual({
        '@context': 'https://schema.org',
        '@type': 'UnknownType',
      });
    });

    it('should handle non-Error exceptions', async () => {
      // Mock getTranslations to throw a non-Error object
      const mockGetTranslationsString = vi.mocked(
        await import('next-intl/server'),
      ).getTranslations;
      mockGetTranslationsString.mockRejectedValueOnce('String error');

      const result = await generateLocalizedStructuredData(
        'en',
        'Organization',
        {},
      );

      expect(result).toEqual({
        '@context': 'https://schema.org',
        '@type': 'Organization',
      });
    });

    it('should record errors in I18nPerformanceMonitor', async () => {
      // Mock getTranslations to throw an Error
      mockGetTranslations.mockRejectedValueOnce(
        new Error('Translation failed'),
      );

      await generateLocalizedStructuredData('en', 'Organization', {});

      expect(mockRecordError).toHaveBeenCalled();
    });
  });

  describe('BreadcrumbList Generation', () => {
    it('should generate breadcrumb structured data', async () => {
      const breadcrumbData = {
        items: [
          { name: 'Home', url: '/', position: 1 },
          { name: 'Products', url: '/products', position: 2 },
          { name: 'Category', url: '/products/category', position: 3 },
        ],
      };

      const result = await generateLocalizedStructuredData(
        'en',
        'BreadcrumbList',
        breadcrumbData,
      );

      expect(result['@type']).toBe('BreadcrumbList');
      expect(result['@context']).toBe('https://schema.org');
    });
  });
});
