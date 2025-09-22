/**
 * Footer Internationalization and Branding Integration Tests
 *
 * Tests the footer component's i18n and branding functionality including:
 * - Multi-language content display
 * - Translation handling and fallbacks
 * - Company branding and logo display
 * - Copyright information
 */

import { Footer } from '@/components/layout/footer';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock next-intl hooks
const mockUseTranslations = vi.fn();
const mockUseLocale = vi.fn();

vi.mock('next-intl', () => ({
  useTranslations: () => mockUseTranslations,
  useLocale: () => mockUseLocale(),
}));

// Mock Next.js Link component
vi.mock('next/link', () => ({
  default: ({
    children,
    href,
    className,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
    className?: string;
    [key: string]: unknown;
  }) => (
    <a
      data-testid={`footer-link-${href.replace(/[^a-zA-Z0-9]/g, '-')}`}
      href={href}
      className={className}
      {...props}
    >
      {children}
    </a>
  ),
}));

vi.mock('@/lib/footer-config', () => {
  const mockFooterConfig = {
    company: {
      name: 'Tucsenberg',
      description: 'Enterprise solutions provider',
    },
    sections: [
      {
        key: 'products',
        titleKey: 'footer.sections.products.title',
        links: [
          {
            translationKey: 'footer.sections.products.links.solutions',
            href: '/solutions',
            external: false,
          },
          {
            translationKey: 'footer.sections.products.links.services',
            href: '/services',
            external: false,
          },
        ],
      },
      {
        key: 'company',
        titleKey: 'footer.sections.company.title',
        links: [
          {
            translationKey: 'footer.sections.company.links.about',
            href: '/about',
            external: false,
          },
          {
            translationKey: 'footer.sections.company.links.contact',
            href: '/contact',
            external: false,
          },
        ],
      },
      {
        key: 'legal',
        titleKey: 'footer.sections.legal.title',
        links: [
          {
            translationKey: 'footer.sections.legal.links.privacy',
            href: '/privacy',
            external: false,
          },
          {
            translationKey: 'footer.sections.legal.links.terms',
            href: '/terms',
            external: false,
          },
        ],
      },
    ],
    socialLinks: [
      {
        key: 'linkedin',
        href: 'https://linkedin.com/company/tucsenberg',
        icon: 'linkedin',
        label: 'LinkedIn',
        ariaLabel: 'LinkedIn',
      },
      {
        key: 'twitter',
        href: 'https://twitter.com/tucsenberg',
        icon: 'twitter',
        label: 'Twitter',
        ariaLabel: 'Twitter',
      },
    ],
  };

  return {
    FOOTER_CONFIG: mockFooterConfig,
    getCopyrightText: (locale: string) =>
      locale === 'en'
        ? '© 2024 Tucsenberg. All rights reserved.'
        : '© 2024 Tucsenberg. 保留所有权利。',
  };
});

// Mock social icons component
vi.mock('@/components/ui/social-icons', () => ({
  ExternalLinkIcon: ({ size }: { size?: string | number }) => (
    <span
      data-testid='external-link-icon'
      data-size={size}
    >
      🔗
    </span>
  ),
  SocialIconLink: ({
    href,
    icon,
    _label,
    ariaLabel,
    ...props
  }: React.ComponentProps<'a'> & {
    href: string;
    icon: string;
    label: string;
    ariaLabel: string;
    _label?: string;
  }) => (
    <a
      data-testid={`social-link-${icon}`}
      href={href}
      aria-label={ariaLabel}
      target='_blank'
      rel='noopener noreferrer'
      {...props}
    >
      {icon === 'linkedin' ? '💼' : '🐦'}
    </a>
  ),
}));

