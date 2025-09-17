/**
 * Content Management System - Validation Functions
 *
 * This module provides validation functions for content metadata,
 * ensuring data integrity and type safety.
 */
import { COUNT_160 } from "@/constants/count";
import { SECONDS_PER_MINUTE, ZERO } from "@/constants/magic-numbers";
import type { ContentType, ContentValidationResult } from '@/types/content';

// SEO validation constants
const MAX_SEO_TITLE_LENGTH = SECONDS_PER_MINUTE;
const MAX_SEO_DESCRIPTION_LENGTH = COUNT_160;

/**
 * Validate required fields in content metadata
 */
function validateRequiredFields(metadata: Record<string, unknown>): string[] {
  const errors: string[] = [];

  if (!metadata['title']) {
    errors.push('Title is required');
  }

  if (!metadata['publishedAt']) {
    errors.push('Published date is required');
  }

  return errors;
}

/**
 * Validate date fields in content metadata
 */
function validateDates(metadata: Record<string, unknown>): string[] {
  const errors: string[] = [];

  if (
    metadata['publishedAt'] &&
    isNaN(Date.parse(metadata['publishedAt'] as string))
  ) {
    errors.push('Invalid published date format');
  }

  if (
    metadata['updatedAt'] &&
    isNaN(Date.parse(metadata['updatedAt'] as string))
  ) {
    errors.push('Invalid updated date format');
  }

  return errors;
}

/**
 * Validate type-specific requirements for content metadata
 */
function validateTypeSpecific(
  metadata: Record<string, unknown>,
  type: ContentType,
): string[] {
  const warnings: string[] = [];

  if (type === 'posts') {
    if (!metadata['excerpt']) {
      warnings.push('Blog posts should have an excerpt for better SEO');
    }
    if (
      !metadata['tags'] ||
      (Array.isArray(metadata['tags']) && metadata['tags'].length === ZERO)
    ) {
      warnings.push('Blog posts should have tags for better categorization');
    }
  }

  return warnings;
}

/**
 * Validate SEO-related fields in content metadata
 */
function validateSEO(metadata: Record<string, unknown>): string[] {
  const warnings: string[] = [];

  if (
    metadata['seo'] &&
    typeof metadata['seo'] === 'object' &&
    metadata['seo'] !== null
  ) {
    const seo = metadata['seo'] as Record<string, unknown>;

    if (
      seo['title'] &&
      typeof seo['title'] === 'string' &&
      seo['title'].length > MAX_SEO_TITLE_LENGTH
    ) {
      warnings.push(
        `SEO title should be ${MAX_SEO_TITLE_LENGTH} characters or less`,
      );
    }

    if (
      seo['description'] &&
      typeof seo['description'] === 'string' &&
      seo['description'].length > MAX_SEO_DESCRIPTION_LENGTH
    ) {
      warnings.push(
        `SEO description should be ${MAX_SEO_DESCRIPTION_LENGTH} characters or less`,
      );
    }
  }

  return warnings;
}

/**
 * Validate content metadata
 */
export function validateContentMetadata(
  metadata: Record<string, unknown>,
  type: ContentType,
): ContentValidationResult {
  // Collect all validation errors and warnings
  const requiredFieldErrors = validateRequiredFields(metadata);
  const dateErrors = validateDates(metadata);
  const typeWarnings = validateTypeSpecific(metadata, type);
  const seoWarnings = validateSEO(metadata);

  const errors = [...requiredFieldErrors, ...dateErrors];
  const warnings = [...typeWarnings, ...seoWarnings];

  return {
    isValid: errors.length === ZERO,
    errors,
    warnings,
  };
}
