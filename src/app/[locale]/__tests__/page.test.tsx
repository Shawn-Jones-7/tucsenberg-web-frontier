import React from 'react';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Home, { generateStaticParams } from '../page';

// Mock dependencies using vi.hoisted
const {
  mockLoadCriticalMessages,
  mockExtractHeroMessages,
  mockHeroSectionStatic,
  mockBelowTheFoldClient,
} = vi.hoisted(() => ({
  mockLoadCriticalMessages: vi.fn(),
  mockExtractHeroMessages: vi.fn(),
  mockHeroSectionStatic: vi.fn(),
  mockBelowTheFoldClient: vi.fn(),
}));

vi.mock('@/lib/load-messages', () => ({
  loadCriticalMessages: mockLoadCriticalMessages,
}));

vi.mock('@/lib/i18n/extract-hero-messages', () => ({
  extractHeroMessages: mockExtractHeroMessages,
}));

vi.mock('@/i18n/routing', () => ({
  routing: {
    locales: ['en', 'zh'],
    defaultLocale: 'en',
  },
}));

vi.mock('@/components/home/hero-section', () => ({
  HeroSectionStatic: mockHeroSectionStatic,
}));

vi.mock('@/components/home/below-the-fold.client', () => ({
  BelowTheFoldClient: mockBelowTheFoldClient,
}));

describe('Home Page', () => {
  const mockHeroMessages = {
    title: 'Welcome',
    subtitle: 'Build better products',
    cta: 'Get Started',
  };

  const mockCriticalMessages = {
    home: {
      hero: mockHeroMessages,
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();

    mockLoadCriticalMessages.mockResolvedValue(mockCriticalMessages);
    mockExtractHeroMessages.mockReturnValue(mockHeroMessages);

    mockHeroSectionStatic.mockImplementation(
      ({ messages }: { messages: Record<string, unknown> }) => (
        <div
          data-testid='hero-section'
          data-messages={JSON.stringify(messages)}
        >
          Hero Section
        </div>
      ),
    );

    mockBelowTheFoldClient.mockImplementation(() => (
      <div data-testid='below-the-fold'>Below The Fold</div>
    ));
  });

  describe('generateStaticParams', () => {
    it('should return params for all locales', () => {
      const params = generateStaticParams();

      expect(params).toEqual([{ locale: 'en' }, { locale: 'zh' }]);
    });
  });

  describe('Home Component', () => {
    it('should render the page with hero section', async () => {
      const HomeComponent = await Home({
        params: Promise.resolve({ locale: 'en' }),
      });

      render(HomeComponent);

      expect(screen.getByTestId('hero-section')).toBeInTheDocument();
    });

    it('should render below-the-fold section', async () => {
      const HomeComponent = await Home({
        params: Promise.resolve({ locale: 'en' }),
      });

      render(HomeComponent);

      expect(screen.getByTestId('below-the-fold')).toBeInTheDocument();
    });

    it('should pass hero messages to HeroSectionStatic', async () => {
      const HomeComponent = await Home({
        params: Promise.resolve({ locale: 'en' }),
      });

      render(HomeComponent);

      const heroSection = screen.getByTestId('hero-section');
      expect(heroSection).toHaveAttribute(
        'data-messages',
        JSON.stringify(mockHeroMessages),
      );
    });

    it('should call loadCriticalMessages with locale', async () => {
      await Home({ params: Promise.resolve({ locale: 'zh' }) });

      expect(mockLoadCriticalMessages).toHaveBeenCalledWith('zh');
    });

    it('should call extractHeroMessages with critical messages', async () => {
      await Home({ params: Promise.resolve({ locale: 'en' }) });

      expect(mockExtractHeroMessages).toHaveBeenCalledWith(
        mockCriticalMessages,
      );
    });

    it('should have correct container classes', async () => {
      const HomeComponent = await Home({
        params: Promise.resolve({ locale: 'en' }),
      });

      const { container } = render(HomeComponent);

      const mainDiv = container.firstChild as HTMLElement;
      expect(mainDiv).toHaveClass(
        'min-h-screen',
        'bg-background',
        'text-foreground',
      );
    });

    it('should not set fast-lcp-zh attribute for English locale', async () => {
      const HomeComponent = await Home({
        params: Promise.resolve({ locale: 'en' }),
      });

      const { container } = render(HomeComponent);

      const mainDiv = container.firstChild as HTMLElement;
      expect(mainDiv).not.toHaveAttribute('data-fast-lcp-zh');
    });

    describe('Fast LCP ZH experiment', () => {
      const originalEnv = process.env.NEXT_PUBLIC_FAST_LCP_ZH;

      afterEach(() => {
        if (originalEnv !== undefined) {
          process.env.NEXT_PUBLIC_FAST_LCP_ZH = originalEnv;
        } else {
          delete process.env.NEXT_PUBLIC_FAST_LCP_ZH;
        }
      });

      it('should set fast-lcp-zh attribute for zh locale when experiment is enabled', async () => {
        process.env.NEXT_PUBLIC_FAST_LCP_ZH = '1';

        const HomeComponent = await Home({
          params: Promise.resolve({ locale: 'zh' }),
        });

        const { container } = render(HomeComponent);

        const mainDiv = container.firstChild as HTMLElement;
        expect(mainDiv).toHaveAttribute('data-fast-lcp-zh', '1');
      });

      it('should not set fast-lcp-zh attribute for en locale even with experiment enabled', async () => {
        process.env.NEXT_PUBLIC_FAST_LCP_ZH = '1';

        const HomeComponent = await Home({
          params: Promise.resolve({ locale: 'en' }),
        });

        const { container } = render(HomeComponent);

        const mainDiv = container.firstChild as HTMLElement;
        expect(mainDiv).not.toHaveAttribute('data-fast-lcp-zh');
      });

      it('should not set fast-lcp-zh attribute when experiment is disabled', async () => {
        process.env.NEXT_PUBLIC_FAST_LCP_ZH = '0';

        const HomeComponent = await Home({
          params: Promise.resolve({ locale: 'zh' }),
        });

        const { container } = render(HomeComponent);

        const mainDiv = container.firstChild as HTMLElement;
        expect(mainDiv).not.toHaveAttribute('data-fast-lcp-zh');
      });
    });

    describe('async behavior', () => {
      it('should be an async server component', async () => {
        const result = Home({ params: Promise.resolve({ locale: 'en' }) });

        expect(result).toBeInstanceOf(Promise);
      });

      it('should handle delayed params resolution', async () => {
        const delayedParams = new Promise<{ locale: 'en' | 'zh' }>((resolve) =>
          setTimeout(() => resolve({ locale: 'en' }), 10),
        );

        const HomeComponent = await Home({ params: delayedParams });

        expect(HomeComponent).toBeDefined();
      });
    });

    describe('error handling', () => {
      it('should propagate loadCriticalMessages errors', async () => {
        mockLoadCriticalMessages.mockRejectedValue(
          new Error('Failed to load messages'),
        );

        await expect(
          Home({ params: Promise.resolve({ locale: 'en' }) }),
        ).rejects.toThrow('Failed to load messages');
      });

      it('should propagate params rejection', async () => {
        const rejectedParams = Promise.reject(new Error('Params error'));

        await expect(Home({ params: rejectedParams })).rejects.toThrow(
          'Params error',
        );
      });
    });
  });
});
