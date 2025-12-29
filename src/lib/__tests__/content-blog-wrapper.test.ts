import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { BlogPost, BlogPostMetadata, Locale } from '@/types/content.types';
// Import after mocks so that the wrapper uses the mocked content-query functions.
import { getAllPostsCached, getPostBySlugCached } from '@/lib/content/blog';

// Use vi.hoisted to ensure mocks are set up before the module under test is imported.
const { mockGetAllPosts, mockGetPostBySlug } = vi.hoisted(() => ({
  mockGetAllPosts: vi.fn(),
  mockGetPostBySlug: vi.fn(),
}));

vi.mock('@/lib/content-query', () => ({
  getAllPosts: mockGetAllPosts,
  getPostBySlug: mockGetPostBySlug,
}));

// Mock the blog module to avoid 'use cache' directive issues in test environment
vi.mock('@/lib/content/blog', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/content/blog')>();
  return {
    ...actual,
    // Re-export the actual functions but they'll use the mocked content-query
  };
});

function createBlogPost(
  locale: Locale,
  overrides: Partial<BlogPostMetadata> = {},
): BlogPost {
  const metadata: BlogPostMetadata = {
    title: 'Test Post',
    description: 'Test description',
    slug: 'test-post',
    publishedAt: '2024-01-01',
    updatedAt: '2024-01-02',
    tags: ['test'],
    categories: ['category'],
    featured: false,
    draft: false,
    seo: {
      title: 'SEO Title',
      description: 'SEO Description',
      keywords: ['test', 'post'],
      ogImage: '/images/og/test-post.png',
    },
    ...overrides,
  };

  return {
    metadata,
    content: '# Test Content',
    slug: metadata.slug,
    filePath: `/mock/content/posts/${locale}/${metadata.slug}.mdx`,
    excerpt: metadata.excerpt ?? 'Test excerpt',
  };
}

describe('content blog wrappers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAllPostsCached', () => {
    it('should return mapped PostSummary list and forward options', async () => {
      const locale: Locale = 'en';

      const posts: BlogPost[] = [
        createBlogPost(locale, {
          title: 'Post 1',
          slug: 'post-1',
          tags: ['tag1'],
          categories: ['cat1'],
          excerpt: 'Excerpt 1',
          readingTime: 5,
          coverImage: '/images/post-1.png',
        }),
        createBlogPost(locale, {
          title: 'Post 2',
          slug: 'post-2',
          featured: true,
        }),
      ];

      mockGetAllPosts.mockReturnValue(posts);

      const result = await getAllPostsCached(locale, {
        limit: 10,
        offset: 0,
        sortBy: 'publishedAt',
        sortOrder: 'desc',
        tags: ['tag1'],
        categories: ['cat1'],
        featured: false,
        draft: false,
      });

      expect(mockGetAllPosts).toHaveBeenCalledTimes(1);
      expect(mockGetAllPosts).toHaveBeenCalledWith(locale, {
        limit: 10,
        offset: 0,
        sortBy: 'publishedAt',
        sortOrder: 'desc',
        tags: ['tag1'],
        categories: ['cat1'],
        featured: false,
        draft: false,
      });

      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({
        slug: 'post-1',
        locale,
        title: 'Post 1',
        description: 'Test description',
        tags: ['tag1'],
        categories: ['cat1'],
        featured: false,
        excerpt: 'Excerpt 1',
        readingTime: 5,
        coverImage: '/images/post-1.png',
        seo: {
          title: 'SEO Title',
          description: 'SEO Description',
        },
      });
    });

    it('should return empty array when there are no posts', async () => {
      const locale: Locale = 'en';

      mockGetAllPosts.mockReturnValue([]);

      const result = await getAllPostsCached(locale);

      expect(mockGetAllPosts).toHaveBeenCalledTimes(1);
      expect(result).toEqual([]);
    });
  });

  describe('getPostBySlugCached', () => {
    it('should return mapped PostDetail for a given slug', async () => {
      const locale: Locale = 'zh';
      const slug = 'post-zh';

      const post = createBlogPost(locale, {
        title: '中文文章',
        slug,
        relatedPosts: ['post-1', 'post-2'],
      });

      mockGetPostBySlug.mockReturnValue(post);

      const result = await getPostBySlugCached(locale, slug);

      expect(mockGetPostBySlug).toHaveBeenCalledTimes(1);
      expect(mockGetPostBySlug).toHaveBeenCalledWith(slug, locale);

      expect(result).toMatchObject({
        slug,
        locale,
        title: '中文文章',
        content: '# Test Content',
        filePath: post.filePath,
        relatedPosts: ['post-1', 'post-2'],
      });
    });

    it('should propagate errors from underlying getPostBySlug', async () => {
      const locale: Locale = 'en';
      const slug = 'missing-post';

      const error = new Error('Content not found');
      mockGetPostBySlug.mockImplementation(() => {
        throw error;
      });

      await expect(getPostBySlugCached(locale, slug)).rejects.toBe(error);
      expect(mockGetPostBySlug).toHaveBeenCalledTimes(1);
      expect(mockGetPostBySlug).toHaveBeenCalledWith(slug, locale);
    });
  });
});
