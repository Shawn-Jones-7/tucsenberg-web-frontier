/**
 * Content Management System - Parser Functions
 *
 * This module provides functions for parsing MDX files with frontmatter
 * and retrieving content files from directories.
 */
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import yaml, { type LoadOptions } from 'js-yaml';
import {
  ContentError,
  ContentValidationError,
  type ContentMetadata,
  type ContentType,
  type Locale,
  type ParsedContent,
} from '@/types/content.types';
import {
  CONTENT_DIR,
  getValidationConfig,
  shouldFilterDraft,
  validateFilePath,
} from '@/lib/content-utils';
import {
  validateContentMetadata,
  type ValidationConfig,
} from '@/lib/content-validation';
import { logger } from '@/lib/logger';
import { CONTENT_LIMITS } from '@/constants/app-constants';

type YamlWithSafeLoad = typeof yaml & {
  safeLoad?: (str: string, opts?: LoadOptions) => unknown;
};

const yamlWithSafeLoad: YamlWithSafeLoad = yaml as YamlWithSafeLoad;
// js-yaml v4 移除了 safeLoad，但 gray-matter 等旧依赖仍可能调用该 API。
// 这里统一将 safeLoad 映射到 load，避免在解析 frontmatter 时抛出兼容性错误。
if (!yamlWithSafeLoad.safeLoad) {
  yamlWithSafeLoad.safeLoad = (str: string, opts?: LoadOptions) =>
    yamlWithSafeLoad.load(str, opts);
}

/**
 * Parser options for content file parsing
 */
export interface ParseContentOptions {
  strictMode?: boolean;
  validationConfig?: ValidationConfig;
}

/**
 * Get validation config with production strictMode override.
 * Reads from content.json, then applies production strictMode if in production.
 */
function getProductionValidationConfig(): ValidationConfig {
  const config = getValidationConfig();
  const isProduction = process.env.NODE_ENV === 'production';
  return {
    strictMode: isProduction || (config.strictMode ?? false),
    requireSlug: config.requireSlug ?? true,
    requireLocale: config.requireLocale ?? false,
    requireAuthor: config.requireAuthor ?? false,
    requireDescription: config.requireDescription ?? false,
    requireTags: config.requireTags ?? false,
    requireCategories: config.requireCategories ?? false,
    ...(config.maxTitleLength !== undefined
      ? { maxTitleLength: config.maxTitleLength }
      : {}),
    ...(config.maxDescriptionLength !== undefined
      ? { maxDescriptionLength: config.maxDescriptionLength }
      : {}),
    ...(config.maxExcerptLength !== undefined
      ? { maxExcerptLength: config.maxExcerptLength }
      : {}),
    ...(config.products !== undefined ? { products: config.products } : {}),
  };
}

/**
 * Parse MDX file with frontmatter
 */
export function parseContentFile<T extends ContentMetadata = ContentMetadata>(
  filePath: string,
  type: ContentType,
  options: ParseContentOptions = {},
): ParsedContent<T> {
  const validationConfig =
    options.validationConfig ?? getProductionValidationConfig();

  try {
    // Validate file path for security
    const validatedPath = validateFilePath(filePath, CONTENT_DIR);

    // eslint-disable-next-line security/detect-non-literal-fs-filename -- validatedPath已通过validateFilePath安全验证，防止路径遍历攻击
    if (!fs.existsSync(validatedPath)) {
      throw new ContentError(
        `Content file not found: ${filePath}`,
        'FILE_NOT_FOUND',
      );
    }

    // eslint-disable-next-line security/detect-non-literal-fs-filename -- validatedPath已通过validateFilePath安全验证，防止路径遍历攻击
    const fileContent = fs.readFileSync(validatedPath, 'utf-8');

    // Check file size limits
    if (fileContent.length > CONTENT_LIMITS.MAX_FILE_SIZE) {
      throw new ContentError(
        `Content file too large: ${fileContent.length} bytes (max: ${CONTENT_LIMITS.MAX_FILE_SIZE})`,
        'FILE_TOO_LARGE',
      );
    }

    const { data: frontmatter, content } = matter(fileContent, {
      engines: {
        yaml: (source: string) => yaml.load(source) as Record<string, unknown>,
      },
    });

    // Validate metadata with config
    const validation = validateContentMetadata(
      frontmatter,
      type,
      validationConfig,
    );

    // Log validation issues
    logValidationResult(filePath, validation, options.strictMode);

    // In strict mode, throw error on validation failure
    if (options.strictMode && !validation.isValid) {
      throw new ContentValidationError(
        `Content validation failed for ${filePath}`,
        validation.errors,
        filePath,
      );
    }

    // Extract slug from filename (fallback if not in frontmatter)
    const slug =
      (frontmatter['slug'] as string) ??
      path.basename(filePath, path.extname(filePath));

    return {
      slug,
      metadata: frontmatter as T,
      content,
      filePath: validatedPath,
    };
  } catch (error) {
    if (
      error instanceof ContentError ||
      error instanceof ContentValidationError
    ) {
      throw error;
    }
    throw new ContentError(
      `Failed to parse content file: ${filePath}. ${error instanceof Error ? error.message : 'Unknown error'}`,
      'PARSE_ERROR',
    );
  }
}

