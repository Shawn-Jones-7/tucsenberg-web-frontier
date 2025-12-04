#!/usr/bin/env node

/**
 * MDX Slug Sync - Core Logic Module
 *
 * Validates that MDX content files in multilingual directories:
 * 1. Exist in pairs across all locales (e.g., en/foo.mdx and zh/foo.mdx)
 * 2. Have consistent frontmatter.slug values across locale pairs
 *
 * This module exports pure functions without CLI concerns (no console/process.exit).
 * For CLI usage, see content-slug-sync.js
 *
 * @module scripts/mdx-slug-sync
 */

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const yaml = require('js-yaml');
const { glob } = require('glob');

// Configure gray-matter to use js-yaml 4.x compatible API
const matterOptions = {
  engines: {
    yaml: {
      parse: (str) => yaml.load(str),
      stringify: (obj) => yaml.dump(obj),
    },
  },
};

/**
 * @typedef {'missing_pair' | 'slug_mismatch' | 'parse_error'} SlugSyncIssueType
 */

/**
 * @typedef {Object} SlugSyncIssue
 * @property {SlugSyncIssueType} type - Type of issue detected
 * @property {string} collection - Content collection (posts, pages, products)
 * @property {string} baseLocale - Base locale code
 * @property {string} targetLocale - Target locale code being compared
 * @property {string} [basePath] - Path to base locale file (if exists)
 * @property {string} [targetPath] - Path to target locale file (if exists)
 * @property {string} [baseSlug] - Slug from base locale file
 * @property {string} [targetSlug] - Slug from target locale file
 * @property {string} message - Human-readable description of the issue
 * @property {string} [error] - Error details for parse_error type
 */

/**
 * @typedef {Object} SlugSyncOptions
 * @property {string} rootDir - Project root directory
 * @property {string[]} collections - Content collections to validate
 * @property {string[]} locales - Locale codes to validate (first is base)
 * @property {string} [baseLocale] - Base locale (defaults to first in locales)
 */

/**
 * @typedef {Object} SlugSyncResult
 * @property {boolean} ok - True if no issues found
 * @property {string[]} checkedCollections - Collections that were validated
 * @property {string[]} checkedLocales - Locales that were validated
 * @property {SlugSyncIssue[]} issues - List of detected issues
 * @property {Object} stats - Validation statistics
 * @property {number} stats.totalFiles - Total files scanned
 * @property {number} stats.totalPairs - Total file pairs checked
 * @property {number} stats.missingPairs - Count of missing pair issues
 * @property {number} stats.slugMismatches - Count of slug mismatch issues
 * @property {number} stats.parseErrors - Count of parse error issues
 */

/**
 * Build a canonical key from file path by removing locale segment.
 * Uses relative path from locale root to support subdirectories.
 *
 * Example: content/products/en/foo.mdx -> products/foo.mdx
 * Example: content/products/en/category/bar.mdx -> products/category/bar.mdx
 *
 * @param {string} rootDir - Project root directory
 * @param {string} filePath - Absolute file path
 * @param {string} collection - Collection name
 * @param {string} locale - Locale code to remove
 * @returns {string} Canonical key for pairing (POSIX style path)
 */
function buildKey(rootDir, filePath, collection, locale) {
  const localeRoot = path.join(rootDir, 'content', collection, locale);
  const relative = path.relative(localeRoot, filePath);
  // Normalize to POSIX style for consistent keys across platforms
  const normalizedRelative = relative.replace(/\\/g, '/');
  return `${collection}/${normalizedRelative}`;
}

/**
 * Parse frontmatter from MDX file and extract slug.
 *
 * @param {string} filePath - Path to MDX file
 * @returns {{ slug: string | null, error: string | null }} Parsed result
 */
function parseFrontmatter(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const { data } = matter(content, matterOptions);

    if (!data || typeof data.slug !== 'string') {
      return {
        slug: null,
        error: 'frontmatter.slug is missing or not a string',
      };
    }

    return { slug: data.slug, error: null };
  } catch (err) {
    return { slug: null, error: `Failed to parse: ${err.message}` };
  }
}

/**
 * Collect MDX files for a collection and build pairing map.
 * Supports nested subdirectories (e.g., content/products/en/category/item.mdx).
 *
 * @param {string} rootDir - Project root directory
 * @param {string} collection - Collection name
 * @param {string} baseLocale - Base locale code
 * @param {string} targetLocale - Target locale code
 * @returns {Map<string, { basePath?: string, targetPath?: string }>} Pairing map
 */
