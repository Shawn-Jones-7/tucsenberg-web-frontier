import React from 'react';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { LocaleParam } from '@/app/[locale]/generate-static-params';
import TermsPage, { generateMetadata, generateStaticParams } from '../page';

// Mock dependencies using vi.hoisted
const {
  mockGetTranslations,
  mockSetRequestLocale,
  mockGetPageBySlug,
  mockRenderLegalContent,
  mockSlugifyHeading,
  mockGenerateJSONLD,
} = vi.hoisted(() => ({
  mockGetTranslations: vi.fn(),
  mockSetRequestLocale: vi.fn(),
  mockGetPageBySlug: vi.fn(),
  mockRenderLegalContent: vi.fn(),
  mockSlugifyHeading: vi.fn(),
  mockGenerateJSONLD: vi.fn(),
}));

vi.mock('next-intl/server', () => ({
  getTranslations: mockGetTranslations,
  setRequestLocale: mockSetRequestLocale,
}));

vi.mock('@/app/[locale]/generate-static-params', () => ({
  generateLocaleStaticParams: () => [{ locale: 'en' }, { locale: 'zh' }],
}));

vi.mock('@/lib/content', () => ({
  getPageBySlug: mockGetPageBySlug,
}));

vi.mock('@/lib/content/render-legal-content', () => ({
  renderLegalContent: mockRenderLegalContent,
  slugifyHeading: mockSlugifyHeading,
}));

vi.mock('@/lib/structured-data', () => ({
  generateJSONLD: mockGenerateJSONLD,
}));