/**
 * Log validation results with appropriate severity
 */
function logValidationResult(
  filePath: string,
  validation: { isValid: boolean; errors: string[]; warnings: string[] },
  strictMode?: boolean,
): void {
  if (!validation.isValid) {
    const logMethod = strictMode ? logger.error : logger.warn;
    logMethod('Content validation failed', {
      file: filePath,
      errors: validation.errors,
      warnings: validation.warnings,
    });
  } else if (validation.warnings.length > 0) {
    logger.info('Content validation warnings', {
      file: filePath,
      warnings: validation.warnings,
    });
  }
}

/**
 * Parse content file with draft filtering
 */
export function parseContentFileWithDraftFilter<
  T extends ContentMetadata = ContentMetadata,
>(
  filePath: string,
  type: ContentType,
  options: ParseContentOptions = {},
): ParsedContent<T> | null {
  const parsed = parseContentFile<T>(filePath, type, options);

  // Filter out drafts based on configuration
  if (shouldFilterDraft(parsed.metadata.draft)) {
    logger.info('Filtering draft content', {
      file: filePath,
      slug: parsed.slug,
    });
    return null;
  }

  return parsed;
}

/**
 * Get all content files in a directory
 */
export function getContentFiles(contentDir: string, locale?: Locale): string[] {
  // When a locale is provided, read from the locale-specific subdirectory
  // (e.g. content/pages/en, content/posts/zh). This matches the actual
  // content layout under the content/ directory.
  const baseDir = locale ? path.join(contentDir, locale) : contentDir;

  // Validate the base content directory to guard against path traversal.
  const validatedContentDir = validateFilePath(baseDir, CONTENT_DIR);

  // eslint-disable-next-line security/detect-non-literal-fs-filename -- validatedContentDir已通过validateFilePath安全验证，防止路径遍历攻击
  if (!fs.existsSync(validatedContentDir)) {
    logger.warn('Content directory does not exist', {
      dir: validatedContentDir,
    });
    return [];
  }

  // eslint-disable-next-line security/detect-non-literal-fs-filename -- validatedContentDir已通过validateFilePath安全验证，防止路径遍历攻击
  const files = fs.readdirSync(validatedContentDir);
  return files
    .filter((file) => {
      const ext = path.extname(file);
      const isValidExtension = ['.md', '.mdx'].includes(ext);
      if (!isValidExtension) {
        return false;
      }

      // For locale-specific subdirectories, most files will not contain the
      // locale in the filename (e.g. about.mdx under /en). We still keep the
      // original safeguard that allows files with an explicit ".<locale>."
      // suffix and files without any locale suffix.
      if (!locale) {
        return true;
      }

      const normalized = file.toLowerCase();
      const hasExplicitLocale = normalized.includes(
        `.${locale.toLowerCase()}.`,
      );
      const hasNoLocaleSuffix =
        !normalized.includes('.en.') && !normalized.includes('.zh.');
      return hasExplicitLocale || hasNoLocaleSuffix;
    })
    .map((file) => path.join(validatedContentDir, file));
}