describe('Footer Internationalization and Branding Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseLocale.mockReturnValue('en');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Internationalization Integration', () => {
    it('should display correct content for English locale', async () => {
      mockUseLocale.mockReturnValue('en');

      // Setup English translations
      mockUseTranslations.mockImplementation((key: string) => {
        const translations = new Map([
          ['footer.sections.products.title', 'Products'],
          ['footer.sections.company.title', 'Company'],
          ['footer.sections.legal.title', 'Legal'],
          ['footer.sections.social.title', 'Follow Us'],
        ]);

        return translations.get(key) || key;
      });

      render(<Footer />);

      // Verify English translations are used
      expect(mockUseTranslations).toHaveBeenCalled();
      expect(screen.getByText('Products')).toBeInTheDocument();
      expect(screen.getByText('Company')).toBeInTheDocument();
      expect(screen.getByText('Legal')).toBeInTheDocument();
    });

    it('should display correct content for Chinese locale', async () => {
      mockUseLocale.mockReturnValue('zh');

      // Setup Chinese translations
      mockUseTranslations.mockImplementation((key: string) => {
        const chineseTranslations = new Map([
          ['footer.sections.products.title', '产品'],
          ['footer.sections.products.links.solutions', '解决方案'],
          ['footer.sections.products.links.services', '服务'],
          ['footer.sections.company.title', '公司'],
          ['footer.sections.company.links.about', '关于我们'],
          ['footer.sections.company.links.contact', '联系我们'],
          ['footer.sections.legal.title', '法律'],
          ['footer.sections.legal.links.privacy', '隐私政策'],
          ['footer.sections.legal.links.terms', '服务条款'],
          ['footer.social.title', '关注我们'],
        ]);

        return chineseTranslations.get(key) || key;
      });

      render(<Footer />);

      expect(screen.getByText('产品')).toBeInTheDocument();
      expect(screen.getByText('公司')).toBeInTheDocument();
      expect(screen.getByText('法律')).toBeInTheDocument();
    });

    it('should handle missing translations gracefully', async () => {
      mockUseTranslations.mockImplementation((key: string) => `missing.${key}`);

      expect(() => render(<Footer />)).not.toThrow();

      const footer = screen.getByRole('contentinfo');
      expect(footer).toBeInTheDocument();
    });

    it('should handle translation function errors gracefully', async () => {
      mockUseTranslations.mockImplementation(() => {
        throw new Error('Translation error');
      });

      // 翻译错误应该被抛出，这是预期行为
      expect(() => render(<Footer />)).toThrow('Translation error');
    });

    it('should use fallback translations when primary fails', async () => {
      mockUseTranslations.mockImplementation((key: string) => {
        // Simulate partial translation availability
        const partialTranslations = new Map([
          ['footer.sections.products.title', 'Products'],
          // Missing other translations
        ]);

        return partialTranslations.get(key) || key;
      });

      render(<Footer />);

      // Should still render with available translations
      expect(screen.getByText('Products')).toBeInTheDocument();

      // Should show key for missing translations
      expect(
        screen.getByText('footer.sections.company.title'),
      ).toBeInTheDocument();
    });
  });

  describe('Company Branding Integration', () => {
    beforeEach(() => {
      // Setup default translations for branding tests
      mockUseTranslations.mockImplementation((key: string) => {
        const translations = new Map([
          ['footer.sections.products.title', 'Products'],
          ['footer.sections.company.title', 'Company'],
          ['footer.sections.legal.title', 'Legal'],
          ['footer.sections.social.title', 'Follow Us'],
        ]);

        return translations.get(key) || key;
      });
    });

    it('should display company logo and branding correctly', async () => {
      render(<Footer />);

      const companyLink = screen.getByLabelText('Tucsenberg homepage');
      expect(companyLink).toBeInTheDocument();
      expect(companyLink).toHaveAttribute('href', '/');

      const companyName = screen.getByText('Tucsenberg');
      expect(companyName).toBeInTheDocument();

      // Verify logo placeholder
      const logoPlaceholder = companyName.parentElement?.querySelector('div');
      expect(logoPlaceholder).toHaveTextContent('T'); // First letter of company name
    });

    it('should display copyright information correctly', async () => {
      render(<Footer />);

      const copyrightText = screen.getByText(
        '© 2024 Tucsenberg. All rights reserved.',
      );
      expect(copyrightText).toBeInTheDocument();
    });

    it('should display localized copyright information', async () => {
      mockUseLocale.mockReturnValue('zh');

      render(<Footer />);

      // Should use Chinese copyright text
      const copyrightText = screen.getByText(
        '© 2024 Tucsenberg. 保留所有权利。',
      );
      expect(copyrightText).toBeInTheDocument();
    });

    it('should handle company branding with different configurations', async () => {
      render(<Footer />);

      // Verify company section is always present
      const companyName = screen.getByText('Tucsenberg');
      expect(companyName).toBeInTheDocument();

      // Verify company link functionality
      const companyLink = screen.getByLabelText('Tucsenberg homepage');
      expect(companyLink).toHaveAttribute('href', '/');
    });

    it('should maintain brand consistency across locales', async () => {
      // Test English locale
      mockUseLocale.mockReturnValue('en');
      const { rerender } = render(<Footer />);

      let companyName = screen.getByText('Tucsenberg');
      expect(companyName).toBeInTheDocument();

      // Test Chinese locale
      mockUseLocale.mockReturnValue('zh');
      rerender(<Footer />);

      companyName = screen.getByText('Tucsenberg');
      expect(companyName).toBeInTheDocument(); // Company name should remain consistent
    });
  });
});
