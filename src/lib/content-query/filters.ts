/**
 * 内容过滤函数
 */

import type {
  BlogPost,
  BlogPostMetadata,
  ContentQueryOptions,
  ParsedContent,
} from '@/types/content';
import { getContentConfig } from '@/lib/content-utils';

/**
 * Check if draft posts are allowed based on configuration and options
 */
export function isDraftAllowed(
  post: ParsedContent<BlogPostMetadata>,
  options: ContentQueryOptions,
): boolean {
  // Filter drafts in production
  if (!getContentConfig().enableDrafts && post.metadata.draft) {
    return false;
  }

  // Apply draft filter from options
  if (options.draft !== undefined && post.metadata.draft !== options.draft) {
    return false;
  }

  return true;
}

/**
 * Check if post matches featured filter
 */
export function matchesFeaturedFilter(
  post: ParsedContent<BlogPostMetadata>,
  options: ContentQueryOptions,
): boolean {
  if (
    options.featured !== undefined &&
    post.metadata.featured !== options.featured
  ) {
    return false;
  }
  return true;
}

/**
 * Check if post matches tag filters
 */
export function matchesTags(
  post: ParsedContent<BlogPostMetadata>,
  tags?: string[],
): boolean {
  if (tags && !tags.some((tag) => post.metadata.tags?.includes(tag))) {
    return false;
  }
  return true;
}

/**
 * Check if post matches category filters
 */
export function matchesCategories(
  post: ParsedContent<BlogPostMetadata>,
  categories?: string[],
): boolean {
  if (
    categories &&
    !categories.some((cat) => post.metadata.categories?.includes(cat))
  ) {
    return false;
  }
  return true;
}

/**
 * Filter posts based on content configuration and query options
 */
export function filterPosts(
  posts: ParsedContent<BlogPostMetadata>[],
  options: ContentQueryOptions,
): BlogPost[] {
  return posts.filter((post) => {
    return (
      isDraftAllowed(post, options) &&
      matchesFeaturedFilter(post, options) &&
      matchesTags(post, options.tags) &&
      matchesCategories(post, options.categories)
    );
  }) as BlogPost[];
}
