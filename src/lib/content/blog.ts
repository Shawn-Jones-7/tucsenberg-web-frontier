/**
 * Blog content wrappers
 *
 * P2-2: cache-friendly wrapper implementations for blog content.
 *
 * These functions:
 * - reuse the lower-level content-query APIs (getAllPosts, getPostBySlug)
 * - expose view-oriented domain models (PostSummary, PostDetail)
 * - accept only explicit, serializable arguments (locale, slug, options)
 * - intentionally do NOT use request-scoped APIs (headers, cookies, etc.)
 * - use "use cache" + cacheLife() + cacheTag() for Cache Components integration
 *
 * @see src/lib/cache/cache-tags.ts - Cache tag naming conventions
 */

import { cacheLife, cacheTag } from 'next/cache';
import type {
  BlogPost,
  ContentQueryOptions,
  GetAllPostsCachedFn,
  GetPostBySlugCachedFn,
  Locale,
  PostDetail,
  PostListOptions,
  PostSummary,
} from '@/types/content.types';
import { getAllPosts, getPostBySlug } from '@/lib/content-query';
import { contentTags } from '@/lib/cache/cache-tags';

/**
 * Assign optional metadata fields to summary
 */
function assignOptionalSummaryFields(
  summary: PostSummary,
  metadata: BlogPost['metadata'],
  excerpt?: string,
): void {
  if (metadata.description !== undefined) summary.description = metadata.description;
  if (metadata.updatedAt !== undefined) summary.updatedAt = metadata.updatedAt;
  if (metadata.tags !== undefined) summary.tags = metadata.tags;
  if (metadata.categories !== undefined) summary.categories = metadata.categories;
  if (metadata.featured !== undefined) summary.featured = metadata.featured;
  if (metadata.readingTime !== undefined) summary.readingTime = metadata.readingTime;
  if (metadata.coverImage !== undefined) summary.coverImage = metadata.coverImage;
  if (metadata.seo !== undefined) summary.seo = metadata.seo;

  const effectiveExcerpt = metadata.excerpt ?? excerpt;
  if (effectiveExcerpt !== undefined) summary.excerpt = effectiveExcerpt;
}

/**
 * Map a BlogPost entity to a PostSummary domain model.
 */
function mapBlogPostToSummary(post: BlogPost, locale: Locale): PostSummary {
  const { metadata, excerpt, slug } = post;

  const summary: PostSummary = {
    slug: metadata.slug ?? slug,
    locale,
    title: metadata.title,
    publishedAt: metadata.publishedAt,
  };

  assignOptionalSummaryFields(summary, metadata, excerpt);

  return summary;
}

/**
 * Copy optional fields from summary to detail
 */
function copyOptionalFieldsToDetail(detail: PostDetail, summary: PostSummary): void {
  if (summary.description !== undefined) detail.description = summary.description;
  if (summary.updatedAt !== undefined) detail.updatedAt = summary.updatedAt;
  if (summary.tags !== undefined) detail.tags = summary.tags;
  if (summary.categories !== undefined) detail.categories = summary.categories;
  if (summary.featured !== undefined) detail.featured = summary.featured;
  if (summary.excerpt !== undefined) detail.excerpt = summary.excerpt;
  if (summary.readingTime !== undefined) detail.readingTime = summary.readingTime;
  if (summary.coverImage !== undefined) detail.coverImage = summary.coverImage;
  if (summary.seo !== undefined) detail.seo = summary.seo;
}

/**
 * Map a BlogPost entity to a PostDetail domain model.
 */
function mapBlogPostToDetail(post: BlogPost, locale: Locale): PostDetail {
  const summary = mapBlogPostToSummary(post, locale);

  const detail: PostDetail = {
    slug: summary.slug,
    locale: summary.locale,
    title: summary.title,
    publishedAt: summary.publishedAt,
    content: post.content,
    filePath: post.filePath,
  };

  copyOptionalFieldsToDetail(detail, summary);

  if (post.metadata.relatedPosts !== undefined) {
    detail.relatedPosts = post.metadata.relatedPosts;
  }

  return detail;
}

function toContentQueryOptions(options?: PostListOptions): ContentQueryOptions {
  if (!options) {
    return {};
  }

  const normalized: ContentQueryOptions = {};

  if (options.limit !== undefined) {
    normalized.limit = options.limit;
  }

  if (options.offset !== undefined) {
    normalized.offset = options.offset;
  }

  if (options.sortBy !== undefined) {
    normalized.sortBy = options.sortBy;
  }

  if (options.sortOrder !== undefined) {
    normalized.sortOrder = options.sortOrder;
  }

  if (options.tags !== undefined) {
    normalized.tags = options.tags;
  }

  if (options.categories !== undefined) {
    normalized.categories = options.categories;
  }

  if (options.featured !== undefined) {
    normalized.featured = options.featured;
  }

  if (options.draft !== undefined) {
    normalized.draft = options.draft;
  }

  return normalized;
}

/**
 * Get all blog posts as PostSummary list for a given locale.
 *
 * This function is designed as a cache-friendly data wrapper: it only depends on
 * its explicit arguments and the underlying content-query implementation.
 *
 * Cache tags enable selective invalidation:
 * - `content:list:blog:{locale}` - Invalidate blog list for this locale
 */
export const getAllPostsCached: GetAllPostsCachedFn = async (
  locale,
  options,
) => {
  'use cache';
  cacheLife('days');
  cacheTag(contentTags.blogList(locale));

  const normalizedOptions = toContentQueryOptions(options);

  const posts = await Promise.resolve(getAllPosts(locale, normalizedOptions));

  return posts.map((post) => mapBlogPostToSummary(post, locale));
};

/**
 * Get a single blog post by slug as a PostDetail model.
 *
 * Errors from the underlying getPostBySlug call are propagated as-is so that
 * callers can apply their own error handling (e.g. mapping to 404 routes).
 *
 * Cache tags enable selective invalidation:
 * - `content:blog:{slug}:{locale}` - Invalidate this specific post
 * - `content:list:blog:{locale}` - Also tagged for list invalidation cascade
 */
export const getPostBySlugCached: GetPostBySlugCachedFn = async (
  locale,
  slug,
) => {
  'use cache';
  cacheLife('days');
  cacheTag(contentTags.blogPost(slug, locale));
  cacheTag(contentTags.blogList(locale));

  const post = await Promise.resolve(getPostBySlug(slug, locale));

  return mapBlogPostToDetail(post, locale);
};
