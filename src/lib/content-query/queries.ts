/**
 * 内容查询函数
 */

import path from 'path';
import type {
  BlogPost,
  BlogPostMetadata,
  ContentMetadata,
  ContentQueryOptions,
  ContentType,
  Locale,
  Page,
  PageMetadata,
  ParsedContent,
} from '@/types/content';
import { getContentFiles, parseContentFile } from '@/lib/content-parser';
import { getContentConfig, PAGES_DIR, POSTS_DIR } from '@/lib/content-utils';
import { filterPosts } from '@/lib/content-query/filters';
import { paginatePosts, sortPosts } from '@/lib/content-query/sorting';

/**
 * Get all blog posts
 */
export function getAllPosts(
  locale?: Locale,
  options: ContentQueryOptions = {},
): BlogPost[] {
  const files = getContentFiles(POSTS_DIR, locale);
  const parsedPosts = files.map((file) =>
    parseContentFile<BlogPostMetadata>(file, 'posts'),
  );

  const filteredPosts = filterPosts(parsedPosts, options);
  const sortedPosts = sortPosts(filteredPosts, options);
  const paginatedPosts = paginatePosts(sortedPosts, options);

  return paginatedPosts;
}

/**
 * Get all pages
 */
export function getAllPages(locale?: Locale): Page[] {
  const files = getContentFiles(PAGES_DIR, locale);
  return files
    .map((file) => parseContentFile<PageMetadata>(file, 'pages'))
    .filter((page) => {
      // Filter drafts in production
      const config = getContentConfig();
      return config.enableDrafts || !page.metadata.draft;
    }) as Page[];
}

/**
 * Get content by slug
 */
export function getContentBySlug<T extends ContentMetadata = ContentMetadata>(
  slug: string,
  type: ContentType,
  locale?: Locale,
): ParsedContent<T> {
  const contentDir = type === 'posts' ? POSTS_DIR : PAGES_DIR;
  const files = getContentFiles(contentDir, locale);

  const matchingFile = files.find((file) => {
    const fileSlug = path.basename(file, path.extname(file));
    return fileSlug === slug || fileSlug.startsWith(`${slug}.`);
  });

  if (!matchingFile) {
    throw new Error(`Content not found: ${slug}`);
  }

  return parseContentFile<T>(matchingFile, type);
}

/**
 * Get blog post by slug
 */
export function getPostBySlug(slug: string, locale?: Locale): BlogPost {
  return getContentBySlug<BlogPostMetadata>(slug, 'posts', locale) as BlogPost;
}

/**
 * Get page by slug
 */
export function getPageBySlug(slug: string, locale?: Locale): Page {
  return getContentBySlug<PageMetadata>(slug, 'pages', locale) as Page;
}
