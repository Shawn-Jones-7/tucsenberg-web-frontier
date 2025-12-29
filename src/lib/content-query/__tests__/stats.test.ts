/**
 * Unit tests for content-query stats module
 *
 * Tests cover:
 * - getContentStats
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import type {
  BlogPost,
  BlogPostMetadata,
  ContentConfig,
  Page,
  PageMetadata,
} from '@/types/content.types';
// Import after mocking
import { getContentStats } from '@/lib/content-query/stats';

// Mocks setup via vi.hoisted for ESM compatibility
const mockGetAllPosts = vi.hoisted(() => vi.fn());
const mockGetAllPages = vi.hoisted(() => vi.fn());
const mockGetContentConfig = vi.hoisted(() => vi.fn<() => ContentConfig>());

vi.mock('@/lib/content-query/queries', () => ({
  getAllPosts: mockGetAllPosts,
  getAllPages: mockGetAllPages,
}));

vi.mock('@/lib/content-utils', () => ({
  getContentConfig: mockGetContentConfig,
}));

// Factory functions for mock data
function createMockBlogPost(overrides?: Partial<BlogPost>): BlogPost {
  return {
    slug: 'test-post',
    metadata: {
      title: 'Test Post',
      slug: 'test-post',
      publishedAt: '2024-01-15',
      description: 'Test description',
      draft: false,
      featured: false,
      tags: [],
      categories: [],
      ...overrides?.metadata,
    } as BlogPostMetadata,
    content: 'Test content',
    filePath: '/content/posts/test.mdx',
    ...overrides,
  };
}

function createMockPage(overrides?: Partial<Page>): Page {
  return {
    slug: 'test-page',
    metadata: {
      title: 'Test Page',
      slug: 'test-page',
      publishedAt: '2024-01-15',
      description: 'Test page description',
      draft: false,
      layout: 'default',
      ...overrides?.metadata,
    } as PageMetadata,
    content: 'Test page content',
    filePath: '/content/pages/test.mdx',
    ...overrides,
  };
}

function createMockContentConfig(
  overrides?: Partial<ContentConfig>,
): ContentConfig {
  return {
    defaultLocale: 'en',
    supportedLocales: ['en', 'zh'],
    postsPerPage: 10,
    enableDrafts: false,
    enableSearch: true,
    enableComments: false,
    autoGenerateExcerpt: true,
    excerptLength: 160,
    dateFormat: 'YYYY-MM-DD',
    timeZone: 'UTC',
    ...overrides,
  };
}

describe('content-query/stats', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetContentConfig.mockReturnValue(createMockContentConfig());
    // Set up date mock to ensure consistent lastUpdated
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-06-15T12:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('getContentStats', () => {
    it('should return content statistics for all supported locales', () => {
      const enPosts = [createMockBlogPost({ slug: 'en-post-1' })];
      const zhPosts = [
        createMockBlogPost({ slug: 'zh-post-1' }),
        createMockBlogPost({ slug: 'zh-post-2' }),
      ];
      const enPages = [createMockPage({ slug: 'en-about' })];
      const zhPages = [
        createMockPage({ slug: 'zh-about' }),
        createMockPage({ slug: 'zh-contact' }),
      ];

      mockGetAllPosts
        .mockReturnValueOnce(enPosts) // First call for 'en'
        .mockReturnValueOnce(zhPosts); // Second call for 'zh'
      mockGetAllPages
        .mockReturnValueOnce(enPages) // First call for 'en'
        .mockReturnValueOnce(zhPages); // Second call for 'zh'

      const result = getContentStats();

      expect(result.totalPosts).toBe(3); // 1 en + 2 zh
      expect(result.totalPages).toBe(3); // 1 en + 2 zh
      expect(result.postsByLocale.en).toBe(1);
      expect(result.postsByLocale.zh).toBe(2);
      expect(result.pagesByLocale.en).toBe(1);
      expect(result.pagesByLocale.zh).toBe(2);
    });

    it('should return lastUpdated timestamp', () => {
      mockGetAllPosts.mockReturnValue([]);
      mockGetAllPages.mockReturnValue([]);

      const result = getContentStats();

      expect(result.lastUpdated).toBe('2024-06-15T12:00:00.000Z');
    });

    it('should initialize totalTags and totalCategories to zero', () => {
      mockGetAllPosts.mockReturnValue([]);
      mockGetAllPages.mockReturnValue([]);

      const result = getContentStats();

      expect(result.totalTags).toBe(0);
      expect(result.totalCategories).toBe(0);
    });

    it('should handle empty content directories', () => {
      mockGetAllPosts.mockReturnValue([]);
      mockGetAllPages.mockReturnValue([]);

      const result = getContentStats();

      expect(result.totalPosts).toBe(0);
      expect(result.totalPages).toBe(0);
      expect(result.postsByLocale.en).toBe(0);
      expect(result.postsByLocale.zh).toBe(0);
      expect(result.pagesByLocale.en).toBe(0);
      expect(result.pagesByLocale.zh).toBe(0);
    });

    it('should iterate over all supported locales from config', () => {
      mockGetAllPosts.mockReturnValue([]);
      mockGetAllPages.mockReturnValue([]);

      getContentStats();

      // Should be called twice for each locale (en, zh)
      expect(mockGetAllPosts).toHaveBeenCalledTimes(2);
      expect(mockGetAllPages).toHaveBeenCalledTimes(2);
      expect(mockGetAllPosts).toHaveBeenCalledWith('en');
      expect(mockGetAllPosts).toHaveBeenCalledWith('zh');
      expect(mockGetAllPages).toHaveBeenCalledWith('en');
      expect(mockGetAllPages).toHaveBeenCalledWith('zh');
    });

    it('should handle single locale configuration', () => {
      mockGetContentConfig.mockReturnValue(
        createMockContentConfig({ supportedLocales: ['en'] }),
      );
      const enPosts = [createMockBlogPost()];
      const enPages = [createMockPage()];

      mockGetAllPosts.mockReturnValue(enPosts);
      mockGetAllPages.mockReturnValue(enPages);

      const result = getContentStats();

      expect(mockGetAllPosts).toHaveBeenCalledTimes(1);
      expect(mockGetAllPages).toHaveBeenCalledTimes(1);
      expect(result.totalPosts).toBe(1);
      expect(result.totalPages).toBe(1);
      expect(result.postsByLocale.en).toBe(1);
    });

    it('should correctly accumulate totals across locales', () => {
      const enPosts = Array.from({ length: 5 }, (_, i) =>
        createMockBlogPost({ slug: `en-post-${i}` }),
      );
      const zhPosts = Array.from({ length: 3 }, (_, i) =>
        createMockBlogPost({ slug: `zh-post-${i}` }),
      );

      mockGetAllPosts.mockReturnValueOnce(enPosts).mockReturnValueOnce(zhPosts);
      mockGetAllPages.mockReturnValue([]);

      const result = getContentStats();

      expect(result.totalPosts).toBe(8);
      expect(result.postsByLocale.en).toBe(5);
      expect(result.postsByLocale.zh).toBe(3);
    });

    it('should only set locale-specific counts for known locales (en, zh)', () => {
      // This tests the explicit locale validation in the implementation
      mockGetContentConfig.mockReturnValue(
        createMockContentConfig({ supportedLocales: ['en', 'zh'] }),
      );

      const enPosts = [createMockBlogPost()];
      const zhPosts = [createMockBlogPost(), createMockBlogPost()];

      mockGetAllPosts.mockReturnValueOnce(enPosts).mockReturnValueOnce(zhPosts);
      mockGetAllPages.mockReturnValue([]);

      const result = getContentStats();

      // Verify both locales are properly assigned
      expect(result.postsByLocale).toHaveProperty('en');
      expect(result.postsByLocale).toHaveProperty('zh');
      expect(result.postsByLocale.en).toBe(1);
      expect(result.postsByLocale.zh).toBe(2);
    });

    it('should handle large number of posts efficiently', () => {
      const largePosts = Array.from({ length: 100 }, (_, i) =>
        createMockBlogPost({ slug: `post-${i}` }),
      );
      const largePages = Array.from({ length: 50 }, (_, i) =>
        createMockPage({ slug: `page-${i}` }),
      );

      mockGetAllPosts.mockReturnValue(largePosts);
      mockGetAllPages.mockReturnValue(largePages);

      const result = getContentStats();

      expect(result.totalPosts).toBe(200); // 100 * 2 locales
      expect(result.totalPages).toBe(100); // 50 * 2 locales
    });

    it('should return correct structure with all required fields', () => {
      mockGetAllPosts.mockReturnValue([]);
      mockGetAllPages.mockReturnValue([]);

      const result = getContentStats();

      expect(result).toHaveProperty('totalPosts');
      expect(result).toHaveProperty('totalPages');
      expect(result).toHaveProperty('postsByLocale');
      expect(result).toHaveProperty('pagesByLocale');
      expect(result).toHaveProperty('totalTags');
      expect(result).toHaveProperty('totalCategories');
      expect(result).toHaveProperty('lastUpdated');
    });

    it('should handle asymmetric content across locales', () => {
      const enPosts = [
        createMockBlogPost({ slug: 'post-1' }),
        createMockBlogPost({ slug: 'post-2' }),
        createMockBlogPost({ slug: 'post-3' }),
      ];
      const zhPosts: BlogPost[] = []; // No Chinese posts

      mockGetAllPosts.mockReturnValueOnce(enPosts).mockReturnValueOnce(zhPosts);
      mockGetAllPages.mockReturnValue([]);

      const result = getContentStats();

      expect(result.postsByLocale.en).toBe(3);
      expect(result.postsByLocale.zh).toBe(0);
      expect(result.totalPosts).toBe(3);
    });

    it('should use getContentConfig to determine supported locales', () => {
      mockGetAllPosts.mockReturnValue([]);
      mockGetAllPages.mockReturnValue([]);

      getContentStats();

      expect(mockGetContentConfig).toHaveBeenCalled();
    });
  });
});
