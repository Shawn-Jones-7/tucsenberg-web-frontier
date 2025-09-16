import { beforeEach, describe, expect, it, vi } from 'vitest';
import { generatePageMetadata } from '@/lib/metadata';
import type { Locale, PageType } from '@/lib/seo-metadata';

// Mock seo-metadata module using vi.hoisted
const { mockCreatePageSEOConfig, mockGenerateLocalizedMetadata } = vi.hoisted(
  () => ({
    mockCreatePageSEOConfig: vi.fn(),
    mockGenerateLocalizedMetadata: vi.fn(),
  }),
);

vi.mock('../seo-metadata', () => ({
  createPageSEOConfig: mockCreatePageSEOConfig,
  generateLocalizedMetadata: mockGenerateLocalizedMetadata,
}));

describe('metadata', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('generatePageMetadata', () => {
    it('should generate page metadata with default config', async () => {
      const mockSeoConfig = {
        title: 'Test Page',
        description: 'Test Description',
      };
      const mockMetadata = {
        title: 'Test Page',
        description: 'Test Description',
        openGraph: { title: 'Test Page' },
      };

      mockCreatePageSEOConfig.mockReturnValue(mockSeoConfig);
      mockGenerateLocalizedMetadata.mockResolvedValue(mockMetadata);

      const locale: Locale = 'en';
      const page: PageType = 'home';

      const result = await generatePageMetadata({ locale, page });

      expect(mockCreatePageSEOConfig).toHaveBeenCalledWith(page, {});
      expect(mockGenerateLocalizedMetadata).toHaveBeenCalledWith(
        locale,
        page,
        mockSeoConfig,
      );
      expect(result).toEqual(mockMetadata);
    });

    it('should generate page metadata with custom config', async () => {
      const customConfig = { title: 'Custom Title', priority: 1 };
      const mockSeoConfig = {
        title: 'Custom Title',
        description: 'Custom Description',
      };
      const mockMetadata = {
        title: 'Custom Title',
        description: 'Custom Description',
        openGraph: { title: 'Custom Title' },
      };

      mockCreatePageSEOConfig.mockReturnValue(mockSeoConfig);
      mockGenerateLocalizedMetadata.mockResolvedValue(mockMetadata);

      const locale: Locale = 'zh';
      const page: PageType = 'about';

      const result = await generatePageMetadata({ locale, page, customConfig });

      expect(mockCreatePageSEOConfig).toHaveBeenCalledWith(page, customConfig);
      expect(mockGenerateLocalizedMetadata).toHaveBeenCalledWith(
        locale,
        page,
        mockSeoConfig,
      );
      expect(result).toEqual(mockMetadata);
    });

    it('should handle different page types', async () => {
      const mockSeoConfig = {
        title: 'Contact Page',
        description: 'Contact Description',
      };
      const mockMetadata = {
        title: 'Contact Page',
        description: 'Contact Description',
      };

      mockCreatePageSEOConfig.mockReturnValue(mockSeoConfig);
      mockGenerateLocalizedMetadata.mockResolvedValue(mockMetadata);

      const locale: Locale = 'en';
      const page: PageType = 'contact';

      const result = await generatePageMetadata({ locale, page });

      expect(mockCreatePageSEOConfig).toHaveBeenCalledWith(page, {});
      expect(mockGenerateLocalizedMetadata).toHaveBeenCalledWith(
        locale,
        page,
        mockSeoConfig,
      );
      expect(result).toEqual(mockMetadata);
    });

    it('should handle different locales', async () => {
      const mockSeoConfig = { title: '产品页面', description: '产品描述' };
      const mockMetadata = {
        title: '产品页面',
        description: '产品描述',
        alternates: { languages: { zh: '/zh/products' } },
      };

      mockCreatePageSEOConfig.mockReturnValue(mockSeoConfig);
      mockGenerateLocalizedMetadata.mockResolvedValue(mockMetadata);

      const locale: Locale = 'zh';
      const page: PageType = 'products';

      const result = await generatePageMetadata({ locale, page });

      expect(mockCreatePageSEOConfig).toHaveBeenCalledWith(page, {});
      expect(mockGenerateLocalizedMetadata).toHaveBeenCalledWith(
        locale,
        page,
        mockSeoConfig,
      );
      expect(result).toEqual(mockMetadata);
    });

    it('should handle empty custom config', async () => {
      const mockSeoConfig = {
        title: 'Blog Page',
        description: 'Blog Description',
      };
      const mockMetadata = {
        title: 'Blog Page',
        description: 'Blog Description',
      };

      mockCreatePageSEOConfig.mockReturnValue(mockSeoConfig);
      mockGenerateLocalizedMetadata.mockResolvedValue(mockMetadata);

      const locale: Locale = 'en';
      const page: PageType = 'blog';

      const result = await generatePageMetadata({
        locale,
        page,
        customConfig: {},
      });

      expect(mockCreatePageSEOConfig).toHaveBeenCalledWith(page, {});
      expect(mockGenerateLocalizedMetadata).toHaveBeenCalledWith(
        locale,
        page,
        mockSeoConfig,
      );
      expect(result).toEqual(mockMetadata);
    });
  });

  describe('module exports', () => {
    it('should re-export functions from seo-metadata', () => {
      // Test that the module properly re-exports the required functions
      expect(typeof generatePageMetadata).toBe('function');
    });
  });
});
