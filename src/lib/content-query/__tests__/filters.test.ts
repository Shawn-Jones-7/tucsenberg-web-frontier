/**
 * Unit tests for content-query filters module
 *
 * Tests cover all filter functions:
 * - isDraftAllowed
 * - matchesFeaturedFilter
 * - matchesTags
 * - matchesCategories
 * - filterPosts
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import type {
  BlogPost,
  BlogPostMetadata,
  ContentConfig,
  ContentQueryOptions,
  ParsedContent,
} from '@/types/content.types';
// Import after mocking
import {
  filterPosts,
  isDraftAllowed,
  matchesCategories,
  matchesFeaturedFilter,
  matchesTags,
} from '@/lib/content-query/filters';

// Mock getContentConfig before importing filters
const mockGetContentConfig = vi.fn<() => ContentConfig>();
vi.mock('@/lib/content-utils', () => ({
  getContentConfig: () => mockGetContentConfig(),
}));

// Factory function for creating mock BlogPostMetadata
function createMockBlogPostMetadata(
  overrides?: Partial<BlogPostMetadata>,
): BlogPostMetadata {
  return {
    title: 'Test Post',
    slug: 'test-post',
    publishedAt: '2024-01-15',
    description: 'Test description',
    draft: false,
    featured: false,
    tags: [],
    categories: [],
    ...overrides,
  };
}

// Factory function for creating mock ParsedContent<BlogPostMetadata>
function createMockParsedContent(
  overrides?: Partial<ParsedContent<BlogPostMetadata>>,
): ParsedContent<BlogPostMetadata> {
  const { metadata: metadataOverrides, ...restOverrides } = overrides ?? {};
  return {
    slug: restOverrides?.slug ?? 'test-post',
    content: restOverrides?.content ?? 'Test content body',
    filePath: restOverrides?.filePath ?? '/content/posts/en/test-post.mdx',
    ...restOverrides,
    metadata: createMockBlogPostMetadata(metadataOverrides),
  };
}

// Factory function for creating mock BlogPost
function _createMockBlogPost(overrides?: Partial<BlogPost>): BlogPost {
  const parsedContent = createMockParsedContent(overrides);
  return parsedContent as BlogPost;
}

// Factory function for creating mock ContentConfig
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

describe('content-query/filters', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetContentConfig.mockReturnValue(createMockContentConfig());
  });

  describe('isDraftAllowed', () => {
    it('should allow non-draft posts regardless of config', () => {
      const post = createMockParsedContent({
        metadata: { draft: false } as BlogPostMetadata,
      });
      const options: ContentQueryOptions = {};

      expect(isDraftAllowed(post, options)).toBe(true);
    });

    it('should filter draft posts in production when enableDrafts is false', () => {
      mockGetContentConfig.mockReturnValue(
        createMockContentConfig({ enableDrafts: false }),
      );
      const post = createMockParsedContent({
        metadata: { draft: true } as BlogPostMetadata,
      });
      const options: ContentQueryOptions = {};

      expect(isDraftAllowed(post, options)).toBe(false);
    });

    it('should allow draft posts when enableDrafts is true', () => {
      mockGetContentConfig.mockReturnValue(
        createMockContentConfig({ enableDrafts: true }),
      );
      const post = createMockParsedContent({
        metadata: { draft: true } as BlogPostMetadata,
      });
      const options: ContentQueryOptions = {};

      expect(isDraftAllowed(post, options)).toBe(true);
    });

    it('should filter by options.draft when specified as true', () => {
      mockGetContentConfig.mockReturnValue(
        createMockContentConfig({ enableDrafts: true }),
      );
      const nonDraftPost = createMockParsedContent({
        metadata: { draft: false } as BlogPostMetadata,
      });
      const draftPost = createMockParsedContent({
        metadata: { draft: true } as BlogPostMetadata,
      });
      const options: ContentQueryOptions = { draft: true };

      expect(isDraftAllowed(nonDraftPost, options)).toBe(false);
      expect(isDraftAllowed(draftPost, options)).toBe(true);
    });

    it('should filter by options.draft when specified as false', () => {
      mockGetContentConfig.mockReturnValue(
        createMockContentConfig({ enableDrafts: true }),
      );
      const nonDraftPost = createMockParsedContent({
        metadata: { draft: false } as BlogPostMetadata,
      });
      const draftPost = createMockParsedContent({
        metadata: { draft: true } as BlogPostMetadata,
      });
      const options: ContentQueryOptions = { draft: false };

      expect(isDraftAllowed(nonDraftPost, options)).toBe(true);
      expect(isDraftAllowed(draftPost, options)).toBe(false);
    });

    it('should handle undefined draft metadata', () => {
      const post = createMockParsedContent({
        metadata: { draft: undefined } as unknown as BlogPostMetadata,
      });
      const options: ContentQueryOptions = {};

      expect(isDraftAllowed(post, options)).toBe(true);
    });

    it('should prioritize production config over options when drafts disabled', () => {
      mockGetContentConfig.mockReturnValue(
        createMockContentConfig({ enableDrafts: false }),
      );
      const draftPost = createMockParsedContent({
        metadata: { draft: true } as BlogPostMetadata,
      });
      // Even if options ask for drafts, config blocks them
      const options: ContentQueryOptions = { draft: true };

      expect(isDraftAllowed(draftPost, options)).toBe(false);
    });
  });

  describe('matchesFeaturedFilter', () => {
    it('should return true when no featured filter specified', () => {
      const post = createMockParsedContent({
        metadata: { featured: false } as BlogPostMetadata,
      });
      const options: ContentQueryOptions = {};

      expect(matchesFeaturedFilter(post, options)).toBe(true);
    });

    it('should return true when post matches featured=true filter', () => {
      const post = createMockParsedContent({
        metadata: { featured: true } as BlogPostMetadata,
      });
      const options: ContentQueryOptions = { featured: true };

      expect(matchesFeaturedFilter(post, options)).toBe(true);
    });

    it('should return false when post does not match featured=true filter', () => {
      const post = createMockParsedContent({
        metadata: { featured: false } as BlogPostMetadata,
      });
      const options: ContentQueryOptions = { featured: true };

      expect(matchesFeaturedFilter(post, options)).toBe(false);
    });

    it('should return true when post matches featured=false filter', () => {
      const post = createMockParsedContent({
        metadata: { featured: false } as BlogPostMetadata,
      });
      const options: ContentQueryOptions = { featured: false };

      expect(matchesFeaturedFilter(post, options)).toBe(true);
    });

    it('should return false when post does not match featured=false filter', () => {
      const post = createMockParsedContent({
        metadata: { featured: true } as BlogPostMetadata,
      });
      const options: ContentQueryOptions = { featured: false };

      expect(matchesFeaturedFilter(post, options)).toBe(false);
    });

    it('should handle undefined featured metadata', () => {
      const post = createMockParsedContent({
        metadata: { featured: undefined } as unknown as BlogPostMetadata,
      });
      const options: ContentQueryOptions = { featured: true };

      expect(matchesFeaturedFilter(post, options)).toBe(false);
    });
  });

  describe('matchesTags', () => {
    it('should return true when no tags filter specified', () => {
      const post = createMockParsedContent({
        metadata: { tags: ['javascript', 'react'] } as BlogPostMetadata,
      });

      expect(matchesTags(post, undefined)).toBe(true);
    });

    it('should return true when post has at least one matching tag', () => {
      const post = createMockParsedContent({
        metadata: {
          tags: ['javascript', 'react', 'typescript'],
        } as BlogPostMetadata,
      });

      expect(matchesTags(post, ['react', 'vue'])).toBe(true);
    });

    it('should return false when post has no matching tags', () => {
      const post = createMockParsedContent({
        metadata: { tags: ['javascript', 'react'] } as BlogPostMetadata,
      });

      expect(matchesTags(post, ['vue', 'angular'])).toBe(false);
    });

    it('should return false when post has no tags and filter is specified', () => {
      // Create post with no tags property (simulating missing tags)
      const metadata = createMockBlogPostMetadata();
      delete (metadata as Partial<BlogPostMetadata>).tags;
      const post = createMockParsedContent({ metadata });

      expect(matchesTags(post, ['javascript'])).toBe(false);
    });

    it('should return false when post has empty tags array and filter is empty array', () => {
      // Empty array is truthy, some() on empty array returns false
      // so the condition becomes: if ([] && !false) => if (true) => return false
      const post = createMockParsedContent({
        metadata: createMockBlogPostMetadata({ tags: [] }),
      });

      expect(matchesTags(post, [])).toBe(false);
    });

    it('should return false when post has empty tags array and filter is specified', () => {
      const post = createMockParsedContent({
        metadata: createMockBlogPostMetadata({ tags: [] }),
      });

      expect(matchesTags(post, ['javascript'])).toBe(false);
    });

    it('should match with multiple overlapping tags', () => {
      const post = createMockParsedContent({
        metadata: { tags: ['a', 'b', 'c'] } as BlogPostMetadata,
      });

      expect(matchesTags(post, ['b', 'c', 'd'])).toBe(true);
    });
  });

  describe('matchesCategories', () => {
    it('should return true when no categories filter specified', () => {
      const post = createMockParsedContent({
        metadata: { categories: ['tech', 'news'] } as BlogPostMetadata,
      });

      expect(matchesCategories(post, undefined)).toBe(true);
    });

    it('should return true when post has at least one matching category', () => {
      const post = createMockParsedContent({
        metadata: {
          categories: ['tech', 'news', 'tutorial'],
        } as BlogPostMetadata,
      });

      expect(matchesCategories(post, ['news', 'review'])).toBe(true);
    });

    it('should return false when post has no matching categories', () => {
      const post = createMockParsedContent({
        metadata: { categories: ['tech', 'news'] } as BlogPostMetadata,
      });

      expect(matchesCategories(post, ['review', 'opinion'])).toBe(false);
    });

    it('should return false when post has no categories and filter is specified', () => {
      // Create post with no categories property (simulating missing categories)
      const metadata = createMockBlogPostMetadata();
      delete (metadata as Partial<BlogPostMetadata>).categories;
      const post = createMockParsedContent({ metadata });

      expect(matchesCategories(post, ['tech'])).toBe(false);
    });

    it('should return false when post has empty categories array and filter is empty array', () => {
      // Empty array is truthy, some() on empty array returns false
      // so the condition becomes: if ([] && !false) => if (true) => return false
      const post = createMockParsedContent({
        metadata: createMockBlogPostMetadata({ categories: [] }),
      });

      expect(matchesCategories(post, [])).toBe(false);
    });

    it('should return false when post has empty categories and filter is specified', () => {
      const post = createMockParsedContent({
        metadata: createMockBlogPostMetadata({ categories: [] }),
      });

      expect(matchesCategories(post, ['tech'])).toBe(false);
    });
  });

  describe('filterPosts', () => {
    it('should return all posts when no filters applied', () => {
      const posts = [
        createMockParsedContent({ slug: 'post-1' }),
        createMockParsedContent({ slug: 'post-2' }),
        createMockParsedContent({ slug: 'post-3' }),
      ];
      const options: ContentQueryOptions = {};

      const result = filterPosts(posts, options);

      expect(result).toHaveLength(3);
    });

    it('should filter by draft status', () => {
      mockGetContentConfig.mockReturnValue(
        createMockContentConfig({ enableDrafts: false }),
      );
      const posts = [
        createMockParsedContent({
          slug: 'published',
          metadata: { draft: false } as BlogPostMetadata,
        }),
        createMockParsedContent({
          slug: 'draft',
          metadata: { draft: true } as BlogPostMetadata,
        }),
      ];
      const options: ContentQueryOptions = {};

      const result = filterPosts(posts, options);

      expect(result).toHaveLength(1);
      expect(result[0]!.slug).toBe('published');
    });

    it('should filter by featured status', () => {
      const posts = [
        createMockParsedContent({
          slug: 'featured',
          metadata: { featured: true } as BlogPostMetadata,
        }),
        createMockParsedContent({
          slug: 'not-featured',
          metadata: { featured: false } as BlogPostMetadata,
        }),
      ];
      const options: ContentQueryOptions = { featured: true };

      const result = filterPosts(posts, options);

      expect(result).toHaveLength(1);
      expect(result[0]!.slug).toBe('featured');
    });

    it('should filter by tags', () => {
      const posts = [
        createMockParsedContent({
          slug: 'react-post',
          metadata: { tags: ['react', 'javascript'] } as BlogPostMetadata,
        }),
        createMockParsedContent({
          slug: 'vue-post',
          metadata: { tags: ['vue', 'javascript'] } as BlogPostMetadata,
        }),
      ];
      const options: ContentQueryOptions = { tags: ['react'] };

      const result = filterPosts(posts, options);

      expect(result).toHaveLength(1);
      expect(result[0]!.slug).toBe('react-post');
    });

    it('should filter by categories', () => {
      const posts = [
        createMockParsedContent({
          slug: 'tech-post',
          metadata: { categories: ['tech'] } as BlogPostMetadata,
        }),
        createMockParsedContent({
          slug: 'news-post',
          metadata: { categories: ['news'] } as BlogPostMetadata,
        }),
      ];
      const options: ContentQueryOptions = { categories: ['tech'] };

      const result = filterPosts(posts, options);

      expect(result).toHaveLength(1);
      expect(result[0]!.slug).toBe('tech-post');
    });

    it('should apply multiple filters together (AND logic)', () => {
      mockGetContentConfig.mockReturnValue(
        createMockContentConfig({ enableDrafts: true }),
      );
      const posts = [
        createMockParsedContent({
          slug: 'match-all',
          metadata: {
            draft: false,
            featured: true,
            tags: ['react'],
            categories: ['tech'],
          } as BlogPostMetadata,
        }),
        createMockParsedContent({
          slug: 'wrong-featured',
          metadata: {
            draft: false,
            featured: false,
            tags: ['react'],
            categories: ['tech'],
          } as BlogPostMetadata,
        }),
        createMockParsedContent({
          slug: 'wrong-tag',
          metadata: {
            draft: false,
            featured: true,
            tags: ['vue'],
            categories: ['tech'],
          } as BlogPostMetadata,
        }),
        createMockParsedContent({
          slug: 'wrong-category',
          metadata: {
            draft: false,
            featured: true,
            tags: ['react'],
            categories: ['news'],
          } as BlogPostMetadata,
        }),
      ];
      const options: ContentQueryOptions = {
        featured: true,
        tags: ['react'],
        categories: ['tech'],
      };

      const result = filterPosts(posts, options);

      expect(result).toHaveLength(1);
      expect(result[0]!.slug).toBe('match-all');
    });

    it('should return empty array when no posts match', () => {
      const posts = [
        createMockParsedContent({
          slug: 'post-1',
          metadata: { tags: ['vue'] } as BlogPostMetadata,
        }),
        createMockParsedContent({
          slug: 'post-2',
          metadata: { tags: ['angular'] } as BlogPostMetadata,
        }),
      ];
      const options: ContentQueryOptions = { tags: ['react'] };

      const result = filterPosts(posts, options);

      expect(result).toHaveLength(0);
    });

    it('should return empty array when input is empty', () => {
      const posts: ParsedContent<BlogPostMetadata>[] = [];
      const options: ContentQueryOptions = {};

      const result = filterPosts(posts, options);

      expect(result).toHaveLength(0);
    });

    it('should filter drafts when requesting draft: false explicitly', () => {
      mockGetContentConfig.mockReturnValue(
        createMockContentConfig({ enableDrafts: true }),
      );
      const posts = [
        createMockParsedContent({
          slug: 'published',
          metadata: { draft: false } as BlogPostMetadata,
        }),
        createMockParsedContent({
          slug: 'draft',
          metadata: { draft: true } as BlogPostMetadata,
        }),
      ];
      const options: ContentQueryOptions = { draft: false };

      const result = filterPosts(posts, options);

      expect(result).toHaveLength(1);
      expect(result[0]!.slug).toBe('published');
    });

    it('should filter only drafts when requesting draft: true', () => {
      mockGetContentConfig.mockReturnValue(
        createMockContentConfig({ enableDrafts: true }),
      );
      const posts = [
        createMockParsedContent({
          slug: 'published',
          metadata: { draft: false } as BlogPostMetadata,
        }),
        createMockParsedContent({
          slug: 'draft',
          metadata: { draft: true } as BlogPostMetadata,
        }),
      ];
      const options: ContentQueryOptions = { draft: true };

      const result = filterPosts(posts, options);

      expect(result).toHaveLength(1);
      expect(result[0]!.slug).toBe('draft');
    });

    it('should cast result to BlogPost array', () => {
      const posts = [createMockParsedContent({ slug: 'post-1' })];
      const options: ContentQueryOptions = {};

      const result = filterPosts(posts, options);

      // Verify the result is typed as BlogPost[]
      expect(result[0]!).toHaveProperty('metadata');
      expect(result[0]!).toHaveProperty('content');
      expect(result[0]!).toHaveProperty('slug');
      expect(result[0]!).toHaveProperty('filePath');
    });
  });
});
