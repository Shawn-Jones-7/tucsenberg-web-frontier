import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  COMPANY_INFO,
  FOOTER_CONFIG,
  FOOTER_SECTIONS,
  getCompanyInfo,
  getCopyrightText,
  getCurrentYear,
  getFooterConfig,
  getSocialLinks,
  SOCIAL_LINKS,
  type FooterLink,
  type FooterSection,
  type SocialLink,
} from '../footer-config';

// 测试常量定义
const TEST_YEARS = {
  YEAR_2024: 2024,
  YEAR_2025: 2025,
} as const;

const PLACEHOLDER_PATTERN = /\[[A-Z0-9_]+\]/;
const isPlaceholder = (value: string) => PLACEHOLDER_PATTERN.test(value);
const isHttpUrl = (value: string) => /^https?:\/\/.+/.test(value);
const isEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
const isPhone = (value: string) =>
  /^\+\d{1,3}[-\s]?\(?[\d]{1,4}\)?[-\s]?\d{1,4}[-\s]?\d{1,9}$/.test(value);
const isNonEmptyString = (value: string) => value.trim().length > 0;

describe('footer-config', () => {
  describe('interfaces and types', () => {
    it('should have valid FooterLink structure', () => {
      const link: FooterLink = {
        key: 'test',
        href: '/test',
        external: true,
        translationKey: 'test.key',
      };

      expect(link.key).toBe('test');
      expect(link.href).toBe('/test');
      expect(link.external).toBe(true);
      expect(link.translationKey).toBe('test.key');
    });

    it('should have valid FooterSection structure', () => {
      const section: FooterSection = {
        key: 'test-section',
        titleKey: 'test.title',
        links: [],
      };

      expect(section.key).toBe('test-section');
      expect(section.titleKey).toBe('test.title');
      expect(Array.isArray(section.links)).toBe(true);
    });

    it('should have valid SocialLink structure', () => {
      const socialLink: SocialLink = {
        key: 'test-social',
        href: 'https://example.com',
        icon: 'test-icon',
        label: 'Test Social',
        ariaLabel: 'Test social media link',
      };

      expect(socialLink.key).toBe('test-social');
      expect(socialLink.href).toBe('https://example.com');
      expect(socialLink.icon).toBe('test-icon');
      expect(socialLink.label).toBe('Test Social');
      expect(socialLink.ariaLabel).toBe('Test social media link');
    });
  });

  describe('COMPANY_INFO', () => {
    it('should have required company information', () => {
      expect(
        isPlaceholder(COMPANY_INFO.name) || isNonEmptyString(COMPANY_INFO.name),
      ).toBe(true);
      expect(COMPANY_INFO.description).toContain('B2B');
      expect(COMPANY_INFO.address).toBeDefined();
      expect(COMPANY_INFO.contact).toBeDefined();
    });

    it('should have valid address information', () => {
      const { address } = COMPANY_INFO;
      expect(address).toBeDefined();
      expect(
        isPlaceholder(address!.street) || isNonEmptyString(address!.street),
      ).toBe(true);
      expect(
        isPlaceholder(address!.city) || isNonEmptyString(address!.city),
      ).toBe(true);
      expect(
        isPlaceholder(address!.country) || isNonEmptyString(address!.country),
      ).toBe(true);
      expect(
        isPlaceholder(address!.postalCode) ||
          isNonEmptyString(address!.postalCode),
      ).toBe(true);
    });

    it('should have valid contact information', () => {
      const { contact } = COMPANY_INFO;
      expect(contact).toBeDefined();
      expect(isPlaceholder(contact!.email) || isEmail(contact!.email)).toBe(
        true,
      );
      expect(isPlaceholder(contact!.phone) || isPhone(contact!.phone)).toBe(
        true,
      );
    });
  });

  describe('FOOTER_SECTIONS', () => {
    it('should have all required sections', () => {
      const sectionKeys = FOOTER_SECTIONS.map((section) => section.key);
      expect(sectionKeys).toContain('navigation');
      expect(sectionKeys).toContain('support');
    });

    it('should have valid section structure', () => {
      FOOTER_SECTIONS.forEach((section) => {
        expect(section.key).toBeTruthy();
        expect(section.titleKey).toBeTruthy();
        expect(Array.isArray(section.links)).toBe(true);
        expect(section.links.length).toBeGreaterThan(0);
      });
    });

    it('should have valid links in each section', () => {
      FOOTER_SECTIONS.forEach((section) => {
        section.links.forEach((link) => {
          expect(link.key).toBeTruthy();
          expect(link.href).toBeTruthy();
          expect(link.translationKey).toBeTruthy();

          // Check href format - allow placeholders or valid paths/URLs
          expect(
            isPlaceholder(link.href) || /^(\/|https?:\/\/)/.test(link.href),
          ).toBe(true);

          // External links should have external flag
          if (link.href.startsWith('http') && !isPlaceholder(link.href)) {
            expect(link.external).toBe(true);
          }
        });
      });
    });

    it('should have navigation section with correct links', () => {
      const navigationSection = FOOTER_SECTIONS.find(
        (s) => s.key === 'navigation',
      );
      expect(navigationSection).toBeDefined();

      const linkKeys = navigationSection!.links.map((link) => link.key);
      expect(linkKeys).toContain('home');
      expect(linkKeys).toContain('about');
      expect(linkKeys).toContain('products');
      expect(linkKeys).toContain('blog');
      expect(linkKeys).toContain('contact');
    });

    it('should have support section with correct links', () => {
      const supportSection = FOOTER_SECTIONS.find((s) => s.key === 'support');
      expect(supportSection).toBeDefined();

      const linkKeys = supportSection!.links.map((link) => link.key);
      expect(linkKeys).toContain('faq');
      expect(linkKeys).toContain('privacy');
      expect(linkKeys).toContain('terms');
    });
  });

  describe('SOCIAL_LINKS', () => {
    it('should have social media links', () => {
      expect(SOCIAL_LINKS.length).toBeGreaterThan(0);

      const socialKeys = SOCIAL_LINKS.map((link) => link.key);
      expect(socialKeys).toContain('twitter');
      expect(socialKeys).toContain('linkedin');
      expect(socialKeys).toContain('github');
    });

    it('should have valid social link structure', () => {
      SOCIAL_LINKS.forEach((link) => {
        expect(link.key).toBeTruthy();
        expect(isPlaceholder(link.href) || isHttpUrl(link.href)).toBe(true);
        expect(link.icon).toBeTruthy();
        expect(link.label).toBeTruthy();
        expect(link.ariaLabel).toBeTruthy();
      });
    });

    it('should have accessibility labels', () => {
      SOCIAL_LINKS.forEach((link) => {
        expect(link.ariaLabel).toContain(link.label);
      });
    });
  });

  describe('FOOTER_CONFIG', () => {
    it('should combine all footer configuration', () => {
      expect(FOOTER_CONFIG.company).toBe(COMPANY_INFO);
      expect(FOOTER_CONFIG.sections).toBe(FOOTER_SECTIONS);
      expect(FOOTER_CONFIG.socialLinks).toBe(SOCIAL_LINKS);
    });
  });

  describe('utility functions', () => {
    describe('getFooterConfig', () => {
      it('should return the footer configuration', () => {
        const config = getFooterConfig();
        expect(config).toBe(FOOTER_CONFIG);
      });
    });

    describe('getCompanyInfo', () => {
      it('should return company information', () => {
        const info = getCompanyInfo();
        expect(info).toBe(COMPANY_INFO);
      });
    });

    describe('getSocialLinks', () => {
      it('should return social links', () => {
        const links = getSocialLinks();
        expect(links).toBe(SOCIAL_LINKS);
      });
    });

    describe('getCurrentYear', () => {
      beforeEach(() => {
        vi.useFakeTimers();
      });

      afterEach(() => {
        vi.useRealTimers();
      });

      it('should return current year', () => {
        const mockDate = new Date('2024-06-15');
        vi.setSystemTime(mockDate);

        const year = getCurrentYear();
        expect(year).toBe(TEST_YEARS.YEAR_2024);
      });

      it('should return different year when date changes', () => {
        const mockDate = new Date('2025-01-01');
        vi.setSystemTime(mockDate);

        const year = getCurrentYear();
        expect(year).toBe(TEST_YEARS.YEAR_2025);
      });
    });

    describe('getCopyrightText', () => {
      beforeEach(() => {
        vi.useFakeTimers();
        const mockDate = new Date('2024-06-15');
        vi.setSystemTime(mockDate);
      });

      afterEach(() => {
        vi.useRealTimers();
      });

      it('should generate English copyright text by default', () => {
        const text = getCopyrightText();
        expect(text).toContain('© 2024');
        expect(text).toContain('All rights reserved');
      });

      it('should generate English copyright text explicitly', () => {
        const text = getCopyrightText('en');
        expect(text).toContain('© 2024');
        expect(text).toContain('All rights reserved');
      });

      it('should generate Chinese copyright text', () => {
        const text = getCopyrightText('zh');
        expect(text).toContain('© 2024');
        expect(text).toContain('保留所有权利');
      });

      it('should include current year in copyright text', () => {
        const text = getCopyrightText();
        expect(text).toContain('2024');
        expect(text).toMatch(/©\s*\d{4}/);
      });

      it('should handle different years correctly', () => {
        const mockDate = new Date('2025-12-31');
        vi.setSystemTime(mockDate);

        const text = getCopyrightText();
        expect(text).toContain('2025');
      });
    });
  });

  describe('data validation', () => {
    it('should have unique keys in footer sections', () => {
      const keys = FOOTER_SECTIONS.map((section) => section.key);
      const uniqueKeys = new Set(keys);
      expect(keys.length).toBe(uniqueKeys.size);
    });

    it('should have unique keys in social links', () => {
      const keys = SOCIAL_LINKS.map((link) => link.key);
      const uniqueKeys = new Set(keys);
      expect(keys.length).toBe(uniqueKeys.size);
    });

    it('should have unique keys within each section links', () => {
      FOOTER_SECTIONS.forEach((section) => {
        const linkKeys = section.links.map((link) => link.key);
        const uniqueLinkKeys = new Set(linkKeys);
        expect(linkKeys.length).toBe(uniqueLinkKeys.size);
      });
    });
  });
});
