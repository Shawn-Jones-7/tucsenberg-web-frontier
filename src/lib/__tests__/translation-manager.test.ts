import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { TranslationManagerConfig } from '@/types/translation-manager';
import { TranslationManager } from '@/lib/translation-manager';
import { TEST_CONTENT_LIMITS } from '@/constants/test-constants';

// 测试常量定义
const TEST_PERIODS = {
  QUALITY_TREND_DAYS: 7, // 质量趋势报告的天数
} as const;

// Mock file system operations
vi.mock('fs', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...(actual as unknown),
    existsSync: vi.fn(),
    readFileSync: vi.fn(),
    writeFileSync: vi.fn(),
  };
});

vi.mock('path', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...(actual as unknown),
    join: vi.fn((...args) => args.join('/')),
    resolve: vi.fn((...args) => args.join('/')),
  };
});

describe('TranslationManager', () => {
  let manager: TranslationManager;
  let mockConfig: TranslationManagerConfig;

  beforeEach(() => {
    vi.clearAllMocks();

    mockConfig = {
      locales: ['en', 'zh'],
      defaultLocale: 'en',
      messagesDir: '/mock/messages',
      qualityThresholds: {
        minScore: 0.8,
        maxIssues: 5,
        criticalIssueThreshold: 2,
      },
      // translationsPath: '/mock/translations', // Remove unknown property
      lingo: {
        enabled: false,
        apiKey: 'test-api-key',
        projectId: 'test-project',
        baseUrl: 'https://api.lingo.dev',
      },
      // quality: { // Remove unknown property
      //   enableValidation: true,
      //   enableCaching: true,
      //   thresholds: VALIDATION_THRESHOLDS,
      //   weights: QUALITY_WEIGHTS,
      // },
    };

    manager = new TranslationManager(mockConfig);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('initialization', () => {
    it('should initialize without Lingo integration', async () => {
      const fs = await import('fs');
      const mockFs = vi.mocked(fs);

      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(
        JSON.stringify({
          common: {
            hello: 'Hello',
            goodbye: 'Goodbye',
          },
        }),
      );

      await expect(manager.initialize()).resolves.not.toThrow();
    });

    it('should initialize with Lingo integration enabled', async () => {
      mockConfig.lingo.enabled = true;
      manager = new TranslationManager(mockConfig);

      const fs = await import('fs');
      const mockFs = vi.mocked(fs);

      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(
        JSON.stringify({
          common: { hello: 'Hello' },
        }),
      );

      // Mock fetch for Lingo API
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ status: 'connected' }),
      });

      await expect(manager.initialize()).resolves.not.toThrow();
    });

    it('should handle missing translation files gracefully', async () => {
      const fs = await import('fs');
      const mockFs = vi.mocked(fs);

      mockFs.existsSync.mockReturnValue(false);

      await expect(manager.initialize()).resolves.not.toThrow();
    });

    it('should handle malformed translation files', async () => {
      const fs = await import('fs');
      const mockFs = vi.mocked(fs);

      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue('invalid json');

      await expect(manager.initialize()).resolves.not.toThrow();
    });
  });

  describe('translation retrieval', () => {
    beforeEach(async () => {
      const fs = await import('fs');
      const mockFs = vi.mocked(fs);

      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockImplementation((filePath) => {
        if (String(filePath).includes('en.json')) {
          return JSON.stringify({
            common: {
              hello: 'Hello',
              goodbye: 'Goodbye',
            },
            navigation: {
              home: 'Home',
              about: 'About',
            },
          });
        }
        if (String(filePath).includes('zh.json')) {
          return JSON.stringify({
            common: {
              hello: '你好',
              goodbye: '再见',
            },
            navigation: {
              home: '首页',
              about: '关于',
            },
          });
        }
        return '{}';
      });

      await manager.initialize();
    });

    it('should retrieve translation by key', () => {
      const translation = manager.getTranslation('common.hello', 'en');
      expect(translation).toBe('Hello');
    });

    it('should retrieve Chinese translation', () => {
      const translation = manager.getTranslation('common.hello', 'zh');
      expect(translation).toBe('你好');
    });

    it('should handle nested translation keys', () => {
      const translation = manager.getTranslation('navigation.home', 'en');
      expect(translation).toBe('Home');
    });

    it('should return key when translation not found', () => {
      const translation = manager.getTranslation('missing.key', 'en');
      expect(translation).toBe('missing.key');
    });

    it('should fallback to default locale when translation missing', () => {
      const translation = manager.getTranslation(
        'common.hello',
        'fr' as unknown,
      );
      expect(translation).toBe('Hello');
    });

    it('should handle empty translation values', async () => {
      const fs = await import('fs');
      const mockFs = vi.mocked(fs);

      mockFs.readFileSync.mockReturnValue(
        JSON.stringify({
          common: { empty: '' },
        }),
      );

      const translation = manager.getTranslation('common.empty', 'en');
      expect(translation).toBe('common.empty');
    });
  });

  describe('quality validation', () => {
    beforeEach(async () => {
      const fs = await import('fs');
      const mockFs = vi.mocked(fs);

      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockImplementation(() =>
        JSON.stringify({
          common: {
            hello: 'Hello',
            goodbye: 'Goodbye',
            longText:
              'This is a very long text that exceeds normal length limits for testing purposes',
          },
        }),
      );

      await manager.initialize();
    });

    it('should validate translation quality', async () => {
      const report = await manager.validateTranslationQuality('en');

      expect(report).toHaveProperty('locale', 'en');
      expect(report).toHaveProperty('totalKeys');
      expect(report).toHaveProperty('validKeys');
      expect(report).toHaveProperty('issues');
      expect(report).toHaveProperty('score');
      expect(Array.isArray(report.issues)).toBe(true);
    });

    it('should detect missing translations', async () => {
      const fs = await import('fs');
      const mockFs = vi.mocked(fs);

      // Mock incomplete Chinese translations
      mockFs.readFileSync.mockImplementation((filePath) => {
        if (String(filePath).includes('en.json')) {
          return JSON.stringify({
            common: { hello: 'Hello', goodbye: 'Goodbye' },
          });
        }
        if (String(filePath).includes('zh.json')) {
          return JSON.stringify({
            common: { hello: '你好' }, // Missing goodbye
          });
        }
        return '{}';
      });

      await manager.initialize();
      const report = await manager.validateTranslationQuality('zh');

      const missingIssues = report.issues.filter(
        (issue: any) => issue.type === 'missing',
      );
      expect(missingIssues.length).toBeGreaterThan(0);
    });

    it('should detect overly long translations', async () => {
      const fs = await import('fs');
      const mockFs = vi.mocked(fs);

      // Mock translations with overly long text
      const longText = 'A'.repeat(TEST_CONTENT_LIMITS.MEDIUM_TEXT_MAX); // 250 characters, exceeds 200 limit
      mockFs.readFileSync.mockImplementation((filePath) => {
        if (String(filePath).includes('en.json')) {
          return JSON.stringify({
            common: {
              hello: 'Hello',
              longMessage: longText,
            },
          });
        }
        return '{}';
      });

      await manager.initialize();
      const report = await manager.validateTranslationQuality('en');

      const lengthIssues = report.issues.filter(
        (issue: any) => issue.type === 'length',
      );
      expect(lengthIssues.length).toBeGreaterThan(0);
    });

    it('should calculate quality score correctly', async () => {
      const report = await manager.validateTranslationQuality('en');

      expect(report.score).toBeGreaterThanOrEqual(0);
      expect(report.score).toBeLessThanOrEqual(100);
    });

    it('should cache quality results when enabled', async () => {
      const report1 = await manager.validateTranslationQuality('en');
      const report2 = await manager.validateTranslationQuality('en');

      expect(report1.score).toBe(report2.score);
    });
  });

  describe('batch operations', () => {
    beforeEach(async () => {
      const fs = await import('fs');
      const mockFs = vi.mocked(fs);

      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockImplementation(() =>
        JSON.stringify({
          common: { hello: 'Hello', goodbye: 'Goodbye' },
        }),
      );

      await manager.initialize();
    });

    it('should get multiple translations at once', () => {
      const keys = ['common.hello', 'common.goodbye'];
      const translations = manager.getBatchTranslations(keys, 'en');

      expect(translations).toEqual({
        'common.hello': 'Hello',
        'common.goodbye': 'Goodbye',
      });
    });

    it('should validate all locales', async () => {
      const reports = await (manager as any).validateAllLocales();

      expect(Array.isArray(reports)).toBe(true);
      expect(reports.length).toBe(mockConfig.locales.length);

      reports.forEach((report: any) => {
        expect(report).toHaveProperty('locale');
        expect(report).toHaveProperty('score');
      });
    });

    it('should generate quality trend report', async () => {
      // Mock historical data
      const trend = await (manager as any).getQualityTrend(
        'en',
        TEST_PERIODS.QUALITY_TREND_DAYS,
      );

      expect(trend).toHaveProperty('locale', 'en');
      expect(trend).toHaveProperty('period');
      expect(Array.isArray(trend.dataPoints)).toBe(true);
    });
  });

  describe('error handling', () => {
    it('should handle file system errors gracefully', async () => {
      const fs = await import('fs');
      const mockFs = vi.mocked(fs);

      mockFs.existsSync.mockImplementation(() => {
        throw new Error('File system error');
      });

      await expect(manager.initialize()).resolves.not.toThrow();
    });

    it('should handle Lingo API errors', async () => {
      mockConfig.lingo.enabled = true;
      manager = new TranslationManager(mockConfig);

      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      await expect(manager.initialize()).resolves.not.toThrow();
    });

    it('should handle invalid locale gracefully', () => {
      const translation = manager.getTranslation(
        'common.hello',
        'invalid' as unknown,
      );
      expect(typeof translation).toBe('string');
    });

    it('should handle malformed translation keys', () => {
      const translation = manager.getTranslation('', 'en');
      expect(translation).toBe('');
    });

    it('should handle null/undefined keys', () => {
      const translation1 = manager.getTranslation(null as unknown, 'en');
      const translation2 = manager.getTranslation(undefined as unknown, 'en');

      expect(typeof translation1).toBe('string');
      expect(typeof translation2).toBe('string');
    });
  });

  describe('performance optimization', () => {
    it('should cache translation lookups', () => {
      const key = 'common.hello';
      const locale = 'en';

      // First call
      const start1 = performance.now();
      const translation1 = manager.getTranslation(key, locale);
      const end1 = performance.now();

      // Second call (should be cached)
      const start2 = performance.now();
      const translation2 = manager.getTranslation(key, locale);
      const end2 = performance.now();

      expect(translation1).toBe(translation2);
      // Second call should be faster (cached)
      expect(end2 - start2).toBeLessThanOrEqual(end1 - start1);
    });

    it('should handle large translation files efficiently', async () => {
      const fs = await import('fs');
      const mockFs = vi.mocked(fs);

      // Mock large translation file
      const largeTranslations: Record<string, string> = {};
      for (let i = 0; i < 1000; i++) {
        largeTranslations[`key${i}`] = `Translation ${i}`;
      }

      mockFs.readFileSync.mockReturnValue(
        JSON.stringify({
          large: largeTranslations,
        }),
      );

      const start = performance.now();
      await manager.initialize();
      const end = performance.now();

      // Should initialize within reasonable time
      expect(end - start).toBeLessThan(1000); // 1 second
    });
  });
});
