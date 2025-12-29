import React from 'react';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import AboutPage, { generateMetadata, generateStaticParams } from '../page';

// Mock dependencies using vi.hoisted
const { mockGetTranslations, mockSetRequestLocale } = vi.hoisted(() => ({
  mockGetTranslations: vi.fn(),
  mockSetRequestLocale: vi.fn(),
}));

vi.mock('next-intl/server', () => ({
  getTranslations: mockGetTranslations,
  setRequestLocale: mockSetRequestLocale,
}));

vi.mock('@/app/[locale]/generate-static-params', () => ({
  generateLocaleStaticParams: () => [{ locale: 'en' }, { locale: 'zh' }],
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  ArrowRight: ({ className }: { className?: string }) => (
    <svg
      data-testid='arrow-right'
      className={className}
    />
  ),
  Award: ({ className }: { className?: string }) => (
    <svg
      data-testid='award-icon'
      className={className}
    />
  ),
  HeadphonesIcon: ({ className }: { className?: string }) => (
    <svg
      data-testid='headphones-icon'
      className={className}
    />
  ),
  Lightbulb: ({ className }: { className?: string }) => (
    <svg
      data-testid='lightbulb-icon'
      className={className}
    />
  ),
  ShieldCheck: ({ className }: { className?: string }) => (
    <svg
      data-testid='shield-icon'
      className={className}
    />
  ),
}));

// Mock UI components
vi.mock('@/components/ui/button', () => ({
  Button: ({
    children,
    asChild: _asChild,
    ...props
  }: React.PropsWithChildren<{
    asChild?: boolean;
    [key: string]: unknown;
  }>) => (
    <button
      data-testid='button'
      {...props}
    >
      {children}
    </button>
  ),
}));

vi.mock('@/components/ui/card', () => ({
  Card: ({
    children,
    className,
  }: React.PropsWithChildren<{ className?: string }>) => (
    <div
      data-testid='card'
      className={className}
    >
      {children}
    </div>
  ),
  CardContent: ({ children }: React.PropsWithChildren) => (
    <div data-testid='card-content'>{children}</div>
  ),
  CardDescription: ({
    children,
    className,
  }: React.PropsWithChildren<{ className?: string }>) => (
    <p
      data-testid='card-description'
      className={className}
    >
      {children}
    </p>
  ),
  CardHeader: ({ children }: React.PropsWithChildren) => (
    <div data-testid='card-header'>{children}</div>
  ),
  CardTitle: ({
    children,
    className,
  }: React.PropsWithChildren<{ className?: string }>) => (
    <h3
      data-testid='card-title'
      className={className}
    >
      {children}
    </h3>
  ),
}));

