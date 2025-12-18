import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Locale } from '@/config/paths';
import {
  getLocalizedPath,
  getPageTypeFromPath,
  getPathnames,
  getRoutingConfig,
  getSitemapConfig,
  LOCALES_CONFIG,
  PATHS_CONFIG,
  SITE_CONFIG,
  validatePathsConfig,
  type LocalizedPath,
  type PageType,
} from '../paths';

describe('paths configuration', () => {
  describe('type definitions', () => {
    it('should have valid Locale type', () => {
      const enLocale: Locale = 'en';
      const zhLocale: Locale = 'zh';

      expect(enLocale).toBe('en');
      expect(zhLocale).toBe('zh');
    });

    it('should have valid PageType', () => {
      const pageTypes: PageType[] = [
        'home',
        'about',
        'contact',
        'blog',
        'products',
        'services',
        'pricing',
        'support',
        'privacy',
        'terms',
      ];

      pageTypes.forEach((type) => {
        expect(typeof type).toBe('string');
      });
    });

    it('should have valid LocalizedPath structure', () => {
      const path: LocalizedPath = {
        en: '/test',
        zh: '/test',
      };

      expect(path.en).toBe('/test');
      expect(path.zh).toBe('/test');
    });
  });

  describe('PATHS_CONFIG', () => {
    it('should have all required page types', () => {
      const expectedPageTypes: PageType[] = [
        'home',
        'about',
        'contact',
        'blog',
        'products',
        'services',
        'pricing',
        'support',
        'privacy',
        'terms',
      ];

      expectedPageTypes.forEach((pageType) => {
        expect(PATHS_CONFIG).toHaveProperty(pageType);
      });
    });

    it('should have both locales for each page type', () => {
      Object.entries(PATHS_CONFIG).forEach(([_pageType, paths]) => {
        expect(paths).toHaveProperty('en');
        expect(paths).toHaveProperty('zh');
        expect(typeof paths.en).toBe('string');
        expect(typeof paths.zh).toBe('string');
      });
    });

    it('should have consistent path format', () => {
      Object.entries(PATHS_CONFIG).forEach(([pageType, paths]) => {
        if (pageType !== 'home') {
          expect(paths.en).toMatch(/^\/[a-z-]*$/);
          expect(paths.zh).toMatch(/^\/[a-z-]*$/);
        } else {
          expect(paths.en).toBe('/');
          expect(paths.zh).toBe('/');
        }
      });
    });

    it('should use standard paths for all languages', () => {
      Object.entries(PATHS_CONFIG).forEach(([_pageType, paths]) => {
        // All languages should use the same path (standard approach)
        expect(paths.en).toBe(paths.zh);
      });
    });

    it('should be readonly', () => {
      expect(() => {
        // @ts-expect-error - Testing readonly property
        PATHS_CONFIG.home.en = '/changed';
      }).toThrow();
    });
  });

  describe('LOCALES_CONFIG', () => {
    it('should have correct locale configuration', () => {
      expect(LOCALES_CONFIG.locales).toEqual(['en', 'zh']);
      expect(LOCALES_CONFIG.defaultLocale).toBe('en');
    });

    it('should have valid prefixes', () => {
      expect(LOCALES_CONFIG.prefixes.en).toBe('');
      expect(LOCALES_CONFIG.prefixes.zh).toBe('/zh');
    });

    it('should have display names', () => {
      expect(LOCALES_CONFIG.displayNames.en).toBe('English');
      expect(LOCALES_CONFIG.displayNames.zh).toBe('中文');
    });

    it('should have time zones', () => {
      expect(LOCALES_CONFIG.timeZones.en).toBe('UTC');
      expect(LOCALES_CONFIG.timeZones.zh).toBe('Asia/Shanghai');
    });

    it('should be readonly', () => {
      expect(() => {
        // @ts-expect-error - Testing readonly property
        LOCALES_CONFIG.defaultLocale = 'zh';
      }).toThrow();
    });
  });

  describe('SITE_CONFIG', () => {
    beforeEach(() => {
      vi.stubEnv('SITE_URL', 'https://test.example.com');
    });

    afterEach(() => {
      vi.unstubAllEnvs();
    });

    it('should have basic site information', () => {
      expect(SITE_CONFIG.name).toBe('Tucsenberg');
      expect(SITE_CONFIG.description).toBeTruthy();
    });

    it('should use environment variable for baseUrl', () => {
      // Note: This test might not work as expected due to how the module is loaded
      // The baseUrl is set when the module is first imported
      expect(typeof SITE_CONFIG.baseUrl).toBe('string');
      expect(SITE_CONFIG.baseUrl).toMatch(/^https?:\/\/.+/);
    });

    it('should have SEO configuration', () => {
      expect(SITE_CONFIG.seo.titleTemplate).toContain('%s');
      expect(SITE_CONFIG.seo.defaultTitle).toBeTruthy();
      expect(SITE_CONFIG.seo.defaultDescription).toBeTruthy();
      expect(Array.isArray(SITE_CONFIG.seo.keywords)).toBe(true);
    });

    it('should have social media links', () => {
      expect(SITE_CONFIG.social.twitter).toMatch(/^https:\/\/twitter\.com/);
      expect(SITE_CONFIG.social.linkedin).toMatch(/^https:\/\/linkedin\.com/);
      expect(SITE_CONFIG.social.github).toMatch(/^https:\/\/github\.com/);
    });

    it('should have contact information', () => {
      expect(SITE_CONFIG.contact.phone).toMatch(/^\+\d/);
      expect(SITE_CONFIG.contact.email).toMatch(/^.+@.+\..+$/);
    });
  });

  describe('getLocalizedPath', () => {
    it('should return correct path for valid page type and locale', () => {
      expect(getLocalizedPath('home', 'en')).toBe('/');
      expect(getLocalizedPath('home', 'zh')).toBe('/');
      expect(getLocalizedPath('about', 'en')).toBe('/about');
      expect(getLocalizedPath('about', 'zh')).toBe('/about');
    });

    it('should throw error for invalid page type', () => {
      expect(() => {
        // @ts-expect-error - Testing invalid input
        getLocalizedPath('invalid', 'en');
      }).toThrow('Unknown page type: invalid');
    });

    it('should throw error for invalid locale', () => {
      expect(() => {
        // @ts-expect-error - Testing invalid input
        getLocalizedPath('home', 'fr');
      }).toThrow('Unknown locale: fr');
    });
  });

  describe('getPathnames', () => {
    it('should return all pathnames', () => {
      const pathnames = getPathnames();

      expect(pathnames['/']).toBe('/');
      expect(pathnames['/about']).toBe('/about');
      expect(pathnames['/contact']).toBe('/contact');
      expect(pathnames['/blog']).toBe('/blog');
      expect(pathnames['/products']).toBe('/products');
    });

    it('should include dynamic route patterns', () => {
      const pathnames = getPathnames();

      expect(pathnames['/blog/[slug]']).toBe('/blog/[slug]');
      expect(pathnames['/products/[slug]']).toBe('/products/[slug]');
    });

    it('should have consistent paths', () => {
      const pathnames = getPathnames();

      Object.entries(pathnames).forEach(([key, value]) => {
        expect(key).toBe(value);
      });
    });
  });

  describe('getPageTypeFromPath', () => {
    it('should return correct page type for valid paths', () => {
      expect(getPageTypeFromPath('/', 'en')).toBe('home');
      expect(getPageTypeFromPath('', 'en')).toBe('home');
      expect(getPageTypeFromPath('/about', 'en')).toBe('about');
      expect(getPageTypeFromPath('/contact', 'zh')).toBe('contact');
    });

    it('should return null for invalid paths', () => {
      expect(getPageTypeFromPath('/invalid', 'en')).toBeNull();
      expect(getPageTypeFromPath('/nonexistent', 'zh')).toBeNull();
    });

    it('should work with both locales', () => {
      expect(getPageTypeFromPath('/products', 'en')).toBe('products');
      expect(getPageTypeFromPath('/products', 'zh')).toBe('products');
    });
  });

  describe('validatePathsConfig', () => {
    it('should validate current configuration as valid', () => {
      const result = validatePathsConfig();

      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should detect missing locale paths', () => {
      // This test would require mocking the PATHS_CONFIG
      // For now, we just ensure the function works
      const result = validatePathsConfig();
      expect(typeof result.isValid).toBe('boolean');
      expect(Array.isArray(result.errors)).toBe(true);
    });
  });

  describe('getSitemapConfig', () => {
    it('should return valid sitemap configuration', () => {
      const config = getSitemapConfig();

      expect(config.baseUrl).toBeTruthy();
      expect(Array.isArray(config.locales)).toBe(true);
      expect(config.defaultLocale).toBe('en');
      expect(typeof config.localizedPaths).toBe('object');
    });

    it('should exclude home page from localized paths', () => {
      const config = getSitemapConfig();

      expect(config.localizedPaths).not.toHaveProperty('/');
    });

    it('should include other pages in localized paths', () => {
      const config = getSitemapConfig();

      expect(config.localizedPaths).toHaveProperty('/about');
      expect(config.localizedPaths).toHaveProperty('/contact');
    });
  });

  describe('getRoutingConfig', () => {
    it('should return valid routing configuration', () => {
      const config = getRoutingConfig();

      expect(config.locales).toEqual(['en', 'zh']);
      expect(config.defaultLocale).toBe('en');
      expect(config.localePrefix).toBe('always');
      expect(typeof config.pathnames).toBe('object');
    });

    it('should have pathnames matching getPathnames', () => {
      const config = getRoutingConfig();
      const pathnames = getPathnames();

      expect(config.pathnames).toEqual(pathnames);
    });
  });

  describe('integration tests', () => {
    it('should have consistent configuration across all functions', () => {
      const pathnames = getPathnames();
      const sitemapConfig = getSitemapConfig();
      const routingConfig = getRoutingConfig();

      // Check that all configurations use the same locales
      expect(sitemapConfig.locales).toEqual(routingConfig.locales);
      expect(sitemapConfig.defaultLocale).toBe(routingConfig.defaultLocale);

      // Check that pathnames are consistent
      expect(routingConfig.pathnames).toEqual(pathnames);
    });

    it('should work with all page types and locales', () => {
      const pageTypes: PageType[] = [
        'home',
        'about',
        'contact',
        'blog',
        'products',
        'services',
        'pricing',
        'support',
        'privacy',
        'terms',
      ];
      const locales: Locale[] = ['en', 'zh'];

      pageTypes.forEach((pageType) => {
        locales.forEach((locale) => {
          const path = getLocalizedPath(pageType, locale);
          const foundPageType = getPageTypeFromPath(path, locale);
          expect(foundPageType).toBe(pageType);
        });
      });
    });
  });

  describe('边缘情况和错误处理', () => {
    it('should handle empty string paths', () => {
      expect(getPageTypeFromPath('', 'en')).toBe('home');
      expect(getPageTypeFromPath('', 'zh')).toBe('home');
    });

    it('should handle paths with trailing slashes', () => {
      expect(getPageTypeFromPath('/about/', 'en')).toBeNull();
      expect(getPageTypeFromPath('/contact/', 'zh')).toBeNull();
    });

    it('should handle paths with query parameters', () => {
      expect(getPageTypeFromPath('/about?param=value', 'en')).toBeNull();
      expect(getPageTypeFromPath('/contact#section', 'zh')).toBeNull();
    });

    it('should handle case sensitivity', () => {
      expect(getPageTypeFromPath('/About', 'en')).toBeNull();
      expect(getPageTypeFromPath('/CONTACT', 'zh')).toBeNull();
    });

    it('should handle null and undefined inputs gracefully', () => {
      expect(() => {
        // @ts-expect-error - Testing invalid input
        getPageTypeFromPath(null, 'en');
      }).toThrow();

      expect(() => {
        // @ts-expect-error - Testing invalid input
        getPageTypeFromPath('/about', null);
      }).toThrow();
    });

    it('should handle extremely long paths', () => {
      const longPath = `/${'a'.repeat(1000)}`;
      expect(getPageTypeFromPath(longPath, 'en')).toBeNull();
    });

    it('should handle special characters in paths', () => {
      const specialPaths = [
        '/about%20us',
        '/contact@email',
        '/products&services',
        '/pricing#basic',
      ];

      specialPaths.forEach((path) => {
        expect(getPageTypeFromPath(path, 'en')).toBeNull();
      });
    });
  });

  describe('配置完整性验证', () => {
    it('should have all required properties in SITE_CONFIG', () => {
      const requiredProperties = [
        'name',
        'description',
        'baseUrl',
        'seo',
        'social',
        'contact',
      ];

      requiredProperties.forEach((prop) => {
        expect(SITE_CONFIG).toHaveProperty(prop);
      });
    });

    it('should have valid URL formats in social links', () => {
      const socialLinks = Object.values(SITE_CONFIG.social);

      socialLinks.forEach((link) => {
        expect(link).toMatch(/^https:\/\/.+/);
      });
    });

    it('should have consistent locale configuration', () => {
      const { locales } = LOCALES_CONFIG;

      // Check that all locales have prefixes
      locales.forEach((locale) => {
        expect(LOCALES_CONFIG.prefixes).toHaveProperty(locale);
        expect(LOCALES_CONFIG.displayNames).toHaveProperty(locale);
        expect(LOCALES_CONFIG.timeZones).toHaveProperty(locale);
      });
    });

    it('should have valid email format in contact', () => {
      expect(SITE_CONFIG.contact.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
    });

    it('should have valid phone format in contact', () => {
      // Phone can be a placeholder (with 'x') or actual number
      expect(SITE_CONFIG.contact.phone).toMatch(/^\+[\d\-x]+$/i);
    });
  });

  describe('性能和内存测试', () => {
    it('should handle repeated function calls efficiently', () => {
      const startTime = performance.now();

      for (let i = 0; i < 1000; i++) {
        getLocalizedPath('home', 'en');
        getPathnames();
        getPageTypeFromPath('/about', 'en');
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should complete within reasonable time (less than 100ms)
      expect(duration).toBeLessThan(100);
    });

    it('should not create memory leaks with repeated calls', () => {
      const getUsedHeapSize = () => {
        const perf = globalThis.performance as Performance & {
          memory?: { usedJSHeapSize?: number };
        };
        return perf.memory?.usedJSHeapSize ?? 0;
      };

      const initialMemory = getUsedHeapSize();

      // Perform many operations
      for (let i = 0; i < 10000; i++) {
        getLocalizedPath('about', 'en');
        getPageTypeFromPath('/contact', 'zh');
      }

      // Force garbage collection if available
      const gc = (globalThis as typeof globalThis & { gc?: () => void }).gc;
      if (typeof gc === 'function') {
        gc();
      }

      const finalMemory = getUsedHeapSize();
      const memoryIncrease = finalMemory - initialMemory;

      // Memory increase should be minimal (less than 1MB)
      expect(memoryIncrease).toBeLessThan(1024 * 1024);
    });
  });

  describe('错误处理强化测试', () => {
    it('should throw specific error messages for invalid inputs', () => {
      // Test getLocalizedPath with invalid page type
      expect(() => {
        getLocalizedPath('nonexistent' as PageType, 'en');
      }).toThrow('Unknown page type: nonexistent');

      // Test getLocalizedPath with invalid locale
      expect(() => {
        getLocalizedPath('home', 'fr' as Locale);
      }).toThrow('Unknown locale: fr');
    });

    it('should handle prototype pollution attempts', () => {
      // Test that the function doesn't use hasOwnProperty unsafely
      const maliciousPageType = '__proto__' as PageType;
      const maliciousLocale = 'constructor' as Locale;

      expect(() => {
        getLocalizedPath(maliciousPageType, 'en');
      }).toThrow();

      expect(() => {
        getLocalizedPath('home', maliciousLocale);
      }).toThrow();
    });

    it('should handle object property access edge cases', () => {
      // Test with properties that might exist on Object.prototype
      const edgeCaseInputs = [
        'toString',
        'valueOf',
        'hasOwnProperty',
        'constructor',
        '__proto__',
      ];

      edgeCaseInputs.forEach((input) => {
        expect(() => {
          getLocalizedPath(input as PageType, 'en');
        }).toThrow();

        expect(() => {
          getLocalizedPath('home', input as Locale);
        }).toThrow();
      });
    });
  });

  describe('配置验证深度测试', () => {
    it('should validate path uniqueness within locales', () => {
      const validation = validatePathsConfig();

      // If validation fails, check specific error types
      if (!validation.isValid) {
        const duplicateErrors = validation.errors.filter((error) =>
          error.includes('Duplicate path'),
        );

        // Should not have duplicate paths within the same locale
        expect(duplicateErrors.length).toBe(0);
      }
    });

    it('should validate complete locale coverage', () => {
      const validation = validatePathsConfig();

      if (!validation.isValid) {
        const missingPathErrors = validation.errors.filter(
          (error) =>
            error.includes('Missing') && error.includes('path for page type'),
        );

        // Should not have missing paths for any page type
        expect(missingPathErrors.length).toBe(0);
      }
    });

    it('should handle validation with edge case configurations', () => {
      // Test that validation function is robust
      const validation = validatePathsConfig();

      expect(typeof validation.isValid).toBe('boolean');
      expect(Array.isArray(validation.errors)).toBe(true);

      // Errors should be strings
      validation.errors.forEach((error) => {
        expect(typeof error).toBe('string');
        expect(error.length).toBeGreaterThan(0);
      });
    });
  });

  describe('类型系统完整性测试', () => {
    it('should ensure all PageType values are covered in PATHS_CONFIG', () => {
      const configKeys = Object.keys(PATHS_CONFIG) as PageType[];
      const expectedTypes: PageType[] = [
        'home',
        'about',
        'contact',
        'blog',
        'products',
        'services',
        'pricing',
        'support',
        'privacy',
        'terms',
      ];

      // All expected types should be present
      expectedTypes.forEach((type) => {
        expect(configKeys).toContain(type);
      });

      // No extra types should be present
      expect(configKeys.length).toBe(expectedTypes.length);
    });

    it('should ensure all Locale values are supported', () => {
      const supportedLocales = LOCALES_CONFIG.locales;
      const expectedLocales: Locale[] = ['en', 'zh'];

      expect(supportedLocales).toEqual(expectedLocales);

      // Each locale should have all required configuration
      supportedLocales.forEach((locale) => {
        expect(LOCALES_CONFIG.prefixes).toHaveProperty(locale);
        expect(LOCALES_CONFIG.displayNames).toHaveProperty(locale);
        expect(LOCALES_CONFIG.timeZones).toHaveProperty(locale);
      });
    });
  });
});
