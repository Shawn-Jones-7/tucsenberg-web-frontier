/**
 * 内容排序和分页函数
 */

import { ZERO } from "@/constants/magic-numbers";
import type {
  BlogPost,
  ContentError,
  ContentQueryOptions,
} from '@/types/content';

/**
 * Get field value from post metadata with type safety
 */
function getFieldValue(post: BlogPost, field: string): string {
  switch (field) {
    case 'publishedAt':
      return post.metadata.publishedAt || '';
    case 'updatedAt':
      return post.metadata.updatedAt || '';
    case 'title':
      return post.metadata.title || '';
    default:
      throw new Error(`Unexpected sort field: ${field}`) as ContentError;
  }
}

/**
 * Compare two values with specified sort order
 */
function compareValues(
  aValue: string,
  bValue: string,
  sortOrder: 'asc' | 'desc',
): number {
  if (sortOrder === 'desc') {
    return bValue.localeCompare(aValue);
  }
  return aValue.localeCompare(bValue);
}

/**
 * Create a sort comparator function for posts
 */
function createSortComparator(sortBy: string, sortOrder: 'asc' | 'desc') {
  return (a: BlogPost, b: BlogPost): number => {
    const aValue = getFieldValue(a, sortBy);
    const bValue = getFieldValue(b, sortBy);
    return compareValues(aValue, bValue, sortOrder);
  };
}

/**
 * Validate sort field to prevent object injection
 */
function validateSortField(sortBy: string): void {
  const allowedSortFields = ['publishedAt', 'updatedAt', 'title'] as const;

  if (
    !allowedSortFields.includes(sortBy as (typeof allowedSortFields)[number])
  ) {
    throw new Error(
      `Invalid sort field: ${sortBy}. Allowed fields: ${allowedSortFields.join(', ')}`,
    ) as ContentError;
  }
}

/**
 * Sort posts with type-safe property access
 */
export function sortPosts(
  posts: BlogPost[],
  options: ContentQueryOptions,
): BlogPost[] {
  const sortBy = options.sortBy || 'publishedAt';
  const sortOrder = options.sortOrder || 'desc';

  // Validate sort field to prevent object injection
  validateSortField(sortBy);

  // Create and apply sort comparator
  const comparator = createSortComparator(sortBy, sortOrder);
  posts.sort(comparator);

  return posts;
}

/**
 * Apply pagination to posts
 */
export function paginatePosts(
  posts: BlogPost[],
  options: ContentQueryOptions,
): BlogPost[] {
  if (options.offset || options.limit) {
    const start = options.offset || ZERO;
    const end = options.limit ? start + options.limit : undefined;
    return posts.slice(start, end);
  }
  return posts;
}