describe('TermsPage', () => {
  const mockTranslations = {
    'pageTitle': 'Terms of Service',
    'pageDescription': 'Please read our terms carefully',
    'effectiveDate': 'Effective Date',
    'lastUpdated': 'Last Updated',
    'tableOfContents': 'Table of Contents',
    'sections.introduction': 'Introduction',
    'sections.acceptance': 'Acceptance of Terms',
    'sections.services': 'Our Services',
    'sections.orders': 'Orders',
    'sections.payment': 'Payment',
    'sections.shipping': 'Shipping',
    'sections.warranty': 'Warranty',
    'sections.liability': 'Liability',
    'sections.ip': 'Intellectual Property',
    'sections.confidentiality': 'Confidentiality',
    'sections.termination': 'Termination',
    'sections.governing': 'Governing Law',
    'sections.disputes': 'Disputes',
    'sections.contact': 'Contact',
  } as const;

  const mockPageContent = {
    content: `## Introduction

Welcome to our terms of service.

## Acceptance of Terms

By using our services, you agree to these terms.

## Our Services

We provide quality products.`,
    metadata: {
      publishedAt: '2024-01-01',
      updatedAt: '2024-06-01',
      lastReviewed: '2024-05-15',
    },
  };

  const mockParams = { locale: 'en' } as const satisfies LocaleParam;

  beforeEach(() => {
    vi.clearAllMocks();

    mockGetTranslations.mockResolvedValue(
      (key: string) =>
        mockTranslations[key as keyof typeof mockTranslations] || key,
    );
    mockGetPageBySlug.mockReturnValue(mockPageContent);
    mockRenderLegalContent.mockReturnValue(
      <div data-testid='legal-content'>Rendered Legal Content</div>,
    );
    mockSlugifyHeading.mockImplementation((text: string) =>
      text.toLowerCase().replace(/\s+/g, '-'),
    );
    mockGenerateJSONLD.mockReturnValue('{"@context":"https://schema.org"}');
  });

  describe('generateStaticParams', () => {
    it('should return params for all locales', () => {
      const params = generateStaticParams();

      expect(params).toEqual([{ locale: 'en' }, { locale: 'zh' }]);
    });
  });

  describe('generateMetadata', () => {
    it('should return correct metadata', async () => {
      const metadata = await generateMetadata({
        params: Promise.resolve(mockParams),
      });

      expect(metadata).toMatchObject({
        title: 'Terms of Service',
        description: 'Please read our terms carefully',
      });
    });

    it('should call getTranslations with correct namespace', async () => {
      await generateMetadata({ params: Promise.resolve(mockParams) });

      expect(mockGetTranslations).toHaveBeenCalledWith({
        locale: 'en',
        namespace: 'terms',
      });
    });

    it('should handle different locales', async () => {
      await generateMetadata({
        params: Promise.resolve({
          locale: 'zh',
        } as const satisfies LocaleParam),
      });

      expect(mockGetTranslations).toHaveBeenCalledWith({
        locale: 'zh',
        namespace: 'terms',
      });
    });
  });

  describe('TermsPage component', () => {
    it('should render page title', async () => {
      const TermsPageComponent = await TermsPage({
        params: Promise.resolve(mockParams),
      });

      render(TermsPageComponent);

      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
        'Terms of Service',
      );
    });

    it('should render page description', async () => {
      const TermsPageComponent = await TermsPage({
        params: Promise.resolve(mockParams),
      });

      render(TermsPageComponent);

      expect(
        screen.getByText('Please read our terms carefully'),
      ).toBeInTheDocument();
    });

    it('should render effective date', async () => {
      const TermsPageComponent = await TermsPage({
        params: Promise.resolve(mockParams),
      });

      render(TermsPageComponent);

      expect(screen.getByText('Effective Date:')).toBeInTheDocument();
      expect(screen.getByText('2024-01-01')).toBeInTheDocument();
    });

    it('should render last updated date', async () => {
      const TermsPageComponent = await TermsPage({
        params: Promise.resolve(mockParams),
      });

      render(TermsPageComponent);

      expect(screen.getByText('Last Updated:')).toBeInTheDocument();
      expect(screen.getByText('2024-06-01')).toBeInTheDocument();
    });

    it('should render legal content', async () => {
      const TermsPageComponent = await TermsPage({
        params: Promise.resolve(mockParams),
      });

      render(TermsPageComponent);

      expect(screen.getByTestId('legal-content')).toBeInTheDocument();
    });

    it('should call renderLegalContent with page content', async () => {
      await TermsPage({ params: Promise.resolve(mockParams) });

      expect(mockRenderLegalContent).toHaveBeenCalledWith(
        mockPageContent.content,
      );
    });

    it('should render table of contents', async () => {
      const TermsPageComponent = await TermsPage({
        params: Promise.resolve(mockParams),
      });

      render(TermsPageComponent);

      expect(screen.getByText('Table of Contents')).toBeInTheDocument();
    });

    it('should render TOC navigation items', async () => {
      const TermsPageComponent = await TermsPage({
        params: Promise.resolve(mockParams),
      });

      render(TermsPageComponent);

      expect(screen.getByText('Introduction')).toBeInTheDocument();
      expect(screen.getByText('Acceptance of Terms')).toBeInTheDocument();
    });

    it('should call setRequestLocale with locale', async () => {
      await TermsPage({ params: Promise.resolve(mockParams) });

      expect(mockSetRequestLocale).toHaveBeenCalledWith('en');
    });

    it('should call getPageBySlug with terms slug and locale', async () => {
      await TermsPage({ params: Promise.resolve(mockParams) });

      expect(mockGetPageBySlug).toHaveBeenCalledWith('terms', 'en');
    });

    it('should render JSON-LD script', async () => {
      const TermsPageComponent = await TermsPage({
        params: Promise.resolve(mockParams),
      });

      render(TermsPageComponent);

      const script = document.querySelector(
        'script[type="application/ld+json"]',
      );
      expect(script).toBeInTheDocument();
    });

    it('should call generateJSONLD with correct schema', async () => {
      const pageElement = await TermsPage({
        params: Promise.resolve(mockParams),
      });
      render(pageElement);

      expect(mockGenerateJSONLD).toHaveBeenCalledWith(
        expect.objectContaining({
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          'inLanguage': 'en',
          'name': 'Terms of Service',
          'description': 'Please read our terms carefully',
          'datePublished': '2024-01-01',
          'dateModified': '2024-06-01',
        }),
      );
    });

    it('should use lastReviewed when updatedAt is not available', async () => {
      mockGetPageBySlug.mockReturnValue({
        ...mockPageContent,
        metadata: {
          publishedAt: '2024-01-01',
          lastReviewed: '2024-05-15',
        },
      });

      const pageElement = await TermsPage({
        params: Promise.resolve(mockParams),
      });
      render(pageElement);

      expect(mockGenerateJSONLD).toHaveBeenCalledWith(
        expect.objectContaining({
          dateModified: '2024-05-15',
        }),
      );
    });

    it('should use publishedAt when neither updatedAt nor lastReviewed available', async () => {
      mockGetPageBySlug.mockReturnValue({
        ...mockPageContent,
        metadata: {
          publishedAt: '2024-01-01',
        },
      });

      const pageElement = await TermsPage({
        params: Promise.resolve(mockParams),
      });
      render(pageElement);

      expect(mockGenerateJSONLD).toHaveBeenCalledWith(
        expect.objectContaining({
          dateModified: '2024-01-01',
        }),
      );
    });

    it('should render main element with correct classes', async () => {
      const TermsPageComponent = await TermsPage({
        params: Promise.resolve(mockParams),
      });

      render(TermsPageComponent);

      const main = screen.getByRole('main');
      expect(main).toHaveClass('container', 'mx-auto', 'px-4', 'py-8');
    });

    describe('TOC items', () => {
      it('should generate TOC items from section keys', async () => {
        const TermsPageComponent = await TermsPage({
          params: Promise.resolve(mockParams),
        });

        render(TermsPageComponent);

        const nav = screen.getByRole('navigation', {
          name: 'Table of Contents',
        });
        expect(nav).toBeInTheDocument();
      });

      it('should create links with correct href attributes', async () => {
        const TermsPageComponent = await TermsPage({
          params: Promise.resolve(mockParams),
        });

        render(TermsPageComponent);

        const links = screen.getAllByRole('link');
        expect(links.length).toBeGreaterThan(0);
        expect(links[0]).toHaveAttribute('href', expect.stringMatching(/^#/));
      });
    });

    describe('dates display', () => {
      it('should not render effective date when not available', async () => {
        mockGetPageBySlug.mockReturnValue({
          ...mockPageContent,
          metadata: {},
        });

        const TermsPageComponent = await TermsPage({
          params: Promise.resolve(mockParams),
        });

        render(TermsPageComponent);

        expect(screen.queryByText('Effective Date:')).not.toBeInTheDocument();
      });

      it('should not render last updated when not available', async () => {
        mockGetPageBySlug.mockReturnValue({
          ...mockPageContent,
          metadata: {
            publishedAt: '2024-01-01',
          },
        });

        const TermsPageComponent = await TermsPage({
          params: Promise.resolve(mockParams),
        });

        render(TermsPageComponent);

        expect(screen.queryByText('Last Updated:')).not.toBeInTheDocument();
      });
    });

    describe('async behavior', () => {
      it('should be an async server component', async () => {
        const result = TermsPage({ params: Promise.resolve(mockParams) });

        expect(result).toBeInstanceOf(Promise);
      });

      it('should handle delayed params resolution', async () => {
        const delayedParams = new Promise<LocaleParam>((resolve) =>
          setTimeout(() => resolve(mockParams), 10),
        );

        const TermsPageComponent = await TermsPage({ params: delayedParams });

        expect(TermsPageComponent).toBeDefined();
      });
    });

    describe('error handling', () => {
      it('should propagate getTranslations errors', async () => {
        mockGetTranslations.mockRejectedValue(new Error('Translation error'));

        await expect(
          TermsPage({ params: Promise.resolve(mockParams) }),
        ).rejects.toThrow('Translation error');
      });

      it('should propagate getPageBySlug errors', async () => {
        mockGetPageBySlug.mockImplementation(() => {
          throw new Error('Page not found');
        });

        await expect(
          TermsPage({ params: Promise.resolve(mockParams) }),
        ).rejects.toThrow('Page not found');
      });

      it('should propagate params rejection', async () => {
        const rejectedParams = Promise.reject(new Error('Params error'));

        await expect(TermsPage({ params: rejectedParams })).rejects.toThrow(
          'Params error',
        );
      });
    });

    describe('i18n integration', () => {
      it('should handle zh locale correctly', async () => {
        await TermsPage({
          params: Promise.resolve({
            locale: 'zh',
          } as const satisfies LocaleParam),
        });

        expect(mockSetRequestLocale).toHaveBeenCalledWith('zh');
        expect(mockGetTranslations).toHaveBeenCalledWith({
          locale: 'zh',
          namespace: 'terms',
        });
        expect(mockGetPageBySlug).toHaveBeenCalledWith('terms', 'zh');
      });
    });

    describe('grid layout', () => {
      it('should render with responsive grid layout', async () => {
        const TermsPageComponent = await TermsPage({
          params: Promise.resolve(mockParams),
        });

        const { container } = render(TermsPageComponent);

        const gridContainer = container.querySelector('.grid');
        expect(gridContainer).toHaveClass('gap-10');
      });
    });
  });
});
