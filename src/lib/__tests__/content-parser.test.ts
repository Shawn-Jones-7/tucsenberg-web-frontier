import fs from 'fs';
import path from 'path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  ContentError,
  ContentValidationError,
  type ContentType,
} from '@/types/content';
import {
  getContentFiles,
  parseContentFile,
  parseContentFileWithDraftFilter,
} from '@/lib/content-parser';
import { logger } from '@/lib/logger';
import { CONTENT_LIMITS } from '@/constants/app-constants';

// Mock依赖（v4：为内置模块手动提供函数实现）
vi.mock('fs', () => {
  const existsSync = vi.fn();
  const readFileSync = vi.fn();
  const readdirSync = vi.fn();
  const exports = { existsSync, readFileSync, readdirSync } as any;
  return { default: exports, ...exports };
});
vi.mock('@/lib/logger');
vi.mock('@/lib/content-utils', () => ({
  CONTENT_DIR: '/mock/content',
  validateFilePath: vi.fn((filePath: string, baseDir: string) => {
    if (filePath.includes('..') || filePath.includes('invalid')) {
      throw new Error('Invalid file path');
    }
    // For single files, return baseDir + basename
    // For directories, return baseDir + filePath
    if (filePath.includes('/')) {
      return path.join(baseDir, filePath);
    }
    return path.join(baseDir, path.basename(filePath));
  }),
  getValidationConfig: vi.fn(() => ({
    strictMode: false,
    requireSlug: true,
    requireLocale: false,
    requireAuthor: false,
    requireDescription: false,
    requireTags: false,
    requireCategories: false,
  })),
  shouldFilterDraft: vi.fn(() => false),
}));
vi.mock('@/lib/content-validation', () => ({
  validateContentMetadata: vi.fn(() => ({
    isValid: true,
    errors: [],
    warnings: [],
  })),
}));

const mockFs = vi.mocked(fs) as {
  existsSync: ReturnType<typeof vi.fn>;
  readFileSync: ReturnType<typeof vi.fn>;
  readdirSync: ReturnType<typeof vi.fn>;
};
const mockLogger = vi.mocked(logger);

