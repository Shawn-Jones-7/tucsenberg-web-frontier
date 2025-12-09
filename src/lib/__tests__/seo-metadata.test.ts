import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { PageType } from '@/config/paths';
// Import after mocks
import {
  createPageSEOConfig,
  generateLocalizedMetadata,
} from '../seo-metadata';

// Use vi.hoisted to ensure proper mock setup
const { mockGenerateCanonicalURL, mockGenerateLanguageAlternates } = vi.hoisted(
  () => ({
    mockGenerateCanonicalURL: vi.fn(),
    mockGenerateLanguageAlternates: vi.fn(),
  }),
);

// Mock static JSON imports for SEO translations
vi.mock('@messages/en/critical.json', () => ({
  default: {
    seo: {
      title: 'English Title',
      description: 'English Description',
      siteName: 'Test Site EN',
      keywords: 'test,site,en',
      pages: {
        home: { title: 'Home EN', description: 'Home Description EN' },
        about: { title: 'About EN', description: 'About Description EN' },
      },
    },
  },
}));

vi.mock('@messages/zh/critical.json', () => ({
  default: {
    seo: {
      title: 'Chinese Title',
      description: 'Chinese Description',
      siteName: 'Test Site ZH',
      keywords: 'test,site,zh',
      pages: {
        home: { title: 'Home ZH', description: 'Home Description ZH' },
        about: { title: 'About ZH', description: 'About Description ZH' },
      },
    },
  },
}));

vi.mock('@/config/paths', () => ({
  SITE_CONFIG: {
    name: 'Test Site',
    seo: {
      defaultTitle: 'Default Title',
      defaultDescription: 'Default Description',
      keywords: ['test', 'site'],
    },
  },
}));

vi.mock('@/services/url-generator', () => ({
  generateCanonicalURL: mockGenerateCanonicalURL,
  generateLanguageAlternates: mockGenerateLanguageAlternates,
}));

