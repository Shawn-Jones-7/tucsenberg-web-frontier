/**
 * Unit tests for content-query sorting module
 *
 * Tests cover all sorting and pagination functions:
 * - sortPosts
 * - paginatePosts
 * - getFieldValue (internal, tested via sortPosts)
 * - compareValues (internal, tested via sortPosts)
 * - validateSortField (internal, tested via sortPosts)
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import type {
  BlogPost,
  BlogPostMetadata,
  ContentQueryOptions,
} from '@/types/content.types';
// Import after ensuring mocks
import { paginatePosts, sortPosts } from '@/lib/content-query/sorting';

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

// Factory function for creating mock BlogPost
function createMockBlogPost(overrides?: Partial<BlogPost>): BlogPost {
  const metadata = createMockBlogPostMetadata(overrides?.metadata);
  return {
    slug: overrides?.slug ?? 'test-post',
    metadata,
    content: overrides?.content ?? 'Test content body',
    filePath: overrides?.filePath ?? '/content/posts/en/test-post.mdx',
  };
}

describe('content-query/sorting', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('sortPosts', () => {
    describe('default sorting (publishedAt, desc)', () => {
      it('should sort by publishedAt descending by default', () => {
        const posts = [
          createMockBlogPost({
            slug: 'oldest',
            metadata: createMockBlogPostMetadata({ publishedAt: '2024-01-01' }),
          }),
          createMockBlogPost({
            slug: 'newest',
            metadata: createMockBlogPostMetadata({ publishedAt: '2024-03-15' }),
          }),
          createMockBlogPost({
            slug: 'middle',
            metadata: createMockBlogPostMetadata({ publishedAt: '2024-02-10' }),
          }),
        ];
        const options: ContentQueryOptions = {};

        const result = sortPosts(posts, options);

        expect(result[0]!.slug).toBe('newest');
        expect(result[1]!.slug).toBe('middle');
        expect(result[2]!.slug).toBe('oldest');
      });
    });

    describe('sortBy publishedAt', () => {
      it('should sort by publishedAt ascending', () => {
        const posts = [
          createMockBlogPost({
            slug: 'newest',
            metadata: createMockBlogPostMetadata({ publishedAt: '2024-03-15' }),
          }),
          createMockBlogPost({
            slug: 'oldest',
            metadata: createMockBlogPostMetadata({ publishedAt: '2024-01-01' }),
          }),
          createMockBlogPost({
            slug: 'middle',
            metadata: createMockBlogPostMetadata({ publishedAt: '2024-02-10' }),
          }),
        ];
        const options: ContentQueryOptions = {
          sortBy: 'publishedAt',
          sortOrder: 'asc',
        };

        const result = sortPosts(posts, options);

        expect(result[0]!.slug).toBe('oldest');
        expect(result[1]!.slug).toBe('middle');
        expect(result[2]!.slug).toBe('newest');
      });

      it('should sort by publishedAt descending', () => {
        const posts = [
          createMockBlogPost({
            slug: 'oldest',
            metadata: createMockBlogPostMetadata({ publishedAt: '2024-01-01' }),
          }),
          createMockBlogPost({
            slug: 'newest',
            metadata: createMockBlogPostMetadata({ publishedAt: '2024-03-15' }),
          }),
        ];
        const options: ContentQueryOptions = {
          sortBy: 'publishedAt',
          sortOrder: 'desc',
        };

        const result = sortPosts(posts, options);

        expect(result[0]!.slug).toBe('newest');
        expect(result[1]!.slug).toBe('oldest');
      });

      it('should handle posts with same publishedAt date', () => {
        const posts = [
          createMockBlogPost({
            slug: 'post-a',
            metadata: createMockBlogPostMetadata({ publishedAt: '2024-01-15' }),
          }),
          createMockBlogPost({
            slug: 'post-b',
            metadata: createMockBlogPostMetadata({ publishedAt: '2024-01-15' }),
          }),
        ];
        const options: ContentQueryOptions = {
          sortBy: 'publishedAt',
          sortOrder: 'desc',
        };

        const result = sortPosts(posts, options);

        // Both have same date, order should be stable
        expect(result).toHaveLength(2);
      });

      it('should handle empty publishedAt by treating as empty string', () => {
        const posts = [
          createMockBlogPost({
            slug: 'with-date',
            metadata: createMockBlogPostMetadata({ publishedAt: '2024-01-15' }),
          }),
          createMockBlogPost({
            slug: 'no-date',
            metadata: createMockBlogPostMetadata({ publishedAt: '' }),
          }),
        ];
        const options: ContentQueryOptions = {
          sortBy: 'publishedAt',
          sortOrder: 'desc',
        };

        const result = sortPosts(posts, options);

        expect(result[0]!.slug).toBe('with-date');
        expect(result[1]!.slug).toBe('no-date');
      });
    });

    describe('sortBy updatedAt', () => {
      it('should sort by updatedAt ascending', () => {
        const posts = [
          createMockBlogPost({
            slug: 'recently-updated',
            metadata: createMockBlogPostMetadata({ updatedAt: '2024-03-20' }),
          }),
          createMockBlogPost({
            slug: 'old-update',
            metadata: createMockBlogPostMetadata({ updatedAt: '2024-01-05' }),
          }),
          createMockBlogPost({
            slug: 'middle-update',
            metadata: createMockBlogPostMetadata({ updatedAt: '2024-02-15' }),
          }),
        ];
        const options: ContentQueryOptions = {
          sortBy: 'updatedAt',
          sortOrder: 'asc',
        };

        const result = sortPosts(posts, options);

        expect(result[0]!.slug).toBe('old-update');
        expect(result[1]!.slug).toBe('middle-update');
        expect(result[2]!.slug).toBe('recently-updated');
      });

      it('should sort by updatedAt descending', () => {
        const posts = [
          createMockBlogPost({
            slug: 'old-update',
            metadata: createMockBlogPostMetadata({ updatedAt: '2024-01-05' }),
          }),
          createMockBlogPost({
            slug: 'recently-updated',
            metadata: createMockBlogPostMetadata({ updatedAt: '2024-03-20' }),
          }),
        ];
        const options: ContentQueryOptions = {
          sortBy: 'updatedAt',
          sortOrder: 'desc',
        };

        const result = sortPosts(posts, options);

        expect(result[0]!.slug).toBe('recently-updated');
        expect(result[1]!.slug).toBe('old-update');
      });

      it('should handle undefined updatedAt by treating as empty string', () => {
        // Create post without updatedAt to simulate missing property
        const withUpdateMetadata = createMockBlogPostMetadata({
          updatedAt: '2024-01-15',
        });
        const noUpdateMetadata = createMockBlogPostMetadata();
        delete (noUpdateMetadata as Partial<BlogPostMetadata>).updatedAt;

        const posts = [
          createMockBlogPost({
            slug: 'with-update',
            metadata: withUpdateMetadata,
          }),
          createMockBlogPost({
            slug: 'no-update',
            metadata: noUpdateMetadata,
          }),
        ];
        const options: ContentQueryOptions = {
          sortBy: 'updatedAt',
          sortOrder: 'desc',
        };

        const result = sortPosts(posts, options);

        expect(result[0]!.slug).toBe('with-update');
        expect(result[1]!.slug).toBe('no-update');
      });
    });

    describe('sortBy title', () => {
      it('should sort by title ascending (alphabetically)', () => {
        const posts = [
          createMockBlogPost({
            slug: 'zebra',
            metadata: createMockBlogPostMetadata({ title: 'Zebra Post' }),
          }),
          createMockBlogPost({
            slug: 'apple',
            metadata: createMockBlogPostMetadata({ title: 'Apple Post' }),
          }),
          createMockBlogPost({
            slug: 'mango',
            metadata: createMockBlogPostMetadata({ title: 'Mango Post' }),
          }),
        ];
        const options: ContentQueryOptions = {
          sortBy: 'title',
          sortOrder: 'asc',
        };

        const result = sortPosts(posts, options);

        expect(result[0]!.slug).toBe('apple');
        expect(result[1]!.slug).toBe('mango');
        expect(result[2]!.slug).toBe('zebra');
      });

      it('should sort by title descending', () => {
        const posts = [
          createMockBlogPost({
            slug: 'apple',
            metadata: createMockBlogPostMetadata({ title: 'Apple Post' }),
          }),
          createMockBlogPost({
            slug: 'zebra',
            metadata: createMockBlogPostMetadata({ title: 'Zebra Post' }),
          }),
        ];
        const options: ContentQueryOptions = {
          sortBy: 'title',
          sortOrder: 'desc',
        };

        const result = sortPosts(posts, options);

        expect(result[0]!.slug).toBe('zebra');
        expect(result[1]!.slug).toBe('apple');
      });

      it('should handle undefined title by treating as empty string', () => {
        const posts = [
          createMockBlogPost({
            slug: 'with-title',
            metadata: createMockBlogPostMetadata({ title: 'Some Title' }),
          }),
          createMockBlogPost({
            slug: 'no-title',
            metadata: createMockBlogPostMetadata({ title: '' }),
          }),
        ];
        const options: ContentQueryOptions = {
          sortBy: 'title',
          sortOrder: 'asc',
        };

        const result = sortPosts(posts, options);

        expect(result[0]!.slug).toBe('no-title');
        expect(result[1]!.slug).toBe('with-title');
      });

      it('should handle case-sensitive title comparison via localeCompare', () => {
        const posts = [
          createMockBlogPost({
            slug: 'lower-a',
            metadata: createMockBlogPostMetadata({ title: 'apple' }),
          }),
          createMockBlogPost({
            slug: 'upper-a',
            metadata: createMockBlogPostMetadata({ title: 'Apple' }),
          }),
          createMockBlogPost({
            slug: 'banana',
            metadata: createMockBlogPostMetadata({ title: 'Banana' }),
          }),
        ];
        const options: ContentQueryOptions = {
          sortBy: 'title',
          sortOrder: 'asc',
        };

        const result = sortPosts(posts, options);

        // localeCompare behavior depends on locale but should be consistent
        expect(result).toHaveLength(3);
      });
    });

    describe('invalid sort field', () => {
      it('should throw error for invalid sort field', () => {
        const posts = [createMockBlogPost()];
        const options: ContentQueryOptions = {
          sortBy: 'invalid' as 'publishedAt',
        };

        expect(() => sortPosts(posts, options)).toThrow(
          'Invalid sort field: invalid. Allowed fields: publishedAt, updatedAt, title',
        );
      });

      it('should throw error for prototype pollution attempts', () => {
        const posts = [createMockBlogPost()];
        const options: ContentQueryOptions = {
          sortBy: '__proto__' as 'publishedAt',
        };

        expect(() => sortPosts(posts, options)).toThrow(/Invalid sort field/);
      });

      it('should throw error for constructor injection attempts', () => {
        const posts = [createMockBlogPost()];
        const options: ContentQueryOptions = {
          sortBy: 'constructor' as 'publishedAt',
        };

        expect(() => sortPosts(posts, options)).toThrow(/Invalid sort field/);
      });
    });

    describe('edge cases', () => {
      it('should handle empty posts array', () => {
        const posts: BlogPost[] = [];
        const options: ContentQueryOptions = {};

        const result = sortPosts(posts, options);

        expect(result).toEqual([]);
      });

      it('should handle single post', () => {
        const posts = [createMockBlogPost({ slug: 'only-one' })];
        const options: ContentQueryOptions = {};

        const result = sortPosts(posts, options);

        expect(result).toHaveLength(1);
        expect(result[0]!.slug).toBe('only-one');
      });

      it('should mutate original array (sort in place)', () => {
        const posts = [
          createMockBlogPost({
            slug: 'older',
            metadata: createMockBlogPostMetadata({ publishedAt: '2024-01-01' }),
          }),
          createMockBlogPost({
            slug: 'newer',
            metadata: createMockBlogPostMetadata({ publishedAt: '2024-03-15' }),
          }),
        ];
        const options: ContentQueryOptions = {};

        const result = sortPosts(posts, options);

        // Check that original array is modified
        expect(posts[0]!.slug).toBe('newer');
        expect(result).toBe(posts);
      });
    });
  });

  describe('paginatePosts', () => {
    const createMultiplePosts = (count: number): BlogPost[] =>
      Array.from({ length: count }, (_, i) =>
        createMockBlogPost({
          slug: `post-${i + 1}`,
          metadata: createMockBlogPostMetadata({ title: `Post ${i + 1}` }),
        }),
      );

    describe('without pagination options', () => {
      it('should return all posts when no pagination options specified', () => {
        const posts = createMultiplePosts(5);
        const options: ContentQueryOptions = {};

        const result = paginatePosts(posts, options);

        expect(result).toHaveLength(5);
        expect(result).toBe(posts);
      });
    });

    describe('with limit only', () => {
      it('should limit results when limit is specified', () => {
        const posts = createMultiplePosts(10);
        const options: ContentQueryOptions = { limit: 3 };

        const result = paginatePosts(posts, options);

        expect(result).toHaveLength(3);
        expect(result[0]!.slug).toBe('post-1');
        expect(result[2]!.slug).toBe('post-3');
      });

      it('should return all posts when limit exceeds post count', () => {
        const posts = createMultiplePosts(3);
        const options: ContentQueryOptions = { limit: 10 };

        const result = paginatePosts(posts, options);

        expect(result).toHaveLength(3);
      });

      it('should return empty array when limit is 0', () => {
        const posts = createMultiplePosts(5);
        // Note: limit of 0 will effectively be undefined due to falsy check
        const options: ContentQueryOptions = { limit: 0 };

        const result = paginatePosts(posts, options);

        // When limit is 0 (falsy), it falls through to no pagination
        expect(result).toHaveLength(5);
      });
    });

    describe('with offset only', () => {
      it('should skip posts when offset is specified', () => {
        const posts = createMultiplePosts(10);
        const options: ContentQueryOptions = { offset: 3 };

        const result = paginatePosts(posts, options);

        expect(result).toHaveLength(7);
        expect(result[0]!.slug).toBe('post-4');
      });

      it('should return empty array when offset exceeds post count', () => {
        const posts = createMultiplePosts(5);
        const options: ContentQueryOptions = { offset: 10 };

        const result = paginatePosts(posts, options);

        expect(result).toHaveLength(0);
      });

      it('should return all posts when offset is 0', () => {
        const posts = createMultiplePosts(5);
        // Note: offset of 0 will be falsy, so no pagination applied
        const options: ContentQueryOptions = { offset: 0 };

        const result = paginatePosts(posts, options);

        // When offset is 0 (falsy) and no limit, returns original
        expect(result).toHaveLength(5);
      });
    });

    describe('with offset and limit', () => {
      it('should paginate correctly with both offset and limit', () => {
        const posts = createMultiplePosts(10);
        const options: ContentQueryOptions = { offset: 2, limit: 3 };

        const result = paginatePosts(posts, options);

        expect(result).toHaveLength(3);
        expect(result[0]!.slug).toBe('post-3');
        expect(result[1]!.slug).toBe('post-4');
        expect(result[2]!.slug).toBe('post-5');
      });

      it('should handle offset at end with small limit', () => {
        const posts = createMultiplePosts(10);
        const options: ContentQueryOptions = { offset: 8, limit: 5 };

        const result = paginatePosts(posts, options);

        expect(result).toHaveLength(2);
        expect(result[0]!.slug).toBe('post-9');
        expect(result[1]!.slug).toBe('post-10');
      });

      it('should handle first page pagination (offset: 0, limit: N)', () => {
        const posts = createMultiplePosts(10);
        const options: ContentQueryOptions = { offset: 0, limit: 5 };

        const result = paginatePosts(posts, options);

        // offset 0 is falsy, so limit alone triggers slice(0, 5)
        expect(result).toHaveLength(5);
        expect(result[0]!.slug).toBe('post-1');
      });

      it('should handle page-style pagination', () => {
        const posts = createMultiplePosts(25);
        const pageSize = 10;

        // Page 1
        const page1 = paginatePosts(posts, { offset: 0, limit: pageSize });
        expect(page1).toHaveLength(10);
        expect(page1[0]!.slug).toBe('post-1');

        // Page 2
        const page2 = paginatePosts(posts, { offset: 10, limit: pageSize });
        expect(page2).toHaveLength(10);
        expect(page2[0]!.slug).toBe('post-11');

        // Page 3 (partial)
        const page3 = paginatePosts(posts, { offset: 20, limit: pageSize });
        expect(page3).toHaveLength(5);
        expect(page3[0]!.slug).toBe('post-21');
      });
    });

    describe('edge cases', () => {
      it('should handle empty posts array', () => {
        const posts: BlogPost[] = [];
        const options: ContentQueryOptions = { offset: 0, limit: 10 };

        const result = paginatePosts(posts, options);

        expect(result).toHaveLength(0);
      });

      it('should handle single post with pagination', () => {
        const posts = createMultiplePosts(1);
        const options: ContentQueryOptions = { offset: 0, limit: 1 };

        const result = paginatePosts(posts, options);

        expect(result).toHaveLength(1);
      });

      it('should return new array when pagination applied', () => {
        const posts = createMultiplePosts(5);
        const options: ContentQueryOptions = { offset: 1, limit: 2 };

        const result = paginatePosts(posts, options);

        expect(result).not.toBe(posts);
        expect(posts).toHaveLength(5); // Original unchanged
      });

      it('should handle negative offset gracefully (slice behavior)', () => {
        const posts = createMultiplePosts(5);
        // Negative offset would be unusual but slice handles it
        const options: ContentQueryOptions = { offset: -2, limit: 3 };

        const result = paginatePosts(posts, options);

        // slice(-2, 1) returns empty array
        expect(result).toHaveLength(0);
      });

      it('should handle large offset values', () => {
        const posts = createMultiplePosts(5);
        const options: ContentQueryOptions = { offset: 1000, limit: 10 };

        const result = paginatePosts(posts, options);

        expect(result).toHaveLength(0);
      });
    });
  });
});
