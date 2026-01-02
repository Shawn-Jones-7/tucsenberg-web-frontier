import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  getUnconfiguredPlaceholders,
  isBaseUrlConfigured,
  isPlaceholder,
  SITE_CONFIG,
  validateSiteConfig,
} from '../site-config';

describe('site-config', () => {
  describe('SITE_CONFIG', () => {
    it('should export SITE_CONFIG object', () => {
      expect(SITE_CONFIG).toBeDefined();
      expect(typeof SITE_CONFIG.baseUrl).toBe('string');
      expect(typeof SITE_CONFIG.name).toBe('string');
    });

    it('should have required nested structures', () => {
      expect(SITE_CONFIG.seo).toBeDefined();
      expect(SITE_CONFIG.social).toBeDefined();
      expect(SITE_CONFIG.contact).toBeDefined();
    });
  });

  describe('isPlaceholder', () => {
    it('should return true for placeholder values', () => {
      expect(isPlaceholder('[PROJECT_NAME]')).toBe(true);
      expect(isPlaceholder('[TWITTER_URL]')).toBe(true);
      expect(isPlaceholder('[CONTACT_EMAIL]')).toBe(true);
      expect(isPlaceholder('[ANY_PLACEHOLDER]')).toBe(true);
    });

    it('should return false for non-placeholder values', () => {
      expect(isPlaceholder('My Company')).toBe(false);
      expect(isPlaceholder('https://twitter.com/mycompany')).toBe(false);
      expect(isPlaceholder('contact@example.com')).toBe(false);
      expect(isPlaceholder('')).toBe(false);
    });

    it('should return false for partial bracket patterns', () => {
      expect(isPlaceholder('[incomplete')).toBe(false);
      expect(isPlaceholder('incomplete]')).toBe(false);
      expect(isPlaceholder('text [PLACEHOLDER] text')).toBe(false);
    });
  });

  describe('isBaseUrlConfigured', () => {
    afterEach(() => {
      vi.unstubAllEnvs();
    });

    it('should return true in non-production environment', () => {
      vi.stubEnv('NODE_ENV', 'development');
      expect(isBaseUrlConfigured()).toBe(true);
    });

    it('should return true in test environment', () => {
      vi.stubEnv('NODE_ENV', 'test');
      expect(isBaseUrlConfigured()).toBe(true);
    });

    it('should return false in production when baseUrl contains example.com', () => {
      vi.stubEnv('NODE_ENV', 'production');
      // SITE_CONFIG.baseUrl defaults to example.com when env vars not set
      const result = isBaseUrlConfigured();
      // Since baseUrl contains 'example.com', should return false in production
      expect(result).toBe(false);
    });
  });

  describe('getUnconfiguredPlaceholders', () => {
    it('should return array of placeholder objects', () => {
      const placeholders = getUnconfiguredPlaceholders();
      expect(Array.isArray(placeholders)).toBe(true);
    });

    it('should include path and value for each placeholder', () => {
      const placeholders = getUnconfiguredPlaceholders();
      for (const placeholder of placeholders) {
        expect(placeholder).toHaveProperty('path');
        expect(placeholder).toHaveProperty('value');
        expect(typeof placeholder.path).toBe('string');
        expect(typeof placeholder.value).toBe('string');
      }
    });

    it('should detect placeholder in SITE_CONFIG.name', () => {
      const placeholders = getUnconfiguredPlaceholders();
      const namePlaceholder = placeholders.find(
        (p) => p.path === 'SITE_CONFIG.name',
      );
      if (isPlaceholder(SITE_CONFIG.name)) {
        expect(namePlaceholder).toBeDefined();
        expect(namePlaceholder?.value).toBe(SITE_CONFIG.name);
      }
    });

    it('should detect placeholder in SITE_CONFIG.seo.defaultTitle', () => {
      const placeholders = getUnconfiguredPlaceholders();
      const titlePlaceholder = placeholders.find(
        (p) => p.path === 'SITE_CONFIG.seo.defaultTitle',
      );
      if (isPlaceholder(SITE_CONFIG.seo.defaultTitle)) {
        expect(titlePlaceholder).toBeDefined();
      }
    });

    it('should detect placeholder in social links', () => {
      const placeholders = getUnconfiguredPlaceholders();
      const socialPaths = [
        'SITE_CONFIG.social.twitter',
        'SITE_CONFIG.social.linkedin',
        'SITE_CONFIG.social.github',
      ];

      for (const path of socialPaths) {
        const key = path.split('.').pop() as keyof typeof SITE_CONFIG.social;
        if (isPlaceholder(SITE_CONFIG.social[key])) {
          const found = placeholders.find((p) => p.path === path);
          expect(found).toBeDefined();
        }
      }
    });

    it('should detect placeholder in contact email', () => {
      const placeholders = getUnconfiguredPlaceholders();
      if (isPlaceholder(SITE_CONFIG.contact.email)) {
        const emailPlaceholder = placeholders.find(
          (p) => p.path === 'SITE_CONFIG.contact.email',
        );
        expect(emailPlaceholder).toBeDefined();
      }
    });

    it('should detect titleTemplate containing [PROJECT_NAME]', () => {
      const placeholders = getUnconfiguredPlaceholders();
      if (SITE_CONFIG.seo.titleTemplate.includes('[PROJECT_NAME]')) {
        const templatePlaceholder = placeholders.find(
          (p) => p.path === 'SITE_CONFIG.seo.titleTemplate',
        );
        expect(templatePlaceholder).toBeDefined();
      }
    });
  });

  describe('validateSiteConfig', () => {
    afterEach(() => {
      vi.unstubAllEnvs();
    });

    it('should return validation result object', () => {
      const result = validateSiteConfig();
      expect(result).toHaveProperty('valid');
      expect(result).toHaveProperty('errors');
      expect(result).toHaveProperty('warnings');
      expect(typeof result.valid).toBe('boolean');
      expect(Array.isArray(result.errors)).toBe(true);
      expect(Array.isArray(result.warnings)).toBe(true);
    });

    it('should return warnings in non-production environment', () => {
      vi.stubEnv('NODE_ENV', 'development');
      const result = validateSiteConfig();
      // In development, placeholders generate warnings not errors
      expect(result.valid).toBe(true);
      expect(result.warnings.length).toBeGreaterThan(0);
    });

    it('should have valid=true when errors array is empty', () => {
      vi.stubEnv('NODE_ENV', 'development');
      const result = validateSiteConfig();
      expect(result.valid).toBe(result.errors.length === 0);
    });

    it('should include placeholder paths in warning messages', () => {
      vi.stubEnv('NODE_ENV', 'development');
      const result = validateSiteConfig();
      const placeholders = getUnconfiguredPlaceholders();

      for (const placeholder of placeholders) {
        const hasWarning = result.warnings.some((w) =>
          w.includes(placeholder.path),
        );
        expect(hasWarning).toBe(true);
      }
    });

    it('should not add baseUrl warning in development (isBaseUrlConfigured returns true)', () => {
      vi.stubEnv('NODE_ENV', 'development');
      const result = validateSiteConfig();
      // In development, isBaseUrlConfigured() returns true, so no baseUrl warning
      const hasBaseUrlWarning = result.warnings.some((w) =>
        w.includes('SITE_CONFIG.baseUrl'),
      );
      expect(hasBaseUrlWarning).toBe(false);
    });

    it('should return errors in production environment for placeholders', () => {
      vi.stubEnv('NODE_ENV', 'production');
      const result = validateSiteConfig();
      // In production, placeholders generate errors not warnings
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should add baseUrl error in production when not configured', () => {
      vi.stubEnv('NODE_ENV', 'production');
      const result = validateSiteConfig();
      // In production with example.com baseUrl, should have baseUrl error
      const hasBaseUrlError = result.errors.some((e) =>
        e.includes('SITE_CONFIG.baseUrl'),
      );
      expect(hasBaseUrlError).toBe(true);
    });

    it('should include placeholder paths in error messages in production', () => {
      vi.stubEnv('NODE_ENV', 'production');
      const result = validateSiteConfig();
      const placeholders = getUnconfiguredPlaceholders();

      for (const placeholder of placeholders) {
        const hasError = result.errors.some((e) =>
          e.includes(placeholder.path),
        );
        expect(hasError).toBe(true);
      }
    });
  });
});