function collectPairs(rootDir, collection, baseLocale, targetLocale) {
  // Use **/*.mdx to support nested subdirectories
  const basePattern = path.join(
    rootDir,
    'content',
    collection,
    baseLocale,
    '**/*.mdx',
  );
  const targetPattern = path.join(
    rootDir,
    'content',
    collection,
    targetLocale,
    '**/*.mdx',
  );

  const baseFiles = glob.sync(basePattern);
  const targetFiles = glob.sync(targetPattern);

  /** @type {Map<string, { basePath?: string, targetPath?: string }>} */
  const pairMap = new Map();

  // Add base locale files
  for (const filePath of baseFiles) {
    const key = buildKey(rootDir, filePath, collection, baseLocale);
    const entry = pairMap.get(key) || {};
    entry.basePath = filePath;
    pairMap.set(key, entry);
  }

  // Add target locale files
  for (const filePath of targetFiles) {
    const key = buildKey(rootDir, filePath, collection, targetLocale);
    const entry = pairMap.get(key) || {};
    entry.targetPath = filePath;
    pairMap.set(key, entry);
  }

  return pairMap;
}

/**
 * Validate a single collection for slug alignment between two locales.
 *
 * @param {string} rootDir - Project root directory
 * @param {string} collection - Collection name
 * @param {string} baseLocale - Base locale code
 * @param {string} targetLocale - Target locale code
 * @returns {{ issues: SlugSyncIssue[], pairCount: number, fileCount: number }}
 */
function validateCollectionPair(rootDir, collection, baseLocale, targetLocale) {
  /** @type {SlugSyncIssue[]} */
  const issues = [];
  const pairMap = collectPairs(rootDir, collection, baseLocale, targetLocale);
  let fileCount = 0;

  for (const [key, { basePath, targetPath }] of pairMap) {
    fileCount += (basePath ? 1 : 0) + (targetPath ? 1 : 0);

    // Check for missing pair
    if (!basePath || !targetPath) {
      const missingLocale = !basePath ? baseLocale : targetLocale;
      const existingPath = basePath || targetPath;
      issues.push({
        type: 'missing_pair',
        collection,
        baseLocale,
        targetLocale,
        basePath,
        targetPath,
        message: `Missing ${missingLocale} counterpart for: ${path.basename(existingPath)}`,
      });
      continue;
    }

    // Parse frontmatter from both files
    const baseResult = parseFrontmatter(basePath);
    const targetResult = parseFrontmatter(targetPath);

    // Check for parse errors
    if (baseResult.error || targetResult.error) {
      issues.push({
        type: 'parse_error',
        collection,
        baseLocale,
        targetLocale,
        basePath,
        targetPath,
        message: 'Failed to parse frontmatter.slug',
        error: baseResult.error || targetResult.error,
      });
      continue;
    }

    // Check for slug mismatch
    if (baseResult.slug !== targetResult.slug) {
      issues.push({
        type: 'slug_mismatch',
        collection,
        baseLocale,
        targetLocale,
        basePath,
        targetPath,
        baseSlug: baseResult.slug,
        targetSlug: targetResult.slug,
        message: `Slug mismatch: "${baseResult.slug}" (${baseLocale}) vs "${targetResult.slug}" (${targetLocale})`,
      });
    }
  }

  return {
    issues,
    pairCount: pairMap.size,
    fileCount,
  };
}

/**
 * Validate MDX content files for slug alignment across locales.
 *
 * @param {SlugSyncOptions} options - Validation options
 * @returns {SlugSyncResult} Validation result
 */
function validateMdxSlugSync(options) {
  const {
    rootDir,
    collections = ['posts', 'pages', 'products'],
    locales = ['en', 'zh'],
    baseLocale = locales[0],
  } = options;

  /** @type {SlugSyncIssue[]} */
  const allIssues = [];
  const targetLocales = locales.filter((l) => l !== baseLocale);
  let totalFiles = 0;
  let totalPairs = 0;

  // Validate each collection against each target locale
  for (const collection of collections) {
    for (const targetLocale of targetLocales) {
      const result = validateCollectionPair(
        rootDir,
        collection,
        baseLocale,
        targetLocale,
      );
      allIssues.push(...result.issues);
      totalFiles += result.fileCount;
      totalPairs += result.pairCount;
    }
  }

  // Calculate statistics
  const stats = {
    totalFiles,
    totalPairs,
    missingPairs: allIssues.filter((i) => i.type === 'missing_pair').length,
    slugMismatches: allIssues.filter((i) => i.type === 'slug_mismatch').length,
    parseErrors: allIssues.filter((i) => i.type === 'parse_error').length,
  };

  return {
    ok: allIssues.length === 0,
    checkedCollections: collections,
    checkedLocales: locales,
    issues: allIssues,
    stats,
  };
}

module.exports = {
  validateMdxSlugSync,
  // Export internal functions for testing
  buildKey,
  parseFrontmatter,
  collectPairs,
  validateCollectionPair,
};
