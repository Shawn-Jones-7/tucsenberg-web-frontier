/**
 * Content Management System - Utility Functions
 *
 * This module provides utility functions for content management,
 * including path validation, configuration, and constants.
 */
import fs from 'fs';
import path from 'path';
import { ContentError, type ContentConfig } from '@/types/content';
import { logger } from '@/lib/logger';
import { COUNT_TEN } from '@/constants';
import { COUNT_160 } from '@/constants/count';

// Content directory paths
export const CONTENT_DIR = path.join(process.cwd(), 'content');
export const POSTS_DIR = path.join(CONTENT_DIR, 'posts');
export const PAGES_DIR = path.join(CONTENT_DIR, 'pages');
export const CONFIG_DIR = path.join(CONTENT_DIR, 'config');

// Allowed file extensions for security
export const ALLOWED_EXTENSIONS = ['.md', '.mdx', '.json'];

// Default content configuration
const DEFAULT_CONFIG: ContentConfig = {
  defaultLocale: 'en',
  supportedLocales: ['en', 'zh'],
  postsPerPage: COUNT_TEN,
  enableDrafts: process.env.NODE_ENV === 'development',
  enableSearch: true,
  enableComments: false,
  autoGenerateExcerpt: true,
  excerptLength: COUNT_160,
  dateFormat: 'YYYY-MM-DD',
  timeZone: 'UTC',
};

/**
 * Validate and normalize file path to prevent directory traversal attacks
 * @param filePath - The file path to validate
 * @param allowedBaseDir - The base directory that file access is restricted to
 * @returns Validated and normalized absolute path
 * @throws ContentError if path is invalid or outside allowed directory
 */
export function validateFilePath(
  filePath: string,
  allowedBaseDir: string,
): string {
  if (!filePath || typeof filePath !== 'string') {
    throw new ContentError(
      'Invalid file path: path must be a non-empty string',
      'INVALID_PATH',
    );
  }

  // Normalize the path to resolve any relative components
  const normalizedPath = path.normalize(filePath);

  // Check for directory traversal attempts
  if (normalizedPath.includes('..')) {
    throw new ContentError(
      'Invalid file path: directory traversal detected',
      'DIRECTORY_TRAVERSAL',
    );
  }

  // Convert to absolute path
  const absolutePath = path.isAbsolute(normalizedPath)
    ? normalizedPath
    : path.join(allowedBaseDir, normalizedPath);

  // Ensure the resolved path is within the allowed base directory
  const resolvedPath = path.resolve(absolutePath);
  const resolvedBaseDir = path.resolve(allowedBaseDir);

  if (!resolvedPath.startsWith(resolvedBaseDir)) {
    throw new ContentError(
      `File path outside allowed directory: ${resolvedPath}`,
      'PATH_OUTSIDE_BASE',
    );
  }

  // Check if file extension is allowed
  const ext = path.extname(resolvedPath);
  if (ext && !ALLOWED_EXTENSIONS.includes(ext)) {
    throw new ContentError(
      `File extension not allowed: ${ext}. Allowed extensions: ${ALLOWED_EXTENSIONS.join(', ')}`,
      'INVALID_EXTENSION',
    );
  }

  return absolutePath;
}

/**
 * Get content configuration
 */
export function getContentConfig(): ContentConfig {
  try {
    const configPath = path.join(CONFIG_DIR, 'content.json');
    // Validate config file path for security
    const validatedConfigPath = validateFilePath(configPath, CONTENT_DIR);

    // eslint-disable-next-line security/detect-non-literal-fs-filename
    if (fs.existsSync(validatedConfigPath)) {
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      const configContent = fs.readFileSync(validatedConfigPath, 'utf-8');
      const config = JSON.parse(configContent) as Partial<ContentConfig>;
      return { ...DEFAULT_CONFIG, ...config };
    }
  } catch (error) {
    logger.warn('Failed to load content config, using defaults', { error });
  }

  return DEFAULT_CONFIG;
}