describe('SEO Metadata', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockGenerateCanonicalURL.mockReturnValue('https://example.com/canonical');
    mockGenerateLanguageAlternates.mockReturnValue({
      en: 'https://example.com/en',
      zh: 'https://example.com/zh',
    });

    // Mock environment variables
    process.env.GOOGLE_SITE_VERIFICATION = 'google-verification-code';
    process.env.YANDEX_VERIFICATION = 'yandex-verification-code';
  });

  afterEach(() => {
    vi.restoreAllMocks();
    delete process.env.GOOGLE_SITE_VERIFICATION;
    delete process.env.YANDEX_VERIFICATION;
  });

  describe('generateLocalizedMetadata', () => {
    it('should generate basic metadata from static translations', () => {
      const metadata = generateLocalizedMetadata('en', 'home');

      // Title and description come from mocked JSON translations
      expect(metadata.title).toBe('Home EN');
      expect(metadata.description).toBe('Home Description EN');
      expect(metadata.openGraph?.title).toBe('Home EN');
      expect(metadata.openGraph?.description).toBe('Home Description EN');
      expect(metadata.openGraph?.siteName).toBe('Test Site EN');
      expect(metadata.openGraph?.locale).toBe('en');
      expect(metadata.alternates?.canonical).toBe(
        'https://example.com/canonical',
      );
      expect(metadata.robots).toEqual({
        index: true,
        follow: true,
        googleBot: {
          'index': true,
          'follow': true,
          'max-video-preview': -1,
          'max-image-preview': 'large',
          'max-snippet': -1,
        },
      });
      expect(metadata.verification).toEqual({
        google: 'google-verification-code',
        yandex: 'yandex-verification-code',
      });
    });

    it('should generate metadata with custom config override', () => {
      const config = {
        title: 'Custom Title',
        description: 'Custom Description',
        keywords: ['custom', 'keywords'],
        image: '/custom-image.jpg',
        type: 'article' as const,
        publishedTime: '2023-01-01',
        modifiedTime: '2023-01-02',
        authors: ['Author 1', 'Author 2'],
        section: 'Technology',
      };

      const metadata = generateLocalizedMetadata('zh', 'blog', config);

      expect(metadata.title).toBe('Custom Title');
      expect(metadata.description).toBe('Custom Description');
      expect(metadata.keywords).toEqual(['custom', 'keywords']);
      expect((metadata.openGraph as any)?.type).toBe('article');
      expect(metadata.openGraph?.images).toEqual([
        { url: '/custom-image.jpg' },
      ]);
      expect((metadata.openGraph as any)?.publishedTime).toBe('2023-01-01');
      expect((metadata.openGraph as any)?.modifiedTime).toBe('2023-01-02');
      expect((metadata.openGraph as any)?.authors).toEqual([
        'Author 1',
        'Author 2',
      ]);
      expect((metadata.openGraph as any)?.section).toBe('Technology');
      expect(metadata.twitter?.images).toEqual(['/custom-image.jpg']);
    });

    it('should handle product type correctly', () => {
      const config = {
        type: 'product' as const,
      };

      const metadata = generateLocalizedMetadata('en', 'products', config);

      // Product type should be converted to website for OpenGraph
      expect((metadata.openGraph as any)?.type).toBe('website');
    });

    it('should handle different locales with static translations', () => {
      const metadataZh = generateLocalizedMetadata('zh', 'about');
      const metadataEn = generateLocalizedMetadata('en', 'about');

      expect(metadataZh.openGraph?.locale).toBe('zh');
      expect(metadataZh.title).toBe('About ZH');
      expect(metadataZh.openGraph?.siteName).toBe('Test Site ZH');

      expect(metadataEn.openGraph?.locale).toBe('en');
      expect(metadataEn.title).toBe('About EN');
      expect(metadataEn.openGraph?.siteName).toBe('Test Site EN');
    });

    it('should handle missing environment variables', () => {
      delete process.env.GOOGLE_SITE_VERIFICATION;
      delete process.env.YANDEX_VERIFICATION;

      const metadata = generateLocalizedMetadata('en', 'home');

      expect(metadata.verification).toEqual({
        google: undefined,
        yandex: undefined,
      });
    });

    it('should call URL generation functions with correct parameters', () => {
      generateLocalizedMetadata('en', 'contact');

      expect(mockGenerateCanonicalURL).toHaveBeenCalledWith('contact', 'en');
      expect(mockGenerateLanguageAlternates).toHaveBeenCalledWith('contact');
    });

    it('should fall back to default values for unknown pages', () => {
      // Pages not in mock JSON should use default values from SITE_CONFIG
      const metadata = generateLocalizedMetadata('en', 'pricing');

      // Falls back to root-level title from mock or SITE_CONFIG default
      expect(metadata.title).toBe('English Title');
      expect(metadata.description).toBe('English Description');
    });
  });

  describe('createPageSEOConfig', () => {
    it('should return home page config by default', () => {
      const config = createPageSEOConfig('home');

      expect(config).toEqual({
        type: 'website',
        keywords: [
          'test',
          'site',
          'shadcn/ui',
          'Radix UI',
          'Modern Web',
          'Enterprise Platform',
          'B2B Solution',
        ],
        image: '/images/og-image.jpg',
      });
    });

    it('should return specific page config', () => {
      const config = createPageSEOConfig('blog');

      expect(config).toEqual({
        type: 'article',
        keywords: ['Blog', 'Articles', 'Technology', 'Insights'],
      });
    });

    it('should merge custom config with base config', () => {
      const customConfig = {
        title: 'Custom Title',
        description: 'Custom Description',
        keywords: ['custom', 'keywords'],
      };

      const config = createPageSEOConfig('about', customConfig);

      expect(config).toEqual({
        type: 'website',
        keywords: ['custom', 'keywords'], // Custom keywords override base
        title: 'Custom Title',
        description: 'Custom Description',
      });
    });

    it('should handle unknown page types', () => {
      const config = createPageSEOConfig('unknown' as PageType);

      // Should fallback to home config
      expect(config.type).toBe('website');
      expect(config.keywords).toContain('shadcn/ui');
    });

    it('should return correct config for all page types', () => {
      const pageTypes: PageType[] = [
        'home',
        'about',
        'contact',
        'blog',
        'products',
        'services',
        'pricing',
        'support',
        'privacy',
        'terms',
      ];

      pageTypes.forEach((pageType) => {
        const config = createPageSEOConfig(pageType);

        expect(config).toBeDefined();
        expect(config.type).toBeDefined();
        expect(config.keywords).toBeDefined();
        expect(Array.isArray(config.keywords)).toBe(true);
      });
    });

    it('should handle partial custom config', () => {
      const customConfig = {
        title: 'Custom Title',
        // Only title provided, other fields should come from base config
      };

      const config = createPageSEOConfig('pricing', customConfig);

      expect(config.title).toBe('Custom Title');
      expect(config.type).toBe('website'); // From base config
      expect(config.keywords).toEqual([
        'Pricing',
        'Plans',
        'Enterprise',
        'B2B',
      ]); // From base config
    });

    it('should handle empty custom config', () => {
      const config = createPageSEOConfig('services', {});

      expect(config).toEqual({
        type: 'website',
        keywords: ['Services', 'Solutions', 'Enterprise', 'B2B'],
      });
    });

    it('should preserve all custom config properties', () => {
      const customConfig = {
        title: 'Custom Title',
        description: 'Custom Description',
        keywords: ['custom'],
        image: '/custom.jpg',
        type: 'article' as const,
        publishedTime: '2023-01-01',
        modifiedTime: '2023-01-02',
        authors: ['Author'],
        section: 'Tech',
      };

      const config = createPageSEOConfig('support', customConfig);

      expect(config).toEqual(customConfig);
    });

    it('should handle null and undefined custom config', () => {
      const config1 = createPageSEOConfig('privacy');
      const config2 = createPageSEOConfig('privacy', undefined);

      expect(config1).toEqual(config2);
      expect(config1.type).toBe('website');
      expect(config1.keywords).toEqual([
        'Privacy',
        'Policy',
        'Data Protection',
      ]);
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle URL generation errors synchronously', () => {
      mockGenerateCanonicalURL.mockImplementation(() => {
        throw new Error('URL generation error');
      });

      expect(() => generateLocalizedMetadata('en', 'home')).toThrow(
        'URL generation error',
      );
    });

    it('should handle complex custom config merging', () => {
      const customConfig = {
        image: null as any, // Null value
        type: 'website' as const,
      };

      const config = createPageSEOConfig('terms', customConfig);

      // Terms page has default keywords, custom config doesn't override them
      expect(config.keywords).toEqual(['Terms', 'Conditions', 'Legal']);
      expect(config.image).toBeNull();
      expect(config.type).toBe('website');
    });
  });
});