describe('AboutPage', () => {
  const mockTranslations = {
    'pageTitle': 'About Us',
    'pageDescription': 'Learn more about our company',
    'hero.title': 'Our Story',
    'hero.subtitle': 'Building the Future',
    'hero.description': 'We are a company dedicated to innovation',
    'mission.title': 'Our Mission',
    'mission.content': 'To provide excellent products and services',
    'values.title': 'Our Values',
    'values.quality.title': 'Quality',
    'values.quality.description': 'We strive for excellence',
    'values.innovation.title': 'Innovation',
    'values.innovation.description': 'We embrace new ideas',
    'values.service.title': 'Service',
    'values.service.description': 'We put customers first',
    'values.integrity.title': 'Integrity',
    'values.integrity.description': 'We act with honesty',
    'stats.yearsExperience': 'Years Experience',
    'stats.countriesServed': 'Countries Served',
    'stats.happyClients': 'Happy Clients',
    'stats.productsDelivered': 'Products Delivered',
    'cta.title': 'Ready to Get Started?',
    'cta.description': 'Contact us today to learn more',
    'cta.button': 'Contact Us',
  } as const;

  const mockParams = { locale: 'en' };

  beforeEach(() => {
    vi.clearAllMocks();

    mockGetTranslations.mockResolvedValue(
      (key: string) =>
        mockTranslations[key as keyof typeof mockTranslations] || key,
    );
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
        title: 'About Us',
        description: 'Learn more about our company',
      });
    });

    it('should call getTranslations with correct namespace', async () => {
      await generateMetadata({ params: Promise.resolve(mockParams) });

      expect(mockGetTranslations).toHaveBeenCalledWith({
        locale: 'en',
        namespace: 'about',
      });
    });

    it('should handle different locales', async () => {
      await generateMetadata({ params: Promise.resolve({ locale: 'zh' }) });

      expect(mockGetTranslations).toHaveBeenCalledWith({
        locale: 'zh',
        namespace: 'about',
      });
    });
  });

  describe('AboutPage component', () => {
    it('should render hero section', async () => {
      const AboutPageComponent = await AboutPage({
        params: Promise.resolve(mockParams),
      });

      render(AboutPageComponent);

      expect(screen.getByText('Our Story')).toBeInTheDocument();
      expect(screen.getByText('Building the Future')).toBeInTheDocument();
      expect(
        screen.getByText('We are a company dedicated to innovation'),
      ).toBeInTheDocument();
    });

    it('should render mission section', async () => {
      const AboutPageComponent = await AboutPage({
        params: Promise.resolve(mockParams),
      });

      render(AboutPageComponent);

      expect(screen.getByText('Our Mission')).toBeInTheDocument();
      expect(
        screen.getByText('To provide excellent products and services'),
      ).toBeInTheDocument();
    });

    it('should render values section with all value cards', async () => {
      const AboutPageComponent = await AboutPage({
        params: Promise.resolve(mockParams),
      });

      render(AboutPageComponent);

      expect(screen.getByText('Our Values')).toBeInTheDocument();
      expect(screen.getByText('Quality')).toBeInTheDocument();
      expect(screen.getByText('Innovation')).toBeInTheDocument();
      expect(screen.getByText('Service')).toBeInTheDocument();
      expect(screen.getByText('Integrity')).toBeInTheDocument();
    });

    it('should render stats section', async () => {
      const AboutPageComponent = await AboutPage({
        params: Promise.resolve(mockParams),
      });

      render(AboutPageComponent);

      expect(screen.getByText('Years Experience')).toBeInTheDocument();
      expect(screen.getByText('Countries Served')).toBeInTheDocument();
      expect(screen.getByText('Happy Clients')).toBeInTheDocument();
      expect(screen.getByText('Products Delivered')).toBeInTheDocument();
      expect(screen.getByText('15+')).toBeInTheDocument();
      expect(screen.getByText('50+')).toBeInTheDocument();
      expect(screen.getByText('1000+')).toBeInTheDocument();
      expect(screen.getByText('10M+')).toBeInTheDocument();
    });

    it('should render CTA section with contact button', async () => {
      const AboutPageComponent = await AboutPage({
        params: Promise.resolve(mockParams),
      });

      render(AboutPageComponent);

      expect(screen.getByText('Ready to Get Started?')).toBeInTheDocument();
      expect(
        screen.getByText('Contact us today to learn more'),
      ).toBeInTheDocument();
      expect(screen.getByText('Contact Us')).toBeInTheDocument();
    });

    it('should call setRequestLocale with locale', async () => {
      await AboutPage({ params: Promise.resolve(mockParams) });

      expect(mockSetRequestLocale).toHaveBeenCalledWith('en');
    });

    it('should handle zh locale', async () => {
      await AboutPage({ params: Promise.resolve({ locale: 'zh' }) });

      expect(mockSetRequestLocale).toHaveBeenCalledWith('zh');
      expect(mockGetTranslations).toHaveBeenCalledWith({
        locale: 'zh',
        namespace: 'about',
      });
    });

    it('should render main element', async () => {
      const AboutPageComponent = await AboutPage({
        params: Promise.resolve(mockParams),
      });

      render(AboutPageComponent);

      expect(screen.getByRole('main')).toBeInTheDocument();
    });

    it('should render h1 heading', async () => {
      const AboutPageComponent = await AboutPage({
        params: Promise.resolve(mockParams),
      });

      render(AboutPageComponent);

      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
        'Our Story',
      );
    });

    it('should render h2 headings for sections', async () => {
      const AboutPageComponent = await AboutPage({
        params: Promise.resolve(mockParams),
      });

      render(AboutPageComponent);

      const h2Headings = screen.getAllByRole('heading', { level: 2 });
      // Mission, Values, CTA sections have h2 headings
      expect(h2Headings.length).toBeGreaterThanOrEqual(3);
    });

    it('should render value cards', async () => {
      const AboutPageComponent = await AboutPage({
        params: Promise.resolve(mockParams),
      });

      render(AboutPageComponent);

      const cards = screen.getAllByTestId('card');
      expect(cards.length).toBe(4);
    });

    describe('async behavior', () => {
      it('should be an async server component', async () => {
        const result = AboutPage({ params: Promise.resolve(mockParams) });

        expect(result).toBeInstanceOf(Promise);
      });

      it('should handle delayed params resolution', async () => {
        const delayedParams = new Promise<{ locale: string }>((resolve) =>
          setTimeout(() => resolve(mockParams), 10),
        );

        const AboutPageComponent = await AboutPage({ params: delayedParams });

        expect(AboutPageComponent).toBeDefined();
      });
    });

    describe('error handling', () => {
      it('should propagate getTranslations errors', async () => {
        mockGetTranslations.mockRejectedValue(new Error('Translation error'));

        await expect(
          AboutPage({ params: Promise.resolve(mockParams) }),
        ).rejects.toThrow('Translation error');
      });

      it('should propagate params rejection', async () => {
        const rejectedParams = Promise.reject(new Error('Params error'));

        await expect(AboutPage({ params: rejectedParams })).rejects.toThrow(
          'Params error',
        );
      });
    });

    describe('CTA link', () => {
      it('should have correct contact link for en locale', async () => {
        const AboutPageComponent = await AboutPage({
          params: Promise.resolve(mockParams),
        });

        render(AboutPageComponent);

        const contactLink = screen.getByRole('link', { name: /contact us/i });
        expect(contactLink).toHaveAttribute('href', '/en/contact');
      });

      it('should have correct contact link for zh locale', async () => {
        const AboutPageComponent = await AboutPage({
          params: Promise.resolve({ locale: 'zh' }),
        });

        render(AboutPageComponent);

        const contactLink = screen.getByRole('link', { name: /contact us/i });
        expect(contactLink).toHaveAttribute('href', '/zh/contact');
      });
    });
  });
});
