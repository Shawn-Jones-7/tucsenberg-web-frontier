/* eslint-disable security/detect-non-literal-fs-filename */
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

/**
 * MDX Slug Sync Core Logic Tests
 *
 * Tests for the core validation logic in scripts/mdx-slug-sync.js
 * Uses temporary directories to avoid dependency on real content files.
 *
 * Coverage:
 * - missing_pair: File exists in one locale but not the other
 * - slug_mismatch: Files exist in both locales but slugs differ
 * - parse_error: Frontmatter.slug is missing or malformed
 * - success: All files properly paired with matching slugs
 */

// Import the module under test
const {
  validateMdxSlugSync,
  buildKey,
  parseFrontmatter,
  validateCollectionPair,
} = require('../../../scripts/mdx-slug-sync');

interface SlugSyncIssue {
  type: 'missing_pair' | 'slug_mismatch' | 'parse_error';
  collection: string;
  baseLocale: string;
  targetLocale: string;
  basePath?: string;
  targetPath?: string;
  baseSlug?: string;
  targetSlug?: string;
  message: string;
  error?: string;
}

interface SlugSyncResult {
  ok: boolean;
  checkedCollections: string[];
  checkedLocales: string[];
  issues: SlugSyncIssue[];
  stats: {
    totalFiles: number;
    totalPairs: number;
    missingPairs: number;
    slugMismatches: number;
    parseErrors: number;
  };
}

