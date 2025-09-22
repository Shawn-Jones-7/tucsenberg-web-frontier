/**
 * Content Management System - Validation Functions
 *
 * This module provides validation functions for content metadata,
 * ensuring data integrity and type safety.
 */
import type { ContentType, ContentValidationResult } from '@/types/content';
import { SECONDS_PER_MINUTE, ZERO } from '@/constants';
import { COUNT_160 } from '@/constants/count';
import { TEST_CONTENT_LIMITS, TEST_COUNT_CONSTANTS } from '@/constants/test-constants';

// SEO validation constants
const MAX_SEO_TITLE_LENGTH = SECONDS_PER_MINUTE;
const MAX_SEO_DESCRIPTION_LENGTH = COUNT_160;

/**
 * Validate required fields in content metadata
 */
function validateRequiredFields(metadata: Record<string, unknown>): string[] {
  const errors: string[] = [];

  // Check title - must exist, be a string, and not be empty/whitespace
  if (!metadata['title'] ||
      typeof metadata['title'] !== 'string' ||
      (metadata['title'] as string).trim() === '') {
    errors.push('Title is required');
  }

  if (!metadata['publishedAt']) {
    errors.push('Published date is required');
  }

  // updatedAt is optional - only validate if present

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
    errors.push('Published date must be a valid ISO date');
  }

  if (
    metadata['updatedAt'] &&
    isNaN(Date.parse(metadata['updatedAt'] as string))
  ) {
    errors.push('Updated date must be a valid ISO date');
  }

  // Check if updatedAt is after publishedAt
  if (
    metadata['publishedAt'] &&
    metadata['updatedAt'] &&
    !isNaN(Date.parse(metadata['publishedAt'] as string)) &&
    !isNaN(Date.parse(metadata['updatedAt'] as string))
  ) {
    const publishedDate = new Date(metadata['publishedAt'] as string);
    const updatedDate = new Date(metadata['updatedAt'] as string);

    if (updatedDate < publishedDate) {
      errors.push('Updated date must be after published date');
    }
  }

  return errors;
}

/**
 * Validate data types in content metadata
 */
function validateDataTypes(metadata: Record<string, unknown>): string[] {
  const errors: string[] = [];

  // Title must be a string (already checked in validateRequiredFields for existence)
  if (metadata['title'] && typeof metadata['title'] !== 'string') {
    errors.push('Title must be a string');
  }

  // Title length validation
  if (metadata['title'] && typeof metadata['title'] === 'string') {
    const title = metadata['title'] as string;
    if (title.length > TEST_CONTENT_LIMITS.TITLE_MAX) {
      errors.push(`Title must be less than ${TEST_CONTENT_LIMITS.TITLE_MAX} characters`);
    }
  }

  // Tags must be an array if present
  if (metadata['tags'] && !Array.isArray(metadata['tags'])) {
    errors.push('Tags must be an array');
  }

  // All tag elements must be strings
  if (metadata['tags'] && Array.isArray(metadata['tags'])) {
    const tags = metadata['tags'] as unknown[];
    if (tags.some(tag => typeof tag !== 'string')) {
      errors.push('All tags must be strings');
    }
  }

  // Excerpt must be a string if present
  if (metadata['excerpt'] && typeof metadata['excerpt'] !== 'string') {
    errors.push('Excerpt must be a string');
  }

  // Excerpt length validation
  if (metadata['excerpt'] && typeof metadata['excerpt'] === 'string') {
    const excerpt = metadata['excerpt'] as string;
    if (excerpt.length > TEST_CONTENT_LIMITS.DESCRIPTION_MAX) {
      errors.push(`Excerpt must be less than ${TEST_CONTENT_LIMITS.DESCRIPTION_MAX} characters`);
    }
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

  // Check for too many tags (applies to all content types)
  if (metadata['tags'] && Array.isArray(metadata['tags'])) {
    const tags = metadata['tags'] as unknown[];
    if (tags.length > TEST_COUNT_CONSTANTS.LARGE) {
      warnings.push(`Too many tags (${tags.length}). Maximum recommended: ${TEST_COUNT_CONSTANTS.LARGE}`);
    }
  }

  // Handle unknown content types
  const knownTypes: ContentType[] = ['posts', 'pages'];
  if (!knownTypes.includes(type)) {
    warnings.push(`Unknown content type: ${type}`);
  }

  return warnings;
}

/**
 * Validate SEO-related fields in content metadata
 */
function validateSEO(metadata: Record<string, unknown>): string[] {
  const warnings: string[] = [];
  const errors: string[] = [];

  if (
    metadata['seo'] &&
    typeof metadata['seo'] === 'object' &&
    metadata['seo'] !== null
  ) {
    const seo = metadata['seo'] as Record<string, unknown>;

    // Check SEO title
    if (!seo['title'] || (typeof seo['title'] === 'string' && seo['title'].trim() === '')) {
      warnings.push('SEO title is recommended');
    } else if (
      seo['title'] &&
      typeof seo['title'] === 'string' &&
      seo['title'].length > SECONDS_PER_MINUTE
    ) {
      warnings.push('SEO title should be 60 characters or less');
    }

    // Check SEO description
    if (!seo['description'] || (typeof seo['description'] === 'string' && seo['description'].trim() === '')) {
      warnings.push('SEO description is recommended');
    } else if (
      seo['description'] &&
      typeof seo['description'] === 'string' &&
      seo['description'].length > COUNT_160
    ) {
      warnings.push('SEO description should be 160 characters or less');
    }
  } else {
    // No SEO object at all
    warnings.push('SEO title is recommended');
    warnings.push('SEO description is recommended');
  }

  return warnings;
}

/**
 * Validate edge cases and performance considerations
 */
function validateEdgeCases(metadata: Record<string, unknown>): string[] {
  const warnings: string[] = [];

  // This function is for general edge cases that apply to all content types
  // Tag validation is handled in type-specific validation

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
  const dataTypeErrors = validateDataTypes(metadata);
  const typeWarnings = validateTypeSpecific(metadata, type);
  const seoWarnings = validateSEO(metadata);
  const edgeCaseWarnings = validateEdgeCases(metadata);

  const errors = [...requiredFieldErrors, ...dateErrors, ...dataTypeErrors];
  const warnings = [...typeWarnings, ...seoWarnings, ...edgeCaseWarnings];

  return {
    isValid: errors.length === ZERO,
    errors,
    warnings,
  };
}
