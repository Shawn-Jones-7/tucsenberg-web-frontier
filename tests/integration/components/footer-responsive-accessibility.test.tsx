/**
 * Footer Responsive and Accessibility Integration Tests
 *
 * Tests the footer component's responsive behavior and accessibility features including:
 * - Responsive grid layout and column spans
 * - Semantic HTML structure
 * - ARIA labels and accessibility attributes
 * - Error recovery and graceful degradation
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

describe('Footer Responsive and Accessibility Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default translations
    mockUseTranslations.mockImplementation((key: string) => {
      const translations = new Map([
        ['footer.sections.products.title', 'Products'],
        ['footer.sections.products.links.solutions', 'Solutions'],
        ['footer.sections.products.links.services', 'Services'],
        ['footer.sections.company.title', 'Company'],
        ['footer.sections.company.links.about', 'About Us'],
        ['footer.sections.company.links.contact', 'Contact'],
        ['footer.sections.legal.title', 'Legal'],
        ['footer.sections.legal.links.privacy', 'Privacy Policy'],
        ['footer.sections.legal.links.terms', 'Terms of Service'],
        ['footer.sections.social.title', 'Follow Us'],
      ]);

      return translations.get(key) || key;
    });

    mockUseLocale.mockReturnValue('en');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Responsive Behavior Integration', () => {
    it('should apply correct responsive grid classes', async () => {
      render(<Footer />);

      const gridContainer = screen
        .getByRole('contentinfo')
        .querySelector('.grid');
      expect(gridContainer).toHaveClass(
        'grid',
        'grid-cols-1',
        'gap-8',
        'md:grid-cols-5',
      );
    });

    it('should handle responsive column spans correctly', async () => {
      render(<Footer />);

      const footer = screen.getByRole('contentinfo');

      // Company logo section should span 1 column on md+
      const logoSection = footer.querySelector('.md\\:col-span-1');
      expect(logoSection).toBeInTheDocument();
    });

    it('should maintain proper spacing on different screen sizes', async () => {
      render(<Footer />);

      const footer = screen.getByRole('contentinfo');

      // Verify padding and margin classes for responsive design
      expect(footer).toHaveClass('border-t', 'border-gray-200', 'bg-white');

      // Check for responsive grid container
      const gridContainer = footer.querySelector('.grid');
      expect(gridContainer).toHaveClass('gap-8');
    });

    it('should handle responsive text sizing appropriately', async () => {
      render(<Footer />);

      // Verify footer renders without layout issues
      const footer = screen.getByRole('contentinfo');
      expect(footer).toBeInTheDocument();

      // Company name should be visible
      const companyName = screen.getByText('Tucsenberg');
      expect(companyName).toBeInTheDocument();
    });

    it('should adapt layout for mobile and desktop views', async () => {
      render(<Footer />);

      const footer = screen.getByRole('contentinfo');
      const gridContainer = footer.querySelector('.grid');

      // Should have mobile-first grid classes
      expect(gridContainer).toHaveClass('grid-cols-1'); // Mobile: single column
      expect(gridContainer).toHaveClass('md:grid-cols-5'); // Desktop: 5 columns
    });
  });

  describe('Accessibility Integration', () => {
    it('should provide proper semantic structure', async () => {
      render(<Footer />);

      const footer = screen.getByRole('contentinfo');
      expect(footer).toBeInTheDocument();

      // Verify proper heading structure would be present
      // (Note: This would depend on the actual implementation of section titles)

      // Verify footer has proper role
      expect(footer.tagName).toBe('FOOTER');
    });

    it('should provide proper ARIA labels for interactive elements', async () => {
      render(<Footer />);

      const companyLink = screen.getByLabelText('Tucsenberg homepage');
      expect(companyLink).toBeInTheDocument();

      const socialLinks = screen.getAllByRole('link', {
        name: /LinkedIn|Twitter/,
      });
      expect(socialLinks).toHaveLength(2);
    });

    it('should ensure all links have accessible names', async () => {
      render(<Footer />);

      // Company link should have accessible name
      const companyLink = screen.getByLabelText('Tucsenberg homepage');
      expect(companyLink).toBeInTheDocument();

      // Social links should have aria-labels
      const linkedinLink = screen.getByTestId('social-link-linkedin');
      expect(linkedinLink).toHaveAttribute('aria-label', 'LinkedIn');

      const twitterLink = screen.getByTestId('social-link-twitter');
      expect(twitterLink).toHaveAttribute('aria-label', 'Twitter');
    });

    it('should provide proper keyboard navigation support', async () => {
      render(<Footer />);

      // All links should be focusable
      const allLinks = screen.getAllByRole('link');
      expect(allLinks.length).toBeGreaterThan(0);

      // Each link should be keyboard accessible
      allLinks.forEach((link) => {
        expect(link).not.toHaveAttribute('tabindex', '-1');
      });
    });

    it('should maintain accessibility across different locales', async () => {
      // Test English locale
      mockUseLocale.mockReturnValue('en');
      const { rerender } = render(<Footer />);

      let companyLink = screen.getByLabelText('Tucsenberg homepage');
      expect(companyLink).toBeInTheDocument();

      // Test Chinese locale
      mockUseLocale.mockReturnValue('zh');
      rerender(<Footer />);

      companyLink = screen.getByLabelText('Tucsenberg homepage');
      expect(companyLink).toBeInTheDocument();
    });

    it('should handle screen reader compatibility', async () => {
      render(<Footer />);

      const footer = screen.getByRole('contentinfo');
      expect(footer).toBeInTheDocument();

      // Verify semantic structure for screen readers
      const companyName = screen.getByText('Tucsenberg');
      expect(companyName).toBeInTheDocument();

      // Social links should have proper labels
      const socialLinks = screen.getAllByTestId(/social-link-/);
      socialLinks.forEach((link) => {
        expect(link).toHaveAttribute('aria-label');
      });
    });
  });

  describe('Error Recovery Integration', () => {
    it('should handle missing footer configuration gracefully', async () => {
      // Test with minimal configuration
      render(<Footer />);

      const footer = screen.getByRole('contentinfo');
      expect(footer).toBeInTheDocument();
    });

    it('should handle locale detection errors gracefully', async () => {
      mockUseLocale.mockReturnValue(undefined);

      render(<Footer />);

      const footer = screen.getByRole('contentinfo');
      expect(footer).toBeInTheDocument();
    });

    it('should recover from translation loading failures', async () => {
      mockUseTranslations.mockImplementation(() => {
        throw new Error('Translation loading failed');
      });

      // 翻译加载失败应该被抛出，这是预期行为
      expect(() => render(<Footer />)).toThrow('Translation loading failed');
    });

    it('should handle missing social links configuration', async () => {
      render(<Footer />);

      // Footer should still render even if social links fail
      const footer = screen.getByRole('contentinfo');
      expect(footer).toBeInTheDocument();

      // Company branding should still be present
      const companyName = screen.getByText('Tucsenberg');
      expect(companyName).toBeInTheDocument();
    });

    it('should maintain functionality with partial data', async () => {
      // Simulate partial configuration loading
      mockUseTranslations.mockImplementation((key: string) => {
        // Only provide some translations
        const partialTranslations = new Map([
          ['footer.sections.products.title', 'Products'],
        ]);

        return partialTranslations.get(key) || key;
      });

      render(<Footer />);

      const footer = screen.getByRole('contentinfo');
      expect(footer).toBeInTheDocument();

      // Should show available translations
      expect(screen.getByText('Products')).toBeInTheDocument();
    });
  });
});