describe('mdx-slug-sync', () => {
  let tmpDir: string;

  beforeEach(() => {
    // Create a fresh temp directory for each test
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mdx-slug-sync-test-'));
  });

  afterEach(() => {
    // Cleanup temp directory
    if (tmpDir && fs.existsSync(tmpDir)) {
      fs.rmSync(tmpDir, { recursive: true });
    }
  });

  /**
   * Helper to create MDX file with frontmatter
   */
  function createMdxFile(
    collection: string,
    locale: string,
    filename: string,
    frontmatter: Record<string, unknown>,
  ): string {
    const dir = path.join(tmpDir, 'content', collection, locale);
    fs.mkdirSync(dir, { recursive: true });

    const filePath = path.join(dir, filename);
    const yaml = Object.entries(frontmatter)
      .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
      .join('\n');

    fs.writeFileSync(filePath, `---\n${yaml}\n---\n\nTest content`);
    return filePath;
  }

  /**
   * Helper to create MDX file with raw content (for parse error tests)
   */
  function createRawMdxFile(
    collection: string,
    locale: string,
    filename: string,
    content: string,
  ): string {
    const dir = path.join(tmpDir, 'content', collection, locale);
    fs.mkdirSync(dir, { recursive: true });

    const filePath = path.join(dir, filename);
    fs.writeFileSync(filePath, content);
    return filePath;
  }

  describe('buildKey', () => {
    it('should generate canonical key from file path', () => {
      const rootDir = '/root';
      const filePath = '/root/content/posts/en/foo.mdx';
      const key = buildKey(rootDir, filePath, 'posts', 'en');
      expect(key).toBe('posts/foo.mdx');
    });

    it('should work with different collections', () => {
      const rootDir = '/any/path';
      const filePath = '/any/path/content/products/zh/bar.mdx';
      const key = buildKey(rootDir, filePath, 'products', 'zh');
      expect(key).toBe('products/bar.mdx');
    });

    it('should support nested subdirectories', () => {
      const rootDir = '/project';
      const filePath =
        '/project/content/products/en/category/subcategory/item.mdx';
      const key = buildKey(rootDir, filePath, 'products', 'en');
      expect(key).toBe('products/category/subcategory/item.mdx');
    });

    it('should normalize Windows-style paths to POSIX', () => {
      // Simulate path.relative returning Windows-style path
      const rootDir = tmpDir;
      const subDir = path.join(tmpDir, 'content', 'posts', 'en', 'blog');
      fs.mkdirSync(subDir, { recursive: true });
      const filePath = path.join(subDir, 'test.mdx');
      fs.writeFileSync(filePath, '---\nslug: test\n---\n');

      const key = buildKey(rootDir, filePath, 'posts', 'en');
      // Should use forward slashes regardless of platform
      expect(key).toBe('posts/blog/test.mdx');
      expect(key).not.toContain('\\');
    });
  });

  describe('parseFrontmatter', () => {
    it('should extract slug from valid frontmatter', () => {
      const filePath = createMdxFile('posts', 'en', 'test.mdx', {
        slug: 'my-test-slug',
        title: 'Test Title',
      });

      const result = parseFrontmatter(filePath);
      expect(result.slug).toBe('my-test-slug');
      expect(result.error).toBeNull();
    });

    it('should return error when slug is missing', () => {
      const filePath = createMdxFile('posts', 'en', 'no-slug.mdx', {
        title: 'No Slug Here',
      });

      const result = parseFrontmatter(filePath);
      expect(result.slug).toBeNull();
      expect(result.error).toContain('missing');
    });

    it('should return error when file does not exist', () => {
      const result = parseFrontmatter('/nonexistent/file.mdx');
      expect(result.slug).toBeNull();
      expect(result.error).toContain('Failed to parse');
    });

    it('should return error for invalid frontmatter', () => {
      const filePath = createRawMdxFile(
        'posts',
        'en',
        'invalid.mdx',
        'No frontmatter here, just content',
      );

      const result = parseFrontmatter(filePath);
      expect(result.slug).toBeNull();
      expect(result.error).toContain('missing');
    });
  });

  describe('validateCollectionPair', () => {
    it('should detect missing_pair when zh file is missing', () => {
      createMdxFile('posts', 'en', 'only-en.mdx', { slug: 'only-en' });

      const result = validateCollectionPair(tmpDir, 'posts', 'en', 'zh');

      expect(result.issues).toHaveLength(1);
      expect(result.issues[0].type).toBe('missing_pair');
      expect(result.issues[0].message).toContain('Missing zh');
    });

    it('should detect missing_pair when en file is missing', () => {
      createMdxFile('posts', 'zh', 'only-zh.mdx', { slug: 'only-zh' });

      const result = validateCollectionPair(tmpDir, 'posts', 'en', 'zh');

      expect(result.issues).toHaveLength(1);
      expect(result.issues[0].type).toBe('missing_pair');
      expect(result.issues[0].message).toContain('Missing en');
    });

    it('should detect slug_mismatch when slugs differ', () => {
      createMdxFile('posts', 'en', 'article.mdx', { slug: 'slug-en' });
      createMdxFile('posts', 'zh', 'article.mdx', { slug: 'slug-zh' });

      const result = validateCollectionPair(tmpDir, 'posts', 'en', 'zh');

      expect(result.issues).toHaveLength(1);
      expect(result.issues[0].type).toBe('slug_mismatch');
      expect(result.issues[0].baseSlug).toBe('slug-en');
      expect(result.issues[0].targetSlug).toBe('slug-zh');
    });

    it('should detect parse_error when slug is missing', () => {
      createMdxFile('posts', 'en', 'no-slug.mdx', { title: 'No slug' });
      createMdxFile('posts', 'zh', 'no-slug.mdx', { title: 'No slug zh' });

      const result = validateCollectionPair(tmpDir, 'posts', 'en', 'zh');

      expect(result.issues).toHaveLength(1);
      expect(result.issues[0].type).toBe('parse_error');
    });

    it('should pass when files are properly paired with matching slugs', () => {
      createMdxFile('posts', 'en', 'valid.mdx', { slug: 'valid-article' });
      createMdxFile('posts', 'zh', 'valid.mdx', { slug: 'valid-article' });

      const result = validateCollectionPair(tmpDir, 'posts', 'en', 'zh');

      expect(result.issues).toHaveLength(0);
      expect(result.pairCount).toBe(1);
    });
  });

  describe('validateMdxSlugSync', () => {
    it('should return ok:true when all content is valid', () => {
      // Create valid pairs in multiple collections
      createMdxFile('posts', 'en', 'post1.mdx', { slug: 'post-1' });
      createMdxFile('posts', 'zh', 'post1.mdx', { slug: 'post-1' });
      createMdxFile('pages', 'en', 'about.mdx', { slug: 'about' });
      createMdxFile('pages', 'zh', 'about.mdx', { slug: 'about' });

      const result: SlugSyncResult = validateMdxSlugSync({
        rootDir: tmpDir,
        collections: ['posts', 'pages'],
        locales: ['en', 'zh'],
      });

      expect(result.ok).toBe(true);
      expect(result.issues).toHaveLength(0);
      expect(result.stats.totalPairs).toBe(2);
    });

    it('should return ok:false with issues when validation fails', () => {
      // Create one valid pair and one missing pair
      createMdxFile('posts', 'en', 'valid.mdx', { slug: 'valid' });
      createMdxFile('posts', 'zh', 'valid.mdx', { slug: 'valid' });
      createMdxFile('posts', 'en', 'missing-zh.mdx', { slug: 'missing' });

      const result: SlugSyncResult = validateMdxSlugSync({
        rootDir: tmpDir,
        collections: ['posts'],
        locales: ['en', 'zh'],
      });

      expect(result.ok).toBe(false);
      expect(result.issues).toHaveLength(1);
      expect(result.stats.missingPairs).toBe(1);
    });

    it('should aggregate issues from multiple collections', () => {
      // Posts: missing pair
      createMdxFile('posts', 'en', 'only-en.mdx', { slug: 'only-en' });

      // Pages: slug mismatch
      createMdxFile('pages', 'en', 'mismatch.mdx', { slug: 'en-slug' });
      createMdxFile('pages', 'zh', 'mismatch.mdx', { slug: 'zh-slug' });

      // Products: parse error
      createMdxFile('products', 'en', 'no-slug.mdx', { title: 'no slug' });
      createMdxFile('products', 'zh', 'no-slug.mdx', { title: 'no slug' });

      const result: SlugSyncResult = validateMdxSlugSync({
        rootDir: tmpDir,
        collections: ['posts', 'pages', 'products'],
        locales: ['en', 'zh'],
      });

      expect(result.ok).toBe(false);
      expect(result.issues).toHaveLength(3);
      expect(result.stats.missingPairs).toBe(1);
      expect(result.stats.slugMismatches).toBe(1);
      expect(result.stats.parseErrors).toBe(1);
    });

    it('should support custom locales configuration', () => {
      // Create files for en, zh, ja
      createMdxFile('posts', 'en', 'multi.mdx', { slug: 'multi' });
      createMdxFile('posts', 'zh', 'multi.mdx', { slug: 'multi' });
      createMdxFile('posts', 'ja', 'multi.mdx', { slug: 'multi' });

      const result: SlugSyncResult = validateMdxSlugSync({
        rootDir: tmpDir,
        collections: ['posts'],
        locales: ['en', 'zh', 'ja'],
      });

      expect(result.ok).toBe(true);
      expect(result.checkedLocales).toEqual(['en', 'zh', 'ja']);
      // Should check en vs zh and en vs ja (2 pairs per file)
      expect(result.stats.totalPairs).toBe(2);
    });

    it('should handle empty collections gracefully', () => {
      // Don't create any files

      const result: SlugSyncResult = validateMdxSlugSync({
        rootDir: tmpDir,
        collections: ['posts'],
        locales: ['en', 'zh'],
      });

      expect(result.ok).toBe(true);
      expect(result.issues).toHaveLength(0);
      expect(result.stats.totalFiles).toBe(0);
    });

    it('should use first locale as base when baseLocale not specified', () => {
      createMdxFile('posts', 'zh', 'only-zh.mdx', { slug: 'only-zh' });

      const result: SlugSyncResult = validateMdxSlugSync({
        rootDir: tmpDir,
        collections: ['posts'],
        locales: ['en', 'zh'], // en is first, so it's the base
      });

      // File exists in zh but not in en, so it's a missing pair
      expect(result.issues).toHaveLength(1);
      expect(result.issues[0].type).toBe('missing_pair');
      expect(result.issues[0].baseLocale).toBe('en');
    });
  });

  describe('edge cases', () => {
    it('should handle files with special characters in slug', () => {
      createMdxFile('posts', 'en', 'special.mdx', { slug: 'hello-world-2024' });
      createMdxFile('posts', 'zh', 'special.mdx', { slug: 'hello-world-2024' });

      const result: SlugSyncResult = validateMdxSlugSync({
        rootDir: tmpDir,
        collections: ['posts'],
        locales: ['en', 'zh'],
      });

      expect(result.ok).toBe(true);
    });

    it('should treat empty string slug as valid if both match', () => {
      // Note: Empty string slugs are technically valid strings and will match
      // if both locales have the same empty slug. This is by design - the
      // validation focuses on consistency, not slug quality.
      createMdxFile('posts', 'en', 'empty.mdx', { slug: '' });
      createMdxFile('posts', 'zh', 'empty.mdx', { slug: '' });

      const result: SlugSyncResult = validateMdxSlugSync({
        rootDir: tmpDir,
        collections: ['posts'],
        locales: ['en', 'zh'],
      });

      // Empty strings match, so no mismatch error
      // (Content quality checks should be handled separately)
      expect(result.ok).toBe(true);
      expect(result.issues).toHaveLength(0);
    });

    it('should handle multiple files in same collection', () => {
      // Create 3 valid pairs
      for (let i = 1; i <= 3; i++) {
        createMdxFile('posts', 'en', `post${i}.mdx`, { slug: `post-${i}` });
        createMdxFile('posts', 'zh', `post${i}.mdx`, { slug: `post-${i}` });
      }

      const result: SlugSyncResult = validateMdxSlugSync({
        rootDir: tmpDir,
        collections: ['posts'],
        locales: ['en', 'zh'],
      });

      expect(result.ok).toBe(true);
      expect(result.stats.totalPairs).toBe(3);
      expect(result.stats.totalFiles).toBe(6);
    });
  });
});
