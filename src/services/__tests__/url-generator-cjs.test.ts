/**
 * URL Generator CJS Module Tests
 * Tests for the CommonJS version used by next-sitemap.config.js
 */

import { describe, expect, it } from 'vitest';

// Import the CJS module
const urlGeneratorCjs = require('../url-generator-cjs.js');

describe('url-generator-cjs', () => {
  describe('SITE_CONFIG', () => {
    it('should have baseUrl defined', () => {
      expect(urlGeneratorCjs.SITE_CONFIG).toBeDefined();
      expect(urlGeneratorCjs.SITE_CONFIG.baseUrl).toBeDefined();
      expect(typeof urlGeneratorCjs.SITE_CONFIG.baseUrl).toBe('string');
    });
  });

  describe('LOCALES_CONFIG', () => {
    it('should have locales array', () => {
      expect(urlGeneratorCjs.LOCALES_CONFIG.locales).toEqual(['en', 'zh']);
    });

    it('should have defaultLocale', () => {
      expect(urlGeneratorCjs.LOCALES_CONFIG.defaultLocale).toBe('en');
    });

    it('should have prefixes', () => {
      expect(urlGeneratorCjs.LOCALES_CONFIG.prefixes).toEqual({
        en: '',
        zh: '/zh',
      });
    });
  });

  describe('PATHS_CONFIG', () => {
    it('should have home path', () => {
      expect(urlGeneratorCjs.PATHS_CONFIG.home).toEqual({ en: '/', zh: '/' });
    });

    it('should have about path', () => {
      expect(urlGeneratorCjs.PATHS_CONFIG.about).toEqual({
        en: '/about',
        zh: '/about',
      });
    });

    it('should have all required paths', () => {
      const requiredPaths = [
        'home',
        'about',
        'contact',
        'blog',
        'products',
        'privacy',
        'terms',
      ];
      requiredPaths.forEach((path) => {
        expect(urlGeneratorCjs.PATHS_CONFIG[path]).toBeDefined();
      });
    });
  });

  describe('getLocalizedPath', () => {
    it('should return correct path for home page', () => {
      expect(urlGeneratorCjs.getLocalizedPath('home', 'en')).toBe('/');
      expect(urlGeneratorCjs.getLocalizedPath('home', 'zh')).toBe('/');
    });

    it('should return correct path for about page', () => {
      expect(urlGeneratorCjs.getLocalizedPath('about', 'en')).toBe('/about');
      expect(urlGeneratorCjs.getLocalizedPath('about', 'zh')).toBe('/about');
    });

    it('should throw error for unknown page type', () => {
      expect(() => urlGeneratorCjs.getLocalizedPath('unknown', 'en')).toThrow(
        'Unknown page type: unknown',
      );
    });
  });

  describe('generateCanonicalURL', () => {
    it('should generate correct URL for English pages', () => {
      const url = urlGeneratorCjs.generateCanonicalURL('about', 'en');
      expect(url).toContain('/about');
      expect(url).not.toContain('/en/');
    });

    it('should generate correct URL for Chinese pages', () => {
      const url = urlGeneratorCjs.generateCanonicalURL('about', 'zh');
      expect(url).toContain('/zh/about');
    });

    it('should generate correct URL for home page', () => {
      const enUrl = urlGeneratorCjs.generateCanonicalURL('home', 'en');
      const zhUrl = urlGeneratorCjs.generateCanonicalURL('home', 'zh');
      expect(enUrl).toMatch(/\/$/);
      expect(zhUrl).toContain('/zh/');
    });
  });

  describe('generateHreflangLinks', () => {
    it('should generate links for all locales plus x-default', () => {
      const links = urlGeneratorCjs.generateHreflangLinks('about');
      expect(links).toHaveLength(3); // en, zh, x-default
    });

    it('should include x-default link', () => {
      const links = urlGeneratorCjs.generateHreflangLinks('about');
      const xDefault = links.find(
        (link: { hreflang: string }) => link.hreflang === 'x-default',
      );
      expect(xDefault).toBeDefined();
    });

    it('should have correct structure for each link', () => {
      const links = urlGeneratorCjs.generateHreflangLinks('home');
      links.forEach((link: { href: string; hreflang: string }) => {
        expect(link).toHaveProperty('href');
        expect(link).toHaveProperty('hreflang');
        expect(typeof link.href).toBe('string');
        expect(typeof link.hreflang).toBe('string');
      });
    });
  });

  describe('generateSitemapEntry', () => {
    it('should generate entry with required fields', () => {
      const entry = urlGeneratorCjs.generateSitemapEntry('about', 'en');
      expect(entry).toHaveProperty('loc');
      expect(entry).toHaveProperty('changefreq');
      expect(entry).toHaveProperty('priority');
      expect(entry).toHaveProperty('lastmod');
      expect(entry).toHaveProperty('alternateRefs');
    });

    it('should use default options when not provided', () => {
      const entry = urlGeneratorCjs.generateSitemapEntry('about', 'en');
      expect(entry.changefreq).toBe('weekly');
      expect(entry.priority).toBe(0.8);
    });

    it('should accept custom options', () => {
      const entry = urlGeneratorCjs.generateSitemapEntry('home', 'en', {
        changefreq: 'daily',
        priority: 1.0,
      });
      expect(entry.changefreq).toBe('daily');
      expect(entry.priority).toBe(1.0);
    });
  });

  describe('generateAllSitemapEntries', () => {
    it('should generate entries for all pages and locales', () => {
      const entries = urlGeneratorCjs.generateAllSitemapEntries();
      expect(Array.isArray(entries)).toBe(true);
      expect(entries.length).toBeGreaterThan(0);
    });

    it('should have home pages with highest priority', () => {
      const entries = urlGeneratorCjs.generateAllSitemapEntries();
      const homeEntries = entries.filter(
        (entry: { loc: string }) =>
          entry.loc.endsWith('/') || entry.loc.endsWith('/zh/'),
      );
      homeEntries.forEach((entry: { priority: number; changefreq: string }) => {
        expect(entry.priority).toBe(1.0);
        expect(entry.changefreq).toBe('daily');
      });
    });
  });

  describe('getLocalizedPaths', () => {
    it('should return paths excluding home', () => {
      const paths = urlGeneratorCjs.getLocalizedPaths();
      expect(paths).not.toHaveProperty('/');
    });

    it('should return object with path mappings', () => {
      const paths = urlGeneratorCjs.getLocalizedPaths();
      expect(typeof paths).toBe('object');
      expect(Object.keys(paths).length).toBeGreaterThan(0);
    });
  });
});
