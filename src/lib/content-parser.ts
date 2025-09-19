/**
 * Content Management System - Parser Functions
 *
 * This module provides functions for parsing MDX files with frontmatter
 * and retrieving content files from directories.
 */
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import {
  ContentError,
  type ContentMetadata,
  type ContentType,
  type Locale,
  type ParsedContent,
} from '@/types/content';
import { CONTENT_DIR, validateFilePath } from '@/lib/content-utils';
import { validateContentMetadata } from '@/lib/content-validation';
import { logger } from '@/lib/logger';
import { CONTENT_LIMITS } from '@/constants/app-constants';

/**
 * Parse MDX file with frontmatter
 */
export function parseContentFile<T extends ContentMetadata = ContentMetadata>(
  filePath: string,
  type: ContentType,
): ParsedContent<T> {
  try {
    // Validate file path for security
    const validatedPath = validateFilePath(filePath, CONTENT_DIR);

    // eslint-disable-next-line security/detect-non-literal-fs-filename
    if (!fs.existsSync(validatedPath)) {
      throw new ContentError(
        `Content file not found: ${filePath}`,
        'FILE_NOT_FOUND',
      );
    }

    // eslint-disable-next-line security/detect-non-literal-fs-filename
    const fileContent = fs.readFileSync(validatedPath, 'utf-8');

    // Check file size limits
    if (fileContent.length > CONTENT_LIMITS.MAX_FILE_SIZE) {
      throw new ContentError(
        `Content file too large: ${fileContent.length} bytes (max: ${CONTENT_LIMITS.MAX_FILE_SIZE})`,
        'FILE_TOO_LARGE',
      );
    }

    const { data: frontmatter, content } = matter(fileContent);

    // Validate metadata
    const validation = validateContentMetadata(frontmatter, type);
    if (!validation.isValid) {
      logger.warn('Content validation failed', {
        file: filePath,
        errors: validation.errors,
        warnings: validation.warnings,
      });
    }

    // Extract slug from filename
    const slug = path.basename(filePath, path.extname(filePath));

    return {
      slug,
      metadata: frontmatter as T,
      content,
      filePath: validatedPath,
    };
  } catch (error) {
    if (error instanceof ContentError) {
      throw error;
    }
    throw new ContentError(
      `Failed to parse content file: ${filePath}. ${error instanceof Error ? error.message : 'Unknown error'}`,
      'PARSE_ERROR',
    );
  }
}

/**
 * Get all content files in a directory
 */
export function getContentFiles(contentDir: string, locale?: Locale): string[] {
  // Validate the base content directory
  const validatedContentDir = validateFilePath(contentDir, CONTENT_DIR);

  // eslint-disable-next-line security/detect-non-literal-fs-filename
  if (!fs.existsSync(validatedContentDir)) {
    logger.warn('Content directory does not exist', {
      dir: validatedContentDir,
    });
    return [];
  }

  // eslint-disable-next-line security/detect-non-literal-fs-filename
  const files = fs.readdirSync(validatedContentDir);
  return files
    .filter((file) => {
      const ext = path.extname(file);
      const isValidExtension = ['.md', '.mdx'].includes(ext);
      const matchesLocale =
        !locale ||
        file.includes(`.${locale}.`) ||
        (!file.includes('.en.') && !file.includes('.zh.'));
      return isValidExtension && matchesLocale;
    })
    .map((file) => path.join(validatedContentDir, file));
}