describe('content-parser', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('parseContentFile', () => {
    const mockFilePath = 'test-content.mdx';
    const mockContentType: ContentType = 'posts';
    const mockFileContent = `---
title: Test Content
description: Test description
date: 2024-01-01
author: Test Author
---

# Test Content

This is test content.`;

    beforeEach(() => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(mockFileContent);
    });

    it('should successfully parse a valid MDX file', () => {
      const result = parseContentFile(mockFilePath, mockContentType);

      expect(result).toEqual({
        slug: 'test-content',
        metadata: {
          title: 'Test Content',
          description: 'Test description',
          date: new Date('2024-01-01'),
          author: 'Test Author',
        },
        content: '\n# Test Content\n\nThis is test content.',
        filePath: '/mock/content/test-content.mdx',
      });
    });

    it('should throw ContentError when file does not exist', () => {
      mockFs.existsSync.mockReturnValue(false);

      expect(() => parseContentFile(mockFilePath, mockContentType)).toThrow(
        ContentError,
      );
      expect(() => parseContentFile(mockFilePath, mockContentType)).toThrow(
        'Content file not found: test-content.mdx',
      );
    });

    it('should throw ContentError when file is too large', () => {
      const largeContent = 'x'.repeat(CONTENT_LIMITS.MAX_FILE_SIZE + 1);
      mockFs.readFileSync.mockReturnValue(largeContent);

      expect(() => parseContentFile(mockFilePath, mockContentType)).toThrow(
        ContentError,
      );
      expect(() => parseContentFile(mockFilePath, mockContentType)).toThrow(
        'Content file too large',
      );
    });

    it('should handle invalid file paths', () => {
      expect(() =>
        parseContentFile('../invalid/path.mdx', mockContentType),
      ).toThrow('Invalid file path');
    });

    it('should handle file read errors', () => {
      mockFs.readFileSync.mockImplementation(() => {
        throw new Error('File read error');
      });

      expect(() => parseContentFile(mockFilePath, mockContentType)).toThrow(
        ContentError,
      );
      expect(() => parseContentFile(mockFilePath, mockContentType)).toThrow(
        'Failed to parse content file',
      );
    });

    it('should log warnings when content validation fails', async () => {
      const { validateContentMetadata } = vi.mocked(
        await import('@/lib/content-validation'),
      );
      validateContentMetadata.mockReturnValue({
        isValid: false,
        errors: ['Missing required field'],
        warnings: ['Deprecated field used'],
      });

      parseContentFile(mockFilePath, mockContentType);

      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Content validation failed',
        {
          file: mockFilePath,
          errors: ['Missing required field'],
          warnings: ['Deprecated field used'],
        },
      );
    });

    it('should extract slug from filename correctly', () => {
      const result = parseContentFile('my-blog-post.mdx', mockContentType);
      expect(result.slug).toBe('my-blog-post');
    });

    it('should handle files without frontmatter', () => {
      mockFs.readFileSync.mockReturnValue('# Just content without frontmatter');

      const result = parseContentFile(mockFilePath, mockContentType);

      expect(result.metadata).toEqual({});
      expect(result.content).toBe('# Just content without frontmatter');
    });

    it('should handle empty files', () => {
      mockFs.readFileSync.mockReturnValue('');

      const result = parseContentFile(mockFilePath, mockContentType);

      expect(result.metadata).toEqual({});
      expect(result.content).toBe('');
    });

    it('should preserve file path in result', () => {
      const result = parseContentFile(mockFilePath, mockContentType);
      expect(result.filePath).toBe('/mock/content/test-content.mdx');
    });
  });

  describe('getContentFiles', () => {
    const mockContentDir = 'content/blog';

    beforeEach(() => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readdirSync.mockReturnValue([
        'post1.mdx',
        'post2.md',
        'post3.en.mdx',
        'post4.zh.mdx',
        'invalid.txt',
        'draft.mdx',
      ] as string[]);
    });

    it('should return all valid content files when no locale specified', () => {
      const result = getContentFiles(mockContentDir);

      expect(result).toEqual([
        '/mock/content/content/blog/post1.mdx',
        '/mock/content/content/blog/post2.md',
        '/mock/content/content/blog/post3.en.mdx',
        '/mock/content/content/blog/post4.zh.mdx',
        '/mock/content/content/blog/draft.mdx',
      ]);
    });

    it('should filter files by locale when specified', () => {
      const result = getContentFiles(mockContentDir, 'en');

      expect(result).toEqual([
        '/mock/content/content/blog/en/post1.mdx',
        '/mock/content/content/blog/en/post2.md',
        '/mock/content/content/blog/en/post3.en.mdx',
        '/mock/content/content/blog/en/draft.mdx',
      ]);
    });

    it('should filter Chinese locale files correctly', () => {
      const result = getContentFiles(mockContentDir, 'zh');

      expect(result).toEqual([
        '/mock/content/content/blog/zh/post1.mdx',
        '/mock/content/content/blog/zh/post2.md',
        '/mock/content/content/blog/zh/post4.zh.mdx',
        '/mock/content/content/blog/zh/draft.mdx',
      ]);
    });

    it('should return empty array when directory does not exist', () => {
      mockFs.existsSync.mockReturnValue(false);

      const result = getContentFiles(mockContentDir);

      expect(result).toEqual([]);
      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Content directory does not exist',
        { dir: '/mock/content/content/blog' },
      );
    });

    it('should filter out non-markdown files', () => {
      mockFs.readdirSync.mockReturnValue([
        'post1.mdx',
        'post2.md',
        'image.jpg',
        'config.json',
        'readme.txt',
      ] as string[]);

      const result = getContentFiles(mockContentDir);

      expect(result).toEqual([
        '/mock/content/content/blog/post1.mdx',
        '/mock/content/content/blog/post2.md',
      ]);
    });

    it('should handle empty directory', () => {
      mockFs.readdirSync.mockReturnValue([] as string[]);

      const result = getContentFiles(mockContentDir);

      expect(result).toEqual([]);
    });

    it('should handle directory read errors', () => {
      mockFs.readdirSync.mockImplementation(() => {
        throw new Error('Directory read error');
      });

      expect(() => getContentFiles(mockContentDir)).toThrow(
        'Directory read error',
      );
    });

    it('should validate content directory path', () => {
      expect(() => getContentFiles('../invalid/path')).toThrow(
        'Invalid file path',
      );
    });
  });

  describe('parseContentFileWithDraftFilter', () => {
    const mockFilePath = 'draft-post.mdx';
    const mockContentType: ContentType = 'posts';
    const mockDraftContent = `---
title: Draft Post
draft: true
---

Draft content.`;

    beforeEach(() => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(mockDraftContent);
    });

    it('should return parsed content when not a draft', async () => {
      const { shouldFilterDraft } = vi.mocked(
        await import('@/lib/content-utils'),
      );
      shouldFilterDraft.mockReturnValue(false);

      const result = parseContentFileWithDraftFilter(
        mockFilePath,
        mockContentType,
      );

      expect(result).not.toBeNull();
      expect(result?.slug).toBe('draft-post');
    });

    it('should return null when content is filtered as draft', async () => {
      const { shouldFilterDraft } = vi.mocked(
        await import('@/lib/content-utils'),
      );
      shouldFilterDraft.mockReturnValue(true);

      const result = parseContentFileWithDraftFilter(
        mockFilePath,
        mockContentType,
      );

      expect(result).toBeNull();
      expect(mockLogger.info).toHaveBeenCalledWith('Filtering draft content', {
        file: mockFilePath,
        slug: 'draft-post',
      });
    });
  });

  describe('parseContentFile - validation logging', () => {
    const mockFilePath = 'test.mdx';
    const mockContentType: ContentType = 'posts';
    const mockFileContent = `---
title: Test
---

Content`;

    beforeEach(() => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(mockFileContent);
    });

    it('should log errors in strict mode when validation fails', async () => {
      const { validateContentMetadata } = vi.mocked(
        await import('@/lib/content-validation'),
      );
      validateContentMetadata.mockReturnValue({
        isValid: false,
        errors: ['Missing required field'],
        warnings: [],
      });

      expect(() =>
        parseContentFile(mockFilePath, mockContentType, { strictMode: true }),
      ).toThrow(ContentValidationError);
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Content validation failed',
        {
          file: mockFilePath,
          errors: ['Missing required field'],
          warnings: [],
        },
      );
    });

    it('should log info for warnings when validation passes', async () => {
      const { validateContentMetadata } = vi.mocked(
        await import('@/lib/content-validation'),
      );
      validateContentMetadata.mockReturnValue({
        isValid: true,
        errors: [],
        warnings: ['Field is deprecated'],
      });

      parseContentFile(mockFilePath, mockContentType);

      expect(mockLogger.info).toHaveBeenCalledWith(
        'Content validation warnings',
        {
          file: mockFilePath,
          warnings: ['Field is deprecated'],
        },
      );
    });

    it('should throw ContentValidationError in strict mode', async () => {
      const { validateContentMetadata } = vi.mocked(
        await import('@/lib/content-validation'),
      );
      validateContentMetadata.mockReturnValue({
        isValid: false,
        errors: ['Title too long'],
        warnings: [],
      });

      expect(() =>
        parseContentFile(mockFilePath, mockContentType, { strictMode: true }),
      ).toThrow(ContentValidationError);
    });

    it('should use slug from frontmatter if provided', () => {
      const contentWithSlug = `---
title: Test
slug: custom-slug
---

Content`;
      mockFs.readFileSync.mockReturnValue(contentWithSlug);

      const result = parseContentFile(mockFilePath, mockContentType);

      expect(result.slug).toBe('custom-slug');
    });
  });
});
