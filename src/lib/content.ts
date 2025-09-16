/**
 * Content Management System - Unified Export Module
 *
 * This module provides a unified interface for all content-related functions,
 * re-exporting functionality from content-parser, content-query, and content-utils.
 */

// Re-export content query functions
export {
  getAllPages,
  getAllPosts,
  getContentStats,
  getContentBySlug,
  getPostBySlug,
  getPageBySlug,
} from './content-query';

// Re-export content parser functions
export { parseContentFile, getContentFiles } from '@/lib/content-parser';

// Re-export content utility functions
export {
  getContentConfig,
  validateFilePath,
  CONTENT_DIR,
  POSTS_DIR,
  PAGES_DIR,
  CONFIG_DIR,
  ALLOWED_EXTENSIONS,
} from './content-utils';

// Re-export content validation functions
export { validateContentMetadata } from '@/lib/content-validation';
